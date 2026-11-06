import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { chromium, expect } from '@playwright/test';
import { readCatalogue } from './build-registry.mjs';

const phase = process.argv[2];
if (!['before', 'after'].includes(phase)) throw new Error('Usage: node scripts/capture-styles.mjs before|after');
const baseURL = process.env.CYBERUI_BASE_URL ?? 'http://127.0.0.1:4176';
const destination = resolve('artifacts/tailwind', phase);
mkdirSync(destination, { recursive: true });
const properties = ['display', 'position', 'box-sizing', 'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'gap', 'row-gap', 'column-gap', 'grid-template-columns', 'grid-column', 'grid-row', 'flex', 'flex-direction', 'flex-wrap', 'align-items', 'justify-content', 'color', 'background-color', 'background-image', 'border-top-width', 'border-top-style', 'border-top-color', 'border-right-width', 'border-right-style', 'border-right-color', 'border-bottom-width', 'border-bottom-style', 'border-bottom-color', 'border-left-width', 'border-left-style', 'border-left-color', 'border-radius', 'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing', 'text-align', 'text-transform', 'text-decoration-line', 'white-space', 'overflow', 'opacity', 'clip-path', 'content', 'z-index'];
const representative = new Set(['Button', 'Input', 'Select', 'Dialog', 'Calendar', 'Panel', 'DataTable', 'SkylineCalendar']);
const results = [];
const browser = await chromium.launch();
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const capture = async (route, root, width, screenshot) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(new URL('/#/' + route, baseURL).href);
    await expect(page.locator(root).first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: '* { animation: none !important; transition: none !important; caret-color: transparent !important; }' });
    const elements = await page.locator(root).first().evaluate((container, keys) => [container, ...container.querySelectorAll('*')].map(element => {
      const get = pseudo => {
        const style = getComputedStyle(element, pseudo);
        return Object.fromEntries(keys.map(key => [key, style.getPropertyValue(key)]));
      };
      return { tag: element.tagName, slot: element.getAttribute('data-slot'), style: get(null), before: get('::before'), after: get('::after') };
    }), properties);
    const name = route.replaceAll('/', '-') + '-' + width;
    if (screenshot) await page.screenshot({ path: resolve(destination, name + '.png'), animations: 'disabled' });
    results.push({ route, width, elements });
  };
  for (const component of await readCatalogue()) await capture('components/' + component.name, '.component-stage', 1440, representative.has(component.name));
  for (const presentation of ['preview', 'replica']) for (const id of ['reader', 'dashboard', 'product-home', 'agent-chat', 'mobile-app', 'blog']) for (const width of [1440, 375]) await capture(presentation + '/' + id, '[data-web-scene]', width, true);
  await context.close();
  writeFileSync(resolve(destination, 'computed.json.gz'), gzipSync(JSON.stringify(results) + '\n'));
  console.log(`Captured ${results.length} component/page style records and 32 representative screenshots in ${destination}`);
} finally {
  await browser.close();
}
