import { expect, test, type Page } from '@playwright/test';
import { resolve } from 'node:path';

async function show(page: Page, locale = 'en', scheme = 'neon', mode = 'dark') {
  await page.goto('/');
  await page.evaluate(({ locale, scheme, mode }) => {
    const key = 'cyberui-web-demo-v1';
    const saved = JSON.parse(localStorage.getItem(key)!);
    saved.settings = { ...saved.settings, locale, scheme, mode };
    localStorage.setItem(key, JSON.stringify(saved));
  }, { locale, scheme, mode });
  await page.goto('/#/components/DatePicker');
  await page.reload();
  await expect(page.locator('.component-stage [data-cyber-date-picker]')).toHaveCount(2);
}

test('shared calendar supports free year editing, leap days, keyboard selection and focus return', async ({ page }) => {
  await show(page);
  const field = page.locator('.component-stage [data-cyber-date-picker]').first();
  await field.getByRole('textbox').press('Alt+ArrowDown');
  const calendar = page.locator('[data-cyber-date-picker-panel]');
  await calendar.getByRole('button', { name: 'October 2026 · Choose month and year' }).click();
  const year = calendar.getByRole('spinbutton', { name: 'Year', exact: true });
  await year.fill('');
  await expect(year).toHaveValue('');
  await year.pressSequentially('2024');
  await calendar.getByRole('button', { name: 'Feb', exact: true }).click();
  await calendar.locator('[data-date="2024-02-29"]').focus();
  await page.keyboard.press('Enter');
  await expect(field.getByRole('textbox')).toHaveValue('2024-02-29');
  await expect(field.getByRole('button')).toBeFocused();
  await field.getByRole('button').click();
  await expect(calendar.locator('[data-date="2024-02-29"]')).toBeFocused();
  await page.keyboard.press('PageDown');
  await expect(calendar.locator('[data-date="2024-03-29"]')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(calendar).toHaveCount(0);
  await expect(field.getByRole('button')).toBeFocused();
  await field.getByRole('textbox').fill('2025-02-29');
  await expect(field.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
});

test('shared date-time keeps an editable local time draft and disabled controls', async ({ page }) => {
  await show(page, 'zh-CN');
  const field = page.locator('.component-stage [data-cyber-date-picker]').last();
  await field.getByRole('button').click();
  const calendar = page.locator('[data-cyber-date-picker-panel]');
  const hours = calendar.getByRole('spinbutton', { name: '时', exact: true });
  await hours.fill('');
  await expect(calendar.getByRole('button', { name: '完成', exact: true })).toBeDisabled();
  await hours.pressSequentially('18');
  await calendar.getByRole('spinbutton', { name: '分', exact: true }).fill('5');
  await calendar.getByRole('button', { name: '完成', exact: true }).click();
  await expect(field.getByRole('textbox')).toHaveValue('2026-10-30 18:05');
  await page.getByText('禁用', { exact: true }).click();
  await expect(field.getByRole('textbox')).toBeDisabled();
  await expect(field.getByRole('button')).toBeDisabled();
});

test('calendar portal uses all fourteen provider palettes and passes automated WCAG A/AA checks', async ({ page }) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const scheme of ['neon', 'mono', 'graphite', 'synthwave', 'bloodline', 'terminal', 'amber']) {
    for (const mode of ['dark', 'light']) {
      await show(page, 'en', scheme, mode);
      const field = page.locator('.component-stage [data-cyber-date-picker]').first();
      await field.getByRole('button').click();
      const calendar = page.locator('[data-cyber-date-picker-panel]');
      await expect(calendar).toBeVisible();
      const root = page.locator('[data-cyberui]').first();
      expect(await calendar.evaluate(element => getComputedStyle(element).backgroundColor)).toBe(await root.evaluate(element => getComputedStyle(element).backgroundColor));
      await page.evaluate(() => document.fonts.ready);
      await page.addScriptTag({ path: resolve('node_modules/axe-core/axe.min.js') });
      const issues = await page.evaluate(async () => {
        const axe = (window as unknown as { axe: { run: (root: Document, options: object) => Promise<{ violations: { id: string; nodes: { target: string[]; failureSummary: string }[] }[] }> } }).axe;
        return (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } })).violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(node => ({ target: node.target, failureSummary: node.failureSummary })) }));
      });
      expect(issues, `${scheme}/${mode}`).toEqual([]);
    }
  }
  expect(errors).toEqual([]);
});

test('English and Chinese calendars fit desktop and mobile with usable touch targets', async ({ page }, info) => {
  test.setTimeout(90000);
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const locale of ['en', 'zh-CN']) {
      await show(page, locale);
      await page.locator('.component-stage [data-cyber-date-picker]').first().getByRole('button').click();
      const calendar = page.locator('[data-cyber-date-picker-panel]');
      const box = (await calendar.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(width < 340 ? 4 : 8);
      expect(box.x + box.width).toBeLessThanOrEqual(width - (width < 340 ? 4 : 8));
      expect(await calendar.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
      const sizes = await calendar.locator('[data-date]').evaluateAll(days => days.map(day => ({ width: day.getBoundingClientRect().width, height: day.getBoundingClientRect().height })));
      expect(sizes.every(size => size.width >= 44 && size.height >= 44)).toBe(true);
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: info.outputPath(`calendar-${width}-${locale}.png`) });
    }
  }
});
