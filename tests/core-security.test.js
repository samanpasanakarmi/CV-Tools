import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readFileSync } from 'node:fs';
import { CloudApi } from '../src/api.js';
import { createAppServer } from '../server.mjs';

test('a late refresh cannot restore a signed-out session',async()=>{
  let release;
  const pending=new Promise(resolve=>{release=resolve;});
  const credentials={user:{id:'a'},access_token:'a',refresh_token:'r',expires_in:1};
  const api=new CloudApi({url:'https://example.supabase.co',publishableKey:'sb_publishable_example'},async(url)=>{
    if(url.includes('grant_type=refresh_token'))return pending;
    return {ok:true,text:async()=>''};
  });
  api.setSession(credentials);
  const request=api.getMaster();
  const rejected=assert.rejects(request,/Session changed/);
  await api.signOut();
  release({ok:true,text:async()=>JSON.stringify({...credentials,expires_in:3600})});
  await rejected;
  assert.equal(api.session,null);
});

test('dev server serves assets but rejects private files and non-read methods',async(t)=>{
  const server=createAppServer().listen(0,'127.0.0.1');
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  await once(server,'listening');
  const base='http://127.0.0.1:'+server.address().port;
  assert.equal((await fetch(base+'/')).status,200);
  assert.equal((await fetch(base+'/src/app.js')).status,200);
  for(const path of ['/.git/config','/.env','/package.json','/docs/testing/SECURITY_TESTS.md','/supabase/schema.sql','/src/../package.json']){
    assert.equal((await fetch(base+path)).status,404,path);
  }
  assert.equal((await fetch(base+'/',{method:'POST'})).status,405);
});

test('core release keeps the AI UI hidden and backend disabled by default',()=>{
  const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
  assert.match(read('index.html'),/id="nav-ai"[^>]*hidden disabled/);
  assert.match(read('src/app.js'),/const AI_ENABLED = false/);
  assert.match(read('supabase/functions/ai-tailor-cv/index.ts'),/Deno\.env\.get\('AI_ENABLED'\)!=='true'/);
});
