import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',e=>{if(e.type()==='error')errors.push(e.text());});
const hash=async()=>createHash('sha256').update(await page.locator('#flight-scene').screenshot()).digest('hex');
try{
 await page.goto('http://localhost:4173');await page.locator('button[data-view="builder"]').first().click();await page.locator('[data-action="launch"]').click();
 assert.equal(await page.locator('[data-view="cinematic"]').getAttribute('aria-pressed'),'true');
 await page.waitForTimeout(700);const first=await hash();await page.waitForTimeout(800);assert.notEqual(await hash(),first);
 await page.locator('[data-action="flight-command"]').click();await page.waitForTimeout(3000);await page.locator('[data-experience="pause"]').click();
 await page.locator('#flight-scene').screenshot({path:'artifacts/pause-a.png'});const still=await hash();await page.waitForTimeout(500);await page.locator('#flight-scene').screenshot({path:'artifacts/pause-b.png'});assert.equal(await hash(),still,'paused camera, exhaust, attitude and background must all freeze');
 await page.locator('#flight-cinema').screenshot({path:'artifacts/director-burn.png'});
 await page.locator('[data-experience="skip"]').click();await page.locator('#flight-scene').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('[data-view="follow"]').getAttribute('aria-pressed'),'true');
 await page.locator('[data-view="cinematic"]').click();assert.equal(await page.locator('[data-view="cinematic"]').getAttribute('aria-pressed'),'true');
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.locator('#flight-cinema').screenshot({path:'artifacts/director-mobile.png'});
 assert.deepEqual(errors,[]);console.log('Director tracking, exact paused-frame freeze, manual override, shader compilation and mobile framing passed.');
}finally{await browser.close();}
