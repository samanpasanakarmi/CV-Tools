import { escapeHtml as esc } from '../model.js';
import { el } from './dom.js';
// Dashboard and saved CV list.
export function renderDashboard(master, variants){
  const name=master.profile.name?.split(' ')[0]||'';
  let html=`<section class="simple-dashboard"><div class="eyebrow">YOUR WORKSPACE</div><div class="simple-top"><div><h3>${name?'Hello, '+esc(name):'Your CVs'}</h3><p>${variants.length?`${variants.length} saved CV${variants.length===1?'':'s'}`:'Create your first CV using your saved profile.'}</p></div><button data-action="new" class="btn btn-primary" type="button">+ Create CV</button></div><div class="simple-links"><button data-action="go-profile" type="button" class="btn btn-small">Edit profile</button><button data-action="go-cvs" type="button" class="btn btn-small">View all CVs</button></div></section>`;
  if(variants.length){
    html+='<section class="form-section"><div class="form-section-header"><h3>Recent CVs</h3></div>';
    for(const cv of variants.slice(0,3))html+=`<div class="cv-list-item"><div><strong>${esc(cv.title)}</strong><small>${esc([cv.target_role,cv.company].filter(Boolean).join(' · ')||'No target selected')}</small></div><button class="btn btn-small" data-action="open" data-id="${esc(cv.id)}" type="button">Edit CV</button></div>`;
    html+='</section>';
  }
  el('dashboard-panel').innerHTML=html;
}

export function renderVariants(variants){
  let html=`<p class="tip">Your personal details come from My Profile. Create a separate CV for each company and role, choosing only the experience and skills relevant to that application.</p><div class="actions"><button data-action="new" class="btn btn-primary" type="button">+ New CV</button></div>`;
  if(!variants.length)html+='<p class="empty-section">No CVs yet. Save your profile, then create your first CV.</p>';
  for(const cv of variants){
    html+=`<div class="cv-list-item"><div><strong>${esc(cv.title)}</strong><small>${esc([cv.target_role,cv.company].filter(Boolean).join(' · ')||'No target selected')}</small></div><div class="actions"><button class="btn btn-small" data-action="open" data-id="${esc(cv.id)}" type="button">Edit</button><button class="btn btn-small" data-action="duplicate" data-id="${esc(cv.id)}" type="button">Duplicate</button><button class="btn btn-small remove" data-action="delete" data-id="${esc(cv.id)}" type="button">Delete</button></div></div>`;
  }
  el('cvs-panel').innerHTML=html;
}
