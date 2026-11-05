import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import ts from 'typescript';
const source=ts.transpileModule(readFileSync('apps/docs/src/replica/scenes.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {references}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const base=process.env.CYBERUI_BASE_URL??'http://127.0.0.1:5174/';
const out=resolve('artifacts/reference-comparisons');mkdirSync(out,{recursive:true});
const browser=await chromium.launch();const records=[];
try{
  const page=await browser.newPage({viewport:{width:1800,height:1300},reducedMotion:'reduce'});
  await page.goto(base);await page.getByRole('button',{name:'Switch to English'}).click();
  for(const reference of references)for(let i=0;i<reference.parts.length;i++){
    const part=reference.parts[i];const id=String(reference.id).padStart(2,'0')+'-'+i;
    const route=`#/replica/reader/${part.scene}?view=compare&ref=${reference.id}&part=${i}&${part.query??''}`;
    await page.goto(new URL(route,base).href);await page.locator('.fixed-reference').waitFor();await page.evaluate(()=>document.fonts.ready);
    await page.locator('.fixed-reference').screenshot({path:`${out}/${id}-web.png`});
    await page.locator('.source-image').screenshot({path:`${out}/${id}-source.png`});
    records.push({id,reference:reference.id,file:reference.file,part:part.en,scene:part.scene,route,web:`${id}-web.png`,original:`${id}-source.png`});
  }
  writeFileSync(`${out}/manifest.json`,JSON.stringify(records,null,2)+'\n');
  writeFileSync(`${out}/index.html`,`<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CyberUI visual references</title><style>body{background:#1e1517;color:#93e4ea;font:14px system-ui;margin:24px}main{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}article{border:1px solid #5a3a3c;padding:12px}h2{font-size:14px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:8px}img{display:block;width:100%;height:auto}figure{margin:0}figcaption{font-size:11px;color:#c9a19c;padding:8px 0}@media(max-width:900px){main{grid-template-columns:1fr}}</style><h1>CyberUI / visual references</h1><p>Fixed demo state · 2026-10-30 17:46 · 19 references / ${records.length} independent panels. Reference left, Web right. This is a review archive, not a pixel equality assertion.</p><main>${records.map(r=>`<article><h2>${r.id} / ${r.part}</h2><div class="pair"><figure><img src="${r.original}" alt="Reference ${r.part}"><figcaption>REFERENCE</figcaption></figure><figure><img src="${r.web}" alt="Web ${r.part}"><figcaption>WEB</figcaption></figure></div></article>`).join('')}</main></html>`);
  // A compact contact sheet for checking layout, chamfer direction and visual hierarchy.
  await page.route('http://cyberui-artifacts.local/**',route=>{
    const file=new URL(route.request().url()).pathname.slice(1)||'index.html';
    route.fulfill({body:readFileSync(resolve(out,file)),contentType:file.endsWith('.png')?'image/png':'text/html'});
  });
  await page.goto('http://cyberui-artifacts.local/index.html');await page.locator('img').last().waitFor();await page.evaluate(async()=>Promise.all(Array.from(document.images).map(image=>image.decode())));
  await page.screenshot({path:resolve('artifacts/screenshots/reference-contact-sheet.png'),fullPage:true});
  process.stdout.write(`Captured ${records.length} source/Web panels from all 19 references.\n`);
}finally{await browser.close();}
