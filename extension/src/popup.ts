import { isSupported } from './supported.ts';
import type { CompareRequest, CompareResponse } from './messages.ts';

const button = document.querySelector<HTMLButtonElement>('#compare')!;
const message = document.querySelector<HTMLElement>('#message')!;

button.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id === undefined || !isSupported(tab.url)) {
    message.textContent = 'Scuttle can only compare ordinary web pages (http or https).';
    return;
  }
  button.disabled = true;
  message.textContent = 'Capturing…';
  // On success the report opens in a new tab, which closes this popup.
  const response: CompareResponse = await chrome.runtime.sendMessage<CompareRequest>({ type: 'scuttle:compare', tabId: tab.id });
  if (!response.ok) {
    message.textContent = response.error;
    button.disabled = false;
  }
});
