# Scuttle

Scuttle is a JavaScript rendering gap analyser. It compares what the server sends with what JavaScript reveals. Nothing more.

You give it two snapshots of one page: the HTML the server sends before any JavaScript runs, and the DOM after a browser has run the page's JavaScript. It reports the differences in title, meta description, links and text blocks.

Scuttle v1 is a local command-line experiment. It reads snapshot files you capture yourself. It doesn't fetch pages or drive a browser.

There is also a browser extension for Chrome, Edge and Firefox, in development, that captures both snapshots of the page you're viewing and compares them in your browser. See [Extension](#extension).

## Requirements

- Node 22 or later

## Install

```sh
npm install
```

## Capture a page

Capture both snapshots of the same URL under conditions that are as similar as you can make them: the same user agent and locale, no cookies, and a few minutes apart at most.

1. **Initial snapshot:** fetch the HTML without running JavaScript.

   ```sh
   mkdir -p fixtures/my-page
   curl -L -A "<your browser's user agent>" -H "Accept-Language: en-GB,en;q=0.9" \
     https://example.com/ -o fixtures/my-page/initial.html
   ```

2. **Rendered snapshot:** open the same URL in a fresh incognito window. Wait until the page has settled, without scrolling, clicking or accepting a consent banner. Then run this in the DevTools console:

   ```js
   copy(document.documentElement.outerHTML)
   ```

   Paste the result into `fixtures/my-page/rendered.html`.

Snapshot HTML is third-party content. `fixtures/*/*.html` is gitignored, so it stays on your machine.

## Run

```sh
npm run scuttle -- <initial.html> <rendered.html> --url <page-url> [--json]
```

For example:

```sh
npm run scuttle -- fixtures/my-page/initial.html fixtures/my-page/rendered.html --url https://example.com/
```

- `--url` is required. It must be the absolute `http` or `https` URL of the page you captured. Scuttle resolves links against it and uses it to tell internal links from external ones.
- Without `--json`, Scuttle prints a Markdown report to stdout. With `--json`, it prints `{ "url", "findings" }` with full text.
- The exit code is 0 whenever a report is produced, even if there are findings. It is non-zero only for bad arguments or unreadable files.

## Reading the report

Each **finding** is one difference between the two snapshots, with evidence in the original values. Its **direction** is *only with JavaScript* (crawlers that don't run JavaScript miss it), *only without JavaScript* (only those crawlers see it) or *different with JavaScript*. If you know SEO tools, this is their raw HTML vs rendered HTML comparison. The report starts with a summary table of counts and then lists every finding.

Scuttle shows that the snapshots differ. It doesn't judge whether a difference matters, and it doesn't claim to know what any particular crawler indexes.

- [`docs/spec-v1.md`](docs/spec-v1.md) defines exactly what is extracted, how values are compared and how the report is laid out.
- [`GLOSSARY.md`](GLOSSARY.md) defines the terms, such as finding, direction, landmark and the review labels.

## Extension

The extension in `extension/` runs the same comparison on the page you're viewing. Click *Compare this page* and the report opens in a new tab. Nothing is sent or stored. In Chrome and Edge it asks only for `activeTab` and `scripting`. Firefox also asks for permission for the page's site when you compare it, because there `activeTab` doesn't cover the fetch (see [`docs/firefox-smoke-test.md`](docs/firefox-smoke-test.md)).

- **Rendered snapshot:** the tab's `document.documentElement.outerHTML` at the moment you click. Scuttle doesn't wait, scroll, click or touch a consent banner, so let the page settle first.
- **Initial snapshot:** a fetch of the tab's URL straight afterwards, with cookies and caching off. This is what the server sends to your browser, not what a crawler gets.
- **Blocked fetch:** a non-2xx response, a non-HTML response or a recognised bot challenge (Cloudflare, Imperva) is reported as *fetch without JavaScript blocked*, with the reason and no findings.
- **The report** shows the CLI report's findings and groups, plus the capture conditions: both URLs, both times and the gap between them, the time since the page loaded, `readyState`, viewport and user agent. Signed-in state and consent choices are not controlled.

The pages follow `camas-design` DEC-006, and the fonts are bundled in `extension/fonts/`, so nothing is fetched to show them.

```sh
npm run build:extension    # bundle into extension/dist/, then load extension/ unpacked
npm run preview:extension  # the real popup and report pages at http://localhost:4321/, fed from fixtures/
npm run try:extension      # Chromium with the extension loaded, in a throwaway profile
npm run icons              # re-render extension/icons/ from the mark, after changing it
npm run package:extension  # one zip per store in build/, linting the Firefox one
npm run package:source     # the committed tree as a zip, for Firefox Add-ons review
```

- **`preview:extension`** works in any browser. A stub stands in for the `chrome.*` capture, reading fixture pairs from `fixtures/` with the conditions in their `NOTES.md`. Fixtures whose snapshots aren't on your machine are listed as missing. It also has a blocked example and an unsupported-page example.
- **`try:extension [url]`** opens Chrome for Testing from `playwright-core`, because branded Chrome ignores `--load-extension`. If it isn't installed, run `npx playwright-core install chromium`. Open Scuttle from the extensions (puzzle) menu. The profile is deleted when you close the browser.
- **`package:extension`** writes two packages from the same source. They differ only in `manifest.json`:
  - `build/scuttle-<version>-chromium.zip`, for the Chrome Web Store and Edge Add-ons, is `extension/manifest.json` as it is. To load it unpacked, open `chrome://extensions` or `edge://extensions`, turn on developer mode, choose **Load unpacked** and pick `build/chromium/`.
  - `build/scuttle-<version>-firefox.zip`, for Firefox Add-ons, lays `extension/manifest.firefox.json` over it: `background.scripts` instead of a service worker, the add-on ID `scuttle@camas.dev` and the site permission it may ask for. Edge rejects `background.scripts`, so the Chromium package can't carry them. To load it, open `about:debugging#/runtime/this-firefox`, choose **Load Temporary Add-on…** and pick `build/firefox/manifest.json`. `addons-linter` checks it first, and stops the packaging on any error.
- **`package:source`** needs a clean working tree. Mozilla rebuilds the minified scripts from it as [`docs/firefox-review-build.md`](docs/firefox-review-build.md) describes. Run the [Firefox smoke test](docs/firefox-smoke-test.md) before each Firefox upload.
- **`icons`** renders the toolbar icons from the Scuttle mark (DEC-004, DEC-005) with the same Chromium. The PNGs are committed, so building the extension doesn't need a browser.

## Development

```sh
npm test           # vitest
npm run typecheck  # tsc --noEmit, for src/ and extension/
```

The code lives in `src/`: `extract.ts`, `normalise.ts`, `compare.ts`, `report.ts` and `cli.ts`. The extension imports `extract`, `compare` and `report` from there. Tests live in `test/`. Most use inline HTML. The parity test checks that the extension's bundled core gives the same findings as the CLI on every fixture pair on your machine, and skips the rest.

`fixtures/` holds the fixture pairs used for the review gate, one directory per page, named after its role (`gap-`, `control-` or `hybrid-`). Only these files are committed:

- `NOTES.md`: the URL, the role and the capture conditions
- `REVIEW.md`: the run command, the findings and the label confirmed for each one

The `initial.html` and `rendered.html` snapshots are gitignored. To re-run a fixture, capture its pair again as described in its `NOTES.md`.

Scope is deliberately narrow. Read [`AGENTS.md`](AGENTS.md) before adding features.
