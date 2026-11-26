# gap-dentrw

**Role:** Gap case
**URL:** https://dentrw.vercel.app/

## Capture

Round 2 ([#16](https://github.com/johnharkinz/scuttle/issues/16)). The rendered snapshot was captured by an agent with the Chrome DevTools CLI (`chrome-devtools-mcp`), not by hand as in v1.

| | Initial snapshot | Rendered snapshot |
|---|---|---|
| Captured (UTC) | 2026-11-26T16:15:07Z | 2026-11-26T16:15:19Z |
| Method | `curl -L`, no cookies | Headless Chrome 158, fresh isolated browser context, `document.documentElement.outerHTML` via `evaluate_script` |
| User agent | `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36` | Same, set by emulation (overrides the default `HeadlessChrome/158` string) |
| Locale | `Accept-Language: en-GB,en;q=0.9` | `navigator.language` was `en-GB` |
| Size | 3843 bytes | 70178 bytes |
| Wait | n/a | 10 seconds after navigation finished (`readyState` was `complete`); no scrolling, clicking or consent interaction |
| Viewport | n/a | 1440×900 (emulated) |

**Initial response:** HTTP 200, no redirects, Vercel (`x-vercel-cache: HIT`), `cache-control: public, max-age=0, must-revalidate`. A client-rendered React shell, not built with Lovable: no text blocks, no links.

**Observed during rendered capture:** nothing.

## Conditions not controlled

- The snapshots were captured about 12 seconds apart (initial first).
- Headless Chrome may be detected by sites even with a normal user agent; no bot challenge was seen.
- `outerHTML` omits the doctype and anything inside iframes.
- Demo or student project for a dental clinic in Kigali, Rwanda (GitHub hbapte/dentrw-alx). Judge "useful" as if you were the owner.
- Chosen to test Scuttle on a client-rendered site that isn't Lovable.

The snapshot HTML is third-party content and is gitignored; it exists only on the capturing machine.
