import { createImpact } from './impact-effects.js';
import * as T from 'three';
import { createCraft } from './spacecraft.js';
import { solarTexture,foilTexture } from './craft-textures.js';
import { studioEnvironment } from './scene-effects.js';
import { createDescentRenderer as fallback } from './descent-fallback.js';

// World positions are metres. Relief stays outside the flat flight corridor.
export function createDescentRenderer(canvas,{design,marker}={}){
  let renderer;
  try{renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});}
  catch{canvas.dataset.renderer='fallback';return fallback(canvas);}
  canvas.dataset.renderer='3d';renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  const scene=new T.Scene();scene.background=new T.Color('#030509');scene.environment=studioEnvironment().texture;scene.environmentIntensity=.35;
  const camera=new T.PerspectiveCamera(45,1,.2,9000),look=new T.Vector3(),aim=new T.Vector3(),eye=new T.Vector3();
  const sun=new T.DirectionalLight('#fff9f2',3.3);sun.position.set(-160,240,120);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-240,right:240,top:240,bottom:-240,near:1,far:1000});sun.shadow.bias=-.0002;sun.shadow.normalBias=.08;
  scene.add(sun,sun.target,new T.HemisphereLight('#b3c2d8','#35302a',.5));
  const craft=createCraft(design,'lander',solarTexture(),foilTexture());craft.group.scale.setScalar(1.8);scene.add(craft.group);const impact=createImpact(craft);impact.group.scale.setScalar(1.8);scene.add(impact.group);
  craft.group.traverse(o=>{if(o.isMesh&&!o.material.transparent){o.castShadow=true;o.receiveShadow=true;}});
  let seed=731;const rand=()=>((seed=seed*16807%2147483647)/2147483647);
  const groundCanvas=document.createElement('canvas');groundCanvas.width=groundCanvas.height=512;
  const ctx=groundCanvas.getContext('2d'),pixels=ctx.createImageData(512,512);
  for(let i=0;i<pixels.data.length;i+=4){const v=95+rand()*60;pixels.data[i]=v;pixels.data[i+1]=v;pixels.data[i+2]=v;pixels.data[i+3]=255;}ctx.putImageData(pixels,0,0);
  const regolith=new T.CanvasTexture(groundCanvas);regolith.wrapS=regolith.wrapT=T.RepeatWrapping;regolith.repeat.set(180,180);regolith.colorSpace=T.SRGBColorSpace;regolith.anisotropy=4;
  const terrain=new T.PlaneGeometry(6000,6000,320,320);terrain.rotateX(-Math.PI/2);
  const craters=Array.from({length:28},()=>({x:(rand()-.5)*4000,z:(rand()-.5)*4000,r:40+rand()*180}));
  for(let i=0;i<90;i++)craters.push({x:(rand()-.5)*1600,z:(rand()-.5)*1600,r:18+rand()*70});
  const p=terrain.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),fade=T.MathUtils.smoothstep(Math.abs(z),45,220);let h=12+16*Math.sin(x*.004+Math.cos(z*.003))+8*Math.sin(z*.009+x*.006);
    for(const c of craters){const d=Math.hypot(x-c.x,z-c.z)/c.r;h+=c.r*(.13*Math.exp(-(((d-1)/.15)**2))-.16*Math.exp(-((d/.72)**4)));}p.setY(i,fade*h-.04);}
  terrain.computeVertexNormals();const ground=new T.Mesh(terrain,new T.MeshStandardMaterial({map:regolith,bumpMap:regolith,bumpScale:.16,roughness:1,color:'#a5a8ad'}));ground.receiveShadow=true;scene.add(ground);
  const rocks=new T.InstancedMesh(new T.DodecahedronGeometry(1,0),new T.MeshStandardMaterial({color:'#77756f',roughness:1}),110),dummy=new T.Object3D();
  for(let i=0;i<110;i++){const x=(rand()-.5)*800,z=(rand()-.5)*75;dummy.position.set(x,Math.abs(x)<40&&Math.abs(z)<22?-5:.3,z);const r=.3+rand()*1.8;dummy.scale.set(r,r*.6,r*.8);dummy.rotation.set(rand(),rand()*6,rand());dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix);}rocks.castShadow=true;rocks.receiveShadow=true;scene.add(rocks);
  const zone=new T.Mesh(new T.RingGeometry(34.7,35,128),new T.MeshBasicMaterial({color:'#e1c998',transparent:true,opacity:.55,side:T.DoubleSide}));zone.rotation.x=-Math.PI/2;zone.position.y=.06;scene.add(zone);
  for(const x of [-35,35])for(const z of [-17,17]){const mast=new T.Mesh(new T.CylinderGeometry(.12,.12,1.5,8),new T.MeshStandardMaterial({color:'#c8c1ae'}));mast.position.set(x,.75,z);scene.add(mast);const light=new T.Mesh(new T.SphereGeometry(.3,12,8),new T.MeshBasicMaterial({color:'#ffe3a0'}));light.position.set(x,1.6,z);scene.add(light);}
  scene.add(new T.LineSegments(new T.BufferGeometry().setFromPoints([new T.Vector3(-3,.08,0),new T.Vector3(3,.08,0),new T.Vector3(0,.08,-3),new T.Vector3(0,.08,3)]),new T.LineBasicMaterial({color:'#ded2b6'})));
  // Ballistic dust spreads low across the surface; there is no atmosphere.
  const dustPositions=new Float32Array(180*3),dust=new T.Points(new T.BufferGeometry(),new T.PointsMaterial({color:'#b8afa0',size:.28,transparent:true,opacity:0,depthWrite:false}));dust.geometry.setAttribute('position',new T.BufferAttribute(dustPositions,3));scene.add(dust);
  let view='chase',ready=false,last=null,disposed=false,width=0,height=0;
  function draw(s,{throttle=0,steer=0,paused=true,dt=0,time=s.time,motion=true,impactProgress=null}={}){
    if(disposed)return;last={s,options:{throttle,steer,paused,dt:0,time,motion,impactProgress}};
    const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);if(w!==width||h!==height){width=w;height=h;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
    craft.group.position.set(s.x,s.y+2.79,0);craft.group.rotation.z=-steer*.45;craft.updatePlume(time,s.fuel>0?throttle:0);
    const near=1-T.MathUtils.smoothstep(s.y,6,65),portrait=Math.max(1,1.5/camera.aspect);
    if(view==='approach'){aim.set(s.x*.48,Math.max(4,s.y*.48),0);const d=Math.max(90,s.y*1.65,Math.abs(s.x)*1.5)*portrait;eye.set(aim.x+d*.15,aim.y+d*.32,d);}
    else{aim.set(s.x,Math.max(2.5,s.y+1.5),0);eye.set(s.x+13*portrait,s.y+12+near*5,25*portrait);}
    if(impactProgress!==null){eye.z+=impactProgress*7;eye.y+=impactProgress*3;}
    const blend=(!ready||paused||!motion)?1:1-Math.exp(-Math.min(dt,.1)*5);camera.position.lerp(eye,blend);look.lerp(aim,blend);camera.lookAt(look);camera.updateMatrixWorld();ready=true;
    const strength=s.fuel>0?throttle*Math.max(0,1-s.y/28):0;dust.material.opacity=strength*.48;
    for(let i=0;i<180;i++){const a=i*2.39996,t=(time*.55+i/180)%1,r=2+t*26;dustPositions[i*3]=s.x+Math.cos(a)*r;dustPositions[i*3+1]=.1+Math.sin(t*Math.PI)*Math.min(2,r*.1);dustPositions[i*3+2]=Math.sin(a)*r;}dust.geometry.attributes.position.needsUpdate=true;
    if(marker){const target=new T.Vector3(0,1,0).project(camera),px=(target.x*.5+.5)*width,py=(-target.y*.5+.5)*height;marker.style.left=`${T.MathUtils.clamp(px,90,width-90)}px`;marker.style.top=`${T.MathUtils.clamp(py,38,height-38)}px`;marker.textContent=`LANDING ZONE · ${Math.abs(s.x).toFixed(0)} m ${s.x<0?'RIGHT':'LEFT'}`;}
    if(impactProgress!==null&&s.status==='impact'){craft.group.visible=false;dust.visible=false;impact.group.position.set(s.x,.03,0);impact.update(impactProgress,{motion});canvas.dataset.impactPhase=impact.group.userData.phase;}
    canvas.dataset.camera=view;renderer.render(scene,camera);
  }
  const resize=new ResizeObserver(()=>{if(last)draw(last.s,last.options);});resize.observe(canvas);
  return {draw,setView(value){view=value==='approach'?'approach':'chase';ready=false;if(last)draw(last.s,last.options);},dispose(){impact.dispose();disposed=true;resize.disconnect();const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());regolith.dispose();sun.shadow.map?.dispose();renderer.dispose();renderer.forceContextLoss();}};
}
