import { blankCv, normalizeCv, SECTIONS, makeId, TEMPLATES, PHOTO_TEMPLATES } from './model.js';

const groups = Object.keys(SECTIONS);
export function cleanMaster(raw) {
  if (!raw) return blankCv();
  return normalizeCv({ ...raw, version: 1 });
}
export function newVariant(master, {title='Untitled CV', company='', target_role=''} = {}) {
  return { id: makeId(), title: title.slice(0,120), company: company.slice(0,120), target_role: target_role.slice(0,120),
    document: {version: 1, headline: '', summary: '', included: Object.fromEntries(groups.map(k=>[k, master[k].map(x=>x.id)])), template:'modern', accent:'#235d80', showPhoto:true, contacts: {email:true,phone:true,address:true,location:true,website:true}} };
}
export function normalizeVariant(row) {
  if (!row || typeof row !== 'object' || !row.document || typeof row.document !== 'object') throw new Error('Invalid CV');
  const doc = row.document;
  return {
    id: String(row.id||''), title: String(row.title||'Untitled CV').slice(0,120),
    company: String(row.company||'').slice(0,120), target_role: String(row.target_role||'').slice(0,120),
    document: {
      version:1, headline: String(doc.headline||'').slice(0,6000), summary:String(doc.summary||'').slice(0,6000),
      included: Object.fromEntries(groups.map(k=>[k,Array.isArray(doc.included?.[k])?[...new Set(doc.included[k].filter(x=>typeof x==='string').slice(0,100))]:[]])),
      template:Object.hasOwn(TEMPLATES,doc.template)?doc.template:'modern', showPhoto:doc.showPhoto!==false, accent:/^#[0-9a-fA-F]{6}$/.test(doc.accent)?doc.accent:'#235d80',
      contacts: Object.fromEntries(['email','phone','address','location','website'].map(key=>[key,doc.contacts?.[key]!==false]))
    }
  };
}
export function composeCv(master,variant) {
  const out=cleanMaster(master);
  const v=normalizeVariant(variant).document;
  out.profile.headline=v.headline.trim() || out.profile.headline || variant.target_role || '';
  out.profile.summary=v.summary.trim() || out.profile.summary;
  for(const section of groups) {
    const keep = new Set(v.included[section]);
    out[section] = out[section].map(item=>({...item,include:keep.has(item.id)}));
  }
  for(const key of ['email','phone','address','location','website']) {if(!v.contacts[key])out.profile[key]='';}
  if(!PHOTO_TEMPLATES.includes(v.template)||!v.showPhoto)out.profile.photo='';
  out.settings={template:v.template,accent:v.accent};
  return out;
}
export function toggleSelection(variant,section,id,checked) {
  if (!SECTIONS[section]) return;
  const ids = new Set(variant.document.included[section]);
  if(checked) ids.add(id); else ids.delete(id);
  variant.document.included[section]=[...ids];
}
