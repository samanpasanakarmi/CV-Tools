import { SECTIONS, blankCv, normalizeCv, createItem, moveItem, escapeHtml as esc, cvAsText, isIsoDate, displayDate, validateExperience, safePhoto, TEMPLATES, PHOTO_TEMPLATES } from './model.js';
import { renderResume } from './preview.js';
import { newVariant, normalizeVariant, composeCv, toggleSelection } from './workspace.js';
import { CloudApi } from './api.js';
import { CLOUD_CONFIG } from './config.js';
import { appRedirectUrl, safeErrorMessage } from './auth-flow.js';
import { makeReviewedAiVariant } from './ai.js';

const el = (id) => document.getElementById(id);
let api = new CloudApi(CLOUD_CONFIG);
let master = blankCv();
let variants = [];
let active = null;
let screen = 'dashboard';
let dirtyMaster = false, dirtyCv = false, busy = false;
let savedMaster = blankCv();
let authMode = 'login';
let aiDraft = null;
let aiRequest = {targetRole:'Customer Service Representative',company:'',jobDescription:'',template:'modern'};
let aiReview = {title:'',headline:'',summary:'',included:{}};
const keys = [ ['name','Full name'], ['email','Email'],['phone','Phone number'],['address','Address (optional)'],['location','City / country'],['website','LinkedIn / portfolio'],['headline','Default professional title'],['summary','Default professional summary',true] ];
const field = (name,label,value,attrs={},multi=false) => {
  const props=Object.entries(attrs).map(([k,v])=>`data-${k}="${esc(v)}"`).join(' ');
  const safe=esc(value??'');
  return `<label class="field"><span>${esc(label)}</span>${multi?`<textarea ${props} rows="3" placeholder="${esc(label)}">${safe}</textarea>`:`<input ${props} type="text" value="${safe}" placeholder="${esc(label)}" maxlength="500">`}</label>`;
};
function show(id) {for(const section of ['setup-screen','auth-screen','recover-screen','reset-screen','workspace'])el(section).hidden=(section!==id);}
function notice(message,error=false) {const n=el('save-status');n.textContent=message;n.classList.toggle('error',error);}
function errString(error){return safeErrorMessage(error);}
function setBusy(value){busy=value;document.querySelectorAll('button').forEach(b=>{if(b.dataset.busyControl==='1')b.disabled=value;});}

