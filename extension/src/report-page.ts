import { analyse } from './core.ts';
import type { TakeRequest, TakeResponse } from './messages.ts';
import { renderReportHtml } from './render.ts';

const main = document.querySelector<HTMLElement>('main')!;
const token = location.hash.slice(1);
const capture: TakeResponse = token ? await chrome.runtime.sendMessage<TakeRequest>({ type: 'scuttle:take', token }) : null;

if (capture) {
  document.title = `Scuttle: ${capture.pageUrl}`;
  main.innerHTML = `<p>${new Option(capture.pageUrl).innerHTML}</p>${renderReportHtml(analyse(capture))}`;
} else {
  // Nothing is stored, so a report can't be shown again once it's been closed or reloaded.
  main.innerHTML = '<p>This report is no longer available. Scuttle doesn’t keep reports: open the page again and click <em>Compare this page</em>.</p>';
}
