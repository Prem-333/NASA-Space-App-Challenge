import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_DESIGNS} from '../dist/data.js';
import {createFlight,advanceFlight,summarize} from '../dist/engine.js';
import {bestScience,commandRisk,flightWarning,failureExplanation} from '../dist/flight-risk.js';

test('every starter has a winning path and no false mission warning',()=>{
  for(const id of ['flyby','orbiter','lander']){
    let f=createFlight(DEFAULT_DESIGNS[id],id);
    for(const command of ['depart','precision','repair','arrive','relay']){
      assert.equal(flightWarning(f),null);
      assert.notEqual(commandRisk(f,command)?.level,'danger');
      f=advanceFlight(f,command);
    }
    assert.ok(summarize(f).objectiveMet);
  }
});
test('loss warning is shown before an irreversible science-target miss',()=>{
  let f=createFlight(DEFAULT_DESIGNS.lander,'lander');
  for(const command of ['depart','economy','shed','arrive'])f=advanceFlight(f,command);
  assert.equal(commandRisk(f,'priority').level,'danger');
  const lost=advanceFlight(f,'priority');assert.equal(summarize(lost).objectiveMet,false);
  assert.match(failureExplanation(lost),/short/);
  assert.equal(bestScience(lost),summarize(lost).science);
});
test('unrecoverable active attempt stays flagged and forecasting never mutates it',()=>{
  let f=createFlight(DEFAULT_DESIGNS.lander,'lander');
  for(const command of ['depart','economy','coast'])f=advanceFlight(f,command);
  const before=JSON.stringify(f);
  const risk=commandRisk(f,'arrive');
  assert.ok(bestScience(f)<90);assert.equal(flightWarning(f).level,'danger');assert.equal(risk.level,'danger');
  assert.equal(JSON.stringify(f),before);
});
test('insufficient-propellant command is identified as mission-ending',()=>{
  const f={...createFlight(DEFAULT_DESIGNS.orbiter,'orbiter'),fuel:1};
  assert.equal(commandRisk(f,'depart').title,'Mission-ending command');
  assert.match(failureExplanation(advanceFlight(f,'depart')),/remaining propellant/);
});
