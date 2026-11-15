import * as cheerio from 'cheerio';
import type { AnyNode, Element } from 'domhandler';
import { collapse, textKey } from './normalise.ts';

export type Landmark = 'nav' | 'header' | 'footer' | 'main' | 'aside';
export type PageSnapshot = {
  title: string | null;
  description: string | null;
  links: { url: string; scope: 'internal' | 'external'; text: string; landmark?: Landmark }[];
  blocks: { kind: string; text: string; landmark?: Landmark }[];
};

const BLOCKS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'td', 'th', 'dt', 'dd', 'blockquote', 'figcaption', 'caption']);
const SKIPPED = new Set(['script', 'style', 'template', 'noscript', 'svg', 'head']);
const LANDMARKS = new Set<string>(['nav', 'header', 'footer', 'main', 'aside']);

const SCHEMES = new Set(['http:', 'https:', 'tel:', 'mailto:']);
const siteHost = (url: URL) => url.hostname.replace(/^www\./, '');

/** Text of a node, leaving out skipped elements. */
function textOf(node: AnyNode): string {
  if (node.type === 'text') return node.data;
  if (node.type !== 'tag' || SKIPPED.has((node as Element).name)) return '';
  return (node as Element).children.map(textOf).join('');
}

/** First `img[alt]` with non-empty alt inside an element. */
function imageAlt(el: Element): string {
  for (const child of el.children) {
    if (child.type !== 'tag') continue;
    const alt = child.name === 'img' ? collapse(child.attribs.alt ?? '') : imageAlt(child);
    if (alt) return alt;
  }
  return '';
}

function anchorText(a: Element): string {
  return (
    collapse(textOf(a)) ||
    collapse(a.attribs['aria-label'] ?? '') ||
    imageAlt(a) ||
    collapse(a.attribs.title ?? '') ||
    '(no text)'
  );
}

/** Resolve an `<a href>` against the page, or null when the link is skipped. */
function resolve(href: string, page: URL): URL | null {
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;
  const url = URL.parse(trimmed, page);
  return url && SCHEMES.has(url.protocol) ? url : null;
}

/** html + page URL → PageSnapshot, keeping original values. */
export function extract(html: string, pageUrl: string): PageSnapshot {
  const $ = cheerio.load(html);
  const page = new URL(pageUrl);
  const snapshot: PageSnapshot = { title: null, description: null, links: [], blocks: [] };

  const walk = (node: AnyNode, parts: string[] | null, landmark?: Landmark): void => {
    if (node.type === 'text') {
      parts?.push(node.data);
      return;
    }
    if (node.type !== 'tag') return;
    const el = node as Element;
    if (SKIPPED.has(el.name)) return;
    const here = LANDMARKS.has(el.name) ? (el.name as Landmark) : landmark;

    const url = el.name === 'a' && el.attribs.href !== undefined ? resolve(el.attribs.href, page) : null;
    if (url) {
      const internal = url.protocol.startsWith('http') && siteHost(url) === siteHost(page);
      snapshot.links.push({ url: url.href, scope: internal ? 'internal' : 'external', text: anchorText(el), ...(here && { landmark: here }) });
    }

    const isBlock = BLOCKS.has(el.name);
    const own = isBlock ? [] : parts;
    // Reserve this block's place before its children, so blocks keep document order.
    const index = snapshot.blocks.length;
    for (const child of el.children) walk(child, own, here);
    if (isBlock) {
      const text = collapse(own!.join(''));
      if (textKey(text)) snapshot.blocks.splice(index, 0, { kind: el.name, text, ...(here && { landmark: here }) });
    }
  };

  const title = $('head title').first();
  if (title.length) snapshot.title = collapse(title.text());
  const description = $('meta[name="description" i]').first();
  if (description.length) snapshot.description = collapse(description.attr('content') ?? '');

  for (const child of $('body').contents().toArray()) walk(child, null);
  return snapshot;
}
