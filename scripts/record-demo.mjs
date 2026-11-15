import {chromium} from 'playwright';
import {copyFile,mkdir} from 'node:fs/promises';
await mkdir('artifacts/demo',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1280,height:900},recordVideo:{dir:'artifacts/demo',size:{width:1280,height:900}}});
const page=await context.newPage();
const nav=async v=>page.locator(`button[data-action="nav"][data-view="${v}"]`).first().click();
async function caption(text,ms=3500){await page.evaluate(text=>{let e=document.querySelector('#demo-caption');if(!e){e=document.createElement('div');e.id='demo-caption';e.style.cssText='position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:1000;background:#090e14;color:#fff;border:1px solid #ffad78;border-left-width:5px;padding:16px 24px;font:500 20px/1.45 sans-serif;width:900px;max-width:85vw;text-align:center;pointer-events:none;box-shadow:0 5px 40px #000';document.body.append(e);}e.textContent=text;},text);await page.waitForTimeout(ms);}
async function command(id){await page.locator(`[data-action="flight-command"][data-id="${id}"]`).click();await page.locator('[data-experience="skip"]').click();}
try{
 await page.goto('http://localhost:4173');await page.evaluate(()=>document.fonts.ready);await caption('HAIL MARY · Design a spacecraft. Fly the mission. Bring the science home.',4500);
 await page.locator('.campaign').scrollIntoViewIfNeeded();await caption('Three progressive assignments: surface images, mineral spectra, then a combined surface investigation.');
 await page.locator('[data-action="campaign"][data-level="1"]').click();await page.locator('.craft-panel').scrollIntoViewIfNeeded();await caption('Build around a real constraint: every instrument adds mass, power demand, cost, and data.',4500);
 await page.locator('[data-experience="explode"]').click();await caption('Inspect the spacecraft assembly. Systems and instruments change with your design.');await page.locator('[data-experience="explode"]').click();
 await page.locator('.science-lab').scrollIntoViewIfNeeded();await caption('Choose the science question, wavelength, and optical or collection system.');
 await page.locator('[data-science-instrument="camera"][data-science-field="band"]').selectOption('microwave');await page.locator('.science-lab').scrollIntoViewIfNeeded();await caption('A camera cannot collect microwave radar observations. Incompatible designs cannot launch.');
 await page.locator('[data-science-instrument="camera"][data-science-field="band"]').selectOption('visible');await page.locator('[data-action="launch"]').click();await page.locator('#flight-cinema').scrollIntoViewIfNeeded();await caption('The Director camera tracks the spacecraft from low Earth orbit. Drag to take control.');
 await page.locator('[data-id="depart"][data-action="flight-command"]').click();await caption('A tapered exhaust and smooth camera track accompany the rocket-equation departure burn.',10000);
 await command('precision');await caption('Correct the trajectory. Ignoring the update can lose the mission.',2500);await command('repair');await command('arrive');await command('relay');await page.locator('.game-result').scrollIntoViewIfNeeded();await caption('Mission success requires both the overall science target and every selected data objective.',4000);
 await page.locator('.science-results').scrollIntoViewIfNeeded();await caption('Review delivered science products. Previews are labelled synthetic, not real observations.');
 await page.locator('.mission-comparisons').scrollIntoViewIfNeeded();await caption('Compare your design with NASA instruments, including the differences and original source links.');
 await nav('briefing');await page.locator('.campaign').scrollIntoViewIfNeeded();await caption('Completing the first assignment unlocks the next level. Progress stays on this device.');
 await page.locator('[data-action="select-mission"][data-id="lander"]').click();await nav('builder');await page.locator('[data-action="launch"]').click();for(const id of ['depart','precision','repair'])await command(id);
 await page.locator('[data-action="manual-descent"]').click();await caption('Pilot the final 180 metres: a detailed 3D lander, tracking camera, and live thrust and velocity.',4500);
 await page.locator('#descent-throttle').fill('0');await page.locator('#descent-throttle').dispatchEvent('input');await page.locator('#descent-pause').click();await caption('This attempt cuts the engine. Lunar gravity keeps accelerating the lander toward the surface.',8500);
 await page.locator('.game-result').waitFor({timeout:20000});await page.locator('.game-result').scrollIntoViewIfNeeded();await caption('Impact. The result is calculated from the controls and saved for review—not guaranteed success.',4500);
 await page.locator('[data-action="about"]').click();await caption('Team Hail Mary · Source code, NASA references, and model limits are included.',4000);
}finally{const video=page.video();await context.close();await copyFile(await video.path(),'artifacts/hail-mary-walkthrough.webm');await browser.close();}
