/**
 * Optional integration test against YOUR configured, real Supabase project.
 * Requires TWO disposable, EMPTY, already-confirmed accounts (see guide).
 * Run ONLY with CV_STUDIO_TEST_MODE=I_UNDERSTAND; it erases their CV content.
 * No test credentials may be committed or printed.
 */
import { CloudApi } from '../src/api.js';
import { newVariant } from '../src/workspace.js';
import { blankCv } from '../src/model.js';

const required = ['CV_STUDIO_SUPABASE_URL','CV_STUDIO_PUBLIC_KEY','CV_STUDIO_TEST_EMAIL_A',
  'CV_STUDIO_TEST_PASSWORD_A','CV_STUDIO_TEST_EMAIL_B','CV_STUDIO_TEST_PASSWORD_B'];
if (process.env.CV_STUDIO_TEST_MODE !== 'I_UNDERSTAND' || required.some(k=>!process.env[k])) {
  console.error('See docs/SECURITY_TESTS.md. Missing disposable account credentials or explicit test opt-in.');
  process.exit(2);
}
if (process.env.CV_STUDIO_TEST_EMAIL_A === process.env.CV_STUDIO_TEST_EMAIL_B) {
  throw new Error('Two distinct disposable accounts are required.');
}
const config={url:process.env.CV_STUDIO_SUPABASE_URL,publishableKey:process.env.CV_STUDIO_PUBLIC_KEY};
const a=new CloudApi(config),b=new CloudApi(config);
if (!a.isConfigured()) throw new Error('Invalid public Supabase config.');
const check=(value, message)=>{if(!value)throw new Error(`FAILED: ${message}`);console.log(`PASS: ${message}`);};
let generatedCvId=null, touched=false;
try {
  await a.signIn(process.env.CV_STUDIO_TEST_EMAIL_A,process.env.CV_STUDIO_TEST_PASSWORD_A);
  await b.signIn(process.env.CV_STUDIO_TEST_EMAIL_B,process.env.CV_STUDIO_TEST_PASSWORD_B);
  check(a.userId!==b.userId,'distinct authenticated accounts');
  check((await a.listCvs()).length===0 && (await b.listCvs()).length===0 &&
    !await a.getMaster() && !await b.getMaster(), 'both disposable test accounts start empty');
  const profile=blankCv();profile.profile.name='Synthetic Security Test';profile.profile.phone='000-TEST';
  await a.saveMaster(profile);touched=true;
  const cv=newVariant(profile,{title:'Synthetic Isolation Test',company:'Example Employer',target_role:'Tester'});
  const created=await a.createCv(cv);generatedCvId=created.id;
  check((await a.listCvs()).some(row=>row.id===created.id),'owner can read their own CV');
  check(!(await b.listCvs()).some(row=>row.id===created.id),'B cannot list A CV');
  check((await b.raw(`/rest/v1/cvs?id=eq.${created.id}&select=id`,{authorized:true})).length===0,'B cannot fetch A CV by ID');
  check((await b.raw(`/rest/v1/profiles?user_id=eq.${a.userId}&select=user_id`,{authorized:true})).length===0,'B cannot read A profile');
  let blocked=false;
  try {await b.raw('/rest/v1/cvs',{method:'POST',authorized:true,data:{user_id:a.userId,title:'Forged',company:'',target_role:'',document:{}},prefer:'return=representation'});}catch{blocked=true;}
  check(blocked,'B cannot create a CV owned by A');
  check((await b.raw(`/rest/v1/cvs?id=eq.${created.id}`,{method:'PATCH',authorized:true,data:{title:'tampered'},prefer:'return=representation'})).length===0,'B cannot edit A CV');
  check((await b.raw(`/rest/v1/cvs?id=eq.${created.id}`,{method:'DELETE',authorized:true,prefer:'return=representation'})).length===0,'B cannot delete A CV');
  check((await a.listCvs()).find(x=>x.id===created.id)?.title==='Synthetic Isolation Test','A CV remains intact');
  await a.signOut();
  await a.signIn(process.env.CV_STUDIO_TEST_EMAIL_A,process.env.CV_STUDIO_TEST_PASSWORD_A);
  check((await a.getMaster()).profile.phone==='000-TEST','data persists after logout and login');
  console.log('LIVE CHECKS PASSED. Clearing the disposable accounts\' CV data.');
} finally {
  if(touched){
    try {await a.clearWorkspace();console.log('A disposable test data cleared.');}
    catch{console.error('WARNING: A test data cleanup failed; clean it manually.');}
  }
  if(a.session)await a.signOut();
  if(b.session)await b.signOut();
}
