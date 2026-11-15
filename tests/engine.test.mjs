import test from 'node:test';
import assert from 'node:assert/strict';
import { MISSIONS, DEFAULT_DESIGNS, PARTS } from '../dist/data.js';
import { calculate, deltaV, fuelForBurn, normalizeDesign, createFlight, advanceFlight, summarize, remainingDv, restoreFlight, flightChoices } from '../dist/engine.js';

const close=(a,b,epsilon=1e-6)=>assert.ok(Math.abs(a-b)<epsilon,`${a} should equal ${b}`);
const run=(id,mode='explorer',choices=['depart','precision','repair','arrive','relay'])=>{
  let f=createFlight(DEFAULT_DESIGNS[id],id,mode);
  for(const choice of choices)f=advanceFlight(f,choice);
  return f;
};
test('rocket equation matches NASA worked relationship and has sensible boundaries',()=>{
  close(deltaV(2000,1000,300),300*9.80665*Math.log(2));
  assert.equal(deltaV(1000,1000,300),0);assert.equal(deltaV(0,0,300),0);assert.equal(deltaV(500,1000,300),0);
});
test('burn inversion returns the exact propellant requirement',()=>{
  const used=fuelForBurn(3000,2500,350);
  close(deltaV(3000,3000-used,350),2500);
  assert.equal(fuelForBurn(3000,0,350),0);
});
test('sequential burns obey the rocket equation and conserve dry mass',()=>{
  let mass=6000;for(const burn of [3200,100,80,1350])mass-=fuelForBurn(mass,burn,450);
  close(mass,6000*Math.exp(-4730/(450*9.80665)));
});
for(const m of MISSIONS){
  for(const mode of ['explorer','commander']){
    test(`${m.id} starter clears all preflight checks in ${mode}`,()=>{
      const c=calculate(DEFAULT_DESIGNS[m.id],m.id,mode);assert.ok(c.ready,JSON.stringify(c.checks));
    });
    test(`${m.id} completes an objective with the conservative flight plan in ${mode}`,()=>{
      const f=run(m.id,mode),s=summarize(f);
      assert.ok(f.complete);assert.equal(f.failed,false);assert.ok(s.objectiveMet);assert.ok(s.score>=0&&s.score<=100);assert.ok(f.fuel>=0);
      close(remainingDv(f),calculate(f.design,m.id,mode).dv-4730-(m.id==='lander'?1850:0)+(m.id==='flyby'?1350:0));
      assert.equal(f.log.length,5);assert.equal(f.history.length,6);
    });
  }
}
test('less fuel reduces delta-v and cost, without changing dry mass',()=>{
  const a=calculate({...DEFAULT_DESIGNS.orbiter,fuel:1500}),b=calculate({...DEFAULT_DESIGNS.orbiter,fuel:2500});
  assert.ok(a.dv<b.dv);assert.ok(a.cost<b.cost);assert.equal(a.dry,b.dry);
});
test('adding a payload increases dry mass, draw and cost; decreases delta-v',()=>{
  const a=calculate(DEFAULT_DESIGNS.orbiter),b=calculate({...DEFAULT_DESIGNS.orbiter,payload:['camera','spectrometer','radar']});
  assert.ok(a.dry<b.dry);assert.ok(a.draw<b.draw);assert.ok(a.cost<b.cost);assert.ok(a.dv>b.dv);
});
test('inadequate propellant blocks launch',()=>{
  const d={...DEFAULT_DESIGNS.orbiter,fuel:500};
  assert.equal(calculate(d).checks.find(c=>c.id==='fuel').pass,false);assert.throws(()=>createFlight(d,'orbiter'),/preflight/);
});
test('launch capacity rejects an overweight spacecraft',()=>{
  const d={...DEFAULT_DESIGNS.lander,launcher:'swift'};
  assert.equal(calculate(d,'lander').checks.find(c=>c.id==='mass').pass,false);
});
test('power demand and eclipse energy use the proper units',()=>{
  const c=calculate(DEFAULT_DESIGNS.orbiter);
  assert.equal(c.generation,1200*.8);assert.equal(c.usableEnergy,1400*.8);assert.equal(c.energyRequired,c.draw*.75);
  const poor=calculate({...DEFAULT_DESIGNS.lander,power:'compact',battery:'small'},'lander');
  assert.equal(poor.checks.find(x=>x.id==='power').pass,false);assert.equal(poor.checks.find(x=>x.id==='battery').pass,false);
});
test('missing the required science instrument blocks launch',()=>{
  const c=calculate({...DEFAULT_DESIGNS.orbiter,payload:['camera']});
  assert.equal(c.checks.find(x=>x.id==='science').pass,false);
});
test('communication bottlenecks reduce planned science',()=>{
  const good=calculate(DEFAULT_DESIGNS.orbiter),poor=calculate({...DEFAULT_DESIGNS.orbiter,comms:'basic'});
  assert.ok(good.dataFraction>poor.dataFraction);assert.ok(good.science>poor.science);
});
test('Commander requires a larger reserve and a lower budget',()=>{
  const a=calculate(DEFAULT_DESIGNS.orbiter,'orbiter','explorer'),b=calculate(DEFAULT_DESIGNS.orbiter,'orbiter','commander');
  assert.equal(b.requiredDv-a.requiredDv,200);close(b.budget,a.budget*.95);
});
test('reduced operations penalize science only when actual generation is insufficient',()=>{
  const f=run('lander','explorer',['depart','precision','shed','arrive','relay']);
  const c=calculate(f.design,'lander');close(f.scienceFactor,Math.min(1,c.generation*.65/c.draw)*.92);
  assert.ok(summarize(f).science<summarize(run('lander')).science);
});
test('flight choices can miss the science objective even after a valid launch',()=>{
  const f=run('lander','explorer',['depart','economy','shed','arrive','priority']);
  assert.ok(f.complete);assert.equal(f.failed,false);assert.equal(summarize(f).objectiveMet,false);
});
test('waiting costs time and science instead of propellant',()=>{
  const a=run('orbiter','explorer',['depart','precision','coast','arrive','relay']),b=run('orbiter');
  assert.ok(a.fuel>b.fuel);assert.ok(a.extraHours>b.extraHours);assert.ok(a.scienceFactor<b.scienceFactor);
});
test('replay is deterministic',()=>assert.deepEqual(run('lander'),run('lander')));
test('completed flight commands are idempotent',()=>{const f=run('orbiter');assert.strictEqual(advanceFlight(f,'relay'),f);});
test('unknown commands are rejected without changing state',()=>{const f=createFlight(DEFAULT_DESIGNS.orbiter,'orbiter');assert.throws(()=>advanceFlight(f,'hack'));assert.equal(f.step,0);assert.equal(f.fuel,f.design.fuel);});
test('insufficient fuel during a burn fails without negative propellant',()=>{
  const f=createFlight(DEFAULT_DESIGNS.orbiter,'orbiter');f.fuel=1;
  const result=advanceFlight(f,'depart');assert.ok(result.failed);assert.ok(result.complete);assert.equal(result.fuel,1);assert.equal(summarize(result).score,0);
});
test('saved flight is reconstructed from commands; tampered telemetry is ignored',()=>{
  const f=run('orbiter');f.name='Test mission';
  const restored=restoreFlight({...f,fuel:999999,scienceFactor:99});
  assert.notEqual(restored.fuel,999999);assert.notEqual(restored.scienceFactor,99);assert.equal(restored.name,'Test mission');
  close(restored.fuel,run('orbiter').fuel);
});
test('invalid saved flights are rejected safely',()=>{
  for(const raw of [null,{}, {version:1,missionId:'mars'}, {...run('orbiter'),decisions:['bad']}, {...run('orbiter'),decisions:Array(6).fill('depart')}])assert.equal(restoreFlight(raw),null);
});
test('untrusted imported designs cannot inject parts or nonfinite fuel',()=>{
  const d=normalizeDesign({engine:'<script>',fuel:Infinity,payload:['radar','radar','<script>']});
  assert.equal(d.engine,'cryo');assert.equal(d.fuel,DEFAULT_DESIGNS.orbiter.fuel);assert.deepEqual(d.payload,['radar']);
  assert.equal(normalizeDesign({fuel:-200}).fuel,500);assert.equal(normalizeDesign({fuel:99999}).fuel,10000);assert.equal(normalizeDesign({fuel:1541}).fuel,1500);
});
test('all reachable branches preserve physics and valid scores',()=>{
  let count=0;
  for(const mission of MISSIONS){
    const visit=f=>{assert.ok(Number.isFinite(f.fuel)&&f.fuel>=0&&f.fuel<=f.design.fuel);if(f.complete){const s=summarize(f);assert.ok(Number.isFinite(s.score)&&s.score>=0&&s.score<=100);count++;return;}for(const c of flightChoices(f))visit(advanceFlight(f,c.id));};
    visit(createFlight(DEFAULT_DESIGNS[mission.id],mission.id));
  }
  assert.equal(count,57);
});

