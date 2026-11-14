import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createCraft} from '../dist/spacecraft.js';

const design={engine:'cryo',power:'extended',comms:'dish',battery:'medium',payload:['camera','spectrometer']};
function bounds(part){part.updateWorldMatrix(true,true);return new T.Box3().setFromObject(part);}
test('exploded solar wings clear the bus on opposite sides',()=>{
  const c=createCraft(design,'orbiter');
  for(const part of Object.values(c.systems))part.position.copy(part.userData.home).add(part.userData.offset);
  const bus=bounds(c.systems.bus),port=bounds(c.systems.port),starboard=bounds(c.systems.starboard);
  assert.ok(port.max.x<bus.min.x);assert.ok(starboard.min.x>bus.max.x);
  assert.ok(bounds(c.systems.engine).max.y<bus.min.y);
  assert.ok(bounds(c.systems.comms).min.y>bus.max.y);
});
test('both solar wings and each service assembly have selectable hardware',()=>{
  const c=createCraft(design,'orbiter');
  for(const id of ['port','starboard','engine','comms','battery','payload']){
    const part=c.systems[id];let selectable=0;
    part.traverse(m=>{if(c.pickables.includes(m)){selectable++;assert.equal(m.userData.category,part.userData.category);}});
    assert.ok(selectable>0,id);
  }
  assert.equal(c.systems.bus.userData.category,null);
});
test('reassembly returns every part to the same attachment point',()=>{
  const c=createCraft(design,'orbiter');
  for(let i=0;i<20;i++)for(const part of Object.values(c.systems)){
    part.position.copy(part.userData.home).add(part.userData.offset);
    part.position.copy(part.userData.home);
    assert.deepEqual(part.position.toArray(),part.userData.home.toArray());
  }
});
test('all hardware combinations produce finite geometry',()=>{
  for(const power of ['compact','extended','redundant'])for(const comms of ['basic','dish','relay'])for(const mission of ['flyby','orbiter','lander']){
    const c=createCraft({...design,power,comms,payload:['camera','spectrometer','radar']},mission);
    const b=bounds(c.group);assert.ok([...b.min.toArray(),...b.max.toArray()].every(Number.isFinite));
    c.group.traverse(m=>{m.geometry?.dispose();m.material?.dispose();});
  }
});
