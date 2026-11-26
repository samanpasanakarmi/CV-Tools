// Keep unsafe links, image data and HTML out of the rendered CV.

export function safePhoto(value) { return typeof value==='string' && value.length<=300000 && /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(value) ? value : ''; }

export function safeHref(value) {
  try { const u = new URL(value); return ['https:','http:'].includes(u.protocol) ? u.href : ''; }
  catch { return ''; }
}
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
