import { readFile, writeFile, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { format } from 'prettier';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const start = '<!-- SEO:START — generato da seo.config.json -->';
const end = '<!-- SEO:END -->';
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character],
  );

export function buildSeo(config) {
  let siteUrl = null;
  if (config.siteUrl) {
    const url = new URL(config.siteUrl);
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      !url.hostname.includes('.') ||
      /^(localhost|127\.|0\.|\[)/.test(url.hostname) ||
      /(^|\.)(example\.(com|org|net)|test|invalid|localhost)$/.test(url.hostname)
    ) {
      throw new Error(
        'siteUrl deve essere il vero URL pubblico HTTPS, senza credenziali, query o frammenti.',
      );
    }
    url.pathname = url.pathname.replace(/\/$/, '') + '/';
    siteUrl = url.href;
  }

  const person = {
    '@type': 'Person',
    name: config.name,
    jobTitle: config.jobTitle,
    homeLocation: { '@type': 'Place', name: config.locality },
    sameAs: config.sameAs,
    knowsAbout: config.knowsAbout,
    ...(siteUrl && { '@id': siteUrl + '#person', url: siteUrl }),
  };
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: config.title,
    description: config.description,
    inLanguage: config.language,
    mainEntity: person,
    ...(siteUrl && {
      '@id': siteUrl + '#profile',
      url: siteUrl,
      isPartOf: {
        '@type': 'WebSite',
        '@id': siteUrl + '#website',
        url: siteUrl,
        name: config.name,
      },
    }),
  };

  const meta = (name, value, attribute = 'name') =>
    `<meta ${attribute}="${name}" content="${escape(value)}" />`;
  const head = [
    start,
    `<title>${escape(config.title)}</title>`,
    meta('description', config.description),
    meta('author', config.name),
    meta('robots', 'index, follow, max-image-preview:large'),
    meta('og:type', 'profile', 'property'),
    meta('og:locale', config.language.replace('-', '_'), 'property'),
    meta('og:site_name', config.name, 'property'),
    meta('og:title', config.title, 'property'),
    meta('og:description', config.description, 'property'),
    meta('twitter:card', siteUrl ? 'summary_large_image' : 'summary'),
    meta('twitter:title', config.title),
    meta('twitter:description', config.description),
  ];
  if (siteUrl) {
    const image = new URL(config.socialImage, siteUrl).href;
    head.push(
      `<link rel="canonical" href="${escape(siteUrl)}" />`,
      meta('og:url', siteUrl, 'property'),
      meta('og:image', image, 'property'),
      meta('og:image:alt', config.socialImageAlt, 'property'),
      meta('twitter:image', image),
      meta('twitter:image:alt', config.socialImageAlt),
    );
  }
  if (config.googleSiteVerification)
    head.push(meta('google-site-verification', config.googleSiteVerification));
  // Escape '<' so configuration text can never terminate the JSON-LD script.
  head.push(
    `<script type="application/ld+json">${JSON.stringify(schema, null, 2).replaceAll('<', '\\u003c')}</script>`,
    end,
  );

  return {
    head: head.join('\n'),
    robots: `User-agent: *\nAllow: /\n${siteUrl ? '\nSitemap: ' + new URL('sitemap.xml', siteUrl).href + '\n' : ''}`,
    sitemap: siteUrl
      ? `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${escape(siteUrl)}</loc></url>\n  <url><loc>${escape(new URL('privacy.html', siteUrl).href)}</loc></url>\n</urlset>\n`
      : null,
  };
}

async function main() {
  const { values } = parseArgs({
    options: { url: { type: 'string' }, check: { type: 'boolean' } },
  });
  const configPath = resolve(root, 'seo.config.json');
  const config = JSON.parse(await readFile(configPath, 'utf8'));
  if (values.url) config.siteUrl = values.url;
  if (values.check && !config.siteUrl)
    throw new Error(
      'Manca il dominio pubblico: configura siteUrl in seo.config.json prima della pubblicazione.',
    );
  const generated = buildSeo(config);
  const current = await readFile(resolve(root, 'index.html'), 'utf8');
  const block = /<!-- SEO:START[^]*?<!-- SEO:END -->/;
  if (!block.test(current)) throw new Error('Blocco SEO non trovato in index.html.');
  const html = await format(
    current.replace(block, () => generated.head),
    { parser: 'html', printWidth: 100 },
  );
  if (values.check) {
    if (
      html !== current ||
      (await readFile(resolve(root, 'robots.txt'), 'utf8')) !== generated.robots ||
      (await readFile(resolve(root, 'sitemap.xml'), 'utf8')) !== generated.sitemap
    ) {
      throw new Error('File SEO non aggiornati: esegui npm run seo.');
    }
    console.log('SEO coerente: metadati, canonical, dati strutturati, robots e sitemap.');
    return;
  }
  if (values.url) {
    await writeFile(
      configPath,
      await format(JSON.stringify(config), { parser: 'json', printWidth: 100 }),
    );
  }
  await writeFile(resolve(root, 'index.html'), html);
  await writeFile(resolve(root, 'robots.txt'), generated.robots);
  if (generated.sitemap) await writeFile(resolve(root, 'sitemap.xml'), generated.sitemap);
  else await rm(resolve(root, 'sitemap.xml'), { force: true });
  console.log(
    config.siteUrl
      ? 'SEO e sitemap aggiornati per ' + config.siteUrl
      : 'SEO locale aggiornato. Canonical e sitemap saranno generati quando imposterai il dominio pubblico.',
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
