# Scuttle v1 spec

Scuttle v1 is a local command-line experiment. It reads an **initial snapshot** and a **rendered snapshot** of one page, then reports the **findings**: the differences in title, meta description, links and text blocks, with evidence in the original values. The terms in bold are defined in [`GLOSSARY.md`](../GLOSSARY.md).

This spec is ready to build. It was worked out on the [Scuttle v1 map](https://github.com/johnharkinz/scuttle/issues/1), and each section links to the ticket that holds the reasoning. The original brief is [`docs/handoff.md`](handoff.md). Where the two differ, this spec wins (see [Where this differs from the handoff](#12-where-this-differs-from-the-handoff)).

**Since v1:** the Chrome extension was decided in [#19](https://github.com/johnharkinz/scuttle/issues/19#issuecomment-7197955290) and built in [#21](https://github.com/johnharkinz/scuttle/issues/21). It adds `extension/` and `scripts/`, and reuses `extract`, `compare` and `report` unchanged in behaviour. Sections 8, 9 and 11 note where it changes this spec. Everything else still holds for the CLI and for the core the extension shares.

## 1. Purpose and limits

Scuttle compares what the server sends with what JavaScript reveals. Nothing more. Fewer trustworthy findings beat a sophisticated report.

- A finding shows that the two snapshots differ. It does not claim to know what any particular crawler indexes.
- Scuttle does not judge whether a finding matters. The human does that at the review gate.
- Before adding any feature or abstraction beyond this spec, flag it and get agreement.

## 2. Usage

```sh
npm run scuttle -- <initial.html> <rendered.html> --url <page-url> [--json]
```

- `--url` is **required**. Links resolve against it, and it decides whether a link is internal or external. Scuttle never guesses it, for example from a canonical link.
- Without `--json`, Scuttle prints a Markdown report to stdout (section 7).
- With `--json`, it prints `{ "url": string, "findings": Finding[] }` instead, with findings in the same order as the report and with full text.
- Exit code 0 whenever a report is produced, whether or not there are findings. Non-zero only for bad arguments or unreadable files, with a one-line message on stderr.

Reasoning: [What does a finding look like, and how is the report laid out?](https://github.com/johnharkinz/scuttle/issues/8)

## 3. Extraction

The same extraction runs on both snapshots and produces one snapshot record:

```ts
type PageSnapshot = {
  title: string | null;        // null = missing
  description: string | null;  // null = missing
  links: { url: string; scope: 'internal' | 'external'; text: string; landmark?: Landmark }[];
  blocks: { kind: string; text: string; landmark?: Landmark }[];
};
type Landmark = 'nav' | 'header' | 'footer' | 'main' | 'aside';
```

The record keeps **original** values, with whitespace collapsed for display. Normalisation is only for building comparison keys (section 4).

### Title and meta description

- **Title:** the text of the first `<title>` in `<head>`. A `<title>` anywhere else, such as inside an SVG, doesn't count.
- **Meta description:** the `content` of the first `<meta name="description">`, matching the name case-insensitively. A tag with no `content` is empty.
- No tag means **missing** (`null`). A tag with no text, or only whitespace, means **empty** (`""`).

### Links

- Only `<a href>` in the body. Everything else is excluded: `<link>`, `<area>`, buttons, `onclick` navigation.
- Skip an `href` that is empty or fragment-only (`#section`).
- Resolve the `href` against `--url`. Keep it only if its scheme is `http`, `https`, `tel` or `mailto`, so `javascript:` and others are dropped. Skip any `href` that can't be parsed.
- `rel` (including `nofollow`) is ignored.
- **Anchor text:** the link's collapsed text. If that's empty, use its `aria-label`, then the `alt` of an image inside it, then its `title`, then `(no text)`.
- **Internal** if the scheme is `http` or `https` and the host matches the page's host, after lowercasing and ignoring a leading `www.`. Everything else is **external**: other domains, other subdomains, `tel:` and `mailto:`.

Reasoning: [What counts as an internal link, and when are two links the same?](https://github.com/johnharkinz/scuttle/issues/4)

### Text blocks

- **Block elements:** `h1`–`h6`, `p`, `li`, `td`, `th`, `dt`, `dd`, `blockquote`, `figcaption`, `caption`.
- **Nesting:** the innermost block element owns its text. An outer block keeps only text that isn't inside a nested block, so an `li` wrapping a `p` yields the `p`, plus any loose text in the `li`. Inline elements (`a`, `span`, `strong`…) are part of their block's text.
- **Text outside any block element is ignored.** For example, text sitting directly in a `div` or `span` produces no block. This is a known source of **misses**, accepted for v1.
- **Skipped entirely**, for both links and text blocks: `script`, `style`, `template`, `noscript`, `svg`, and all of `<head>` (except for title and meta description, above).
- **Hidden content counts.** Content inside `[hidden]` or `aria-hidden="true"` is extracted like any other. Scuttle can't see CSS, so content hidden by CSS counts too.
- Drop a block that is empty after normalisation. There is no minimum length.

Reasoning: [Which elements become text blocks, and how are nesting and duplicates handled?](https://github.com/johnharkinz/scuttle/issues/7)

### Landmark

For each link and text block, record the nearest enclosing `nav`, `header`, `footer`, `main` or `aside` element, if there is one. It is evidence only.

## 4. Normalisation and identity

**Text key** (text blocks, title and description): let the parser decode entities, collapse every run of whitespace (including non-breaking spaces) to one space, trim, then lowercase. Nothing else: no folding of smart quotes, no Unicode normalisation and no stripping of zero-width characters.

**Link key:** the resolved URL with the fragment removed, and the scheme and host lowercased. Everything else is kept as is: path case, trailing slash and the full query string, including tracking parameters.

- A **text block** is identified by its text key alone. Its kind (`h3`, `p`…) is evidence, so text that moves from an `h3` to a `p` is not a finding.
- A **link** is identified by its link key alone. Anchor text is evidence, so the same URL with different text is not a finding.
- **Repeats don't matter.** Each snapshot is treated as a set of keys, so appearing 3× in one snapshot and 1× in the other is not a finding.

## 5. Comparison and direction

Compare the two snapshots in both directions. Each finding has a **direction**:

- **Text blocks and links:** a key present in only one snapshot is *only in initial* or *only after rendering*. They are never *changed*.
- **Title and description:** each has a value, or no value (missing or empty).
  - No value in either → no finding.
  - Same text key in both → no finding. This includes differences of case or whitespace only.
  - A value in only one → *only in initial* or *only after rendering*.
  - Values in both with different text keys → *changed*.

## 6. Finding shape

```ts
type Direction = 'only in initial' | 'only after rendering' | 'changed';
type Finding =
  | { category: 'title' | 'description'; direction: Direction; initial: string | null; rendered: string | null }
  | { category: 'link'; direction: Direction; url: string; scope: 'internal' | 'external'; texts: string[]; landmark?: Landmark }
  | { category: 'text'; direction: Direction; text: string; kind: string; landmark?: Landmark };
```

- **Metadata:** `initial` and `rendered` hold the original values, where `null` is missing and `""` is empty.
- **Link:** `url` is the link key. `texts` lists each distinct anchor text the URL has in the snapshot where it appears, in document order. `landmark` comes from its first occurrence.
- **Text block:** `text`, `kind` and `landmark` come from the block's first occurrence.

## 7. Report

```markdown
# Scuttle: <file or fixture name>

<page URL>

| | Only in initial | Only after rendering | Changed |
|---|---|---|---|
| Title | 0 | 0 | 0 |
| Meta description | 0 | 0 | 0 |
| Links | 0 | 15 | — |
| Text blocks | 0 | 95 | — |

## Links: only after rendering (15)

- https://www.fresha.com/book-now/… (external) — “Agendar Horário” · in header
- tel:+351966616502 (external) — “Marcar”, “(+351) 966 616 502”

## Text blocks: only after rendering (95)

- “Nossos Serviços” (h2) · in main
```

- Start with the summary table, then **list every finding**, with no cap. The review gate labels every finding.
- **Group order:** title, description, links, text blocks. Within each, *only in initial* comes first, then *only after rendering*, then *changed*. Findings within a group keep document order. Leave out empty groups.
- **Lines:**
  - metadata: `“initial” → “rendered”`, showing `(missing)` or `(empty)` where there's no value
  - links: `URL (internal|external) — “text”, “text” · in <landmark>`
  - text blocks: `“text” (kind) · in <landmark>`
  - Leave out `· in …` when there's no landmark.
- Cut text-block evidence at **160 characters** with `…`. Never cut URLs, anchor text or metadata. `--json` always has the full text.
- If there are no findings, print the table and then `No differences found.`

Reasoning: [What does a finding look like, and how is the report laid out?](https://github.com/johnharkinz/scuttle/issues/8)

## 8. Stack and layout

- Node 22, TypeScript (ESM), `cheerio`, `vitest`, `tsx`. No other dependencies without flagging them first.
- `npm run scuttle` runs `src/cli.ts`, and `npm test` runs `vitest`.
- The extension (#21) adds three dev dependencies: `esbuild` to bundle it, `playwright-core` to launch Chrome for Testing for `try:extension`, and `@types/chrome`.

```text
src/
├── extract.ts     # html + page URL → PageSnapshot
├── normalise.ts   # text key, link key
├── compare.ts     # two PageSnapshots → Finding[]
├── report.ts      # Finding[] → Markdown
└── cli.ts         # arguments, file reading, --json
test/
└── *.test.ts      # inline HTML, apart from the extension's parity test
extension/         # since v1 (#21): the Chrome extension, which imports src/
scripts/           # since v1 (#21): build-, preview- and try-extension
```

Aim for **a few hundred lines** of plain TypeScript. That's a design pressure, not a hard limit. Don't add frameworks, plugin systems or per-category comparison machinery.

## 9. Tests

Tests use inline HTML only. Fixture HTML is gitignored and isn't in CI. Since v1 there is one exception: the extension's parity test (#21) checks its bundled core against the CLI on each fixture pair on the machine, and skips the fixtures whose HTML isn't there. Each case below is a pair of tiny snapshots and its expected findings:

1. Whitespace and case differences in a text block → no finding.
2. A relative link in one snapshot and the same absolute link in the other → no finding.
3. A genuine addition and a genuine removal of a text block → one finding in each direction.
4. Fragment-only and `javascript:` links are ignored. A `tel:` link is kept as external.
5. The same URL with different anchor text → no finding.
6. `www.` and host case don't affect internal vs external. Another subdomain is external.
7. Content in `[hidden]` or `aria-hidden="true"` is extracted.
8. An `li` wrapping a `p` produces one block, not two.
9. A block repeated in one snapshot and appearing once in the other → no finding.
10. Title: missing vs value → *only after rendering*. Empty vs missing → no finding. Different values → *changed*. Case-only difference → no finding.
11. An SVG `<title>` in the body is not the page title.
12. Text inside `script`, `style`, `template`, `noscript` and `svg` produces no block.

## 10. Fixtures and the review gate

Three **fixture pairs** live in `fixtures/<name>/`. Only `NOTES.md` and `REVIEW.md` are committed, because the snapshot HTML is third-party content. Capture method and conditions are in each `NOTES.md` ([Capture the first three fixture pairs](https://github.com/johnharkinz/scuttle/issues/3)).

The counts below were reached by prototypes that apply the decided rules. A build that differs a lot should explain why.

| Fixture | Role | URL | Findings |
|---|---|---|---|
| `control-sharp-style-words` | Control | https://sharp-style-words.lovable.app/ | none |
| `gap-mens-scalp-expert` | Gap case | https://mens-scalp-expert.lovable.app/ | about 15 links and 95 text blocks, all only after rendering |
| `hybrid-visionexpress` | Hybrid | https://www.visionexpress.com/eye-test | about 11 links and 22 text blocks, all only after rendering (consent panel and account menu, plus "Find a store", cart and wishlist) |

**After building:**

1. Run Scuttle on each fixture.
2. Draft `fixtures/<name>/REVIEW.md` with one row per finding:

   ```markdown
   | Finding | Label | Cause | Note |
   |---|---|---|---|
   | Link only after rendering: tel:+351966616502 | useful (proposed) | | Phone booking route appears only after rendering |
   ```

3. Label each finding **useful**, **harmless noise** or **false positive**. A false positive also gets a cause, *tool* or *capture*. An agent may propose labels, but **the human confirms every label**. Note any **miss** that comes up along the way.
4. Judge the **review gate**:
   - **Fail** if the control still has more than 5 false positives after one round of generic fixes, or if getting below that would need a site-specific rule, fuzzy matching or an exclusion list.
   - **Continue** only if the gap case has at least 3 useful findings, useful findings are at least half of its findings, and each useful finding makes sense from the report alone.
   - **The hybrid** is informational only.
5. Act on the outcome:
   - **Continue:** open the question of a shared core library as a new effort.
   - **Adjust and re-run:** at most once, with generic fixes only, and only if the criteria were nearly met.
   - **Stop:** record why.

Reasoning: [What makes the v1 output useful enough to continue?](https://github.com/johnharkinz/scuttle/issues/2). Known candidate for a generic fix: the gap case has a zero-width space at the start of a text block, which normalisation doesn't strip.

## 11. Out of scope

- **Analysis:** JSON-LD and structured data, images, product-specific reasoning, semantic interpretation, AI or LLM integration.
- **Running Scuttle at scale:** crawl scheduling, multi-page analysis, scores, robots.txt checks, site-specific rules, automated browser capture (Playwright).
- **Product decisions:** a shared core library, a web app or browser extension, more checks, multiple URLs or exports. These are decided after the review gate, as a new effort. Since v1, #19 decided on an extension with no web app and no shared library, and #21 built it. The rest are still open.
- **UI:** any Scuttle UI, including `scuttle.camas.dev`. Since v1, the extension's popup and report page are the exception. They stay unstyled until a camas-design brief is agreed.
- **Reporting:** counts of text outside any block.

Scuttle's mark is recorded in camas-design DEC-005 and isn't used in v1.

## 12. Where this differs from the handoff

| Handoff | This spec | Why |
|---|---|---|
| Compare internal links | Compare all `http(s)`, `tel:` and `mailto:` links, marked internal or external | In the gap case the whole booking route (Fresha, phone, email) is external and appears only after rendering |
| "Added, removed and changed information" | Only title and description can be *changed*. Links and text blocks are *only in initial* or *only after rendering* | Matching an edited sentence needs fuzzy matching, which the handoff rules out |
| "A readable report of a few material differences" | Every finding is listed | The review gate labels every finding. Grouping and the summary table keep the report readable |
| `normalise(snapshot): PageSnapshot` | Snapshots keep original values. `normalise.ts` builds comparison keys only | Evidence must show original values. The handoff called its API a suggestion |
