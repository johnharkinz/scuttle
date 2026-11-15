# control-sharp-style-words

**Role:** Control
**URL:** https://sharp-style-words.lovable.app/

## Capture

| | Initial snapshot | Rendered snapshot |
|---|---|---|
| Captured (UTC) | 2026-11-15T21:23:24Z | 2026-11-15T21:31:11Z |
| Method | `curl -L`, no cookies | Chrome 157, fresh incognito window, `copy(document.documentElement.outerHTML)` from the console |
| User agent | `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36` | Chrome 157's own (same reduced UA string) |
| Locale | `Accept-Language: en-GB,en;q=0.9` | Chrome default; macOS locale en_GB (Chrome language not verified) |
| Size | 27003 bytes | 25592 bytes |
| Wait | n/a | ~10 seconds after the page looked finished; no scrolling, clicking or consent interaction |
| Viewport | n/a | Default window size |

**Initial response:** HTTP 200, no redirects, Cloudflare (`__cf_bm` cookie set, not sent back), `cache-control: no-cache`. Fully server-rendered: 24 paragraphs, 32 headings, 25 links, 18 list items.

**Observed during rendered capture:** nothing.

## Conditions not controlled

- The snapshots were captured several minutes apart (initial first).
- `outerHTML` omits the doctype and anything inside iframes.
- Demo-style site with placeholder staff names.
- Rough counts of paragraphs, headings, links and list items were identical across the two snapshots at capture time.

The snapshot HTML is third-party content and is gitignored; it exists only on the capturing machine.
