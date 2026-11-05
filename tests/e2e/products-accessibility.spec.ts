import { test, expect } from '@playwright/test';
import { resolve } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { products } from '../../apps/docs/src/products';

// Each product gets its own timeout and evidence file. Verify the applied palette
// after reloading: changing storage alone does not update the mounted provider.
for (const product of products) test(`${product.brand} passes WCAG in fourteen palettes, both languages and both presentations`, async ({ page }) => {
  test.setTimeout(300000);
  await page.goto('/#/replica/' + product.id); await expect(page.locator('[data-product-scene]')).toBeVisible();
  await page.evaluate(() => { const key = 'cyberui-web-scenes-v1'; const state = JSON.parse(localStorage.getItem(key)!); state.music.favorites = ['night-drive']; state.blog.bookmarks = ['relay-2-4']; localStorage.setItem(key, JSON.stringify(state)); });
  const results: { scheme: string; mode: string; locale: string; route: string; violations: unknown[] }[] = [];
  const children = product.id === 'reader' ? ['/home', '/references'] : product.id === 'mobile-app' ? ['', '/player'] : product.id === 'blog' ? ['', '/posts/relay-2-4'] : [''];
  for (const scheme of ['neon', 'mono', 'graphite', 'synthwave', 'bloodline', 'terminal', 'amber']) for (const mode of ['dark', 'light']) for (const locale of ['en', 'zh-CN']) {
    await page.evaluate(({ scheme, mode, locale }) => { const key = 'cyberui-web-demo-v1'; const state = JSON.parse(localStorage.getItem(key)!); state.settings = { ...state.settings, scheme, mode, locale }; localStorage.setItem(key, JSON.stringify(state)); }, { scheme, mode, locale });
    await page.reload();
    const provider = page.locator('[data-cyberui]').first();
    await expect(provider).toHaveAttribute('data-scheme', scheme); await expect(provider).toHaveAttribute('data-mode', mode); await expect(provider).toHaveAttribute('lang', locale);
    for (const presentation of ['replica', 'preview']) for (const child of children) {
      const route = `/${presentation}/${product.id}${child}`; await page.goto('/#' + route); await expect(page.locator('[data-product-scene]')).toBeVisible(); await page.evaluate(() => document.fonts.ready);
      await page.addScriptTag({ path: resolve('node_modules/axe-core/axe.min.js') });
      const violations = await page.evaluate(async () => { const axe = (window as unknown as { axe: { run: (root: Document, options: object) => Promise<{ violations: { id: string; nodes: { target: string[]; failureSummary: string }[] }[] }> } }).axe; return (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } })).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, failureSummary: n.failureSummary })) })); });
      results.push({ scheme, mode, locale, route, violations });
    }
  }
  mkdirSync(resolve('artifacts'), { recursive: true }); writeFileSync(resolve(`artifacts/${product.id}-accessibility.json`), JSON.stringify(results, null, 2) + '\n');
  expect(results.filter(result => result.violations.length)).toEqual([]);
});
