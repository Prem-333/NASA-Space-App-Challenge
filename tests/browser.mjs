import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
await mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const requests=[];page.on('requestfailed',r=>requests.push(r.url()));
const nav=view=>page.locator(`button[data-action="nav"][data-view="${view}"]`).first().click();
const click=action=>page.locator(`[data-action="${action}"]`).first().click();
const command=id=>page.locator(`[data-action="flight-command"][data-id="${id}"]`).click();
const overflowing=()=>page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
const axeResults=[];
async function audit(label){const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();axeResults.push({label,violations:result.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});}
async function complete(id,choices){await nav('briefing');await page.locator(`[data-action="select-mission"][data-id="${id}"]`).click();await nav('builder');assert.equal(await page.locator('[data-action="launch"]').isEnabled(),true);await click('launch');for(const c of choices)await command(c);assert.equal(await page.locator('.result-hero').count(),1);}
try{
  await page.goto('http://localhost:4173');await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(600);
  assert.match(await page.title(),/Mission desk/);assert.equal(await page.locator('.mission-card').count(),3);assert.equal(await overflowing(),false);
  await page.screenshot({path:'artifacts/desktop-briefing.png',fullPage:true});await audit('briefing');
  await click('guide');assert.equal(await page.locator('dialog').isVisible(),true);await page.keyboard.press('Escape');
  await nav('builder');await page.locator('#fuel-number').fill('500');await page.locator('#fuel-number').press('Tab');
  assert.equal(await page.locator('[data-action="launch"]').isDisabled(),true);assert.ok(await page.locator('.check-row.fail').count()>0);
  await click('reset-design');await click('confirm-reset');assert.equal(await page.locator('[data-action="launch"]').isEnabled(),true);
  for(const id of ['power','comms','battery','payload','launcher','engine']){await page.locator(`[data-action="category"][data-id="${id}"]`).click();assert.ok(await page.locator('.part-card').count()>=2);}
  await page.locator('#mission-name').fill('Hail Mary QA');await page.locator('#mission-name').press('Tab');
  await page.screenshot({path:'artifacts/desktop-builder.png',fullPage:true});await audit('builder');
  await click('share');const shared=await page.evaluate(()=>navigator.clipboard.readText());assert.match(shared,/#design=/);
  const fresh=await context.newPage();await fresh.goto(shared);assert.equal(await fresh.locator('#mission-name').inputValue(),'Hail Mary QA');await fresh.close();
  const designDownload=page.waitForEvent('download');await click('export-design');const design=await designDownload;await design.saveAs('artifacts/test-design.json');
  await click('launch');await command('depart');
  await page.reload();await nav('flight');assert.match(await page.locator('.command-panel h2').textContent(),/Translunar coast/);
  await command('precision');await page.screenshot({path:'artifacts/desktop-flight.png',fullPage:true});await audit('flight');
  await command('repair');await command('arrive');await command('relay');assert.match(await page.locator('.result-hero').textContent(),/SCIENCE OBJECTIVE ACHIEVED/);
  await page.screenshot({path:'artifacts/desktop-debrief.png',fullPage:true});await audit('debrief');
  const reportPromise=page.waitForEvent('download');await click('export-report');await(await reportPromise).saveAs('artifacts/test-flight-report.md');
  await complete('flyby',['depart','precision','repair','arrive','relay']);
  await complete('lander',['depart','economy','shed','arrive','priority']);assert.match(await page.locator('.result-hero').textContent(),/A FLIGHT TO LEARN FROM/);
  await complete('lander',['depart','precision','repair','arrive','relay']);assert.match(await page.locator('.result-hero').textContent(),/SCIENCE OBJECTIVE ACHIEVED/);
  await nav('archive');assert.equal(await page.locator('.archive-card').count(),4);
  // Viewing an old result must not overwrite an unfinished active flight.
  await nav('builder');await click('launch');await command('depart');await nav('archive');await click('open-archive');assert.equal(await page.locator('.result-hero').count(),1);await nav('flight');assert.match(await page.locator('.command-panel h2').textContent(),/Translunar coast/);
  await click('abort');await click('confirm-abort');
  const chooser=page.waitForEvent('filechooser');await click('import');await(await chooser).setFiles('artifacts/test-design.json');assert.equal(await page.locator('#mission-name').inputValue(),'Hail Mary QA');
  await nav('learn');assert.equal(await page.locator('.source-row').count(),5);await audit('manual');
  for(const width of [390,768]){
    await page.setViewportSize({width,height:844});
    for(const view of ['briefing','builder','flight','archive','learn']){await nav(view);assert.equal(await overflowing(),false,`${view} overflows at ${width}`);if(width===390&&['briefing','builder'].includes(view))await page.screenshot({path:`artifacts/mobile-${view}.png`,fullPage:true});}
  }
  await page.setViewportSize({width:390,height:844});await nav('briefing');await audit('mobile briefing');
  await page.waitForTimeout(4100);await page.screenshot({path:'artifacts/mobile-briefing.png',fullPage:true});
  await nav('builder');await click('launch');await command('depart');await command('precision');
  assert.equal(await overflowing(),false,'Active mobile flight must fit');
  await audit('mobile flight');await page.screenshot({path:'artifacts/mobile-flight.png',fullPage:true});
  await command('repair');await command('arrive');await command('relay');
  assert.equal(await overflowing(),false,'Mobile debrief must fit');
  await audit('mobile debrief');await page.screenshot({path:'artifacts/mobile-debrief.png',fullPage:true});
  // The delivered game must have no runtime dependency on an external network.
  await page.route('**/*',route=>new URL(route.request().url()).hostname==='localhost'?route.continue():route.abort());
  await page.reload();await nav('builder');assert.equal(await page.locator('.part-card').count(),2);
  const isolated=await browser.newContext();const bad=await isolated.newPage();await bad.goto('http://localhost:4173');await bad.evaluate(()=>localStorage.setItem('hail-mary:v1','{broken'));await bad.reload();assert.equal(await bad.locator('.mission-card').count(),3);
  await bad.goto('http://localhost:4173/#design=%7Bbad');assert.equal(await bad.locator('.mission-card').count(),3);await isolated.close();
  assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
  await writeFile('artifacts/accessibility.json',JSON.stringify(axeResults,null,2));
  const issues=axeResults.flatMap(x=>x.violations.map(v=>`${x.label}: ${v.id} (${v.impact})`));
  assert.deepEqual(issues,[],'Resolve automated accessibility violations before release');
  console.log(JSON.stringify({status:'Functional browser checks passed',screens:axeResults.length,accessibilityIssues:issues,consoleErrors:errors.length,failedRequests:requests.length},null,2));
}finally{await browser.close();}
