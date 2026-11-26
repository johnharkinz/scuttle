// Parity: the extension's bundled core finds exactly what the CLI finds, on every fixture pair present.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import * as esbuild from 'esbuild';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
// @ts-expect-error: a plain .mjs build script, with no type declarations
import { bundleOptions } from '../scripts/build-extension.mjs';
import type * as Core from '../extension/src/core.ts';

const FIXTURES = join(import.meta.dirname, '..', 'fixtures');
const fixtures = readdirSync(FIXTURES).filter(name => existsSync(join(FIXTURES, name, 'NOTES.md')));
const present = (name: string) => ['initial.html', 'rendered.html'].every(f => existsSync(join(FIXTURES, name, f)));
const urlOf = (name: string) => /^\*\*URL:\*\*\s*(\S+)/m.exec(readFileSync(join(FIXTURES, name, 'NOTES.md'), 'utf8'))![1];

let core: typeof Core;
const outdir = mkdtempSync(join(tmpdir(), 'scuttle-parity-'));
afterAll(() => rmSync(outdir, { recursive: true, force: true }));
beforeAll(async () => {
  const outfile = join(outdir, 'core.mjs');
  await esbuild.build({ ...bundleOptions, entryPoints: [join(import.meta.dirname, '..', 'extension/src/core.ts')], outfile });
  core = await import(pathToFileURL(outfile).href);
});

describe('extension parity with the CLI', () => {
  it('has fixtures to check', () => expect(fixtures.length).toBeGreaterThan(0));

  for (const name of fixtures)
    it.skipIf(!present(name))(`${name}: same findings as the CLI`, () => {
      const dir = join(FIXTURES, name);
      const url = urlOf(name);
      const cli = JSON.parse(
        execFileSync('npx', ['tsx', 'src/cli.ts', join(dir, 'initial.html'), join(dir, 'rendered.html'), '--url', url, '--json'], { encoding: 'utf8' }),
      );
      const { result } = core.analyse({
        pageUrl: url,
        rendered: { html: readFileSync(join(dir, 'rendered.html'), 'utf8'), capturedAt: '', sinceLoadMs: 0, readyState: 'complete', viewport: { width: 0, height: 0 }, userAgent: '' },
        initial: { kind: 'response', startedAt: '', status: 200, contentType: 'text/html', finalUrl: url, headers: {}, body: readFileSync(join(dir, 'initial.html'), 'utf8') },
        notes: [],
      });
      expect(result).toEqual({ state: 'compared', findings: cli.findings });
    }, 30_000);
});
