// The store listing and assets (#32): what each store's form needs, kept in step with the code.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..');
const read = (file: string) => readFileSync(join(root, file));
const listing = read('docs/store-listing.md').toString('utf8');
const manifest = JSON.parse(read('extension/manifest.json').toString('utf8'));
const firefox = { ...manifest, ...JSON.parse(read('extension/manifest.firefox.json').toString('utf8')) };

/** A PNG's width and height, from its IHDR chunk. */
const pngSize = (file: string) => {
  const png = read(file);
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
};

describe('store assets', () => {
  it('has a 1280×800 screenshot and a 440×280 small promo tile', () => {
    expect(pngSize('store/screenshot-1280x800.png')).toEqual({ width: 1280, height: 800 });
    expect(pngSize('store/promo-small-440x280.png')).toEqual({ width: 440, height: 280 });
  });
});

describe('docs/store-listing.md', () => {
  it('justifies every permission either package declares', () => {
    const declared = [...manifest.permissions, ...firefox.permissions, ...(firefox.optional_host_permissions ?? []), ...(manifest.host_permissions ?? [])];
    for (const permission of new Set(declared)) expect(listing, permission).toContain(`\`${permission}\`:`);
  });

  it('uses the manifest description as the summary, within Chrome’s 132 characters', () => {
    expect(manifest.description.length).toBeLessThanOrEqual(132);
    expect(listing).toContain(`> ${manifest.description}`);
  });
});
