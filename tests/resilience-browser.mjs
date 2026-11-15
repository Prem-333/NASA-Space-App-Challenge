import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({reducedMotion:'reduce',viewport:{width:1440,height:1000}});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
const nav=v=>page.locator(`button[data-action="nav"][data-view="${v}"]`).first().click();
const click=a=>page.locator(`[data-action="${a}"]`).first().click();
const command=id=>page.locator(`[data-action="flight-command"][data-id="${id}"]`).click();
const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('hail-mary:v1')));
try{
 await page.goto('http://localhost:4173');await nav('builder');await click('launch');
 for(const id of ['depart','precision','repair','arrive','relay'])await command(id);
 await click('retry-flight');await command('depart');const active=(await saved()).flight;
 await nav('archive');await click('open-archive');await click('retry-flight');
 assert.equal(await page.locator('dialog').isVisible(),true);assert.deepEqual((await saved()).flight,active);
 await page.keyboard.press('Escape');assert.deepEqual((await saved()).flight,active);
 await click('retry-flight');await click('resume');assert.deepEqual((await saved()).flight,active);
 await nav('archive');await click('open-archive');await click('retry-flight');await click('confirm-retry');
 assert.equal((await saved()).flight.step,0);assert.equal((await saved()).archive.length,1);
 await command('depart');await page.reload();assert.match(await page.locator('.command-panel h2').textContent(),/Translunar coast/);
 assert.equal((await saved()).flight.decisions.length,1);assert.equal(await page.locator('[data-live="science-points"]').textContent(),'90.0');
 await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('hail-mary:v1'));s.archive.unshift(null,{},'bad');localStorage.setItem('hail-mary:v1',JSON.stringify(s));});
 await page.reload();assert.equal((await saved()).archive.length,1);assert.equal((await saved()).flight.step,1);
 for(const width of [320,390,768,1024,1440]){await page.setViewportSize({width,height:900});for(const view of ['briefing','builder','flight','archive','learn']){await nav(view);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${view} overflow at ${width}`);}}
 assert.deepEqual(errors,[]);
 // Capture errors in the fallback context as well as the primary page.
 const fallback=await browser.newContext({reducedMotion:'reduce'});await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.startsWith('webgl')?null:original.call(this,type,...args);};});
 const fp=await fallback.newPage(),fallbackErrors=[];fp.on('pageerror',e=>fallbackErrors.push(e.message));await fp.goto('http://localhost:4173');await fp.locator('button[data-view="builder"]').first().click();
 for(const action of ['explode','auto','reset'])await fp.locator(`[data-experience="${action}"]`).click();
 await fp.locator('[data-action="launch"]').click();await fp.locator('[data-id="depart"][data-action="flight-command"]').click();assert.match(await fp.locator('.command-panel h2').textContent(),/Translunar coast/);assert.deepEqual(fallbackErrors,[]);await fallback.close();
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Storage.prototype.setItem=function(){throw new DOMException('Storage unavailable','QuotaExceededError');};});const bp=await blocked.newPage();await bp.goto('http://localhost:4173');assert.match(await bp.locator('.saved-indicator').textContent(),/SESSION ONLY/);await blocked.close();
 console.log('Archived retry protection, refresh resume, corrupt records, 5 viewport widths, WebGL fallback controls and unavailable storage passed.');
}finally{await browser.close();}
