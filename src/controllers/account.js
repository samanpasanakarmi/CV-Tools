import { state } from '../state.js';
import { el, notice, errString, download } from '../ui/dom.js';
import { renderUI } from '../ui/render.js';
import { setBusy, clearPrivateState } from './saving.js';
// Password changes, backup download and CV-data erasure.
export function registerAccount() {
  el('account-panel').addEventListener('submit',async event=>{
    if(event.target.id!=='account-password-form'||state.busy)return;
    event.preventDefault();
    const fd=new FormData(event.target);
    if(fd.get('password')!==fd.get('confirm')){notice('Passwords do not match.',true);
      return;}
    setBusy(true);
    try{await state.api.updatePassword(String(fd.get('password')));
      event.target.reset();
      notice('Password successfully updated.');}
    catch(error){notice(errString(error),true);}finally{setBusy(false);}
  });
  el('account-panel').addEventListener('click',async event=>{
    const b=event.target.closest('button[data-action]');
    if(!b||state.busy)return;
    if(b.dataset.action==='export-account'){
      const backup={app:'cv-studio',backup_version:1,exported_at:new Date().toISOString(),profile:state.master,cvs:state.variants};
      download('cv-studio-full-backup.json',JSON.stringify(backup,null,2),'application/json');
      notice('Backup downloaded. Store it securely because it contains personal information.');
      return;
    }
    if(b.dataset.action==='clear-account-data'){
      if((state.dirtyMaster||state.dirtyCv)&&!confirm('Unsaved changes will be lost. Continue?'))return;
      const response=prompt('This permanently erases ALL your profile and CV information. Type DELETE to confirm:');
      if(response!=='DELETE'){notice('Erasure cancelled.');
        return;}
      setBusy(true);
      try{await state.api.clearWorkspace();
        clearPrivateState();
        renderUI();
        notice('Your profile and CV information has been erased. Your login account still exists.');}
      catch(error){notice(`Could not erase CV data: ${errString(error)}`,true);}finally{setBusy(false);}
    }
  });
}
