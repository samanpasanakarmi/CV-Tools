/**
 * Supabase client-only implicit email-link callback parsing.
 * Never persist, print, or log these tokens. The UI must clear URL hashes before
 * contacting the backend; the access token is checked via /auth/v1/user.
 */
export function parseAuthFragment(fragment = '') {
  const raw = String(fragment).replace(/^#/, '');
  const p = new URLSearchParams(raw);
  const error = p.get('error_description') || p.get('error') || '';
  if (error) return { kind: 'error', message: error.slice(0, 240) };
  if (!p.has('access_token') && !p.has('refresh_token')) return { kind: 'none' };
  if (!p.get('access_token') || !p.get('refresh_token'))
    return { kind: 'error', message: 'The email link is incomplete. Request a new link.' };
  const type = p.get('type') || '';
  return {
    kind: type === 'recovery' ? 'recovery' : 'session',
    access_token: p.get('access_token'),
    refresh_token: p.get('refresh_token'),
    expires_in: Math.max(1, Number(p.get('expires_in')) || 3600),
  };
}

export function appRedirectUrl(locationObject) {
  const u = new URL(locationObject.href);
  if (u.protocol !== 'https:' && !(['localhost', '127.0.0.1'].includes(u.hostname) && u.protocol === 'http:')) {
    throw new Error('Account email links require an HTTPS website (or localhost for testing).');
  }
  return `${u.origin}${u.pathname}`; // never include tokens, queries or fragments
}

export function safeErrorMessage(error) {
  return String(error?.message || 'A request failed. Please try again.').slice(0, 220);
}
