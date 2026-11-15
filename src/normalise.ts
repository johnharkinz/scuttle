// Comparison keys only. Snapshots keep original values (spec §4).

/** Collapse every run of whitespace, including non-breaking spaces, to one space and trim. */
export const collapse = (s: string): string => s.replace(/\s+/g, ' ').trim();

/** Text key for text blocks, title and description. */
export const textKey = (s: string): string => collapse(s).toLowerCase();

/** Link key: the resolved URL with the fragment removed. The URL parser lowercases scheme and host. */
export function linkKey(url: string): string {
  const u = new URL(url);
  u.hash = '';
  return u.href;
}
