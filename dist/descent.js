// Fixed-step, flat local lunar frame. No atmosphere or terrain elevation model.
export const DT=.1, GRAVITY=1.62, MAX_STEPS=1800;
export function beginDescent({dry,fuel,isp}){return {x:-90,y:180,vx:4,vy:-18,fuel,dry,isp,time:0,status:'flying',reason:'',used:0};}
export function descentStep(s,control){
  if(s.status!=='flying')return s;
  const throttle=Math.max(0,Math.min(1,Number(control[0])||0)),tilt=Math.max(-1,Math.min(1,Number(control[1])||0))*.45;
  const force=(s.dry+s.fuel+s.used)*3.8*throttle;
  const used=Math.min(s.fuel,force/(s.isp*9.80665)*DT),actual=used*s.isp*9.80665/DT,mass=s.dry+s.fuel-used/2;
  const vx=s.vx+Math.sin(tilt)*actual/mass*DT,vy=s.vy+(Math.cos(tilt)*actual/mass-GRAVITY)*DT;
  let n={...s,x:s.x+(s.vx+vx)/2*DT,y:s.y+(s.vy+vy)/2*DT,vx,vy,fuel:s.fuel-used,used:s.used+used,time:s.time+DT};
  if(n.y<=0){n.y=0;const safe=Math.abs(n.x)<=35&&Math.abs(n.vx)<=2&&Math.abs(n.vy)<=3;n.status=safe?'landed':'impact';n.reason=safe?'Touchdown inside the landing zone.':Math.abs(n.x)>35?'Touchdown outside the prepared landing zone.':`Hard landing: ${Math.abs(n.vy).toFixed(1)} m/s vertical, ${Math.abs(n.vx).toFixed(1)} m/s sideways.`;}
  else if(Math.abs(n.x)>350||n.y>600){n.status='escape';n.reason='Spacecraft left the local descent corridor.';}
  else if(n.time>=MAX_STEPS*DT-1e-6){n.status='escape';n.reason='The descent time limit expired before touchdown.';}
  return n;
}
export function replayDescent(initial,controls){
  if(!Array.isArray(controls)||controls.length>MAX_STEPS)throw new Error('Invalid descent recording.');
  let s=beginDescent(initial);
  for(const c of controls){if(!Array.isArray(c)||c.length!==2||!c.every(Number.isFinite)||c[0]<0||c[0]>1||Math.abs(c[1])>1||s.status!=='flying')throw new Error('Invalid descent control.');s=descentStep(s,c);}
  return s;
}
