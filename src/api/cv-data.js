// CRUD requests for job-specific CVs. Ownership remains enforced by SQL RLS.

export async function listCvs(client) {
  return await client.raw('/rest/v1/cvs?select=id,title,company,target_role,document,created_at,updated_at&order=updated_at.desc', { authorized: true }) || [];
}

export async function createCv(client, cv) {
  const rows = await client.raw('/rest/v1/cvs', {
    method: 'POST', authorized: true, prefer: 'return=representation',
    data: { user_id: client.userId, title: cv.title, company: cv.company, target_role: cv.target_role, document: cv.document }
  });
  if (!rows?.[0]) throw new Error('CV was not created.');
  return rows[0];
}

export async function updateCv(client, cv) {
  const rows = await client.raw(`/rest/v1/cvs?id=eq.${encodeURIComponent(cv.id)}`, {
    method: 'PATCH', authorized: true, prefer: 'return=representation',
    data: { title: cv.title, company: cv.company, target_role: cv.target_role, document: cv.document }
  });
  if (!rows?.length) throw new Error('This CV could not be updated.');
  return rows[0];
}

export async function deleteCv(client, id) {
  const rows = await client.raw(`/rest/v1/cvs?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE', authorized: true, prefer: 'return=representation' });
  if (!rows?.length) throw new Error('This CV could not be deleted.');
}
