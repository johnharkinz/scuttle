// Packaging: one source, one zip per store (#31). Builds the real packages into a temporary directory.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
// @ts-expect-error: a plain .mjs build script, with no type declarations
import { packageExtension } from '../scripts/package-extension.mjs';

const version = JSON.parse(readFileSync(join(import.meta.dirname, '..', 'extension/manifest.json'), 'utf8')).version;
const outDir = mkdtempSync(join(tmpdir(), 'scuttle-package-'));
afterAll(() => rmSync(outDir, { recursive: true, force: true }));
beforeAll(() => packageExtension({ outDir, lint: false }), 60_000);

const entries = (zip: string) => execFileSync('unzip', ['-Z1', join(outDir, zip)], { encoding: 'utf8' }).split('\n').filter(Boolean).sort();
const files = (zip: string) => entries(zip).filter(e => !e.endsWith('/'));
const manifestIn = (zip: string) => JSON.parse(execFileSync('unzip', ['-p', join(outDir, zip), 'manifest.json'], { encoding: 'utf8' }));

describe('the Chromium package, for the Chrome Web Store and Edge Add-ons', () => {
  const zip = `scuttle-${version}-chromium.zip`;

  it('runs its background as a service worker, with no Firefox keys', () => {
    const manifest = manifestIn(zip);
    expect(manifest.background).toEqual({ service_worker: 'dist/background.js', type: 'module' });
    expect(manifest.browser_specific_settings).toBeUndefined();
    expect(manifest.permissions).toEqual(['activeTab', 'scripting']);
  });

  it('holds only the runtime files, with manifest.json at its root', () => {
    expect(files(zip)).toEqual([
      'dist/background.js',
      'dist/popup.js',
      'dist/report-page.js',
      'extension.css',
      'fonts/OFL-IBMPlexMono.txt',
      'fonts/OFL-SchibstedGrotesk.txt',
      'fonts/ibm-plex-mono-400-latin.woff2',
      'fonts/ibm-plex-mono-500-latin.woff2',
      'fonts/schibsted-grotesk-latin.woff2',
      'icons/icon128.png',
      'icons/icon16.png',
      'icons/icon32.png',
      'icons/icon48.png',
      'manifest.json',
      'popup.html',
      'report.html',
    ]);
  });
});

describe('the Firefox package, for Firefox Add-ons', () => {
  const zip = `scuttle-${version}-firefox.zip`;

  it('runs its background as a script, with its permanent add-on ID', () => {
    const manifest = manifestIn(zip);
    expect(manifest.background).toEqual({ scripts: ['dist/background.js'], type: 'module' });
    expect(manifest.browser_specific_settings.gecko).toEqual({ id: 'scuttle@camas.dev', strict_min_version: '140.0', data_collection_permissions: { required: ['none'] } });
  });

  // Firefox's activeTab doesn't cover the fetch without JavaScript, so Scuttle asks for the page's site when you compare it (#31).
  it('may ask for a site, but holds no site permission until it does', () => {
    const manifest = manifestIn(zip);
    expect(manifest.permissions).toEqual(['activeTab', 'scripting']);
    expect(manifest.optional_host_permissions).toEqual(['<all_urls>']);
    expect(manifest.host_permissions).toBeUndefined();
  });

  it('holds the same files as the Chromium package', () => {
    expect(files(zip)).toEqual(files(`scuttle-${version}-chromium.zip`));
  });
});
