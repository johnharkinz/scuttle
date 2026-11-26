import { isSupported } from './supported.ts';
import type { CompareRequest, CompareResponse } from './messages.ts';

const button = document.querySelector<HTMLButtonElement>('#compare')!;
const message = document.querySelector<HTMLElement>('#message')!;
const LABEL = button.textContent!;

// The tab is looked up when the popup opens, so a click can ask for a site permission straight
// away: Firefox only shows the prompt from within the click itself.
let tab: chrome.tabs.Tab | undefined;
const tabFound = chrome.tabs.query({ active: true, currentWindow: true }).then(([found]) => (tab = found));

/**
 * Firefox's activeTab doesn't cover the fetch without JavaScript (#31), so its manifest lists the
 * sites Scuttle may ask for, and Scuttle asks for this page's site when you compare it. Chrome and
 * Edge list none: activeTab covers the fetch there.
 */
const mayAskForSites = (chrome.runtime.getManifest().optional_host_permissions ?? []).length > 0;
/** The page's site as a match pattern, which can't hold a port: it covers every port. */
const siteOf = (url: string) => {
  const { protocol, hostname } = new URL(url);
  return `${protocol}//${hostname}/*`;
};

/** Scuttle couldn't compare: the ochre watch marker, the reason, and the browser's own words when it gave any. */
function showLimit(text: string, detail?: string) {
  const body = document.createElement('div');
  body.append(Object.assign(document.createElement('p'), { textContent: text }));
  if (detail) body.append(Object.assign(document.createElement('p'), { className: 'browser-says inset', textContent: detail }));
  const limit = Object.assign(document.createElement('div'), { className: 'limit' });
  limit.append(Object.assign(document.createElement('span'), { className: 'watch', ariaHidden: 'true' }), body);
  message.replaceChildren(limit);
}

button.addEventListener('click', async () => {
  if (!tab) await tabFound;
  if (tab?.id === undefined || !isSupported(tab.url)) {
    showLimit('Scuttle can only compare ordinary web pages (http or https).');
    return;
  }
  if (mayAskForSites) {
    let allowed: boolean;
    try {
      allowed = await chrome.permissions.request({ origins: [siteOf(tab.url!)] });
    } catch (e) {
      // For example, if the tab lookup was still running when you clicked, so the click no longer counts.
      showLimit('Scuttle couldn’t ask for permission for this site. Try again.', (e as Error).message);
      return;
    }
    if (!allowed) {
      showLimit('Scuttle needs your permission for this site, to fetch the page from its server.');
      return;
    }
  }
  button.disabled = true;
  button.textContent = 'Capturing…';
  message.replaceChildren(
    Object.assign(document.createElement('p'), {
      className: 'status',
      textContent: 'Reading this tab, then fetching the page from its server. On a slow server this takes a few seconds.',
    }),
  );
  // On success the report opens in a new tab, which closes this popup.
  const response: CompareResponse = await chrome.runtime.sendMessage<CompareRequest>({ type: 'scuttle:compare', tabId: tab.id });
  if (!response.ok) {
    showLimit(response.error, response.detail);
    button.disabled = false;
    button.textContent = LABEL;
  }
});
