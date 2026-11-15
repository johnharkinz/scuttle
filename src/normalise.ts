// Comparison keys only. Snapshots keep original values (spec §4).

// JavaScript's \s, minus U+FEFF: zero-width characters are kept (spec §4).
const WHITESPACE = /[\t\n\v\f\r \u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+/g;
const EDGES = new RegExp(`^${WHITESPACE.source}|${WHITESPACE.source}$`, 'g');

/** Collapse every run of whitespace, including non-breaking spaces, to one space and trim. */
export const collapse = (s: string): string => s.replace(WHITESPACE, ' ').replace(EDGES, '');

/** Text key for text blocks, title and description. */
export const textKey = (s: string): string => collapse(s).toLowerCase();

/** Link key: the resolved URL with the fragment removed. The URL parser lowercases scheme and host. */
export function linkKey(url: string): string {
  const u = new URL(url);
  u.hash = '';
  return u.href;
}
