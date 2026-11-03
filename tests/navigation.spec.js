import { test, expect } from '@playwright/test';

test('section navigation keeps the shared address clean and moves focus', async ({ page }) => {
  await page.goto('/');
  for (const section of ['esperienza', 'competenze', 'progetti', 'chi-sono', 'contatti', 'home']) {
    await page.locator(`.navlinks a[href="#${section}"]`).click();
    await expect(page).toHaveURL('http://127.0.0.1:4173/');
    await expect(page.locator(`#${section}`)).toBeInViewport();
    await expect(page.locator(`#${section}`)).toBeFocused();
  }
  await page.locator('.hero .actions a[href="#progetti"]').click();
  await expect(page.locator('#progetti')).toBeInViewport();
  await page.locator('.header .btn').click();
  await expect(page.locator('#contatti h2')).toBeInViewport();
  await page.locator('.brand').click();
  await expect(page.locator('#home')).toBeInViewport();
  await expect(page).toHaveURL('http://127.0.0.1:4173/');
});

test('skip link works from the keyboard without adding a fragment', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Vai al contenuto' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
  await expect(page).toHaveURL('http://127.0.0.1:4173/');
});

test('an incoming section link works but its copied URL opens the home page', async ({
  page,
  context,
}) => {
  await page.goto('/index.html#contatti');
  await expect(page.locator('#contatti h2')).toBeInViewport();
  await expect(page).toHaveURL('http://127.0.0.1:4173/');
  const shared = await context.newPage();
  await shared.goto(page.url());
  expect(await shared.evaluate(() => window.scrollY)).toBe(0);
  await expect(shared.locator('#home h1')).toBeInViewport();
});
