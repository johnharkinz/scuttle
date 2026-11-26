import { describe, expect, it } from 'vitest';
import type { Analysis, RawCapture } from '../extension/src/core.ts';
import { lede, renderReportHtml } from '../extension/src/render.ts';

const PAGE = 'https://example.com/page';
const capture: RawCapture = {
  pageUrl: PAGE,
  rendered: { html: '', capturedAt: '2026-11-26T10:00:00.000Z', sinceLoadMs: 12_345, readyState: 'complete', viewport: { width: 1440, height: 900 }, userAgent: 'Mozilla/5.0 Test' },
  initial: { kind: 'response', startedAt: '2026-11-26T10:00:00.250Z', status: 200, contentType: 'text/html', finalUrl: PAGE, headers: {}, body: '' },
  notes: [],
};
const compared = (findings: Extract<Analysis['result'], { state: 'compared' }>['findings']): Analysis => ({ capture, result: { state: 'compared', findings } });
/** The page's text, one line per element or piece of evidence, so assertions read like the report. */
const text = (html: string) =>
  html.replace(/<\/(h\d|p|li|tr|dt|dd|caption)>|<br>|<\/span>(?=<span class="(?!quote-mark))/g, '\n').replace(/<\/t[hd]>/g, ' | ').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&')
    .split('\n').map(l => l.trim()).filter(Boolean);

describe('renderReportHtml', () => {
  it('shows the summary and each group of findings as the Markdown report words them', () => {
    const lines = text(renderReportHtml(compared([
      { category: 'title', direction: 'different with JavaScript', initial: 'Lovable App', rendered: 'Barbearia' },
      { category: 'link', direction: 'only with JavaScript', url: 'tel:+351966616502', scope: 'external', texts: ['Marcar'], landmark: 'header' },
      { category: 'text', direction: 'only without JavaScript', text: 'Loading…', kind: 'p' },
    ])));
    expect(lines).toEqual(expect.arrayContaining([
      '| Only without JavaScript | Only with JavaScript | Different with JavaScript |',
      'Title | 0 | 0 | 1 |',
      'Meta description | 0 | 0 | 0 |',
      'Links | 0 | 1 | — |',
      'Text blocks | 1 | 0 | — |',
      'Title: different with JavaScript (1)',
      'Without JavaScript', '“Lovable App”', 'With JavaScript', '“Barbearia”',
      'Links: only with JavaScript (1)',
      'tel:+351966616502', 'external · header', 'Anchor text: “Marcar”',
      'Text blocks: only without JavaScript (1)',
      '“Loading…”', 'p',
    ]));
    expect(lines.indexOf('Title: different with JavaScript (1)')).toBeLessThan(lines.indexOf('Links: only with JavaScript (1)'));
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
      'Captured with JavaScript',
      '2026-11-26 10:00:00.000 UTC', '12.3 s after the page loaded', 'readyState complete',
      'Fetched without JavaScript',
      '2026-11-26 10:00:00.250 UTC', '0.3 s after the capture with JavaScript',
      'Viewport',
      '1440×900',
      'User agent',
      'Mozilla/5.0 Test',
      'Signed-in state and consent choices are not controlled. The page with JavaScript is your tab as it was; the page without JavaScript was fetched without cookies.',
      'Preview: viewport is a preview value.',
    ]));
  });

  it('shows the final URL as the same when the fetch was not redirected', () => {
    const lines = text(renderReportHtml(compared([])));
    expect(lines[lines.indexOf('Final URL after redirects') + 1]).toBe('Same as the page URL');
  });

  it('reports a blocked initial snapshot with its reason, and no findings', () => {
    const lines = text(renderReportHtml({ capture, result: { state: 'blocked', reason: 'The server responded with HTTP 403.' } }));
    expect(lines).toEqual(expect.arrayContaining(['Fetch without JavaScript blocked', 'The server responded with HTTP 403.', 'Capture conditions']));
    expect(lines.join('\n')).not.toMatch(/No differences found|Title \|/);
  });

  it('escapes page content in findings', () => {
    const html = renderReportHtml(compared([{ category: 'text', direction: 'only with JavaScript', text: '<img src=x onerror=alert(1)>', kind: 'p' }]));
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('words the gap the other way when the fetch without JavaScript came first', () => {
    const earlier: Analysis = { capture: { ...capture, initial: { ...capture.initial, startedAt: '2026-11-26T09:59:48.000Z' } as RawCapture['initial'] }, result: { state: 'compared', findings: [] } };
    expect(text(renderReportHtml(earlier))).toContain('12.0 s before the capture with JavaScript');
  });

  it('has no final URL when the fetch failed', () => {
    const failed: Analysis = { capture: { ...capture, initial: { kind: 'error', startedAt: capture.initial.startedAt, message: 'Failed to fetch' } }, result: { state: 'blocked', reason: 'The fetch failed: Failed to fetch.' } };
    const lines = text(renderReportHtml(failed));
    expect(lines[lines.indexOf('Final URL after redirects') + 1]).toBe('None: the fetch failed');
  });

  it('says so when the rendered snapshot was captured before the page finished loading', () => {
    const early: Analysis = { capture: { ...capture, rendered: { ...capture.rendered, sinceLoadMs: null, readyState: 'interactive' } }, result: { state: 'compared', findings: [] } };
    expect(text(renderReportHtml(early))).toEqual(expect.arrayContaining(['before the page finished loading', 'readyState interactive']));
  });

  it('explains what each group’s direction means, without judging it', () => {
    const lines = text(renderReportHtml(compared([{ category: 'text', direction: 'only with JavaScript', text: 'Book now', kind: 'h2' }])));
    expect(lines[lines.indexOf('Text blocks: only with JavaScript (1)') + 1]).toBe('JavaScript adds this text. The server doesn’t send it, so crawlers that don’t run JavaScript miss it.');
  });

  it('cuts long text blocks at 160 characters, as the Markdown report does', () => {
    const lines = text(renderReportHtml(compared([{ category: 'text', direction: 'only with JavaScript', text: 'x'.repeat(200), kind: 'p' }])));
    expect(lines).toContain(`“${'x'.repeat(160)}…”`);
  });
});

describe('lede', () => {
  type Finding = Parameters<typeof lede>[0][number];
  const link: Finding = { category: 'link', direction: 'only with JavaScript', url: 'https://example.com/', scope: 'internal', texts: ['Home'] };
  const block = (direction: 'only without JavaScript' | 'only with JavaScript'): Finding => ({ category: 'text', direction, text: 'T', kind: 'p' });

  it('gives the categories when every finding has one direction', () => {
    expect(lede([link, block('only with JavaScript'), block('only with JavaScript')]))
      .toBe('3 findings, all only with JavaScript: 1 link and 2 text blocks.');
  });

  it('gives the directions when there is more than one', () => {
    expect(lede([block('only without JavaScript'), block('only with JavaScript'), block('only with JavaScript')]))
      .toBe('3 findings: 1 only without JavaScript and 2 only with JavaScript.');
  });

  it('words a single finding in the singular', () => {
    expect(lede([block('only without JavaScript')])).toBe('1 finding, only without JavaScript: 1 text block.');
  });
});
