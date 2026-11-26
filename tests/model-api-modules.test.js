import test from 'node:test';
import assert from 'node:assert/strict';
import * as model from '../src/model.js';
import { CloudApi } from '../src/api.js';
import { blankCv, normalizeCv } from '../src/model/profile.js';
import { safeHref } from '../src/model/safety.js';
import { cvAsText } from '../src/model/text-export.js';

test('model entry point preserves every existing public export', () => {
  const expected = [
    'STORAGE_KEY', 'SECTIONS', 'TEMPLATES', 'PHOTO_TEMPLATES',
    'safePhoto', 'isIsoDate', 'displayDate', 'validateExperience', 'makeId',
    'CUSTOM_FIELD_LIMIT', 'CUSTOM_LABEL_LIMIT', 'CUSTOM_VALUE_LIMIT',
    'normalizeCustomFields', 'visibleCustomFields', 'DEFAULT_SECTION_ORDER',
    'SIDEBAR_SECTIONS', 'defaultSectionOrder', 'normalizeSectionOrder',
    'sectionOrderGroups', 'moveSection', 'blankCv', 'demoCv', 'normalizeCv',
    'createItem', 'moveItem', 'selectedItems', 'safeHref', 'escapeHtml', 'cvAsText'
  ];
  assert.deepEqual(Object.keys(model).sort(), expected.sort());
  assert.equal(model.blankCv, blankCv);
  assert.equal(model.normalizeCv, normalizeCv);
  assert.equal(model.safeHref, safeHref);
  assert.equal(model.cvAsText, cvAsText);
  assert.deepEqual(normalizeCv(blankCv()), blankCv());
});

test('CloudApi retains its public methods and getter', () => {
  const methods = [
    'constructor', 'isConfigured', 'raw', 'setSession', 'signIn', 'signUp',
    'acceptEmailLink', 'requestPasswordReset', 'updatePassword', 'ensureSession',
    'signOut', 'userId', 'getMaster', 'saveMaster', 'listCvs', 'createCv',
    'updateCv', 'deleteCv', 'generateAiDraft', 'clearWorkspace'
  ];
  assert.deepEqual(Object.getOwnPropertyNames(CloudApi.prototype).sort(), methods.sort());
  assert.equal(typeof Object.getOwnPropertyDescriptor(CloudApi.prototype, 'userId').get, 'function');
});

test('API modules share one session and one refresh across concurrent data requests', async () => {
  const calls = [];
  const reply = data => ({ ok: true, text: async () => JSON.stringify(data) });
  const api = new CloudApi({
    url: 'https://example.supabase.co/',
    publishableKey: 'sb_publishable_example'
  }, async (url, options) => {
    calls.push({ url, options });
    if (url.includes('grant_type=refresh_token')) {
      return reply({
        user: { id: 'example-user' }, access_token: 'new-token',
        refresh_token: 'new-refresh', expires_in: 3600
      });
    }
    if (url.includes('/profiles?')) return reply([{ data: blankCv() }]);
    return reply([]);
  });
  api.setSession({
    user: { id: 'example-user' }, access_token: 'old-token',
    refresh_token: 'old-refresh', expires_in: 1
  });
  const [profile, cvs] = await Promise.all([api.getMaster(), api.listCvs()]);
  assert.deepEqual(profile, blankCv());
  assert.deepEqual(cvs, []);
  assert.equal(calls.filter(call => call.url.includes('grant_type=refresh_token')).length, 1);
  const dataCalls = calls.filter(call => call.url.includes('/rest/v1/'));
  assert.equal(dataCalls.length, 2);
  for (const { options } of dataCalls) {
    assert.equal(options.headers.Authorization, 'Bearer new-token');
    assert.equal(options.cache, 'no-store');
  }
  await api.clearWorkspace();
  const last = calls.at(-1);
  assert.match(last.url, /\/rest\/v1\/rpc\/clear_my_cv_data$/);
  assert.equal(last.options.method, 'POST');
  assert.deepEqual(JSON.parse(last.options.body), {});
  await api.signOut();
  assert.equal(api.session, null);
  assert.equal(api.userId, null);
  await assert.rejects(api.listCvs(), /Please sign in again/);
});
