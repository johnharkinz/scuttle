// `npm run store-assets`: renders the store screenshot and small promo tile into store/.
//
// The screenshot shows the real report page from the preview harness, fed the made-up
// harbourlane.example pair in store/demo/, so no real company's site appears. The layouts are
// the ones every Camas tool's store assets use (Noggin's and Shareable's store/, camas-design's
// Camas System v1, section 5): mark, lockup name, one plain sentence, endorsement line.
// Re-run it after any visible change to the report page.
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = fileURLToPath(new URL('..', import.meta.url));
const store = join(root, 'store');
const PORT = 4398;
const REPORT = `http://localhost:${PORT}/report.html?fixture=harbourlane#preview`;

// The report at this width is one column, and the crop ends after the first group of findings.
const REPORT_WIDTH = 700;
const PANEL_WIDTH = 620;

const font = file => readFileSync(join(root, 'extension/fonts', file)).toString('base64');
const baseStyle = `
  @font-face { font-family: "Schibsted Grotesk"; font-weight: 400 800; src: url(data:font/woff2;base64,${font('schibsted-grotesk-latin.woff2')}) format("woff2"); }
  @font-face { font-family: "IBM Plex Mono"; src: url(data:font/woff2;base64,${font('ibm-plex-mono-400-latin.woff2')}) format("woff2"); }
  * { box-sizing: border-box; }
  html, body { margin: 0; }
  body { background: #f8f6f0; color: #17171a; font-family: "Schibsted Grotesk", sans-serif; -webkit-font-smoothing: antialiased; }
  .mono { font-family: "IBM Plex Mono", monospace; }
  .mark { display: block; flex-shrink: 0; }
`;

// The Scuttle mark (camas-design DEC-005), as popup.html draws it.
const mark = size =>
  `<svg class="mark" width="${size}" height="${size}" viewBox="0 0 16 16" aria-hidden="true"><rect width="16" height="16" fill="#016a75" /><rect x="6" y="3" width="4" height="2" fill="#f8f6f0" /><rect x="3.636" y="6.636" width="2.727" height="5.727" fill="none" stroke="#f8f6f0" stroke-width="1.273" /><rect x="9" y="6" width="4" height="7" fill="#f8f6f0" /><rect x="13" y="0" width="3" height="3" fill="#d9481f" /></svg>`;

/** Starts the preview harness on the demo pair, and resolves once it answers. */
async function startPreview() {
  const preview = spawn(process.execPath, [join(root, 'scripts/preview-extension.mjs')], {
    env: { ...process.env, FIXTURES_DIR: 'store/demo', PORT: String(PORT) },
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  for (let tries = 0; tries < 100; tries++) {
    if (preview.exitCode !== null) throw new Error(`The preview harness exited (${preview.exitCode}).`);
    if (await fetch(`http://localhost:${PORT}/`).then(r => r.ok, () => false)) return preview;
    await new Promise(r => setTimeout(r, 100));
  }
  preview.kill();
  throw new Error('The preview harness didn’t start.');
}

/** The top of the report, down to the end of its first group of findings, at twice the pixels. */
async function captureReport(browser) {
  const page = await browser.newPage({ viewport: { width: REPORT_WIDTH, height: 900 }, deviceScaleFactor: 2 });
  await page.goto(REPORT);
  await page.waitForSelector('main.report');
  await page.evaluate(() => document.fonts.ready);
  const group = await page.locator('section.group').first().boundingBox();
  const height = Math.ceil(group.y + group.height + 24);
  const png = await page.screenshot({ clip: { x: 0, y: 0, width: REPORT_WIDTH, height } });
  await page.close();
  return { png, height };
}

const screenshotHtml = ({ png, height }) => `<style>
    ${baseStyle}
    body { width: 1280px; height: 800px; display: flex; align-items: center; gap: 64px; padding: 0 80px 0 96px; }
    .copy { flex: 1; }
    .lockup { display: flex; align-items: center; gap: 12px; margin-bottom: 40px; font-size: 22px; font-weight: 700; }
    h1 { margin: 0 0 24px; font-size: 52px; font-weight: 800; letter-spacing: -0.035em; line-height: 1.02; }
    p { margin: 0; color: #4a4a50; font-size: 20px; line-height: 1.5; }
    .endorse { margin-top: 40px; padding-top: 14px; border-top: 1px solid #17171a; color: #4a4a50; font-size: 14px; }
    .report { flex-shrink: 0; width: ${PANEL_WIDTH}px; height: ${(height * PANEL_WIDTH) / REPORT_WIDTH + 2}px; border: 1px solid #17171a; }
    .report img { display: block; width: 100%; }
  </style>
  <div class="copy">
    <div class="lockup">${mark(34)}Scuttle</div>
    <h1>See what a page shows without JavaScript.</h1>
    <p>Compare what the server sends with what JavaScript reveals, for the page you're viewing.</p>
    <div class="endorse mono">Scuttle — a camas tool · nothing sent or stored</div>
  </div>
  <div class="report"><img src="data:image/png;base64,${png.toString('base64')}" alt=""></div>`;

const tileHtml = `<style>
    ${baseStyle}
    body { width: 440px; height: 280px; display: flex; gap: 24px; padding: 28px; }
    .copy { display: flex; flex-direction: column; flex: 1; }
    h1 { margin: -6px 0 10px; font-size: 42px; font-weight: 800; letter-spacing: -0.04em; line-height: 1; }
    p { margin: 0; font-size: 17px; line-height: 1.35; }
    .endorse { margin-top: auto; padding-top: 10px; border-top: 1px solid #17171a; color: #4a4a50; font-size: 11px; }
  </style>
  ${mark(112)}
  <div class="copy">
    <h1>Scuttle</h1>
    <p>Compare what the server sends with what JavaScript reveals.</p>
    <div class="endorse mono">a camas tool · nothing sent or stored</div>
  </div>`;

async function render(browser, html, width, height, file) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(store, file) });
  await page.close();
  console.log(`Created store/${file}`);
}

mkdirSync(store, { recursive: true });
const preview = await startPreview();
const browser = await chromium.launch();
try {
  await render(browser, screenshotHtml(await captureReport(browser)), 1280, 800, 'screenshot-1280x800.png');
  await render(browser, tileHtml, 440, 280, 'promo-small-440x280.png');
} finally {
  await browser.close();
  preview.kill();
}
