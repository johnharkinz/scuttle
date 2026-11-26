// `npm run icons`: renders the Scuttle mark (camas-design DEC-004, DEC-005: a paper beetle glyph on
// teal, with the vermilion corner) to the PNG icon sizes the manifest uses, following
// noggin/scripts/render-icons.mjs. Run it after changing the mark; the PNGs are committed.
// Uses the Chromium that playwright-core installs. If it's missing: npx playwright-core install chromium
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const outDir = fileURLToPath(new URL('../extension/icons/', import.meta.url));

const COLOUR = '#016a75'; // oklch(0.48 0.08 207)
const PAPER = '#f8f6f0';
const VERMILION = '#d9481f';

// Glyph on a 16-unit grid: [x, y, w, h, outlined?]
const GLYPH = [
  [6, 3, 4, 2, false], // head
  [3, 6, 4, 7, true], // wing case: what the server sends
  [9, 6, 4, 7, false], // wing case: what JavaScript reveals
];

// inset: transparent margin around the square. The 128 keeps the 16px margin the Chrome Web
// Store asks for (96px of artwork). The glyph is drawn at every size.
const sizes = [
  { size: 16, inset: 0, corner: 3 },
  { size: 32, inset: 1, corner: 5 },
  { size: 48, inset: 2, corner: 7 },
  { size: 128, inset: 16, corner: 15 },
];

function markHtml({ size, inset, corner }) {
  const art = size - inset * 2;
  const u = art / 16;
  const stroke = Math.max(1.5, 1.5 * u * 0.85);
  const shapes = GLYPH.map(([x, y, w, h, outlined]) => {
    const fill = outlined ? `border:${stroke}px solid ${PAPER}` : `background:${PAPER}`;
    return `<div style="position:absolute;box-sizing:border-box;left:${x * u}px;top:${y * u}px;width:${w * u}px;height:${h * u}px;${fill}"></div>`;
  }).join('');
  return `<style>html, body { margin: 0; background: transparent; }</style>
    <div style="position:relative;width:${size}px;height:${size}px">
      <div style="position:absolute;inset:${inset}px;background:${COLOUR};overflow:hidden">
        ${shapes}
        <div style="position:absolute;top:0;right:0;width:${corner}px;height:${corner}px;background:${VERMILION}"></div>
      </div>
    </div>`;
}

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
try {
  for (const spec of sizes) {
    const page = await browser.newPage({ viewport: { width: spec.size, height: spec.size } });
    await page.setContent(markHtml(spec));
    await page.screenshot({ path: `${outDir}icon${spec.size}.png`, omitBackground: true });
    await page.close();
  }
} finally {
  await browser.close();
}
