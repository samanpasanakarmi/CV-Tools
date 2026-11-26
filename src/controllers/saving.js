import { state } from '../state.js';
import { blankCv, validateExperience } from '../model.js';
import { normalizeVariant, createAutosave } from '../workspace.js';
import { el } from '../ui/dom.js';
// Serialize cloud saves and retain newer edits until acknowledged by the database.
export function setBusy(value){
  state.busy=value;
  // Prevent edits and navigation during asynchronous saves, loads and photo processing.
  for(const id of ['workspace','auth-screen','recover-screen','reset-screen','new-cv-dialog']) el(id).inert=value;
  el('signout').disabled=value;
}
export function clearPrivateState(){
  autosave.cancel();
  saveIndicator('ready');
  state.master=blankCv();
  state.savedMaster=blankCv();
  state.variants=[];
  state.active=null;
  state.aiDraft=null;
  state.aiRequest={targetRole:'',company:'',jobDescription:'',template:'modern'};
  state.aiReview={title:'',headline:'',summary:'',included:{}};
  state.dirtyMaster=false;
  state.dirtyCv=false;
  state.screen='dashboard';
  for(const id of ['dashboard-panel','profile-panel','cvs-panel','variant-panel','ai-panel','account-panel','preview','save-status']) el(id).replaceChildren();
  el('preview-title').textContent='Your CV';
  el('new-cv-form').reset();
  el('new-cv-dialog').close();
}

export function saveIndicator(state,detail=''){
  const node=el('autosave-status');
  node.dataset.state=state;
  const messages={ready:'Automatic saving is on',unsaved:'Unsaved changes — saving soon…',saving:'Saving to your account…',saved:'All changes saved at '+new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'}),blocked:'Not saved — '+detail,error:'Not saved — use Save now to retry. '+detail};
  node.textContent=messages[state];
}
function validationError(message){const error=new Error(message);
  error.validation=true;
  return error;}

export const autosave=createAutosave({
  read:()=>{
    if(state.dirtyMaster && state.screen==='profile')return {kind:'profile',snapshot:structuredClone(state.master)};
    if(state.dirtyCv && state.screen==='editor' && state.active)return {kind:'cv',snapshot:structuredClone(state.active)};
    return null;
  },
  write:async ({kind,snapshot})=>{
    if(kind==='profile'){
      const error=validateExperience(snapshot.experience);
      if(error)throw validationError(error);
      await state.api.saveMaster(snapshot);
      state.savedMaster=structuredClone(snapshot);
      state.dirtyMaster=JSON.stringify(state.master)!==JSON.stringify(snapshot);
    }else{
      if(!snapshot.title.trim() || snapshot.title.length>120)throw validationError('Enter a CV name (1–120 characters).');
      const saved=normalizeVariant(await state.api.updateCv(snapshot));
      state.variants=state.variants.map(x=>x.id===saved.id?structuredClone(saved):x);
      // Do not overwrite edits made while the request was in flight.
      if(state.active?.id===snapshot.id && JSON.stringify(state.active)===JSON.stringify(snapshot))state.dirtyCv=false;
    }
  },
  onStatus:saveIndicator,
  canRun:()=>!state.busy && !el('workspace').hidden && !!state.api.userId
});
export function markDirty(kind){
  if(kind==='profile')state.dirtyMaster=true;
  else state.dirtyCv=true;
  autosave.schedule();
}
export async function saveBeforeLeaving(){
  if(!state.dirtyMaster&&!state.dirtyCv)return true;
  setBusy(true);
  try{return await autosave.flush();}finally{setBusy(false);}
}
