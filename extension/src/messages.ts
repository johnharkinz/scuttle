import type { RawCapture } from './core.ts';

// The pages talk to the capture layer only through these messages and chrome.tabs.query.
// In the extension the service worker answers them; in the preview a stub does.

/** Popup → capture layer: capture this tab, then open the report. */
export type CompareRequest = { type: 'scuttle:compare'; tabId: number };
export type CompareResponse = { ok: true } | { ok: false; error: string };

/** Report page → capture layer: hand over the capture for this report, once. */
export type TakeRequest = { type: 'scuttle:take'; token: string };
export type TakeResponse = RawCapture | null;
