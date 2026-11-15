# gap-mens-scalp-expert

**Role:** Gap case
**URL:** https://mens-scalp-expert.lovable.app/

## Capture

| | Initial snapshot | Rendered snapshot |
|---|---|---|
| Captured (UTC) | 2026-11-15T21:23:23Z | 2026-11-15T21:29:41Z |
| Method | `curl -L`, no cookies | Chrome 157, fresh incognito window, `copy(document.documentElement.outerHTML)` from the console |
| User agent | `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36` | Chrome 157's own (same reduced UA string) |
| Locale | `Accept-Language: en-GB,en;q=0.9` | Chrome default; macOS locale en_GB (Chrome language not verified) |
| Size | 12010 bytes | 111672 bytes |
| Wait | n/a | ~10 seconds after the page looked finished; no scrolling, clicking or consent interaction |
| Viewport | n/a | Default window size |

**Initial response:** HTTP 200, no redirects, Cloudflare (`__cf_bm` cookie set, not sent back), `cache-control: no-cache`. A client-rendered Vite/React shell: empty `<div id="root">`, about 11 characters of body text, title "Lovable App".

**Observed during rendered capture:** nothing.

## Conditions not controlled

- The snapshots were captured several minutes apart (initial first).
- `outerHTML` omits the doctype and anything inside iframes.
- Demo-style site; content is Portuguese (Portugal), booking via Fresha. Judge "useful" as if you were the owner.
- The rendered snapshot includes a JavaScript-injected "Edit with Lovable" badge.
- A marquee repeats one sentence four times in the rendered DOM.

The snapshot HTML is third-party content and is gitignored; it exists only on the capturing machine.
