import test from 'node:test';
import assert from 'node:assert/strict';
import { blankCv, demoCv, createItem, moveItem, normalizeCv, safeHref, cvAsText, escapeHtml, selectedItems } from '../src/model.js';
import { renderResume } from '../src/preview.js';

test('blank data has all required sections and settings',()=>{const cv=blankCv();assert.equal(cv.version,1);assert.equal(cv.experience.length,0);assert.equal(cv.settings.template,'modern');});
test('records can be reordered safely',()=>{const cv=blankCv();cv.skills=[{id:'1',name:'A',include:true},{id:'2',name:'B',include:true}];assert.equal(moveItem(cv,'skills','2',-1),true);assert.equal(cv.skills[0].name,'B');assert.equal(moveItem(cv,'skills','2',-1),false);});
test('new item contains the correct fields',()=>{const item=createItem('experience');assert.ok(item.id);assert.equal(item.role,'');assert.equal(item.include,true);});
test('import ignores unknown keys and rejects invalid versions',()=>{const clean=normalizeCv({...demoCv(),unknown:'unsafe',profile:{name:'Test',secret:'hidden'},settings:{template:'danger',accent:'expression(1)'}});assert.equal(clean.profile.name,'Test');assert.ok(!('secret' in clean.profile));assert.equal(clean.settings.template,'modern');assert.equal(clean.settings.accent,'#235d80');assert.ok(!('unknown' in clean));assert.throws(()=>normalizeCv({version:2}));});
test('excluded experience is hidden from preview and text',()=>{const cv=demoCv();cv.experience[0].include=false;assert.equal(selectedItems(cv,'experience').length,0);assert.ok(!renderResume(cv).includes('Web Development Intern'));assert.ok(!cvAsText(cv).includes('Web Development Intern'));});
test('HTML is escaped in preview',()=>{const cv=blankCv();cv.profile.name='<script>alert(1)</script>';cv.profile.summary='Hello <img src=x onerror=alert(1)>';const markup=renderResume(cv);assert.ok(markup.includes('&lt;script&gt;'));assert.ok(!markup.includes('<script>'));assert.ok(!markup.includes('<img'));assert.equal(escapeHtml('"'), '&quot;');});
test('dangerous URLs are not clickable',()=>{assert.equal(safeHref('javascript:alert(1)'), '');assert.equal(safeHref('data:text/html,hi'), '');assert.equal(safeHref('https://example.com').startsWith('https://'),true);const cv=blankCv();cv.profile.website='javascript:alert(1)';assert.ok(!renderResume(cv).includes('href="javascript:'));});
test('duplicate imported IDs are replaced',()=>{const cv=demoCv();cv.skills=[{id:'one',name:'A'},{id:'one',name:'B'}];const clean=normalizeCv(cv);assert.notEqual(clean.skills[0].id,clean.skills[1].id);});
test('JSON round trip retains CV data',()=>{const original=demoCv();const reloaded=normalizeCv(JSON.parse(JSON.stringify(original)));assert.deepEqual(reloaded,original);});
