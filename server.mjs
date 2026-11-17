import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)));
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json; charset=utf-8'};
const host = '127.0.0.1';
const port = Number(process.env.PORT) || 4173;
createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://${host}`);
    const pathname = decodeURIComponent(url.pathname);
    const path = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!(path === root || path.startsWith(root + sep)) || pathname.includes('\0')) {
      res.writeHead(403); res.end('Forbidden'); return;
    }
    const info = await stat(path);
    if (!info.isFile()) throw new Error('Not a file');
    const content = await readFile(path);
    res.writeHead(200, {'Content-Type': types[extname(path)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff'});
    res.end(content);
  } catch {
    res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'});
    res.end('Not found');
  }
}).listen(port, host, () => console.log(`CV Tool running at http://${host}:${port}`));
