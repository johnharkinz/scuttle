import { isSupported } from './supported.ts';
import type { CompareRequest, CompareResponse } from './messages.ts';

const button = document.querySelector<HTMLButtonElement>('#compare')!;
const message = document.querySelector<HTMLElement>('#message')!;
const LABEL = button.textContent!;

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
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id === undefined || !isSupported(tab.url)) {
    showLimit('Scuttle can only compare ordinary web pages (http or https).');
    return;
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
