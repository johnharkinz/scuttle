// `npm run package:source`: the committed tree as a zip, for Firefox Add-ons reviewers. The shipped
// scripts are bundled and minified by esbuild, so Mozilla needs the source and the build steps
// (docs/firefox-review-build.md). Archiving the commit makes the zip match what the packages were built from.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
if (execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim()) {
  console.error('Commit or stash your changes first: the source zip must match a committed tree.');
  process.exit(1);
}
const { version } = JSON.parse(readFileSync(join(root, 'extension/manifest.json'), 'utf8'));
const zip = join(root, 'build', `scuttle-${version}-source.zip`);
mkdirSync(join(root, 'build'), { recursive: true });
rmSync(zip, { force: true });
execFileSync('git', ['archive', '--format=zip', `--output=${zip}`, 'HEAD'], { cwd: root });
console.log(`Created ${zip}`);
