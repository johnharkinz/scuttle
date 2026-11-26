import { describe, expect, it } from 'vitest';
import { parseNotes } from '../extension/preview/notes.ts';

const ROUND_2 = `# gap-dentrw

**Role:** Gap case
**URL:** https://dentrw.vercel.app/

| | Initial snapshot | Rendered snapshot |
|---|---|---|
| Captured (UTC) | 2026-11-26T16:15:07Z | 2026-11-26T16:15:19Z |
| User agent | \`Mozilla/5.0 Chrome/158.0.0.0 Safari/537.36\` | Same, set by emulation (overrides the default \`HeadlessChrome/158\` string) |
| Wait | n/a | 10 seconds after navigation finished (\`readyState\` was \`complete\`); no scrolling, clicking or consent interaction |
| Viewport | n/a | 1440×900 (emulated) |
`;

const V1 = `**URL:** https://www.visionexpress.com/eye-test

| Captured (UTC) | 2026-11-15T21:23:23Z | 2026-11-15T21:29:41Z |
| User agent | \`Mozilla/5.0 Chrome/157.0.0.0 Safari/537.36\` | Chrome 157's own (same reduced UA string) |
| Wait | n/a | ~10 seconds after the page looked finished; no scrolling, clicking or consent interaction |
| Viewport | n/a | Default window size |
`;

describe('parseNotes', () => {
  it('reads the URL, capture times, user agent, wait, readyState and viewport from a round-2 NOTES.md', () => {
    expect(parseNotes(ROUND_2)).toEqual({
      url: 'https://dentrw.vercel.app/',
      initialCapturedAt: '2026-11-26T16:15:07Z',
      renderedCapturedAt: '2026-11-26T16:15:19Z',
      userAgent: 'Mozilla/5.0 Chrome/158.0.0.0 Safari/537.36',
      waitSeconds: 10,
      readyState: 'complete',
      viewport: { width: 1440, height: 900 },
    });
  });

  it('leaves out what a v1 NOTES.md does not state', () => {
    expect(parseNotes(V1)).toEqual({
      url: 'https://www.visionexpress.com/eye-test',
      initialCapturedAt: '2026-11-15T21:23:23Z',
      renderedCapturedAt: '2026-11-15T21:29:41Z',
      userAgent: 'Mozilla/5.0 Chrome/157.0.0.0 Safari/537.36',
      waitSeconds: 10,
    });
  });
});
