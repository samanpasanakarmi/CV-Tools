import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
import { PUBLIC_FILES } from '../scripts/public-files.mjs';
const read = path => readFileSync(new URL('../'+path,import.meta.url),'utf8');
const app=PUBLIC_FILES.filter(path=>path.endsWith('.js')).map(read).join('\n');
const auth=read('src/controllers/auth.js');
const cvs=read('src/controllers/cvs.js');

test('real website has no fictional login or offline demo entry points',()=>{
  assert.match(html,/id="auth-form"/);
  assert.match(html,/id="setup-screen"/);
  assert.doesNotMatch(html,/id="demo-from-|id="reset-demo"|id="demo-banner"/);
  assert.doesNotMatch(app,/DemoApi|enterDemo|isDemo|demo-from-/);
  assert.equal(existsSync(new URL('../src/demo-api.js',import.meta.url)),false);
});

test('real site prevents false database saving when unconfigured',()=>{
  assert.match(auth,/if\(!state\.api\.isConfigured\(\)\)/);
  assert.match(auth,/show\('setup-screen'\)/);
  assert.match(cvs,/await state\.api\.saveMaster\(state\.master\)/);
  assert.match(cvs,/await state\.api\.createCv\(draft\)/);
});