function experienceField(item,key,label){
  const date=item[key]||'';
  const isPresent=key==='end' && date==='Present';
  const good=isIsoDate(date);
  const props=`data-kind="item" data-section="experience" data-id="${esc(item.id)}" data-key="${key}"`;
  const note=date && !good && !isPresent ? `<small class="legacy-warning">Previously saved: ${esc(date)}. Choose an exact date to replace it.</small>` : '';
  return `<label class="field"><span>${esc(label)}</span><input type="date" ${props} value="${good?esc(date):''}" ${isPresent?'disabled':''} aria-label="${esc(label)}"/><small class="field-help">CV displays DD/MM/YYYY</small>${note}</label>`;
}
async function preparePhoto(file){
  if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw new Error('Choose a PNG, JPEG or WebP photo.');
  if(file.size>4000000)throw new Error('Image exceeds 4 MB. Choose a smaller picture.');
  const url=URL.createObjectURL(file);
  try{
    const image=new Image();image.decoding='async';image.src=url;
    await image.decode();
    if(image.width<1||image.height<1)throw new Error('Unable to read this photo.');
    const canvas=document.createElement('canvas');canvas.width=360;canvas.height=360;
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Photo editing is not available in this browser.');
    const side=Math.min(image.width,image.height);
    ctx.drawImage(image,(image.width-side)/2,(image.height-side)/2,side,side,0,0,360,360);
    const data=canvas.toDataURL('image/jpeg',0.75);
    if(!safePhoto(data))throw new Error('Photo is too large after processing.');
    return data;
  } finally{URL.revokeObjectURL(url);}
}
function renderProfile(){
  let html=`<p class="tip">This is your reusable master profile. Name, phone, address, and work history live here, not in individual CV copies.</p><div class="actions"><button data-action="save-master" data-busy-control="1" type="button" class="btn btn-primary">Save my profile</button></div><section class="form-section"><div class="form-section-header"><div><span class="step-label">01</span><h3>Personal information</h3></div></div><div class="field-grid">`;
  html+=keys.map(([key,label,multi])=>field(key,label,master.profile[key],{kind:'profile',key},multi)).join('');
  html+='</div></section>';
  html+=`<section class="form-section photo-form"><div class="form-section-header"><div><span class="step-label">02</span><h3>Optional profile photo</h3><small>Only shown in photo-enabled CV templates</small></div></div><div class="photo-settings">${safePhoto(master.profile.photo)?`<img class="photo-thumb" src="${esc(master.profile.photo)}" alt="Your uploaded profile photo">`:'<div class="photo-empty">No photo uploaded</div>'}<div><label class="field"><span>Upload PNG, JPEG or WebP (max 4 MB)</span><input type="file" data-kind="photo-file" accept="image/png,image/jpeg,image/webp"></label><p class="field-help">Photo is cropped and resized on your device. Stored in your private profile, not a public photo link.</p>${safePhoto(master.profile.photo)?'<button class="btn btn-small" data-action="remove-photo" type="button">Remove picture</button>':''}</div></div></section>`;
  let i=2;
  for(const [section,meta] of Object.entries(SECTIONS)){
    i++;
    html+=`<section class="form-section"><div class="form-section-header"><div><span class="step-label">${String(i).padStart(2,'0')}</span><h3>${esc(meta.label)}</h3><small>${master[section].length} saved entries</small></div><button data-action="add" data-section="${esc(section)}" class="btn btn-small btn-add" type="button">+ Add</button></div>`;
    if(!master[section].length)html+='<p class="empty-section">No information saved here yet.</p>';
    master[section].forEach((item,index)=>{
      const attrs=`data-section="${esc(section)}" data-id="${esc(item.id)}"`;
      html+=`<div class="entry-card"><div class="entry-card-header"><strong>${esc(meta.singular)} ${index+1}</strong><div class="icon-actions"><button data-action="up" ${attrs} ${index===0?'disabled':''} type="button" aria-label="Move up">↑</button><button data-action="down" ${attrs} ${index===master[section].length-1?'disabled':''} type="button" aria-label="Move down">↓</button><button data-action="remove" ${attrs} type="button" aria-label="Remove entry" class="remove">×</button></div></div><div class="field-grid">`;
      html+=meta.fields.map(([key,label,type])=>section==='experience' && type==='date'?experienceField(item,key,label):field(key,label,item[key],{kind:'item',section,id:item.id,key},type==='textarea')).join('');
      if(section==='experience')html+=`<label class="select-entry present-toggle"><input type="checkbox" data-kind="present" data-section="experience" data-id="${esc(item.id)}" ${item.end==='Present'?'checked':''}><span>Currently working here (Present)</span></label>`;
      html+='</div></div>';
    });
    html+='</section>';
  }
  el('profile-panel').innerHTML=html;
}
function renderDashboard(){
  const name=master.profile.name?.split(' ')[0]||'';
  let html=`<section class="simple-dashboard"><div class="eyebrow">YOUR WORKSPACE</div><div class="simple-top"><div><h3>${name?'Hello, '+esc(name):'Your CVs'}</h3><p>${variants.length?`${variants.length} saved CV${variants.length===1?'':'s'}`:'Create your first CV using your saved profile.'}</p></div><button data-action="new" class="btn btn-primary" type="button">+ Create CV</button></div><div class="simple-links"><button data-action="go-profile" type="button" class="btn btn-small">Edit profile</button><button data-action="go-cvs" type="button" class="btn btn-small">View all CVs</button></div></section>`;
  if(variants.length){
    html+='<section class="form-section"><div class="form-section-header"><h3>Recent CVs</h3></div>';
    for(const cv of variants.slice(0,3))html+=`<div class="cv-list-item"><div><strong>${esc(cv.title)}</strong><small>${esc([cv.target_role,cv.company].filter(Boolean).join(' · ')||'No target selected')}</small></div><button class="btn btn-small" data-action="open" data-id="${esc(cv.id)}" type="button">Edit CV</button></div>`;
    html+='</section>';
  }
  el('dashboard-panel').innerHTML=html;
}
function renderAi(){
  const panel=el('ai-panel');
  if(!aiDraft){
    const hasProfile=Object.keys(SECTIONS).some(k=>master[k].length)||master.profile.summary?.trim();
    panel.innerHTML=`<section class="form-section ai-form-section"><div class="eyebrow">AI SMART CV BUILDER</div><h3>Tailor your CV to a job</h3><p>AI will suggest a summary and which saved experiences and skills best match the job. It will not create facts or save anything without your approval.</p><form id="ai-generate-form">
    <label class="field"><span>Job title</span><input name="targetRole" maxlength="120" required value="${esc(aiRequest.targetRole)}" placeholder="Customer Service Representative"></label>
    <label class="field"><span>Company (optional)</span><input name="company" maxlength="120" value="${esc(aiRequest.company)}" placeholder="Employer name"></label>
    <label class="field"><span>Job description</span><textarea name="jobDescription" minlength="30" maxlength="10000" rows="8" required placeholder="Paste the actual job advert (minimum 30 characters)…">${esc(aiRequest.jobDescription)}</textarea><small class="field-help">Copy the actual requirements. Do not include private contact information.</small></label>
    <label class="field"><span>CV template</span><select name="template">${Object.entries(TEMPLATES).map(([key,label])=>`<option value="${esc(key)}" ${aiRequest.template===key?'selected':''}>${esc(label)}</option>`).join('')}</select></label>
    <label class="select-entry ai-consent"><input type="checkbox" name="consent" required><span>I agree to send the job description and relevant saved qualifications/work history to the AI provider for this request. My contact fields and photo are excluded, but free-text work details may contain personal information. I will check the draft before saving.</span></label>
    ${!hasProfile?'<p class="field-help">Add your real qualifications and experience to My Profile, then save it first.</p>':''}
    <div class="actions"><button class="btn btn-primary" type="submit" data-busy-control="1" ${!hasProfile?'disabled':''}>✦ Generate suggestions</button></div></form>
    </section>`;
    return;
  }
  let html=`<section class="form-section"><div class="eyebrow">REVIEW BEFORE SAVING</div><h3>AI-tailored CV draft</h3><p class="ai-warning">AI can make mistakes. Verify the headline, summary, and selected experience against your profile. Nothing is saved yet.</p><form id="ai-review-form">
    <label class="field"><span>CV title</span><input name="title" maxlength="120" required value="${esc(aiReview.title)}"></label>
    <label class="field"><span>Headline (editable)</span><input name="headline" maxlength="6000" value="${esc(aiReview.headline)}"></label>
    <label class="field"><span>Professional summary (editable)</span><textarea name="summary" rows="6" maxlength="6000">${esc(aiReview.summary)}</textarea></label>`;
  for(const [section,meta] of Object.entries(SECTIONS)){
    if(!master[section].length)continue;
    html+=`<fieldset class="ai-selection"><legend>${esc(meta.label)}</legend>`;
    for(const item of master[section]){
      const checked=aiReview.included[section]?.includes(item.id)?'checked':'';
      const label=meta.fields.map(([key])=>item[key]).filter(Boolean).slice(0,2).join(' — ')||'Entry';
      html+=`<label class="select-entry"><input type="checkbox" name="included-${esc(section)}" value="${esc(item.id)}" ${checked}><span>${esc(label)}</span></label>`;
    }
    html+='</fieldset>';
  }
  const list=(title,arr)=>arr.length?`<div class="ai-explanation"><h4>${title}</h4><ul>${arr.map(item=>`<li>${esc(item)}</li>`).join('')}</ul></div>`:'';
  html+=list('Relevant strengths identified',aiDraft.strengths||[]);
  html+=list('Missing or unclear requirements (do not invent these)',aiDraft.gaps||[]);
  html+=`<label class="select-entry ai-consent"><input type="checkbox" name="approved" required><span>I have checked the generated claims and selections against my real qualifications. Create this as a new CV.</span></label>
    <div class="actions"><button type="button" data-action="discard-ai" class="btn">Change job description</button><button data-busy-control="1" type="submit" class="btn btn-primary">Approve & save new CV</button></div></form></section>`;
  panel.innerHTML=html;
}
function renderAccount(){
  const email=api.session?.user?.email||'Signed in';
  let html=`<p class="tip">Manage your account and personal CV information here.</p><section class="account-section"><h3>Account information</h3><p class="account-email">${esc(email)}</p><p>You are signed in to Supabase. Sessions are kept in browser memory and a refresh requires logging in again.</p></section>`;
  {
    html+=`<section class="account-section"><h3>Change password</h3><p>Use a new password of at least 12 characters. Passwords are handled by Supabase Auth, not stored in CV Studio.</p><form id="account-password-form" class="account-form"><label class="field"><span>New password</span><input type="password" name="password" minlength="12" required autocomplete="new-password"></label><label class="field"><span>Confirm new password</span><input type="password" name="confirm" minlength="12" required autocomplete="new-password"></label><button type="submit" data-busy-control="1" class="btn btn-primary">Change password</button></form></section>`;
  }
  html+=`<section class="account-section"><h3>Export your information</h3><p>Download a backup of your reusable profile and every saved CV as a JSON file. Keep it in a private location because it contains personal information.</p><button data-action="export-account" class="btn" type="button">Download all CV data (JSON)</button></section>`;
  html+=`<section class="account-section danger-zone"><h3>Erase CV information</h3><p>This permanently removes your saved profile and all CV versions from your Supabase database. It does not delete your login account. Export a backup first if you need one.</p><button data-action="clear-account-data" data-busy-control="1" class="btn btn-danger" type="button">Erase my profile and CVs</button></section>`;
  html+=`<p class="account-note">Account deletion itself is not implemented in this student release. A customer-approved secure server-side deletion process and GDPR/privacy notice are still required before public use.</p>`;
  el('account-panel').innerHTML=html;
}
function renderVariants(){
  let html=`<p class="tip">Your personal details come from My Profile. Create a separate CV for each company and role, choosing only the experience and skills relevant to that application.</p><div class="actions"><button data-action="new" class="btn btn-primary" type="button">+ New CV</button></div>`;
  if(!variants.length)html+='<p class="empty-section">No CVs yet. Save your profile, then create your first CV.</p>';
  for(const cv of variants){
    html+=`<div class="cv-list-item"><div><strong>${esc(cv.title)}</strong><small>${esc([cv.target_role,cv.company].filter(Boolean).join(' · ')||'No target selected')}</small></div><div class="actions"><button class="btn btn-small" data-action="open" data-id="${esc(cv.id)}" type="button">Edit</button><button class="btn btn-small" data-action="duplicate" data-id="${esc(cv.id)}" type="button">Duplicate</button><button class="btn btn-small remove" data-action="delete" data-id="${esc(cv.id)}" type="button">Delete</button></div></div>`;
  }
  el('cvs-panel').innerHTML=html;
}
function renderVariant(){
  if(!active){el('variant-panel').innerHTML='';return;}
  const c=active.document;
  let html=`<div class="actions"><button data-action="back" class="btn" type="button">← My CVs</button><button data-action="save-cv" data-busy-control="1" class="btn btn-primary" type="button">Save this CV</button></div><p class="tip">Your contact details automatically reuse My Profile. Edit the title, employer, targeted role and select which saved entries should appear.</p><section class="form-section"><div class="form-section-header"><div><h3>Target job</h3></div></div><div class="field-grid">`;
  html+=field('title','CV title',active.title,{kind:'meta',key:'title'});
  html+=field('company','Company name',active.company,{kind:'meta',key:'company'});
  html+=field('target_role','Position applying for',active.target_role,{kind:'meta',key:'target_role'});
  html+=field('headline','CV-specific headline (optional)',c.headline,{kind:'variant',key:'headline'});
  html+=field('summary','CV-specific summary (optional)',c.summary,{kind:'variant',key:'summary'},true);
  html+='</div></section><section class="form-section"><div class="form-section-header"><div><h3>Choose CV template</h3><small>Four without photo, two with optional photo</small></div></div><div class="template-grid">';
  for(const [value,label] of Object.entries(TEMPLATES)){
    const photo=PHOTO_TEMPLATES.includes(value);
    html+=`<label class="template-option ${c.template===value?'chosen':''}"><input type="radio" name="cv-template" data-kind="template" value="${value}" ${c.template===value?'checked':''}><span class="template-mini ${esc(value)}"><i></i><b></b><em></em><u></u></span><strong>${esc(label)}</strong><small>${photo?'Optional photo':'No photo'}</small></label>`;
  }
  html+=`</div><div class="field-grid appearance-controls"><label class="field"><span>Accent color</span><input type="color" data-kind="accent" value="${esc(c.accent)}"></label>${PHOTO_TEMPLATES.includes(c.template)?`<label class="select-entry photo-option"><input type="checkbox" data-kind="show-photo" ${c.showPhoto?'checked':''}><span>Show my saved profile picture</span></label>`:''}</div>${PHOTO_TEMPLATES.includes(c.template)&&!safePhoto(master.profile.photo)?'<p class="field-help">To include your photo, upload it under My Profile. The CV works without a photo too.</p>':''}</section>`;
  html+='<section class="form-section"><div class="form-section-header"><div><h3>Contact details to show</h3><small>Choose independently for this job application</small></div></div><div class="contact-grid">';
  for(const [key,label] of [['email','Email'],['phone','Phone number'],['address','Full address'],['location','City and country'],['website','LinkedIn / website']]){
    html+=`<label class="select-entry"><input type="checkbox" data-kind="contact" data-key="${key}" ${c.contacts[key]?'checked':''}><span>${esc(label)}</span></label>`;
  }
  html+='</div></section>';
  for(const [group,meta] of Object.entries(SECTIONS)){
    html+=`<section class="form-section"><div class="form-section-header"><div><h3>${esc(meta.label)}</h3><small>Choose from your reusable profile</small></div></div>`;
    if(!master[group].length) html+='<p class="empty-section">No saved entries. Add them from My Profile.</p>';
    for(const item of master[group]){
      const label=meta.fields.map(([key])=>item[key]).filter(Boolean).slice(0,2).join(' — ')||'(unnamed entry)';
      const checked=c.included[group].includes(item.id)?'checked':'';
      html+=`<label class="select-entry"><input type="checkbox" data-kind="selected" data-section="${esc(group)}" data-id="${esc(item.id)}" ${checked}><span>${esc(label)}</span></label>`;
    }
    html+='</section>';
  }
  el('variant-panel').innerHTML=html;
}
function getPreviewCv(){
  if(active && screen==='editor')return composeCv(master,active);
  if(screen==='ai' && aiDraft) return composeCv(master,makeReviewedAiVariant(master,aiRequest,aiDraft,aiReview));
  return normalizeCv({...master,version:1});
}
function renderPreview(){
  const data=getPreviewCv();el('preview').innerHTML=renderResume(data);
  el('preview-title').textContent=screen==='editor'&&active?active.title:screen==='ai'&&aiDraft?'AI draft preview (not saved)':'Profile preview';
}
function renderUI(){
  const isDashboard=screen==='dashboard',isProfile=screen==='profile',isCvs=screen==='cvs',isEditor=screen==='editor',isAccount=screen==='account';
  el('dashboard-panel').hidden=!isDashboard;el('profile-panel').hidden=!isProfile;el('cvs-panel').hidden=!isCvs;el('variant-panel').hidden=!isEditor;el('account-panel').hidden=!isAccount;
  const isAi=screen==='ai';el('ai-panel').hidden=!isAi;
  const withPreview=isProfile||isEditor||(isAi&&!!aiDraft);
  for(const id of ['export-pdf','export-txt','export-json'])el(id).disabled=(isAi&&!!aiDraft);el('preview-pane').hidden=!withPreview;el('workspace').classList.toggle('single-column',!withPreview);
  el('pane-heading').textContent=isDashboard?'Overview':isProfile?'My Profile':isCvs?'My CVs':isAccount?'Account & privacy':isAi?'AI Smart CV Builder':'Edit tailored CV';
  el('pane-subtitle').textContent=isDashboard?'Your CVs, without the clutter.':isProfile?'Enter once, reuse in every CV.':isCvs?'Build different CVs for different companies.':isAccount?'Control your password and CV data.':isAi?'Tailor an accurate CV to a real job advert, then review before saving.':'Customize this job application, without retyping personal details.';
  for(const [key,selected] of [['dashboard',isDashboard],['profile',isProfile],['cvs',isCvs||isEditor],['ai',isAi],['account',isAccount]])el(`nav-${key}`).className='btn '+(selected?'btn-primary':'');
  if(isDashboard)renderDashboard();if(isProfile)renderProfile();if(isCvs)renderVariants();if(isEditor)renderVariant();if(isAccount)renderAccount();if(isAi)renderAi();renderPreview();
}
function changePage(target){
  if(dirtyMaster&&screen==='profile'){
    if(!confirm('Discard unsaved profile edits?'))return;
    master=structuredClone(savedMaster);dirtyMaster=false;
  }
  if(dirtyCv&&screen==='editor'&&!confirm('You have unsaved CV edits. Continue without saving?'))return;
  if(target!=='editor')active=null;
  screen=target;notice('');renderUI();
}
async function reloadData(){
  master=normalizeCv({...(await api.getMaster()||blankCv()),version:1});
  savedMaster=structuredClone(master);
  variants=(await api.listCvs()).map(normalizeVariant);
  dirtyMaster=false;dirtyCv=false;active=null;aiDraft=null;screen='dashboard';renderUI();
}
async function beginSession(){
  master=blankCv();variants=[];active=null;aiDraft=null;dirtyMaster=false;dirtyCv=false;
  try{
    await reloadData();
    el('user-badge').textContent=api.session.user.email||'Signed in';
    el('user-badge').hidden=false;el('signout').hidden=false;
    show('workspace');
    notice('Signed in. Save your profile and CVs to keep them in your private cloud workspace.');
    return true;
  }catch(error){
    show('auth-screen');el('auth-message').textContent=`Unable to load your workspace: ${errString(error)}. Please retry signing in.`;
    return false;
  }
}
async function authSubmit(ev){
  ev.preventDefault();if(busy)return;setBusy(true);
  const email=el('auth-email').value.trim(),password=el('auth-password').value;
  const msg=el('auth-message');msg.textContent='Connecting…';
  try{
    if(authMode==='signup'){
      const signedIn=await api.signUp(email,password,appRedirectUrl(window.location));
      if(signedIn)await beginSession();
      else msg.textContent='Check your email for a confirmation link. After verification you can sign in.';
    } else {await api.signIn(email,password);await beginSession();}
  }catch(error){msg.textContent=errString(error);}finally{el('auth-password').value='';setBusy(false);}
}
function updateAuthMode(mode){
  authMode=mode;el('tab-login').classList.toggle('selected',mode==='login');el('tab-signup').classList.toggle('selected',mode==='signup');
  el('auth-submit').textContent=mode==='login'?'Log in':'Create account';
  el('auth-password').autocomplete=mode==='login'?'current-password':'new-password';
  el('auth-password').minLength=8;
  el('auth-password').placeholder=mode==='signup'?'At least 8 characters':'Your password';
  el('auth-message').textContent='';
}
function download(name,data,type){const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}

