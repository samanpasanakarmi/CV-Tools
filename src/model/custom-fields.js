import { makeId } from './ids.js';

// Normalize user-defined CV fields and enforce the existing limits.

export const CUSTOM_FIELD_LIMIT = 20;
export const CUSTOM_LABEL_LIMIT = 80;
export const CUSTOM_VALUE_LIMIT = 2000;
export function normalizeCustomFields(raw) {
  const seen=new Set();
  return (Array.isArray(raw)?raw:[]).filter(x=>x && typeof x==='object' && !Array.isArray(x)).slice(0,CUSTOM_FIELD_LIMIT).map(x=>{
    let id=typeof x.id==='string'?x.id.slice(0,100):'';
    if(!id || seen.has(id))id=makeId();
    seen.add(id);
    return {id,label:typeof x.label==='string'?x.label.slice(0,CUSTOM_LABEL_LIMIT):'',value:typeof x.value==='string'?x.value.slice(0,CUSTOM_VALUE_LIMIT):''};
  });
}
export function visibleCustomFields(raw){
  return normalizeCustomFields(raw).filter(x=>x.label.trim() && x.value.trim());
}
