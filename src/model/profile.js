import { SECTIONS, TEMPLATES, profileFields } from './constants.js';
import { safePhoto } from './safety.js';
import { makeId } from './ids.js';
import { normalizeCustomFields } from './custom-fields.js';
import { defaultSectionOrder, normalizeSectionOrder } from './section-order.js';

// Create and normalize the shared CV document without trusting unknown JSON keys.

export function blankCv() {
  return {version:1, profile:Object.fromEntries(profileFields.map(key=>[key,''])),
    experience:[], education:[], projects:[], skills:[], languages:[], certificates:[], customFields:[], sectionOrder:defaultSectionOrder(),
    settings:{ template:'modern', accent:'#235d80' } };
}

function text(v) { return typeof v === 'string' ? v.slice(0,6000) : ''; }
// Never trust imported JSON. Only copy known keys and normalize records.
export function normalizeCv(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || raw.version !== 1) throw new Error('Please select a CV Tool v1 JSON backup.');
  const clean = blankCv();
  const profile = raw.profile && typeof raw.profile === 'object' ? raw.profile : {};
  for (const field of profileFields) clean.profile[field] = field==='photo' ? safePhoto(profile[field]) : text(profile[field]);
  for (const [section, config] of Object.entries(SECTIONS)) {
    const items = Array.isArray(raw[section]) ? raw[section].slice(0,100) : [];
    const ids = new Set();
    clean[section] = items.filter(item=>item && typeof item==='object' && !Array.isArray(item)).map(item=>{
      let id = text(item.id).slice(0,100) || makeId();
      if(ids.has(id)) id = makeId();
      ids.add(id);
      const record={id,include:item.include !== false};
      for (const [field] of config.fields) record[field] = text(item[field]);
      return record;
    });
  }
  clean.customFields=normalizeCustomFields(raw.customFields);
  clean.sectionOrder=normalizeSectionOrder(raw.sectionOrder,clean.customFields);
  clean.settings.template = Object.hasOwn(TEMPLATES,raw.settings?.template) ? raw.settings.template : 'modern';
  const accent = raw.settings?.accent;
  clean.settings.accent = typeof accent==='string' && /^#[0-9a-fA-F]{6}$/.test(accent) ? accent : '#235d80';
  return clean;
}
