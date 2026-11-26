import { blankCv } from './profile.js';

// Fictional sample data for existing tests; not a login or offline demo.

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
