import { parseAuthFragment } from '../auth-flow.js';

// Supabase account authentication, email links and password recovery.

export async function signIn(client, email, password) {
  const result = await client.raw('/auth/v1/token?grant_type=password', { method: 'POST', data: { email, password } });
  client.setSession(result);
  return result.user;
}

export async function signUp(client, email, password, redirectTo) {
  const suffix = redirectTo ? `?redirect_to=${encodeURIComponent(redirectTo)}` : '';
  const result = await client.raw(`/auth/v1/signup${suffix}`, { method: 'POST', data: { email, password } });
  if (result?.access_token) client.setSession(result);
  return Boolean(result?.access_token);
}

export async function acceptEmailLink(client, fragment) {
  const callback = parseAuthFragment(fragment);
  if (callback.kind === 'none') return callback;
  if (callback.kind === 'error') throw new Error(callback.message);
  const user = await client.raw('/auth/v1/user', { token: callback.access_token });
  client.setSession({ ...callback, user });
  return { kind: callback.kind, user };
}

export async function requestPasswordReset(client, email, redirectTo) {
  return client.raw(`/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`, { method: 'POST', data: { email } });
}

export async function updatePassword(client, password) {
  const user = await client.raw('/auth/v1/user', { method: 'PUT', authorized: true, data: { password } });
  if (client.session && user?.id) client.session.user = user;
  return user;
}
