import { describe, expect, it } from 'vitest';
import type { Finding } from '../src/compare.ts';
import { renderReport } from '../src/report.ts';

const URL_ = 'https://mens-scalp-expert.lovable.app/';

describe('renderReport', () => {
  it('prints the summary table and "No differences found." when there are no findings', () => {
    expect(renderReport('control', URL_, [])).toBe(
      `# Scuttle: control

${URL_}

| | Only in initial | Only after rendering | Changed |
|---|---|---|---|
| Title | 0 | 0 | 0 |
| Meta description | 0 | 0 | 0 |
| Links | 0 | 0 | — |
| Text blocks | 0 | 0 | — |

No differences found.
`,
    );
  });

  it('lists every finding in groups, leaving out empty groups and landmarks that are absent', () => {
    const findings: Finding[] = [
      { category: 'title', direction: 'changed', initial: 'Lovable App', rendered: 'Barbearia' },
      { category: 'description', direction: 'only in initial', initial: 'Cuts', rendered: null },
      { category: 'description', direction: 'only after rendering', initial: '', rendered: 'New' },
      { category: 'link', direction: 'only after rendering', url: 'https://www.fresha.com/book-now/x', scope: 'external', texts: ['Agendar Horário'], landmark: 'header' },
      { category: 'link', direction: 'only after rendering', url: 'tel:+351966616502', scope: 'external', texts: ['Marcar', '(+351) 966 616 502'] },
      { category: 'text', direction: 'only in initial', text: 'Loading…', kind: 'p' },
      { category: 'text', direction: 'only after rendering', text: 'Nossos Serviços', kind: 'h2', landmark: 'main' },
    ];
    expect(renderReport('gap', URL_, findings)).toBe(
      `# Scuttle: gap

${URL_}

| | Only in initial | Only after rendering | Changed |
|---|---|---|---|
| Title | 0 | 0 | 1 |
| Meta description | 1 | 1 | 0 |
| Links | 0 | 2 | — |
| Text blocks | 1 | 1 | — |

## Title: changed (1)

- “Lovable App” → “Barbearia”

## Meta description: only in initial (1)

- “Cuts” → (missing)

## Meta description: only after rendering (1)

- (empty) → “New”

## Links: only after rendering (2)

- https://www.fresha.com/book-now/x (external) — “Agendar Horário” · in header
- tel:+351966616502 (external) — “Marcar”, “(+351) 966 616 502”

## Text blocks: only in initial (1)

- “Loading…” (p)

## Text blocks: only after rendering (1)

- “Nossos Serviços” (h2) · in main
`,
    );
  });

  it('cuts text-block evidence at 160 characters with …, but never URLs or anchor text', () => {
    const long = 'a'.repeat(200);
    const report = renderReport('x', URL_, [
      { category: 'text', direction: 'only after rendering', text: long, kind: 'p' },
      { category: 'link', direction: 'only after rendering', url: `https://x.com/${long}`, scope: 'external', texts: [long] },
    ]);
    expect(report).toContain(`- “${'a'.repeat(160)}…” (p)\n`);
    expect(report).toContain(`- https://x.com/${long} (external) — “${long}”\n`);
  });

  it('does not cut text of exactly 160 characters', () => {
    const report = renderReport('x', URL_, [{ category: 'text', direction: 'only after rendering', text: 'b'.repeat(160), kind: 'p' }]);
    expect(report).toContain(`- “${'b'.repeat(160)}” (p)\n`);
  });
});
