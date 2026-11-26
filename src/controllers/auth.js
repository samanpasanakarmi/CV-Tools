import { state, AI_ENABLED } from '../state.js';
import { blankCv, normalizeCv } from '../model.js';
import { normalizeVariant } from '../workspace.js';
import { CloudApi } from '../api.js';
import { CLOUD_CONFIG } from '../config.js';
import { appRedirectUrl } from '../auth-flow.js';
import { el, show, notice, errString } from '../ui/dom.js';
import { renderUI } from '../ui/render.js';
import { setBusy, clearPrivateState, saveBeforeLeaving, saveIndicator } from './saving.js';
// Registration, login, recovery, logout and startup.
async function reloadData(){
  state.master=normalizeCv({...(await state.api.getMaster()||blankCv()),version:1});
  state.savedMaster=structuredClone(state.master);
  state.variants=(await state.api.listCvs()).map(normalizeVariant);
  state.dirtyMaster=false;
  state.dirtyCv=false;
  state.active=null;
  state.aiDraft=null;
  state.screen='dashboard';
  saveIndicator('ready');
  renderUI();
}
async function beginSession(){
  state.master=blankCv();
  state.variants=[];
  state.active=null;
  state.aiDraft=null;
  state.dirtyMaster=false;
  state.dirtyCv=false;
  try{
    await reloadData();
    el('user-badge').textContent=state.api.session.user.email||'Signed in';
    el('user-badge').hidden=false;
    el('signout').hidden=false;
    show('workspace');
    notice('Signed in. Save your profile and CVs to keep them in your private cloud workspace.');
    return true;
  }catch(error){
    show('auth-screen');
    el('auth-message').textContent=`Unable to load your workspace: ${errString(error)}. Please retry signing in.`;
    return false;
  }
}
async function authSubmit(ev){
  ev.preventDefault();
  if(state.busy)return;
  setBusy(true);
  const email=el('auth-email').value.trim(),password=el('auth-password').value;
  const msg=el('auth-message');
  msg.textContent='Connecting…';
  try{
    if(state.authMode==='signup'){
      const signedIn=await state.api.signUp(email,password,appRedirectUrl(window.location));
      if(signedIn)await beginSession();
      else msg.textContent='Check your email for a confirmation link. After verification you can sign in.';
    } else {await state.api.signIn(email,password);
      await beginSession();}
  }catch(error){msg.textContent=errString(error);}finally{el('auth-password').value='';
    setBusy(false);}
}
function updateAuthMode(mode){
  state.authMode=mode;
  el('tab-login').classList.toggle('selected',mode==='login');
  el('tab-signup').classList.toggle('selected',mode==='signup');
  el('auth-submit').textContent=mode==='login'?'Log in':'Create account';
  el('auth-password').autocomplete=mode==='login'?'current-password':'new-password';
  el('auth-password').minLength=8;
  el('auth-password').placeholder=mode==='signup'?'At least 8 characters':'Your password';
  el('auth-message').textContent='';
}

export function registerAuth() {
  el('auth-form').addEventListener('submit',authSubmit);
  el('tab-login').addEventListener('click',()=>updateAuthMode('login'));
  el('tab-signup').addEventListener('click',()=>updateAuthMode('signup'));
  el('forgot-password').addEventListener('click',()=>{
    el('recover-email').value=el('auth-email').value.trim();
    el('recover-message').textContent='';
    show('recover-screen');
  });
  el('recover-back').addEventListener('click',()=>{show('auth-screen');
    updateAuthMode('login');});
  el('recover-form').addEventListener('submit',async event=>{
    event.preventDefault();
    if(state.busy)return;
    setBusy(true);
    const msg=el('recover-message');
    msg.textContent='Sending…';
    try{
      await state.api.requestPasswordReset(el('recover-email').value.trim(),appRedirectUrl(window.location));
      msg.textContent='If an account exists for this email, a reset link has been sent. Check your inbox and spam folder.';
    }catch(error){msg.textContent=errString(error);}finally{setBusy(false);}
  });
  el('reset-form').addEventListener('submit',async event=>{
    event.preventDefault();
    if(state.busy)return;
    const password=el('reset-password').value,confirmPassword=el('reset-confirm').value;
    if(password!==confirmPassword){el('reset-message').textContent='Passwords do not match.';
      return;}
    setBusy(true);
    el('reset-message').textContent='Updating password…';
    try{
      await state.api.updatePassword(password);
      await state.api.signOut();
      el('reset-form').reset();
      show('auth-screen');
      updateAuthMode('login');
      el('auth-message').textContent='Password updated. Please log in using the new password.';
    }catch(error){el('reset-message').textContent=errString(error);}finally{setBusy(false);}
  });
  el('signout').addEventListener('click',async()=>{
    if(state.busy)return;
    if(!await saveBeforeLeaving() && !confirm('Your latest changes could not be saved. Discard unsaved edits and sign out?'))return;
    setBusy(true);
    const previousApi=state.api;
    clearPrivateState();
    el('auth-form').reset();
    el('recover-form').reset();
    el('reset-form').reset();
    try{
      show('auth-screen');
      await previousApi.signOut();
    }finally{
      el('user-badge').textContent='';
      el('user-badge').hidden=true;
      el('signout').hidden=true;
      state.api=new CloudApi(CLOUD_CONFIG);
      show(state.api.isConfigured()?'auth-screen':'setup-screen');
      updateAuthMode('login');
      setBusy(false);
    }
  });
}

export async function boot(){
  el('nav-ai').hidden=!AI_ENABLED;
  el('nav-ai').disabled=!AI_ENABLED;
  const fragment=window.location.hash;
  // Clear secrets in the address bar before any asynchronous operation.
  if(fragment)window.history.replaceState(null,'',window.location.pathname+window.location.search);
  if(!state.api.isConfigured()){
    show('setup-screen');
    return;
  }
  if(!fragment){show('auth-screen');
    return;}
  try{
    const result=await state.api.acceptEmailLink(fragment);
    if(result.kind==='recovery'){show('reset-screen');
      return;}
    if(result.kind==='session'){await beginSession();
      return;}
    show('auth-screen');
  }catch(error){show('auth-screen');
    el('auth-message').textContent=`Email link could not be verified: ${errString(error)}`;}
}
