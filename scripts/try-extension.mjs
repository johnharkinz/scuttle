// `npm run try:extension [url]`: builds the extension and opens Chromium with it loaded, in a
// temporary profile that is deleted when the browser closes.
//
// Branded Chrome ignores --load-extension (checked with Chrome 158), so this uses the Chrome for
// Testing build that playwright-core installs. If it's missing: npx playwright-core install chromium
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { buildExtension } from './build-extension.mjs';

const ext = fileURLToPath(new URL('../extension', import.meta.url));
const url = process.argv[2] ?? 'https://dentrw.vercel.app/';

await buildExtension();
// An empty user data dir makes Playwright use a temporary profile, deleted once the browser has exited.
const context = await chromium.launchPersistentContext('', {
  headless: false,
  viewport: null, // the window's own size, as for a person
  args: [`--disable-extensions-except=${ext}`, `--load-extension=${ext}`],
});
const page = context.pages()[0] ?? (await context.newPage());
await page.goto(url).catch(e => console.error(`Couldn't open ${url}: ${e.message}`));
console.log('Scuttle is loaded: open it from the extensions (puzzle) menu. Close the browser to finish.');

context.on('close', () => process.exit(0));
