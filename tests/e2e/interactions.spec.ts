import { test, expect } from '@playwright/test';

test.beforeEach(async({page})=>{await page.goto('/');await page.getByRole('button',{name:'Switch to English'}).click();});

test('theme follows the system, custom colors resolve and reset, code can be copied',async({page,context})=>{
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto('/#/themes');await page.getByRole('radio',{name:'System',exact:true}).click();
  await page.emulateMedia({colorScheme:'light'});await expect(page.locator('[data-cyberui]')).toHaveAttribute('data-mode','light');
  await page.emulateMedia({colorScheme:'dark'});await expect(page.locator('[data-cyberui]')).toHaveAttribute('data-mode','dark');
  await page.getByRole('textbox',{name:'Foreground HEX',exact:true}).fill('#1E1517');await page.getByRole('textbox',{name:'Background HEX',exact:true}).focus();
  await expect(page.locator('[data-cyberui]')).toHaveCSS('color','rgb(255, 255, 255)');await page.getByRole('button',{name:'Copy code'}).click();
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toContain('CyberUIProvider');
  await page.getByRole('button',{name:'Reset Neon theme'}).click();await expect(page.locator('[data-cyberui]')).toHaveCSS('color','rgb(147, 228, 234)');
  await expect(page.getByRole('textbox',{name:'Foreground HEX',exact:true})).toHaveValue('#93E4EA');
});

test('montage selection updates the scene and appearance and keeps comparison mode in the URL',async({page})=>{
  await page.goto('/#/replica/shop?ref=14&view=compare&category=frames');
  await page.getByRole('button',{name:/Montage panel/}).click();await page.getByRole('option',{name:'Backdrops',exact:true}).click();
  await expect(page).toHaveURL(/category=backdrops/);await expect(page.getByRole('radio',{name:'Backdrops',exact:true})).toBeChecked();
  await page.getByRole('button',{name:/Reference image/}).click();await page.getByRole('option',{name:'15 / Four jack-in styles',exact:true}).click();
  await expect(page).toHaveURL(/replica\/jackin/);await expect(page).toHaveURL(/style=terminal/);await expect(page.locator('[data-variant="terminal"]')).toBeVisible();
  await page.getByRole('button',{name:/Montage panel/}).click();await page.getByRole('option',{name:'Scanner',exact:true}).click();await expect(page).toHaveURL(/style=scanner/);await expect(page.locator('[data-variant="scanner"]')).toBeVisible();
  await page.getByRole('radio',{name:'3:4',exact:true}).click();await expect(page).toHaveURL(/view=reference/);await page.reload();await expect(page.locator('.fixed-reference')).toBeVisible();await expect(page.locator('.source-image')).toHaveCount(0);
});

test('saved monochrome covers, profile preview and reading goals change the visible state',async({page})=>{
  await page.goto('/#/replica/covers');await page.getByRole('radio',{name:'Monochrome preview',exact:true}).focus();await page.keyboard.press('Space');await expect(page.locator('.cover-preview-grid [data-color="false"]')).toHaveCount(3);await page.getByRole('button',{name:'Save settings',exact:true}).click();
  await page.goto('/#/replica/book');await expect(page.locator('.book-dossier [data-color="false"]')).toHaveCount(1);
  await page.goto('/#/replica/operator');await page.getByLabel('Profile image preview',{exact:true}).setInputFiles({name:'profile.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="#93E4EA"/></svg>')});await expect(page.locator('[data-slot="operator-mark"] img')).toBeVisible();
  await page.goto('/#/replica/goals');await page.getByRole('textbox',{name:'Daily reading goal (minutes)',exact:true}).fill('60');await page.getByRole('button',{name:'Save goal',exact:true}).click();await expect(page.getByText('Daily goal in progress',{exact:true})).toBeVisible();await page.reload();await expect(page.getByRole('textbox',{name:'Daily reading goal (minutes)',exact:true})).toHaveValue('60');
});

test('parameter changes affect the live control and mobile menu supports keyboard dismissal',async({page})=>{
  await page.goto('/#/components/Button');await page.getByRole('textbox',{name:'Label / title'}).fill('Access console');const button=page.locator('.component-stage').getByRole('button',{name:'Access console'});await expect(button).toBeVisible();await page.getByText('Disabled',{exact:true}).click();await expect(button).toBeDisabled();
  await expect(page.locator('[data-gallery="sizes"] .variant-card')).toHaveCount(3);
  await page.goto('/#/components/VirtualKeyboard');const stage=page.locator('.component-stage');await stage.getByRole('button',{name:'Q',exact:true}).click();await expect(stage.getByRole('textbox')).toHaveValue('NOVA_7Q');await page.getByText('Disabled',{exact:true}).click();await expect(stage.getByRole('textbox')).toBeDisabled();await expect(stage.getByRole('button',{name:'Q',exact:true})).toBeDisabled();
  await page.setViewportSize({width:375,height:812});const menu=page.getByRole('button',{name:'Open navigation'});await menu.click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);await expect(menu).toBeFocused();
});

test('skyline keeps every day visible and supports native keyboard and pointer selection',async({page})=>{
  await page.setViewportSize({width:375,height:812});await page.goto('/#/components/SkylineCalendar');const stage=page.locator('.component-stage');const slider=stage.getByRole('slider',{name:'Cyberdeck'});
  await slider.focus();await expect(slider).toHaveAttribute('aria-valuetext','Day 30: 26 pages');await page.keyboard.press('ArrowLeft');await expect(slider).toHaveAttribute('aria-valuetext','Day 29: 28 pages');await page.keyboard.press('Home');await expect(slider).toHaveValue('0');await expect(stage.getByRole('status')).toHaveText('DAY 1 // 0 PAGES READ');
  await page.keyboard.press('End');await expect(slider).toHaveValue('30');await expect(slider).toHaveAttribute('aria-valuetext','Day 31: 0 pages');
  const bounds=await slider.boundingBox();expect(bounds).not.toBeNull();await slider.click({position:{x:bounds!.width/2,y:bounds!.height/2}});await expect(slider).toHaveValue('15');await expect(stage.getByRole('status')).toHaveText('DAY 16 // 0 PAGES READ');
  const columns=stage.locator('figure [aria-hidden="true"][data-selected]');await expect(columns).toHaveCount(31);const last=await columns.last().boundingBox();expect(last!.x+last!.width).toBeLessThanOrEqual(bounds!.x+bounds!.width+1);
  await stage.getByText('Daily reading data',{exact:true}).click();await expect(stage.locator('dl > div')).toHaveCount(31);
});
