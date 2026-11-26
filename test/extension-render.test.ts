import { describe, expect, it } from 'vitest';
import type { Analysis, RawCapture } from '../extension/src/core.ts';
import { renderReportHtml } from '../extension/src/render.ts';

const PAGE = 'https://example.com/page';
const capture: RawCapture = {
  pageUrl: PAGE,
  rendered: { html: '', capturedAt: '2026-11-26T10:00:00.000Z', sinceLoadMs: 12_345, readyState: 'complete', viewport: { width: 1440, height: 900 }, userAgent: 'Mozilla/5.0 Test' },
  initial: { kind: 'response', startedAt: '2026-11-26T10:00:00.250Z', status: 200, contentType: 'text/html', finalUrl: PAGE, headers: {}, body: '' },
  notes: [],
};
const compared = (findings: Extract<Analysis['result'], { state: 'compared' }>['findings']): Analysis => ({ capture, result: { state: 'compared', findings } });
/** The page's text, one line per element, so assertions read like the report. */
const text = (html: string) =>
  html.replace(/<\/(h\d|p|li|tr|dt|dd|caption)>/g, '\n').replace(/<\/t[hd]>/g, ' | ').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&')
    .split('\n').map(l => l.trim()).filter(Boolean);

describe('renderReportHtml', () => {
  it('shows the summary and each group of findings as the Markdown report words them', () => {
    const lines = text(renderReportHtml(compared([
      { category: 'title', direction: 'changed', initial: 'Lovable App', rendered: 'Barbearia' },
      { category: 'link', direction: 'only after rendering', url: 'tel:+351966616502', scope: 'external', texts: ['Marcar'], landmark: 'header' },
      { category: 'text', direction: 'only in initial', text: 'Loading…', kind: 'p' },
    ])));
    expect(lines).toEqual(expect.arrayContaining([
      '| Only in initial | Only after rendering | Changed |',
      'Title | 0 | 0 | 1 |',
      'Meta description | 0 | 0 | 0 |',
      'Links | 0 | 1 | — |',
      'Text blocks | 1 | 0 | — |',
      'Title: changed (1)',
      '“Lovable App” → “Barbearia”',
      'Links: only after rendering (1)',
      'tel:+351966616502 (external) — “Marcar” · in header',
      'Text blocks: only in initial (1)',
      '“Loading…” (p)',
    ]));
    expect(lines.indexOf('Title: changed (1)')).toBeLessThan(lines.indexOf('Links: only after rendering (1)'));
    expect(lines).not.toContain('No differences found.');
  });

  it('says so when there are no findings', () => {
    expect(text(renderReportHtml(compared([])))).toContain('No differences found.');
  });

  it('states the capture conditions, and that signed-in state and consent are not controlled', () => {
    const redirected: Analysis = {
      capture: { ...capture, initial: { ...capture.initial, finalUrl: 'https://example.com/en/page' } as RawCapture['initial'], notes: ['Preview: viewport is a preview value.'] },
      result: { state: 'compared', findings: [] },
    };
    expect(text(renderReportHtml(redirected))).toEqual(expect.arrayContaining([
      'Page URL',
      PAGE,
      'Final URL after redirects',
      'https://example.com/en/page',
      'Rendered snapshot captured',
      '2026-11-26 10:00:00.000 UTC, 12.3 s after the page loaded, readyState complete',
      'Initial snapshot fetched',
      '2026-11-26 10:00:00.250 UTC, 0.3 s after the rendered snapshot',
      'Viewport',
      '1440×900',
      'User agent',
      'Mozilla/5.0 Test',
      'Signed-in state and consent choices are not controlled. The rendered snapshot is the page as it was in your tab; the initial snapshot was fetched without cookies.',
      'Preview: viewport is a preview value.',
    ]));
  });

  it('shows the final URL as the same when the fetch was not redirected', () => {
    const lines = text(renderReportHtml(compared([])));
    expect(lines[lines.indexOf('Final URL after redirects') + 1]).toBe('Same as the page URL');
  });

  it('reports a blocked initial snapshot with its reason, and no findings', () => {
    const lines = text(renderReportHtml({ capture, result: { state: 'blocked', reason: 'The server responded with HTTP 403.' } }));
    expect(lines).toEqual(expect.arrayContaining(['Initial snapshot blocked', 'The server responded with HTTP 403.', 'Capture conditions']));
    expect(lines.join('\n')).not.toMatch(/No differences found|Title \|/);
  });

  it('escapes page content in findings', () => {
    const html = renderReportHtml(compared([{ category: 'text', direction: 'only after rendering', text: '<img src=x onerror=alert(1)>', kind: 'p' }]));
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('words the gap the other way when the initial snapshot came first', () => {
    const earlier: Analysis = { capture: { ...capture, initial: { ...capture.initial, startedAt: '2026-11-26T09:59:48.000Z' } as RawCapture['initial'] }, result: { state: 'compared', findings: [] } };
    expect(text(renderReportHtml(earlier))).toContain('2026-11-26 09:59:48.000 UTC, 12.0 s before the rendered snapshot');
  });

  it('has no final URL when the fetch failed', () => {
    const failed: Analysis = { capture: { ...capture, initial: { kind: 'error', startedAt: capture.initial.startedAt, message: 'Failed to fetch' } }, result: { state: 'blocked', reason: 'The fetch failed: Failed to fetch.' } };
    const lines = text(renderReportHtml(failed));
    expect(lines[lines.indexOf('Final URL after redirects') + 1]).toBe('None: the fetch failed');
  });

  it('says so when the rendered snapshot was captured before the page finished loading', () => {
    const early: Analysis = { capture: { ...capture, rendered: { ...capture.rendered, sinceLoadMs: null, readyState: 'interactive' } }, result: { state: 'compared', findings: [] } };
    expect(text(renderReportHtml(early))).toContain('2026-11-26 10:00:00.000 UTC, before the page finished loading, readyState interactive');
  });
});
