import test from 'node:test';
import assert from 'node:assert/strict';
import { blankCv, normalizeCv, isIsoDate, displayDate, validateExperience, safePhoto, TEMPLATES, demoCv, cvAsText } from '../src/model.js';
import { newVariant, normalizeVariant, composeCv } from '../src/workspace.js';
import { renderResume } from '../src/preview.js';

const jpeg = 'data:image/jpeg;base64,' + Buffer.from('faux image bytes').toString('base64');
test('work experiences use exact valid calendar dates, including leap days',()=>{
 assert.equal(isIsoDate('2024-02-29'),true);
 assert.equal(isIsoDate('2025-02-29'),false);
 assert.equal(isIsoDate('2026-13-01'),false);
 assert.equal(isIsoDate('Jun 2025'),false);
 assert.equal(displayDate('2025-08-09'),'09/08/2025');
 assert.equal(displayDate('Jun 2025'),'Jun 2025');
});
test('work date validation handles ongoing jobs, missing values, and impossible ranges',()=>{
 const work={role:'Engineer',organization:'Example Oy',start:'2026-01-01',end:'Present'};
 assert.equal(validateExperience([work]),'');
 assert.match(validateExperience([{...work,start:'Jan 2026'}]),/start date/);
 assert.match(validateExperience([{...work,end:''}]),/end date/);
 assert.match(validateExperience([{...work,end:'2025-12-31'}]),/end date cannot/);
 assert.equal(validateExperience([{...work,end:'2026-12-31'}]),'');
});
test('all six templates survive normalization, including older classic variants',()=>{
 assert.equal(Object.keys(TEMPLATES).length,6);
 const master=demoCv();
 for(const template of Object.keys(TEMPLATES)){
  const variant=newVariant(master);variant.document.template=template;
  const normalized=normalizeVariant(variant);
  assert.equal(normalized.document.template,template);
  assert.match(renderResume(composeCv(master,normalized)),new RegExp(`class="cv-page ${template}"`));
 }
 const v=newVariant(master);v.document.template='malicious';
 assert.equal(normalizeVariant(v).document.template,'modern');
});
test('photo only appears in explicitly photo-capable templates and can be disabled on a CV',()=>{
 const master=blankCv();master.profile.photo=jpeg;master.profile.name='Jordan Example';
 const v=newVariant(master);v.document.template='modern';
 assert.doesNotMatch(renderResume(composeCv(master,v)),/<img/);
 v.document.template='photo-sidebar';
 assert.match(renderResume(composeCv(master,v)),/<img class="cv-photo"/);
 v.document.showPhoto=false;
 assert.doesNotMatch(renderResume(composeCv(master,v)),/<img/);
 v.document.showPhoto=true;v.document.template='photo-header';
 assert.match(renderResume(composeCv(master,v)),/<img class="cv-photo"/);
});
test('photo field only accepts small JPEG data and never arbitrary HTML or external URL',()=>{
 assert.equal(safePhoto('https://some-site.example/photo.jpg'),'');
 assert.equal(safePhoto('data:image/svg+xml;base64,PHN2Zz4='),'');
 assert.equal(safePhoto('data:image/jpeg;base64,AAA" onerror="alert(1)'),'');
 assert.equal(normalizeCv({version:1,profile:{photo:'javascript:alert(1)'}}).profile.photo,'');
 assert.equal(normalizeCv({version:1,profile:{photo:jpeg}}).profile.photo,jpeg);
 assert.equal(safePhoto('data:image/jpeg;base64,'+'A'.repeat(300001)),'');
});
test('text export and HTML preview show exact DD/MM/YYYY, while old dates are preserved',()=>{
 const cv=demoCv();
 assert.match(cvAsText(cv),/02\/06\/2025/);
 assert.match(renderResume(cv),/02\/06\/2025/);
 cv.experience[0].start='Jun 2025';
 assert.match(renderResume(cv),/Jun 2025/);
});
test('optional photo and date survive cloud profile normalization without changing old CVs',()=>{
 const master=demoCv();master.profile.photo=jpeg;
 const saved=normalizeCv(master);
 const v=newVariant(saved);v.document.template='photo-sidebar';
 assert.equal(composeCv(saved,v).profile.photo,jpeg);
 assert.equal(composeCv(saved,v).experience[0].start,'2025-06-02');
 const legacy=newVariant(saved);delete legacy.document.showPhoto;
 assert.equal(normalizeVariant(legacy).document.showPhoto,true);
});
