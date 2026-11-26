import { state, AI_ENABLED } from '../state.js';
import { el, notice } from '../ui/dom.js';
import { renderUI } from '../ui/render.js';
import { autosave, saveIndicator, saveBeforeLeaving } from './saving.js';
// Save pending edits before changing the workspace screen.
export async function changePage(target){
  if(state.busy || target===state.screen || (target==='ai' && !AI_ENABLED))return;
  if(!await saveBeforeLeaving()){
    if(!confirm('Your latest changes could not be saved. Discard unsaved edits and leave this page?'))return;
    if(state.dirtyMaster)state.master=structuredClone(state.savedMaster);
    state.dirtyMaster=false;
    state.dirtyCv=false;
  }
  autosave.cancel();
  if(target!=='editor')state.active=null;
  state.screen=target;
  notice('');
  saveIndicator('ready');
  renderUI();
}

export function registerNavigation() {
  el('nav-dashboard').addEventListener('click',()=>changePage('dashboard'));
  el('nav-profile').addEventListener('click',()=>changePage('profile'));
  el('nav-cvs').addEventListener('click',()=>changePage('cvs'));
  el('nav-ai').addEventListener('click',()=>changePage('ai'));
  el('nav-account').addEventListener('click',()=>changePage('account'));
}
