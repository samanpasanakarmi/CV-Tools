import test from 'node:test';
import assert from 'node:assert/strict';
import {blankCv} from '../src/model.js';
import {newVariant, normalizeVariant, composeCv} from '../src/workspace.js';
import {makeReviewedAiVariant} from '../src/ai.js';
import {CloudApi} from '../src/api.js';
import {validateAiRequest,prepareProfileForAi,sanitizeAiResult,AI_RESULT_SCHEMA,AI_GROUPS}
  from '../supabase/functions/_shared/ai-contract.mjs';

const master=()=>{
 const p=blankCv();
 p.profile={...p.profile,name:'Private Person',phone:'0123456',email:'private@example.com',address:'Private Street 1',photo:'private-photo',headline:'Service specialist',summary:'Worked with customers.'};
 p.experience=[{id:'exp-1',role:'Cashier',organization:'Example Shop',start:'2022-02-01',end:'2024-04-15',location:'',details:'Served customers',include:true},
 {id:'exp-2',role:'Software tester',organization:'Tech Shop',start:'2024-04-16',end:'Present',location:'',details:'Wrote tests',include:true}];
 p.skills=[{id:'skill-1',name:'Customer service',include:true},{id:'skill-2',name:'JavaScript',include:true}];
 return p;
};
test('AI request requires consent, a role and a substantial job description',()=>{
 assert.throws(()=>validateAiRequest({targetRole:'Customer Service Representative',jobDescription:'We need customer support and attention to detail.',consent:false}),/consent/);
 assert.throws(()=>validateAiRequest({targetRole:'',jobDescription:'We need customer support and attention to detail.',consent:true}),/job title/);
 assert.throws(()=>validateAiRequest({targetRole:'Customer Service Representative',jobDescription:'short',consent:true}),/30/);
 assert.equal(validateAiRequest({targetRole:'Customer Service Representative',jobDescription:'We need customer support and attention to detail.',consent:true}).targetRole,'Customer Service Representative');
});
test('AI payload excludes dedicated personal contact fields and photos',()=>{
 const data=prepareProfileForAi(master()); const serialized=JSON.stringify(data);
 for(const secret of ['Private Person','private@example.com','Private Street 1','0123456','private-photo']) assert.ok(!serialized.includes(secret),secret);
 assert.deepEqual(data.skills.map(x=>x.id),['skill-1','skill-2']);
});
test('AI selects only real profile IDs and caps explanations',()=>{
 const profile=prepareProfileForAi(master());
 const raw={headline:'Customer Support',summary:'Customer service experience',recommended:{experience:['exp-1','random-unowned','exp-1'],skills:['skill-1','fake']},strengths:['Real strength'],gaps:['Missing certification']};
 const draft=sanitizeAiResult(raw,profile);
 assert.deepEqual(draft.recommended.experience,['exp-1']);
 assert.deepEqual(draft.recommended.skills,['skill-1']);
 assert.deepEqual(draft.recommended.projects,[]);
 assert.equal(draft.gaps[0],'Missing certification');
 assert.ok(AI_GROUPS.every(x=>Object.hasOwn(AI_RESULT_SCHEMA.properties.recommended.properties,x)));
});
test('reviewed AI CV is a NEW copy with editable summary, verified section selections, correct template',()=>{
 const p=master(), initial=newVariant(p,{title:'Original',company:'Original Co'});
 const reply={headline:'Suggested',summary:'Suggested summary',recommended:{experience:['exp-1'],skills:['skill-1']}};
 const created=makeReviewedAiVariant(p,{targetRole:'Customer Service Representative',company:'Employer A',template:'photo-header'},reply,{
 title:'Customer Service - Reviewed',summary:'Human verified this summary.',included:{experience:['exp-1','fake'],skills:['skill-1']}
 });
 assert.notEqual(created.id,initial.id);
 assert.equal(created.document.summary,'Human verified this summary.');
 assert.equal(created.document.template,'photo-header');
 assert.deepEqual(created.document.included.experience,['exp-1']);
 assert.deepEqual(initial.document.included.experience,['exp-1','exp-2']);
 const preview=composeCv(p,normalizeVariant(created));
 assert.deepEqual(preview.experience.filter(x=>x.include).map(x=>x.id),['exp-1']);
 assert.equal(preview.profile.name,'Private Person');
 assert.equal(preview.profile.summary,'Human verified this summary.');
});
test('CloudApi calls authenticated function without sending profile or API secret',async()=>{
 const calls=[];
 const api=new CloudApi({url:'https://example.supabase.co',publishableKey:'sb_publishable_public'},async (url,opts)=>{
   calls.push({url,opts});return {ok:true,text:async()=>JSON.stringify({draft:{headline:'Good'}})};
 });
 api.setSession({user:{id:'user-a'},access_token:'signed-in-jwt',refresh_token:'refresh',expires_in:3600});
 await api.generateAiDraft({targetRole:'Customer Service Representative',company:'',jobDescription:'We need customer support in a busy company.',consent:true});
 assert.match(calls[0].url,/\/functions\/v1\/ai-tailor-cv$/);
 assert.equal(calls[0].opts.headers.Authorization,'Bearer signed-in-jwt');
 const payload=JSON.parse(calls[0].opts.body);
 assert.deepEqual(Object.keys(payload).sort(),['company','consent','jobDescription','targetRole']);
});
test('public build does not contain a server-side OpenAI API key',async()=>{
 const {readFile}=await import('node:fs/promises');
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
 const app=await readFile(new URL('../src/app.js',import.meta.url),'utf8');
 assert.ok(html.includes('nav-ai'));
 assert.ok(app.includes('Generate suggestions'));
 assert.ok(!app.includes('OPENAI_API_KEY'));
});
