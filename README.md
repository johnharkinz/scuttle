# Scuttle

Scuttle is a JavaScript rendering gap analyser. It compares what the server sends with what JavaScript reveals. Nothing more.

You give it two snapshots of one page: the HTML the server sends before any JavaScript runs, and the DOM after a browser has run the page's JavaScript. It reports the differences in title, meta description, links and text blocks.

Scuttle v1 is a local command-line experiment. It reads snapshot files you capture yourself. It doesn't fetch pages or drive a browser.

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

Each **finding** is one difference between the two snapshots, with evidence in the original values. Its **direction** says whether the value is only in the initial snapshot, only appears after rendering, or changed. The report starts with a summary table of counts and then lists every finding.

Scuttle shows that the snapshots differ. It doesn't judge whether a difference matters, and it doesn't claim to know what any particular crawler indexes.

- [`docs/spec-v1.md`](docs/spec-v1.md) defines exactly what is extracted, how values are compared and how the report is laid out.
- [`GLOSSARY.md`](GLOSSARY.md) defines the terms, such as finding, direction, landmark and the review labels.

## Development

```sh
npm test           # vitest, inline HTML test cases only
npm run typecheck  # tsc --noEmit
```

The code lives in `src/`: `extract.ts`, `normalise.ts`, `compare.ts`, `report.ts` and `cli.ts`. Tests live in `test/`.

`fixtures/` holds the fixture pairs used for the review gate, one directory per page, named after its role (`gap-`, `control-` or `hybrid-`). Only these files are committed:

- `NOTES.md`: the URL, the role and the capture conditions
- `REVIEW.md`: the run command, the findings and the label confirmed for each one

The `initial.html` and `rendered.html` snapshots are gitignored. To re-run a fixture, capture its pair again as described in its `NOTES.md`.

Scope is deliberately narrow. Read [`AGENTS.md`](AGENTS.md) before adding features.
