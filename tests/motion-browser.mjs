import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1050}}),page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const nav=v=>page.locator(`button[data-action="nav"][data-view="${v}"]`).first().click();
const command=id=>page.locator(`[data-action="flight-command"][data-id="${id}"]`).click();
const exp=x=>page.locator(`[data-experience="${x}"]`);
const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('hail-mary:v1')));
const audits=[];
async function audit(name){const r=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();audits.push({name,violations:r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});}
try{
  await page.goto('http://localhost:4173');await nav('builder');
  assert.equal(await page.locator('#hangar-scene canvas').count(),1);assert.equal(await page.locator('.scene-fallback').count(),0);
  await exp('explode').click();assert.equal(await exp('explode').getAttribute('aria-pressed'),'true');
  await page.waitForTimeout(700);assert.equal(await page.locator('.assembly-label:visible').count(),6);await page.getByRole('button',{name:'PORT ARRAY',exact:true}).click();assert.equal(await page.locator('[data-action="category"][data-id="power"]').getAttribute('aria-pressed'),'true');
  await exp('rotate').fill('90');assert.equal(await exp('auto').getAttribute('aria-pressed'),'false');
  await exp('reset').click();assert.equal(await exp('rotate').inputValue(),'0');assert.equal(await exp('explode').getAttribute('aria-pressed'),'false');await page.waitForTimeout(100);assert.equal(await page.locator('.assembly-label:visible').count(),0);
  await page.locator('#hangar-scene').focus();await page.keyboard.press('ArrowRight');await page.keyboard.press('+');
  await audit('3D hangar');
  await page.locator('[data-action="launch"]').click();
  for(const view of ['follow','moon','overview']){await page.locator(`[data-experience="camera"][data-view="${view}"]`).click();assert.equal(await page.locator(`[data-experience="camera"][data-view="${view}"]`).getAttribute('aria-pressed'),'true');}
  await page.locator('[data-action="flight-command"]').focus();assert.match(await page.locator('#decision-preview').textContent(),/propellant/);
  await command('depart');assert.equal((await saved()).flight.step,1);assert.equal((await saved()).flight.decisions.length,1);
  assert.equal(await page.locator('[data-action="flight-command"]').first().isDisabled(),true);
  await page.waitForTimeout(2600);await exp('pause').click();
  const frozen=await page.locator('#maneuver-percent').textContent();const fuel=await page.locator('[data-live="fuel"]').textContent();await page.waitForTimeout(450);
  assert.equal(await page.locator('#maneuver-percent').textContent(),frozen);assert.equal(await page.locator('[data-live="fuel"]').textContent(),fuel);
  await audit('paused burn');await page.screenshot({path:'artifacts/v2-paused-burn.png',fullPage:true});
  await exp('speed').click();assert.equal(await exp('speed').textContent(),'2×');await exp('pause').click();await page.waitForTimeout(400);assert.notEqual(await page.locator('#maneuver-percent').textContent(),frozen);
  await exp('skip').click();assert.match(await page.locator('.command-panel h2').textContent(),/Translunar coast/);assert.equal((await saved()).flight.decisions.length,1);
  // A reload mid-animation resumes the committed outcome exactly once.
  await command('precision');await page.reload();await nav('flight');assert.match(await page.locator('.command-panel h2').textContent(),/Power management/);assert.equal((await saved()).flight.decisions.length,2);
  // Leaving the view disposes animation, preserving the command outcome.
  await command('repair');await nav('builder');await nav('flight');assert.match(await page.locator('.command-panel h2').textContent(),/Lunar arrival/);assert.equal((await saved()).flight.decisions.length,3);
  await exp('fullscreen').click();assert.ok(await page.evaluate(()=>!!document.fullscreenElement||document.querySelector('.cinema').classList.contains('expanded')));await page.keyboard.press('Escape');await page.evaluate(()=>document.fullscreenElement?document.exitFullscreen():null);
  await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await audit('mobile 3D flight');
  await command('arrive');await exp('skip').click();await command('relay');await exp('skip').click();await page.waitForTimeout(1300);assert.match(await page.locator('.result-hero').textContent(),/SCIENCE OBJECTIVE ACHIEVED/);assert.equal((await saved()).archive.length,1);
  // Reduced-motion users get instant outcomes and no mandatory wait.
  const reduced=await browser.newContext({reducedMotion:'reduce'});const rp=await reduced.newPage();await rp.goto('http://localhost:4173');await rp.locator('button[data-action="nav"][data-view="builder"]').first().click();await rp.locator('[data-action="launch"]').click();assert.equal(await rp.locator('[data-experience="motion"]').getAttribute('aria-pressed'),'false');await rp.locator('[data-action="flight-command"]').click();assert.match(await rp.locator('.command-panel h2').textContent(),/Translunar coast/);await reduced.close();
  // WebGL unavailable: the game and flight commands still work.
  const fallback=await browser.newContext();await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type==='webgl2'||type==='webgl')return null;return original.call(this,type,...args);};});const fp=await fallback.newPage();fp.on('pageerror',e=>errors.push(e.message));await fp.goto('http://localhost:4173');await fp.locator('button[data-action="nav"][data-view="builder"]').first().click();assert.equal(await fp.locator('.scene-fallback').count(),1);await fp.locator('[data-action="launch"]').click();await fp.locator('[data-action="flight-command"]').click();await fp.locator('[data-experience="skip"]').click();assert.match(await fp.locator('.command-panel h2').textContent(),/Translunar coast/);await fallback.close();
  // Repeated view changes release WebGL renderers without console errors.
  for(let i=0;i<8;i++){await nav('builder');await nav('flight');}
  await writeFile('artifacts/motion-accessibility.json',JSON.stringify(audits,null,2));assert.deepEqual(audits.flatMap(a=>a.violations),[]);assert.deepEqual(errors,[]);
  console.log(JSON.stringify({motionChecks:'passed',auditedStates:audits.length,consoleErrors:errors.length,reloadSafe:true,reducedMotion:true,webglFallback:true},null,2));
}finally{await browser.close();}
