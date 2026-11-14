import * as T from 'three';

// Conceptual lunar spacecraft: separate serviceable assemblies share selection categories.
export function createCraft(design, missionId, solarMap = null, foilMap = null) {
  const group = new T.Group(), systems = {}, pickables = [], wings = [];
  const materials = {
    gold: new T.MeshStandardMaterial({color: '#ac8641', metalness: .72, roughness: .48, bumpMap: foilMap, bumpScale: .035}),
    silver: new T.MeshStandardMaterial({color: '#b2b6b7', metalness: .72, roughness: .35}),
    dark: new T.MeshStandardMaterial({color: '#25282c', metalness: .65, roughness: .5}),
    blue: new T.MeshStandardMaterial({map: solarMap, color: '#b0bdcf', metalness: .38, roughness: .3, side: T.DoubleSide}),
    white: new T.MeshStandardMaterial({color: '#d9d7cd', metalness: .12, roughness: .8}),
    lens: new T.MeshStandardMaterial({color: '#172b3d', metalness: .9, roughness: .12})
  };
  function system(id, category, home, offset, label) {
    const g = new T.Group(); g.position.fromArray(home);
    g.userData = {category, home: g.position.clone(), offset: new T.Vector3(...offset), label};
    systems[id] = g; group.add(g); return g;
  }
  function mesh(geometry, material, parent, p = [0,0,0], r = [0,0,0]) {
    const m = new T.Mesh(geometry, materials[material].clone()); m.position.set(...p); m.rotation.set(...r);
    m.userData.category = parent.userData.category; parent.add(m);
    if (m.userData.category) pickables.push(m); return m;
  }
  const box = (s, mat, parent, p, r) => mesh(new T.BoxGeometry(...s), mat, parent, p, r);
  const cylinder = (top, bottom, h, mat, parent, p, r) => mesh(new T.CylinderGeometry(top,bottom,h,24),mat,parent,p,r);
  function strut(a,b,r,mat,parent) {
    const start=new T.Vector3(...a),end=new T.Vector3(...b), delta=end.clone().sub(start);
    const m=cylinder(r,r,delta.length(),mat,parent,start.add(end).multiplyScalar(.5).toArray());
    m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize()); return m;
  }
  const bus=system('bus',null,[0,0,0],[0,0,0],'STRUCTURE');
  box([1.25,1.35,1.15],'dark',bus);
  // Individually quilted insulation panels; deterministic wrinkles catch the key light.
  for(const sign of [-1,1]) {
    box([1.29,.06,1.2],'silver',bus,[0,sign*.69,0]);
    for(let row=0;row<6;row++)for(let col=0;col<5;col++) {
      box([.236,.207,.025],'gold',bus,[(col-2)*.245,(row-2.5)*.214,sign*.59],[Math.sin(row*7+col)*.035,Math.cos(col*4+row)*.04,0]);
    }
    box([.028,1.3,1.12],'gold',bus,[sign*.64,0,0]);
    for(const z of [-.58,.58]) {
      box([.045,1.39,.045],'silver',bus,[sign*.63,0,z]);
      for(const y of [-.62,-.3,0,.3,.62])cylinder(.019,.019,.02,'dark',bus,[sign*.63,y,z+Math.sign(z)*.03],[Math.PI/2,0,0]);
    }
    box([.025,.88,.74],'white',bus,[sign*.665,.05,0]);
    for(let n=0;n<10;n++)box([.03,.012,.68],'silver',bus,[sign*.682,-.32+n*.08,0]);
  }
  const battery=system('battery','battery',[0,-.2,-.72],[-.7,.65,-1.35],'BATTERY');
  const bh={small:.25,medium:.38,large:.52}[design.battery];
  box([.75,bh,.28],'silver',battery);
  for(let i=0;i<7;i++)box([.026,bh+.035,.3],'dark',battery,[(i-3)*.1,0,0]);
  box([.15,.075,.04],'gold',battery,[.2,bh/2,-.17]);
  const engine=system('engine','engine',[0,-.9,0],[0,-1.15,0],'PROPULSION');
  const radius=design.engine==='cryo'?.4:.3;
  const profile=[[radius,-.55],[radius*.84,-.42],[radius*.6,-.25],[.12,-.08],[.105,.04],[.145,.14]].map(([x,y])=>new T.Vector2(x,y));
  mesh(new T.LatheGeometry(profile,48),'dark',engine);
  cylinder(.15,.13,.27,'silver',engine,[0,.22,0]);
  mesh(new T.TorusGeometry(radius,.018,8,48),'silver',engine,[0,-.55,0],[Math.PI/2,0,0]);
  for(let i=0;i<12;i++) {
    const a=i*Math.PI/6;
    strut([Math.cos(a)*.15,.25,Math.sin(a)*.15],[Math.cos(a)*radius,-.53,Math.sin(a)*radius],.008,'silver',engine);
  }
  for(const s of [-1,1]) {
    cylinder(.13,.13,.39,'gold',engine,[s*.35,.1,0]);
    strut([s*.35,.26,0],[s*.12,.32,0],.023,'silver',engine);
    strut([s*.43,.2,.25],[s*.18,-.1,.08],.025,'silver',engine);
  }
  const plume=new T.Group(); engine.add(plume); plume.position.y=-.55; plume.visible=false;
  for(let i=0;i<3;i++) {
    const m=new T.Mesh(new T.ConeGeometry(radius*(.65+i*.15),1.8+i*.4,24,1,true),new T.MeshBasicMaterial({color:i?'#6b9fd0':'#e7f4ff',transparent:true,opacity:i?.12:.65,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));
    m.rotation.z=Math.PI;m.position.y=-.9-i*.2;plume.add(m);
  }
  const span={compact:1.35,extended:1.95,redundant:2.55}[design.power];
  for(const sign of [-1,1]) {
    const wing=system(sign<0?'port':'starboard','power',[sign*.72,.05,0],[sign*1.2,0,0],sign<0?'PORT ARRAY':'STBD ARRAY');wings.push(wing);
    cylinder(.095,.095,.17,'silver',wing,[0,0,0],[0,0,Math.PI/2]);
    strut([0,0,0],[sign*.38,0,0],.035,'silver',wing);
    const count=design.power==='compact'?2:3;
    for(let i=0;i<count;i++) {
      const width=span/count,x=sign*(.37+width*(i+.5));
      box([width-.025,1.18,.045],'dark',wing,[x,0,0]);
      box([width-.065,1.12,.012],'blue',wing,[x,0,.031]);
      box([width-.065,1.12,.012],'blue',wing,[x,0,-.031]);
      for(const y of [-.59,.59])box([width,.022,.07],'silver',wing,[x,y,0]);
      for(const edge of [-1,1])box([.018,1.18,.07],'silver',wing,[x+edge*width/2,0,0]);
    }
  }
  const comms=system('comms','comms',[0,.86,0],[0,1.1,0],'COMMUNICATIONS');
  cylinder(.045,.06,.3,'silver',comms);
  if(design.comms==='basic') {
    box([.38,.065,.38],'white',comms,[0,.19,0]);box([.3,.01,.3],'gold',comms,[0,.23,0]);
  } else {
    const dish=new T.Group();dish.userData.category='comms';dish.position.set(0,.18,0);dish.rotation.x=.32;comms.add(dish);
    const r=design.comms==='relay'?.59:.48, points=[];
    for(let i=0;i<=24;i++){const x=r*i/24;points.push(new T.Vector2(x,x*x/(r*2)));}
    const reflector=mesh(new T.LatheGeometry(points,64),'white',dish);reflector.material.side=T.DoubleSide;
    mesh(new T.TorusGeometry(r,.014,8,64),'silver',dish,[0,r/2,0],[Math.PI/2,0,0]);
    for(let i=0;i<3;i++){const a=i*Math.PI*2/3;strut([Math.cos(a)*r,r/2,Math.sin(a)*r],[0,.57,0],.012,'silver',dish);}
    cylinder(.045,.035,.11,'gold',dish,[0,.55,0]);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;strut([0,-.02,0],[Math.cos(a)*r,r/2-.02,Math.sin(a)*r],.012,'silver',dish);}
  }
  const payload=system('payload','payload',[0,.05,.73],[0,.1,1.25],'INSTRUMENT DECK');
  box([1.05,.62,.07],'silver',payload,[0,0,-.07]);
  design.payload.forEach((id,i)=>{
    const x=(i-(design.payload.length-1)/2)*.37;
    if(id==='radar') {
      box([.3,.46,.14],'gold',payload,[x,0,.05]);
      for(const s of [-1,1])strut([x,-.15,.18],[x+s*.85,-.15,.18],.013,'silver',payload);
    } else {
      box([.29,.3,.25],id==='camera'?'dark':'gold',payload,[x,0,.08]);
      cylinder(.1,.12,.28,'dark',payload,[x,0,.32],[Math.PI/2,0,0]);
      cylinder(.085,.085,.012,'lens',payload,[x,0,.465],[Math.PI/2,0,0]);
      mesh(new T.TorusGeometry(.104,.012,8,24),'silver',payload,[x,0,.45]);
      if(id==='spectrometer')box([.12,.24,.13],'white',payload,[x,.24,.08]);
    }
  });
  // Thruster pods on the bus stay attached when service assemblies are separated.
  for(const s of [-1,1])for(const z of [-1,1]) {
    box([.13,.14,.13],'silver',bus,[s*.7,.45,z*.63]);
    cylinder(.025,.055,.12,'dark',bus,[s*.7,.45,z*.73],[Math.PI/2,0,0]);
  }
  if(missionId==='lander')for(let i=0;i<4;i++) {
    const a=i*Math.PI/2+Math.PI/4,c=Math.cos(a),s=Math.sin(a);
    strut([c*.57,-.4,s*.57],[c*1.35,-1.49,s*1.35],.038,'silver',bus);
    strut([c*.6,-.65,s*.6],[c*1.15,-1.2,s*1.15],.025,'gold',bus);
    cylinder(.21,.26,.06,'gold',bus,[c*1.35,-1.52,s*1.35]);
  }
  return {group,systems,pickables,plume,wings,materials};
}
