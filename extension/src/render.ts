// Analysis → the report page's HTML, as camas-design DEC-006 lays it out. Groups, their headings and
// their order are the CLI report's (src/report.ts); only the presentation differs.
import type { Direction, Finding } from '../../src/compare.ts';
import { DIRECTION_HEADINGS, groupFindings, groupHeading } from '../../src/report.ts';
import type { Analysis, RawCapture } from './core.ts';

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s: string) => s.replace(/[&<>"']/g, c => ESCAPES[c]);

const DIRECTIONS: Direction[] = ['only without JavaScript', 'only with JavaScript', 'different with JavaScript'];
const MAX_TEXT = 160;
const cut = (s: string) => {
  const chars = [...s];
  return chars.length > MAX_TEXT ? chars.slice(0, MAX_TEXT).join('') + '…' : s;
};

/**
 * A direction marker: the mark's wing cases, in ink (DEC-006). Outlined is only without JavaScript, solid is
 * only with JavaScript, and the pair is different with JavaScript. Decorative: the direction's words always sit beside it.
 */
export function directionMarker(direction: Direction, height = 14): string {
  const w = Math.round((height * 4) / 7);
  const gap = 2;
  const outline = `<rect x=".75" y=".75" width="${w - 1.5}" height="${height - 1.5}" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
  const solid = (x: number) => `<rect x="${x}" y="0" width="${w}" height="${height}" fill="currentColor"/>`;
  const [width, shapes] =
    direction === 'different with JavaScript' ? [2 * w + gap, outline + solid(w + gap)] : direction === 'only without JavaScript' ? [w, outline] : [w, solid(0)];
  return `<svg class="direction" aria-hidden="true" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${shapes}</svg>`;
}

// What each group's direction means. Never whether it matters: Scuttle doesn't judge findings.
const GROUP_EXPLANATIONS: Record<string, string> = {
  'title|only without JavaScript': 'The server sends this title, and JavaScript removes it. Only crawlers that don’t run JavaScript see it.',
  'title|only with JavaScript': 'The server sends no title. JavaScript adds this one, so crawlers that don’t run JavaScript miss it.',
  'title|different with JavaScript': 'The server sends one title, and JavaScript replaces it. Crawlers see one or the other, depending on whether they run JavaScript.',
  'description|only without JavaScript': 'The server sends this meta description, and JavaScript removes it. Only crawlers that don’t run JavaScript see it.',
  'description|only with JavaScript': 'The server sends no meta description. JavaScript adds this one, so crawlers that don’t run JavaScript miss it.',
  'description|different with JavaScript': 'The server sends one meta description, and JavaScript replaces it. Crawlers see one or the other, depending on whether they run JavaScript.',
  'link|only without JavaScript': 'The server sends these links, and JavaScript removes or replaces them. Only crawlers that don’t run JavaScript see them.',
  'link|only with JavaScript': 'JavaScript adds these links. The server doesn’t send them, so crawlers that don’t run JavaScript miss them.',
  'text|only without JavaScript': 'The server sends this text, and JavaScript removes or replaces it. Only crawlers that don’t run JavaScript see it.',
  'text|only with JavaScript': 'JavaScript adds this text. The server doesn’t send it, so crawlers that don’t run JavaScript miss it.',
};

const FINDINGS_EXPLAINED =
  'Each finding is something the page has only with JavaScript, only without it, or differently with it. Whatever is only with JavaScript isn’t in what the server sends, so crawlers that don’t run JavaScript miss it. Scuttle doesn’t judge whether a finding matters, or know which crawlers run JavaScript.';

/** The report's opening line: counts by direction, and by category when there's only one direction. */
export function lede(findings: Finding[]): string {
  const n = findings.length;
  const directions = DIRECTIONS.map(d => [findings.filter(f => f.direction === d).length, d] as const).filter(([k]) => k);
  if (directions.length > 1) {
    const parts = directions.map(([k, d]) => `${k} ${d}`);
    return `${n} findings: ${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}.`;
  }
  const { summary } = groupFindings(findings);
  const categories = summary
    .map(({ label, counts }) => [counts.reduce<number>((a, c) => a + (c ?? 0), 0), label.toLowerCase()] as const)
    .filter(([k]) => k)
    .map(([k, label]) => `${k} ${k === 1 ? label.replace(/s$/, '') : label}`);
  const all = n === 1 ? `1 finding, ${directions[0][1]}` : `${n} findings, all ${directions[0][1]}`;
  return `${all}: ${categories.join(' and ')}.`;
}

// ---------- evidence ----------

const quoted = (s: string) => `<span class="quote-mark">“</span>${esc(s)}<span class="quote-mark">”</span>`;
const metadata = (v: string | null) => (v === null ? '(missing)' : v === '' ? '(empty)' : quoted(v));

function findingHtml(f: Finding): string {
  if ('initial' in f) {
    return (
      `<li><div class="values">` +
      `<span class="label">${directionMarker('only without JavaScript', 11)}Without JavaScript</span><span class="quote">${metadata(f.initial)}</span>` +
      `<span class="label">${directionMarker('only with JavaScript', 11)}With JavaScript</span><span class="quote">${metadata(f.rendered)}</span>` +
      `</div></li>`
    );
  }
  const landmark = f.landmark ? ` · ${f.landmark}` : '';
  if (f.category === 'link') {
    const n = f.texts.length;
    return (
      `<li><span class="link-url">${esc(f.url)}</span><span class="evidence">${f.scope}${landmark}</span>` +
      `<span class="anchors"><b>${n === 1 ? 'Anchor text' : `${n} anchor texts`}:</b> ${f.texts.map(quoted).join(', ')}</span></li>`
    );
  }
  return `<li class="text"><span class="quote">${quoted(cut(f.text))}</span><span class="evidence">${esc(f.kind)}${landmark}</span></li>`;
}

// ---------- summary ----------

const groupId = (category: string, direction: Direction) => `${category}-${direction.replaceAll(' ', '-')}`;

function summaryHtml(findings: Finding[]): string {
  const { summary } = groupFindings(findings);
  const head = `<tr><td></td>${DIRECTIONS.map((d, i) => `<th scope="col">${directionMarker(d)}${DIRECTION_HEADINGS[i]}</th>`).join('')}</tr>`;
  const rows = summary.map(({ category, label, counts }) => {
    const cells = counts.map((c, i) =>
      c === null ? '<td class="none">—</td>' : c === 0 ? '<td class="none">0</td>' : `<td><a href="#${groupId(category, DIRECTIONS[i])}">${c}</a></td>`,
    );
    return `<tr><th scope="row">${label}</th>${cells.join('')}</tr>`;
  });
  return `<table class="summary"><thead>${head}</thead><tbody>${rows.join('')}</tbody></table>`;
}

function groupsHtml(findings: Finding[]): string {
  return groupFindings(findings)
    .groups.map(
      ({ category, label, direction, items }) =>
        `<section class="group" id="${groupId(category, direction)}">` +
        `<div class="group-head">${directionMarker(direction, 16)}<h2>${groupHeading(label, direction, items.length)}</h2></div>` +
        `<p class="group-explain">${GROUP_EXPLANATIONS[`${category}|${direction}`]}</p>` +
        `<ul class="findings inset">${items.map(findingHtml).join('')}</ul></section>`,
    )
    .join('');
}

// ---------- capture conditions ----------

const time = (iso: string) => iso.replace('T', ' ').replace('Z', ' UTC');
const seconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`;
const plain = (s: string) => `<span class="plain">${esc(s)}</span>`;
const gapMs = ({ initial, rendered }: RawCapture) => Date.parse(initial.startedAt) - Date.parse(rendered.capturedAt);

function conditionsHtml(capture: RawCapture): string {
  const { pageUrl, rendered, initial, notes } = capture;
  const finalUrl =
    initial.kind === 'error' ? plain('None: the fetch failed') : initial.finalUrl === pageUrl ? plain('Same as the page URL') : esc(initial.finalUrl);
  const gap = gapMs(capture);
  const sinceLoad = rendered.sinceLoadMs === null ? 'before the page finished loading' : `${seconds(rendered.sinceLoadMs)} after the page loaded`;
  const rows: [string, string][] = [
    ['Page URL', esc(pageUrl)],
    ['Final URL after redirects', finalUrl],
    ['Captured with JavaScript', `${time(rendered.capturedAt)}<br>${plain(sinceLoad)}<br>readyState ${esc(rendered.readyState)}`],
    ['Fetched without JavaScript', `${time(initial.startedAt)}<br>${plain(`${seconds(Math.abs(gap))} ${gap < 0 ? 'before' : 'after'} the capture with JavaScript`)}`],
    ['Viewport', `${rendered.viewport.width}×${rendered.viewport.height}`],
    ['User agent', esc(rendered.userAgent)],
  ];
  const statements = [
    'Signed-in state and consent choices are not controlled. The page with JavaScript is your tab as it was; the page without JavaScript was fetched without cookies.',
    ...notes,
  ];
  return (
    `<section class="conditions" id="capture-conditions"><h2>Capture conditions</h2>` +
    `<div class="inset"><dl>${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl></div>` +
    `${statements.map(s => `<p class="statement">${esc(s)}</p>`).join('')}</section>`
  );
}

/** On a narrow window the full conditions move to the end, so a line of the key ones sits under the summary. */
function keyConditionsHtml(capture: RawCapture): string {
  const { rendered } = capture;
  return (
    `<p class="key-conditions"><span>Captured <span class="mono">${time(rendered.capturedAt.slice(0, 16) + 'Z')}</span></span>` +
    `<span>${seconds(Math.abs(gapMs(capture)))} apart</span><span>readyState <span class="mono">${esc(rendered.readyState)}</span></span>` +
    `<a href="#capture-conditions">All capture conditions</a></p>`
  );
}

// ---------- the page ----------

const BLOCKED_EXPLAINED =
  'This is a limit of fetching the page fresh, without cookies. It isn’t something you did wrong, and it doesn’t mean the page is broken.';

/** The report page's content: the page compared, then findings or why there are none, then the capture conditions. */
export function renderReportHtml({ capture, result }: Analysis): string {
  let head = `<p class="kicker">Compared</p><h1 class="page-url">${esc(capture.pageUrl)}</h1>`;
  let main: string;
  if (result.state === 'blocked') {
    main =
      `<div class="blocked"><span class="watch" aria-hidden="true"></span><div>` +
      `<h2>Fetch without JavaScript blocked</h2><p class="reason">${esc(result.reason)}</p>` +
      `<p>Scuttle fetched this page without cookies and got something other than the page, so there’s nothing to compare it with. There are no findings.</p>` +
      `<p class="explain">${BLOCKED_EXPLAINED}</p></div></div>`;
  } else if (!result.findings.length) {
    head +=
      `<p class="lede">No differences found.</p>` +
      `<p class="explain">The title, meta description, links and text blocks are the same with and without JavaScript. That covers only what Scuttle compares, under the conditions it was captured in.</p>`;
    main = summaryHtml([]) + keyConditionsHtml(capture);
  } else {
    head += `<p class="lede">${lede(result.findings)}</p><p class="explain">${FINDINGS_EXPLAINED}</p>`;
    main = summaryHtml(result.findings) + keyConditionsHtml(capture) + groupsHtml(result.findings);
  }
  return `<div class="report-head">${head}</div><div class="report-main">${main}</div>${conditionsHtml(capture)}`;
}

/** Shown when the report tab is reloaded: Scuttle keeps nothing, so the capture is gone. */
export const NO_LONGER_AVAILABLE =
  '<div class="message"><h1>This report is no longer available</h1>' +
  '<p>Scuttle doesn’t keep reports, so a report ends when its tab is reloaded or closed.</p>' +
  '<p>To compare again, go back to the page, open Scuttle from the toolbar and click <i>Compare this page</i>.</p></div>';
