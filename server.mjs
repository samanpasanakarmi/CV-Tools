import { createServer } from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PUBLIC_FILES } from './scripts/public-files.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
const publicFiles = new Set(PUBLIC_FILES.map(file => '/' + file));
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
const securityHeaders = {'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','Cache-Control':'no-store'};
export function createAppServer(){
  return createServer(async (req,res)=>{
    try {
      if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{...securityHeaders,Allow:'GET, HEAD'});res.end();return;}
      const pathname=decodeURIComponent(new URL(req.url ?? '/', 'http://127.0.0.1').pathname);
      const file=pathname==='/'?'/index.html':pathname;
      if(!publicFiles.has(file)){res.writeHead(404,securityHeaders);res.end('Not found');return;}
      const realRoot=await realpath(root);
      const path=await realpath(resolve(root,'.'+file));
      if(!path.startsWith(realRoot+sep)){res.writeHead(403,securityHeaders);res.end('Forbidden');return;}
      const content=await readFile(path);
      res.writeHead(200,{...securityHeaders,'Content-Type':types[extname(path)],'Content-Length':content.length});
      res.end(req.method==='HEAD'?undefined:content);
    } catch {
      res.writeHead(404,securityHeaders);res.end('Not found');
    }
  });
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const host='127.0.0.1',port=Number(process.env.PORT)||4173;
  createAppServer().listen(port,host,()=>console.log(`CV Tool running at http://${host}:${port}`));
}