el('auth-form').addEventListener('submit',authSubmit);
el('tab-login').addEventListener('click',()=>updateAuthMode('login'));
el('tab-signup').addEventListener('click',()=>updateAuthMode('signup'));
el('forgot-password').addEventListener('click',()=>{
  el('recover-email').value=el('auth-email').value.trim();el('recover-message').textContent='';show('recover-screen');
});
el('recover-back').addEventListener('click',()=>{show('auth-screen');updateAuthMode('login');});
el('recover-form').addEventListener('submit',async event=>{
  event.preventDefault();if(busy)return;setBusy(true);
  const msg=el('recover-message');msg.textContent='Sending…';
  try{
    await api.requestPasswordReset(el('recover-email').value.trim(),appRedirectUrl(window.location));
    msg.textContent='If an account exists for this email, a reset link has been sent. Check your inbox and spam folder.';
  }catch(error){msg.textContent=errString(error);}finally{setBusy(false);}
});
el('reset-form').addEventListener('submit',async event=>{
  event.preventDefault();if(busy)return;
  const password=el('reset-password').value,confirmPassword=el('reset-confirm').value;
  if(password!==confirmPassword){el('reset-message').textContent='Passwords do not match.';return;}
  setBusy(true);el('reset-message').textContent='Updating password…';
  try{
    await api.updatePassword(password);
    await api.signOut();
    el('reset-form').reset();show('auth-screen');updateAuthMode('login');
    el('auth-message').textContent='Password updated. Please log in using the new password.';
  }catch(error){el('reset-message').textContent=errString(error);}finally{setBusy(false);}
});
el('signout').addEventListener('click',async()=>{
  if((dirtyMaster||dirtyCv)&&!confirm('You have unsaved changes. Sign out anyway?'))return;
  setBusy(true);
  try{await api.signOut();}finally{
    master=blankCv();variants=[];active=null;aiDraft=null;dirtyMaster=false;dirtyCv=false;
    el('user-badge').hidden=true;el('signout').hidden=true;
    api=new CloudApi(CLOUD_CONFIG);
    show(api.isConfigured()?'auth-screen':'setup-screen');updateAuthMode('login');setBusy(false);
  }
});
el('nav-dashboard').addEventListener('click',()=>changePage('dashboard'));
el('nav-profile').addEventListener('click',()=>changePage('profile'));
el('nav-cvs').addEventListener('click',()=>changePage('cvs'));
el('nav-ai').addEventListener('click',()=>changePage('ai'));
el('nav-account').addEventListener('click',()=>changePage('account'));
// AI drafts are temporary until the user reviews and approves a NEW CV row.
el('ai-panel').addEventListener('submit',async event=>{
  if(busy)return;
  if(event.target.id==='ai-generate-form'){
    event.preventDefault();
    if(dirtyMaster){notice('Save your My Profile changes before using AI.',true);return;}
    const fd=new FormData(event.target);
    const input={targetRole:String(fd.get('targetRole')||'').trim(),company:String(fd.get('company')||'').trim(),
      jobDescription:String(fd.get('jobDescription')||'').trim(),template:String(fd.get('template')||'modern')};
    aiRequest=input;
    if(!fd.get('consent')){notice('Please consent to sharing the relevant profile details with the AI provider.',true);return;}
    setBusy(true);notice('Analyzing the job and your saved profile…');
    try{
      const reply=await api.generateAiDraft({...input,consent:true});
      if(!reply?.draft)throw new Error('The AI service did not provide a draft.');
      aiDraft=reply.draft;
      aiReview={title:`${input.targetRole} — tailored CV`.slice(0,120),headline:aiDraft.headline,
        summary:aiDraft.summary,included:structuredClone(aiDraft.recommended)};
      renderUI();notice('Draft ready. Review every statement before saving it.');
    }catch(e){notice(errString(e),true);}finally{setBusy(false);}
  }
  if(event.target.id==='ai-review-form'){
    event.preventDefault();
    const fd=new FormData(event.target);
    if(!fd.get('approved')){notice('Confirm that you have reviewed the AI-generated draft.',true);return;}
    const included=Object.fromEntries(Object.keys(SECTIONS).map(key=>[key,fd.getAll(`included-${key}`)]));
    aiReview={title:String(fd.get('title')||'').trim(),headline:String(fd.get('headline')||''),
      summary:String(fd.get('summary')||''),included};
    setBusy(true);
    try{
      const proposed=makeReviewedAiVariant(master,aiRequest,aiDraft,aiReview);
      const row=await api.createCv(proposed);
      const saved=normalizeVariant(row);
      variants.unshift(saved);active=structuredClone(saved);screen='editor';aiDraft=null;dirtyCv=false;
      renderUI();notice('Approved AI CV saved as a new version. Your original CVs were not changed.');
    }catch(e){notice(errString(e),true);}finally{setBusy(false);}
  }
});
// The live preview reflects the reviewer's edits without saving or calling AI again.
el('ai-panel').addEventListener('input',event=>{
  if(!aiDraft || event.target.form?.id!=='ai-review-form')return;
  if(['title','headline','summary'].includes(event.target.name))aiReview[event.target.name]=event.target.value;
  renderPreview();
});
el('ai-panel').addEventListener('change',event=>{
  if(!aiDraft || event.target.form?.id!=='ai-review-form')return;
  for(const key of Object.keys(SECTIONS)){
    aiReview.included[key]=Array.from(el('ai-review-form').querySelectorAll(`input[name="included-${key}"]:checked`)).map(x=>x.value);
  }
  renderPreview();
});
el('ai-panel').addEventListener('click',event=>{
  if(busy)return;
  if(event.target.closest('button[data-action="discard-ai"]')){aiDraft=null;renderUI();notice('AI draft discarded. Nothing was saved.');}
});
el('account-panel').addEventListener('submit',async event=>{
  if(event.target.id!=='account-password-form'||busy)return;
  event.preventDefault();const fd=new FormData(event.target);
  if(fd.get('password')!==fd.get('confirm')){notice('Passwords do not match.',true);return;}
  setBusy(true);
  try{await api.updatePassword(String(fd.get('password')));event.target.reset();notice('Password successfully updated.');}
  catch(error){notice(errString(error),true);}finally{setBusy(false);}
});
el('account-panel').addEventListener('click',async event=>{
  const b=event.target.closest('button[data-action]');if(!b||busy)return;
  if(b.dataset.action==='export-account'){
    const backup={app:'cv-studio',backup_version:1,exported_at:new Date().toISOString(),profile:master,cvs:variants};
    download('cv-studio-full-backup.json',JSON.stringify(backup,null,2),'application/json');
    notice('Backup downloaded. Store it securely because it contains personal information.');
    return;
  }
  if(b.dataset.action==='clear-account-data'){
    if((dirtyMaster||dirtyCv)&&!confirm('Unsaved changes will be lost. Continue?'))return;
    const response=prompt('This permanently erases ALL your profile and CV information. Type DELETE to confirm:');
    if(response!=='DELETE'){notice('Erasure cancelled.');return;}
    setBusy(true);
    try{await api.clearWorkspace();master=blankCv();savedMaster=blankCv();variants=[];active=null;dirtyMaster=false;dirtyCv=false;screen='dashboard';renderUI();notice('Your profile and CV information has been erased. Your login account still exists.');}
    catch(error){notice(`Could not erase CV data: ${errString(error)}`,true);}finally{setBusy(false);}
  }
});
el('profile-panel').addEventListener('change',async(ev)=>{
 const t=ev.target;
 if(t.dataset.kind==='photo-file'){
   if(!t.files?.[0])return;
   try { master.profile.photo=await preparePhoto(t.files[0]);dirtyMaster=true;renderUI();notice('Photo prepared. Save your profile to upload it securely.'); }
   catch(e){notice(errString(e),true);t.value='';}
   return;
 }
 if(t.dataset.kind==='present'){
   const item=master.experience.find(x=>x.id===t.dataset.id);
   if(item){item.end=t.checked?'Present':'';dirtyMaster=true;renderUI();notice('Unsaved profile changes');}
 }
});
el('profile-panel').addEventListener('input',(ev)=>{
 const t=ev.target;if(!t.dataset.key)return;
 if(t.dataset.kind==='profile'&&Object.hasOwn(master.profile,t.dataset.key))master.profile[t.dataset.key]=t.value;
 else if(t.dataset.kind==='item'&&SECTIONS[t.dataset.section]?.fields.some(([k])=>k===t.dataset.key)){
  const item=master[t.dataset.section].find(x=>x.id===t.dataset.id);if(item)item[t.dataset.key]=t.value;
 }else return;
 dirtyMaster=true;notice('Unsaved profile changes');renderPreview();
});
el('profile-panel').addEventListener('click',async(ev)=>{
 const b=ev.target.closest('button[data-action]');if(!b||busy)return;
 const {action,section,id}=b.dataset;
 if(action==='remove-photo'){master.profile.photo='';dirtyMaster=true;renderUI();notice('Photo removed. Save your profile to confirm.');return;}
 if(action==='save-master'){
  const dateError=validateExperience(master.experience);if(dateError){notice(dateError,true);return;}
  setBusy(true);notice('Saving profile…');try{await api.saveMaster(master);savedMaster=structuredClone(master);dirtyMaster=false;notice('✓ Profile saved to your account.');}catch(e){notice(errString(e),true);}finally{setBusy(false);}return;
 }
 if(SECTIONS[section]){
  if(action==='add') master[section].push(createItem(section));
  else if(action==='remove'){if(!confirm('Remove this profile entry? Existing CVs will no longer be able to display it.'))return;master[section]=master[section].filter(x=>x.id!==id);}
  else if(action==='up'||action==='down')moveItem(master,section,id,action==='up'?-1:1);
  dirtyMaster=true;
 }else return;
 notice('Unsaved profile changes');renderUI();
});
// Both overview and My CVs use the same data operations.
async function handleCvAction(ev){
 const b=ev.target.closest('button[data-action]');if(!b||busy)return;
 const {action,id}=b.dataset;
 const current=variants.find(x=>x.id===id);
 if(action==='new'){
  el('new-cv-form').reset();el('new-cv-dialog').showModal();el('new-cv-form').elements.title.focus();return;
 }
 if(action==='duplicate'&&current){
  const draft=newVariant(master,{title:`${current.title} (copy)`.slice(0,120),company:current.company,target_role:current.target_role});
  draft.document=structuredClone(current.document);
  setBusy(true);
  try{const row=await api.createCv(draft);variants.unshift(normalizeVariant(row));active=normalizeVariant(row);screen='editor';dirtyCv=false;renderUI();notice('CV duplicated. Change the company or role and save your version.');}
  catch(e){notice(errString(e),true);}finally{setBusy(false);}return;
 }
 if(action==='open'&&current){if(dirtyMaster&&!confirm('You have unsaved profile edits. Continue?'))return;active=structuredClone(current);screen='editor';dirtyCv=false;notice('');renderUI();return;}
 if(action==='delete'&&current){if(!confirm(`Permanently delete "${current.title}"?`))return;
  setBusy(true);try{await api.deleteCv(id);variants=variants.filter(x=>x.id!==id);renderUI();notice('CV deleted.');}catch(e){notice(errString(e),true);}finally{setBusy(false);}
 }
}
el('new-cv-form').addEventListener('submit',async(ev)=>{
 ev.preventDefault();if(busy)return;
 const data=new FormData(ev.currentTarget);
 const title=String(data.get('title')||'').trim();
 if(!title)return;
 const draft=newVariant(master,{title,company:String(data.get('company')||'').trim(),target_role:String(data.get('target_role')||'').trim()});
 setBusy(true);
 try{
   if(dirtyMaster){const dateError=validateExperience(master.experience);if(dateError)throw new Error(dateError);await api.saveMaster(master);savedMaster=structuredClone(master);dirtyMaster=false;}
   const row=await api.createCv(draft);variants.unshift(normalizeVariant(row));active=normalizeVariant(row);screen='editor';dirtyCv=false;
   el('new-cv-dialog').close();renderUI();notice('New CV created using your reusable profile.');
 }catch(e){notice(errString(e),true);}finally{setBusy(false);}
});
el('cancel-new-cv').addEventListener('click',()=>el('new-cv-dialog').close());
el('cvs-panel').addEventListener('click',handleCvAction);
el('dashboard-panel').addEventListener('click',(ev)=>{const action=ev.target.closest('button[data-action]')?.dataset.action;if(action==='go-profile')changePage('profile');else if(action==='go-cvs')changePage('cvs');else handleCvAction(ev);});
el('variant-panel').addEventListener('input',(ev)=>{
 const t=ev.target;if(!active)return;
 if(t.dataset.kind==='meta'&&['title','company','target_role'].includes(t.dataset.key))active[t.dataset.key]=t.value;
 else if(t.dataset.kind==='variant'&&['headline','summary'].includes(t.dataset.key))active.document[t.dataset.key]=t.value;
 else if(t.dataset.kind==='accent')active.document.accent=t.value;
 else return;
 dirtyCv=true;notice('Unsaved CV changes');renderPreview();
});
el('variant-panel').addEventListener('change',(ev)=>{
 const t=ev.target;if(!active)return;
 if(t.dataset.kind==='selected')toggleSelection(active,t.dataset.section,t.dataset.id,t.checked);
 else if(t.dataset.kind==='contact'&&['email','phone','address','location','website'].includes(t.dataset.key))active.document.contacts[t.dataset.key]=t.checked;
 else if(t.dataset.kind==='template'&&Object.hasOwn(TEMPLATES,t.value)){active.document.template=t.value;renderVariant();}
 else if(t.dataset.kind==='show-photo')active.document.showPhoto=t.checked;
 else return;
 dirtyCv=true;notice('Unsaved CV changes');renderPreview();
});
el('variant-panel').addEventListener('click',async(ev)=>{
 const b=ev.target.closest('button[data-action]');if(!b||busy)return;
 if(b.dataset.action==='back'){changePage('cvs');return;}
 if(b.dataset.action==='save-cv'){
  if(!active?.title.trim()){notice('Add a name for this CV before saving.',true);return;}
  setBusy(true);try{const row=await api.updateCv(active);active=normalizeVariant(row);variants=variants.map(x=>x.id===active.id?structuredClone(active):x);dirtyCv=false;notice('✓ CV saved in your private account.');}catch(e){notice(errString(e),true);}finally{setBusy(false);}
 }
});
el('export-pdf').addEventListener('click',()=>{if(dirtyMaster||dirtyCv)notice('Warning: exported preview includes unsaved changes.');window.print();});
const exportFilename=(ext)=>{const label=screen==='editor'&&active?active.title:'my-profile';return `${label.toLowerCase().replace(/[^a-z0-9 -]/g,'').trim().replace(/\s+/g,'-').slice(0,65)||'cv-studio'}.${ext}`;};
el('export-txt').addEventListener('click',()=>download(exportFilename('txt'),cvAsText(getPreviewCv()),'text/plain'));
el('export-json').addEventListener('click',()=>download(exportFilename('json'),JSON.stringify(getPreviewCv(),null,2),'application/json'));
window.addEventListener('beforeunload',event=>{
  if(dirtyMaster||dirtyCv){event.preventDefault();event.returnValue='';}
});
async function boot(){
  const fragment=window.location.hash;
  // Clear secrets in the address bar before any asynchronous operation.
  if(fragment)window.history.replaceState(null,'',window.location.pathname+window.location.search);
  if(!api.isConfigured()){
    show('setup-screen');return;
  }
  if(!fragment){show('auth-screen');return;}
  try{
    const result=await api.acceptEmailLink(fragment);
    if(result.kind==='recovery'){show('reset-screen');return;}
    if(result.kind==='session'){await beginSession();return;}
    show('auth-screen');
  }catch(error){show('auth-screen');el('auth-message').textContent=`Email link could not be verified: ${errString(error)}`;}
}
boot();
