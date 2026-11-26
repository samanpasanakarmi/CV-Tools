import { escapeHtml as esc } from '../model.js';
import { safeErrorMessage } from '../auth-flow.js';
// Shared DOM utilities. User-provided text is escaped before insertion into HTML.
export const el = id => document.getElementById(id);

export const field = (name,label,value,attrs={},multi=false) => {
  const props=Object.entries(attrs).map(([k,v])=>`data-${k}="${esc(v)}"`).join(' ');
  const safe=esc(value??'');
  return `<label class="field"><span>${esc(label)}</span>${multi?`<textarea ${props} rows="3" maxlength="6000" placeholder="${esc(label)}">${safe}</textarea>`:`<input ${props} type="text" value="${safe}" placeholder="${esc(label)}" maxlength="${attrs.kind==='meta'?120:500}">`}</label>`;
};
export function show(id) {
  for (const section of ['setup-screen', 'auth-screen', 'recover-screen', 'reset-screen', 'workspace']) {
    el(section).hidden = section !== id;
  }
}
export function notice(message, error = false) {
  const node = el('save-status');
  node.textContent = message;
  node.classList.toggle('error', error);
}
export function errString(error){return safeErrorMessage(error);}

export function download(name, data, type) {
  const url = URL.createObjectURL(new Blob([data], {type}));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
