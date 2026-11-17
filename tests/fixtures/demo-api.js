/**
 * In-memory, fictional demo workspace. Not authentication, not persistent storage.
 * Never use this adapter for real users or advertise it as cloud storage.
 */
import { demoCv, makeId } from '../../src/model.js';
import { newVariant } from '../../src/workspace.js';

export class DemoApi {
  constructor() {
    this.session={user:{id:'fictional-demo-account',email:'alex@example.com'}};
    this.master=demoCv();
    this.master.experience.push({id:'demo-work-2',role:'Customer Service Associate',organization:'Example Retail Oy',location:'Espoo',start:'May 2023',end:'May 2024',details:'Assisted customers in a busy multilingual environment\nResolved requests and handled daily operations',include:true});
    this.master.skills.push({id:'demo-skill-service',name:'Customer service',include:true});
    this.master.languages.push({id:'demo-language-2',name:'Finnish',level:'Intermediate',include:true});
    const software=newVariant(this.master,{title:'Software Developer — Nokia',company:'Nokia',target_role:'Junior Software Developer'});
    software.id='demo-cv-software';
    software.document.summary='IT graduate passionate about building reliable web applications and contributing to collaborative development teams.';
    software.document.included.experience=['demo-work-1'];
    software.document.included.skills=['demo-skill-0','demo-skill-1','demo-skill-2','demo-skill-3'];
    const service=newVariant(this.master,{title:'Customer Service — Finnair',company:'Finnair',target_role:'Customer Service Agent'});
    service.id='demo-cv-service';
    service.document.summary='Friendly, organized professional with hands-on customer service experience and a passion for helping people.';
    service.document.included.experience=['demo-work-2'];
    service.document.included.skills=['demo-skill-3','demo-skill-service'];
    service.document.template='classic';
    this.cvs=[software,service];
  }
  isConfigured(){return true;}
  get userId(){return this.session.user.id;}
  async getMaster(){return structuredClone(this.master);}
  async saveMaster(data){this.master=structuredClone(data);return {};}
  async listCvs(){return structuredClone(this.cvs);}
  async createCv(cv){const row=structuredClone(cv);row.id=makeId();this.cvs.unshift(row);return structuredClone(row);}
  async updateCv(cv){const index=this.cvs.findIndex(row=>row.id===cv.id);if(index<0)throw new Error('CV not found');this.cvs[index]=structuredClone(cv);return structuredClone(cv);}
  async deleteCv(id){this.cvs=this.cvs.filter(cv=>cv.id!==id);}
  async clearWorkspace(){this.master={version:1,profile:{name:'',email:'',phone:'',address:'',location:'',website:'',headline:'',summary:''},experience:[],education:[],projects:[],skills:[],languages:[],certificates:[],settings:{template:'modern',accent:'#235d80'}};this.cvs=[];}
  async signOut(){this.session=null;}
}
