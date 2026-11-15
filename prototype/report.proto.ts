// PROTOTYPE — throwaway. Answers: what does a finding look like, and how is
// the report laid out? Lives on the prototype/report branch only.
//
// Run:  npm run proto:report -- <fixture-substring> [flags]
//   --variant=a|b|c   a: grouped lists · b: tables · c: summary first, capped lists
//   --context         add the nearest heading above each text block / the
//                     landmark (nav, header, footer, main, aside) around each link
//   --cap=N           variant c: items shown per group (default 8)
//   --json            print the Finding[] instead of a report
//   --meta-demo       run made-up title/description pairs instead of a fixture

import * as cheerio from 'cheerio';
import type { AnyNode, Element } from 'domhandler';
import fs from 'node:fs';

const argv = process.argv.slice(2);
const flags = Object.fromEntries(argv.filter(a => a.startsWith('--')).map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? 'true']; }));
const positional = argv.filter(a => !a.startsWith('--'));
const variant = flags.variant ?? 'a';
const withContext = flags.context === 'true';
const cap = Number(flags.cap ?? 8);

// ── Finding shape ──────────────────────────────────────────────────────────
type Direction = 'only in initial' | 'only after rendering' | 'changed';
type Finding =
  | { category: 'title' | 'description'; direction: Direction; initial: string | null; rendered: string | null }
  | { category: 'link'; direction: Direction; url: string; scope: 'internal' | 'external'; texts: string[]; context?: string }
  | { category: 'text'; direction: Direction; text: string; kind: string; context?: string };

// ── Extraction (decisions from the link and text-block tickets) ────────────
const BLOCK = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'td', 'th', 'dt', 'dd', 'blockquote', 'figcaption', 'caption']);
const SKIP = new Set(['script', 'style', 'template', 'noscript', 'svg', 'head']);
const LANDMARK = new Set(['nav', 'header', 'footer', 'main', 'aside']);
const collapse = (s: string) => s.replace(/\s+/g, ' ').trim();
const norm = (s: string) => collapse(s).toLowerCase();

type Snapshot = {
  title: string | null; // null = no <title> in <head>
  description: string | null; // null = no meta description
  blocks: { kind: string; text: string; context?: string }[];
  links: { url: string; scope: 'internal' | 'external'; text: string; context?: string }[];
};

function extract(html: string, pageUrl: string): Snapshot {
  const $ = cheerio.load(html);
  const titleEl = $('head > title').first();
  const descEl = $('meta[name="description" i]').first();
  const page = new URL(pageUrl);
  const host = (h: string) => h.toLowerCase().replace(/^www\./, '');

  const blocks: Snapshot['blocks'] = [];
  const links: Snapshot['links'] = [];
  let lastHeading: string | undefined;

  const walk = (node: AnyNode, block: { kind: string; parts: string[] } | null, landmark?: string) => {
    if (node.type === 'text') { if (block) block.parts.push((node as any).data); return; }
    if (node.type !== 'tag') return;
    const el = node as Element;
    if (SKIP.has(el.name)) return;
    const lm = LANDMARK.has(el.name) ? el.name : landmark;

    if (el.name === 'a' && el.attribs.href !== undefined) {
      const href = el.attribs.href.trim();
      if (href && !href.startsWith('#')) {
        try {
          const u = new URL(href, page);
          if (['http:', 'https:', 'tel:', 'mailto:'].includes(u.protocol)) {
            u.hash = '';
            const $a = $(el);
            const text = collapse($a.text()) || el.attribs['aria-label'] || $a.find('img[alt]').attr('alt') || el.attribs.title || '(no text)';
            const scope = u.protocol.startsWith('http') && host(u.hostname) === host(page.hostname) ? 'internal' : 'external';
            links.push({ url: u.href, scope, text: collapse(text), context: lm });
          }
        } catch { /* unparsable href: skipped */ }
      }
    }

    let own = block;
    if (BLOCK.has(el.name)) own = { kind: el.name, parts: [] };
    for (const c of el.children) walk(c, own, lm);
    if (own && own !== block) {
      const text = collapse(own.parts.join(' '));
      if (text) {
        blocks.push({ kind: el.name, text, context: /^h[1-6]$/.test(el.name) ? lm : lastHeading });
        if (/^h[1-6]$/.test(el.name)) lastHeading = text;
      }
    }
  };
  const body = $('body')[0];
  if (body) for (const c of body.children) walk(c, null);

  return {
    title: titleEl.length ? titleEl.text() : null,
    description: descEl.length ? descEl.attr('content') ?? '' : null,
    blocks, links,
  };
}

