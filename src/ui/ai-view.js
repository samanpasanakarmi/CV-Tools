import { SECTIONS, TEMPLATES, escapeHtml as esc } from '../model.js';
import { el } from './dom.js';
// Experimental AI screens; hidden in the core release.
export function renderAi(master, aiDraft, aiRequest, aiReview){
  const panel=el('ai-panel');
  if(!aiDraft){
    const hasProfile=Object.keys(SECTIONS).some(k=>master[k].length)||master.profile.summary?.trim();
    panel.innerHTML=`<section class="form-section ai-form-section"><div class="eyebrow">AI SMART CV BUILDER</div><h3>Tailor your CV to a job</h3><p>AI will suggest a summary and which saved experiences and skills best match the job. It will not create facts or save anything without your approval.</p><form id="ai-generate-form">
    <label class="field"><span>Job title</span><input name="targetRole" maxlength="120" required value="${esc(aiRequest.targetRole)}" placeholder="Customer Service Representative"></label>
    <label class="field"><span>Company (optional)</span><input name="company" maxlength="120" value="${esc(aiRequest.company)}" placeholder="Employer name"></label>
    <label class="field"><span>Job description</span><textarea name="jobDescription" minlength="30" maxlength="10000" rows="8" required placeholder="Paste the actual job advert (minimum 30 characters)…">${esc(aiRequest.jobDescription)}</textarea><small class="field-help">Copy the actual requirements. Do not include private contact information.</small></label>
    <label class="field"><span>CV template</span><select name="template">${Object.entries(TEMPLATES).map(([key,label])=>`<option value="${esc(key)}" ${aiRequest.template===key?'selected':''}>${esc(label)}</option>`).join('')}</select></label>
    <label class="select-entry ai-consent"><input type="checkbox" name="consent" required><span>I agree to send the job description and relevant saved qualifications/work history to the AI provider for this request. My contact fields and photo are excluded, but free-text work details may contain personal information. I will check the draft before saving.</span></label>
    ${!hasProfile?'<p class="field-help">Add your real qualifications and experience to My Profile, then save it first.</p>':''}
    <div class="actions"><button class="btn btn-primary" type="submit" data-busy-control="1" ${!hasProfile?'disabled':''}>✦ Generate suggestions</button></div></form>
    </section>`;
    return;
  }
  let html=`<section class="form-section"><div class="eyebrow">REVIEW BEFORE SAVING</div><h3>AI-tailored CV draft</h3><p class="ai-warning">AI can make mistakes. Verify the headline, summary, and selected experience against your profile. Nothing is saved yet.</p><form id="ai-review-form">
    <label class="field"><span>CV title</span><input name="title" maxlength="120" required value="${esc(aiReview.title)}"></label>
    <label class="field"><span>Headline (editable)</span><input name="headline" maxlength="6000" value="${esc(aiReview.headline)}"></label>
    <label class="field"><span>Professional summary (editable)</span><textarea name="summary" rows="6" maxlength="6000">${esc(aiReview.summary)}</textarea></label>`;
  for(const [section,meta] of Object.entries(SECTIONS)){
    if(!master[section].length)continue;
    html+=`<fieldset class="ai-selection"><legend>${esc(meta.label)}</legend>`;
    for(const item of master[section]){
      const checked=aiReview.included[section]?.includes(item.id)?'checked':'';
      const label=meta.fields.map(([key])=>item[key]).filter(Boolean).slice(0,2).join(' — ')||'Entry';
      html+=`<label class="select-entry"><input type="checkbox" name="included-${esc(section)}" value="${esc(item.id)}" ${checked}><span>${esc(label)}</span></label>`;
    }
    html+='</fieldset>';
  }
  const list=(title,arr)=>arr.length?`<div class="ai-explanation"><h4>${title}</h4><ul>${arr.map(item=>`<li>${esc(item)}</li>`).join('')}</ul></div>`:'';
  html+=list('Relevant strengths identified',aiDraft.strengths||[]);
  html+=list('Missing or unclear requirements (do not invent these)',aiDraft.gaps||[]);
  html+=`<label class="select-entry ai-consent"><input type="checkbox" name="approved" required><span>I have checked the generated claims and selections against my real qualifications. Create this as a new CV.</span></label>
    <div class="actions"><button type="button" data-action="discard-ai" class="btn">Change job description</button><button data-busy-control="1" type="submit" class="btn btn-primary">Approve & save new CV</button></div></form></section>`;
  panel.innerHTML=html;
}
