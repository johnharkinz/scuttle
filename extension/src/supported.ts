// Chrome doesn't let extensions script its Web Store, even with activeTab.
const SCRIPT_BLOCKED_HOSTS = new Set(['chromewebstore.google.com', 'chrome.google.com']);

/** Whether Scuttle can compare the page at this URL: an ordinary http(s) page. */
export function isSupported(url: string | undefined): boolean {
  const u = url ? URL.parse(url) : null;
  return !!u && (u.protocol === 'http:' || u.protocol === 'https:') && !SCRIPT_BLOCKED_HOSTS.has(u.hostname);
}
