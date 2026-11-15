import * as T from 'three';
const textures=new Map();
export function foilTexture(){
  if(textures.has('foil'))return textures.get('foil');
  const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle='#888';x.fillRect(0,0,256,256);
  let seed=83;const rand=()=>((seed=seed*16807%2147483647)/2147483647);
  for(let i=0;i<1400;i++){const a=rand()*256,b=rand()*256,v=90+Math.floor(rand()*80);x.fillStyle=`rgb(${v},${v},${v})`;x.beginPath();x.moveTo(a,b);x.lineTo(a+rand()*24,b+rand()*8);x.lineTo(a+rand()*10,b+rand()*25);x.fill();}
  const t=new T.CanvasTexture(c);textures.set('foil',t);return t;
}
export function solarTexture(){if(textures.has('solar'))return textures.get('solar');const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle='#173354';ctx.fillRect(0,0,512,256);for(let x=0;x<512;x+=32)for(let y=0;y<256;y+=32){ctx.fillStyle=(x+y)%64?'#224d77':'#1d416b';ctx.fillRect(x+2,y+2,28,28);ctx.strokeStyle='#627d98';ctx.lineWidth=.7;ctx.strokeRect(x+2,y+2,28,28);ctx.strokeStyle='#314f72';for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(x+4,y+6+i*4);ctx.lineTo(x+28,y+6+i*4);ctx.stroke();}}const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;textures.set('solar',tex);return tex;}
