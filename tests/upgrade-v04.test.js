import test from 'node:test';
import assert from 'node:assert/strict';
import { demoCv } from '../src/model.js';
import { newVariant, normalizeVariant, composeCv } from '../src/workspace.js';
import { DemoApi } from './fixtures/demo-api.js';

test('contact details can be hidden for one CV only',()=>{
 const master=demoCv();
 const a=newVariant(master,{title:'CV A'}),b=newVariant(master,{title:'CV B'});
 a.document.contacts.phone=false;
 assert.equal(composeCv(master,a).profile.phone,'');
 assert.equal(composeCv(master,b).profile.phone,'+358 40 123 4567');
 assert.equal(master.profile.phone,'+358 40 123 4567');
});
test('old CV records without contacts remain compatible',()=>{
 const raw=newVariant(demoCv(),{title:'Older CV'});
 delete raw.document.contacts;
 const norm=normalizeVariant(raw);
 assert.equal(norm.document.contacts.phone,true);
 assert.equal(norm.document.contacts.email,true);
});
test('demo mode starts with two distinct job-specific CVs',async()=>{
 const api=new DemoApi();
 const rows=await api.listCvs();
 const master=await api.getMaster();
 assert.equal(rows.length,2);
 assert.notEqual(rows[0].company,rows[1].company);
 assert.equal(composeCv(master,rows[0]).profile.name,composeCv(master,rows[1]).profile.name);
 assert.deepEqual(composeCv(master,rows[0]).experience.filter(x=>x.include).map(x=>x.id),['demo-work-1']);
 assert.deepEqual(composeCv(master,rows[1]).experience.filter(x=>x.include).map(x=>x.id),['demo-work-2']);
});
test('demo creates, edits, duplicates and deletes independently',async()=>{
 const api=new DemoApi(), master=await api.getMaster();
 const created=await api.createCv(newVariant(master,{title:'Researcher',company:'Company X'}));
 assert.equal((await api.listCvs()).length,3);
 created.document.summary='Tailored to this role';
 await api.updateCv(created);
 const changed=(await api.listCvs()).find(x=>x.id===created.id);
 assert.equal(changed.document.summary,'Tailored to this role');
 assert.notEqual((await api.listCvs()).find(x=>x.company==='Nokia').document.summary,'Tailored to this role');
 await api.deleteCv(created.id);
 assert.equal((await api.listCvs()).length,2);
});
test('demo changes do not persist to a fresh demo session',async()=>{
 const a=new DemoApi();const master=await a.getMaster();master.profile.name='Changed Name';await a.saveMaster(master);
 assert.equal((await new DemoApi().getMaster()).profile.name,'Alex Morgan');
});
