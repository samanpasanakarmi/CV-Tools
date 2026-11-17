/**
 * Thin browser client for Supabase Auth and the PostgREST API.
 * Uses client-only implicit email links, with access/refresh tokens stored only
 * in JavaScript memory. Refreshing requires signing in again. Never ship keys
 * with elevated privileges; the SQL RLS policies are mandatory.
 */
import { parseAuthFragment } from './auth-flow.js';

export class CloudApi {
  constructor(config, fetchImpl = (...args) => globalThis.fetch(...args)) {
    this.url = (config.url || '').replace(/\/$/, '');
    this.key = config.publishableKey || '';
    this.fetcher = fetchImpl;
    this.session = null;
    this.refreshPending = null;
  }
  isConfigured() {
    try {
      const u = new URL(this.url);
      return u.protocol === 'https:' && !!this.key &&
        !/(?:sb_secret_|service_role|secret)/i.test(this.key) &&
        !u.username && !u.password && !u.search && !u.hash;
    } catch { return false; }
  }
  async raw(path, { method = 'GET', data, authorized = false, prefer, token } = {}) {
    const headers = { apikey: this.key, Accept: 'application/json' };
    if (data !== undefined) headers['Content-Type'] = 'application/json';
    if (prefer) headers.Prefer = prefer;
    if (authorized) {
      await this.ensureSession();
      headers.Authorization = `Bearer ${this.session.access_token}`;
    } else if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await this.fetcher(`${this.url}${path}`, {
      method, headers, body: data === undefined ? undefined : JSON.stringify(data), cache: 'no-store'
    });
    const content = await response.text();
    let body = null;
    try { body = content ? JSON.parse(content) : null; } catch { body = null; }
    if (!response.ok) {
      const message = body?.msg || body?.message || body?.error_description || body?.error || `Server error ${response.status}`;
      throw new Error(String(message).slice(0, 240));
    }
    return body;
  }
  setSession(data) {
    if (!data?.access_token || !data?.refresh_token || !data?.user?.id) {
      throw new Error('The authentication server did not return a complete session.');
    }
    this.session = {
      ...data, expires_at: Date.now() + Math.max(1, Number(data.expires_in) || 3600) * 1000
    };
  }
  async signIn(email, password) {
    const result = await this.raw('/auth/v1/token?grant_type=password', { method: 'POST', data: { email, password } });
    this.setSession(result);
    return result.user;
  }
  async signUp(email, password, redirectTo) {
    const suffix = redirectTo ? `?redirect_to=${encodeURIComponent(redirectTo)}` : '';
    const result = await this.raw(`/auth/v1/signup${suffix}`, { method: 'POST', data: { email, password } });
    if (result?.access_token) this.setSession(result);
    return Boolean(result?.access_token);
  }
  async acceptEmailLink(fragment) {
    const callback = parseAuthFragment(fragment);
    if (callback.kind === 'none') return callback;
    if (callback.kind === 'error') throw new Error(callback.message);
    const user = await this.raw('/auth/v1/user', { token: callback.access_token });
    this.setSession({ ...callback, user });
    return { kind: callback.kind, user };
  }
  async requestPasswordReset(email, redirectTo) {
    return this.raw(`/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`, { method: 'POST', data: { email } });
  }
  async updatePassword(password) {
    const user = await this.raw('/auth/v1/user', { method: 'PUT', authorized: true, data: { password } });
    if (this.session && user?.id) this.session.user = user;
    return user;
  }
  async ensureSession() {
    if (!this.session) throw new Error('Please sign in again.');
    if (Date.now() < this.session.expires_at - 60000) return;
    if (!this.session.refresh_token) throw new Error('Session expired. Please sign in again.');
    if (!this.refreshPending) {
      this.refreshPending = this.raw('/auth/v1/token?grant_type=refresh_token', {
        method: 'POST', data: { refresh_token: this.session.refresh_token }
      }).then(response => this.setSession(response)).catch(error => {
        this.session = null; throw error;
      }).finally(() => { this.refreshPending = null; });
    }
    await this.refreshPending;
  }
  async signOut() {
    const token = this.session?.access_token;
    this.session = null;
    this.refreshPending = null;
    if (token) {
      try {
        await this.fetcher(`${this.url}/auth/v1/logout`, {
          method: 'POST', headers: { apikey: this.key, Authorization: `Bearer ${token}` }, cache: 'no-store'
        });
      } catch { /* Local logout still happens even if the network is unavailable. */ }
    }
  }
  get userId() { return this.session?.user?.id || null; }
  async getMaster() {
    const rows = await this.raw(`/rest/v1/profiles?user_id=eq.${encodeURIComponent(this.userId)}&select=data`, { authorized: true });
    return rows?.[0]?.data || null;
  }
  async saveMaster(data) {
    if (!this.userId) throw new Error('Not signed in');
    return this.raw('/rest/v1/profiles?on_conflict=user_id', {
      method: 'POST', authorized: true, prefer: 'resolution=merge-duplicates,return=minimal',
      data: { user_id: this.userId, data }
    });
  }
  async listCvs() {
    return await this.raw('/rest/v1/cvs?select=id,title,company,target_role,document,created_at,updated_at&order=updated_at.desc', { authorized: true }) || [];
  }
  async createCv(cv) {
    const rows = await this.raw('/rest/v1/cvs', {
      method: 'POST', authorized: true, prefer: 'return=representation',
      data: { user_id: this.userId, title: cv.title, company: cv.company, target_role: cv.target_role, document: cv.document }
    });
    if (!rows?.[0]) throw new Error('CV was not created.');
    return rows[0];
  }
  async updateCv(cv) {
    const rows = await this.raw(`/rest/v1/cvs?id=eq.${encodeURIComponent(cv.id)}`, {
      method: 'PATCH', authorized: true, prefer: 'return=representation',
      data: { title: cv.title, company: cv.company, target_role: cv.target_role, document: cv.document }
    });
    if (!rows?.length) throw new Error('This CV could not be updated.');
    return rows[0];
  }
  async deleteCv(id) {
    const rows = await this.raw(`/rest/v1/cvs?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE', authorized: true, prefer: 'return=representation' });
    if (!rows?.length) throw new Error('This CV could not be deleted.');
  }
  async generateAiDraft({targetRole, company='', jobDescription, consent}) {
    // The server fetches the caller's saved master profile with RLS; no profile is sent from the browser.
    return this.raw('/functions/v1/ai-tailor-cv', {
      method: 'POST', authorized: true,
      data: {targetRole,company,jobDescription,consent}
    });
  }
  async clearWorkspace() {
    // Atomic SQL function, SECURITY INVOKER. Never deletes the Auth account.
    return this.raw('/rest/v1/rpc/clear_my_cv_data', { method: 'POST', authorized: true, data: {} });
  }
}
