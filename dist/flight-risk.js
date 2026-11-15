import { advanceFlight, calculate, flightChoices, summarize } from './engine.js';

// Forecast only the finite, authored command tree; never invent random hazards.
export function bestScience(f) {
  if(f.complete)return summarize(f).science;
  return Math.max(0,...flightChoices(f).map(c=>bestScience(advanceFlight(f,c.id))));
}
export function commandRisk(f,id) {
  const next=advanceFlight(f,id),c=calculate(f.design,f.missionId,f.mode);
  if(next.failed)return {level:'danger',title:'Mission-ending command',text:next.failureReason||'Insufficient propellant for this burn. Executing it ends the flight.'};
  const best=bestScience(next);
  if(best>=c.mission.minScience&&c.dataFraction*best/c.science<c.plan.minimum)return {level:'danger',title:'A science product will be incomplete',text:`Even the best remaining plan delivers ${(c.dataFraction*best/c.science*100).toFixed(1)}% usable data; every selected objective needs ${Math.round(c.plan.minimum*100)}%.`};
  if(best<c.mission.minScience)return {level:'danger',title:'Science objective will be missed',text:`Best possible return after this choice: ${best.toFixed(1)} / ${c.mission.minScience} points. You can continue, but the remaining commands cannot recover the target.`};
  if(next.scienceFactor<f.scienceFactor)return {level:'caution',title:'Science trade-off',text:'This choice permanently reduces science return. The objective is still reachable with the right remaining commands.'};
  return null;
}
export function flightWarning(f) {
  if(f.complete)return null;
  const c=calculate(f.design,f.missionId,f.mode),best=bestScience(f);
  if(best>=c.mission.minScience&&c.dataFraction*best/c.science>=c.plan.minimum)return null;
  if(best>=c.mission.minScience)return {level:'danger',title:'Science coverage is out of reach',text:`The point target remains reachable, but the selected products require ${Math.round(c.plan.minimum*100)}% usable data. Revise the flight plan on your next attempt.`};
  return {level:'danger',title:'Science target is out of reach',text:`The best remaining plan returns ${best.toFixed(1)} of ${c.mission.minScience} required points. Finish to record the attempt, or return to the lab and revise your plan.`};
}
export function failureExplanation(f) {
  const s=summarize(f),c=calculate(f.design,f.missionId,f.mode);
  if(f.failed&&f.failureReason?.includes('remaining propellant'))return f.failureReason+' Add propellant, reduce dry mass, or preserve more delta-v before trying again.';
  if(f.descentResult&&f.failed)return `${f.failureReason} Try an earlier braking burn, reduce sideways speed, and aim for the centre of the landing zone.`;
  if(!f.failed&&s.objectives.some(o=>!o.met)&&s.science>=c.mission.minScience)return `The overall point target was reached, but ${s.objectives.filter(o=>!o.met).map(o=>o.name).join(', ')} did not receive enough usable data. Each selected objective must meet its own coverage requirement.`;
  if(f.failed&&f.failureReason)return f.failureReason+' Retry with navigation corrections and arrival guidance enabled.';
  if(f.failed)return 'The requested burn exceeded the remaining propellant. Add fuel, reduce spacecraft mass, or reserve more delta-v for arrival before trying again.';
  return `Returned ${s.science.toFixed(1)} of ${c.mission.minScience} required science points — ${(c.mission.minScience-s.science).toFixed(1)} short. Coverage, available power, and downlink choices determine this result. Review the command log and try preserving more science on the next flight.`;
}
