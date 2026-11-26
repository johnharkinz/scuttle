# Building Scuttle from source (for Firefox Add-ons review)

The scripts in `dist/` are written in TypeScript, then bundled and minified by esbuild (`scripts/build-extension.mjs`). Everything else in the package is copied unchanged from `extension/`. To rebuild the package from the source zip:

1. Install Node.js 22 or later, and npm.
2. From the root of the unzipped source, run:

   ```sh
   npm ci
   npm run package:extension
   ```

3. `build/firefox/` now holds the same files as the submitted package, and `build/scuttle-<version>-firefox.zip` zips them. `build/chromium/` is the Chrome and Edge build of the same source. The two differ only in `manifest.json`, which for Firefox is `extension/manifest.json` with the keys in `extension/manifest.firefox.json` laid over it.

esbuild's output depends only on the source and the locked esbuild version, so the rebuilt `dist/` files are byte-identical to the submitted ones. To check, compare them with `cmp`.

## addons-linter warnings

`npm run package:extension` reports no errors and these warnings:

- **`UNSAFE_VAR_ASSIGNMENT` in `dist/report-page.js` (twice).** The report page sets `innerHTML` to the report that `extension/src/render.ts` builds, where every value from the page or the server passes through `esc()` first. The other assignment is a fixed message.
- **`KEY_FIREFOX_ANDROID_UNSUPPORTED_BY_MIN_VERSION`.** Firefox for Android supports `data_collection_permissions` from version 142, but the minimum version is 140. Scuttle isn't offered for Android.

Tested on macOS with Node.js 24.14.1 and npm 11.18.0.
