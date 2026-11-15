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

## Findings

**Finding**:
One reported difference between the two snapshots of a fixture pair, with evidence in the original values.
_Avoid_: issue, diff, result, error

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
