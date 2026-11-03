import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const config = JSON.parse(await readFile(new URL('../seo.config.json', import.meta.url), 'utf8'));

test('SEO metadata and identity are available in the initial HTML without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await expect(page).toHaveTitle(config.title);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    config.description,
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /index, follow/);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('.copy')).toContainText('Francesco Raciti');
  await expect(page.locator('.copy')).toContainText('Padova');
  const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
  expect(schema['@type']).toBe('ProfilePage');
  expect(schema.mainEntity['@type']).toBe('Person');
  expect(schema.mainEntity.name).toBe(config.name);
  expect(schema.mainEntity.sameAs).toContain(config.sameAs[0]);
  if (config.siteUrl) {
    const canonical = new URL(config.siteUrl);
    canonical.pathname = canonical.pathname.replace(/\/$/, '') + '/';
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical.href);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      'content',
      canonical.href,
    );
  } else {
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  }
  await context.close();
});

test('crawling files and favicon are served correctly; private source files stay unavailable', async ({
  request,
}) => {
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(robots.headers()['content-type']).toContain('text/plain');
  expect(await robots.text()).toContain('Allow: /');
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(config.siteUrl ? 200 : 404);
  if (config.siteUrl) {
    expect(sitemap.headers()['content-type']).toContain('application/xml');
    const xml = await sitemap.text();
    expect(xml).toContain('<urlset');
    expect(xml).not.toContain('127.0.0.1');
    expect(xml).not.toContain('<loc>#');
  }
  const icon = await request.get('/assets/favicon.svg');
  expect(icon.status()).toBe(200);
  expect(icon.headers()['content-type']).toContain('image/svg+xml');
  expect((await request.get('/seo.config.json')).status()).toBe(404);
  expect((await request.get('/.git/config')).status()).toBe(404);
});
