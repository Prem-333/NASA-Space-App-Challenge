// Presentation only. These functions never modify flight state or physics.
export const clamp01=n=>Math.max(0,Math.min(1,n));
export const smooth=n=>{const t=clamp01(n);return t*t*(3-2*t);};
export const damping=(seconds,speed=4)=>1-Math.exp(-Math.max(0,Math.min(.1,seconds))*speed);
export function shot({stage=0,progress=0,time=0,burning=false,outcome=null,aspect=1.5,motion=true}){
  const p=smooth(progress),drift=motion?Math.sin(time*.075)*.18:0;
  const scale=aspect<.9?1.45:aspect<1.2?1.18:1;
  let azimuth=.65+drift,distance=4.6,height=1.7,fov=40,lead=.18;
  if(stage===0){azimuth=.9-p*.65+drift;distance=5.8-p*1.5;height=2.7-p*1.2;fov=43-p*4;}
  else if(stage===1){azimuth=.6+p*.35+drift;distance=4.2+p*.65;height=1.5+p*.4;}
  else if(stage===2){azimuth=.45+p*.8+drift;distance=3.7+p*.35;height=1.8;fov=37;}
  else if(stage===3){azimuth=.8-p*.95+drift;distance=5.7-p*1.3;height=2.8-p*1.4;fov=42-p*4;}
  else {azimuth=.3+drift;distance=4.4;height=1.8;fov=38;}
  if(outcome==='impact'){distance=5.6;azimuth=.5; height=3.2;fov=42;lead=0;}
  if(outcome==='escape'){distance=5.5+p*3;azimuth=.7+p*.35; height=2.4;fov=44;lead=0;}
  // A restrained ignition impulse; zero at either end and disabled with reduced motion.
  const impulse=motion&&burning?Math.sin(Math.PI*clamp01(progress))*.012:0;
  return {azimuth,distance:distance*scale,height:height*scale,fov,lead,impulse};
}
export function plumeEnvelope(progress,burning){return burning?smooth(progress/.07)*(1-smooth((progress-.91)/.09)):0;}
