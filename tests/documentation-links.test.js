import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
function markdownFiles(dir){
  return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const path=join(dir,entry.name);
    return entry.isDirectory()?markdownFiles(path):entry.name.endsWith('.md')?[path]:[];
  });
}
test('relative Markdown links in project documentation resolve',()=>{
  const files=[...readdirSync(root).filter(name=>name.endsWith('.md')).map(name=>join(root,name)),...markdownFiles(join(root,'docs'))];
  const broken=[];
  for(const file of files){
    const source=readFileSync(file,'utf8').replace(/```[^\n]*\n[\s\S]*?```/g,'');
    for(const match of source.matchAll(/\]\(([^\s)#]+)(?:#[^)]*)?\)/g)){
      const target=match[1];
      if(/^[a-z][a-z0-9+.-]*:|^\/|^#/.test(target))continue;
      if(!existsSync(resolve(dirname(file),decodeURIComponent(target))))broken.push(file.replace(root,'')+' → '+target);
    }
  }
  assert.deepEqual(broken,[]);
});
