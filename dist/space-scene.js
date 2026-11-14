import * as T from 'three';
import { ROUTE_STEPS } from './playback.js';

const textures=new Map();
function texture(url){if(!textures.has(url)){const tex=new T.TextureLoader().load(url);tex.colorSpace=T.SRGBColorSpace;textures.set(url,tex);}return textures.get(url);}
function solarTexture(){if(textures.has('solar'))return textures.get('solar');const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle='#173354';ctx.fillRect(0,0,512,256);for(let x=0;x<512;x+=32)for(let y=0;y<256;y+=32){ctx.fillStyle=(x+y)%64?'#224d77':'#1d416b';ctx.fillRect(x+2,y+2,28,28);ctx.strokeStyle='#627d98';ctx.lineWidth=.7;ctx.strokeRect(x+2,y+2,28,28);ctx.strokeStyle='#314f72';for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(x+4,y+6+i*4);ctx.lineTo(x+28,y+6+i*4);ctx.stroke();}}const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;textures.set('solar',tex);return tex;}
function createCraft(design,missionId){
  const group=new T.Group(),systems={},pickables=[];
  const materials={gold:new T.MeshStandardMaterial({color:'#c6aa66',metalness:.8,roughness:.4}),silver:new T.MeshStandardMaterial({color:'#c3cbd1',metalness:.75,roughness:.28}),dark:new T.MeshStandardMaterial({color:'#172333',metalness:.7,roughness:.35}),blue:new T.MeshStandardMaterial({map:solarTexture(),metalness:.55,roughness:.4,side:T.DoubleSide}),white:new T.MeshStandardMaterial({color:'#d3dbd7',metalness:.25,roughness:.65}),lens:new T.MeshStandardMaterial({color:'#305b78',metalness:.95,roughness:.12,emissive:'#0c3550',emissiveIntensity:.5})};
  function system(id,offset){const g=new T.Group();g.userData.category=id;g.position.copy(offset);g.userData.home=offset.clone();systems[id]=g;group.add(g);return g;}
  function mesh(geometry,mat,parent,pos=[0,0,0],rotation=[0,0,0]){const m=new T.Mesh(geometry,materials[mat].clone());m.position.set(...pos);m.rotation.set(...rotation);m.userData.category=parent.userData.category;parent.add(m);if(m.userData.category)pickables.push(m);return m;}
  const bus=system('battery',new T.Vector3(0,0,0));
  mesh(new T.CylinderGeometry(.8,.8,1.4,6),'gold',bus,[0,0,0]);
  mesh(new T.CylinderGeometry(.84,.84,.1,6),'silver',bus,[0,.68,0]);mesh(new T.CylinderGeometry(.84,.84,.1,6),'silver',bus,[0,-.68,0]);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;mesh(new T.BoxGeometry(.035,1.35,.04),'silver',bus,[Math.sin(a)*.81,0,Math.cos(a)*.81]);}
  mesh(new T.BoxGeometry(.6,.43,.07),'dark',bus,[0,-.05,.72]);
  const batSize={small:.3,medium:.45,large:.62}[design.battery];mesh(new T.BoxGeometry(.6,batSize,.35),'white',bus,[0,-.2,-.82]);
  const engine=system('engine',new T.Vector3(0,-1.05,0));
  mesh(new T.CylinderGeometry(.19,design.engine==='cryo'?.43:.32,.55,24,1,true),'dark',engine,[0,0,0]);
  mesh(new T.TorusGeometry(design.engine==='cryo'?.43:.32,.025,8,32),'silver',engine,[0,-.275,0],[Math.PI/2,0,0]);
  const plume=new T.Group();engine.add(plume);plume.position.y=-.28;plume.visible=false;
  for(let i=0;i<3;i++){const material=new T.MeshBasicMaterial({color:i===0?'#e6fcff':i===1?'#60c6ff':'#eeaa68',transparent:true,opacity:i===0?.85:.2,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide});const m=new T.Mesh(new T.ConeGeometry(.26+i*.09,1.8+i*.45,24,1,true),material);m.rotation.z=Math.PI;m.position.y=-.9-i*.2;plume.add(m);}
  const power=system('power',new T.Vector3(0,.1,0));const span={compact:1.4,extended:2,redundant:2.6}[design.power];
  const wings=[];for(const sign of [-1,1]){const wing=new T.Group();wing.position.x=sign*.8;power.add(wing);wing.userData.sign=sign;wings.push(wing);mesh(new T.CylinderGeometry(.035,.035,span+.3,8),'silver',wing,[sign*span*.5,0,0],[0,0,Math.PI/2]);mesh(new T.BoxGeometry(span,1.25,.065),'blue',wing,[sign*(span*.5+.2),0,0]);for(const y of [-.63,.63])mesh(new T.BoxGeometry(span,.035,.09),'silver',wing,[sign*(span*.5+.2),y,0]);}
  const comms=system('comms',new T.Vector3(0,1.05,0));
  mesh(new T.CylinderGeometry(.035,.035,.55,8),'silver',comms,[0,0,0]);
  if(design.comms==='basic')mesh(new T.BoxGeometry(.45,.05,.45),'white',comms,[0,.3,0]);
  else{mesh(new T.SphereGeometry(design.comms==='relay'?.58:.46,28,16,0,Math.PI*2,0,.95),'white',comms,[0,.1,0],[Math.PI,0,0]);mesh(new T.CylinderGeometry(.018,.018,.55,8),'silver',comms,[0,.42,0]);mesh(new T.SphereGeometry(.055,10,10),'gold',comms,[0,.68,0]);if(design.comms==='relay')mesh(new T.BoxGeometry(.3,.18,.2),'white',comms,[.42,0,0]);}
  const payload=system('payload',new T.Vector3(0,0,.82));
  design.payload.forEach((id,i)=>{const x=(i-(design.payload.length-1)/2)*.42;mesh(new T.BoxGeometry(.34,id==='radar'?.65:.35,.26),'white',payload,[x,.08,.05]);mesh(new T.CylinderGeometry(.12,.12,.15,18),'lens',payload,[x,.08,.24],[Math.PI/2,0,0]);if(id==='radar'){mesh(new T.BoxGeometry(1.2,.035,.04),'silver',payload,[0,-.4,.2]);}});
  if(missionId==='lander'){for(let i=0;i<4;i++){const leg=new T.Group();leg.rotation.y=i*Math.PI/2+Math.PI/4;group.add(leg);mesh(new T.CylinderGeometry(.035,.035,1.4,8),'silver',leg,[1,-.9,0],[0,0,-.55]);mesh(new T.CylinderGeometry(.22,.28,.06,16),'gold',leg,[1.36,-1.48,0]);}}
  return {group,systems,pickables,plume,wings,materials};
}
export function createSpaceScene(host,{kind='flight',design,missionId='orbiter',step=0,motion=true,onSelect=()=>{},onReady=()=>{}}={}){
  if(!host)return null;
  let renderer;try{renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});}catch{host.innerHTML='<div class="scene-fallback"><span>✦</span><strong>Mission visualization</strong><p>3D is unavailable on this device. All mission controls and calculations remain available.</p></div>';onReady(false);return {dispose(){},setSample(){},setView(){},setPaused(){},setMotion(){},setExploded(){},selectSystem(){},setRotation(){},setZoom(){},reset(){}};}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;host.append(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden','true');
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(42,1,.05,300);scene.background=new T.Color(kind==='hangar'?'#0b151b':'#050a14');scene.fog=new T.FogExp2('#060b15',.0018);
  scene.add(new T.HemisphereLight('#c3e0ff','#4d3e29',1.25));const sun=new T.DirectionalLight('#fff1d5',4.2);sun.position.set(-8,13,17);scene.add(sun);const rim=new T.DirectionalLight('#68b5ff',2);rim.position.set(4,-2,-10);scene.add(rim);
  const craft=createCraft(design,missionId);scene.add(craft.group);
  const starData=[];let seed=371;const rand=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};for(let i=0;i<1000;i++){const r=70+rand()*60,a=rand()*Math.PI*2,b=Math.acos(2*rand()-1);starData.push(r*Math.sin(b)*Math.cos(a),r*Math.cos(b),r*Math.sin(b)*Math.sin(a));}const stars=new T.BufferGeometry();stars.setAttribute('position',new T.Float32BufferAttribute(starData,3));scene.add(new T.Points(stars,new T.PointsMaterial({color:'#b8cee9',size:.11,transparent:true,opacity:.8,sizeAttenuation:true})));
  let earth,moon,routeLine,trail,curve;const moonPosition=new T.Vector3(13,0,0);
  function orbit(center,radius,color,rotation=[0,0,0]){const points=[];for(let i=0;i<=160;i++){const a=i/160*Math.PI*2;points.push(new T.Vector3(Math.cos(a)*radius,0,Math.sin(a)*radius));}const o=new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color,transparent:true,opacity:.4}));o.position.copy(center);o.rotation.set(...rotation);scene.add(o);return o;}
  if(kind==='flight'){
    earth=new T.Mesh(new T.SphereGeometry(3.5,64,40),new T.MeshStandardMaterial({map:texture('./assets/earth.png'),roughness:.86,metalness:.03}));earth.position.set(-13,0,0);earth.rotation.z=.12;scene.add(earth);
    const atmosphere=new T.Mesh(new T.SphereGeometry(3.58,48,32),new T.ShaderMaterial({transparent:true,blending:T.AdditiveBlending,depthWrite:false,uniforms:{},vertexShader:'varying vec3 n;varying vec3 v;void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'varying vec3 n;varying vec3 v;void main(){float r=pow(1.-max(0.,dot(n,v)),3.);gl_FragColor=vec4(.2,.55,1.,r*.6);}'}));atmosphere.position.copy(earth.position);scene.add(atmosphere);
    moon=new T.Mesh(new T.SphereGeometry(2.2,64,40),new T.MeshStandardMaterial({map:texture('./assets/moon.jpg'),roughness:1}));moon.position.copy(moonPosition);scene.add(moon);
    orbit(earth.position,4.5,'#4a92d0',[.25,0,-.2]);orbit(moon.position,3.3,'#d8dcab',[Math.PI/2,0,.2]);
    const end=missionId==='lander'?new T.Vector3(13,2.76,0):missionId==='flyby'?new T.Vector3(18,1,-1):new T.Vector3(13,3.3,0);
    curve=new T.CubicBezierCurve3(new T.Vector3(-9.6,3.2,0),new T.Vector3(-7,12,-4),new T.Vector3(7,11,-5),end);
    const routeGeometry=new T.BufferGeometry().setFromPoints(curve.getPoints(180));routeLine=new T.Line(routeGeometry,new T.LineDashedMaterial({color:'#8db28f',dashSize:.23,gapSize:.2,transparent:true,opacity:.34}));routeLine.computeLineDistances();scene.add(routeLine);
    trail=new T.Line(routeGeometry.clone(),new T.LineBasicMaterial({color:'#d0f8b5',transparent:true,opacity:.9}));scene.add(trail);craft.group.scale.setScalar(.35);
  }else{
    const grid=new T.GridHelper(14,28,'#3a6159','#203532');grid.position.y=-2.3;grid.material.transparent=true;grid.material.opacity=.5;scene.add(grid);orbit(new T.Vector3(0,-2.28,0),3.8,'#b8d89b');orbit(new T.Vector3(0,-2.28,0),4,'#4d6b5c');
  }
  let disposed=false,visible=true,paused=false,view=kind==='hangar'?'inspection':'overview',exploded=false,angle=.48,elevation=.4,zoom=1,rotation=0,auto=motion,time=0,previous=0,frame=0,selected=null;
  let sample={route:ROUTE_STEPS[step],progress:0,burning:false};const target=new T.Vector3(),desired=new T.Vector3();const raycaster=new T.Raycaster();
  let drag=null,dragged=false;
  function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  const intersection=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting!==false;});intersection.observe(host);
  function rotate(dx,dy){angle+=dx;elevation=T.MathUtils.clamp(elevation+dy,-.15,1.2);auto=false;}
  const down=e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY};dragged=false;host.setPointerCapture(e.pointerId);host.classList.add('dragging');};
  const move=e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>2)dragged=true;rotate(-dx*.007,dy*.005);drag={x:e.clientX,y:e.clientY};};
  const up=e=>{if(!drag)return;drag=null;host.classList.remove('dragging');if(!dragged&&kind==='hangar'){const rect=host.getBoundingClientRect();raycaster.setFromCamera(new T.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);const hits=raycaster.intersectObjects(craft.pickables);if(hits[0])onSelect(hits[0].object.userData.category);}if(host.hasPointerCapture(e.pointerId))host.releasePointerCapture(e.pointerId);};
  const key=e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','=','Home'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')rotate(-.15,0);if(e.key==='ArrowRight')rotate(.15,0);if(e.key==='ArrowUp')rotate(0,.1);if(e.key==='ArrowDown')rotate(0,-.1);if(e.key==='+'||e.key==='=')zoom=Math.max(.55,zoom-.1);if(e.key==='-')zoom=Math.min(1.7,zoom+.1);if(e.key==='Home'){angle=.48;elevation=.4;zoom=1;}}};
  host.addEventListener('pointerdown',down);host.addEventListener('pointermove',move);host.addEventListener('pointerup',up);host.addEventListener('pointercancel',up);host.addEventListener('keydown',key);
  function draw(now){if(disposed)return;frame=requestAnimationFrame(draw);const dt=previous?Math.min((now-previous)/1000,.05):0;previous=now;if(!visible||document.hidden)return;if(!paused&&motion)time+=dt;
    if(kind==='hangar'){
      rotation+=auto&&!paused&&motion?dt*.1:0;craft.group.rotation.y=rotation;craft.group.position.y=motion&&!paused?Math.sin(time*.75)*.05:0;target.set(0,0,0);const distance=9*zoom;desired.set(Math.sin(angle)*Math.cos(elevation)*distance,Math.sin(elevation)*distance,Math.cos(angle)*Math.cos(elevation)*distance);
      for(const [id,g]of Object.entries(craft.systems)){const home=g.userData.home.clone();if(exploded){if(id==='engine')home.y-=1.1;if(id==='comms')home.y+=1.2;if(id==='power')home.x-=1.2;if(id==='payload')home.z+=1.2;if(id==='battery')home.y+=.1;}g.position.lerp(home,motion?.1:1);}
    }else{
      const position=curve.getPoint(sample.route);craft.group.position.copy(position);const tangent=curve.getTangent(sample.route).normalize();craft.group.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),tangent);
      if(sample.route>=1&&step>=4&&missionId==='orbiter'&&!sample.burning){const a=motion?time*.14:0;craft.group.position.set(13,Math.cos(a)*3.3,Math.sin(a)*3.3);craft.group.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(0,-Math.sin(a),Math.cos(a)));}
      if(missionId==='lander'&&sample.route>=.98)craft.group.quaternion.slerp(new T.Quaternion(),.15);
      trail.geometry.setDrawRange(0,Math.max(2,Math.round(sample.route*181)));earth.rotation.y=motion?time*.022:.2;moon.rotation.y=.4;
      craft.plume.visible=sample.burning;craft.plume.scale.set(1,1+(motion?Math.sin(time*47)*.13:0),1);
      craft.wings[0].rotation.y=step===2&&!sample.burning?.42:Math.sin(time*.25)*.035;
      if(view==='follow'){target.copy(craft.group.position);desired.copy(target).add(new T.Vector3(Math.sin(angle)*4.8*zoom,2.1+elevation*2,Math.cos(angle)*4.8*zoom));craft.group.scale.setScalar(.35);}
      else if(view==='moon'){target.copy(moonPosition);desired.copy(target).add(new T.Vector3(Math.sin(angle)*10*zoom,3+elevation*6,Math.cos(angle)*10*zoom));craft.group.scale.setScalar(.35);}
      else{target.set(0,2,0);const distance=(camera.aspect<1.1?57:40)*zoom;desired.set(Math.sin(angle*.35)*distance,10+elevation*12,Math.cos(angle*.35)*distance);craft.group.scale.setScalar(.5);}
    }
    camera.position.lerp(desired,previous===now&&!camera.position.length()?1:motion?.08:1);camera.lookAt(target);renderer.render(scene,camera);
  }
  frame=requestAnimationFrame(draw);onReady(true);
  const api={
    setSample(value){sample={...sample,...value};},setStage(value){step=value;},setView(value){view=value;angle=.48;elevation=.4;zoom=1;},setPaused(value){paused=value;},setMotion(value){motion=value;auto=value;},
    setExploded(value){exploded=value;},setRotation(value){auto=false;rotation=value*Math.PI/180;},setAuto(value){auto=value;},setZoom(value){zoom=T.MathUtils.clamp(value,.55,1.7);},
    reset(){angle=.48;elevation=.4;zoom=1;rotation=0;auto=motion;},
    selectSystem(id){selected=id;for(const m of craft.pickables){if(m.material.emissive){m.material.emissive.set(m.userData.category===selected?'#527b35':'#000000');m.material.emissiveIntensity=m.userData.category===selected?.42:0;}}},
    dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();host.removeEventListener('pointerdown',down);host.removeEventListener('pointermove',move);host.removeEventListener('pointerup',up);host.removeEventListener('pointercancel',up);host.removeEventListener('keydown',key);scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}
  };return api;
}
