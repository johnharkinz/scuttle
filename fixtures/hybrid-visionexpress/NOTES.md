# hybrid-visionexpress

**Role:** Hybrid
**URL:** https://www.visionexpress.com/eye-test

## Capture

| | Initial snapshot | Rendered snapshot |
|---|---|---|
| Captured (UTC) | 2026-11-15T21:23:24Z | 2026-11-15T21:32:46Z |
| Method | `curl -L`, no cookies | Chrome 157, fresh incognito window, `copy(document.documentElement.outerHTML)` from the console |
| User agent | `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36` | Chrome 157's own (same reduced UA string) |
| Locale | `Accept-Language: en-GB,en;q=0.9` | Chrome default; macOS locale en_GB (Chrome language not verified) |
| Size | 467704 bytes | 655243 bytes |
| Wait | n/a | ~10 seconds after the page looked finished; no scrolling, clicking or consent interaction |
| Viewport | n/a | Default window size |

**Initial response:** HTTP 200, no redirects, served from Cloudflare cache (`cf-cache-status: HIT`, `age: 289`, `max-age=300`). Next.js, server-rendered then hydrated.

**Observed during rendered capture:** nothing.

## Conditions not controlled

- The snapshots were captured several minutes apart (initial first).
- `outerHTML` omits the doctype and anything inside iframes.
- The initial snapshot came from a CDN cache about 5 minutes old; the browser may have received a different cached copy.
- The OneTrust consent banner markup exists only in the rendered snapshot, although no banner was noticed on screen (it may be hidden or deferred). Left untouched.
- Rough counts at capture: paragraphs 35 → 43, headings 33 → 47, links 250 → 265, list items 225 → 238.
- A Google Tag Manager `<noscript>` iframe is present; iframe content is not captured.

The snapshot HTML is third-party content and is gitignored; it exists only on the capturing machine.
