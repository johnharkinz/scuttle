import type { Direction, Finding } from './compare.ts';

const CATEGORIES = [
  ['title', 'Title'],
  ['description', 'Meta description'],
  ['link', 'Links'],
  ['text', 'Text blocks'],
] as const;
const DIRECTIONS: Direction[] = ['only in initial', 'only after rendering', 'changed'];
const MAX_TEXT = 160;

const quote = (s: string) => `“${s}”`;
const metadata = (v: string | null) => (v === null ? '(missing)' : v === '' ? '(empty)' : quote(v));
const cut = (s: string) => {
  const chars = [...s];
  return chars.length > MAX_TEXT ? chars.slice(0, MAX_TEXT).join('') + '…' : s;
};

/** One finding as a line of evidence, as the report shows it. */
export function line(f: Finding): string {
  if ('initial' in f) return `${metadata(f.initial)} → ${metadata(f.rendered)}`;
  const where = f.landmark ? ` · in ${f.landmark}` : '';
  if (f.category === 'link') return `${f.url} (${f.scope}) — ${f.texts.map(quote).join(', ')}${where}`;
  return `${quote(cut(f.text))} (${f.kind})${where}`;
}

export const DIRECTION_HEADINGS = DIRECTIONS.map(d => d[0].toUpperCase() + d.slice(1));

/** A group's heading, such as “Links: only after rendering (3)”. */
export const groupHeading = (label: string, direction: Direction, count: number) => `${label}: ${direction} (${count})`;

/**
 * The report's structure: one summary row per category, with counts by direction
 * (`null` where a direction can't apply), and the non-empty groups in report order.
 */
export function groupFindings(findings: Finding[]) {
  const group = (category: string, direction: Direction) =>
    findings.filter(f => f.category === category && f.direction === direction);

  const summary = CATEGORIES.map(([category, label]) => {
    const isMetadata = category === 'title' || category === 'description';
    const counts = DIRECTIONS.map(d => (d === 'changed' && !isMetadata ? null : group(category, d).length));
    return { label, counts };
  });
  const groups = CATEGORIES.flatMap(([category, label]) =>
    DIRECTIONS.map(direction => ({ label, direction, items: group(category, direction) })),
  ).filter(g => g.items.length);
  return { summary, groups };
}

/** Finding[] → Markdown report: summary table, then every finding by category and direction. */
export function renderReport(name: string, url: string, findings: Finding[]): string {
  const { summary, groups } = groupFindings(findings);

  const rows = summary.map(({ label, counts }) => `| ${label} | ${counts.map(c => c ?? '—').join(' | ')} |`);
  const table = [`| | ${DIRECTION_HEADINGS.join(' | ')} |`, '|---|---|---|---|', ...rows].join('\n');

  const sections = groups
    .map(({ label, direction, items }) => `## ${groupHeading(label, direction, items.length)}\n\n${items.map(f => `- ${line(f)}`).join('\n')}\n\n`)
    .join('');

  const body = findings.length ? sections.trimEnd() : 'No differences found.';
  return `# Scuttle: ${name}\n\n${url}\n\n${table}\n\n${body}\n`;
}
