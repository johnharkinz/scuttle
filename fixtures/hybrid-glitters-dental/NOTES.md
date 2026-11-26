# hybrid-glitters-dental

**Role:** Hybrid
**URL:** https://glitters-dental-sparkle.lovable.app/

## Capture

Round 2 ([#16](https://github.com/johnharkinz/scuttle/issues/16)). The rendered snapshot was captured by an agent with the Chrome DevTools CLI (`chrome-devtools-mcp`), not by hand as in v1.

| | Initial snapshot | Rendered snapshot |
|---|---|---|
| Captured (UTC) | 2026-11-26T16:15:35Z | 2026-11-26T16:15:48Z |
| Method | `curl -L`, no cookies | Headless Chrome 158, fresh isolated browser context, `document.documentElement.outerHTML` via `evaluate_script` |
| User agent | `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36` | Same, set by emulation (overrides the default `HeadlessChrome/158` string) |
| Locale | `Accept-Language: en-GB,en;q=0.9` | `navigator.language` was `en-GB` |
| Size | 64604 bytes | 63133 bytes |
| Wait | n/a | 10 seconds after navigation finished (`readyState` was `complete`); no scrolling, clicking or consent interaction |
| Viewport | n/a | 1440×900 (emulated) |

**Initial response:** HTTP 200, no redirects, Cloudflare (`__cf_bm` cookie set, not sent back), `cache-control: no-cache, must-revalidate, max-age=0`. A Lovable site whose server response is already fully prerendered: 41 text blocks and 7 links, the same as after rendering.

**Observed during rendered capture:** nothing.

## Conditions not controlled

- The snapshots were captured about 12 seconds apart (initial first).
- Headless Chrome may be detected by sites even with a normal user agent; no bot challenge was seen.
- `outerHTML` omits the doctype and anything inside iframes.
- Real dental clinic in Wuse 2, Abuja, Nigeria.
- Proposed as a hybrid, but it behaves as a control (0 findings).

The snapshot HTML is third-party content and is gitignored; it exists only on the capturing machine.
