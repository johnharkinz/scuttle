// Reads the capture conditions a fixture's NOTES.md records, for the preview's stub capture.

export type FixtureNotes = {
  url: string;
  initialCapturedAt?: string;
  renderedCapturedAt?: string;
  userAgent?: string;
  waitSeconds?: number;
  readyState?: string;
  viewport?: { width: number; height: number };
};

/** The initial and rendered cells of a `| Label | initial | rendered |` row. */
function row(md: string, label: string): [string, string] | undefined {
  const cells = new RegExp(`^\\| ${label} \\|(.*)$`, 'm').exec(md)?.[1].split('|').map(c => c.trim());
  return cells && [cells[0], cells[1]];
}
const code = (cell: string) => /`([^`]+)`/.exec(cell)?.[1];

/** NOTES.md → what it states about the capture. What it doesn't state is left out. */
export function parseNotes(md: string): FixtureNotes {
  const url = /^\*\*URL:\*\*\s*(\S+)/m.exec(md)?.[1];
  if (!url) throw new Error('NOTES.md has no **URL:** line');
  const notes: FixtureNotes = { url };

  const captured = row(md, 'Captured \\(UTC\\)');
  if (captured) [notes.initialCapturedAt, notes.renderedCapturedAt] = captured;

  // The rendered cell names its own user agent unless it says it's the same as the initial one.
  const ua = row(md, 'User agent');
  const userAgent = ua && (/same/i.test(ua[1]) ? code(ua[0]) : (code(ua[1]) ?? code(ua[0])));
  if (userAgent) notes.userAgent = userAgent;

  const wait = row(md, 'Wait')?.[1] ?? '';
  const seconds = /(\d+(?:\.\d+)?) seconds/.exec(wait)?.[1];
  if (seconds) notes.waitSeconds = Number(seconds);
  const readyState = /`readyState` was `(\w+)`/.exec(wait)?.[1];
  if (readyState) notes.readyState = readyState;

  const viewport = /(\d+)×(\d+)/.exec(row(md, 'Viewport')?.[1] ?? '');
  if (viewport) notes.viewport = { width: Number(viewport[1]), height: Number(viewport[2]) };
  return notes;
}
