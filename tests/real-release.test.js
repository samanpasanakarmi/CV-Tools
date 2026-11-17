import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

test('real website has no fictional login or offline demo entry points',()=>{
  assert.match(html,/id="auth-form"/);
  assert.match(html,/id="setup-screen"/);
  assert.doesNotMatch(html,/id="demo-from-|id="reset-demo"|id="demo-banner"/);
  assert.doesNotMatch(app,/DemoApi|enterDemo|isDemo|demo-from-/);
  assert.equal(existsSync(new URL('../src/demo-api.js',import.meta.url)),false);
});

test('real site prevents false database saving when unconfigured',()=>{
  assert.match(app,/if\(!api\.isConfigured\(\)\)/);
  assert.match(app,/show\('setup-screen'\)/);
  assert.match(app,/await api\.saveMaster\(master\)/);
  assert.match(app,/await api\.createCv\(draft\)/);
});
