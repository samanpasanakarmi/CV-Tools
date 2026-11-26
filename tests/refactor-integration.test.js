import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, posix } from 'node:path';
import { spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { PUBLIC_FILES } from '../scripts/public-files.mjs';
import { createAppServer } from '../server.mjs';
import { blankCv } from '../src/model.js';
import { newVariant } from '../src/workspace.js';
import { state, AI_ENABLED } from '../src/state.js';
import { autosave } from '../src/controllers/saving.js';

const root=fileURLToPath(new URL('../',import.meta.url));
async function walk(dir,prefix=''){
  const entries=await readdir(dir,{withFileTypes:true});
  const paths=await Promise.all(entries.map(entry=>{
    const path=prefix+entry.name;
    return entry.isDirectory()?walk(join(dir,entry.name),path+'/'):[path];
  }));
  return paths.flat();
}

test('public modules and CSS imports are explicitly listed and load from local server and build',async(t)=>{
  const allowed=new Set(PUBLIC_FILES);
  assert.equal(allowed.size,PUBLIC_FILES.length);
  for(const file of PUBLIC_FILES){
    assert.match(file,/^(index\.html|styles\.css|assets\/favicon\.svg|src\/[\w/-]+\.js|styles\/[\w-]+\.css)$/);
    const source=await readFile(join(root,file),'utf8');
    if(file.endsWith('.js')){
      for(const match of source.matchAll(/\bfrom\s+['"](\.\.?\/[^'"]+)['"]/g)){
        assert.ok(allowed.has(posix.normalize(posix.join(posix.dirname(file),match[1]))),file+' → '+match[1]);
      }
    }
    if(file.endsWith('.css')){
      for(const match of source.matchAll(/@import\s+url\(["']([^"']+)["']\)/g)){
        assert.ok(allowed.has(posix.normalize(posix.join(posix.dirname(file),match[1]))),file+' → '+match[1]);
      }
    }
  }

  const server=createAppServer().listen(0,'127.0.0.1');
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  await once(server,'listening');
  const base='http://127.0.0.1:'+server.address().port;
  for(const file of PUBLIC_FILES){
    const response=await fetch(base+'/'+file);
    assert.equal(response.status,200,file);
    assert.equal(await response.text(),await readFile(join(root,file),'utf8'),file);
  }
  for(const file of ['scripts/public-files.mjs','scripts/check.mjs','docs/technical/CODE_GUIDE.md','tests/refactor-integration.test.js','supabase/schema.sql']){
    assert.equal((await fetch(base+'/'+file)).status,404,file);
  }

  const build=spawnSync(process.execPath,['scripts/build.mjs'],{cwd:root,encoding:'utf8'});
  assert.equal(build.status,0,build.stderr);
  const actual=await walk(join(root,'dist'));
  assert.deepEqual(actual.sort(),[...PUBLIC_FILES,'.nojekyll'].sort());
  for(const file of PUBLIC_FILES)assert.deepEqual(await readFile(join(root,'dist',file)),await readFile(join(root,file)),file);
});

// Minimal DOM harness: exercises real entry-point wiring and feature controllers
// without pretending to be a browser rendering or live Supabase test.
test('core controllers preserve login, profile saving, CV editing and logout behavior',async(t)=>{
  const nodes=new Map();
  const makeNode=()=>({
    hidden:false,disabled:false,inert:false,value:'',innerHTML:'',textContent:'',dataset:{},
    classList:{toggle(){}},
    listeners:new Map(),
    addEventListener(name,fn){this.listeners.set(name,fn);},
    replaceChildren(){this.innerHTML='';this.textContent='';},
    reset(){},close(){},querySelectorAll(){return [];},
    async fire(name,event={}){const listener=this.listeners.get(name);assert.ok(listener,name);return listener(event);}
  });
  const el=id=>{
    if(!nodes.has(id))nodes.set(id,makeNode());
    return nodes.get(id);
  };
  const oldDocument=globalThis.document,oldWindow=globalThis.window,oldApi=state.api;
  globalThis.document={getElementById:el};
  globalThis.window={location:{hash:''},addEventListener(){}};
  t.after(()=>{autosave.cancel();state.api=oldApi;globalThis.document=oldDocument;globalThis.window=oldWindow;});

  const profile=blankCv();
  profile.profile.name='Fictional Example';
  const cv=newVariant(profile,{title:'Test CV'});
  const writes=[];
  state.api={
    userId:'fake-user',session:null,
    isConfigured:()=>true,
    async signIn(){this.session={user:{email:'fake@example.invalid'}};},
    async getMaster(){return structuredClone(profile);},
    async listCvs(){return [structuredClone(cv)];},
    async saveMaster(snapshot){writes.push(['profile',structuredClone(snapshot)]);},
    async updateCv(snapshot){writes.push(['cv',structuredClone(snapshot)]);return structuredClone(snapshot);},
    async signOut(){this.session=null;}
  };
  await import('../src/app.js');
  assert.equal(AI_ENABLED,false);
  assert.equal(el('nav-ai').hidden,true);
  assert.equal(el('auth-screen').hidden,false);
  el('auth-email').value='fake@example.invalid';
  el('auth-password').value='not-a-real-password';
  await el('auth-form').fire('submit',{preventDefault(){}});
  assert.equal(el('workspace').hidden,false);
  assert.equal(state.screen,'dashboard');
  assert.match(el('dashboard-panel').innerHTML,/Fictional/);
  await el('nav-profile').fire('click');
  assert.equal(state.screen,'profile');
  assert.match(el('profile-panel').innerHTML,/Fictional Example/);
  await el('profile-panel').fire('input',{target:{dataset:{kind:'profile',key:'headline'},value:'Test headline'}});
  await autosave.flush();
  assert.equal(writes.at(-1)[0],'profile');
  assert.equal(writes.at(-1)[1].profile.headline,'Test headline');
  assert.equal(state.dirtyMaster,false);
  await el('nav-cvs').fire('click');
  await el('cvs-panel').fire('click',{target:{closest:()=>({dataset:{action:'open',id:cv.id}})}});
  assert.equal(state.screen,'editor');
  assert.match(el('variant-panel').innerHTML,/Custom fields/);
  await el('variant-panel').fire('click',{target:{closest:()=>({dataset:{action:'add-custom'}})}});
  const id=state.active.document.customFields[0].id;
  for(const [key,value] of [['label','Awards'],['value','Fictional award']]){
    await el('variant-panel').fire('input',{target:{dataset:{kind:'custom',id,key},value}});
  }
  assert.match(el('preview').innerHTML,/Fictional award/);
  await autosave.flush();
  assert.equal(writes.at(-1)[0],'cv');
  assert.equal(writes.at(-1)[1].document.customFields[0].label,'Awards');
  await el('signout').fire('click');
  assert.equal(state.master.profile.name,'');
  assert.equal(state.active,null);
  assert.deepEqual(state.variants,[]);
  assert.equal(el('workspace').hidden,true);
  assert.equal(el('preview').innerHTML,'');
});
