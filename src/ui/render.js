import { state } from '../state.js';
import { normalizeCv } from '../model.js';
import { composeCv } from '../workspace.js';
import { makeReviewedAiVariant } from '../ai.js';
import { renderResume } from '../preview.js';
import { el } from './dom.js';
import { renderProfile } from './profile-view.js';
import { renderDashboard, renderVariants } from './dashboard-view.js';
import { renderAccount } from './account-view.js';
import { renderAi } from './ai-view.js';
import { renderVariant as renderCvView } from './cv-view.js';
// Select the correct screen and update the live preview.
export function getPreviewCv(){
  if(state.active && state.screen==='editor')return composeCv(state.master,state.active);
  if(state.screen==='ai' && state.aiDraft) return composeCv(state.master,makeReviewedAiVariant(state.master,state.aiRequest,state.aiDraft,state.aiReview));
  return normalizeCv({...state.master,version:1});
}
export function renderPreview(){
  const data=getPreviewCv();
  updateCvCompletion(data);
  el('preview').innerHTML=renderResume(data);
  el('preview-title').textContent=state.screen==='editor'&&state.active?state.active.title:state.screen==='ai'&&state.aiDraft?'AI draft preview (not saved)':'Profile preview';
}
export function renderUI(){
  const isDashboard=state.screen==='dashboard',isProfile=state.screen==='profile',isCvs=state.screen==='cvs',isEditor=state.screen==='editor',isAccount=state.screen==='account';
  el('dashboard-panel').hidden=!isDashboard;
  el('profile-panel').hidden=!isProfile;
  el('cvs-panel').hidden=!isCvs;
  el('variant-panel').hidden=!isEditor;
  el('account-panel').hidden=!isAccount;
  const isAi=state.screen==='ai';
  el('ai-panel').hidden=!isAi;
  el('autosave-status').hidden=!(isProfile||isEditor);
  const withPreview=isProfile||isEditor||(isAi&&!!state.aiDraft);
  for(const id of ['export-pdf','export-txt','export-json'])el(id).disabled=(isAi&&!!state.aiDraft);
  el('preview-pane').hidden=!withPreview;
  el('workspace').classList.toggle('single-column',!withPreview);
  el('pane-heading').textContent=isDashboard?'Overview':isProfile?'My Profile':isCvs?'My CVs':isAccount?'Account & privacy':isAi?'AI Smart CV Builder':'Edit tailored CV';
  el('pane-subtitle').textContent=isDashboard?'Your CVs, without the clutter.':isProfile?'Enter once, reuse in every CV.':isCvs?'Build different CVs for different companies.':isAccount?'Control your password and CV data.':isAi?'Tailor an accurate CV to a real job advert, then review before saving.':'Customize this job application, without retyping personal details.';
  for(const [key,selected] of [['dashboard',isDashboard],['profile',isProfile],['cvs',isCvs||isEditor],['ai',isAi],['account',isAccount]])el(`nav-${key}`).className='btn '+(selected?'btn-primary':'');
  if(isDashboard)renderDashboard(state.master, state.variants);
  if(isProfile)renderProfile(state.master);
  if(isCvs)renderVariants(state.variants);
  if(isEditor)renderVariant();
  if(isAccount)renderAccount(state.api);
  if(isAi)renderAi(state.master, state.aiDraft, state.aiRequest, state.aiReview);
  renderPreview();
}

export function renderVariant() {
  renderCvView(state.master, state.active);
}


// ========================================
// CV COMPLETION INDICATOR START
// ========================================

export function calculateCompletion(cv) {

  const hasText = value =>
    typeof value === 'string' && value.trim() !== '';

  const sections = [

    // Personal information
    hasText(cv.profile.name),

    // Contact information
    hasText(cv.profile.email) ||
    hasText(cv.profile.phone),

    // Professional summary
    hasText(cv.profile.summary),

    // Work experience
    cv.experience.some(item =>
      item.include &&
      hasText(item.role) &&
      hasText(item.organization)
    ),

    // Education
    cv.education.some(item =>
      item.include &&
      hasText(item.qualification) &&
      hasText(item.organization)
    ),

    // Skills
    cv.skills.some(item =>
      item.include &&
      hasText(item.name)
    )

  ];

  const completed = sections.filter(Boolean).length;

  return Math.round(completed / sections.length * 100);
}


function updateCvCompletion(cv) {

  const container = el('cv-completion');
  const progress = el('cv-progress');
  const label = el('cv-percent');
  const message = el('cv-progress-message');

  if (!container || !progress || !label || !message) {
    return;
  }

  container.hidden =
    !['profile', 'editor'].includes(state.screen);

  if (container.hidden) return;

  const percentage = calculateCompletion(cv);

  progress.value = percentage;

  label.textContent = `${percentage}%`;

  message.textContent =
    percentage === 100
      ? 'All six core CV sections are complete!'
      : 'Add information to complete your CV.';
}

// ========================================
// CV COMPLETION INDICATOR END
// ========================================
