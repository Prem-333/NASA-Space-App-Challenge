import * as T from 'three';

let reflectionMap=null;
export function studioEnvironment(){
  if(!reflectionMap){
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;
    const c=canvas.getContext('2d'),base=c.createLinearGradient(0,0,0,256);base.addColorStop(0,'#46515b');base.addColorStop(.6,'#171f27');base.addColorStop(1,'#080c10');c.fillStyle=base;c.fillRect(0,0,512,256);
    for(const [x,y,w,h,color] of [[40,35,100,165,'#fff0d4'],[345,50,75,155,'#aacdef'],[160,15,150,12,'#edf4ff']]){c.shadowBlur=14;c.shadowColor=color;c.fillStyle=color;c.fillRect(x,y,w,h);}
    reflectionMap=new T.CanvasTexture(canvas);reflectionMap.mapping=T.EquirectangularReflectionMapping;reflectionMap.colorSpace=T.SRGBColorSpace;
  }
  // CPU-backed texture can be uploaded safely to each new WebGL context.
  return {texture:reflectionMap,dispose(){}};
}

export function starField(mobile=false){
  const count=mobile?1100:2200,positions=[],colors=[],sizes=[];let seed=371;
  const random=()=>((seed=seed*16807%2147483647)/2147483647);
  for(let i=0;i<count;i++){
    const r=85+random()*65,a=random()*Math.PI*2,b=Math.acos(2*random()-1);
    positions.push(r*Math.sin(b)*Math.cos(a),r*Math.cos(b),r*Math.sin(b)*Math.sin(a));
    const color=new T.Color().setHSL(.08+random()*.56,.12+random()*.22,.55+random()*.35);colors.push(color.r,color.g,color.b);sizes.push(i%37===0?3.2:1+random()*1.2);
  }
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.setAttribute('size',new T.Float32BufferAttribute(sizes,1));
  const material=new T.ShaderMaterial({transparent:true,depthWrite:false,vertexColors:true,blending:T.AdditiveBlending,uniforms:{pixelRatio:{value:1}},vertexShader:'attribute float size; varying vec3 tint; uniform float pixelRatio; void main(){tint=color; vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=size*pixelRatio;}',fragmentShader:'varying vec3 tint;void main(){float d=length(gl_PointCoord-vec2(.5))*2.;float a=pow(max(0.,1.-d),2.);gl_FragColor=vec4(tint,a*.85);}'});
  return new T.Points(geometry,material);
}

export function atmosphere(position){
  const material=new T.ShaderMaterial({transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:T.BackSide,vertexShader:'varying vec3 n;varying vec3 v;varying vec3 wn;void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);wn=normalize(mat3(modelMatrix)*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'varying vec3 n;varying vec3 v;varying vec3 wn;void main(){float edge=pow(1.-abs(dot(normalize(n),normalize(v))),3.5);float sun=smoothstep(-.3,.7,dot(normalize(wn),normalize(vec3(-.4,.7,.6))));gl_FragColor=vec4(.14,.42,1.,edge*(.08+sun*.38));}'});
  const shell=new T.Mesh(new T.SphereGeometry(3.64,64,40),material);shell.position.copy(position);return shell;
}

export function contactShadow(){
  const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,2,64,64,62);g.addColorStop(0,'rgba(0,0,0,.65)');g.addColorStop(.45,'rgba(0,0,0,.25)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,128,128);
  const map=new T.CanvasTexture(c),mesh=new T.Mesh(new T.PlaneGeometry(6,6),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false}));mesh.rotation.x=-Math.PI/2;mesh.position.y=-2.27;return {mesh,map};
}

export function makePlume(radius){
  const group=new T.Group(),uniforms=[];
  for(let i=0;i<3;i++){
    const length=2.15+i*.55;
    const material=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,uniforms:{time:{value:0},strength:{value:0},tint:{value:new T.Color(i===0?'#e6f5ff':i===1?'#8ab8ff':'#6c83db')},opacity:{value:i===0?.65:.13}},vertexShader:'varying vec2 vUv;varying vec3 n;varying vec3 v;void main(){vUv=uv;vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'varying vec2 vUv;varying vec3 n;varying vec3 v;uniform float time;uniform float strength;uniform vec3 tint;uniform float opacity;void main(){float tail=pow(1.-vUv.y,1.7);float flow=.82+.18*sin(vUv.y*42.-time*35.);float edge=.35+.65*abs(dot(normalize(n),normalize(v)));gl_FragColor=vec4(tint,tail*flow*edge*opacity*strength);}'});
    const shell=new T.Mesh(new T.ConeGeometry(radius*(.58+i*.18),length,32,8,true),material);shell.rotation.z=Math.PI;shell.position.y=-length/2;group.add(shell);uniforms.push(material.uniforms);
  }
  group.visible=false;return {group,update(time,strength){group.visible=strength>.001;group.scale.y=.55+strength*.65;uniforms.forEach(u=>{u.time.value=time;u.strength.value=strength;});}};
}
