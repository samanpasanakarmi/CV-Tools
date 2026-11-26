// Public Supabase client. Every operation uses this same in-memory session.
// API requests and data handling are split by responsibility.
import { isConfigured, raw } from './api/request.js';
import { setSession, ensureSession, signOut } from './api/session.js';
import { signIn, signUp, acceptEmailLink, requestPasswordReset, updatePassword } from './api/authentication.js';
import { getMaster, saveMaster, clearWorkspace } from './api/profile-data.js';
import { listCvs, createCv, updateCv, deleteCv } from './api/cv-data.js';
import { generateAiDraft } from './api/ai-data.js';

export class CloudApi {
  constructor(config, fetchImpl = (...args) => globalThis.fetch(...args)) {
    this.url = (config.url || '').replace(/\/$/, '');
    this.key = config.publishableKey || '';
    this.fetcher = fetchImpl;
    this.session = null;
    this.refreshPending = null;
    this.sessionGeneration = 0;
  }
  // Transport and session
  isConfigured() { return isConfigured(this); }
  raw(path, options) { return raw(this, path, options); }
  setSession(data) { return setSession(this, data); }
  ensureSession() { return ensureSession(this); }
  signOut() { return signOut(this); }
  get userId() { return this.session?.user?.id || null; }

  // Authentication and account actions
  signIn(email, password) { return signIn(this, email, password); }
  signUp(email, password, redirectTo) { return signUp(this, email, password, redirectTo); }
  acceptEmailLink(fragment) { return acceptEmailLink(this, fragment); }
  requestPasswordReset(email, redirectTo) { return requestPasswordReset(this, email, redirectTo); }
  updatePassword(password) { return updatePassword(this, password); }

  // Reusable profile and CV operations
  getMaster() { return getMaster(this); }
  saveMaster(data) { return saveMaster(this, data); }
  listCvs() { return listCvs(this); }
  createCv(cv) { return createCv(this, cv); }
  updateCv(cv) { return updateCv(this, cv); }
  deleteCv(id) { return deleteCv(this, id); }
  clearWorkspace() { return clearWorkspace(this); }

  // Experimental AI request (disabled in the core UI)
  generateAiDraft(input) { return generateAiDraft(this, input); }
}
