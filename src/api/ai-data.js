// Experimental server request. The core UI still disables AI.

export async function generateAiDraft(client, {targetRole, company='', jobDescription, consent}) {
  // The server fetches the caller's saved master profile with RLS; no profile is sent from the browser.
  return client.raw('/functions/v1/ai-tailor-cv', {
    method: 'POST', authorized: true,
    data: {targetRole,company,jobDescription,consent}
  });
}
