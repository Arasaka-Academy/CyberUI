import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { components } from '../../apps/docs/src/catalogue';
import { readerScenes } from '../../apps/docs/src/replica/scenes';

test('all component documents, reader pages and fourteen palettes have no automated WCAG A/AA violations', async ({page}) => {
  test.setTimeout(180000);
  const results: {route:string;scheme:string;mode:string;locale:string;violations:unknown[]}[]=[];
  const audit=async(route:string)=>{
    await page.goto('/#'+route);
    await expect(page.locator('h1')).toBeVisible();
    await page.evaluate(()=>document.fonts.ready);
    await page.addScriptTag({path:resolve('node_modules/axe-core/axe.min.js')});
    const result=await page.evaluate(async()=>{
      const root=document.querySelector('[data-cyberui]')!;
      const axe=(window as unknown as {axe:{run:(root:Document,options:object)=>Promise<{violations:{id:string;impact:string;nodes:{target:string[];failureSummary:string}[]}[]}>}}).axe;
      const {violations}=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});
      return {scheme:root.getAttribute('data-scheme')!,mode:root.getAttribute('data-mode')!,locale:root.getAttribute('lang')!,violations};
    });
    results.push({route,...result});
  };
  await page.goto('/');
  await page.getByRole('button',{name:'Switch to English'}).click();
  for(const route of ['/','/components','/foundations','/themes',...components.map(c=>'/components/'+c.name),...readerScenes.map(s=>'/replica/reader/'+s.id)])await audit(route);
  for(const scheme of ['neon','mono','graphite','synthwave','bloodline','terminal','amber'])for(const mode of ['Light','Dark']){
    await page.goto('/#/themes');await page.getByRole('button',{name:scheme,exact:true}).click();await page.getByRole('radio',{name:mode,exact:true}).click();
    for(const route of ['/themes','/components/Button','/replica/operator','/replica/calendar'])await audit(route);
  }
  await page.getByRole('button',{name:'Switch to Chinese'}).click();
  for(const route of ['/','/components/Input','/components/Calendar','/replica/home','/replica/book','/themes'])await audit(route);
  mkdirSync(resolve('artifacts'),{recursive:true});
  writeFileSync(resolve('artifacts/accessibility-audit.json'),JSON.stringify(results,null,2)+'\n');
  const failures=results.filter(r=>r.violations.length).map(r=>({route:r.route,scheme:r.scheme,mode:r.mode,locale:r.locale,issues:r.violations}));
  expect(failures.map(f=>({...f,issues:(f.issues as {id:string;nodes:{target:string[]}[]}[]).map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))}))).toEqual([]);
});
