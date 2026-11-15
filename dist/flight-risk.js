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
  if(best<c.mission.minScience)return {level:'danger',title:'Science objective will be missed',text:`Best possible return after this choice: ${best.toFixed(1)} / ${c.mission.minScience} points. You can continue, but the remaining commands cannot recover the target.`};
  if(next.scienceFactor<f.scienceFactor)return {level:'caution',title:'Science trade-off',text:'This choice permanently reduces science return. The objective is still reachable with the right remaining commands.'};
  return null;
}
export function flightWarning(f) {
  if(f.complete)return null;
  const c=calculate(f.design,f.missionId,f.mode),best=bestScience(f);
  if(best>=c.mission.minScience)return null;
  return {level:'danger',title:'Science target is out of reach',text:`The best remaining plan returns ${best.toFixed(1)} of ${c.mission.minScience} required points. Finish to record the attempt, or return to the lab and revise your plan.`};
}
export function failureExplanation(f) {
  const s=summarize(f),c=calculate(f.design,f.missionId,f.mode);
  if(f.failed&&f.failureReason?.includes('remaining propellant'))return f.failureReason+' Add propellant, reduce dry mass, or preserve more delta-v before trying again.';
  if(f.failed&&f.failureReason)return f.failureReason+' Retry with navigation corrections and arrival guidance enabled.';
  if(f.failed)return 'The requested burn exceeded the remaining propellant. Add fuel, reduce spacecraft mass, or reserve more delta-v for arrival before trying again.';
  return `Returned ${s.science.toFixed(1)} of ${c.mission.minScience} required science points — ${(c.mission.minScience-s.science).toFixed(1)} short. Coverage, available power, and downlink choices determine this result. Review the command log and try preserving more science on the next flight.`;
}
