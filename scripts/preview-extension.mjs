// `npm run preview:extension`: serves the extension's real popup and report pages on localhost,
// with a stub capture layer that reads fixture pairs from fixtures/ (extension/preview/stub.ts).
import * as esbuild from 'esbuild';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildExtension, bundleOptions } from './build-extension.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const ext = join(root, 'extension');
// FIXTURES_DIR swaps in another set of pairs: npm run store-assets uses the made-up one in store/demo/.
const fixturesDir = process.env.FIXTURES_DIR ? resolve(root, process.env.FIXTURES_DIR) : join(root, 'fixtures');
const port = Number(process.env.PORT ?? 4321);
const FILES = ['NOTES.md', 'initial.html', 'rendered.html'];

await buildExtension();
const stub = (await esbuild.build({ ...bundleOptions, format: 'iife', entryPoints: [join(ext, 'preview/stub.ts')], write: false })).outputFiles[0].text;

const fixtures = () =>
  readdirSync(fixturesDir)
    .filter(name => existsSync(join(fixturesDir, name, 'NOTES.md')))
    .map(name => ({ name, missing: FILES.filter(f => !existsSync(join(fixturesDir, name, f))) }));

const links = name => `<a href="/popup.html?fixture=${name}">popup</a> · <a href="/report.html?fixture=${name}#preview">report</a>`;

function index() {
  const all = fixtures();
  const available = all.filter(f => !f.missing.length);
  const missing = all.filter(f => f.missing.length);
  return `<!doctype html><meta charset="utf-8"><title>Scuttle extension preview</title>
<h1>Scuttle extension preview</h1>
<p>The extension's real popup and report pages, with the tab capture replaced by fixture pairs from <code>fixtures/</code>.</p>
<h2>Fixtures</h2><ul>${available.map(f => `<li>${f.name}: ${links(f.name)}</li>`).join('') || '<li>None on this machine.</li>'}</ul>
<h2>Examples</h2><ul>
<li>blocked-fetch, an initial fetch answered with a Cloudflare challenge: ${links('blocked-fetch')}</li>
<li>unsupported-page, a <code>chrome://</code> tab: <a href="/popup.html?fixture=unsupported-page">popup</a></li></ul>
${missing.length ? `<h2>Missing fixtures</h2><p>Snapshot HTML is gitignored, so these aren't on this machine:</p><ul>${missing.map(f => `<li>${f.name} (no ${f.missing.join(', ')})</li>`).join('')}</ul>` : ''}`;
}

/** An extension page, with the stub loaded before the page's own scripts. */
const page = name => readFileSync(join(ext, name), 'utf8').replace('<script', '<script src="/preview-stub.js"></script>\n    <script');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.woff2': 'font/woff2',
};
const send = (res, status, body, type = TYPES['.html']) => res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' }).end(body);

createServer((req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  if (path === '/') return send(res, 200, index());
  if (path === '/popup.html' || path === '/report.html') return send(res, 200, page(path.slice(1)));
  if (path === '/preview-stub.js') return send(res, 200, stub, TYPES['.js']);
  if (path === '/extension.css') return send(res, 200, readFileSync(join(ext, 'extension.css')), TYPES['.css']);
  const font = /^\/fonts\/([\w-]+\.woff2)$/.exec(path);
  if (font && existsSync(join(ext, 'fonts', font[1]))) return send(res, 200, readFileSync(join(ext, 'fonts', font[1])), TYPES['.woff2']);
  const dist = /^\/dist\/([\w-]+\.js)$/.exec(path);
  if (dist && existsSync(join(ext, 'dist', dist[1]))) return send(res, 200, readFileSync(join(ext, 'dist', dist[1])), TYPES['.js']);
  // Only the three files of a known fixture, so nothing else in the repo is served.
  const fx = /^\/fixtures\/([\w-]+)\/([\w.]+)$/.exec(path);
  if (fx && FILES.includes(fx[2]) && fixtures().some(f => f.name === fx[1]) && existsSync(join(fixturesDir, fx[1], fx[2])))
    return send(res, 200, readFileSync(join(fixturesDir, fx[1], fx[2])), TYPES[fx[2].slice(fx[2].lastIndexOf('.'))]);
  send(res, 404, 'Not found', 'text/plain');
}).listen(port, '127.0.0.1', () => console.log(`Scuttle extension preview: http://localhost:${port}/`));
