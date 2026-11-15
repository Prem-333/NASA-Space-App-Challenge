import { solarTexture,foilTexture } from './craft-textures.js';
import * as T from 'three';
import { createCraft } from './spacecraft.js';
import { damping,shot,plumeEnvelope,smooth } from './cinematography.js';
import { studioEnvironment,starField,atmosphere,contactShadow } from './scene-effects.js';
import { ROUTE_STEPS } from './playback.js';

const textures=new Map();
function texture(url){if(!textures.has(url)){const tex=new T.TextureLoader().load(url);tex.colorSpace=T.SRGBColorSpace;textures.set(url,tex);}return textures.get(url);}
export function createSpaceScene(host,{kind='flight',design,missionId='orbiter',step=0,motion=true,initialCamera=null,onSelect=()=>{},onReady=()=>{}}={}){
  if(!host)return null;
  let renderer;try{renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});}catch{host.innerHTML='<div class="scene-fallback"><span>✦</span><strong>Mission visualization</strong><p>3D is unavailable on this device. All mission controls and calculations remain available.</p></div>';onReady(false);return {dispose(){},setSample(){},setStage(){},setAuto(){},setView(){},setPaused(){},setMotion(){},setExploded(){},selectSystem(){},setRotation(){},setZoom(){},reset(){}};}
  const mobile=host.clientWidth<600;let pixelRatio=Math.min(devicePixelRatio,mobile?1.5:2);renderer.setPixelRatio(pixelRatio);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;host.append(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden','true');
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(42,1,.05,300);scene.background=new T.Color(kind==='hangar'?'#0b151b':'#050a14');const environment=studioEnvironment(renderer);scene.environment=environment.texture;scene.environmentIntensity=kind==='hangar'?.65:.22;host.dataset.renderQuality=mobile?'balanced':'high';
  scene.add(new T.HemisphereLight('#c3e0ff','#241d15',kind==='hangar'?.75:.38));const sun=new T.DirectionalLight('#fff6e5',3.2);sun.position.set(-8,13,17);scene.add(sun);const rim=new T.DirectionalLight('#afc8e0',2.4);rim.position.set(4,-2,-10);scene.add(rim);
  for(const map of [solarTexture(),texture('./assets/earth.png'),texture('./assets/moon.jpg')])map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const craft=createCraft(design,missionId,solarTexture(),foilTexture());scene.add(craft.group);
  const stars=kind==='flight'?starField(mobile):null;if(stars){stars.material.uniforms.pixelRatio.value=pixelRatio;scene.add(stars);}
  let shadow=null;
  const annotations=[];
  if(kind==='hangar')for(const part of Object.values(craft.systems)){
    if(!part.userData.category)continue;
    const line=new T.Line(new T.BufferGeometry().setFromPoints([part.position,part.position]),new T.LineDashedMaterial({color:'#a5aaa2',transparent:true,opacity:.4,dashSize:.06,gapSize:.04}));
    craft.group.add(line);
    const label=document.createElement('button');label.className='assembly-label';label.type='button';label.textContent=part.userData.label;label.hidden=true;
    label.addEventListener('pointerdown',e=>e.stopPropagation());label.addEventListener('click',()=>onSelect(part.userData.category));host.append(label);
    annotations.push({part,line,label});
  }
  let earth,moon,routeLine,trail,curve;const moonPosition=new T.Vector3(13,0,0);
  function orbit(center,radius,color,rotation=[0,0,0]){const points=[];for(let i=0;i<=160;i++){const a=i/160*Math.PI*2;points.push(new T.Vector3(Math.cos(a)*radius,0,Math.sin(a)*radius));}const o=new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color,transparent:true,opacity:.4}));o.position.copy(center);o.rotation.set(...rotation);scene.add(o);return o;}
  if(kind==='flight'){
    earth=new T.Mesh(new T.SphereGeometry(3.5,96,64),new T.MeshStandardMaterial({map:texture('./assets/earth.png'),roughness:.86,metalness:.03}));earth.position.set(-13,0,0);earth.rotation.z=.12;scene.add(earth);
    scene.add(atmosphere(earth.position));
    moon=new T.Mesh(new T.SphereGeometry(2.2,96,64),new T.MeshStandardMaterial({map:texture('./assets/moon.jpg'),bumpMap:texture('./assets/moon.jpg'),bumpScale:.025,roughness:1}));moon.position.copy(moonPosition);scene.add(moon);
    orbit(earth.position,4.5,'#4a92d0',[.25,0,-.2]);orbit(moon.position,3.3,'#d8dcab',[Math.PI/2,0,.2]);
    const end=missionId==='lander'?new T.Vector3(13,2.76,0):missionId==='flyby'?new T.Vector3(18,1,-1):new T.Vector3(13,3.3,0);
    curve=new T.CubicBezierCurve3(new T.Vector3(-9.6,3.2,0),new T.Vector3(-7,12,-4),new T.Vector3(7,11,-5),end);
    const routeGeometry=new T.BufferGeometry().setFromPoints(curve.getPoints(180));routeLine=new T.Line(routeGeometry,new T.LineDashedMaterial({color:'#8db28f',dashSize:.23,gapSize:.2,transparent:true,opacity:.34}));routeLine.computeLineDistances();scene.add(routeLine);
    trail=new T.Line(routeGeometry.clone(),new T.LineBasicMaterial({color:'#d0f8b5',transparent:true,opacity:.9}));scene.add(trail);craft.group.scale.setScalar(.35);
  }else{
    shadow=contactShadow();scene.add(shadow.mesh);
    const deck=new T.Mesh(new T.CylinderGeometry(4.15,4.15,.06,96),new T.MeshStandardMaterial({color:'#182126',roughness:.7,metalness:.3}));deck.position.y=-2.34;scene.add(deck);
    const grid=new T.GridHelper(14,28,'#3a6159','#203532');grid.position.y=-2.3;grid.material.transparent=true;grid.material.opacity=.5;scene.add(grid);orbit(new T.Vector3(0,-2.28,0),3.8,'#b8d89b');orbit(new T.Vector3(0,-2.28,0),4,'#4d6b5c');
  }
  const wreck=new T.Group();scene.add(wreck);wreck.visible=false;
  const debris=[];
  for(let i=0;i<36;i++){
    const rock=new T.Mesh(new T.TetrahedronGeometry(.035+(i%4)*.018),new T.MeshStandardMaterial({color:i%3?'#77736d':'#ab8a4c',roughness:.85}));
    wreck.add(rock);debris.push(rock);
  }
  const flash=new T.Mesh(new T.SphereGeometry(1,24,16),new T.MeshBasicMaterial({color:'#ffbd68',transparent:true,opacity:.7,depthWrite:false}));wreck.add(flash);
  const failureTrail=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(),new T.Vector3()]),new T.LineBasicMaterial({color:'#ef8b73'}));scene.add(failureTrail);failureTrail.visible=false;
  let disposed=false,visible=true,paused=false,view=kind==='hangar'?'inspection':'cinematic',exploded=false,angle=.48,elevation=.4,zoom=1,rotation=0,auto=motion,time=0,previous=0,frame=0,selected=null,cameraReady=false,cameraDirty=true,slowFrames=0,qualityFrames=0,frameTotal=0;
  let sample={route:ROUTE_STEPS[step],progress:0,burning:false};const target=new T.Vector3(),desired=new T.Vector3(),look=new T.Vector3(),attitude=new T.Quaternion();let desiredFov=42;if(initialCamera){camera.position.fromArray(initialCamera.position);look.fromArray(initialCamera.look);if(curve&&initialCamera.anchor){const shift=curve.getPoint(ROUTE_STEPS[step]).sub(new T.Vector3(...initialCamera.anchor));camera.position.add(shift);look.add(shift);}camera.fov=initialCamera.fov;cameraReady=true;}const raycaster=new T.Raycaster();
  let drag=null,dragged=false;
  let viewportWidth=0,viewportHeight=0;
  function resize(){cameraDirty=true;const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;if(viewportWidth&&(w!==viewportWidth||h!==viewportHeight))cameraReady=false;viewportWidth=w;viewportHeight=h;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  const intersection=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting!==false;});intersection.observe(host);
  function rotate(dx,dy){cameraDirty=true;if(view==='cinematic'){view='follow';host.dispatchEvent(new CustomEvent('cameraoverride',{detail:'follow'}));}angle+=dx;elevation=T.MathUtils.clamp(elevation+dy,-.15,1.2);auto=false;}
  const down=e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY};dragged=false;host.setPointerCapture(e.pointerId);host.classList.add('dragging');};
  const move=e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>2)dragged=true;rotate(-dx*.007,dy*.005);drag={x:e.clientX,y:e.clientY};};
  const up=e=>{if(!drag)return;drag=null;host.classList.remove('dragging');if(!dragged&&kind==='hangar'){const rect=host.getBoundingClientRect();raycaster.setFromCamera(new T.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);const hits=raycaster.intersectObjects(craft.pickables);if(hits[0])onSelect(hits[0].object.userData.category);}if(host.hasPointerCapture(e.pointerId))host.releasePointerCapture(e.pointerId);};
  const key=e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','=','Home'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')rotate(-.15,0);if(e.key==='ArrowRight')rotate(.15,0);if(e.key==='ArrowUp')rotate(0,.1);if(e.key==='ArrowDown')rotate(0,-.1);if(e.key==='+'||e.key==='=')zoom=Math.max(.55,zoom-.1);if(e.key==='-')zoom=Math.min(1.7,zoom+.1);if(e.key==='Home'){angle=.48;elevation=.4;zoom=1;}}};
  host.addEventListener('pointerdown',down);host.addEventListener('pointermove',move);host.addEventListener('pointerup',up);host.addEventListener('pointercancel',up);host.addEventListener('keydown',key);
  function draw(now){if(disposed)return;frame=requestAnimationFrame(draw);const elapsed=previous?(now-previous)/1000:0,dt=Math.min(elapsed,.05);previous=now;if(!visible||document.hidden||(paused&&!cameraDirty&&cameraReady))return;if(!paused&&motion)time+=dt;
    if(!paused&&motion&&elapsed>0){qualityFrames++;frameTotal+=elapsed;slowFrames+=elapsed>.04?1:0;if(qualityFrames===120){host.dataset.frameMs=String(Math.round(frameTotal/qualityFrames*1000));if(slowFrames>75&&pixelRatio>1){pixelRatio=Math.max(1,pixelRatio-.35);renderer.setPixelRatio(pixelRatio);if(stars)stars.material.uniforms.pixelRatio.value=pixelRatio;resize();host.dataset.renderQuality='adaptive';}qualityFrames=0;slowFrames=0;frameTotal=0;}}
    desiredFov=42;
    if(kind==='hangar'){
      rotation+=auto&&!paused&&motion?dt*.1:0;craft.group.rotation.y=rotation;craft.group.position.y=motion&&!paused?Math.sin(time*.75)*.05:0;target.set(0,0,0);const distance=(exploded?12.5:9.4)*zoom*Math.max(1,1.15/camera.aspect);desired.set(Math.sin(angle)*Math.cos(elevation)*distance,Math.sin(elevation)*distance,Math.cos(angle)*Math.cos(elevation)*distance);
      for(const g of Object.values(craft.systems)){
        const home=g.userData.home.clone();if(exploded)home.add(g.userData.offset);
        g.position.lerp(home,motion?damping(dt,7):1);
      }
      for(const entry of annotations){
        entry.line.visible=exploded;
        const a=entry.line.geometry.attributes.position;a.setXYZ(0,...entry.part.userData.home.toArray());a.setXYZ(1,...entry.part.position.toArray());a.needsUpdate=true;entry.line.computeLineDistances();
        const p=entry.part.getWorldPosition(new T.Vector3()).project(camera);
        entry.label.hidden=!exploded;
        entry.label.style.left=`${(p.x*.5+.5)*host.clientWidth}px`;
        entry.label.style.top=`${(-p.y*.5+.5)*host.clientHeight}px`;
      }
    }else{
      const position=curve.getPoint(T.MathUtils.clamp(sample.route,0,1));craft.group.position.copy(position);const tangent=curve.getTangent(sample.route).normalize();attitude.setFromUnitVectors(new T.Vector3(0,1,0),step===3&&missionId!=='flyby'?tangent.clone().negate():tangent);
      if(sample.route>=1&&step>=4&&missionId==='orbiter'&&!sample.burning){const a=motion?time*.14:0;craft.group.position.set(13,Math.cos(a)*3.3,Math.sin(a)*3.3);attitude.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(0,-Math.sin(a),Math.cos(a)));}
      if(missionId==='lander'&&sample.route>=.85)attitude.slerp(new T.Quaternion(),smooth((sample.route-.85)/.15));
      trail.geometry.setDrawRange(0,Math.max(2,Math.round(sample.route*181)));earth.rotation.y=motion?time*.022:.2;moon.rotation.y=.4;
      const thrust=plumeEnvelope(sample.progress||0,sample.burning);craft.updatePlume(time,thrust);craft.systems.engine.rotation.z=motion&&sample.burning?Math.sin(time*6)*.008:0;
      craft.rcs.forEach((jet,i)=>{jet.visible=!!sample.active&&[1,2].includes(step)&&motion&&Math.sin(time*5+i*1.7)>.88;});
      craft.statusLight.material.color.setScalar(.6+.3*(motion?Math.sin(time*1.8)**12:0));
      if(!paused){craft.wings[0].rotation.y=T.MathUtils.lerp(craft.wings[0].rotation.y,step===2&&!sample.burning?.42:Math.sin(time*.12)*.025,motion?damping(dt,3):1);craft.systems.comms.rotation.y=motion?Math.sin(time*.08)*.08:0;}
      // Outcome presentation follows the committed result, including after reload.
      craft.group.visible=true;wreck.visible=false;failureTrail.visible=!!sample.outcome;
      if(sample.outcome){
        const p=T.MathUtils.clamp(sample.eventProgress??1,0,1),origin=curve.getPoint(sample.originRoute??sample.route);
        const impact=sample.outcome==='impact',endpoint=impact?new T.Vector3(13,2.15,0):new T.Vector3(27,12,-5);
        const travel=impact?Math.min(1,p/.65):p;
        craft.group.position.copy(origin).lerp(endpoint,travel);
        attitude.setFromUnitVectors(new T.Vector3(0,1,0),endpoint.clone().sub(origin).normalize());if(!impact&&motion)attitude.multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),p*1.8));
        craft.plume.visible=false;
        const positions=failureTrail.geometry.attributes.position;positions.setXYZ(0,...origin.toArray());positions.setXYZ(1,...craft.group.position.toArray());positions.needsUpdate=true;
        if(impact&&p>=.65){
          craft.group.visible=false;wreck.visible=true;wreck.position.copy(endpoint);
          const burst=(p-.65)/.35;
          flash.scale.setScalar(.08+Math.sqrt(burst)*.8);flash.material.opacity=Math.max(0,1-burst*4)*.65;
          debris.forEach((d,i)=>{const a=i*2.39996,r=(.1+burst*1.4)*(1+(i%5)*.12);d.position.set(Math.cos(a)*r,Math.max(.035,burst*(1.4+(i%7)*.16)-burst*burst*1.35),Math.sin(a)*r);d.rotation.set(i+burst*2,i*.7,burst*3);});
        }
      }
      if(!cameraReady||!motion)craft.group.quaternion.copy(attitude);else if(!paused)craft.group.quaternion.slerp(attitude,damping(dt,7));
      if(view==='cinematic'){
        const framing=shot({stage:step,progress:sample.active?sample.progress:0,time,burning:sample.burning,outcome:sample.outcome,aspect:camera.aspect,motion});
        const center=sample.outcome==='impact'?new T.Vector3(13,2.3,0):craft.group.position;target.copy(center).addScaledVector(tangent,framing.lead);
        desired.copy(center).add(new T.Vector3(Math.sin(framing.azimuth)*framing.distance*zoom,framing.height,Math.cos(framing.azimuth)*framing.distance*zoom));
        desired.x+=Math.sin(time*19)*framing.impulse;desired.y+=Math.cos(time*23)*framing.impulse;desiredFov=framing.fov;craft.group.scale.setScalar(.35);
      }else if(view==='follow'){target.copy(craft.group.position);desired.copy(target).add(new T.Vector3(Math.sin(angle)*4.8*zoom,2.1+elevation*2,Math.cos(angle)*4.8*zoom));craft.group.scale.setScalar(.35);}
      else if(view==='moon'){target.copy(moonPosition);desired.copy(target).add(new T.Vector3(Math.sin(angle)*10*zoom,3+elevation*6,Math.cos(angle)*10*zoom));craft.group.scale.setScalar(.35);}
      else{target.set(0,2,0);const distance=(camera.aspect<1.1?57:40)*zoom;desired.set(Math.sin(angle*.35)*distance,10+elevation*12,Math.cos(angle*.35)*distance);craft.group.scale.setScalar(missionId==='lander'?.35:.5);}
      if(sample.outcome&&view!=='cinematic'){
        target.copy(sample.outcome==='impact'?new T.Vector3(13,2.3,0):craft.group.position);
        desired.copy(target).add(new T.Vector3(3.8*zoom,3.4,7*zoom));craft.group.scale.setScalar(.35);
      }
    }
    if(!cameraReady||!motion||(paused&&cameraDirty)){camera.position.copy(desired);look.copy(target);camera.fov=desiredFov;}else if(!paused){const blend=damping(dt,3.8);camera.position.lerp(desired,blend);look.lerp(target,blend);camera.fov=T.MathUtils.lerp(camera.fov,desiredFov,blend);}
    camera.lookAt(look);camera.updateProjectionMatrix();cameraReady=true;cameraDirty=false;renderer.render(scene,camera);
  }
  frame=requestAnimationFrame(draw);onReady(true);
  const api={
    getCameraState(){return {position:camera.position.toArray(),look:look.toArray(),anchor:craft.group.position.toArray(),fov:camera.fov};},
    setSample(value){sample={...sample,...value};},setStage(value){step=value;},setView(value){cameraDirty=true;view=value;angle=.48;elevation=.4;zoom=1;},setPaused(value){paused=value;},setMotion(value){motion=value;auto=value;},
    setExploded(value){exploded=value;if(value)auto=false;},setRotation(value){cameraDirty=true;auto=false;rotation=value*Math.PI/180;},setAuto(value){auto=value;},setZoom(value){zoom=T.MathUtils.clamp(value,.55,1.7);},
    reset(){cameraDirty=true;exploded=false;angle=.48;elevation=.4;zoom=1;rotation=0;auto=motion;},
    selectSystem(id){selected=id;for(const m of craft.pickables){if(m.material.emissive){m.material.emissive.set(m.userData.category===selected?'#64725c':'#000000');m.material.emissiveIntensity=m.userData.category===selected?.15:0;}}},
    dispose(){environment.dispose();shadow?.map.dispose();annotations.forEach(a=>a.label.remove());Object.values(craft.materials).forEach(m=>m.dispose());disposed=true;cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();host.removeEventListener('pointerdown',down);host.removeEventListener('pointermove',move);host.removeEventListener('pointerup',up);host.removeEventListener('pointercancel',up);host.removeEventListener('keydown',key);scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}
  };return api;
}

