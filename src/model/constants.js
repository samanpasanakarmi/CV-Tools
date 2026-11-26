// Shared CV schema, supported templates and storage contract. Review changes with the team.

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
export const profileFields = ['name','headline','email','phone','address','location','website','summary','photo'];
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
