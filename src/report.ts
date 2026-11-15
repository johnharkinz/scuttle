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

function line(f: Finding): string {
  if ('initial' in f) return `${metadata(f.initial)} → ${metadata(f.rendered)}`;
  const where = f.landmark ? ` · in ${f.landmark}` : '';
  if (f.category === 'link') return `${f.url} (${f.scope}) — ${f.texts.map(quote).join(', ')}${where}`;
  return `${quote(cut(f.text))} (${f.kind})${where}`;
}

/** Finding[] → Markdown report: summary table, then every finding by category and direction. */
export function renderReport(name: string, url: string, findings: Finding[]): string {
  const group = (category: string, direction: Direction) =>
    findings.filter(f => f.category === category && f.direction === direction);

  const rows = CATEGORIES.map(([category, label]) => {
    const [initial, rendered, changed] = DIRECTIONS.map(d => group(category, d).length);
    const isMetadata = category === 'title' || category === 'description';
    return `| ${label} | ${initial} | ${rendered} | ${isMetadata ? changed : '—'} |`;
  });
  const table = ['| | Only in initial | Only after rendering | Changed |', '|---|---|---|---|', ...rows].join('\n');

  const sections = CATEGORIES.flatMap(([category, label]) =>
    DIRECTIONS.map(direction => {
      const items = group(category, direction);
      if (!items.length) return '';
      return `## ${label}: ${direction} (${items.length})\n\n${items.map(f => `- ${line(f)}`).join('\n')}\n\n`;
    }),
  ).join('');

  const body = findings.length ? sections.trimEnd() : 'No differences found.';
  return `# Scuttle: ${name}\n\n${url}\n\n${table}\n\n${body}\n`;
}
