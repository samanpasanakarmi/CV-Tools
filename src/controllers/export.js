import { state } from '../state.js';
import { cvAsText } from '../model.js';
import { el, notice, download } from '../ui/dom.js';
import { getPreviewCv } from '../ui/render.js';
// Browser-based PDF, TXT and JSON export and unsaved-change warning.
export function registerExports() {
  el('export-pdf').addEventListener('click',()=>{if(state.dirtyMaster||state.dirtyCv)notice('Warning: exported preview includes unsaved changes.');window.print();});
  const exportFilename=(ext)=>{const label=state.screen==='editor'&&state.active?state.active.title:'my-profile';return `${label.toLowerCase().replace(/[^a-z0-9 -]/g,'').trim().replace(/\s+/g,'-').slice(0,65)||'cv-studio'}.${ext}`;};
  el('export-txt').addEventListener('click',()=>download(exportFilename('txt'),cvAsText(getPreviewCv()),'text/plain'));
  el('export-json').addEventListener('click',()=>download(exportFilename('json'),JSON.stringify(getPreviewCv(),null,2),'application/json'));
  window.addEventListener('beforeunload',event=>{
    if(state.dirtyMaster||state.dirtyCv){event.preventDefault();event.returnValue='';}
  });
}
