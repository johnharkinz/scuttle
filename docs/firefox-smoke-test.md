# Firefox smoke test

Run this by hand before each Firefox Add-ons upload. Playwright can't load extensions into Firefox, so these checks aren't in the test suite.

## Setup

1. Run `npm run package:extension`. It must finish with no addons-linter errors.
2. Open `about:debugging#/runtime/this-firefox`, choose **Load Temporary Add-on…** and pick `build/firefox/manifest.json`.
3. Pin Scuttle from the Extensions menu.

## Checks

1. **Popup.** Open a fixture's URL (from its `NOTES.md`) and let the page settle for about 10 seconds. Click the Scuttle toolbar button. The popup shows the Scuttle mark and fonts.
2. **Site permission.** Click *Compare this page*. Firefox asks for Scuttle to access your data for that site only (for example, *sites in poshbarber.lovable.app domains*), and the popup stays open.
3. **Declined.** Choose **Cancel**. The popup says Scuttle needs your permission for this site, and no report opens.
4. **Rendered capture.** Click *Compare this page* again and allow it. The report opens in the next tab. Its capture conditions show the tab's URL, `readyState` and Firefox's user agent.
5. **Fetch without JavaScript.** The report isn't *Fetch without JavaScript blocked*. If you watch the request in the Browser Toolbox's network panel, it has no `Cookie` header and has `Cache-Control: no-cache`.
6. **Comparison.** The report's findings are the same as Chrome's for the same page at the same time. Run Chrome with `npm run try:extension <url>`.
7. **Unsupported page.** On `about:addons`, *Compare this page* says Scuttle can only compare ordinary web pages.
8. **Report reload.** Reload the report tab. It says the report is no longer available.

## Firefox differs from Chrome here

- **The fetch needs a site permission.** In Firefox, activeTab lets Scuttle read the tab but doesn't exempt the fetch from CORS. Without the permission, the fetch fails with *NetworkError when attempting to fetch resource* unless the server sends `Access-Control-Allow-Origin` (Vercel sends `*`). So the Firefox package lists `optional_host_permissions: ["<all_urls>"]`, and the popup asks for the page's site when you compare it ([#31](https://github.com/johnharkinz/scuttle/issues/31)). Chrome and Edge ask for nothing: activeTab covers the fetch there.
- **A fetch that redirects to another site is blocked.** The permission covers only the page's own site, so a redirect to another host (for example, `example.com` to `www.example.com`) fails with the same NetworkError. Scuttle reports it as *Fetch without JavaScript blocked*. This was seen on a local test server, not on a fixture: none of the fixtures redirect.

## Last run

2026-11-26, Firefox 161 on macOS, Scuttle 0.1.1, driven by throwaway Selenium scripts (not in the repo) with trusted clicks on the real toolbar button, popup and permission prompt.

- Check 1: the popup opened, but its look wasn't checked.
- Checks 2 to 4 passed.
- Check 5 was seen on a local test server: no `Cookie`, `Cache-Control: no-cache` and Firefox's user agent.
- Check 6: on all 9 fixture URLs, the findings matched the Chromium package's, group by group and finding by finding. The Chromium package ran in Chrome for Testing at the same time. It was given `<all_urls>` there in place of activeTab, because Playwright can't click the toolbar button.
- Checks 7 and 8 weren't run.

| Fixture | Findings in Firefox and Chrome |
|---|---|
| control-sharp-style-words | No differences found |
| gap-dentrw | 92, all only with JavaScript |
| gap-mens-scalp-expert | 110, all only with JavaScript |
| gap-mudra-dental | 80, all only with JavaScript |
| gap-posh-barber | 98, all only with JavaScript |
| hybrid-glitters-dental | No differences found |
| hybrid-mydentist | 19: 1 only without JavaScript, 18 only with JavaScript |
| hybrid-optical-express | 54: 2 only without JavaScript, 52 only with JavaScript |
| hybrid-visionexpress | 63: 21 only without JavaScript, 42 only with JavaScript |
