import * as T from 'three';

// A deterministic, illustrative impact. No atmospheric smoke or shockwave.
// Normalized progress drives every effect so pause, skip and reload agree.
export function createImpact(craft){
  const group=new T.Group();group.visible=false;
  let seed=493;const random=()=>((seed=seed*16807%2147483647)/2147483647);
  const parts=[];
  for(const source of Object.values(craft.systems)){
    const part=source.clone(true);part.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.material=o.material.clone();if(o.material.color)o.material.color.multiplyScalar(.48);if(o.material.emissive)o.material.emissive.set('#000000');}if(o.material?.isShaderMaterial)o.visible=false;});
    const home=source.position.clone(),angle=random()*Math.PI*2;
    group.add(part);parts.push({part,home,vx:Math.cos(angle)*(.6+random()),vz:Math.sin(angle)*(.6+random()),vy:1.4+random()*1.5,spin:new T.Vector3(random()-.5,random()-.5,random()-.5).multiplyScalar(4)});
  }
  const shards=new T.InstancedMesh(new T.BoxGeometry(1,1,1),new T.MeshStandardMaterial({color:'#b6a68b',metalness:.65,roughness:.55}),90),dummy=new T.Object3D();shards.castShadow=true;shards.receiveShadow=true;group.add(shards);
  const trajectories=Array.from({length:90},(_,i)=>{const a=i*2.399963;return {vx:Math.cos(a)*(.6+random()*1.5),vz:Math.sin(a)*(.6+random()*1.5),vy:1+random()*2,size:.025+random()*.1,spin:random()*6};});
  const flash=new T.Mesh(new T.SphereGeometry(1,32,24),new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:{age:{value:0}},vertexShader:'varying vec3 normalV; varying vec3 viewV; void main(){vec4 p=modelViewMatrix*vec4(position,1.);normalV=normalize(normalMatrix*normal);viewV=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'uniform float age; varying vec3 normalV; varying vec3 viewV;void main(){float edge=pow(abs(dot(normalize(normalV),normalize(viewV))),1.5);float a=exp(-age*5.)*edge;gl_FragColor=vec4(mix(vec3(1.,.29,.055),vec3(1.,.94,.72),edge),a);}'}));flash.position.y=.3;group.add(flash);
  const light=new T.PointLight('#ffd4a0',0,12,2);light.position.y=.8;group.add(light);
  const decal=document.createElement('canvas');decal.width=decal.height=256;const c=decal.getContext('2d'),gradient=c.createRadialGradient(128,128,5,128,128,120);gradient.addColorStop(0,'rgba(8,7,6,.92)');gradient.addColorStop(.3,'rgba(22,19,16,.8)');gradient.addColorStop(.65,'rgba(32,28,24,.45)');gradient.addColorStop(1,'rgba(32,28,24,0)');c.fillStyle=gradient;c.fillRect(0,0,256,256);
  for(let i=0;i<110;i++){const a=random()*Math.PI*2,r=30+random()*80;c.strokeStyle='rgba(15,13,11,.15)';c.lineWidth=1+random()*4;c.beginPath();c.moveTo(128+Math.cos(a)*r*.4,128+Math.sin(a)*r*.4);c.lineTo(128+Math.cos(a)*r,128+Math.sin(a)*r);c.stroke();}
  const scarMap=new T.CanvasTexture(decal),scar=new T.Mesh(new T.PlaneGeometry(8,8),new T.MeshBasicMaterial({map:scarMap,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));scar.rotation.x=-Math.PI/2;scar.position.y=.015;group.add(scar);
  const count=320,positions=new Float32Array(count*3),sizes=new Float32Array(count),dustData=[];
  for(let i=0;i<count;i++){const a=i*2.399963;dustData.push({x:Math.cos(a),z:Math.sin(a),speed:.6+random()*1.7,vy:.4+random()*1.2,delay:random()*.18});sizes[i]=120+random()*160;}
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(positions,3));geometry.setAttribute('size',new T.BufferAttribute(sizes,1));
  const dust=new T.Points(geometry,new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{opacity:{value:0}},vertexShader:'attribute float size; varying float shade; void main(){vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(size/max(1.,-p.z)*2.,1.,32.);shade=.7+fract(size)*.3;}',fragmentShader:'uniform float opacity;varying float shade;void main(){float r=length(gl_PointCoord-.5)*2.;float a=pow(max(0.,1.-r*r),2.)*opacity;gl_FragColor=vec4(vec3(.58,.55,.50)*shade,a);}'}));dust.frustumCulled=false;group.add(dust);
  const sparkPositions=new Float32Array(60*6),sparks=new T.LineSegments(new T.BufferGeometry(),new T.LineBasicMaterial({color:'#ffc184',transparent:true,opacity:1,blending:T.AdditiveBlending,depthWrite:false}));sparks.geometry.setAttribute('position',new T.BufferAttribute(sparkPositions,3));sparks.frustumCulled=false;group.add(sparks);
  function path(v,t){const hit=2*v.vy/1.62,u=Math.min(t,hit);return [v.vx*u,Math.max(.035,v.vy*u-.81*u*u),v.vz*u];}
  function update(progress,{motion=true}={}){
    const p=T.MathUtils.clamp(progress,0,1),t=p*5;group.visible=true;
    flash.visible=motion&&t<.65;flash.scale.setScalar(.2+Math.sqrt(Math.min(t,.65))*2.5);flash.material.uniforms.age.value=t;light.intensity=motion?22*Math.exp(-t*12):0;
    scar.scale.setScalar(.25+Math.min(1,t*2)*.75);scar.material.opacity=Math.min(1,t*4);
    for(const d of parts){const pos=path(d,t),spinTime=Math.min(t,2*d.vy/1.62);d.part.position.set(pos[0]+d.home.x,Math.max(.13,pos[1]+d.home.y*.2),pos[2]+d.home.z);d.part.rotation.set(d.spin.x*spinTime,d.spin.y*spinTime,d.spin.z*spinTime);d.part.scale.setScalar(.8);}
    trajectories.forEach((v,i)=>{const pos=path(v,t);dummy.position.set(...pos);dummy.rotation.set(v.spin*Math.min(t,2*v.vy/1.62),i,Math.min(t,2*v.vy/1.62)*.8);dummy.scale.set(v.size,v.size*.18,v.size*2);dummy.updateMatrix();shards.setMatrixAt(i,dummy.matrix);});shards.instanceMatrix.needsUpdate=true;
    dustData.forEach((v,i)=>{const age=Math.max(0,t-v.delay),hit=2*v.vy/1.62,u=Math.min(age,hit);positions[i*3]=v.x*(.2+v.speed*u);positions[i*3+1]=Math.max(.02,v.vy*u-.81*u*u);positions[i*3+2]=v.z*(.2+v.speed*u);});geometry.attributes.position.needsUpdate=true;dust.material.uniforms.opacity.value=Math.min(1,t*6)*Math.max(0,1-t/4.5)*.55;
    for(let i=0;i<60;i++){const v=trajectories[i],a=path(v,t),b=path(v,Math.max(0,t-.055));sparkPositions.set(a,i*6);sparkPositions.set(b,i*6+3);}sparks.geometry.attributes.position.needsUpdate=true;sparks.material.opacity=motion?Math.max(0,1-t/1.1):0;
    group.userData.phase=t<.25?'contact':t<1.5?'breakup':t<3.8?'ejecta':'settled';
  }
  return {group,update,dispose(){scarMap.dispose();}};
}
