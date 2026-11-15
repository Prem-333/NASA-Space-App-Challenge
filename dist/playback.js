import { calculate, deltaV, clamp } from './engine.js';

// Presentation clock only. Playback speed never changes a mission's physical outcome.
export class PlaybackClock {
  constructor(duration=8){this.duration=Math.max(.1,duration);this.elapsed=0;this.rate=1;this.paused=false;}
  tick(seconds){if(!this.paused&&Number.isFinite(seconds))this.elapsed=Math.min(this.duration,this.elapsed+Math.max(0,seconds)*this.rate);return this.progress;}
  get progress(){return clamp(this.elapsed/this.duration,0,1);}
  get done(){return this.progress>=1;}
  setRate(rate){if([.5,1,2,4].includes(rate))this.rate=rate;}
  finish(){this.elapsed=this.duration;return 1;}
}
export const ROUTE_STEPS=[0,.25,.51,.77,1,1];
export function sampleManeuver(before,after,progress){
  const p=clamp(progress,0,1),c=calculate(before.design,before.missionId,before.mode);
  const log=after.log.at(-1);
  const burn=after.failed&&!after.descentResult?0:(log?.dv||0)*p;
  const fuel=after.failed&&!after.descentResult?before.fuel:Math.max(0,(c.dry+before.fuel)*Math.exp(-burn/(c.engine.isp*9.80665))-c.dry);
  return {active:true,stage:before.step,progress:p,outcome:after.outcome||null,eventProgress:p,originRoute:ROUTE_STEPS[before.step],fuel:p===1?after.fuel:fuel,dv:deltaV(c.dry+fuel,c.dry,c.engine.isp),
    power:c.generation*(before.generationFactor+(after.generationFactor-before.generationFactor)*p),
    science:before.scienceFactor+(after.scienceFactor-before.scienceFactor)*p,
    route:ROUTE_STEPS[before.step]+(ROUTE_STEPS[after.step]-ROUTE_STEPS[before.step])*p,
    burn:burn,fullBurn:log?.dv||0,burning:!!log?.dv&&!after.failed&&p>0&&p<1,
    hours:before.extraHours+(after.extraHours-before.extraHours)*p};
}
