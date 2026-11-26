import { SECTIONS } from './constants.js';

// Keep ordering consistent across templates and custom sections.

export const DEFAULT_SECTION_ORDER=Object.freeze(['summary',...Object.keys(SECTIONS)]);
export const SIDEBAR_SECTIONS=Object.freeze(['skills','languages','certificates']);
export function defaultSectionOrder(customFields=[]){
  return [...DEFAULT_SECTION_ORDER,...customFields.map(item=>'custom:'+item.id)];
}
export function normalizeSectionOrder(raw,customFields=[]){
  const defaults=defaultSectionOrder(customFields);
  const allowed=new Set(defaults),seen=new Set(),order=[];
  // Only accept known keys, once each. New sections append; removed keys disappear.
  for(const key of Array.isArray(raw)?raw.slice(0,100):[]){
    if(allowed.has(key)&&!seen.has(key)){seen.add(key);order.push(key);}
  }
  return [...order,...defaults.filter(key=>!seen.has(key))];
}
export function sectionOrderGroups(raw,customFields=[],template='modern'){
  const order=normalizeSectionOrder(raw,customFields);
  if(template!=='two-column')return [{label:'Sections',keys:order}];
  return [
    {label:'Sidebar',keys:order.filter(key=>SIDEBAR_SECTIONS.includes(key))},
    {label:'Main column',keys:order.filter(key=>!SIDEBAR_SECTIONS.includes(key))}
  ];
}
export function moveSection(order,customFields,key,direction,template='modern'){
  const normalized=normalizeSectionOrder(order,customFields);
  if(direction!==1 && direction!==-1)return normalized;
  const group=sectionOrderGroups(normalized,customFields,template).find(g=>g.keys.includes(key));
  if(!group)return normalized;
  const neighbor=group.keys[group.keys.indexOf(key)+direction];
  if(!neighbor)return normalized;
  const i=normalized.indexOf(key),j=normalized.indexOf(neighbor);
  [normalized[i],normalized[j]]=[normalized[j],normalized[i]];
  return normalized;
}
