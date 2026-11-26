import { state, AI_ENABLED } from '../state.js';
import { SECTIONS } from '../model.js';
import { normalizeVariant } from '../workspace.js';
import { makeReviewedAiVariant } from '../ai.js';
import { el, notice, errString } from '../ui/dom.js';
import { renderUI, renderPreview } from '../ui/render.js';
import { setBusy } from './saving.js';
// Experimental AI actions; keep the feature flag guard.
export function registerAi() {
  // AI drafts are temporary until the user reviews and approves a NEW CV row.
  el('ai-panel').addEventListener('submit',async event=>{
    event.preventDefault();
    if(state.busy||!AI_ENABLED)return;
    if(event.target.id==='ai-generate-form'){
      event.preventDefault();
      if(state.dirtyMaster){notice('Save your My Profile changes before using AI.',true);
        return;}
      const fd=new FormData(event.target);
      const input={targetRole:String(fd.get('targetRole')||'').trim(),company:String(fd.get('company')||'').trim(),
        jobDescription:String(fd.get('jobDescription')||'').trim(),template:String(fd.get('template')||'modern')};
      state.aiRequest=input;
      if(!fd.get('consent')){notice('Please consent to sharing the relevant profile details with the AI provider.',true);
        return;}
      setBusy(true);
      notice('Analyzing the job and your saved profile…');
      try{
        const reply=await state.api.generateAiDraft({...input,consent:true});
        if(!reply?.draft)throw new Error('The AI service did not provide a draft.');
        state.aiDraft=reply.draft;
        state.aiReview={title:`${input.targetRole} — tailored CV`.slice(0,120),headline:state.aiDraft.headline,
          summary:state.aiDraft.summary,included:structuredClone(state.aiDraft.recommended)};
        renderUI();
        notice('Draft ready. Review every statement before saving it.');
      }catch(e){notice(errString(e),true);}finally{setBusy(false);}
    }
    if(event.target.id==='ai-review-form'){
      event.preventDefault();
      const fd=new FormData(event.target);
      if(!fd.get('approved')){notice('Confirm that you have reviewed the AI-generated draft.',true);
        return;}
      const included=Object.fromEntries(Object.keys(SECTIONS).map(key=>[key,fd.getAll(`included-${key}`)]));
      state.aiReview={title:String(fd.get('title')||'').trim(),headline:String(fd.get('headline')||''),
        summary:String(fd.get('summary')||''),included};
      setBusy(true);
      try{
        const proposed=makeReviewedAiVariant(state.master,state.aiRequest,state.aiDraft,state.aiReview);
        const row=await state.api.createCv(proposed);
        const saved=normalizeVariant(row);
        state.variants.unshift(saved);
        state.active=structuredClone(saved);
        state.screen='editor';
        state.aiDraft=null;
        state.dirtyCv=false;
        renderUI();
        notice('Approved AI CV saved as a new version. Your original CVs were not changed.');
      }catch(e){notice(errString(e),true);}finally{setBusy(false);}
    }
  });
  // The live preview reflects the reviewer's edits without saving or calling AI again.
  el('ai-panel').addEventListener('input',event=>{
    if(!state.aiDraft || event.target.form?.id!=='ai-review-form')return;
    if(['title','headline','summary'].includes(event.target.name))state.aiReview[event.target.name]=event.target.value;
    renderPreview();
  });
  el('ai-panel').addEventListener('change',event=>{
    if(!state.aiDraft || event.target.form?.id!=='ai-review-form')return;
    for(const key of Object.keys(SECTIONS)){
      state.aiReview.included[key]=Array.from(el('ai-review-form').querySelectorAll(`input[name="included-${key}"]:checked`)).map(x=>x.value);
    }
    renderPreview();
  });
  el('ai-panel').addEventListener('click',event=>{
    if(state.busy)return;
    if(event.target.closest('button[data-action="discard-ai"]')){state.aiDraft=null;
      renderUI();
      notice('AI draft discarded. Nothing was saved.');}
  });
}
