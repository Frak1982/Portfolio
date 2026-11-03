import { test, expect } from '@playwright/test';
async function fillContact(page) {
  await page.locator('#sender-name').fill('Mario Rossi');
  await page.locator('#sender-email').fill('mario@example.it');
  await page.locator('#sender-message').fill('Vorrei parlare di un progetto.');
  await page.locator('#privacy-consent').check();
}

test('email links offer webmail and copying before attempting to open a mail app', async ({
  page,
}) => {
  await page.goto('/');
  await fillContact(page);
  const trigger = page.getByRole('button', { name: 'Invia email', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Come vuoi scrivermi?' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Apri Gmail' })).toHaveAttribute(
    'href',
    /^https:\/\/mail\.google\.com\/mail\//,
  );
  await expect(dialog.getByRole('link', { name: 'Apri Outlook' })).toHaveAttribute(
    'href',
    /^https:\/\/outlook\.live\.com\//,
  );
  await expect(dialog.getByRole('link', { name: "Apri l'app email" })).toHaveAttribute(
    'href',
    /^mailto:fraraci82@gmail\.com\?subject=/,
  );
  await expect(dialog.getByRole('button', { name: 'Copia messaggio' })).toBeVisible();
  await expect(page).toHaveURL('http://127.0.0.1:4173/');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.locator('.header').getByRole('link', { name: 'Contattami' }).click();
  await expect(page).toHaveURL(/#contatti$/);
  await expect(dialog).not.toBeVisible();
  await expect(page.locator('#contatti h2')).toBeInViewport();
  await trigger.click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Chiudi opzioni email' }).click();
  await expect(dialog).not.toBeVisible();
});

test('prepared draft preserves text and can be copied without an email application', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text) => {
          window.copiedEmail = text;
        },
      },
    });
  });
  await page.goto('/');
  const message = 'Ciao! Vorrei un sito per caffè & tè.\nBudget: 1.000 € + IVA.';
  await page.locator('#sender-name').fill('Mario Rossi');
  await page.locator('#sender-email').fill('mario+portfolio@example.it');
  await page.locator('#sender-message').fill(message);
  await page.getByRole('button', { name: 'Invia email', exact: true }).click();
  await expect(page.locator('#email-dialog')).not.toBeVisible();
  await page.locator('#privacy-consent').check();
  await page.getByRole('button', { name: 'Invia email', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Come vuoi scrivermi?' });
  await expect(dialog).toBeVisible();
  const gmail = new URL(await page.locator('#email-gmail').getAttribute('href'));
  const outlook = new URL(await page.locator('#email-outlook').getAttribute('href'));
  const app = new URL(await page.locator('#email-app').getAttribute('href'));
  expect(gmail.searchParams.get('to')).toBe('fraraci82@gmail.com');
  expect(gmail.searchParams.get('body')).toContain(message);
  expect(outlook.searchParams.get('body')).toBe(gmail.searchParams.get('body'));
  expect(app.searchParams.get('body')).toBe(gmail.searchParams.get('body'));
  expect(gmail.searchParams.get('body')).toContain('mario+portfolio@example.it');
  await dialog.getByRole('button', { name: 'Copia messaggio' }).click();
  await expect(dialog.getByRole('status')).toContainText('Copiato');
  expect(await page.evaluate(() => window.copiedEmail)).toContain(message);
  await page.keyboard.press('Escape');
  await expect(page.locator('#sender-message')).toHaveValue(message);
  await page.getByRole('button', { name: 'Invia email', exact: true }).click();
  await expect(page.locator('#email-preview')).toHaveValue(new RegExp('Nome: Mario Rossi'));
  expect(await page.locator('#email-preview').inputValue()).toContain(message);
});

test('denied clipboard access offers selectable text and stays usable on a small screen', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error('Clipboard access denied');
        },
      },
    });
  });
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/');
  await fillContact(page);
  await page.getByRole('button', { name: 'Invia email', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Come vuoi scrivermi?' });
  await dialog.getByRole('button', { name: 'Copia messaggio' }).click();
  const preview = dialog.getByRole('textbox', { name: 'Testo da copiare' });
  await expect(preview).toBeVisible();
  await expect(preview).toBeFocused();
  expect(
    await preview.evaluate((input) => input.value.slice(input.selectionStart, input.selectionEnd)),
  ).toBe(await preview.inputValue());
  await expect(dialog.getByRole('status')).toContainText('Testo selezionato');
  expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  const bounds = await dialog.boundingBox();
  expect(bounds.height).toBeLessThanOrEqual(608);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});
