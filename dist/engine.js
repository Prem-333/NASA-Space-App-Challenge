import { MISSIONS, PARTS, DEFAULT_DESIGNS } from './data.js';
export const G0 = 9.80665;
export const VERSION = 1;
export const getMission = id => MISSIONS.find(m => m.id === id) || MISSIONS[1];
export const getPart = (category,id) => PARTS[category].find(p => p.id === id) || PARTS[category][0];
export const clamp = (n,min,max) => Math.min(max,Math.max(min,n));
export function normalizeDesign(input, missionId='orbiter') {
  const fallback = DEFAULT_DESIGNS[getMission(missionId).id];
  const d = {...fallback, payload:[...fallback.payload]};
  if (!input || typeof input !== 'object') return d;
  for(const key of ['engine','power','comms','battery','launcher']) if(PARTS[key].some(p=>p.id===input[key])) d[key]=input[key];
  if(Array.isArray(input.payload)) d.payload=[...new Set(input.payload.filter(id=>PARTS.payload.some(p=>p.id===id)))];
  if(typeof input.fuel==='number' && Number.isFinite(input.fuel)) d.fuel=Math.round(clamp(input.fuel,500,10000)/100)*100;
  return d;
}
export function deltaV(wet,dry,isp) { return wet>=dry && dry>0 && isp>0 ? isp*G0*Math.log(wet/dry) : 0; }
export function fuelForBurn(totalMass,dv,isp) { return totalMass*(1-Math.exp(-Math.max(0,dv)/(isp*G0))); }
export function calculate(design, missionId='orbiter', mode='explorer') {
  const d=normalizeDesign(design,missionId), mission=getMission(missionId);
  const engine=getPart('engine',d.engine), power=getPart('power',d.power), comms=getPart('comms',d.comms), battery=getPart('battery',d.battery), launcher=getPart('launcher',d.launcher);
  const payload=d.payload.map(id=>getPart('payload',id));
  const parts=[engine,power,comms,battery,...payload];
  const dry=320+parts.reduce((s,p)=>s+p.mass,0)+(mission.id==='lander'?420:0);
  const wet=dry+d.fuel;
  const cost=8+parts.reduce((s,p)=>s+p.cost,0)+launcher.cost+d.fuel*0.0015+(mission.id==='lander'?9:0);
  const draw=180+engine.power+comms.power+payload.reduce((s,p)=>s+p.power,0);
  const generation=power.generation*0.8;
  const energyRequired=draw*mission.eclipse;
  const usableEnergy=battery.capacity*0.8;
  const dv=deltaV(wet,dry,engine.isp);
  const requiredDv=mission.dv+(mode==='commander'?400:200);
  const budget=mission.budget*(mode==='commander'?0.95:1);
  const dataDemand=payload.reduce((s,p)=>s+p.data,0);
  const dataFraction=dataDemand?Math.min(1,comms.rate/dataDemand):0;
  const science=(mission.baseScience+payload.reduce((s,p)=>s+p.science*mission.scienceWeights[p.id],0))*dataFraction;
  const checks=[
    {id:'fuel',label:'Velocity budget',pass:dv>=requiredDv,value:`${Math.round(dv).toLocaleString()} / ${requiredDv.toLocaleString()} m/s`,tip:'Add propellant, choose a more efficient engine, or reduce dry mass.'},
    {id:'mass',label:'Launch mass',pass:wet<=launcher.massLimit,value:`${wet.toLocaleString()} / ${launcher.massLimit.toLocaleString()} kg`,tip:'Select a larger launch vehicle or reduce total mass.'},
    {id:'budget',label:'Mission budget',pass:cost<=budget,value:`$${cost.toFixed(1)}M / $${budget.toFixed(1)}M`,tip:'Trade a heavier launcher or extra equipment for a leaner design.'},
    {id:'power',label:'Daylight power',pass:generation>=draw,value:`${Math.round(generation)} W available · ${draw} W used`,tip:'Choose a larger solar array or reduce instrument and communication loads.'},
    {id:'battery',label:'Eclipse endurance',pass:usableEnergy>=energyRequired,value:`${Math.round(usableEnergy)} / ${Math.round(energyRequired)} Wh`,tip:'Increase battery storage or reduce power demand.'},
    {id:'science',label:'Science objective',pass:d.payload.includes(mission.required)&&science>=mission.minScience,value:`${Math.round(science)} / ${mission.minScience} science · ${getPart('payload',mission.required).name} required`,tip:`Include the ${getPart('payload',mission.required).name.toLowerCase()} and enough downlink capacity.`}
  ];
  return {design:d,mission,engine,power,comms,battery,launcher,payload,dry,wet,cost,draw,generation,energyRequired,usableEnergy,dv,requiredDv,budget,dataDemand,dataFraction,science,checks,ready:checks.every(c=>c.pass),passed:checks.filter(c=>c.pass).length};
}
export const FLIGHT_STAGES=[
  {name:'Earth departure',short:'Departure',distance:1200,description:'The launch service has delivered your spacecraft to low Earth orbit. Commit to the translunar burn.'},
  {name:'Translunar coast',short:'Cruise',distance:115320,description:'Earth recedes behind you. A navigation update needs your attention.'},
  {name:'Power management',short:'Power',distance:269080,description:'Your solar-array telemetry shows an unexpected reduction in output.'},
  {name:'Lunar arrival',short:'Arrival',distance:384400,description:'The Moon fills the window. Execute the arrival sequence for your selected mission.'},
  {name:'Science operations',short:'Science',distance:384400,description:'An interrupted ground contact puts your science return at risk. Choose your downlink strategy.'},
  {name:'Mission complete',short:'Debrief',distance:384400,description:'The flight log is closed. Review the choices that shaped your mission.'}
];
export function createFlight(design,missionId,mode='explorer') {
  const c=calculate(design,missionId,mode);
  if(!c.ready) throw new Error('Resolve the preflight checks before launch.');
  return {version:VERSION,missionId,mode,design:c.design,step:0,fuel:c.design.fuel,scienceFactor:1,generationFactor:1,extraHours:0,log:[],complete:false,failed:false,history:[{stage:'LEO',fuel:c.design.fuel,science:0}],decisions:[]};
}
export function remainingDv(flight) {
  const c=calculate(flight.design,flight.missionId,flight.mode);
  return deltaV(c.dry+flight.fuel,c.dry,c.engine.isp);
}
export function flightChoices(f) {
  const c=calculate(f.design,f.missionId,f.mode);
  if(f.complete) return [];
  if(f.step===0) return [{id:'depart',title:'Commit departure burn',detail:'3,200 m/s · leave Earth orbit',dv:3200,science:1}];
  if(f.step===1) return [
    {id:'precision',title:'Correct the trajectory',detail:'Spend 100 m/s to preserve the science plan.',dv:100,science:1},
    {id:'economy',title:'Take the wider approach',detail:'Spend 40 m/s; lose 12% of science coverage.',dv:40,science:0.88}
  ];
  if(f.step===2) return [
    {id:'repair',title:'Recover the solar array',detail:'Use 80 m/s for a recovery maneuver. Restore full output.',dv:80,science:1,generation:1,hours:2},
    {id:'shed',title:'Switch to reduced operations',detail:`Keep ${c.power.id==='redundant'?'85':'65'}% array output. Science falls if power is insufficient.`,dv:0,science:1,generation:c.power.id==='redundant'?0.85:0.65,hours:0},
    {id:'coast',title:'Wait for a better Sun angle',detail:'Restore output after 8 hours; lose 8% of planned science.',dv:0,science:0.92,generation:1,hours:8}
  ];
  if(f.step===3) return [{id:'arrive',title:c.mission.id==='flyby'?'Execute the lunar flyby':c.mission.id==='lander'?'Brake, descend, and land':'Insert into polar orbit',detail:`${(c.mission.capture+c.mission.landing).toLocaleString()} m/s arrival burn${c.mission.id==='lander'?' · simplified descent':''}`,dv:c.mission.capture+c.mission.landing,science:1}];
  if(f.step===4) return [
    {id:'relay',title:c.comms.id==='relay'?'Use the relay path':'Wait for the next contact',detail:c.comms.id==='relay'?'Your relay-ready dish preserves all planned science.':'Recover the contact after 6 hours; return 92% of remaining science.',dv:0,science:c.comms.id==='relay'?1:0.92,hours:c.comms.id==='relay'?0:6},
    {id:'priority',title:'Downlink the priority data',detail:'End on schedule; return 80% of remaining science.',dv:0,science:0.8,hours:0}
  ];
  return [];
}
export function advanceFlight(f,choiceId) {
  if(f.complete) return f;
  const choice=flightChoices(f).find(c=>c.id===choiceId);
  if(!choice) throw new Error('Unknown flight command.');
  const c=calculate(f.design,f.missionId,f.mode);
  const fuelCost=fuelForBurn(c.dry+f.fuel,choice.dv,c.engine.isp);
  const failed=fuelCost>f.fuel+0.000001;
  let scienceFactor=f.scienceFactor*choice.science;
  if(f.step===2 && choice.generation) scienceFactor*=Math.min(1,c.generation*choice.generation/c.draw);
  const next={...f,fuel:failed?f.fuel:Math.max(0,f.fuel-fuelCost),scienceFactor,generationFactor:choice.generation??f.generationFactor,extraHours:f.extraHours+(choice.hours||0),step:failed?f.step: f.step+1,failed,complete:failed||f.step===4,
    decisions:[...f.decisions,choiceId],log:[...f.log,{stage:FLIGHT_STAGES[f.step].name,command:choice.title,dv:choice.dv,fuel:failed?0:fuelCost,result:failed?'Burn rejected: insufficient propellant. Mission ended.':choice.detail}]};
  next.history=[...f.history,{stage:FLIGHT_STAGES[f.step].short,fuel:next.fuel,science:f.step===4&&!failed?c.science*scienceFactor:0}];
  return next;
}
export function summarize(f) {
  const c=calculate(f.design,f.missionId,f.mode);
  const science=f.failed?0:c.science*f.scienceFactor;
  const objectiveMet=!f.failed&&f.complete&&science>=c.mission.minScience;
  const scienceScore=clamp(science/c.mission.minScience*45,0,65);
  const efficiency=clamp((1-c.cost/c.budget)*50+10,0,20);
  const resilience=clamp(remainingDv(f)/300*15,0,15);
  const score=f.failed?0:Math.round(scienceScore+efficiency+resilience);
  return {science,objectiveMet,score,grade:score>=90?'Exceptional':score>=75?'Mission accomplished':score>=55?'Promising flight':'Lessons learned',cost:c.cost,reserve:remainingDv(f),duration:c.mission.days*24+f.extraHours};
}
export function restoreFlight(raw) {
  if(!raw || raw.version!==VERSION || !MISSIONS.some(m=>m.id===raw.missionId) || !['explorer','commander'].includes(raw.mode) || !Array.isArray(raw.decisions) || raw.decisions.length>5) return null;
  try { let f=createFlight(raw.design,raw.missionId,raw.mode); for(const decision of raw.decisions){ if(f.complete)return null; f=advanceFlight(f,decision); } f.name=typeof raw.name==='string'?raw.name.slice(0,40):'Hail Mary I'; return f; } catch { return null; }
}
