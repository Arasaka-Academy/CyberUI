import { test, expect } from '@playwright/test';

test('Tailwind utilities override component defaults across sizes and variants', async ({ page }) => {
  // ORBIT already emits this utility in the pilot; keep the regression independent
  // of any synthetic stylesheet and exercise the actual compiled cascade.
  await page.goto('/#/preview/dashboard');
  await expect(page.locator('[data-orbit]')).toBeVisible();
  await page.goto('/#/components/Button');
  const button = page.locator('.component-stage').getByRole('button').first();
  await expect(button).toHaveCSS('padding-left', '22px');
  await button.evaluate(el => el.classList.add('tw:px-[12px]', 'tw:text-cyber-ink'));
  await expect(button).toHaveCSS('padding-left', '12px');
  await expect(button).toHaveCSS('padding-right', '12px');
  const ink = await button.evaluate(el => getComputedStyle(el.closest('[data-cyberui]')!).color);
  await expect(button).toHaveCSS('color', ink);
  await button.evaluate(el => { el.setAttribute('data-size', 'lg'); el.setAttribute('data-variant', 'danger'); });
  await expect(button).toHaveCSS('padding-left', '12px');
  await expect(button).toHaveCSS('color', ink);
});

test('shared form modules are compiled before use by composing controls', async ({ page }) => {
  await page.goto('/#/components/Textarea');
  const textarea = page.locator('.component-stage textarea');
  await expect(textarea).toHaveCSS('padding-top', '10px');
  await expect(textarea).toHaveCSS('padding-right', '13px');
  await expect(textarea).toHaveCSS('min-height', '44px');
  await page.goto('/#/components/Select');
  await expect(page.locator('.component-stage').getByRole('button').first()).toHaveCSS('min-height', '44px');
  await expect(page.locator('.component-stage').getByText('赛博终端', { exact: true })).toHaveCSS('text-transform', 'uppercase');
});
test('chart viewport contains resize updates and preserves a visible keyboard focus ring', async ({ page }) => {
  await page.goto('/#/components/Chart');
  const plot = page.locator('.component-stage [role="img"]');
  await expect(plot.locator('svg.recharts-surface')).toBeVisible();
  for (const width of [1440, 375, 820, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
  }
  await plot.locator('svg[tabindex="0"]').focus();
  await expect(plot).toHaveCSS('outline-width', '2px');
  await expect(plot).toHaveCSS('outline-style', 'solid');
});