// ── Comparison ─────────────────────────────────────────────────────────────
function compare(a: Snapshot, b: Snapshot): Finding[] {
  const out: Finding[] = [];
  for (const cat of ['title', 'description'] as const) {
    const x = a[cat], y = b[cat];
    const has = (v: string | null) => v !== null && norm(v) !== '';
    if (!has(x) && !has(y)) continue;
    if (has(x) && has(y) && norm(x!) === norm(y!)) continue;
    const direction: Direction = !has(x) ? 'only after rendering' : !has(y) ? 'only in initial' : 'changed';
    out.push({ category: cat, direction, initial: x, rendered: y });
  }
  const linkSet = (s: Snapshot) => {
    const m = new Map<string, Snapshot['links']>();
    for (const l of s.links) m.set(l.url, [...(m.get(l.url) ?? []), l]);
    return m;
  };
  const la = linkSet(a), lb = linkSet(b);
  for (const [from, to, direction] of [[la, lb, 'only in initial'], [lb, la, 'only after rendering']] as const)
    for (const [url, ls] of from) if (!to.has(url))
      out.push({ category: 'link', direction, url, scope: ls[0].scope, texts: [...new Set(ls.map(l => l.text))], context: ls[0].context });
  const blockSet = (s: Snapshot) => { const m = new Map<string, Snapshot['blocks'][0]>(); for (const bl of s.blocks) if (!m.has(norm(bl.text))) m.set(norm(bl.text), bl); return m; };
  const ba = blockSet(a), bb = blockSet(b);
  for (const [from, to, direction] of [[ba, bb, 'only in initial'], [bb, ba, 'only after rendering']] as const)
    for (const [k, bl] of from) if (!to.has(k))
      out.push({ category: 'text', direction, text: bl.text, kind: bl.kind, context: bl.context });
  return out;
}

// ── Reports ────────────────────────────────────────────────────────────────
const show = (v: string | null) => (v === null ? '(missing)' : collapse(v) === '' ? '(empty)' : `“${collapse(v)}”`);
const ctx = (f: { context?: string }, pre: string) => (withContext && f.context ? ` ${pre} ${f.context}` : '');
const line = (f: Finding): string => {
  if (f.category === 'title' || f.category === 'description') return `${show(f.initial)} → ${show(f.rendered)}`;
  if (f.category === 'link') return `${f.url} (${f.scope}) — ${f.texts.map(t => `“${t}”`).join(', ')}${ctx(f, '· in')}`;
  return `“${f.text}” (${f.kind})${ctx(f, '· under')}`;
};
const CATS = [['title', 'Title'], ['description', 'Meta description'], ['link', 'Links'], ['text', 'Text blocks']] as const;
const DIRS: Direction[] = ['only in initial', 'only after rendering', 'changed'];
const groups = (fs: Finding[]) => CATS.flatMap(([c, label]) => DIRS.map(d => ({ label, d, items: fs.filter(f => f.category === c && f.direction === d) })).filter(g => g.items.length));

function header(name: string, url: string, fs: Finding[]) {
  return `# Scuttle: ${name}\n\n${url}\n\n`;
}

function variantA(name: string, url: string, fs: Finding[]) {
  let s = header(name, url, fs);
  if (!fs.length) return s + 'No differences found.\n';
  for (const g of groups(fs)) s += `## ${g.label}: ${g.d} (${g.items.length})\n\n` + g.items.map(f => `- ${line(f)}`).join('\n') + '\n\n';
  return s;
}

