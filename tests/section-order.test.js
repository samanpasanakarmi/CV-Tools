import test from 'node:test';
import assert from 'node:assert/strict';
import { blankCv, demoCv, normalizeCv, normalizeSectionOrder, defaultSectionOrder, moveSection, sectionOrderGroups, cvAsText, TEMPLATES } from '../src/model.js';
import { newVariant, normalizeVariant, composeCv } from '../src/workspace.js';
import { renderResume } from '../src/preview.js';

const fields=[{id:'award',label:'Awards',value:'Team prize'},{id:'volunteer',label:'Volunteering',value:'Event support'}];
const headings=html=>Array.from(html.matchAll(/<h2>(.*?)<\/h2>/g),m=>m[1]);

test('legacy, malformed and duplicate keys normalize without losing existing sections',()=>{
  const defaults=defaultSectionOrder(fields);
  assert.deepEqual(normalizeSectionOrder(null,fields),defaults);
  assert.deepEqual(normalizeSectionOrder(['education','education','__proto__',null,'custom:gone','custom:award'],fields),['education','custom:award',...defaults.filter(k=>!['education','custom:award'].includes(k))]);
  const legacy=normalizeVariant({id:'old',document:{customFields:fields}});
  assert.deepEqual(legacy.document.sectionOrder,defaults);
  assert.deepEqual(normalizeCv({version:1}).sectionOrder,defaultSectionOrder());
});
test('moving a section and adding/removing custom fields preserves other ordering',()=>{
  let order=moveSection(defaultSectionOrder(fields),fields,'education',-1);
  assert.deepEqual(order.slice(0,3),['summary','education','experience']);
  order=moveSection(order,fields,'custom:award',-1);
  assert.ok(order.indexOf('custom:award')<order.indexOf('certificates'));
  assert.deepEqual(moveSection(order,fields,'summary',-1),order);
  const remaining=[fields[1],{id:'new',label:'New',value:'Details'}];
  const next=normalizeSectionOrder(order,remaining);
  assert.deepEqual(next,[...order.filter(k=>k!=='custom:award'),'custom:new']);
});
test('section order persists in JSON, is independent per CV, and is used in PDF preview and TXT',()=>{
  const master=demoCv(),v=newVariant(master),other=newVariant(master);
  v.document.customFields=fields;
  v.document.sectionOrder=normalizeSectionOrder(['education','custom:award','summary','experience'],fields);
  const saved=normalizeVariant(JSON.parse(JSON.stringify(v)));
  assert.deepEqual(saved.document.sectionOrder,v.document.sectionOrder);
  assert.deepEqual(other.document.sectionOrder,defaultSectionOrder());
  for(const template of Object.keys(TEMPLATES).filter(t=>t!=='two-column')){
    saved.document.template=template;
    const cv=composeCv(master,saved);
    assert.deepEqual(headings(renderResume(cv)).slice(0,4),['Education','Awards','Profile','Work experience']);
    const txt=cvAsText(cv);
    assert.ok(txt.indexOf('EDUCATION')<txt.indexOf('AWARDS'));
    assert.ok(txt.indexOf('AWARDS')<txt.indexOf('PROFILE'));
    assert.ok(txt.indexOf('PROFILE')<txt.indexOf('WORK EXPERIENCE'));
    assert.deepEqual(normalizeCv(JSON.parse(JSON.stringify(cv))).sectionOrder,cv.sectionOrder);
  }
  const duplicate=structuredClone(saved);
  duplicate.document.sectionOrder.reverse();
  assert.notDeepEqual(duplicate.document.sectionOrder,saved.document.sectionOrder);
});
test('two-column layout reorders only within columns and TXT follows the same reading order',()=>{
  const master=demoCv(),v=newVariant(master);
  v.document.template='two-column';v.document.customFields=fields;
  const order=defaultSectionOrder(fields);
  const moved=moveSection(order,fields,'languages',-1,'two-column');
  assert.deepEqual(sectionOrderGroups(moved,fields,'two-column')[0].keys,['languages','skills','certificates']);
  assert.deepEqual(moveSection(moved,fields,'languages',-1,'two-column'),moved);
  v.document.sectionOrder=moveSection(moved,fields,'education',-1,'two-column');
  const cv=composeCv(master,v),html=renderResume(cv);
  assert.deepEqual(headings(html).slice(0,5),['Languages','Skills','Profile','Education','Work experience']);
  const txt=cvAsText(cv);
  assert.ok(txt.indexOf('LANGUAGES')<txt.indexOf('SKILLS'));
  assert.ok(txt.indexOf('EDUCATION')<txt.indexOf('WORK EXPERIENCE'));
});
test('empty or excluded sections do not render even if reordered',()=>{
  const cv=blankCv();
  cv.customFields=[{id:'empty',label:'Empty custom',value:''},{id:'safe',label:'<script>',value:'<img src=x onerror=alert(1)>'}];
  cv.sectionOrder=['custom:empty','education','custom:safe'];
  const html=renderResume(cv),txt=cvAsText(cv);
  assert.doesNotMatch(html,/Empty custom|<h2>Education|<script>|<img src=x/);
  assert.match(html,/&lt;script&gt;/);
  assert.doesNotMatch(txt,/EMPTY CUSTOM|EDUCATION/);
});
