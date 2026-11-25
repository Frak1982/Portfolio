import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 4173);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    const file = resolve(root, relative);
    const allowed =
      ['index.html', 'privacy.html', 'robots.txt', 'sitemap.xml'].includes(relative) ||
      /^(assets|css|js)\//.test(relative);
    if (!allowed || !file.startsWith(root + sep)) {
      response.writeHead(404).end('Not found');
      return;
    }
    const body = await readFile(file);
    if (extname(file) === '.mp4' && request.headers.range) {
      const match = /^bytes=(\d+)-(\d*)$/.exec(request.headers.range);
      const start = match ? Number(match[1]) : -1;
      const end = match && match[2] ? Math.min(Number(match[2]), body.length - 1) : body.length - 1;
      if (start < 0 || start >= body.length || end < start) {
        response.writeHead(416, { 'Content-Range': 'bytes */' + body.length }).end();
        return;
      }
      response.writeHead(206, {
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
        'Content-Range': 'bytes ' + start + '-' + end + '/' + body.length,
        'Content-Length': end - start + 1,
        'X-Content-Type-Options': 'nosniff',
      });
      response.end(body.subarray(start, end + 1));
      return;
    }
    response.writeHead(200, {
      'Content-Type': types[extname(file)] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Content-Length': body.length,
      ...(extname(file) === '.mp4' ? { 'Accept-Ranges': 'bytes' } : {}),
    });
    response.end(body);
  } catch {
    response.writeHead(404).end('Not found');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Portfolio disponibile su http://127.0.0.1:${port}`);
});
