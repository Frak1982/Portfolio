import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, writeFile, mkdir, mkdtemp, cp, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildSeo } from '../scripts/seo.mjs';

const config = JSON.parse(await readFile(new URL('../seo.config.json', import.meta.url), 'utf8'));
const publicUrl = 'https://portfolio.fixture.dev/';

test('public URL is consistent across canonical, social metadata, schema, robots and sitemap', () => {
  const result = buildSeo({ ...config, siteUrl: publicUrl });
  assert.ok(result.head.includes(`<link rel="canonical" href="${publicUrl}"`));
  assert.ok(result.head.includes(`property="og:url" content="${publicUrl}"`));
  assert.ok(result.head.includes(`"@id": "${publicUrl}#person"`));
  assert.ok(result.robots.includes(`Sitemap: ${publicUrl}sitemap.xml`));
  assert.ok(result.sitemap.includes(`<loc>${publicUrl}</loc>`));
  assert.equal((result.sitemap.match(/<loc>/g) || []).length, 1);
  assert.ok(!result.sitemap.includes('<lastmod>'));
});

test('local configuration never publishes a guessed canonical or sitemap', () => {
  const result = buildSeo({ ...config, siteUrl: null });
  assert.ok(!result.head.includes('rel="canonical"'));
  assert.ok(!result.head.includes('property="og:url"'));
  assert.equal(result.sitemap, null);
  assert.equal(result.robots, 'User-agent: *\nAllow: /\n');
});

test('invalid public URLs are rejected before files are changed', () => {
  for (const siteUrl of [
    'http://portfolio.fixture.dev',
    'https://localhost',
    'https://127.0.0.1',
    'https://example.com',
    'https://portfolio.test',
    'https://user:password@portfolio.fixture.dev',
    'https://portfolio.fixture.dev/?preview=1',
    'https://portfolio.fixture.dev/#home',
  ]) {
    assert.throws(() => buildSeo({ ...config, siteUrl }));
  }
});

test('configuration text cannot break out of metadata or JSON-LD', () => {
  const payload = '</script><script>alert("test")</script>';
  const { head } = buildSeo({ ...config, description: payload });
  assert.ok(head.includes('&lt;/script&gt;'));
  assert.ok(head.includes('\\u003c/script>'));
  assert.equal((head.match(/<script/g) || []).length, 1);
});

test('subdirectory deployments resolve image and sitemap URLs correctly', () => {
  const result = buildSeo({ ...config, siteUrl: publicUrl + 'portfolio' });
  assert.ok(result.head.includes(`${publicUrl}portfolio/assets/hero-developer.webp`));
  assert.ok(result.robots.includes(`${publicUrl}portfolio/sitemap.xml`));
});

test('CLI generates stable static files and detects stale production metadata', async () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const parent = resolve(root, 'test-results');
  await mkdir(parent, { recursive: true });
  const fixture = await mkdtemp(resolve(parent, 'seo-'));
  try {
    await mkdir(resolve(fixture, 'scripts'));
    await cp(resolve(root, 'scripts/seo.mjs'), resolve(fixture, 'scripts/seo.mjs'));
    await cp(resolve(root, 'index.html'), resolve(fixture, 'index.html'));
    await writeFile(
      resolve(fixture, 'seo.config.json'),
      JSON.stringify({ ...config, siteUrl: null }),
    );
    const cli = resolve(fixture, 'scripts/seo.mjs');
    const run = (...args) =>
      execFileSync(process.execPath, [cli, ...args], { encoding: 'utf8', stdio: 'pipe' });
    run('--url', publicUrl + 'Portfolio/');
    assert.match(run('--check'), /SEO coerente/);
    const before = await readFile(resolve(fixture, 'index.html'), 'utf8');
    run();
    assert.equal(await readFile(resolve(fixture, 'index.html'), 'utf8'), before);
    await writeFile(resolve(fixture, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
    assert.throws(() => run('--check'));
  } finally {
    // fixture is created exclusively inside test-results for this test.
    assert.ok(fixture.startsWith(parent));
    await rm(fixture, { recursive: true, force: true });
  }
});
