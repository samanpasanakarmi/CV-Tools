import { SECTIONS } from './constants.js';
import { displayDate } from './validation.js';
import { normalizeCustomFields, visibleCustomFields } from './custom-fields.js';
import { sectionOrderGroups } from './section-order.js';
import { selectedItems } from './entries.js';

// Build plain-text output from the same selected sections as the preview.

export function cvAsText(cv) {
  const p=cv.profile;
  const lines = [p.name,p.headline,[p.location,p.email,p.phone,p.website].filter(Boolean).join(' | '),''];
  const customFields=normalizeCustomFields(cv.customFields);
  const custom=new Map(visibleCustomFields(customFields).map(item=>['custom:'+item.id,item]));
  for(const section of sectionOrderGroups(cv.sectionOrder,customFields,cv.settings?.template).flatMap(g=>g.keys)){
    if(section==='summary'){
      if(p.summary?.trim())lines.push('PROFILE',p.summary,'');
      continue;
    }
    if(custom.has(section)){
      const item=custom.get(section);lines.push(item.label.trim().toUpperCase(),item.value.trim(),'');continue;
    }
    if(!Object.hasOwn(SECTIONS,section))continue;
    const meta=SECTIONS[section];
    const items=selectedItems(cv,section).filter(item=>meta.fields.some(([key])=>Boolean(item[key]?.trim())));
    if(!items.length)continue;
    lines.push(meta.label.toUpperCase());
    for (const item of items) {
      lines.push(meta.fields.filter(([field])=>field!=='details').map(([field])=>section==='experience' && (field==='start'||field==='end')? displayDate(item[field]):item[field]).filter(Boolean).join(' — '));
      if (item.details) lines.push(item.details);
      lines.push('');
    }
  }
  return lines.join('\n').trim()+'\n';
}
