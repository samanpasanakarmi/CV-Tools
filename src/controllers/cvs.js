import { state } from '../state.js';
import { validateExperience, TEMPLATES, makeId, CUSTOM_FIELD_LIMIT, CUSTOM_LABEL_LIMIT, CUSTOM_VALUE_LIMIT, defaultSectionOrder, normalizeSectionOrder, moveSection } from '../model.js';
import { newVariant, normalizeVariant, toggleSelection } from '../workspace.js';
import { el, notice, errString } from '../ui/dom.js';
import { renderUI, renderPreview, renderVariant } from '../ui/render.js';
import { refreshSectionOrderLabels } from '../ui/cv-view.js';
import { setBusy, saveIndicator, markDirty, autosave } from './saving.js';
import { changePage } from './navigation.js';
// Create, duplicate, delete and edit saved CVs.
// Both overview and My CVs use the same data operations.
async function handleCvAction(ev){
 const b=ev.target.closest('button[data-action]');
  if(!b||state.busy)return;
 const {action,id}=b.dataset;
 const current=state.variants.find(x=>x.id===id);
 if(action==='new'){
  el('new-cv-form').reset();
    el('new-cv-dialog').showModal();
    el('new-cv-form').elements.title.focus();
    return;
 }
 if(action==='duplicate'&&current){
  const draft=newVariant(state.master,{title:`${current.title} (copy)`.slice(0,120),company:current.company,target_role:current.target_role});
  draft.document=structuredClone(current.document);
  setBusy(true);
  try{const row=await state.api.createCv(draft);
      state.variants.unshift(normalizeVariant(row));
      state.active=normalizeVariant(row);
      state.screen='editor';
      state.dirtyCv=false;
      saveIndicator('ready');
      renderUI();
      notice('CV duplicated. Change the company or role and save your version.');}
  catch(e){notice(errString(e),true);}finally{setBusy(false);}return;
 }
 if(action==='open'&&current){if(state.dirtyMaster&&!confirm('You have unsaved profile edits. Continue?'))return;
    state.active=structuredClone(current);
    state.screen='editor';
    state.dirtyCv=false;
    notice('');
    saveIndicator('ready');
    renderUI();
    return;}
 if(action==='delete'&&current){if(!confirm(`Permanently delete "${current.title}"?`))return;
  setBusy(true);
    try{await state.api.deleteCv(id);
      state.variants=state.variants.filter(x=>x.id!==id);
      renderUI();
      notice('CV deleted.');}catch(e){notice(errString(e),true);}finally{setBusy(false);}
 }
}