function variantB(name: string, url: string, fs: Finding[]) {
  let s = header(name, url, fs);
  if (!fs.length) return s + 'No differences found.\n';
  const esc = (x: string) => x.replace(/\|/g, '\\|');
  const meta = fs.filter(f => f.category === 'title' || f.category === 'description') as Extract<Finding, { initial: unknown }>[];
  if (meta.length) s += `## Metadata\n\n| | Initial | Rendered |\n|---|---|---|\n` + meta.map(f => `| ${f.category} | ${esc(show(f.initial))} | ${esc(show(f.rendered))} |`).join('\n') + '\n\n';
  const links = fs.filter(f => f.category === 'link') as Extract<Finding, { category: 'link' }>[];
  if (links.length) s += `## Links (${links.length})\n\n| | Scope | URL | Anchor text |${withContext ? ' In |' : ''}\n|---|---|---|---|${withContext ? '---|' : ''}\n` +
    links.map(f => `| ${f.direction === 'only in initial' ? '− initial only' : '+ rendered only'} | ${f.scope} | ${esc(f.url)} | ${esc(f.texts.join(' · '))} |${withContext ? ` ${f.context ?? ''} |` : ''}`).join('\n') + '\n\n';
  const text = fs.filter(f => f.category === 'text') as Extract<Finding, { category: 'text' }>[];
  if (text.length) s += `## Text blocks (${text.length})\n\n| | Kind | Text |${withContext ? ' Under |' : ''}\n|---|---|---|${withContext ? '---|' : ''}\n` +
    text.map(f => `| ${f.direction === 'only in initial' ? '− initial only' : '+ rendered only'} | ${f.kind} | ${esc(f.text)} |${withContext ? ` ${esc(f.context ?? '')} |` : ''}`).join('\n') + '\n\n';
  return s;
}

function variantC(name: string, url: string, fs: Finding[]) {
  let s = header(name, url, fs);
  const count = (c: string, d: Direction) => fs.filter(f => f.category === c && f.direction === d).length;
  s += `| | Only in initial | Only after rendering | Changed |\n|---|---|---|---|\n` +
    CATS.map(([c, label]) => `| ${label} | ${count(c, 'only in initial')} | ${count(c, 'only after rendering')} | ${c === 'title' || c === 'description' ? count(c, 'changed') : '—'} |`).join('\n') + '\n\n';
  if (!fs.length) return s + 'No differences found.\n';
  for (const g of groups(fs)) {
    s += `## ${g.label}: ${g.d} (${g.items.length})\n\n` + g.items.slice(0, cap).map(f => `- ${line(f)}`).join('\n') + '\n';
    if (g.items.length > cap) s += `- … and ${g.items.length - cap} more (\`--all\` to list them)\n`;
    s += '\n';
  }
  return s;
}

// ── Run ────────────────────────────────────────────────────────────────────
const render = (name: string, url: string, fs: Finding[]) =>
  flags.json ? JSON.stringify(fs, null, 2) + '\n' : ({ a: variantA, b: variantB, c: variantC } as const)[variant as 'a' | 'b' | 'c'](name, url, fs);

if (flags['meta-demo']) {
  const page = (head: string) => `<html><head>${head}</head><body><p>Same</p></body></html>`;
  const cases: [string, string, string][] = [
    ['title added by JavaScript', '', '<title>Book a consultation</title>'],
    ['title emptied → filled', '<title></title>', '<title>Book a consultation</title>'],
    ['title changed', '<title>Lovable App</title>', '<title>Men’s Scalp Expert | Barbearia</title>'],
    ['title differs only in case and spacing', '<title>Book  an eye test</title>', '<title>book an Eye Test</title>'],
    ['description removed', '<meta name="description" content="Precision haircuts">', ''],
    ['two descriptions: first one counts', '<meta name="description" content="A"><meta name="description" content="B">', '<meta name="description" content="A">'],
    ['empty vs missing description', '<meta name="description" content="">', ''],
  ];
  for (const [label, a, b] of cases) process.stdout.write(`\n▶ ${label}\n` + render(label, 'https://example.com/', compare(extract(page(a), 'https://example.com/'), extract(page(b), 'https://example.com/'))).replace(/^# .*\n\n.*\n\n/, ''));
} else {
  const dir = fs.readdirSync('fixtures').find(d => d.includes(positional[0] ?? ''))!;
  const url = fs.readFileSync(`fixtures/${dir}/NOTES.md`, 'utf8').match(/\*\*URL:\*\* (\S+)/)![1];
  const read = (s: string) => extract(fs.readFileSync(`fixtures/${dir}/${s}.html`, 'utf8'), url);
  process.stdout.write(render(dir, url, compare(read('initial'), read('rendered'))));
}
