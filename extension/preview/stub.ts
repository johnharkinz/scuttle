// The preview's capture layer. It stands in for chrome.* on the real popup and report pages,
// and reads a fixture pair from fixtures/ instead of capturing a tab. The pages don't know.
import type { InitialFetch, RawCapture } from '../src/core.ts';
import type { CompareRequest, CompareResponse, TakeRequest, TakeResponse } from '../src/messages.ts';
import { parseNotes } from './notes.ts';

const fixture = new URLSearchParams(location.search).get('fixture') ?? '';
const TAB_ID = 1;

// Built-in examples that need no fixture files.
const UNSUPPORTED = 'unsupported-page';
const BLOCKED = 'blocked-fetch';
const BLOCKED_URL = 'https://blocked.example/';

const text = async (path: string) => {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response.text();
};
const file = (name: string) => text(`/fixtures/${encodeURIComponent(fixture)}/${name}`);

async function tabUrl(): Promise<string> {
  if (fixture === UNSUPPORTED) return 'chrome://extensions/';
  if (fixture === BLOCKED) return BLOCKED_URL;
  return parseNotes(await file('NOTES.md')).url;
}

async function blockedExample(): Promise<RawCapture> {
  const now = Date.now();
  return {
    pageUrl: BLOCKED_URL,
    rendered: {
      html: '<html><head><title>Example</title></head><body><h1>Example page</h1></body></html>',
      capturedAt: new Date(now).toISOString(), sinceLoadMs: 8000, readyState: 'complete',
      viewport: { width: innerWidth, height: innerHeight }, userAgent: navigator.userAgent,
    },
    initial: {
      kind: 'response', startedAt: new Date(now + 300).toISOString(), status: 403, contentType: 'text/html; charset=UTF-8',
      finalUrl: BLOCKED_URL, headers: { 'cf-mitigated': 'challenge', server: 'cloudflare' },
      body: '<html><head><title>Just a moment...</title></head><body></body></html>',
    },
    notes: ['Preview: a made-up blocked fetch shaped like a Cloudflare challenge, not a capture. Every value is a preview value.'],
  };
}

async function fixtureCapture(): Promise<RawCapture> {
  const [notesMd, initialSnapshot, renderedSnapshot] = await Promise.all([file('NOTES.md'), file('initial.html'), file('rendered.html')]);
  const notes = parseNotes(notesMd);
  const previewed: string[] = [];
  const orPreviewValue = <T,>(value: T | undefined, fallback: T, label: string): T => {
    if (value !== undefined) return value;
    previewed.push(label);
    return fallback;
  };
  const now = new Date().toISOString();
  const initial: InitialFetch = {
    kind: 'response', startedAt: orPreviewValue(notes.initialCapturedAt, now, 'initial capture time'),
    status: 200, contentType: 'text/html', finalUrl: notes.url, headers: {}, body: initialSnapshot,
  };
  return {
    pageUrl: notes.url,
    rendered: {
      html: renderedSnapshot,
      capturedAt: orPreviewValue(notes.renderedCapturedAt, now, 'rendered capture time'),
      sinceLoadMs: orPreviewValue(notes.waitSeconds, 10, 'time since load') * 1000,
      readyState: orPreviewValue(notes.readyState, 'complete', 'readyState'),
      viewport: orPreviewValue(notes.viewport, { width: innerWidth, height: innerHeight }, 'viewport'),
      userAgent: orPreviewValue(notes.userAgent, navigator.userAgent, 'user agent'),
    },
    initial,
    notes: [
      `Preview: the fixture pair ${fixture}, not a capture. Its conditions come from its NOTES.md, where the time since load is the wait it records, and the initial snapshot was fetched with curl.`,
      ...(previewed.length ? [`Preview values, not in its NOTES.md: ${previewed.join(', ')}.`] : []),
    ],
  };
}

async function sendMessage(message: CompareRequest | TakeRequest): Promise<CompareResponse | TakeResponse> {
  if (message.type === 'scuttle:compare') {
    await stub.tabs.create({ url: 'report.html#preview' });
    return { ok: true };
  }
  return fixture === BLOCKED ? blockedExample() : fixtureCapture();
}

const stub = {
  tabs: {
    query: async () => [{ id: TAB_ID, index: 0, url: await tabUrl() }],
    // One window stands in for the tabs: the report replaces the popup, keeping the fixture.
    create: async ({ url }: { url: string }) => {
      const next = new URL(url, location.href);
      next.search = location.search;
      location.assign(next);
      return { id: TAB_ID + 1 };
    },
  },
  runtime: { sendMessage },
};

(globalThis as unknown as { chrome: typeof stub }).chrome = stub;
