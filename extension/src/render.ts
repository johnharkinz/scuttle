// Analysis → the report page's HTML. Plain and unstyled until camas-design has an agreed brief for it.
import type { Finding } from '../../src/compare.ts';
import { DIRECTION_HEADINGS, groupFindings, groupHeading, line } from '../../src/report.ts';
import type { Analysis, RawCapture } from './core.ts';

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s: string) => s.replace(/[&<>"']/g, c => ESCAPES[c]);

function findingsHtml(findings: Finding[]): string {
  const { summary, groups } = groupFindings(findings);
  const head = `<tr><th></th>${DIRECTION_HEADINGS.map(h => `<th>${h}</th>`).join('')}</tr>`;
  const rows = summary.map(({ label, counts }) => `<tr><th>${label}</th>${counts.map(c => `<td>${c ?? '—'}</td>`).join('')}</tr>`);
  const table = `<table>${head}${rows.join('')}</table>`;
  if (!findings.length) return `${table}<p>No differences found.</p>`;
  const sections = groups.map(
    ({ label, direction, items }) =>
      `<section><h2>${groupHeading(label, direction, items.length)}</h2><ul>${items.map(f => `<li>${esc(line(f))}</li>`).join('')}</ul></section>`,
  );
  return table + sections.join('');
}

const time = (iso: string) => iso.replace('T', ' ').replace('Z', ' UTC');
const seconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`;

function conditionsHtml({ pageUrl, rendered, initial, notes }: RawCapture): string {
  const finalUrl = initial.kind === 'error' ? 'None: the fetch failed' : initial.finalUrl === pageUrl ? 'Same as the page URL' : initial.finalUrl;
  const gap = Date.parse(initial.startedAt) - Date.parse(rendered.capturedAt);
  const rows: [string, string][] = [
    ['Page URL', pageUrl],
    ['Final URL after redirects', finalUrl],
    ['Rendered snapshot captured', `${time(rendered.capturedAt)}, ${rendered.sinceLoadMs === null ? 'before the page finished loading' : `${seconds(rendered.sinceLoadMs)} after the page loaded`}, readyState ${rendered.readyState}`],
    ['Initial snapshot fetched', `${time(initial.startedAt)}, ${seconds(Math.abs(gap))} ${gap < 0 ? 'before' : 'after'} the rendered snapshot`],
    ['Viewport', `${rendered.viewport.width}×${rendered.viewport.height}`],
    ['User agent', rendered.userAgent],
  ];
  const statements = [
    'Signed-in state and consent choices are not controlled. The rendered snapshot is the page as it was in your tab; the initial snapshot was fetched without cookies.',
    ...notes,
  ];
  return (
    `<section><h2>Capture conditions</h2><dl>${rows.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>` +
    `${statements.map(n => `<p>${esc(n)}</p>`).join('')}</section>`
  );
}

/** The report page's content: findings, or why there are none, then the capture conditions. */
export function renderReportHtml({ capture, result }: Analysis): string {
  const body =
    result.state === 'compared'
      ? findingsHtml(result.findings)
      : `<section><h2>Initial snapshot blocked</h2><p>${esc(result.reason)}</p><p>Scuttle can't compare this page, so there are no findings.</p></section>`;
  return body + conditionsHtml(capture);
}
