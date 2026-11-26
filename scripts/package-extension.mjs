// `npm run package:extension`: builds the extension and writes one zip per store into build/.
// One source, one zip per store (as Noggin's ADR 0003): the packages differ only in manifest.json.
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildExtension } from './build-extension.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const ext = join(root, 'extension');

/** What the browser loads. Not src/, preview/ or tsconfig.json. */
const RUNTIME = ['popup.html', 'report.html', 'extension.css', 'fonts', 'icons', 'dist'];

const readJson = file => JSON.parse(readFileSync(join(ext, file), 'utf8'));

/** Each package: its zip's name, its manifest, and whether addons-linter checks it. */
function targets() {
  const manifest = readJson('manifest.json');
  return [
    { name: 'chromium', manifest }, // Chrome Web Store and Edge Add-ons
    // Firefox Add-ons: manifest.json with manifest.firefox.json's top-level keys laid over it.
    // Edge rejects background.scripts, so those keys stay out of the Chromium package.
    { name: 'firefox', manifest: { ...manifest, ...readJson('manifest.firefox.json') }, addonsLinter: true },
  ];
}

/** Builds, then stages, lints (Firefox, with addons-linter) and zips every package into outDir. */
export async function packageExtension({ outDir, lint = true }) {
  await buildExtension();
  const zips = [];
  for (const { name, manifest, addonsLinter } of targets()) {
    const dir = join(outDir, name);
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    for (const file of RUNTIME) cpSync(join(ext, file), join(dir, file), { recursive: true });
    writeFileSync(join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
    // addons-linter exits non-zero on errors, which stops the packaging.
    if (lint && addonsLinter) execFileSync(join(root, 'node_modules/.bin/addons-linter'), [dir], { stdio: 'inherit' });
    const zip = join(outDir, `scuttle-${manifest.version}-${name}.zip`);
    rmSync(zip, { force: true }); // zip adds to an existing archive
    // From inside the package, so manifest.json is at the zip's root. -X and -D: no file attributes, no directory entries.
    execFileSync('zip', ['-r', '-q', '-X', '-D', zip, '.'], { cwd: dir });
    zips.push(zip);
  }
  return zips;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const zip of await packageExtension({ outDir: join(root, 'build') })) console.log(`Created ${zip}`);
}
