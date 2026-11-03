import { test, expect } from '@playwright/test';

test('all resources load and the console has no runtime errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  await page.goto('/');
  await page.locator('#contatti').scrollIntoViewIfNeeded();
  await expect(page.locator('#contact-form')).toBeVisible();
  await page.locator('#competenze').scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page
        .locator('.skill img')
        .evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0)),
    )
    .toBe(true);
  expect(errors).toEqual([]);
});

for (const width of [320, 390, 768, 1440]) {
  test(`layout keeps its gutters without horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    for (const id of ['competenze', 'progetti', 'chi-sono', 'contatti']) {
      const padding = await page.locator(`#${id}`).evaluate((element) => {
        const styles = getComputedStyle(element);
        return [parseFloat(styles.paddingLeft), parseFloat(styles.paddingRight)];
      });
      expect(padding.every((value) => value > 0)).toBe(true);
    }
    await expect(page.getByRole('navigation')).toBeVisible();
    const headerContainsNavigation = await page
      .getByRole('navigation')
      .evaluate(
        (navigation) =>
          navigation.getBoundingClientRect().bottom <=
          navigation.closest('header').getBoundingClientRect().bottom,
      );
    expect(headerContainsNavigation).toBe(true);
  });
}

test('project dialog supports keyboard, focus restoration and safe padding clicks', async ({
  page,
}) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Dettagli tecnici' });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Triskele Gastronomie' })).toBeVisible();
  await dialog.click({ position: { x: 5, y: 5 } });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.getByRole('button', { name: 'Scopri il prototipo' }).click();
  await expect(dialog.getByRole('heading', { name: 'CreativePuzzle' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Chiudi finestra' }).click();
  await expect(dialog).not.toBeVisible();
});

test('content and direct contact links remain available without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  for (const id of ['competenze', 'progetti', 'chi-sono', 'contatti']) {
    const section = page.locator(`#${id}`);
    await expect(section).toBeVisible();
    await expect(section).toHaveCSS('opacity', '1');
  }
  await expect(page.locator('#contact-form')).toBeHidden();
  await expect(page.getByRole('link', { name: "Invia un'email" })).toHaveAttribute(
    'href',
    'mailto:fraraci82@gmail.com',
  );
  await context.close();
});

test('reduced motion renders static editors and rejects whitespace-only contact fields', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.monitor-typing')).toHaveCount(3);
  await expect(page.locator('.monitor-typing').first()).toContainText('export class App');
  await expect(page.locator('.caret')).toHaveCount(0);
  await page.locator('#sender-name').fill('   ');
  await page.locator('#sender-email').fill('test@example.com');
  await page.locator('#sender-message').fill('   ');
  await page.getByRole('button', { name: 'Prepara il messaggio' }).click();
  expect(await page.locator('#sender-name').evaluate((input) => input.validity.customError)).toBe(
    true,
  );
  await page.locator('#sender-name').fill('Francesco');
  expect(await page.locator('#sender-name').evaluate((input) => input.validity.customError)).toBe(
    false,
  );
});

test('decorative animation pauses offscreen and reacts to motion preference changes', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const scene = page.locator('.visual');
  await expect(scene).not.toHaveClass(/animations-paused/);
  await expect(page.locator('.caret').first()).toBeAttached();
  await page.evaluate(() =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }),
  );
  await expect(scene).toHaveClass(/animations-paused/);
  await expect(page.locator('.caret')).toHaveCount(0);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(scene).not.toHaveClass(/animations-paused/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(scene).toHaveClass(/animations-paused/);
  await expect(page.locator('.caret')).toHaveCount(0);
  await expect(page.locator('.monitor-typing').first()).toContainText('export class App');
});
