// Shared HTTP transport: authorization, timeout, safe error and stale-session checks.

export function isConfigured(client) {
  try {
    const u = new URL(client.url);
    return u.protocol === 'https:' && !!client.key &&
      !/(?:sb_secret_|service_role|secret)/i.test(client.key) &&
      !u.username && !u.password && !u.search && !u.hash;
  } catch { return false; }
}

export async function raw(client, path, { method = 'GET', data, authorized = false, prefer, token } = {}) {
  const generation=client.sessionGeneration;
  const assertCurrent=()=>{if(generation!==client.sessionGeneration)throw new Error('Session changed. Please sign in again.');};
  const headers = { apikey: client.key, Accept: 'application/json' };
  if (data !== undefined) headers['Content-Type'] = 'application/json';
  if (prefer) headers.Prefer = prefer;
  if (authorized) {
    await client.ensureSession();
    assertCurrent();
    headers.Authorization = `Bearer ${client.session.access_token}`;
  } else if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await client.fetcher(`${client.url}${path}`, {
    method, headers, body: data === undefined ? undefined : JSON.stringify(data), cache: 'no-store', signal: AbortSignal.timeout(40000)
  });
  const content = await response.text();
  assertCurrent();
  let body = null;
  try { body = content ? JSON.parse(content) : null; } catch { body = null; }
  if (!response.ok) {
    const message = body?.msg || body?.message || body?.error_description || body?.error || `Server error ${response.status}`;
    throw new Error(String(message).slice(0, 240));
  }
  return body;
}
