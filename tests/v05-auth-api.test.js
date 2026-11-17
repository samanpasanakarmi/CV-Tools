import test from 'node:test';
import assert from 'node:assert/strict';
import { CloudApi } from '../src/api.js';
import { parseAuthFragment, appRedirectUrl } from '../src/auth-flow.js';

const conf = {url:'https://school-demo.supabase.co',publishableKey:'sb_publishable_example'};
const user = {id:'11111111-1111-4111-8111-111111111111',email:'student@example.com'};
const credentials = {access_token:'access',refresh_token:'refresh',expires_in:3600,user};
const send = value => new Response(JSON.stringify(value),{status:200,headers:{'content-type':'application/json'}});

test('email callback distinguishes confirmed session, recovery, and broken links',()=>{
  const link='#access_token=a&refresh_token=r&type=recovery&expires_in=600';
  assert.deepEqual(parseAuthFragment(link),{kind:'recovery',access_token:'a',refresh_token:'r',expires_in:600});
  assert.equal(parseAuthFragment('#type=signup').kind,'none');
  assert.equal(parseAuthFragment('#access_token=only').kind,'error');
  assert.equal(parseAuthFragment('#error=access_denied&error_description=Expired+link').message,'Expired link');
});

test('callback URL never includes search parameters or tokens',()=>{
  assert.equal(appRedirectUrl({href:'https://example.org/app/?token=abc#access_token=secret'}),'https://example.org/app/');
  assert.equal(appRedirectUrl({href:'http://127.0.0.1:4173/?q=abc'}),'http://127.0.0.1:4173/');
  assert.throws(()=>appRedirectUrl({href:'http://example.org/'}),/HTTPS/);
  assert.throws(()=>appRedirectUrl({href:'file:///home/cv.html'}),/HTTPS/);
});

test('signup sends a safe redirect and never writes a password to the URL',async()=>{
  let call;
  const api=new CloudApi(conf, async (url,opts)=>{call={url,opts};return send({id:user.id,email:user.email});});
  assert.equal(await api.signUp(user.email,'test-password-123','https://cv.example.org/cv-studio/'),false);
  assert.match(call.url,/redirect_to=https%3A%2F%2Fcv.example.org%2Fcv-studio%2F/);
  assert.ok(!call.url.includes('test-password-123'));
  assert.equal(JSON.parse(call.opts.body).password,'test-password-123');
  assert.equal(api.userId,null);
});

test('recovery request is unauthenticated and password reset uses an authenticated PUT',async()=>{
  const calls=[];
  const api=new CloudApi(conf,async(url,opts)=>{
    calls.push({url,opts});
    return send(url.includes('/recover')?{}:user);
  });
  await api.requestPasswordReset(user.email,'https://example.com/');
  assert.match(calls[0].url,/auth\/v1\/recover/);
  assert.equal(calls[0].opts.headers.Authorization,undefined);
  await assert.rejects(()=>api.updatePassword('strong-password-123'),/sign in/);
  api.setSession(credentials);
  await api.updatePassword('new-strong-password-123');
  assert.match(calls.at(-1).url,/\/auth\/v1\/user$/);
  assert.equal(calls.at(-1).opts.method,'PUT');
  assert.equal(calls.at(-1).opts.headers.Authorization,'Bearer access');
  assert.equal(JSON.parse(calls.at(-1).opts.body).password,'new-strong-password-123');
});

test('email tokens are only trusted after verifying the user with Supabase Auth',async()=>{
  const requests=[];
  const api=new CloudApi(conf,async(url,opts)=>{
    requests.push({url,opts});
    return send(user);
  });
  const result=await api.acceptEmailLink('#access_token=from_email&refresh_token=refresh_from_email&type=recovery');
  assert.equal(result.kind,'recovery');
  assert.equal(api.userId,user.id);
  assert.equal(requests[0].opts.headers.Authorization,'Bearer from_email');
  const invalid=new CloudApi(conf,async()=>new Response('{"message":"Invalid JWT"}',{status:401}));
  await assert.rejects(()=>invalid.acceptEmailLink('#access_token=bad&refresh_token=r&type=recovery'),/Invalid JWT/);
  assert.equal(invalid.userId,null);
});

test('private CV data and atomic erase function require valid authorization',async()=>{
  const requests=[];
  const api=new CloudApi(conf,async(url,opts)=>{
    requests.push({url,opts});return send([]);
  });
  await assert.rejects(()=>api.clearWorkspace(),/sign in/);
  api.setSession(credentials);
  await api.clearWorkspace();
  assert.match(requests.at(-1).url,/\/rest\/v1\/rpc\/clear_my_cv_data$/);
  assert.equal(requests.at(-1).opts.headers.Authorization,'Bearer access');
  assert.equal(requests.at(-1).opts.method,'POST');
});

test('expired sessions refresh before private CV reads and logout clears memory',async()=>{
  const requests=[];
  const api=new CloudApi(conf,async(url,opts)=>{
    requests.push({url,opts});
    if(url.includes('grant_type=refresh_token'))return send({...credentials,access_token:'updated_access'});
    if(url.includes('/rest/v1/profiles'))return send([{data:{version:1,profile:{name:'Test User'}}}]);
    return send({});
  });
  api.setSession({...credentials,expires_in:1});
  const value=await api.getMaster();
  assert.equal(value.profile.name,'Test User');
  assert.equal(requests[0].opts.headers.Authorization,undefined);
  assert.equal(requests[1].opts.headers.Authorization,'Bearer updated_access');
  await api.signOut();
  assert.equal(api.userId,null);
});

test('configuration rejects service role and secret keys',()=>{
  assert.equal(new CloudApi({url:conf.url,publishableKey:'sb_secret_not_safe'}).isConfigured(),false);
  assert.equal(new CloudApi({url:conf.url,publishableKey:'service_role'}).isConfigured(),false);
  assert.equal(new CloudApi(conf).isConfigured(),true);
});
