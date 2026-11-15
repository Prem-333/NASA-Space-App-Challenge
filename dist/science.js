// Educational instrument matching; specifications are game parameters.
export const OBJECTIVES = [
  {id:'terrain',name:'Map surface features',instrument:'camera',band:'visible',optic:'lens',question:'Where are the craters, ridges, and safe-looking plains?',product:'Surface image mosaic'},
  {id:'minerals',name:'Identify surface minerals',instrument:'spectrometer',band:'infrared',optic:'spectrograph',question:'Which minerals leave absorption features in reflected sunlight?',product:'Reflectance spectrum'},
  {id:'polar',name:'Investigate polar radar echoes',instrument:'radar',band:'microwave',optic:'antenna',question:'Which surface patches have unusual radar scattering?',product:'Radar backscatter map'}
];
export const BANDS=[['visible','Visible · 0.4–0.7 µm'],['infrared','Visible / near-IR · 0.43–3 µm'],['microwave','Microwave · S-band, ~12.6 cm']];
export const OPTICS=[['lens','Imaging lens'],['spectrograph','Dispersive spectrograph'],['antenna','Radar antenna']];
export const LEVELS=[
  {id:1,mission:'flyby',name:'First observation',brief:'Bring home a surface mosaic. Learn how a detector, wavelength, and collection system work together.',objectives:['terrain'],coverage:.7},
  {id:2,mission:'orbiter',name:'Read the rocks',brief:'Combine terrain images and mineral spectra. Keep both instruments supplied with power and downlink.',objectives:['terrain','minerals'],coverage:.75},
  {id:3,mission:'lander',name:'Ground truth',brief:'Land, then return imaging, mineral, and radar observations. No single measurement proves the presence of ice.',objectives:['terrain','minerals','polar'],coverage:.8}
];
const primary={flyby:'terrain',orbiter:'minerals',lander:'polar'};
export function normalizeScience(input,mission){
  const level=LEVELS.find(l=>l.id===input?.level&&l.mission===mission)?.id||0;
  const objectives=level?LEVELS[level-1].objectives:[...new Set((Array.isArray(input?.objectives)?input.objectives:[primary[mission]]).filter(id=>OBJECTIVES.some(o=>o.id===id)))];
  const channels={};
  for(const o of OBJECTIVES){const c=input?.channels?.[o.instrument];channels[o.instrument]={band:BANDS.some(([id])=>id===c?.band)?c.band:o.band,optic:OPTICS.some(([id])=>id===c?.optic)?c.optic:o.optic};}
  return {level,objectives,channels};
}
export function sciencePlan(design,mission){
  const plan=normalizeScience(design.science,mission),errors=[];
  if(!plan.objectives.length)errors.push('Choose at least one science objective.');
  for(const id of plan.objectives){const o=OBJECTIVES.find(o=>o.id===id),ch=plan.channels[o.instrument];if(!design.payload.includes(o.instrument))errors.push(`${o.name}: install the ${o.instrument}.`);else if(ch.band!==o.band||ch.optic!==o.optic)errors.push(`${o.name}: requires ${BANDS.find(([id])=>id===o.band)[1]} and ${OPTICS.find(([id])=>id===o.optic)[1].toLowerCase()}.`);}
  return {...plan,errors,valid:!errors.length,minimum:plan.level?LEVELS[plan.level-1].coverage:.65};
}
export function objectiveResults(f,dataFraction){const p=sciencePlan(f.design,f.missionId);return p.objectives.map(id=>{const o=OBJECTIVES.find(o=>o.id===id),coverage=f.failed?0:Math.min(1,dataFraction*f.scienceFactor);return {...o,coverage,target:p.minimum,met:f.complete&&!f.failed&&p.valid&&coverage>=p.minimum};});}
export function comparisons(design){
  const p=sciencePlan(design,design.science?.level===1?'flyby':design.science?.level===3?'lander':'orbiter');
  return OBJECTIVES.filter(o=>p.objectives.includes(o.id)).map(o=>o.id==='minerals'?{name:'Moon Mineralogy Mapper / Chandrayaan-1',match:'Your mineral objective uses imaging spectroscopy, as NASA’s M³ instrument did aboard ISRO’s Chandrayaan-1.',difference:'M³ sampled 0.43–3 µm. This game models instrument compatibility and data delivery; it does not process measured lunar spectra.',url:'https://science.nasa.gov/photojournal/dispersing-light-through-the-moon-mineralogy-mapper/'}:o.id==='terrain'?{name:'LRO / Lunar Reconnaissance Orbiter Camera',match:'Your terrain objective shares LROC’s use of images to study lunar surface features.',difference:'LROC used narrow- and wide-angle cameras from lunar orbit. Your camera and flight path are fictional; the generated mosaic is illustrative.',url:'https://science.nasa.gov/mission/lro/spacecraft-and-instruments/'}:{name:'LRO / Mini-RF',match:'Your radar objective shares Mini-RF’s investigation of lunar scattering, including polar regions.',difference:'Radar echoes can be ambiguous: roughness and material properties both matter. Your fictional surface instrument is not a replica of the orbital Mini-RF.',url:'https://science.nasa.gov/mission/lro/spacecraft-and-instruments/'});
}
