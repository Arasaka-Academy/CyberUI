import { test, expect, type Page } from '@playwright/test';
import { resolve } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { webScenes } from '../../apps/docs/src/replica/scenes';

async function openEnglish(page: Page, id: string, embedded = false) {
  await page.goto('/#/' + (embedded ? 'replica/' : 'preview/') + id);
  await expect(page.locator('[data-web-scene]')).toBeVisible();
  const language = page.getByRole('button', { name: 'Switch to English', exact: true });
  if (await language.count()) await language.click();
  await expect(page.getByRole('region', { name: 'Interactive Web application' })).toBeVisible();
}
test('Web gallery, command search and standalone routes discover all three products', async ({ page }) => {
  await openEnglish(page, 'dashboard', true);
  await expect(page.getByRole('radio', { name: '3:4', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Open standalone/ })).toHaveAttribute('href', '#/preview/dashboard');
  await page.goto('/#/replica');
  for (const scene of webScenes) await expect(page.getByRole('link', { name: new RegExp(scene.en) }).first()).toBeVisible();
  await page.keyboard.press('Control+k');
  const command = page.getByRole('dialog', { name: 'Search CyberUI' });
  await command.getByRole('searchbox').fill('Agent chat');
  await command.getByRole('option', { name: /Agent chat workspace/ }).click();
  await expect(page).toHaveURL(/replica\/agent-chat/);
  await page.goto('/#/preview/unknown'); await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
});
test('project tasks validate, persist, change status, update metrics and delete', async ({ page }) => {
  await openEnglish(page, 'dashboard');
  await expect(page.locator('[data-metric="1"] strong')).toContainText('09');
  const create = page.getByRole('button', { name: 'New task', exact: true }); await create.click();
  let dialog = page.getByRole('dialog', { name: 'Create task' });
  await dialog.getByRole('button', { name: 'Save task', exact: true }).click();
  await expect(dialog.getByText('Enter a task title.')).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: 'Task title' })).toBeFocused();
  await dialog.getByRole('textbox', { name: 'Task title' }).fill('Launch acceptance');
  await dialog.getByRole('button', { name: 'Save task', exact: true }).click();
  await expect(dialog).toHaveCount(0); await expect(create).toBeFocused();
  await expect(page.locator('[data-metric="1"] strong')).toContainText('10');
  await page.getByRole('searchbox', { name: 'Search tasks' }).fill('Launch acceptance');
  await page.getByRole('button', { name: 'Change status of ORB-113', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Done', exact: true }).click();
  await expect(page.locator('[data-metric="2"] strong')).toContainText('04');
  await page.reload(); await page.getByRole('searchbox', { name: 'Search tasks' }).fill('Launch acceptance');
  await page.getByRole('button', { name: 'Edit ORB-113', exact: true }).click();
  dialog = page.getByRole('dialog', { name: 'Edit task' });
  await dialog.getByRole('textbox', { name: 'Task title' }).fill('Ready to deliver');
  await dialog.getByRole('button', { name: 'Save task', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Search tasks' }).fill('Ready to deliver');
  await expect(page.getByRole('button', { name: 'Ready to deliver', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Delete ORB-113', exact: true }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete task', exact: true }).click();
  await expect(page.getByText('No tasks in this orbit', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters', exact: true }).first().click();
  await expect(page.locator('[data-metric="2"] strong')).toContainText('03');
  await expect(page.getByRole('button', { name: 'Delete ORB-113', exact: true })).toHaveCount(0);
});
test('project filters, table sorting, pagination and reset remain scoped', async ({ page }) => {
  await openEnglish(page, 'dashboard');
  await page.getByRole('radio', { name: 'List', exact: true }).click();
  const table = page.getByRole('table', { name: 'Project tasks' });
  await expect(table.locator('tbody tr')).toHaveCount(5);
  await page.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(table.getByRole('cell', { name: 'ORB-106', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Task', exact: true }).click();
  await expect(table.locator('th[aria-sort="ascending"]')).toContainText('Task');
  await page.getByRole('button', { name: /All projects Project/ }).click();
  await page.getByRole('option', { name: 'Field research', exact: true }).click();
  await expect(table.locator('tbody tr')).toHaveCount(4);
  await page.getByRole('searchbox', { name: 'Search tasks' }).fill('not-found');
  await expect(page.getByText('No tasks in this orbit', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters', exact: true }).first().click();
  await page.goto('/#/preview/agent-chat');
  await page.getByRole('textbox', { name: 'Message NOVA' }).fill('A draft to keep');
  await page.goto('/#/preview/dashboard');
  await page.getByRole('button', { name: 'Reset scene', exact: true }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Reset scene data', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Switch to Chinese', exact: true })).toBeVisible();
  await page.goto('/#/preview/agent-chat');
  await expect(page.getByRole('textbox', { name: 'Message NOVA' })).toHaveValue('A draft to keep');
  await page.goto('/#/replica/book?book=neuro');
  await expect(page.getByRole('progressbar', { name: 'Decrypted' })).toHaveAttribute('aria-valuenow', '42');
});
test('product previews, billing and validated trial complete without changing hash navigation', async ({ page }) => {
  await openEnglish(page, 'product-home');
  await page.getByRole('navigation', { name: 'Product navigation', exact: true }).getByRole('button', { name: 'Pricing', exact: true }).click();
  await expect(page).toHaveURL(/#\/preview\/product-home$/);
  await page.getByRole('radio', { name: 'Yearly · save 20%', exact: true }).click();
  await expect(page.locator('[data-recommended="true"]')).toContainText('$180 billed yearly');
  await page.getByRole('radio', { name: 'Write a report', exact: true }).click();
  await expect(page.getByText(/^weekly-brief\.md/)).toBeVisible();
  const trigger = page.getByRole('button', { name: 'Choose Team', exact: true }); await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Find your flow with PULSE' });
  await expect(dialog.getByRole('button', { name: /Team Trial plan/ })).toContainText('Team');
  for (let i = 0; i < 9; i++) { await page.keyboard.press('Tab'); expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true); }
  await dialog.getByRole('button', { name: 'Start my trial', exact: true }).click();
  await expect(dialog.locator('[role="alert"][tabindex="-1"]')).toBeFocused();
  await dialog.getByRole('textbox', { name: 'Your name' }).fill('Alex');
  await dialog.getByRole('textbox', { name: 'Work email' }).fill('invalid');
  await dialog.getByRole('button', { name: 'Start my trial', exact: true }).click();
  await expect(dialog.getByRole('textbox', { name: 'Your name' })).toHaveValue('Alex');
  await dialog.getByRole('textbox', { name: 'Work email' }).fill('alex@example.com');
  await dialog.getByRole('button', { name: 'Start my trial', exact: true }).click();
  await expect(dialog.getByRole('heading', { name: 'You’re on the list.' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Continue exploring', exact: true }).click();
  await expect(trigger).toBeFocused();
  await trigger.click(); await expect(dialog.getByRole('textbox', { name: 'Work email' })).toHaveValue('');
  await page.keyboard.press('Escape'); await expect(trigger).toBeFocused();
});
test('Agent streams tools and artifacts, safely renders text and preserves a draft', async ({ page }) => {
  await openEnglish(page, 'agent-chat');
  await page.getByRole('button', { name: /Make a plan/ }).click();
  const response = page.locator('[data-role="assistant"]');
  await expect(response).toHaveAttribute('data-message-status', 'running');
  await expect(response).toHaveAttribute('data-message-status', 'completed');
  await expect(page.getByRole('status').filter({ hasText: 'Response complete. Your result is ready.' })).toBeVisible();
  await response.getByRole('button', { name: 'Read workspace context · Complete', exact: true }).click();
  await expect(response.getByText('3 sample documents indexed. No external requests.', { exact: true })).toBeVisible();
  const result = page.getByRole('complementary', { name: 'Results', exact: true });
  const downloaded = page.waitForEvent('download'); await result.getByRole('button', { name: 'Download', exact: true }).click();
  expect((await downloaded).suggestedFilename()).toBe('launch-plan.md');
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await response.getByRole('button', { name: 'Copy response', exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('A launch plan with room to focus');
  await page.getByRole('textbox', { name: 'Message NOVA' }).fill('A draft to revisit');
  await page.reload(); await expect(page.getByRole('textbox', { name: 'Message NOVA' })).toHaveValue('A draft to revisit');
  await page.getByRole('textbox', { name: 'Message NOVA' }).fill('<img src=x onerror=alert(1)>');
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(page.locator('[data-role="assistant"]').last()).toHaveAttribute('data-message-status', 'completed');
  await expect(page.locator('[data-role="user"]').last()).toContainText('<img src=x onerror=alert(1)>');
  await expect(page.locator('[data-role] img')).toHaveCount(0);
});
test('Agent stops partial work, prevents stale streams and retries a simulated failure once', async ({ page }) => {
  await openEnglish(page, 'agent-chat');
  const input = page.getByRole('textbox', { name: 'Message NOVA' });
  await input.fill('A release plan'); await input.press('Enter');
  const first = page.locator('[data-role="assistant"]').first();
  await expect(first.getByRole('heading', { level: 4 })).toBeVisible();
  await page.getByRole('button', { name: 'Stop', exact: true }).click();
  await expect(first).toHaveAttribute('data-message-status', 'stopped');
  await page.getByRole('button', { name: 'New conversation', exact: true }).click();
  await page.getByText('Simulate tool failure', { exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'Simulate tool failure', exact: true })).toBeChecked();
  await input.fill('Analyze the research'); await page.getByRole('button', { name: 'Send', exact: true }).click();
  const failed = page.locator('[data-role="assistant"]');
  await expect(failed).toHaveAttribute('data-message-status', 'error');
  await failed.getByRole('button', { name: 'Retry response', exact: true }).click();
  await expect(failed).toHaveAttribute('data-message-status', 'completed');
  await expect(page.locator('[data-role="user"]')).toHaveCount(1);
  await page.getByRole('button', { name: /A release plan/ }).first().click();
  await expect(page.locator('[data-role="assistant"]')).toHaveAttribute('data-message-status', 'stopped');
  await page.getByRole('button', { name: 'Regenerate response', exact: true }).click();
  await page.goto('/#/preview/dashboard');
  await page.goto('/#/preview/agent-chat');
  await expect(page.locator('[data-role="assistant"]')).toHaveAttribute('data-message-status', 'stopped');
});
test('Agent IME, session rename, search and deletion preserve keyboard behavior', async ({ page }) => {
  await openEnglish(page, 'agent-chat'); const input = page.getByRole('textbox', { name: 'Message NOVA' });
  await input.fill('中文输入');
  await input.dispatchEvent('keydown', { key: 'Enter', code: 'Enter', isComposing: true });
  await expect(page.locator('[data-role="user"]')).toHaveCount(0);
  await input.press('Shift+Enter'); await expect(input).toHaveValue('中文输入\n');
  await input.fill('My launch plan'); await input.press('Enter');
  await expect(page.locator('[data-role="assistant"]')).toHaveAttribute('data-message-status', 'completed');
  await page.locator('[data-selected="true"]').getByRole('button', { name: /^Actions for / }).click();
  await page.getByRole('menuitem', { name: 'Rename conversation', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Rename conversation', exact: true });
  await dialog.getByRole('textbox', { name: 'Conversation title' }).fill(''); await dialog.getByRole('button', { name: 'Save title', exact: true }).click();
  await expect(dialog.getByText('Enter a conversation title.')).toBeVisible();
  await dialog.getByRole('textbox', { name: 'Conversation title' }).fill('Launch notes'); await dialog.getByRole('button', { name: 'Save title', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Search conversations', exact: true }).fill('Launch notes');
  await expect(page.locator('[data-selected="true"]')).toContainText('Launch notes');
  await page.locator('[data-selected="true"]').getByRole('button', { name: /^Actions for / }).click(); await page.getByRole('menuitem', { name: 'Delete conversation', exact: true }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete conversation', exact: true }).click();
  await expect(input).toBeFocused();
  await page.getByRole('button', { name: 'Clear search', exact: true }).click();
  await page.reload(); await expect(page.getByRole('button', { name: /^Launch notes/ })).toHaveCount(0);
});
test('Agent preserves a reader’s scroll position and offers a return to the latest message', async ({ page }) => {
  await openEnglish(page, 'agent-chat');
  await page.getByRole('button', { name: /Research signals/ }).first().click();
  const messages = page.getByRole('log', { name: 'Conversation messages' });
  await messages.evaluate(el => { el.scrollTop = 0; el.dispatchEvent(new Event('scroll')); });
  await page.getByRole('textbox', { name: 'Message NOVA' }).fill('Another plan');
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await messages.evaluate(el => { el.scrollTop = 0; el.dispatchEvent(new Event('scroll')); });
  await expect(page.getByRole('button', { name: 'Back to latest', exact: true })).toBeVisible();
  expect(await messages.evaluate(el => el.scrollTop)).toBe(0);
  await page.getByRole('button', { name: 'Back to latest', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Back to latest', exact: true })).toHaveCount(0);
});
test('Agent recovers partial work on reload and keeps the response language chosen at send time', async ({ page }) => {
  await openEnglish(page, 'agent-chat');
  await page.getByRole('textbox', { name: 'Message NOVA' }).fill('Keep this partial plan');
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(page.locator('[data-role="assistant"]').getByRole('heading', { level: 4 })).toBeVisible();
  await page.reload();
  await expect(page.locator('[data-role="assistant"]')).toHaveAttribute('data-message-status', 'stopped');
  await page.getByRole('button', { name: 'Regenerate response', exact: true }).click();
  await page.getByRole('button', { name: 'Switch to Chinese', exact: true }).click();
  await expect(page.locator('[data-role="assistant"]')).toHaveAttribute('data-message-status', 'completed');
  await expect(page.locator('[data-role="assistant"]')).toContainText('A launch plan with room to focus');
  await expect(page.locator('[data-role="user"]')).toHaveCount(1);
  await page.getByRole('button', { name: '重置场景', exact: true }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: '重置场景数据', exact: true }).click();
  await expect(page.locator('[data-role]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Switch to English', exact: true })).toBeVisible();
});
test('local demos remain usable when persistent storage is unavailable', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Storage unavailable', 'SecurityError'); } }); });
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await openEnglish(page, 'dashboard');
  await page.getByRole('button', { name: 'New task', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Create task' });
  await dialog.getByRole('textbox', { name: 'Task title' }).fill('Works in memory');
  await dialog.getByRole('button', { name: 'Save task', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Works in memory', exact: true })).toBeVisible();
  await expect(page.locator('[data-metric="1"] strong')).toContainText('10');
  expect(errors).toEqual([]);
});
for (const width of [375, 768, 1024, 1440]) test(`Web scenes fit embedded and standalone at ${width}px in both languages`, async ({ page }) => {
  await page.setViewportSize({ width, height: 1000 }); await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  for (const locale of ['zh-CN', 'en']) {
    await page.goto('/'); if (locale === 'en') await page.getByRole('button', { name: 'Switch to English', exact: true }).click();
    for (const scene of webScenes) for (const mode of ['replica', 'preview']) {
      await page.goto(`/#/${mode}/${scene.id}`); await expect(page.getByRole('heading', { level: 1 })).toBeVisible(); await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${locale} ${mode} ${scene.id}`).toBe(true);
      if (width === 375 && scene.id === 'product-home') {
        await page.getByRole('button', { name: locale === 'en' ? 'Open product navigation' : '打开产品导航', exact: true }).click();
        await expect(page.getByRole('dialog')).toBeVisible(); await page.keyboard.press('Escape');
      }
      if (width === 375 && scene.id === 'agent-chat') {
        const trigger = page.getByRole('button', { name: locale === 'en' ? 'Open conversations' : '打开会话列表', exact: true }); await trigger.click();
        await expect(page.getByRole('dialog')).toBeVisible(); await page.keyboard.press('Escape'); await expect(trigger).toBeFocused();
      }
    }
  }
  expect(errors).toEqual([]);
});
test('Web scenes remain operable in landscape and at 200 percent zoom', async ({ page }) => {
  await openEnglish(page, 'dashboard');
  for (const viewport of [{ width: 812, height: 375 }, { width: 1440, height: 1000 }]) {
    await page.setViewportSize(viewport);
    for (const scene of webScenes) for (const mode of ['replica', 'preview']) {
      await page.goto(`/#/${mode}/${scene.id}`);
      if (viewport.width === 1440) await page.evaluate(() => { document.documentElement.style.zoom = '2'; });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), mode + '/' + scene.id).toBe(true);
      if (scene.id === 'dashboard') { await page.getByRole('button', { name: 'New task', exact: true }).click(); await expect(page.getByRole('dialog', { name: 'Create task' })).toBeVisible(); await page.keyboard.press('Escape'); }
    }
  }
});
test('all Web scenes pass automated WCAG checks in fourteen palettes and both languages', async ({ page }) => {
  test.setTimeout(300000); await openEnglish(page, 'dashboard');
  const results: { scheme: string; mode: string; locale: string; route: string; violations: unknown[] }[] = [];
  for (const scheme of ['neon', 'mono', 'graphite', 'synthwave', 'bloodline', 'terminal', 'amber']) for (const mode of ['dark', 'light']) for (const locale of ['en', 'zh-CN']) {
    await page.evaluate(({ scheme, mode, locale }) => { const key = 'cyberui-web-demo-v1'; const state = JSON.parse(localStorage.getItem(key)!); state.settings = { ...state.settings, scheme, mode, locale }; localStorage.setItem(key, JSON.stringify(state)); }, { scheme, mode, locale });
    for (const scene of webScenes) for (const presentation of ['replica', 'preview']) {
      const route = `/${presentation}/${scene.id}`; await page.goto('/#' + route); await expect(page.locator('h1')).toBeVisible(); await page.evaluate(() => document.fonts.ready);
      await page.addScriptTag({ path: resolve('node_modules/axe-core/axe.min.js') });
      const violations = await page.evaluate(async () => { const axe = (window as unknown as { axe: { run: (root: Document, options: object) => Promise<{ violations: { id: string; nodes: { target: string[] }[] }[] }> } }).axe; return (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } })).violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })); });
      results.push({ scheme, mode, locale, route, violations });
    }
  }
  mkdirSync(resolve('artifacts'), { recursive: true }); writeFileSync(resolve('artifacts/web-scenes-accessibility.json'), JSON.stringify(results, null, 2) + '\n');
  expect(results.filter(r => r.violations.length)).toEqual([]);
});
test('record the three Web products on desktop and mobile', async ({ page }) => {
  const out = resolve('artifacts/screenshots'); mkdirSync(out, { recursive: true });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: width === 375 ? 900 : 1000 });
    for (const scene of webScenes) {
      await page.goto('/#/preview/' + scene.id);
      await expect(page.locator(`[data-web-scene="${scene.id}"]`)).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: `${out}/${scene.id}-zh-${width === 375 ? 'mobile' : 'desktop'}.png`, fullPage: true });
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 }); await page.goto('/#/replica');
  await expect(page.getByRole('region', { name: 'Web 应用场景' })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out + '/scene-gallery-zh-desktop.png', fullPage: true });
});
