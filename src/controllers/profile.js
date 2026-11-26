import { state } from '../state.js';
import { SECTIONS, createItem, moveItem } from '../model.js';
import { el, notice, errString } from '../ui/dom.js';
import { renderUI, renderPreview } from '../ui/render.js';
import { setBusy, markDirty, autosave } from './saving.js';
import { preparePhoto } from '../photo.js';
// Profile editing and photo upload events.
export function registerProfile() {
  el('profile-panel').addEventListener('change',async(ev)=>{
   if(state.busy)return;
   const t=ev.target;
   if(t.dataset.kind==='photo-file'){
     if(!t.files?.[0])return;
     setBusy(true);
     try { state.master.profile.photo=await preparePhoto(t.files[0]);
        markDirty('profile');
        renderUI();
        notice('Photo prepared for automatic saving.'); }
     catch(e){notice(errString(e),true);
        t.value='';}finally{setBusy(false);}
     return;
   }
   if(t.dataset.kind==='present'){
     const item=state.master.experience.find(x=>x.id===t.dataset.id);
     if(item){item.end=t.checked?'Present':'';
        markDirty('profile');
        renderUI();}
   }
  });
  el('profile-panel').addEventListener('input',(ev)=>{
   const t=ev.target;
    if(!t.dataset.key)return;
   if(t.dataset.kind==='profile'&&Object.hasOwn(state.master.profile,t.dataset.key))state.master.profile[t.dataset.key]=t.value;
   else if(t.dataset.kind==='item'&&SECTIONS[t.dataset.section]?.fields.some(([k])=>k===t.dataset.key)){
    const item=state.master[t.dataset.section].find(x=>x.id===t.dataset.id);
      if(item)item[t.dataset.key]=t.value;
   }else return;
   markDirty('profile');
    renderPreview();
  });
  el('profile-panel').addEventListener('click',async(ev)=>{
   const b=ev.target.closest('button[data-action]');
    if(!b||state.busy)return;
   const {action,section,id}=b.dataset;
   if(action==='remove-photo'){state.master.profile.photo='';
      markDirty('profile');
      renderUI();
      return;}
   if(action==='save-master'){
    setBusy(true);
      try{await autosave.flush();}finally{setBusy(false);}return;
   }
   if(SECTIONS[section]){
    if(action==='add'){if(state.master[section].length>=100){notice('Maximum 100 entries per profile section.',true);
          return;}state.master[section].push(createItem(section));}
    else if(action==='remove'){if(!confirm('Remove this profile entry? Existing CVs will no longer be able to display it.'))return;
        state.master[section]=state.master[section].filter(x=>x.id!==id);}
    else if(action==='up'||action==='down')moveItem(state.master,section,id,action==='up'?-1:1);
    markDirty('profile');
   }else return;
   renderUI();
  });
}
