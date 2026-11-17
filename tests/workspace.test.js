import test from 'node:test';
import assert from 'node:assert/strict';
import { blankCv, demoCv, createItem } from '../src/model.js';
import { newVariant, composeCv, normalizeVariant, toggleSelection } from '../src/workspace.js';
import { CloudApi } from '../src/api.js';

test('new CV reuses contact details without storing a copy in variant',()=>{
 const master=demoCv(); master.profile.address='Helsinki';
 const variant=newVariant(master,{title:'Support position',company:'Example Oy'});
 assert.equal('profile' in variant.document,false);
 const cv=composeCv(master,variant);
 assert.equal(cv.profile.name,'Alex Morgan');
 assert.equal(cv.profile.address,'Helsinki');
 assert.equal(cv.experience.length,1);
});

test('master contact edits propagate to existing CVs',()=>{
 const master=demoCv(), variant=newVariant(master,{title:'Software developer'});
 master.profile.phone='1234567';
 assert.equal(composeCv(master,variant).profile.phone,'1234567');
});

test('independent CVs may select different experiences and summaries',()=>{
 const master=demoCv(), item=createItem('experience');item.role='Support Agent';
 master.experience.push(item);
 const dev=newVariant(master,{title:'Developer'}),support=newVariant(master,{title:'Support'});
 toggleSelection(dev,'experience',item.id,false);
 toggleSelection(support,'experience',master.experience[0].id,false);
 dev.document.summary='Frontend developer focused on performance.';
 support.document.summary='Customer service professional.';
 assert.equal(composeCv(master,dev).experience.filter(x=>x.include).length,1);
 assert.equal(composeCv(master,support).experience.filter(x=>x.include).length,1);
 assert.notEqual(composeCv(master,dev).profile.summary,composeCv(master,support).profile.summary);
});

test('unknown CV fields are removed from normalized output',()=>{
 const v=newVariant(blankCv());v.document.password='never allowed';
 const clean=normalizeVariant(v);
 assert.equal(Object.hasOwn(clean.document,'password'),false);
});

test('CloudApi never accepts a secret key as browser configuration',()=>{
 assert.equal(new CloudApi({url:'https://demo.supabase.co',publishableKey:'sb_secret_bad'}).isConfigured(),false);
 assert.equal(new CloudApi({url:'http://demo.supabase.co',publishableKey:'sb_publishable_test'}).isConfigured(),false);
 assert.equal(new CloudApi({url:'https://demo.supabase.co',publishableKey:'sb_publishable_test'}).isConfigured(),true);
});

test('CloudApi uses authenticated bearer token but stores session in memory only',async()=>{
 const requests=[];
 const stub=async(url,options)=>{
   requests.push({url,...options});
   if(url.includes('/auth/v1/token'))return {ok:true,text:async()=>JSON.stringify({access_token:'test-token',refresh_token:'test-refresh',expires_in:3600,user:{id:'my-uid',email:'user@example.org'}})};
   if(url.includes('/rest/v1/profiles'))return {ok:true,text:async()=>JSON.stringify([{data:blankCv()}])};
   return {ok:true,text:async()=>JSON.stringify([])};
 };
 const api=new CloudApi({url:'https://demo.supabase.co',publishableKey:'sb_publishable_test'},stub);
 await api.signIn('user@example.org','test-password');
 await api.getMaster();
 assert.equal(requests[1].headers.Authorization,'Bearer test-token');
 assert.ok(requests[1].url.includes('user_id=eq.my-uid'));
 assert.equal(api.userId,'my-uid');
 await api.signOut();
 assert.equal(api.userId,null);
});

test('CloudApi refuses private data requests without session',async()=>{
 const api=new CloudApi({url:'https://demo.supabase.co',publishableKey:'sb_publishable_test'},async()=>{throw new Error('Should not call network');});
 await assert.rejects(()=>api.listCvs(),/sign in/i);
});
