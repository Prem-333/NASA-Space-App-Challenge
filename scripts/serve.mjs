import http from 'node:http';
import {execFile} from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('dist');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf','.webmanifest':'application/manifest+json'};
const port = Number(process.env.PORT || 4173);
if(!Number.isInteger(port)||port<1||port>65535){console.error('PORT must be a number from 1 to 65535.');process.exit(1);}
const server=http.createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const path = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    const content = await readFile(path);
    res.writeHead(200, {'Content-Type': types[extname(path)] || 'application/octet-stream','Cache-Control':'no-cache'}).end(content);
  } catch { res.writeHead(404,{'Content-Type':'text/plain'}).end('Not found'); }
});
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?`Port ${port} is already in use. Close the previous local server or choose another PORT.`:error.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>{const url=`http://localhost:${port}`;console.log(`Hail Mary ready at ${url}`);if(process.argv.includes('--open')&&process.platform==='win32')execFile('cmd.exe',['/c','start','',url],{windowsHide:true},error=>{if(error)console.log(`Open ${url} in your browser.`);});});
