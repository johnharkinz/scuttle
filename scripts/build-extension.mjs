// Bundles the extension's scripts into extension/dist/ with esbuild. `npm run build:extension`.
import * as esbuild from 'esbuild';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

/** The options every extension bundle uses. The parity test bundles the core with these too. */
export const bundleOptions = { bundle: true, format: 'esm', platform: 'browser', target: 'chrome120', minify: true, legalComments: 'none' };

export async function buildExtension() {
  return esbuild.build({
    ...bundleOptions,
    absWorkingDir: root,
    entryPoints: ['extension/src/background.ts', 'extension/src/popup.ts', 'extension/src/report-page.ts'],
    outdir: 'extension/dist',
    metafile: true,
    logLevel: 'warning',
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { metafile } = await buildExtension();
  for (const [file, { bytes }] of Object.entries(metafile.outputs)) console.log(`${file}  ${(bytes / 1024).toFixed(0)} KB`);
}
