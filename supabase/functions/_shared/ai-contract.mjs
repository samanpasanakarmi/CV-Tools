// Portable, dependency-free contract shared by the Edge Function and Node tests.
export const AI_GROUPS = Object.freeze(['experience','education','projects','skills','languages','certificates']);
const FIELDS = Object.freeze({
  experience:['id','role','organization','location','start','end','details'],
  education:['id','qualification','organization','location','start','end','details'],
  projects:['id','name','details'],
  skills:['id','name'],
  languages:['id','name','level'],
  certificates:['id','name','issuer','year']
});
const text=(value,max)=>typeof value==='string' ? value.trim().slice(0,max) : '';
export function validateAiRequest(raw){
  if(!raw || typeof raw!=='object' || Array.isArray(raw)) throw new Error('Invalid AI request.');
  if(raw.consent !== true) throw new Error('You must consent before sending job and profile information to the AI provider.');
  const targetRole=text(raw.targetRole,121);
  const company=text(raw.company,121);
  const jobDescription=text(raw.jobDescription,10001);
  if(!targetRole || targetRole.length>120)throw new Error('Enter a job title (maximum 120 characters).');
  if(company.length>120)throw new Error('Company name is too long.');
  if(jobDescription.length<30 || jobDescription.length>10000)throw new Error('Paste a job description between 30 and 10,000 characters.');
  return {targetRole,company,jobDescription};
}
export function prepareProfileForAi(raw){
  if(!raw || raw.version!==1 || !raw.profile || typeof raw.profile!=='object')throw new Error('Saved profile not found. Fill in My Profile first.');
  const result={headline:text(raw.profile.headline,250),summary:text(raw.profile.summary,600)};
  let count=0;
  for(const group of AI_GROUPS){
    const seen=new Set();
    result[group]=(Array.isArray(raw[group])?raw[group]:[]).slice(0,50).flatMap(item=>{
      if(!item || typeof item!=='object')return [];
      const id=text(item.id,100);
      if(!id||seen.has(id))return [];
      seen.add(id);
      const cleaned={id};
      for(const field of FIELDS[group]) if(field!=='id') cleaned[field]=text(item[field],field==='details'?350:180);
      if(!Object.entries(cleaned).some(([key,val])=>key!=='id'&&val))return [];
      return [cleaned];
    }).slice(0,16);
    count+=result[group].length;
  }
  if(!count && !result.summary && !result.headline)throw new Error('Add some experience, education, skills or a summary to My Profile before using AI.');
  return result; // Never includes contact details, name, email, phone, address, website or profile photo.
}
export const AI_RESULT_SCHEMA={
  type:'object',additionalProperties:false,
  properties:{
    headline:{type:'string'},
    summary:{type:'string'},
    recommended:{type:'object',additionalProperties:false,properties:Object.fromEntries(AI_GROUPS.map(g=>[g,{type:'array',items:{type:'string'}}])),required:[...AI_GROUPS]},
    strengths:{type:'array',items:{type:'string'}},
    gaps:{type:'array',items:{type:'string'}}
  },
  required:['headline','summary','recommended','strengths','gaps']
};
export function sanitizeAiResult(raw,profile){
  if(!raw || typeof raw!=='object' || Array.isArray(raw))throw new Error('AI returned an invalid result.');
  if(!raw.recommended || typeof raw.recommended!=='object')throw new Error('AI did not include item selections.');
  const recommended={};
  for(const group of AI_GROUPS){
    const valid=new Set(profile[group].map(x=>x.id));
    const ids=Array.isArray(raw.recommended[group])?raw.recommended[group]:[];
    recommended[group]=[...new Set(ids.filter(id=>typeof id==='string'&&valid.has(id)))].slice(0,25);
  }
  const sanitizeList=items=>Array.isArray(items)?items.filter(x=>typeof x==='string').slice(0,5).map(x=>text(x,240)).filter(Boolean):[];
  return {headline:text(raw.headline,180),summary:text(raw.summary,1600),recommended,strengths:sanitizeList(raw.strengths),gaps:sanitizeList(raw.gaps)};
}
