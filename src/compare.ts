import type { Landmark, PageSnapshot } from './extract.ts';
import { linkKey, textKey } from './normalise.ts';

export type Direction = 'only in initial' | 'only after rendering' | 'changed';
export type Finding =
  | { category: 'title' | 'description'; direction: Direction; initial: string | null; rendered: string | null }
  | { category: 'link'; direction: Direction; url: string; scope: 'internal' | 'external'; texts: string[]; landmark?: Landmark }
  | { category: 'text'; direction: Direction; text: string; kind: string; landmark?: Landmark };

/** Group items by key, keeping first-occurrence order. */
function byKey<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    map.set(k, [...(map.get(k) ?? []), item]);
  }
  return map;
}

/** Keys present in `from` but not in `to`, with every occurrence of each. */
function onlyIn<T>(from: Map<string, T[]>, to: Map<string, T[]>): T[][] {
  return [...from].filter(([k]) => !to.has(k)).map(([, items]) => items);
}

/** Both directions: what's only in initial, then what's only after rendering. */
function pairs<T>([initial, rendered]: T[]) {
  return [
    ['only in initial', initial, rendered],
    ['only after rendering', rendered, initial],
  ] as const;
}

/** Two PageSnapshots → Finding[], grouped by category then direction, each group in document order. */
export function compare(initial: PageSnapshot, rendered: PageSnapshot): Finding[] {
  const findings: Finding[] = [];

  for (const category of ['title', 'description'] as const) {
    const [a, b] = [initial[category], rendered[category]];
    const [ka, kb] = [a, b].map(v => (v === null ? '' : textKey(v)));
    if (ka === kb) continue; // same text, or no value in either
    const direction = !ka ? 'only after rendering' : !kb ? 'only in initial' : 'changed';
    findings.push({ category, direction, initial: a, rendered: b });
  }

  const links = [initial, rendered].map(s => byKey(s.links, l => linkKey(l.url)));
  for (const [direction, from, to] of pairs(links))
    for (const occurrences of onlyIn(from, to)) {
      const { url, scope, landmark } = occurrences[0];
      const texts = [...new Set(occurrences.map(l => l.text))];
      findings.push({ category: 'link', direction, url: linkKey(url), scope, texts, ...(landmark && { landmark }) });
    }

  const blocks = [initial, rendered].map(s => byKey(s.blocks, b => textKey(b.text)));
  for (const [direction, from, to] of pairs(blocks))
    for (const [{ kind, text, landmark }] of onlyIn(from, to))
      findings.push({ category: 'text', direction, text, kind, ...(landmark && { landmark }) });

  return findings;
}