export function registerCvs() {
  el('new-cv-form').addEventListener('submit',async(ev)=>{
   ev.preventDefault();
    if(state.busy)return;
   const data=new FormData(ev.currentTarget);
   const title=String(data.get('title')||'').trim();
   if(!title)return;
   const draft=newVariant(state.master,{title,company:String(data.get('company')||'').trim(),target_role:String(data.get('target_role')||'').trim()});
   setBusy(true);
   try{
     if(state.dirtyMaster){const dateError=validateExperience(state.master.experience);
        if(dateError)throw new Error(dateError);
        await state.api.saveMaster(state.master);
        state.savedMaster=structuredClone(state.master);
        state.dirtyMaster=false;}
     const row=await state.api.createCv(draft);
      state.variants.unshift(normalizeVariant(row));
      state.active=normalizeVariant(row);
      state.screen='editor';
      state.dirtyCv=false;
     el('new-cv-dialog').close();
      saveIndicator('ready');
      renderUI();
      notice('New CV created using your reusable profile.');
   }catch(e){notice(errString(e),true);}finally{setBusy(false);}
  });
  el('cancel-new-cv').addEventListener('click',()=>el('new-cv-dialog').close());
  el('cvs-panel').addEventListener('click',handleCvAction);
  el('dashboard-panel').addEventListener('click',(ev)=>{const action=ev.target.closest('button[data-action]')?.dataset.action;
    if(action==='go-profile')changePage('profile');
    else if(action==='go-cvs')changePage('cvs');
    else handleCvAction(ev);});
  el('variant-panel').addEventListener('input',(ev)=>{
   const t=ev.target;
    if(!state.active)return;
   if(t.dataset.kind==='meta'&&['title','company','target_role'].includes(t.dataset.key))state.active[t.dataset.key]=t.value;
   else if(t.dataset.kind==='variant'&&['headline','summary'].includes(t.dataset.key))state.active.document[t.dataset.key]=t.value;
   else if(t.dataset.kind==='accent')state.active.document.accent=t.value;
   else if(t.dataset.kind==='custom'&&['label','value'].includes(t.dataset.key)){
     const item=state.active.document.customFields.find(x=>x.id===t.dataset.id);
      if(!item)return;
     item[t.dataset.key]=t.value.slice(0,t.dataset.key==='label'?CUSTOM_LABEL_LIMIT:CUSTOM_VALUE_LIMIT);
     if(t.dataset.key==='label')refreshSectionOrderLabels(state.active.document);
   }
   else return;
   markDirty('cv');
    renderPreview();
  });
  el('variant-panel').addEventListener('change',(ev)=>{
   const t=ev.target;
    if(!state.active)return;
   if(t.dataset.kind==='selected')toggleSelection(state.active,t.dataset.section,t.dataset.id,t.checked);
   else if(t.dataset.kind==='contact'&&['email','phone','address','location','website'].includes(t.dataset.key))state.active.document.contacts[t.dataset.key]=t.checked;
   else if(t.dataset.kind==='template'&&Object.hasOwn(TEMPLATES,t.value)){state.active.document.template=t.value;
      renderVariant();}
   else if(t.dataset.kind==='show-photo')state.active.document.showPhoto=t.checked;
   else return;
   markDirty('cv');
    renderPreview();
  });
  el('variant-panel').addEventListener('click',async(ev)=>{
   const b=ev.target.closest('button[data-action]');
    if(!b||state.busy)return;
   if(b.dataset.action==='back'){changePage('cvs');
      return;}
   if(!state.active)return;
   if(b.dataset.action==='add-custom' && state.active.document.customFields.length<CUSTOM_FIELD_LIMIT){
     state.active.document.customFields.push({id:makeId(),label:'',value:''});
     state.active.document.sectionOrder=normalizeSectionOrder(state.active.document.sectionOrder,state.active.document.customFields);
     markDirty('cv');
      renderVariant();
      renderPreview();
     const fields=el('variant-panel').querySelectorAll('[data-kind="custom"][data-key="label"]');
      fields[fields.length-1]?.focus();
   }else if(b.dataset.action==='remove-custom'){
     if(!confirm('Remove this custom field from this CV?'))return;
     state.active.document.customFields=state.active.document.customFields.filter(x=>x.id!==b.dataset.id);
     state.active.document.sectionOrder=normalizeSectionOrder(state.active.document.sectionOrder,state.active.document.customFields);
     markDirty('cv');
      renderVariant();
      renderPreview();
   }else if(['section-up','section-down','reset-order'].includes(b.dataset.action)){
     const doc=state.active.document,action=b.dataset.action,key=b.dataset.orderKey;
     const next=action==='reset-order'?defaultSectionOrder(doc.customFields):moveSection(doc.sectionOrder,doc.customFields,key,action==='section-up'?-1:1,doc.template);
     if(JSON.stringify(next)===JSON.stringify(doc.sectionOrder))return;
     doc.sectionOrder=next;
     markDirty('cv');
      renderVariant();
      renderPreview();
     // Restore keyboard focus after moving an item; fall back to its other enabled arrow.
     const buttons=Array.from(el('variant-panel').querySelectorAll('[data-action]'));
     const focus=buttons.find(x=>x.dataset.action===action&&x.dataset.orderKey===key&&!x.disabled)
       ||buttons.find(x=>key&&x.dataset.orderKey===key&&!x.disabled);
     focus?.focus({preventScroll:true});
   }else if(b.dataset.action==='save-cv'){
     setBusy(true);
      try{await autosave.flush();}finally{setBusy(false);}
   }
  });
}
