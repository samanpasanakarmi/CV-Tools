import {SECTIONS, TEMPLATES} from './model.js';
import {newVariant} from './workspace.js';

// Creates an UNSAVED new variant. The user must explicitly approve and save it.
export function makeReviewedAiVariant(master, request, result, changes={}) {
  const title=String(changes.title || `${request.targetRole} — tailored CV`).trim().slice(0,120);
  if(!title)throw new Error('Give this CV a title.');
  const cv=newVariant(master,{
    title, company:String(request.company||'').trim().slice(0,120),
    target_role:String(request.targetRole||'').trim().slice(0,120)
  });
  cv.document.template=Object.hasOwn(TEMPLATES,request.template)?request.template:'modern';
  cv.document.headline=String(changes.headline??result.headline??'').slice(0,6000);
  cv.document.summary=String(changes.summary??result.summary??'').slice(0,6000);
  for(const section of Object.keys(SECTIONS)){
    const allowed=new Set(master[section].map(x=>x.id));
    const ids=changes.included?.[section] ?? result.recommended?.[section] ?? [];
    cv.document.included[section]=[...new Set(Array.isArray(ids)?ids:[])].filter(id=>allowed.has(id));
  }
  return cv;
}
