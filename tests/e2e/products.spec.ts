import { test, expect, type Page } from '@playwright/test';
import { products } from '../../apps/docs/src/products';
import { readerScenes } from '../../apps/docs/src/replica/scenes';
import { blogPosts } from '../../apps/docs/src/web-scenes/blog-data';

async function openEnglish(page: Page, path: string) {
  await page.goto('/#' + path); await expect(page.locator('h1')).toBeVisible(); const language = page.getByRole('button', { name: 'Switch to English', exact: true });
  if (await language.count()) await language.click();
  await expect(page.locator('[data-cyberui]').first()).toHaveAttribute('lang', 'en');
}
test('gallery contains exactly six peer products and reader search identifies its owner', async ({ page }) => {
  await openEnglish(page, '/replica');
  await expect(page.locator('[data-product-card]')).toHaveCount(6);
  expect(await page.locator('[data-product-card]').evaluateAll(cards => cards.map(card => card.getAttribute('data-product-card')))).toEqual(products.map(product => product.id));
  await expect(page.locator('.reference-card')).toHaveCount(0);
  await page.keyboard.press('Control+k');
  const palette = page.getByRole('dialog', { name: 'Search CyberUI' }); await palette.getByRole('searchbox').fill('Library');
  await palette.getByRole('option', { name: 'Reader / Library', exact: true }).click();
  await expect(page).toHaveURL(/#\/replica\/reader\/library$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Reader_');
});
test('legacy reader links preserve every query parameter and reference panel', async ({ page }) => {
  await openEnglish(page, '/replica/shop?ref=14&part=1&view=compare&category=backdrops&extra=a%2Bb');
  await expect(page).toHaveURL(/#\/replica\/reader\/shop\?ref=14&part=1&view=compare&category=backdrops&extra=a%2Bb$/);
  await expect(page.locator('.source-image img')).toHaveAttribute('src', /14-styles.png/);
  await expect(page.locator('.fixed-reference')).toBeVisible();
  await page.reload(); await expect(page.locator('[data-reader-page="shop"]')).toBeVisible();
  await page.goto('/#/replica/reader'); await expect(page).toHaveURL(/reader\/home$/);
});
test('standalone reader navigation, all internal pages and references keep their presentation', async ({ page }) => {
  await openEnglish(page, '/preview/reader');
  await expect(page).toHaveURL(/preview\/reader\/home$/);
  await page.locator('.deck-launchers button').first().click(); await expect(page).toHaveURL(/preview\/reader\/library$/);
  await page.locator('.deck-status').getByRole('button', { name: 'Open top menu' }).click(); await expect(page).toHaveURL(/preview\/reader\/menu$/);
  await page.goBack(); await expect(page).toHaveURL(/preview\/reader\/library$/); await page.goForward(); await expect(page).toHaveURL(/preview\/reader\/menu$/);
  await page.getByRole('link', { name: '19 visual references', exact: true }).click();
  await expect(page.locator('.reference-card')).toHaveCount(19); await expect(page.locator('.scene-directory a')).toHaveCount(27);
  for (const scene of readerScenes) {
    await page.goto('/#/preview/reader/' + scene.id); await expect(page.locator('[data-reader-page]')).toHaveAttribute('data-reader-page', scene.id);
    await expect(page.getByRole('region', { name: 'Interactive cyberdeck', exact: true })).toBeVisible();
  }
});
test('music clock survives internal navigation, restores paused and stops when leaving the product', async ({ page }) => {
  const mediaRequests: string[] = []; page.on('request', request => { if (request.resourceType() === 'media') mediaRequests.push(request.url()); });
  await page.addInitScript(() => {
    (window as unknown as { audioCalls: number }).audioCalls = 0;
    const forbidden = function () { (window as unknown as { audioCalls: number }).audioCalls++; throw new Error('Audio is not part of this demo'); };
    Object.defineProperty(window, 'Audio', { value: forbidden }); Object.defineProperty(window, 'AudioContext', { value: forbidden });
  });
  await openEnglish(page, '/preview/mobile-app'); await page.clock.install(); await page.clock.pauseAt(Date.now() + 1000);
  const player = page.getByRole('article', { name: 'FREQ music player' });
  await page.getByRole('button', { name: 'Start playback', exact: true }).click(); await page.clock.runFor(3100);
  await expect(player).toHaveAttribute('data-music-position', '3');
  await page.getByRole('navigation', { name: 'Music navigation' }).getByRole('link', { name: 'Search', exact: true }).click(); await page.clock.runFor(2100);
  await expect(player).toHaveAttribute('data-music-position', '5');
  await page.getByRole('searchbox', { name: 'Search tracks & artists' }).fill('Orbital'); await page.getByRole('button', { name: 'Play Orbital', exact: true }).click();
  await page.getByRole('button', { name: 'Save Orbital', exact: true }).click(); await page.clock.runFor(2000);
  await expect(player).toHaveAttribute('data-music-track', 'orbital'); await expect(player).toHaveAttribute('data-music-position', '2');
  await page.clock.resume(); await page.reload(); await expect(player).toHaveAttribute('data-music-playing', 'false'); await expect(player).toHaveAttribute('data-music-position', '2');
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
  await page.getByRole('navigation', { name: 'Music navigation' }).getByRole('link', { name: 'Library', exact: true }).click(); await expect(page.getByRole('button', { name: 'Unsave Orbital', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Start playback', exact: true }).click(); await page.clock.runFor(2000);
  await page.getByRole('button', { name: /Mobile music app Product/ }).click(); await page.getByRole('option', { name: 'Product team blog', exact: true }).click();
  await expect(page.locator('[data-product-scene="blog"]')).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('cyberui-web-scenes-v1')!).music.playing)).toBe(false);
  const position = await page.evaluate(() => JSON.parse(localStorage.getItem('cyberui-web-scenes-v1')!).music.position);
  await page.clock.runFor(4000);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('cyberui-web-scenes-v1')!).music)).toMatchObject({ position, playing: false });
  await page.goto('/#/preview/mobile-app'); await expect(player).toHaveAttribute('data-music-position', String(position));
  expect(mediaRequests).toEqual([]); expect(await page.evaluate(() => (window as unknown as { audioCalls: number }).audioCalls)).toBe(0);
});
test('music seeking, queue, playlists, favorites, volume and reset work with the keyboard', async ({ page }) => {
  await openEnglish(page, '/replica/mobile-app');
  await page.getByRole('link', { name: /Night shift 3 tracks/ }).click(); await page.getByRole('button', { name: 'Play playlist', exact: true }).click();
  await page.getByRole('button', { name: 'Open player', exact: true }).click();
  await page.getByRole('button', { name: 'Pause playback', exact: true }).click();
  const progress = page.getByRole('slider', { name: 'Track progress', exact: true }); await progress.focus(); await progress.press('Home'); await progress.press('ArrowRight');
  await expect(progress).toHaveValue('1');
  const volume = page.getByRole('slider', { name: 'Volume', exact: true }); await volume.focus(); await volume.press('End'); await expect(volume).toHaveValue('100');
  const queueTrigger = page.getByRole('button', { name: 'Open queue', exact: true }); await queueTrigger.click();
  const queue = page.getByRole('dialog', { name: 'Your queue' });
  await expect(queue.getByRole('button', { name: /^Play / })).toHaveCount(3);
  await queue.getByRole('button', { name: 'Move Orbital up', exact: true }).click();
  await queue.getByRole('button', { name: 'Play Orbital', exact: true }).click();
  for (let index = 0; index < 8; index++) { await page.keyboard.press('Tab'); expect(await queue.evaluate(el => el.contains(document.activeElement))).toBe(true); }
  await page.keyboard.press('Escape'); await expect(queueTrigger).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Orbital', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Previous track', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Night Drive', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Next track', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Orbital', exact: true })).toBeVisible();
  await page.keyboard.press('Escape'); await expect(page).toHaveURL(/mobile-app\/playlists\/night-shift$/);
  await page.getByRole('button', { name: 'Reset scene', exact: true }).click(); await page.getByRole('alertdialog').getByRole('button', { name: 'Reset scene data', exact: true }).click();
  await expect(page.getByRole('article', { name: 'FREQ music player' })).toHaveAttribute('data-music-playing', 'false');
  await expect(page.getByRole('article', { name: 'FREQ music player' })).toHaveAttribute('data-music-track', 'night-drive');
});
test('blog filters, empty state, saved stories and bilingual complete articles work', async ({ page }) => {
  await openEnglish(page, '/preview/blog'); await expect(page.locator('[data-blog-card]')).toHaveCount(6);
  await page.getByRole('button', { name: 'Engineering', exact: true }).click(); await expect(page.locator('[data-blog-card]')).toHaveCount(2);
  await page.getByRole('searchbox', { name: 'Search the journal' }).fill('no-such-story'); await expect(page.getByText('No stories here yet.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await page.getByRole('button', { name: 'Save A little less busy. A lot more useful.', exact: true }).click();
  await page.getByRole('button', { name: 'Saved', exact: true }).click(); await expect(page.locator('[data-blog-card]')).toHaveCount(1); await page.reload(); await expect(page.locator('[data-blog-card]')).toHaveCount(1);
  for (const post of blogPosts) {
    await page.goto('/#/preview/blog/posts/' + post.slug);
    await expect(page.getByRole('article', { name: post.title.en, exact: true }).locator('section')).toHaveCount(3);
    await expect(page.getByRole('article', { name: post.title.en, exact: true }).locator('p')).toHaveCount(7);
    await page.getByRole('button', { name: 'Switch to Chinese', exact: true }).click();
    await expect(page.getByRole('article', { name: post.title.zh, exact: true })).toContainText(post.sections[2].paragraphs[1].zh);
    await page.getByRole('button', { name: 'Switch to English', exact: true }).click();
  }
});
test('blog deep links, contents scrolling, clipboard, related stories and local subscription preserve the route', async ({ page }) => {
  const submissions: string[] = []; page.on('request', request => { if (request.method() === 'POST') submissions.push(request.url()); });
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await openEnglish(page, '/replica/blog/posts/relay-2-4');
  await page.getByRole('navigation', { name: 'Article contents', exact: true }).getByRole('button', { name: /A steady rollout/ }).click();
  await expect(page).toHaveURL(/#\/replica\/blog\/posts\/relay-2-4$/); await expect(page.getByRole('heading', { name: 'A steady rollout', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Share article', exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(page.url());
  await page.getByRole('button', { name: 'Back to top', exact: true }).click();
  await page.getByRole('link', { name: 'Designing for the moment you return', exact: true }).click();
  await expect(page).toHaveURL(/posts\/designing-for-the-return$/); await page.reload(); await expect(page.getByRole('heading', { name: 'Designing for the moment you return', exact: true })).toBeVisible();
  await page.goBack(); await expect(page).toHaveURL(/posts\/relay-2-4$/);
  const form = page.locator('#relay-newsletter');
  await form.getByRole('button', { name: 'Subscribe to Relay', exact: true }).click(); await expect(form.getByText('Enter a valid email address.', { exact: true })).toBeVisible();
  const input = form.getByRole('textbox', { name: 'Your email address', exact: true }); await expect(input).toBeFocused(); await input.fill('invalid');
  await form.getByRole('button', { name: 'Subscribe to Relay', exact: true }).click(); await expect(input).toHaveAttribute('aria-invalid', 'true'); await input.fill('reader@example.com');
  await form.getByRole('button', { name: 'Subscribe to Relay', exact: true }).click(); await expect(form.getByRole('status')).toContainText('You’re on the list.'); expect(submissions).toEqual([]);
});

for (const width of [375, 768, 1024, 1440]) test(`music views and blog articles reflow at ${width}px in both languages and presentations`, async ({ page }) => {
  await page.setViewportSize({ width, height: 1000 }); await page.emulateMedia({ reducedMotion: 'reduce' });
  await openEnglish(page, '/preview/mobile-app');
  for (const locale of ['en', 'zh-CN']) {
    if (locale === 'zh-CN') await page.getByRole('button', { name: 'Switch to Chinese', exact: true }).click();
    for (const presentation of ['preview', 'replica']) for (const route of ['mobile-app/search', 'mobile-app/library', 'mobile-app/playlists/night-shift', 'mobile-app/player', 'blog/posts/local-first-interactions']) {
      await page.goto(`/#/${presentation}/${route}`); await expect(page.locator('[data-product-scene]')).toBeVisible(); await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${locale} ${presentation} ${route}`).toBe(true);
      if (route === 'mobile-app/player') { const volume = page.getByRole('slider', { name: locale === 'en' ? 'Volume' : '音量', exact: true }); await volume.scrollIntoViewIfNeeded(); await volume.focus(); await volume.press('Home'); await expect(volume).toHaveValue('0'); }
      if (route === 'mobile-app/search') { const last = page.getByRole('button', { name: locale === 'en' ? 'Play First Light' : '播放 First Light', exact: true }); await last.scrollIntoViewIfNeeded(); await last.click(); await expect(page.locator('[data-music-track]')).toHaveAttribute('data-music-track', 'first-light'); }
      if (route.startsWith('blog/')) { await page.getByRole('navigation', { name: locale === 'en' ? 'Article contents' : '文章目录', exact: true }).getByRole('button').last().click(); await expect(page).toHaveURL(new RegExp(presentation + '/blog/posts/local-first-interactions$')); }
    }
  }
});
