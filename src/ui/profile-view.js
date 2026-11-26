import { SECTIONS, escapeHtml as esc, isIsoDate, safePhoto } from '../model.js';
import { el, field } from './dom.js';
// Render the reusable master profile. Event handling is in controllers/profile.js.
const keys = [ ['name','Full name'], ['email','Email'],['phone','Phone number'],['address','Address (optional)'],['location','City / country'],['website','LinkedIn / portfolio'],['headline','Default professional title'],['summary','Default professional summary',true] ];

function experienceField(item,key,label){
  const date=item[key]||'';
  const isPresent=key==='end' && date==='Present';
  const good=isIsoDate(date);
  const props=`data-kind="item" data-section="experience" data-id="${esc(item.id)}" data-key="${key}"`;
  const note=date && !good && !isPresent ? `<small class="legacy-warning">Previously saved: ${esc(date)}. Choose an exact date to replace it.</small>` : '';
  return `<label class="field"><span>${esc(label)}</span><input type="date" ${props} value="${good?esc(date):''}" ${isPresent?'disabled':''} aria-label="${esc(label)}"/><small class="field-help">CV displays DD/MM/YYYY</small>${note}</label>`;
}

export function renderProfile(master){
  let html=`<p class="tip">This is your reusable master profile. Name, phone, address, and work history live here, not in individual CV copies.</p><div class="actions"><button data-action="save-master" data-busy-control="1" type="button" class="btn btn-primary">Save now</button></div><section class="form-section"><div class="form-section-header"><div><span class="step-label">01</span><h3>Personal information</h3></div></div><div class="field-grid">`;
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
