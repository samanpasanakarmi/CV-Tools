// This file belongs to our shared data contract. Discuss schema changes in a pull request.
export const STORAGE_KEY = 'metropolia-cv-tool-v1';
export const SECTIONS = {
  experience: { label:'Work experience', singular:'experience', fields:[
    ['role','Job title','text'], ['organization','Employer','text'],
    ['location','Location','text'], ['start','Start date (DD/MM/YYYY)','date'],
    ['end','End date (DD/MM/YYYY or Present)','date'], ['details','Achievements (one per line)','textarea']
  ] },
  education: { label:'Education', singular:'education', fields:[
    ['qualification','Qualification / degree','text'], ['organization','School / university','text'],
    ['location','Location','text'], ['start','Start year','text'],
    ['end','End year','text'], ['details','Notes','textarea']
  ] },
  projects: { label:'Projects', singular:'project', fields:[
    ['name','Project name','text'], ['link','Project URL','url'],
    ['details','Description','textarea']
  ] },
  skills: { label:'Skills', singular:'skill', fields:[ ['name','Skill','text'] ] },
  languages: { label:'Languages', singular:'language', fields:[ ['name','Language','text'], ['level','Level','text'] ] },
  certificates: { label:'Certifications', singular:'certificate', fields:[
    ['name','Certificate','text'],['issuer','Issued by','text'],['year','Year','text']
  ] }
};
const profileFields = ['name','headline','email','phone','address','location','website','summary','photo'];
export const TEMPLATES = Object.freeze({
  modern:'Modern',
  classic:'Classic',
  minimal:'Minimal',
  executive:'Executive',
  'photo-sidebar':'Photo sidebar',
  'photo-header':'Photo header',
  'ats-clean':'ATS Clean',
  nordic:'Nordic Professional',
  'two-column':'Modern Two Column'
});
export const PHOTO_TEMPLATES = Object.freeze(['photo-sidebar','photo-header']);
export function safePhoto(value) { return typeof value==='string' && value.length<=300000 && /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(value) ? value : ''; }
export function isIsoDate(value) {
  if(typeof value!=='string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const [y,m,d]=value.split('-').map(Number);
  const dt=new Date(Date.UTC(y,m-1,d));
  return y>=1900 && y<=2100 && dt.getUTCFullYear()===y && dt.getUTCMonth()+1===m && dt.getUTCDate()===d;
}
export function displayDate(value) {
 if(!isIsoDate(value))return value || ''; // Preserve legacy month/year text without inventing a day.
 const [y,m,d]=value.split('-'); return `${d}/${m}/${y}`;
}
export function validateExperience(entries){
 for(const [i,entry] of entries.entries()) {
   if(!entry.role?.trim() && !entry.organization?.trim() && !entry.start && !entry.end)continue;
   if(!isIsoDate(entry.start))return `Work experience ${i+1}: choose an exact start date (day/month/year).`;
   if(entry.end!== 'Present' && !isIsoDate(entry.end))return `Work experience ${i+1}: choose an exact end date or mark Currently working here.`;
   if(entry.end!== 'Present' && entry.end<entry.start)return `Work experience ${i+1}: end date cannot be before start date.`;
 }
 return '';
}
export function makeId() { return globalThis.crypto?.randomUUID?.() || `id-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
export function blankCv() {
  return {version:1, profile:Object.fromEntries(profileFields.map(key=>[key,''])),
    experience:[], education:[], projects:[], skills:[], languages:[], certificates:[],
    settings:{ template:'modern', accent:'#235d80' } };
}
export function demoCv() {
  const cv = blankCv();
  cv.profile = {photo:'',name:'Alex Morgan', headline:'Junior Software Developer', email:'alex@example.com',phone:'+358 40 123 4567',address:'',location:'Helsinki, Finland',website:'https://example.com',summary:'Curious software developer focused on useful, accessible web applications. I enjoy collaborating with teams and improving products through user feedback.'};
  cv.experience=[{id:'demo-work-1',role:'Web Development Intern',organization:'Sample Tech Ltd',location:'Helsinki',start:'2025-06-02',end:'2025-08-29',details:'Built reusable interface components\nHelped test and improve accessibility',include:true}];
  cv.education=[{id:'demo-school-1',qualification:'B.Eng. Information Technology',organization:'Example University',location:'Espoo',start:'2024',end:'Present',details:'Web development, databases and software projects',include:true}];
  cv.projects=[{id:'demo-project-1',name:'Community Events App',link:'https://example.com',details:'Designed and built an event discovery prototype in a four-person team.',include:true}];
  cv.skills=['JavaScript','HTML & CSS','Git & GitHub','Teamwork'].map((name,i)=>({id:`demo-skill-${i}`,name,include:true}));
  cv.languages=[{id:'demo-language-1',name:'English',level:'Professional',include:true}];
  cv.certificates=[];
  return cv;
}
function text(v) { return typeof v === 'string' ? v.slice(0,6000) : ''; }
// Never trust imported JSON. Only copy known keys and normalize records.
export function normalizeCv(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || raw.version !== 1) throw new Error('Please select a CV Tool v1 JSON backup.');
  const clean = blankCv();
  const profile = raw.profile && typeof raw.profile === 'object' ? raw.profile : {};
  for (const field of profileFields) clean.profile[field] = field==='photo' ? safePhoto(profile[field]) : text(profile[field]);
  for (const [section, config] of Object.entries(SECTIONS)) {
    const items = Array.isArray(raw[section]) ? raw[section].slice(0,100) : [];
    const ids = new Set();
    clean[section] = items.filter(item=>item && typeof item==='object' && !Array.isArray(item)).map(item=>{
      let id = text(item.id).slice(0,100) || makeId();
      if(ids.has(id)) id = makeId();
      ids.add(id);
      const record={id,include:item.include !== false};
      for (const [field] of config.fields) record[field] = text(item[field]);
      return record;
    });
  }
  clean.settings.template = Object.hasOwn(TEMPLATES,raw.settings?.template) ? raw.settings.template : 'modern';
  const accent = raw.settings?.accent;
  clean.settings.accent = typeof accent==='string' && /^#[0-9a-fA-F]{6}$/.test(accent) ? accent : '#235d80';
  return clean;
}
export function createItem(section) {
  if (!SECTIONS[section]) throw new Error('Invalid section');
  return {id:makeId(),include:true,...Object.fromEntries(SECTIONS[section].fields.map(([field])=>[field,'']))};
}
export function moveItem(cv, section, id, direction) {
  if (!SECTIONS[section]) return false;
  const items = cv[section]; const index=items.findIndex(item=>item.id===id);
  const target=index+direction;
  if(index<0 || target<0 || target>=items.length) return false;
  [items[index],items[target]]=[items[target],items[index]];
  return true;
}
export function selectedItems(cv, section) { return cv[section].filter(item=>item.include); }
export function safeHref(value) {
  try { const u = new URL(value); return ['https:','http:'].includes(u.protocol) ? u.href : ''; }
  catch { return ''; }
}
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
export function cvAsText(cv) {
  const p=cv.profile;
  const lines = [p.name,p.headline,[p.location,p.email,p.phone,p.website].filter(Boolean).join(' | '),'',p.summary,''];
  for (const [section, meta] of Object.entries(SECTIONS)) {
    const items = selectedItems(cv,section);
    if (!items.length) continue;
    lines.push(meta.label.toUpperCase());
    for (const item of items) {
      lines.push(meta.fields.filter(([field])=>field!=='details').map(([field])=>section==='experience' && (field==='start'||field==='end')? displayDate(item[field]):item[field]).filter(Boolean).join(' — '));
      if (item.details) lines.push(item.details);
      lines.push('');
    }
  }
  return lines.join('\n').trim()+'\n';
}
