# Scuttle — Wayfinder Handoff

**Project:** Scuttle  
**Proposed home:** `scuttle.camas.dev`  
**Status:** Concept / first technical experiment  
**Working principle:** *Scuttle compares what the server sends with what JavaScript reveals. Nothing more.*

## 1. The idea

**Scuttle is a JavaScript rendering gap analyser.** Give it a webpage and it helps answer:

> What meaningful information is present after JavaScript runs that was missing from the initial server response — or vice versa?

This is useful for SEO and AI discoverability (GEO), particularly where search or AI crawlers may not execute JavaScript reliably. Scuttle identifies **rendering dependencies and observable differences**. It does **not** claim to know exactly what any particular crawler indexes, sees, trusts or recommends.

### Identity

Scuttle is a **beetle**: busy, diligent and methodical. It crawls over websites, doing the careful work others don't want to do or don't think to do. The product should feel approachable without compromising technical rigour. It is **not a crab**.

## 2. Long-term ambition (direction, not immediate scope)

Scuttle could become a small, useful developer/SEO diagnostic tool with:

- A standalone web app at `scuttle.camas.dev`.
- A companion browser extension, following the *architectural pattern* of `shareable.camas.dev` (not necessarily sharing its code).
- A server-side capture of the initial HTML response and a browser-side capture of the DOM after JavaScript rendering.
- Side-by-side and/or categorised reports of meaningful differences in content, internal links, metadata, structured data and potentially images.
- Clear evidence for each finding: what changed, the before/after values and where it was found.
- Eventually, a repeatable method to check representative pages across a site, especially product, category, editorial and appointment pages.

The wider value is helping site owners make important product knowledge, advice and conversion routes accessible to crawlers. For appointment-led businesses, this may mean descriptions, technical claims, relevant advice and links to consultation journeys — **not** necessarily prices, checkout or ecommerce feeds.

This long-term direction is **not permission** to build a crawler, platform, scoring system or AI agent in the first iteration.

## 3. The problem we want to avoid

Earlier versions of Shareable became more complex than intended. Scuttle must not repeat that pattern.

The main risk is accumulating special cases: site-specific selectors, complicated DOM matching, framework detection, fuzzy similarity heuristics, exclusions, scores and broad SEO audits.

**Keep Scuttle deliberately narrow.** Fewer trustworthy findings are better than a sophisticated report full of false positives.

## 4. First version: a tiny comparison experiment

**First milestone:** Given **two saved HTML files** from the same URL — one initial server response and one browser-rendered DOM snapshot — produce a readable report of a few material differences.

Start as a **local TypeScript script or small library**. No web app, browser extension, hosted service or Playwright automation is needed to prove the comparison.

### Compare only three categories

1. **Text content** — headings and meaningful text blocks such as paragraphs and list items. Detect content present only in one snapshot.
2. **Internal links** — destination URL and, where useful, anchor text. Detect links added or removed by rendering.
3. **Basic metadata** — page `<title>` and meta description. Detect missing or changed values.

**Out of scope for v0:** JSON-LD / schema analysis, image comparisons, product-specific reasoning, semantic interpretation, AI/LLM integration, crawl scheduling, multi-page analysis, scores, robots.txt checks, site-specific rules and automated browser capture.

These may be revisited after the first comparison has proved useful.

## 5. Simple design

Use the same extraction and normalisation logic on both documents.

```text
initial.html ─┐
              ├─> extract ─> normalise ─┐
rendered.html ┘                         ├─> compare ─> findings
                (same functions) ──────┘
```

A suggested API shape (not a mandated architecture):

```ts
extract(html: string, pageUrl: string): PageSnapshot
normalise(snapshot: PageSnapshot): PageSnapshot
compare(initial: PageSnapshot, rendered: PageSnapshot): Finding[]
```

A snapshot might contain:

```ts
type PageSnapshot = {
  title?: string;
  description?: string;
  textBlocks: { kind: string; text: string }[];
  links: { url: string; text: string }[];
};
```

