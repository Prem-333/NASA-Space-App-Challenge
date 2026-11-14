import {mkdir,copyFile} from 'node:fs/promises';
await mkdir('dist/vendor',{recursive:true});
for(const name of ['three.module.js','three.core.js'])await copyFile(`node_modules/three/build/${name}`,`dist/vendor/${name}`);
await copyFile('node_modules/three/LICENSE','dist/vendor/LICENSE');
console.log('Copied pinned Three.js modules and license into the portable game.');
