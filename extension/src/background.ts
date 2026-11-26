// The capture layer: reads the rendered snapshot from the tab, fetches the initial snapshot,
// then opens the report and hands the capture to it. Captures are held in memory until the
// report takes them, and never written to storage.
import type { InitialFetch, RenderedCapture } from './core.ts';
import type { CompareRequest, CompareResponse, TakeRequest, TakeResponse } from './messages.ts';

// Response headers a block recogniser reads (core.ts). Nothing else is kept.
const KEPT_HEADERS = ['cf-mitigated'];

const pending = new Map<string, NonNullable<TakeResponse>>();

/** Runs in the page: its DOM as it is now, and the conditions it's in. */
function readRendered(): RenderedCapture {
  const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  const loadedAt = navigation?.loadEventEnd || null; // 0 until the load event has ended
  return {
    html: document.documentElement.outerHTML,
    capturedAt: new Date().toISOString(),
    sinceLoadMs: loadedAt === null ? null : performance.now() - loadedAt,
    readyState: document.readyState,
    viewport: { width: innerWidth, height: innerHeight },
    userAgent: navigator.userAgent,
  };
}

/** The body as text, in the charset the server declared (UTF-8 when it declares none Chrome knows). */
async function bodyText(response: Response): Promise<string> {
  const charset = /charset=["']?([\w-]+)/i.exec(response.headers.get('content-type') ?? '')?.[1];
  const bytes = await response.arrayBuffer();
  try {
    return new TextDecoder(charset ?? 'utf-8').decode(bytes);
  } catch {
    return new TextDecoder().decode(bytes);
  }
}

async function fetchInitial(url: string): Promise<InitialFetch> {
  const startedAt = new Date().toISOString();
  try {
    const response = await fetch(url, { credentials: 'omit', cache: 'no-store', redirect: 'follow' });
    const headers = Object.fromEntries(KEPT_HEADERS.flatMap(h => (response.headers.has(h) ? [[h, response.headers.get(h)!]] : [])));
    const contentType = response.headers.get('content-type');
    return { kind: 'response', startedAt, status: response.status, contentType, finalUrl: response.url, headers, body: await bodyText(response) };
  } catch (e) {
    return { kind: 'error', startedAt, message: (e as Error).message };
  }
}

async function compareTab(tabId: number): Promise<CompareResponse> {
  const tab = await chrome.tabs.get(tabId);
  if (!tab.url) return { ok: false, error: 'Scuttle can’t read this tab’s address.' };
  let rendered: RenderedCapture;
  try {
    const [injection] = await chrome.scripting.executeScript({ target: { tabId }, func: readRendered });
    rendered = injection.result as RenderedCapture;
  } catch (e) {
    return { ok: false, error: `Scuttle can’t read this page: ${(e as Error).message}` };
  }
  const initial = await fetchInitial(tab.url);
  const token = crypto.randomUUID();
  pending.set(token, { pageUrl: tab.url, rendered, initial, notes: [] });
  await chrome.tabs.create({ url: `report.html#${token}`, index: tab.index + 1, openerTabId: tabId });
  return { ok: true };
}

chrome.runtime.onMessage.addListener((message: CompareRequest | TakeRequest, _sender, sendResponse) => {
  if (message.type === 'scuttle:compare') {
    compareTab(message.tabId).then(sendResponse, e => sendResponse({ ok: false, error: String(e) }));
    return true; // responds asynchronously
  }
  if (message.type === 'scuttle:take') {
    const capture = pending.get(message.token) ?? null;
    pending.delete(message.token);
    sendResponse(capture);
  }
  return false;
});
