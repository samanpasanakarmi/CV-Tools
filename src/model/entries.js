import { SECTIONS } from './constants.js';
import { makeId } from './ids.js';

// Add, move and select individual profile records.

export function createItem(section) {
  if (!SECTIONS[section]) throw new Error('Invalid section');
  return {id:makeId(),include:true,...Object.fromEntries(SECTIONS[section].fields.map(([field])=>[field,'']))};
}
export function moveItem(cv, section, id, direction) {
  if (!SECTIONS[section]) return false;
  const items = cv[section]; const index=items.findIndex(item=>item.id===id);
  const target=index+direction;
  if(index<0 || target<0 || target>=items.length) return false;
  [items[index],items[target]]=[items[target],items[index]];
  return true;
}
export function selectedItems(cv, section) { return cv[section].filter(item=>item.include); }
