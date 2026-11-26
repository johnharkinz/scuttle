# Review: hybrid-glitters-dental

**Role:** Hybrid (informational only); behaves as a control
**URL:** https://glitters-dental-sparkle.lovable.app/

Labels were proposed by an agent and **confirmed by the human** (spec §10). Cause is filled in only for false positives.

## Run

```sh
npm run scuttle -- fixtures/hybrid-glitters-dental/initial.html fixtures/hybrid-glitters-dental/rendered.html --url https://glitters-dental-sparkle.lovable.app/
```

**Findings:** none. Both snapshots have the same title (“Lovable App”), meta description, 41 text blocks and 7 links.

## Misses and observations

- **A prerendered Lovable site.** Unlike the other Lovable fixtures, the server sends the full page, so this behaves as a second control: 0 findings, 0 false positives.
- The title is “Lovable App” in both snapshots, the Lovable default. Not a finding, because it is the same in both.

## Labels

**0 findings, 0 false positives.** Matches the control (`control-sharp-style-words`).

## Findings (0)

| Finding | Label | Cause | Note |
|---|---|---|---|

