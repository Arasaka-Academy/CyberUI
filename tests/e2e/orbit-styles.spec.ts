import { test, expect } from '@playwright/test';

const schemes = ['neon', 'mono', 'graphite', 'synthwave', 'bloodline', 'terminal', 'amber'];

for (const route of ['preview', 'replica']) for (const locale of ['zh-CN', 'en']) {
  test(`ORBIT token utilities preserve themes and container layouts: ${route}, ${locale}`, async ({ page }) => {
    test.setTimeout(120000);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/#/${route}/dashboard`);
    await expect(page.locator('[data-orbit]')).toBeVisible();
    for (const scheme of schemes) for (const mode of ['dark', 'light']) {
      await page.evaluate(settings => {
        const state = JSON.parse(localStorage.getItem('cyberui-web-demo-v1')!);
        state.settings = { ...state.settings, ...settings };
        localStorage.setItem('cyberui-web-demo-v1', JSON.stringify(state));
      }, { scheme, mode, locale });
      await page.reload();
      const provider = page.locator('[data-cyberui]').first();
      const orbit = page.locator('[data-orbit]');
      await expect(provider).toHaveAttribute('data-scheme', scheme);
      await expect(provider).toHaveAttribute('data-mode', mode);
      await expect(orbit).toHaveCSS('display', 'grid');
      await expect(orbit).toHaveCSS('background-color', await provider.evaluate(el => getComputedStyle(el).backgroundColor));
      await expect(orbit).toHaveCSS('color', await provider.evaluate(el => getComputedStyle(el).color));
      for (const width of [1440, 820, 375]) {
        await page.setViewportSize({ width, height: 1000 });
        const canvasWidth = await page.locator('[data-web-scene]').evaluate(el => el.clientWidth);
        const columns = await orbit.evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
        expect(columns, `${scheme} ${mode} ${width}`).toBe(canvasWidth <= 850 ? 1 : 2);
        // Viewport emulation can resolve before Chromium reapplies nested
        // container queries; assert the rendered layout once reflow completes.
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
      }
      const create = page.getByRole('button', { name: locale === 'en' ? 'New task' : '新建任务', exact: true });
      await create.focus();
      await expect(create).toBeFocused();
      const focus = await create.evaluate(el => { const style = getComputedStyle(el); return { width: style.outlineWidth, style: style.outlineStyle }; });
      expect(focus.width).toBe('2px');
      expect(focus.style).toBe('solid');
    }
    const create = page.getByRole('button', { name: locale === 'en' ? 'New task' : '新建任务', exact: true });
    await create.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(create).toBeFocused();
    const navigation = page.getByRole('button', { name: locale === 'en' ? 'Open project navigation' : '打开项目导航', exact: true });
    await navigation.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(navigation).toBeFocused();
    expect(errors).toEqual([]);
  });
}

test('ORBIT responds to token overrides and inclusive canvas breakpoints without changing other pages', async ({ page }) => {
  await page.goto('/#/preview/dashboard');
  const orbit = page.locator('[data-orbit]');
  const canvas = page.locator('[data-web-scene]');
  await expect(orbit).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const width of [1151, 1150, 851, 850, 581, 580]) {
    await canvas.evaluate((el, size) => { (el as HTMLElement).style.width = `${size}px`; }, width);
    const layout = await orbit.evaluate(el => {
      const board = el.querySelector('section[aria-label]')!.parentElement!;
      return { navigation: getComputedStyle(el).gridTemplateColumns.split(' ').length, board: getComputedStyle(board).gridTemplateColumns.split(' ').length };
    });
    expect(layout.navigation, `${width}px navigation`).toBe(width <= 850 ? 1 : 2);
    expect(layout.board, `${width}px board`).toBe(width <= 580 ? 1 : width <= 1150 ? 2 : 4);
  }
  await page.locator('[data-cyberui]').first().evaluate(el => {
    (el as HTMLElement).style.setProperty('--cyber-space-3xl', '40px');
    (el as HTMLElement).style.setProperty('--cyber-space-md', '17px');
    (el as HTMLElement).style.setProperty('--cyber-bg', '#123456');
  });
  await expect(orbit).toHaveCSS('background-color', 'rgb(18, 52, 86)');
  await canvas.evaluate(el => { (el as HTMLElement).style.width = '1200px'; });
  await expect(orbit.locator(':scope > div > div').first()).toHaveCSS('padding-top', '40px');
  await canvas.evaluate(el => { (el as HTMLElement).style.width = '850px'; });
  await expect(page.locator('[data-metric="0"]').locator('..')).toHaveCSS('gap', '17px');
  await page.locator('[data-cyberui]').first().evaluate(el => {
    for (const name of ['--cyber-space-3xl', '--cyber-space-md', '--cyber-bg']) (el as HTMLElement).style.removeProperty(name);
  });
  // Tailwind's stylesheet remains loaded after navigation, so these check for global resets.
  await page.goto('/#/components/Button');
  await expect(page.locator('.component-stage').getByRole('button').first()).toHaveCSS('padding', '10px 22px');
  await page.goto('/#/preview/product-home');
  await expect(page.locator('[data-web-scene] h2').first()).toHaveCSS('font-weight', '500');
  await expect(page.locator('[data-orbit]')).toHaveCount(0);
});

test('shared animation values resolve through CSS Modules and honor reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#/components/Spinner');
  const spinner = page.locator('.component-stage').getByRole('status');
  await expect(spinner).toHaveCSS('animation-name', 'cyber-spin');
  await expect(spinner).toHaveCSS('animation-duration', '0.8s');
  expect(await spinner.evaluate(el => el.getAnimations().length)).toBeGreaterThan(0);
  await page.locator('[data-cyberui]').first().evaluate(el => { (el as HTMLElement).style.setProperty('--cyber-spin-duration', '1000ms'); });
  await expect(spinner).toHaveCSS('animation-duration', '1s');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await spinner.evaluate(el => parseFloat(getComputedStyle(el).animationDuration))).toBeLessThanOrEqual(.00002);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#/components/Skeleton');
  const skeleton = page.locator('.component-stage').getByRole('status').first();
  await expect(skeleton).toHaveCSS('animation-name', 'cyber-pulse');
  expect(await skeleton.evaluate(el => el.getAnimations().length)).toBeGreaterThan(0);
  await page.goto('/#/components/Select');
  await page.locator('.component-stage').getByRole('button').first().click();
  await expect(page.getByRole('listbox').locator('..')).toHaveCSS('animation-name', 'cyber-appear');
});
