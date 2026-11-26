import { compare, type Finding } from '../../src/compare.ts';
import { extract } from '../../src/extract.ts';

// The extension's pure core: no chrome.* or DOM, so it runs in Node tests and in the bundle alike.

/** The rendered snapshot and the conditions it was captured under, read from the tab. */
export type RenderedCapture = {
  html: string;
  capturedAt: string; // ISO time
  sinceLoadMs: number | null; // time since the page's load event ended, or null before it has
  readyState: string;
  viewport: { width: number; height: number };
  userAgent: string;
};

/** The extension's fetch of the page's URL: a response, or the error that stopped it. */
export type InitialFetch =
  | {
      kind: 'response';
      startedAt: string; // ISO time
      status: number;
      contentType: string | null;
      finalUrl: string; // after redirects
      headers: Record<string, string>; // only the few that recognise a block
      body: string;
    }
  | { kind: 'error'; startedAt: string; message: string };

/** Everything captured for one comparison, as the capture layer hands it to the report page. */
export type RawCapture = {
  pageUrl: string;
  rendered: RenderedCapture;
  initial: InitialFetch;
  notes: string[]; // extra statements about the conditions, shown with them
};

export type Analysis = {
  capture: RawCapture;
  result: { state: 'compared'; findings: Finding[] } | { state: 'blocked'; reason: string };
};

type FetchResponse = Extract<InitialFetch, { kind: 'response' }>;

/**
 * Bot challenges and block pages, recognised from what was actually seen rather than guessed (#21).
 * Each is matched on something only that page has. Cloudflare's `challenge-platform` script, for
 * example, is also on ordinary pages (Specsavers, Bupa), so it isn't used.
 */
const BLOCKS: { says: string; is: (response: FetchResponse, title: string | null) => boolean }[] = [
  // boots.com: HTTP 200, x-iinfo header.
  { says: 'Imperva returned a bot challenge', is: (_, title) => title === 'Pardon Our Interruption' },
  // specsavers.co.uk, physiofirst.org.uk (to curl): HTTP 403, “Just a moment...”.
  { says: 'Cloudflare returned a bot challenge', is: response => response.headers['cf-mitigated'] === 'challenge' },
  // bupa.co.uk/dental (to curl): HTTP 403, a block page rather than a challenge.
  { says: 'Cloudflare blocked the request', is: (_, title) => title === 'Attention Required! | Cloudflare' },
];

const titleOf = (html: string) => /<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1].trim() ?? null;

/** Why a response can't be used as the initial snapshot, or null when it can. */
function blockedReason(response: FetchResponse): string | null {
  const title = titleOf(response.body);
  const block = BLOCKS.find(b => b.is(response, title));
  if (block) return `${block.says} (HTTP ${response.status}).`;
  if (response.status < 200 || response.status > 299) return `The server responded with HTTP ${response.status}.`;
  const type = response.contentType?.split(';')[0].trim().toLowerCase() || null;
  if (type !== 'text/html' && type !== 'application/xhtml+xml') return `The server sent ${type ?? 'no content type'}, not HTML.`;
  return null;
}

/** RawCapture → findings, or the reason the initial snapshot can't be used. */
export function analyse(capture: RawCapture): Analysis {
  const { initial, rendered, pageUrl } = capture;
  if (initial.kind === 'error') return { capture, result: { state: 'blocked', reason: `The fetch failed: ${initial.message}.` } };
  const reason = blockedReason(initial);
  if (reason) return { capture, result: { state: 'blocked', reason } };
  const findings = compare(extract(initial.body, initial.finalUrl), extract(rendered.html, pageUrl));
  return { capture, result: { state: 'compared', findings } };
}
