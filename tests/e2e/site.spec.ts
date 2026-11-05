import { test, expect, type Page } from '@playwright/test';
import { components } from '../../apps/docs/src/catalogue';
import { references, readerScenes } from '../../apps/docs/src/replica/scenes';
import { products } from '../../apps/docs/src/products';
import { resolve } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';

async function english(page:Page){await page.goto('/');await page.getByRole('button',{name:'Switch to English'}).click();}
test('65 component documents render live examples, public APIs and copyable code',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await english(page);
  for(const component of components){
    await page.goto(`/#/components/${component.name}`);
    await expect(page.getByRole('heading',{level:1,name:component.name+'_',exact:true})).toBeVisible();
    await expect(page.locator('.component-stage')).toBeVisible();
    await expect(page.getByRole('button',{name:'Copy code'})).toBeVisible();
    await expect(page.getByRole('table',{name:'Component properties'})).toBeVisible();
    expect(await page.locator('.component-stage').innerHTML()).not.toContain('undefined');
  }
  expect(errors).toEqual([]);
});
test('all registered scenes and all 19 reference mappings are reachable',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await english(page);
  for(const product of products){await page.goto('/#/replica/'+product.id);await expect(page.getByRole('heading',{level:1,name:product.en+'_',exact:true})).toBeVisible();await expect(page.locator('[data-product-scene]')).toHaveAttribute('data-product-scene',product.id);}
  for(const scene of readerScenes){await page.goto('/#/replica/reader/'+scene.id);await expect(page.locator('[data-reader-page]')).toHaveAttribute('data-reader-page',scene.id);await expect(page.getByRole('region',{name:'Interactive cyberdeck'})).toBeVisible();}
  await page.goto('/#/replica/reader/references');await expect(page.locator('.reference-card')).toHaveCount(19);
  for(const ref of references){for(let i=0;i<ref.parts.length;i++){const part=ref.parts[i];await page.goto(`/#/replica/${part.scene}?view=compare&ref=${ref.id}&part=${i}&${part.query??''}`);await expect(page.locator('.source-image img')).toHaveAttribute('src',new RegExp(ref.file));await expect(page.locator('.fixed-reference')).toBeVisible();}}
  expect(errors).toEqual([]);
});
test('rename validation, favorite, trash, persistence and recovery preserve the book',async({page})=>{
  await english(page);await page.goto('/#/replica/book?book=neuro');
  await page.getByRole('button',{name:'Rename',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Rename book'});
  await dialog.getByRole('textbox',{name:'Book title'}).fill('');await dialog.getByRole('button',{name:'Save title'}).click();await expect(dialog.getByText('Enter a title.')).toBeVisible();
  await dialog.getByRole('textbox',{name:'Book title'}).fill('Night City Archive');await dialog.getByRole('button',{name:'Save title'}).click();await expect(page.locator('.book-dossier h3')).toHaveText('Night City Archive');
  await page.getByRole('button',{name:'Saved',exact:true}).click();await expect(page.getByRole('button',{name:'Favorite',exact:true})).toHaveAttribute('aria-pressed','false');
  await page.getByRole('button',{name:'Delete',exact:true}).click();await page.getByRole('alertdialog').getByRole('button',{name:'Move to trash',exact:true}).click();
  await page.reload();await expect(page.getByText('IN TRASH',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Restore book'}).click();await expect(page.getByText('EPUB // READY',{exact:true})).toBeVisible();
  await expect(page.getByRole('progressbar',{name:'Decrypted'})).toHaveAttribute('aria-valuenow','42');
  await page.goto('/#/replica/library?q=Night');await expect(page.getByRole('button',{name:'Open Night City Archive'})).toBeVisible();
});
test('reading milestones pay once and purchases equip exactly once',async({page})=>{
  await english(page);await page.goto('/#/replica/book?book=carbon');await page.getByRole('button',{name:'Take reading gig'}).click();await page.getByRole('button',{name:'Read +10%',exact:true}).click();
  await page.goto('/#/replica/payouts');await expect(page.locator('.balance-readout strong')).toHaveText('€$350');await expect(page.getByRole('cell',{name:'+ €$50',exact:true})).toHaveCount(1);
  await page.goto('/#/replica/shop?category=frames');const item=page.locator('[data-item-id="frames-notch"]');await item.getByRole('button',{name:'Buy €$100',exact:true}).click();await expect(item.getByRole('button',{name:'Equipped',exact:true})).toBeDisabled();await expect(page.locator('.shop-balance strong')).toHaveText('€$250');
  await page.reload();await expect(item.getByRole('button',{name:'Equipped',exact:true})).toBeDisabled();await expect(page.locator('.shop-balance strong')).toHaveText('€$250');
  await expect(page.locator('[data-item-id="frames-glitch"]').getByRole('button')).toBeDisabled();
  await page.getByRole('button',{name:'Reset demo',exact:true}).first().click();await page.getByRole('alertdialog').getByRole('button',{name:'Reset all data',exact:true}).click();await expect(page.getByRole('button',{name:'Switch to English'})).toBeVisible();
});
test('settings save across reload, every shop category has five appearances',async({page})=>{
  await english(page);await page.goto('/#/replica/fonts');await page.getByRole('button',{name:'Font family'}).click();await page.getByRole('option',{name:'Tomorrow',exact:true}).click();await page.getByRole('button',{name:'Save settings',exact:true}).click();await page.reload();await expect(page.getByRole('button',{name:'Font family'})).toContainText('Tomorrow');
  for(const category of ['frames','backdrops','flairs','jackins']){await page.goto('/#/replica/shop?category='+category);await expect(page.locator('.shop-item')).toHaveCount(5);}
});
test('dialogs constrain focus, Escape restores focus, and multi-select keeps values on Escape',async({page})=>{
  await english(page);await page.goto('/#/components/Dialog');const trigger=page.locator('.component-stage').getByRole('button',{name:'Open dialog',exact:true});await trigger.click();const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
  for(let i=0;i<8;i++){await page.keyboard.press('Tab');expect(await dialog.evaluate(el=>el.contains(document.activeElement))).toBe(true);}
  await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(trigger).toBeFocused();
  await page.goto('/#/components/MultiSelect');await page.locator('.component-stage').getByRole('button',{name:'Cyberdeck',exact:true}).click();await page.getByRole('option',{name:'Terminal',exact:true}).click();await page.keyboard.press('Escape');await expect(page.getByRole('listbox')).toHaveCount(0);await expect(page.locator('.component-stage').getByRole('button',{name:'Remove Terminal'})).toBeVisible();
});
test('data table supports selection, sorting and filtering from a later page',async({page})=>{
  await english(page);await page.goto('/#/components/DataTable');const stage=page.locator('.component-stage');await stage.getByRole('button',{name:'Next page'}).click();await stage.getByRole('searchbox',{name:'Search',exact:true}).fill('Neuromancer');await expect(stage.getByRole('cell',{name:'Neuromancer',exact:true})).toBeVisible();await expect(stage.getByRole('button',{name:'Next page'})).toBeDisabled();await stage.getByRole('checkbox',{name:'Select all visible rows'}).check();await expect(stage.getByRole('status')).toContainText('1 selected');await stage.getByRole('searchbox').fill('');await stage.getByRole('button',{name:'File'}).click();await expect(stage.locator('tbody tr').first()).toContainText('Altered Carbon');
});
test('all 14 theme palettes apply to the live interface',async({page})=>{
  await english(page);await page.goto('/#/themes');
  for(const scheme of ['neon','mono','graphite','synthwave','bloodline','terminal','amber'])for(const mode of ['Light','Dark']){await page.getByRole('button',{name:scheme,exact:true}).click();await page.getByRole('radio',{name:mode,exact:true}).click();await expect(page.locator('[data-cyberui]').first()).toHaveAttribute('data-scheme',scheme);await expect(page.locator('[data-cyberui]').first()).toHaveAttribute('data-mode',mode.toLowerCase());}
});
for(const width of [375,768,1024,1440])test(`Chinese and English layouts fit ${width}px with reduced motion`,async({page})=>{
  await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});
  for(const locale of ['zh-CN','en']){
    await page.goto('/');if(locale==='en')await page.getByRole('button',{name:'Switch to English'}).click();
    for(const route of ['/','/components','/components/Select','/components/OperatorCard','/replica/home','/replica/library','/replica/calendar','/replica/shop','/themes']){await page.goto('/#'+route);await expect(page.locator('h1')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${locale} ${route}`).toBe(true);}
  }
});
test('every component document and replica scene fits a 375px viewport',async({page})=>{
  await page.setViewportSize({width:375,height:812});await page.emulateMedia({reducedMotion:'reduce'});await english(page);
  const results:{route:string;width:number;scrollWidth:number}[]=[];
  for(const route of ['/','/components','/foundations','/themes',...components.map(c=>'/components/'+c.name),...products.map(p=>'/replica/'+p.id),...readerScenes.map(s=>'/replica/reader/'+s.id)]){
    await page.goto('/#'+route);await expect(page.locator('h1')).toBeVisible();await page.evaluate(()=>document.fonts.ready);
    const layout=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));results.push({route,...layout});
    expect(layout.scrollWidth,route).toBeLessThanOrEqual(layout.width+1);
  }
  mkdirSync(resolve('artifacts'),{recursive:true});writeFileSync(resolve('artifacts/mobile-layout-audit.json'),JSON.stringify(results,null,2)+'\n');
});
test('landscape, 200 percent scale and a theme change keep navigation usable',async({page})=>{
  await english(page);await page.setViewportSize({width:812,height:375});await page.goto('/#/components/Dialog');await page.locator('.component-stage').getByRole('button',{name:'Open dialog'}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');
  await page.setViewportSize({width:720,height:500});await page.goto('/#/themes');await page.evaluate(()=>{document.documentElement.style.zoom='2';});await expect(page.getByRole('heading',{level:1})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await page.getByRole('button',{name:'Open navigation'}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Open navigation'})).toBeFocused();await page.evaluate(()=>{document.documentElement.style.zoom='';});
  await page.getByRole('button',{name:'terminal',exact:true}).click();await expect(page.locator('[data-cyberui]').first()).toHaveAttribute('data-scheme','terminal');await page.getByRole('radio',{name:'Light',exact:true}).click();await expect(page.locator('[data-cyberui]').first()).toHaveAttribute('data-mode','light');
});
test('core reading surfaces and components pass axe WCAG A/AA checks',async({page})=>{
  await english(page);
  for(const route of ['/','/components/Input','/components/Dialog','/components/DataTable','/components/Calendar','/replica/home','/replica/book','/replica/calendar','/replica/operator','/themes']){
    await page.goto('/#'+route);await expect(page.locator('h1')).toBeVisible();await page.addScriptTag({path:resolve('node_modules/axe-core/axe.min.js')});
    const issues=await page.evaluate(async()=>{const axe=(window as unknown as {axe:{run:(root:Document,options:object)=>Promise<{violations:{id:string;impact:string;nodes:{target:string[]}[]}[]}>}}).axe;return (await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}})).violations;});
    expect(issues,route).toEqual([]);
  }
});
test('record desktop, mobile, replica and comparison evidence',async({page})=>{
  const out=resolve('artifacts/screenshots');mkdirSync(out,{recursive:true});await page.goto('/');await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:out+'/overview-zh-desktop.png',fullPage:true});await page.goto('/#/replica/home');await page.screenshot({path:out+'/cyberdeck-home.png',fullPage:true});await page.goto('/#/replica/calendar?view=compare&ref=7');await page.screenshot({path:out+'/calendar-reference.png',fullPage:true});await page.goto('/#/components/Button');await page.screenshot({path:out+'/button-documentation.png',fullPage:true});await page.setViewportSize({width:375,height:900});await page.goto('/');await page.screenshot({path:out+'/overview-zh-mobile.png',fullPage:true});
});
