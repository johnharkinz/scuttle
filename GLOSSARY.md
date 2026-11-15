# Scuttle

Scuttle compares what the server sends with what JavaScript reveals, and reports the differences that matter. Nothing more.

## Snapshots

**Initial snapshot**:
The HTML of a page as the server first sends it, before any JavaScript runs.
_Avoid_: source, raw HTML, server HTML

**Rendered snapshot**:
The DOM of the same page after a browser has run its JavaScript and the page has settled.
_Avoid_: rendered HTML, final HTML, live DOM

**Fixture pair**:
An initial snapshot and a rendered snapshot of one URL, captured under broadly equivalent conditions, with notes on those conditions.
_Avoid_: test case, sample

**Fixture role**:
Why a fixture pair was chosen: **gap case** (suspected to depend on JavaScript), **control** (mostly server-rendered, expected to show close to nothing) or **hybrid** (server-rendered, then hydrated or extended by JavaScript).

## Links

**Link**:
An `<a href>` in a snapshot that leads somewhere other than the same page: a web address, a phone number or an email address. A link is identified by its destination alone; its anchor text is evidence, not identity.
_Avoid_: anchor, href, URL (on its own)

**Internal link**:
A link whose destination is on the same site as the page, ignoring a leading `www.`.

**External link**:
A link whose destination is on any other site, subdomain, phone number or email address.

## Text

**Text block**:
A heading, paragraph, list item or similar unit of content in a snapshot, holding only its own text and not the text of any block inside it. A text block is identified by its text alone; whether it is a heading or a paragraph is evidence, not identity.
_Avoid_: element, node, paragraph (for blocks in general)

## Findings

**Finding**:
One reported difference between the two snapshots of a fixture pair, with evidence in the original values.
_Avoid_: issue, diff, result, error

**Direction**:
Which way a finding points: **only in initial** (JavaScript removed or replaced it), **only after rendering** (JavaScript added it) or **changed** (both snapshots have a value, and the values differ). Only the title and meta description can be changed; links and text blocks are only ever present in one snapshot.
_Avoid_: added, removed, delta

**Landmark**:
The page region a link or text block sits in: the nearest enclosing navigation, header, footer, main content or aside, if any. It is evidence for a finding, not part of its identity.
_Avoid_: section, location, context

**Finding label**:
The human judgement given to a finding at review: **useful**, **harmless noise** or **false positive**.

**Useful**:
A real difference in meaningful content, links or metadata that a site owner would want to know about.

**Harmless noise**:
A real difference that doesn't matter, such as a consent banner or a loading placeholder.
_Avoid_: noise (on its own, which blurs it with false positives)

**False positive**:
A finding that is not a real difference in meaning. Its cause is either **tool** (extraction or normalisation should have absorbed it) or **capture** (the snapshots were taken under different conditions).

**Miss**:
A real difference that Scuttle did not report.
_Avoid_: false negative

## Review

**Review gate**:
The point after the first experiment where the labelled findings decide whether Scuttle continues, adjusts and re-runs once, or stops.
_Avoid_: evaluation, sign-off
