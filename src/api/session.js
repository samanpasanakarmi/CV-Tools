// In-memory session lifecycle and refresh/logout race protection.

export function setSession(client, data) {
  if (!data?.access_token || !data?.refresh_token || !data?.user?.id) {
    throw new Error('The authentication server did not return a complete session.');
  }
  client.session = {
    ...data, expires_at: Date.now() + Math.max(1, Number(data.expires_in) || 3600) * 1000
  };
}

export async function ensureSession(client) {
  if (!client.session) throw new Error('Please sign in again.');
  if (Date.now() < client.session.expires_at - 60000) return;
  if (!client.session.refresh_token) throw new Error('Session expired. Please sign in again.');
  if (!client.refreshPending) {
    const generation=client.sessionGeneration;
    client.refreshPending = client.raw('/auth/v1/token?grant_type=refresh_token', {
      method: 'POST', data: { refresh_token: client.session.refresh_token }
    }).then(response => {
      if(generation!==client.sessionGeneration)throw new Error('Session changed. Please sign in again.');
      client.setSession(response);
    }).catch(error => {
      if(generation===client.sessionGeneration)client.session = null;
      throw error;
    }).finally(() => { if(generation===client.sessionGeneration)client.refreshPending = null; });
  }
  await client.refreshPending;
}

export async function signOut(client) {
  const token = client.session?.access_token;
  client.sessionGeneration++;
  client.session = null;
  client.refreshPending = null;
  if (token) {
    try {
      await client.fetcher(`${client.url}/auth/v1/logout`, {
        method: 'POST', headers: { apikey: client.key, Authorization: `Bearer ${token}` }, cache: 'no-store', signal: AbortSignal.timeout(5000)
      });
    } catch { /* Local logout still happens even if the network is unavailable. */ }
  }
}
