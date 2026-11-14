import { writeFile, readFile } from 'node:fs/promises';
const response=await fetch('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap', {headers:{'User-Agent':'Mozilla/5.0'}});
if(!response.ok)throw new Error('Could not download font styles');
let css=await response.text();
const urls=[...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map(m=>m[1]))];
for(let i=0;i<urls.length;i++){
  const r=await fetch(urls[i]);if(!r.ok)throw new Error('Font download failed');
  const ext=urls[i].endsWith('.woff2')?'woff2':'ttf',filename=`font-${i}.${ext}`;
  await writeFile(`dist/assets/${filename}`,Buffer.from(await r.arrayBuffer()));
  css=css.replaceAll(urls[i],`./${filename}`);
}
await writeFile('dist/assets/fonts.css',css);
const original=await readFile('dist/style.css','utf8');
await writeFile('dist/style.css',original.replace(/^@import[^;]+(?:;[^']*)?'\);\r?\n/,"@import url('./assets/fonts.css');\n"));
// Use a direct first-line replacement because Google URLs contain semicolons.
const latest=await readFile('dist/style.css','utf8');
if(latest.startsWith("@import url('https://"))await writeFile('dist/style.css',"@import url('./assets/fonts.css');\n"+latest.split('\n').slice(1).join('\n'));
for(const [name,url]of [['DM-Sans','https://raw.githubusercontent.com/google/fonts/main/ofl/dmsans/OFL.txt'],['Space-Grotesk','https://raw.githubusercontent.com/google/fonts/main/ofl/spacegrotesk/OFL.txt']]){
  const r=await fetch(url);if(!r.ok)throw new Error('Font license download failed');await writeFile(`docs/${name}-LICENSE.txt`,await r.text());
}
console.log(`Bundled ${urls.length} fonts and their licenses. Runtime fonts require no external requests.`);