for(const [mission,commands,outcome] of [
 ['orbiter',['depart','ignore-navigation'],'escape'],
 ['orbiter',['depart','precision','repair','skip-arrival'],'escape'],
 ['lander',['depart','precision','repair','skip-arrival'],'impact']
])test(`${mission} ${commands.at(-1)} produces ${outcome} and survives replay`,()=>{
 let f=createFlight(DEFAULT_DESIGNS[mission],mission);
 for(const id of commands)f=advanceFlight(f,id);
 assert.equal(f.failed,true);assert.equal(f.complete,true);assert.equal(f.outcome,outcome);
 assert.equal(summarize(f).score,0);assert.equal(summarize(f).objectiveMet,false);
 assert.deepEqual(restoreFlight({...f,outcome:'success',name:'Hail Mary I'}),{...f,name:'Hail Mary I'});
 assert.strictEqual(advanceFlight(f,'arrive'),f);
});

test('a missed objective never receives a success grade',()=>{
 const f=run('lander','explorer',['depart','economy','shed','arrive','priority']);
 assert.equal(summarize(f).grade,'Objective missed');
 assert.equal(summarize(createFlight(DEFAULT_DESIGNS.orbiter,'orbiter')).grade,'In progress');
});

test('array fault is reflected in telemetry before the recovery choice',()=>{
 let f=createFlight(DEFAULT_DESIGNS.orbiter,'orbiter');
 for(const id of ['depart','precision'])f=advanceFlight(f,id);
 assert.equal(f.generationFactor,.65);assert.equal(f.scienceFactor,1);
 assert.equal(advanceFlight(f,'repair').generationFactor,1);
 assert.equal(advanceFlight(f,'shed').generationFactor,.65);
});
