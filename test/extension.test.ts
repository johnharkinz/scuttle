import { describe, expect, it } from 'vitest';
import { analyse, type InitialFetch, type RawCapture } from '../extension/src/core.ts';
import { isSupported } from '../extension/src/supported.ts';

describe('isSupported', () => {
  it('accepts http and https pages, and refuses browser, file and blank pages', () => {
    expect(isSupported('https://example.com/a?b#c')).toBe(true);
    expect(isSupported('http://127.0.0.1:8080/')).toBe(true);
    for (const url of ['chrome://extensions/', 'file:///Users/x/page.html', 'about:blank', 'chrome-extension://abc/report.html', 'https://chromewebstore.google.com/detail/x', '', undefined])
      expect(isSupported(url), String(url)).toBe(false);
  });
});

const PAGE = 'https://example.com/page';
const html = (body: string) => `<html><head><title>T</title></head><body>${body}</body></html>`;
const capture = (initial: Partial<InitialFetch>, rendered = html('<p>Same</p><a href="/book">Book</a>')): RawCapture => ({
  pageUrl: PAGE,
  rendered: { html: rendered, capturedAt: '2026-11-26T10:00:00.000Z', sinceLoadMs: 12_000, readyState: 'complete', viewport: { width: 1440, height: 900 }, userAgent: 'UA' },
  initial: { kind: 'response', startedAt: '2026-11-26T10:00:00.250Z', status: 200, contentType: 'text/html; charset=utf-8', finalUrl: PAGE, headers: {}, body: html('<p>Same</p>'), ...initial } as InitialFetch,
  notes: [],
});

describe('analyse', () => {
  it('compares an HTML response with the rendered snapshot', () => {
    expect(analyse(capture({})).result).toEqual({
      state: 'compared',
      findings: [{ category: 'link', direction: 'only after rendering', url: 'https://example.com/book', scope: 'internal', texts: ['Book'] }],
    });
  });

  it('reports a non-2xx response as blocked, with its status', () => {
    expect(analyse(capture({ status: 403 })).result).toEqual({ state: 'blocked', reason: 'The server responded with HTTP 403.' });
    expect(analyse(capture({ status: 503 })).result).toEqual({ state: 'blocked', reason: 'The server responded with HTTP 503.' });
  });

  it('reports a response that is not HTML as blocked, with its content type', () => {
    expect(analyse(capture({ contentType: 'application/json' })).result).toEqual({ state: 'blocked', reason: 'The server sent application/json, not HTML.' });
    expect(analyse(capture({ contentType: null })).result).toEqual({ state: 'blocked', reason: 'The server sent no content type, not HTML.' });
    expect(analyse(capture({ contentType: 'application/xhtml+xml' })).result.state).toBe('compared');
    expect(analyse(capture({ contentType: 'TEXT/HTML' })).result.state).toBe('compared');
  });

  it('reports a fetch that failed as blocked, with the error', () => {
    const failed = { ...capture({}), initial: { kind: 'error', startedAt: '2026-11-26T10:00:00.250Z', message: 'Failed to fetch' } } as RawCapture;
    expect(analyse(failed).result).toEqual({ state: 'blocked', reason: 'The fetch failed: Failed to fetch.' });
  });

  it('resolves the initial snapshot against its final URL after redirects', () => {
    const redirected = capture(
      { finalUrl: 'https://example.com/en/page', body: html('<p>Same</p><a href="book">Book</a>') },
      html('<p>Same</p><a href="/en/book">Book</a>'),
    );
    expect(analyse(redirected).result).toEqual({ state: 'compared', findings: [] });
  });

  // Seen from the extension on boots.com (2026-11-26): HTTP 200, an x-iinfo header, and this page.
  it('reports an Imperva challenge page as blocked, though it came with HTTP 200', () => {
    const imperva = capture({
      status: 200,
      headers: { 'x-iinfo': '47-16059175-0 PNNN RT(1795713244354 145)' },
      body: '<html><head><title>Pardon Our Interruption</title></head><body><h1>Pardon Our Interruption</h1><script src="/_Incapsula_Resource?x=1"></script></body></html>',
    });
    expect(analyse(imperva).result).toEqual({ state: 'blocked', reason: 'Imperva returned a bot challenge (HTTP 200).' });
  });

  // Seen with curl on specsavers.co.uk and physiofirst.org.uk (2026-11-26): HTTP 403, cf-mitigated: challenge.
  it('names a Cloudflare challenge, recognised by its cf-mitigated header', () => {
    const challenge = capture({ status: 403, headers: { 'cf-mitigated': 'challenge', server: 'cloudflare' }, body: '<html><head><title>Just a moment...</title></head></html>' });
    expect(analyse(challenge).result).toEqual({ state: 'blocked', reason: 'Cloudflare returned a bot challenge (HTTP 403).' });
  });

  // Seen with curl on bupa.co.uk/dental (2026-11-26): HTTP 403, no cf-mitigated header.
  it('names a Cloudflare block page, recognised by its title', () => {
    const block = capture({ status: 403, headers: { server: 'cloudflare' }, body: '<html><head><title>Attention Required! | Cloudflare</title></head></html>' });
    expect(analyse(block).result).toEqual({ state: 'blocked', reason: 'Cloudflare blocked the request (HTTP 403).' });
  });
});