A finding should communicate **category**, **direction** (only in initial HTML / only after rendering / changed), and **evidence** (actual original value, not just counts).

### Normalisation — intentionally minimal

- Trim and collapse whitespace; apply consistent case handling **for comparison only**.
- Resolve relative links against the page URL; ignore fragment-only differences where appropriate.
- Compare meaningful content rather than raw HTML, CSS classes, generated attributes or DOM order.
- Preserve the **original** display text/URL so reports remain understandable.
- Treat duplicates and nested text carefully enough to avoid obviously inflated results; don't build a universal DOM-diff algorithm.

One generic comparison approach (e.g. normalised keys and set differences) should cover the initial scope. Small category-specific extraction rules are fine; a large category-specific comparison framework is not.

## 6. First experiment / proposed sequence

1. Pick **one representative URL** and save the initial response HTML and the rendered browser DOM as fixtures. Keep both captures under broadly equivalent conditions (URL, locale, cookie state and session), noting differences that cannot be controlled.
2. Write the smallest extractor that yields the three categories above.
3. Normalise both outputs identically and compare in **both directions**.
4. Print a compact CLI/Markdown/JSON report with real examples of additions, removals or changes.
5. Try a few more fixture pairs and assess: **Are the findings useful, or mostly noise?** Adjust extraction only where the evidence demands it.
6. **Stop and review** before deciding whether an extension, web UI or automated rendering is justified.

Avoid spending the first session scaffolding a full product.

## 7. Definition of done for the first milestone

- [ ] The script reads two local HTML fixtures representing the same page.
- [ ] The **same extraction and normalisation functions** process both.
- [ ] It compares text blocks, internal links, title and meta description.
- [ ] It shows added, removed and changed information with the original values.
- [ ] Obvious cosmetic HTML differences do not appear as findings.
- [ ] A few small fixture tests cover whitespace/case differences, relative vs absolute URLs, and genuine additions/removals.
- [ ] The implementation can be read and explained easily; no speculative abstraction or framework.
- [ ] The output is useful enough to justify (or reject) the next step.

The desired size is **a few hundred lines of straightforward TypeScript at most**, as a design pressure rather than a rigid line-count target.

## 8. Important limitations

- **Initial HTML vs rendered DOM is a proxy**, not an exact reproduction of all search-engine or AI crawler behaviour.
- A browser's final DOM depends on timing, consent, personalisation, viewport and network calls. False positives are possible if the captures differ in those conditions.
- Hidden content isn't automatically absent: an FAQ accordion may already exist in initial HTML.
- Some JS-added content is harmless UI noise (cookie banners, overlays). Early Scuttle should **show evidence** instead of pretending to assign semantic importance perfectly.
- Compare both directions: JavaScript may **remove or replace** server-rendered content, not just add it.
- Don't confuse the goal with checking quality, authority, ranking, citation likelihood or ecommerce readiness.

## 9. Future decisions — explicitly deferred

Once the experiment produces useful output, decide in order:

1. Whether to package extraction/comparison as a shared core library.
2. Whether to follow Shareable's **web app + companion Chrome extension** approach; extension captures the rendered DOM, server fetch captures the initial HTML.
3. Whether automated browser capture using Playwright is actually needed.
4. Whether to include structured data, images and additional metadata checks.
5. Whether reporting should support multiple URLs or exports.

Do not solve these now.

## 10. Request for the Wayfinder session

**Please start with the narrow technical proof of concept, not the full product.**

- Review this handoff and propose the simplest practical file layout.
- Implement a comparison of two fixture HTML files for the three v0 categories.
- Explain any assumptions and likely sources of false positives.
- Show sample findings and indicate what we should validate on real sites.
- Flag any proposed feature or abstraction that exceeds the first milestone **before** adding it.

**Success is not an impressive architecture. Success is a small, reliable comparison that tells us whether Scuttle is worth building further.**
