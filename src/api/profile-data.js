// Read/write the reusable profile and erase the current user's CV workspace.

export async function getMaster(client) {
  const rows = await client.raw(`/rest/v1/profiles?user_id=eq.${encodeURIComponent(client.userId)}&select=data`, { authorized: true });
  return rows?.[0]?.data || null;
}

export async function saveMaster(client, data) {
  if (!client.userId) throw new Error('Not signed in');
  return client.raw('/rest/v1/profiles?on_conflict=user_id', {
    method: 'POST', authorized: true, prefer: 'resolution=merge-duplicates,return=minimal',
    data: { user_id: client.userId, data }
  });
}

export async function clearWorkspace(client) {
  // Atomic SQL function, SECURITY INVOKER. Never deletes the Auth account.
  return client.raw('/rest/v1/rpc/clear_my_cv_data', { method: 'POST', authorized: true, data: {} });
}
