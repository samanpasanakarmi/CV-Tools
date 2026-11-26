// Public model interface. Existing imports stay compatible.
// Each implementation lives in a small module named for its responsibility.
export { STORAGE_KEY, SECTIONS, TEMPLATES, PHOTO_TEMPLATES } from './model/constants.js';
export { isIsoDate, displayDate, validateExperience } from './model/validation.js';
export { safePhoto, safeHref, escapeHtml } from './model/safety.js';
export { makeId } from './model/ids.js';
export { CUSTOM_FIELD_LIMIT, CUSTOM_LABEL_LIMIT, CUSTOM_VALUE_LIMIT, normalizeCustomFields, visibleCustomFields } from './model/custom-fields.js';
export { DEFAULT_SECTION_ORDER, SIDEBAR_SECTIONS, defaultSectionOrder, normalizeSectionOrder, sectionOrderGroups, moveSection } from './model/section-order.js';
export { blankCv, normalizeCv } from './model/profile.js';
export { createItem, moveItem, selectedItems } from './model/entries.js';
export { demoCv } from './model/sample.js';
export { cvAsText } from './model/text-export.js';
