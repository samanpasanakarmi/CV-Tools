import { SECTIONS, TEMPLATES, PHOTO_TEMPLATES, safePhoto, escapeHtml as esc, CUSTOM_FIELD_LIMIT, CUSTOM_LABEL_LIMIT, CUSTOM_VALUE_LIMIT, sectionOrderGroups } from '../model.js';
import { el, field } from './dom.js';
// CV-specific editor, custom fields, and ordering controls.
function sectionLabel(doc,key){
  if(key==='summary')return 'Professional summary';
  if(Object.hasOwn(SECTIONS,key))return SECTIONS[key].label;
  return doc.customFields.find(item=>'custom:'+item.id===key)?.label.trim()||'Untitled custom field';
}
function renderSectionOrder(doc){
  const groups=sectionOrderGroups(doc.sectionOrder,doc.customFields,doc.template);
  let html=`<section class="form-section"><div class="form-section-header"><div><h3>CV section order</h3><small>Saved for this CV only</small></div><button type="button" class="btn btn-small" data-action="reset-order">Reset order</button></div><p class="field-help">Use the up and down buttons to arrange CV sections. Empty sections stay hidden in the preview. Your name and contact details always stay at the top.${doc.template==='two-column'?' This template keeps its sidebar and main column separate; reorder within each column.':''}</p><div id="section-order-list">`;
  for(const group of groups){
    if(groups.length>1)html+=`<h4 class="order-group-heading">${esc(group.label)}</h4>`;
    html+='<ol class="section-order-list">';
    group.keys.forEach((key,index)=>{
      const label=sectionLabel(doc,key);
      html+=`<li class="section-order-row"><span class="section-order-name" data-order-label="${esc(key)}">${esc(label)}</span><div class="icon-actions"><button type="button" data-action="section-up" data-order-key="${esc(key)}" aria-label="Move ${esc(label)} up" ${index===0?'disabled':''}>↑</button><button type="button" data-action="section-down" data-order-key="${esc(key)}" aria-label="Move ${esc(label)} down" ${index===group.keys.length-1?'disabled':''}>↓</button></div></li>`;
    });
    html+='</ol>';
  }
  return html+'</div></section>';
}
export function refreshSectionOrderLabels(doc){
  for(const node of el('variant-panel').querySelectorAll('[data-order-label]'))node.textContent=sectionLabel(doc,node.dataset.orderLabel);
  for(const button of el('variant-panel').querySelectorAll('[data-order-key]')){
    const direction=button.dataset.action==='section-up'?'up':'down';
    button.setAttribute('aria-label','Move '+sectionLabel(doc,button.dataset.orderKey)+' '+direction);
  }
}
export function renderVariant(master, active){
  if(!active){el('variant-panel').innerHTML='';return;}
  const c=active.document;
  let html=`<div class="actions"><button data-action="back" class="btn" type="button">← My CVs</button><button data-action="save-cv" data-busy-control="1" class="btn btn-primary" type="button">Save now</button></div><p class="tip">Your contact details automatically reuse My Profile. Edit the title, employer, targeted role and select which saved entries should appear.</p><section class="form-section"><div class="form-section-header"><div><h3>Target job</h3></div></div><div class="field-grid">`;
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
  html+=`<section class="form-section"><div class="form-section-header"><div><h3>Custom fields</h3><small>Only for this CV · up to ${CUSTOM_FIELD_LIMIT}</small></div><button type="button" class="btn btn-small btn-add" data-action="add-custom" ${c.customFields.length>=CUSTOM_FIELD_LIMIT?'disabled':''}>+ Add custom field</button></div><p class="field-help">Add any heading and text, for example Volunteering, Driving licence, Awards or Interests. Only completed fields appear in the CV.</p>`;
  for(const item of c.customFields){
    html+=`<div class="entry-card"><div class="entry-card-header"><strong>Custom field</strong><button type="button" class="btn btn-small remove" data-action="remove-custom" data-id="${esc(item.id)}">Remove</button></div><div class="field-grid"><label class="field"><span>Heading</span><input type="text" maxlength="${CUSTOM_LABEL_LIMIT}" data-kind="custom" data-id="${esc(item.id)}" data-key="label" value="${esc(item.label)}" placeholder="e.g. Driving licence"></label><label class="field"><span>Details</span><textarea rows="3" maxlength="${CUSTOM_VALUE_LIMIT}" data-kind="custom" data-id="${esc(item.id)}" data-key="value" placeholder="e.g. Category B">${esc(item.value)}</textarea></label></div></div>`;
  }
  html+='</section>';
  html+=renderSectionOrder(c);
  el('variant-panel').innerHTML=html;
}
