import test from 'node:test';
import assert from 'node:assert/strict';
import { blankCv, normalizeCv, cvAsText, normalizeCustomFields, TEMPLATES } from '../src/model.js';
import { newVariant, normalizeVariant, composeCv, createAutosave } from '../src/workspace.js';
import { renderResume } from '../src/preview.js';

test('custom fields persist on one CV, render across templates, and are included in TXT and JSON',()=>{
  const master=blankCv(),first=newVariant(master),second=newVariant(master);
  first.document.customFields=[{id:'a',label:'Driving licence',value:'Category B'},{id:'b',label:'Volunteering',value:'Event support\nTeam coordination'},{id:'c',label:'Incomplete',value:''}];
  const saved=normalizeVariant(JSON.parse(JSON.stringify(first)));
  const cv=composeCv(master,saved);
  assert.equal(cv.customFields.length,3);
  assert.deepEqual(composeCv(master,second).customFields,[]);
  assert.deepEqual(normalizeCv(JSON.parse(JSON.stringify(cv))).customFields,cv.customFields);
  for(const template of Object.keys(TEMPLATES)){
    saved.document.template=template;
    const html=renderResume(composeCv(master,saved));
    assert.match(html,/Driving licence/);
    assert.match(html,/Category B/);
    assert.match(html,/Event support<br>Team coordination/);
    assert.doesNotMatch(html,/Incomplete/);
  }
  assert.match(cvAsText(cv),/DRIVING LICENCE\nCategory B/);
  assert.doesNotMatch(cvAsText(cv),/INCOMPLETE/);
  const copy=structuredClone(saved);copy.document.customFields[0].value='Changed';
  assert.equal(saved.document.customFields[0].value,'Category B');
});
test('custom fields normalize untrusted content and render it as text',()=>{
  const fields=normalizeCustomFields(Array.from({length:25},()=>({id:'duplicate',label:'x'.repeat(100),value:'y'.repeat(3000)})));
  assert.equal(fields.length,20);
  assert.equal(new Set(fields.map(x=>x.id)).size,20);
  assert.equal(fields[0].label.length,80);
  assert.equal(fields[0].value.length,2000);
  const cv=blankCv();cv.customFields=[{id:'a',label:'<script>',value:'<img src=x onerror=alert(1)>'}];
  assert.match(renderResume(cv),/&lt;script&gt;/);
  assert.doesNotMatch(renderResume(cv),/<img src=x/);
  assert.deepEqual(normalizeVariant({id:'legacy',title:'Old',document:{}}).document.customFields,[]);
});
test('autosave batches edits and acknowledges only the saved snapshot',async()=>{
  let draft='first',saved='',release;
  const writes=[],states=[];
  const queue=createAutosave({delay:100000,read:()=>draft===saved?null:draft,write:async snapshot=>{
    writes.push(snapshot);
    if(writes.length===1)await new Promise(resolve=>{release=resolve;});
    saved=snapshot;
  },onStatus:s=>states.push(s)});
  queue.schedule();draft='second';queue.schedule();
  const first=queue.flush();await Promise.resolve();
  draft='third';queue.schedule();
  release();await first;
  assert.deepEqual(writes,['second']);assert.equal(saved,'second');
  await queue.flush();queue.cancel();
  assert.deepEqual(writes,['second','third']);assert.equal(states.at(-1),'saved');
});
test('autosave retains dirty data after failure and allows manual retry',async()=>{
  let dirty=true,fail=true;const states=[];
  const queue=createAutosave({delay:100000,read:()=>dirty?{data:1}:null,write:async()=>{if(fail)throw Error('Offline');dirty=false;},onStatus:s=>states.push(s)});
  queue.schedule();assert.equal(await queue.flush(),false);
  assert.equal(dirty,true);assert.equal(states.at(-1),'error');
  fail=false;assert.equal(await queue.flush(),true);
  assert.equal(states.at(-1),'saved');queue.cancel();
});
test('cancel prevents a scheduled write and invalid data stays unsaved',async()=>{
  let writes=0;const states=[];
  const queue=createAutosave({delay:5,read:()=>({data:1}),write:async()=>{writes++;const e=Error('Invalid date');e.validation=true;throw e;},onStatus:s=>states.push(s)});
  queue.schedule();queue.cancel();await new Promise(r=>setTimeout(r,25));assert.equal(writes,0);
  assert.equal(await queue.flush(),false);assert.equal(states.at(-1),'blocked');
});
