import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const page=await context.newPage(),errors=[],audits=[];
page.on('pageerror',e=>errors.push(e.message));
const nav=async v=>page.locator(`button[data-action="nav"][data-view="${v}"]`).first().click();
const command=async id=>page.locator(`[data-action="flight-command"][data-id="${id}"]`).click();
const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('hail-mary:v1')));
async function audit(label){const a=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();audits.push({label,violations:a.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))});}
try{
 await page.goto('http://localhost:4173');assert.ok(await page.locator('[data-level="2"]').isDisabled());
 for(const level of [1,2,3]){
  await page.locator(`[data-action="campaign"][data-level="${level}"]`).click();
  assert.equal(await page.locator('.science-channel').count(),level);
  if(level===2){await page.locator('[data-science-instrument="spectrometer"][data-science-field="band"]').selectOption('microwave');assert.ok(await page.locator('[data-action="launch"]').isDisabled());await page.reload();assert.equal(await page.locator('[data-science-instrument="spectrometer"][data-science-field="band"]').inputValue(),'microwave');await page.locator('[data-science-instrument="spectrometer"][data-science-field="band"]').selectOption('infrared');await audit('science workbench');await page.screenshot({path:'artifacts/science-workbench.png',fullPage:true});}
  assert.ok(await page.locator('[data-action="launch"]').isEnabled());await page.locator('[data-action="launch"]').click();
  for(const id of ['depart','precision','repair','arrive','relay'])await command(id);
  assert.match(await page.locator('.game-result').textContent(),/MISSION SUCCESS/);assert.equal(await page.locator('.science-products article').count(),level);assert.equal(await page.locator('.mission-comparisons article').count(),level);
  if(level===3){await audit('three science products');await page.screenshot({path:'artifacts/science-results.png',fullPage:true});}
  await nav('briefing');assert.ok((await saved()).medals.includes(level));await page.reload();
 }
 await audit('completed flight school');await page.screenshot({path:'artifacts/flight-school.png',fullPage:true});
 await page.locator('[data-action="select-mission"][data-id="orbiter"]').click();await page.locator('[data-action="select-mission"][data-id="lander"]').click();await nav('builder');await page.locator('[data-action="launch"]').click();for(const id of ['depart','precision','repair'])await command(id);
 await page.locator('[data-action="manual-descent"]').click();await audit('paused manual descent');await page.locator('#descent-throttle').fill('0');await page.locator('#descent-throttle').dispatchEvent('input');await page.locator('#descent-pause').click();await page.waitForTimeout(1500);await page.locator('#descent-pause').click();
 const n=(await saved()).flight.manualControls.length;assert.ok(n>=10);await page.waitForTimeout(500);assert.equal((await saved()).flight.manualControls.length,n);await page.reload();await page.locator('[data-action="manual-descent"]').click();assert.equal((await saved()).flight.manualControls.length,n);
 await page.locator('#descent-throttle').fill('0');await page.locator('#descent-throttle').dispatchEvent('input');await page.screenshot({path:'artifacts/manual-descent.png',fullPage:true});
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);if(width===390)await page.screenshot({path:'artifacts/manual-descent-mobile.png',fullPage:true});}
 await page.locator('#descent-pause').click();await page.locator('.game-result.defeat').waitFor({timeout:25000});assert.equal((await saved()).flight.outcome,'impact');assert.match(await page.locator('.result-hero').textContent(),/Hard landing|outside the prepared landing zone/);
 // Resume a valid recorded safe approach one integration step before contact.
 await page.evaluate(async()=>{const {createFlight,advanceFlight,normalizeDesign,descentInitial}=await import('/engine.js');const {beginDescent,descentStep}=await import('/descent.js');let f=createFlight(normalizeDesign(null,'lander'),'lander');for(const c of ['depart','precision','repair'])f=advanceFlight(f,c);const initial=descentInitial(f);let s=beginDescent(initial),controls=[];const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));while(s.status==='flying'){const ax=(clamp(-s.x*.15,-4,4)-s.vx)*.7,ay=1.62+(-Math.max(1,Math.min(12,s.y*.15))-s.vy)*.8;const c=[clamp(Math.hypot(ax,ay)/(3.8*(initial.dry+initial.fuel)/(s.dry+s.fuel)),0,1),clamp(Math.atan2(ax,Math.max(.1,ay))/.45,-1,1)];controls.push(c);s=descentStep(s,c);}f.manualControls=controls.slice(0,-1);const saved=JSON.parse(localStorage.getItem('hail-mary:v1'));saved.flight=f;saved.view='flight';localStorage.setItem('hail-mary:v1',JSON.stringify(saved));});
 await page.reload();await page.locator('[data-action="manual-descent"]').click();await page.locator('#descent-pause').click();await page.locator('[data-id="relay"][data-action="flight-command"]').waitFor();await command('relay');assert.match(await page.locator('.game-result').textContent(),/MISSION SUCCESS/);assert.equal((await saved()).flight.descentResult.status,'landed');await page.reload();assert.match(await page.locator('.game-result').textContent(),/MISSION SUCCESS/);
 assert.deepEqual(errors,[]);await writeFile('artifacts/science-accessibility.json',JSON.stringify(audits,null,2));assert.deepEqual(audits.flatMap(a=>a.violations),[]);console.log('Three campaign unlocks, wavelength rejection, science products, comparisons, pause/reload, piloted impact and safe landing passed; four accessibility states passed.');
}finally{await browser.close();}
