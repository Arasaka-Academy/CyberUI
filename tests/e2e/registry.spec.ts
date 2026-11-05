import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const registry = JSON.parse(readFileSync(new URL('../../registry.json', import.meta.url), 'utf8')) as { items: { name: string; meta: { componentName: string } }[] };
const verifiedRef = JSON.parse(readFileSync(new URL('../../apps/docs/src/registry-version.json', import.meta.url), 'utf8')).ref;

test('verified commit and default branch commands pin every example dependency consistently', async ({ page }) => {
  expect(verifiedRef).toMatch(/^[0-9a-f]{40}$/);
  await page.goto('/#/components/Dialog');
  const source = page.getByRole('region', { name: '获取组件源码' });
  const command = source.locator('.code-block code').first();
  await expect(command).toContainText('CyberUI/dialog#' + verifiedRef);
  await expect(command).toContainText('CyberUI/button#' + verifiedRef);
  await expect(command).toContainText('CyberUI/input#' + verifiedRef);
  await source.getByRole('radio', { name: '默认分支', exact: true }).click();
  await expect(command).not.toContainText('#');
  await source.getByRole('radio', { name: '已验证提交', exact: true }).click();
  await expect(command).toContainText('CyberUI/dialog#' + verifiedRef);
  await page.goto('/#/installation');
  await expect(page.locator('.installation-guide .code-block code').nth(1)).toContainText('CyberUI/button#' + verifiedRef);
});

test('all 65 component pages load their actual distributable source', async ({ page }) => {
  await page.goto('/'); await page.getByRole('button', { name: 'Switch to English' }).click();
  for (const item of registry.items) {
    await page.goto('/#/components/' + item.meta.componentName);
    const source = page.getByRole('region', { name: 'Get component source' });
    await expect(source.getByRole('button', { name: 'Copy install command' })).toBeVisible();
    await expect(source.locator('.code-block code').first()).toContainText('Arasaka-Academy/CyberUI/' + item.name);
    await source.getByRole('tab', { name: 'Source files', exact: true }).click();
    await expect(source.locator('.source-destination')).toHaveText('@components/cyberui/' + item.name + '.tsx');
    await expect(source.locator('.code-block code').first()).toContainText('Generated from packages/react/src/' + item.name + '.tsx');
    await expect(source.locator('.code-block code').first()).toContainText(item.meta.componentName);
  }
});

test('source files, keyboard tabs and clipboard failure work in Chinese and English', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/#/components/Button');
  const source = page.getByRole('region', { name: '获取组件源码' });
  await source.getByRole('tab', { name: '命令添加' }).focus(); await page.keyboard.press('ArrowRight');
  await expect(source.getByRole('tab', { name: '源码文件', exact: true })).toHaveAttribute('aria-selected', 'true');
  await source.getByRole('button', { name: '复制当前文件' }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('export const Button');
  await source.getByRole('button', { name: /源码文件/ }).click();
  await page.getByRole('option', { name: 'button.module.css', exact: true }).click();
  await expect(source.locator('.code-block code').first()).toContainText('.button');
  await page.evaluate(() => { Object.defineProperty(navigator.clipboard, 'writeText', { value: async () => { throw new Error('Denied'); } }); });
  await source.getByRole('button', { name: '复制当前文件' }).click();
  await expect(source.getByRole('alert')).toContainText('手动复制');
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await expect(page.getByRole('region', { name: 'Get component source' }).getByRole('tab', { name: 'Source files' })).toBeVisible();
});

test('source documentation and installation guide fit mobile widths', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const language of ['zh', 'en']) {
    await page.goto('/');
    if (language === 'en') await page.getByRole('button', { name: 'Switch to English' }).click();
    await page.goto('/#/components/OperatorCard');
    await page.getByRole('tab', { name: language === 'en' ? 'Source files' : '源码文件', exact: true }).click();
    await expect(page.locator('.component-source .code-block').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.goto('/#/installation');
    await expect(page.locator('h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({ path: `artifacts/screenshots/registry-installation-${language}-mobile.png`, fullPage: true });
  }
});

test('split input styles preserve the color swatch and editable HEX field', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/#/components/ColorPicker');
  const stage = page.locator('.component-stage');
  const swatch = stage.locator('input[type="color"]');
  await expect(swatch).toHaveCSS('width', '48px');
  const hex = stage.getByRole('textbox', { name: /HEX$/ });
  expect((await hex.boundingBox())!.width).toBeGreaterThan(80);
  await hex.fill('#112233');
  await expect(swatch).toHaveValue('#112233');
});
