import { readFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { compare } from './compare.ts';
import { extract } from './extract.ts';
import { renderReport } from './report.ts';

const USAGE = 'usage: npm run scuttle -- <initial.html> <rendered.html> --url <page-url> [--json]';

function fail(message: string): never {
  process.stderr.write(`scuttle: ${message}\n`);
  process.exit(1);
}

function args() {
  try {
    return parseArgs({ allowPositionals: true, options: { url: { type: 'string' }, json: { type: 'boolean' } } });
  } catch (e) {
    fail(`${(e as Error).message}. ${USAGE}`);
  }
}

function read(path: string): string {
  try {
    return readFileSync(path, 'utf8');
  } catch (e) {
    fail(`cannot read ${path}: ${(e as NodeJS.ErrnoException).code ?? (e as Error).message}`);
  }
}

const { values, positionals } = args();
if (positionals.length !== 2) fail(`expected two snapshot files. ${USAGE}`);
if (values.url === undefined) fail(`--url is required. ${USAGE}`);
const page = URL.parse(values.url);
if (!page || !['http:', 'https:'].includes(page.protocol)) fail(`--url must be an absolute http(s) URL: ${values.url}`);

const [initialPath, renderedPath] = positionals;
const [initialHtml, renderedHtml] = [read(initialPath), read(renderedPath)];
const findings = compare(extract(initialHtml, page.href), extract(renderedHtml, page.href));

// A fixture pair shares a directory, so name the report after it; otherwise after the initial file.
const dir = dirname(resolve(initialPath));
const name = dir === dirname(resolve(renderedPath)) ? basename(dir) : basename(initialPath);

process.stdout.write(values.json ? JSON.stringify({ url: values.url, findings }, null, 2) + '\n' : renderReport(name, values.url, findings));
