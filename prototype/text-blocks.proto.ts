// PROTOTYPE — throwaway. Answers: which elements become text blocks, and how
// are nesting, duplicates, hidden markup and short blocks handled?
// Lives on the prototype/text-blocks branch only. Not production code.
//
// Run:  npm run proto:blocks -- [flags]
//   --strategy=list|container   list: fixed block tags, innermost wins
//                               container: every text node goes to its nearest
//                               non-inline ancestor (inline tags fold in)
//   --hidden=keep|drop          (default keep, as decided) drop: skip [hidden], [aria-hidden=true],
//                               noscript, template, svg
//   --key=text|kind             kind: key = kind + text, so h2 "Prices" ≠ p "Prices"
//   --min=N                     drop blocks with fewer than N characters
//   --fixture=<substring>       only matching fixtures
//   --show=N                    how many examples per list (default 12)
//   --only=<section>            summary|diff|dupes|short|nesting|lost

import * as cheerio from 'cheerio';
import type { AnyNode, Element } from 'domhandler';
import fs from 'node:fs';

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, v] = a.replace(/^--/, '').split('=');
  return [k, v ?? 'true'];
}));
const strategy = args.strategy ?? 'list';
const dropHidden = (args.hidden ?? 'keep') === 'drop'; // decided: keep hidden markup
const keyWithKind = (args.key ?? 'text') === 'kind';
const min = Number(args.min ?? 0);
const show = Number(args.show ?? 12);
const only = args.only;

const LIST_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'td', 'th', 'dd', 'dt', 'blockquote', 'figcaption', 'caption']);
const INLINE = new Set(['a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite', 'code', 'data', 'del', 'dfn', 'em', 'i', 'ins', 'kbd', 'label', 'mark', 'q', 's', 'samp', 'small', 'span', 'strong', 'sub', 'sup', 'time', 'u', 'var', 'wbr', 'font']);
const ALWAYS_SKIP = new Set(['script', 'style', 'head', 'title', 'option', 'select', 'textarea']);
const HIDDEN_SKIP = new Set(['noscript', 'template', 'svg', 'iframe']);

type Block = { kind: string; text: string; key: string; nested: boolean };

const collapse = (s: string) => s.replace(/\s+/g, ' ').trim();
const keyOf = (kind: string, text: string) => (keyWithKind ? kind + '|' : '') + text.toLowerCase();

function skipped(el: Element): boolean {
  if (ALWAYS_SKIP.has(el.name)) return true;
  if (!dropHidden) return false;
  if (HIDDEN_SKIP.has(el.name)) return true;
  const a = el.attribs ?? {};
  return 'hidden' in a || a['aria-hidden'] === 'true';
}

function extract(html: string) {
  const $ = cheerio.load(html);
  const owner = new Map<Element, string[]>(); // block element -> its text pieces
  const lost: string[] = []; // text that belongs to no block (list strategy)
  let total = 0;

  const walk = (node: AnyNode, block: Element | null) => {
    if (node.type === 'text') {
      const t = (node as any).data as string;
      if (!t.trim()) return;
      total += collapse(t).length;
      if (block) owner.get(block)!.push(t);
      else lost.push(collapse(t));
      return;
    }
    if (node.type !== 'tag' && node.type !== 'script' && node.type !== 'style') return;
    const el = node as Element;
    if (skipped(el)) return;
    let next = block;
    if (strategy === 'list' ? LIST_TAGS.has(el.name) : !INLINE.has(el.name)) {
      next = el;
      owner.set(el, []);
    }
    for (const c of el.children) walk(c, next);
  };
  const body = $('body')[0];
  if (body) for (const c of body.children) walk(c, strategy === 'list' ? null : body);
  if (strategy !== 'list' && body) owner.set(body, owner.get(body) ?? []);

  const blocks: Block[] = [];
  for (const [el, pieces] of owner) {
    const text = collapse(pieces.join(' '));
    if (!text || text.length < min) continue;
    const nested = $(el).find([...owner.keys()].map(e => e.name).filter((v, i, a) => a.indexOf(v) === i).join(',')).toArray().some(d => owner.has(d) && owner.get(d)!.length > 0);
    blocks.push({ kind: el.name, text, key: keyOf(el.name, text), nested });
  }
  return { blocks, lost: lost.filter(t => t.length > 0), total };
}

const clip = (s: string, n = 90) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
const list = (title: string, items: string[]) => {
  console.log(`  ${title} (${items.length})`);
  for (const i of items.slice(0, show)) console.log(`    · ${clip(i)}`);
  if (items.length > show) console.log(`    … ${items.length - show} more`);
};
const want = (s: string) => !only || only === s;

console.log(`strategy=${strategy} hidden=${dropHidden ? 'drop' : 'keep'} key=${keyWithKind ? 'kind+text' : 'text'} min=${min}\n`);
for (const dir of fs.readdirSync('fixtures').filter(d => !args.fixture || d.includes(args.fixture))) {
  const read = (s: string) => extract(fs.readFileSync(`fixtures/${dir}/${s}.html`, 'utf8'));
  const a = read('initial'), b = read('rendered');
  const keys = (x: Block[]) => new Map(x.map(bl => [bl.key, bl]));
  const ka = keys(a.blocks), kb = keys(b.blocks);
  const onlyA = [...ka.values()].filter(x => !kb.has(x.key));
  const onlyB = [...kb.values()].filter(x => !ka.has(x.key));
  const fmt = (x: Block) => `${x.kind.padEnd(10)} ${x.text}`;

  console.log(`═══ ${dir}`);
  if (want('summary')) {
    const kinds = (x: Block[]) => Object.entries(x.reduce<Record<string, number>>((m, bl) => ((m[bl.kind] = (m[bl.kind] ?? 0) + 1), m), {})).sort((p, q) => q[1] - p[1]).map(([k, n]) => `${k}:${n}`).join(' ');
    console.log(`  initial:  ${a.blocks.length} blocks, ${ka.size} distinct  [${kinds(a.blocks)}]`);
    console.log(`  rendered: ${b.blocks.length} blocks, ${kb.size} distinct  [${kinds(b.blocks)}]`);
    const lostChars = (x: typeof a) => x.lost.reduce((n, t) => n + t.length, 0);
    if (strategy === 'list') console.log(`  text outside any block: initial ${lostChars(a)}/${a.total} chars, rendered ${lostChars(b)}/${b.total} chars`);
    console.log(`  → only in initial: ${onlyA.length}, only after rendering: ${onlyB.length}`);
  }
  if (want('diff')) { list('only in initial', onlyA.map(fmt)); list('only after rendering', onlyB.map(fmt)); }
  if (want('dupes')) {
    const d = (x: Block[]) => Object.entries(x.reduce<Record<string, number>>((m, bl) => ((m[bl.text] = (m[bl.text] ?? 0) + 1), m), {})).filter(([, n]) => n > 1).map(([t, n]) => `${n}× ${t}`);
    list('repeated in rendered', d(b.blocks));
  }
  if (want('short')) list('rendered-only blocks under 20 chars', onlyB.filter(x => x.text.length < 20).map(fmt));
  if (want('nesting')) list('rendered blocks that also contain other blocks', b.blocks.filter(x => x.nested).map(fmt));
  if (want('lost') && strategy === 'list') list('rendered text outside any block', [...new Set(b.lost)]);
  console.log();
}
