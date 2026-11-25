import { SECTIONS, selectedItems, escapeHtml as e, safeHref, displayDate, PHOTO_TEMPLATES, safePhoto, TEMPLATES, visibleCustomFields } from './model.js';
const nl = value => e(value).replace(/\n/g,'<br>');
const details = value => {
  if (!value?.trim()) return '';
  return `<ul>${value.split('\n').map(s=>s.trim()).filter(Boolean).map(line=>`<li>${e(line)}</li>`).join('')}</ul>`;
};
const link = value => {
  const href = safeHref(value);
  return href ? `<a href="${e(href)}" target="_blank" rel="noopener noreferrer">${e(value)}</a>` : e(value);
};
function itemHtml(section,item) {
  if(section==='skills') return `<span class="cv-pill">${e(item.name)}</span>`;
  if(section==='languages') return `<span class="cv-pill">${e(item.name)}${item.level?' · '+e(item.level):''}</span>`;
  if(section==='certificates') return `<div class="cv-entry"><strong>${e(item.name)}</strong><div class="cv-subline">${e([item.issuer,item.year].filter(Boolean).join(' · '))}</div></div>`;
  let title='',subtitle='',meta='';
  if(section==='experience') {title=item.role;subtitle=item.organization;meta=[item.location,[displayDate(item.start),displayDate(item.end)].filter(Boolean).join(' – ')].filter(Boolean).join(' · ');}
  if(section==='education') {title=item.qualification;subtitle=item.organization;meta=[item.location,[item.start,item.end].filter(Boolean).join(' – ')].filter(Boolean).join(' · ');}
  if(section==='projects') {title=item.name;subtitle=item.link;}
  return `<div class="cv-entry"><div class="cv-entry-top"><strong>${e(title || subtitle)}</strong><small>${e(meta)}</small></div>
    ${subtitle ? `<div class="cv-subline">${section==='projects'?link(subtitle):e(subtitle)}</div>`:''}
    ${details(item.details)}</div>`;
}
export function renderResume(cv) {
  const p=cv.profile;
  const template=Object.hasOwn(TEMPLATES,cv.settings?.template)?cv.settings.template:'modern';
  const contacts=[p.address,p.location,p.email,p.phone].filter(Boolean).map(value=>`<span>${e(value)}</span>`);
  if(p.website) contacts.push(`<span>${link(p.website)}</span>`);
  const picture=PHOTO_TEMPLATES.includes(template) && safePhoto(p.photo)
    ? `<img class="cv-photo" src="${e(p.photo)}" alt="Profile photograph">` : '';
  let sections=p.summary ? `<section class="cv-section"><h2>Profile</h2><p class="cv-summary">${nl(p.summary)}</p></section>` : '';
  for (const [section,meta] of Object.entries(SECTIONS)) {
    const items=selectedItems(cv,section).filter(item=>meta.fields.some(([key])=>Boolean(item[key]?.trim())));
    if(!items.length)continue;
    sections+=`<section class="cv-section"><h2>${e(meta.label)}</h2><div class="cv-section-body ${section==='skills'||section==='languages'?'cv-pills':''}">${items.map(i=>itemHtml(section,i)).join('')}</div></section>`;
  }
  const custom=visibleCustomFields(cv.customFields).map(item=>`<section class="cv-section"><h2>${e(item.label.trim())}</h2><p class="cv-summary">${nl(item.value.trim())}</p></section>`).join('');
  sections+=custom;
  const identity=`<div class="cv-identity"><h1>${e(p.name||'Your Name')}</h1><div class="cv-headline">${e(p.headline||'Your professional title')}</div><div class="cv-contact">${contacts.join('')}</div></div>`;
  const empty = '<div class="cv-empty">Fill in your profile to build a professional CV.</div>';
  if (template === 'two-column') {
    // Reuse the existing CV data and item renderer; only the visual grouping changes.
    const sidebarSections = ['skills', 'languages', 'certificates'];
    const summaryHtml = p.summary
      ? `<section class="cv-section"><h2>Profile</h2><p class="cv-summary">${nl(p.summary)}</p></section>` : '';
    let sidebar = '';
    let main = summaryHtml;
    for (const [section, meta] of Object.entries(SECTIONS)) {
      const items = selectedItems(cv, section).filter(item=>meta.fields.some(([key])=>Boolean(item[key]?.trim())));
      if (!items.length) continue;
      const html = `<section class="cv-section"><h2>${e(meta.label)}</h2><div class="cv-section-body ${section==='skills'||section==='languages'?'cv-pills':''}">${items.map(i=>itemHtml(section,i)).join('')}</div></section>`;
      if (sidebarSections.includes(section)) sidebar += html;
      else main += html;
    }
    main+=custom;
    return `<article class="cv-page two-column" style="--cv-accent:${e(cv.settings.accent)}">
      <header class="cv-heading">${picture}${identity}</header>
      <div class="cv-two-column-body"><aside class="cv-sidebar">${sidebar || empty}</aside><main class="cv-main">${main || empty}</main></div>
    </article>`;
  }
  return `<article class="cv-page ${e(template)}" style="--cv-accent:${e(cv.settings.accent)}">
    <header class="cv-heading">${picture}${identity}</header>
    <div class="cv-main">${sections||empty}</div>
  </article>`;
}
