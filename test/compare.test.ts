import { describe, expect, it } from 'vitest';
import { extract } from '../src/extract.ts';
import { compare } from '../src/compare.ts';

const URL_ = 'https://example.com/page';
const page = (body: string, head = '') => `<html><head>${head}</head><body>${body}</body></html>`;
const findings = (initial: string, rendered: string) => compare(extract(initial, URL_), extract(rendered, URL_));

describe('text blocks', () => {
  it('reports a genuine addition and a genuine removal, one in each direction', () => {
    expect(findings(page('<p>Same</p><p>Removed by JS</p>'), page('<p>Same</p><h2>Added by JS</h2>'))).toEqual([
      { category: 'text', direction: 'only in initial', text: 'Removed by JS', kind: 'p' },
      { category: 'text', direction: 'only after rendering', text: 'Added by JS', kind: 'h2' },
    ]);
  });

  it('ignores whitespace and case differences', () => {
    expect(findings(page('<p>Book  an\n eye&nbsp;test</p>'), page('<p> book an Eye Test </p>'))).toEqual([]);
  });

  it('extracts content inside [hidden] and aria-hidden="true"', () => {
    expect(findings(page(''), page('<div hidden><p>Hidden</p></div><p aria-hidden="true">Aria hidden</p>'))).toEqual([
      { category: 'text', direction: 'only after rendering', text: 'Hidden', kind: 'p' },
      { category: 'text', direction: 'only after rendering', text: 'Aria hidden', kind: 'p' },
    ]);
  });

  it('gives an li wrapping a p one block, not two', () => {
    expect(findings(page(''), page('<ul><li><p>Wrapped</p></li></ul>'))).toEqual([
      { category: 'text', direction: 'only after rendering', text: 'Wrapped', kind: 'p' },
    ]);
  });

  it('keeps loose text in an outer block as its own block, and inline text as part of its block', () => {
    expect(findings(page(''), page('<li>Loose <p>Inner <strong>bold</strong>!</p> tail</li>'))).toEqual([
      { category: 'text', direction: 'only after rendering', text: 'Loose tail', kind: 'li' },
      { category: 'text', direction: 'only after rendering', text: 'Inner bold!', kind: 'p' },
    ]);
  });

  it('treats a block repeated in one snapshot and appearing once in the other as no finding', () => {
    expect(findings(page('<p>Marquee</p><p>Marquee</p><p>Marquee</p>'), page('<p>Marquee</p>'))).toEqual([]);
  });

  it('produces no block from script, style, template, noscript or svg', () => {
    const skipped =
      '<script>var p = "<p>x</p>"</script><style>p{}</style><template><p>Template</p></template>' +
      '<noscript><p>Enable JS</p></noscript><svg><text>Svg</text><foreignObject><p>Foreign</p></foreignObject></svg>';
    expect(findings(page(''), page(skipped))).toEqual([]);
  });

  it('ignores text outside any block element', () => {
    expect(findings(page(''), page('<div>Loose div text <span>span</span></div>'))).toEqual([]);
  });

  it('records the nearest landmark from the first occurrence as evidence', () => {
    expect(findings(page(''), page('<main><section><nav><p>Menu</p></nav></section></main><footer><p>Menu</p></footer>'))).toEqual([
      { category: 'text', direction: 'only after rendering', text: 'Menu', kind: 'p', landmark: 'nav' },
    ]);
  });

  it('does not report text that moves from an h3 to a p', () => {
    expect(findings(page('<h3>Our services</h3>'), page('<p>Our services</p>'))).toEqual([]);
  });
});

describe('links', () => {
  it('treats a relative link and the same absolute link as no finding', () => {
    expect(findings(page('<a href="/about">About</a>'), page('<a href="https://example.com/about">About</a>'))).toEqual([]);
  });

  it('reports a link only after rendering, with its anchor texts in document order', () => {
    expect(findings(page(''), page('<header><a href="tel:+351966616502">Marcar</a></header><a href="tel:+351966616502">(+351) 966 616 502</a><a href="tel:+351966616502">Marcar</a>'))).toEqual([
      { category: 'link', direction: 'only after rendering', url: 'tel:+351966616502', scope: 'external', texts: ['Marcar', '(+351) 966 616 502'], landmark: 'header' },
    ]);
  });

  it('ignores empty, fragment-only and javascript: links, and keeps tel: as external', () => {
    const links = '<a href="">Empty</a><a href="#top">Top</a><a href="javascript:void(0)">JS</a><a>No href</a><a href="tel:123">Call</a>';
    expect(findings(page(''), page(links))).toEqual([
      { category: 'link', direction: 'only after rendering', url: 'tel:123', scope: 'external', texts: ['Call'] },
    ]);
  });

  it('treats the same URL with different anchor text as no finding', () => {
    expect(findings(page('<a href="/book">Book now</a>'), page('<a href="/book">Agendar</a>'))).toEqual([]);
  });

  it('ignores www. and host case for internal vs external, and treats another subdomain as external', () => {
    const links = '<a href="https://WWW.Example.com/a">A</a><a href="http://example.com/b">B</a><a href="https://shop.example.com/c">C</a><a href="mailto:hi@example.com">Mail</a>';
    expect(findings(page(''), page(links)).map(f => f.category === 'link' && [f.url, f.scope])).toEqual([
      ['https://www.example.com/a', 'internal'],
      ['http://example.com/b', 'internal'],
      ['https://shop.example.com/c', 'external'],
      ['mailto:hi@example.com', 'external'],
    ]);
  });

  it('keys links on the URL without its fragment, keeping path case, trailing slash and query', () => {
    const initial = page('<a href="/Path/?utm_source=x#one">A</a>');
    expect(findings(initial, page('<a href="/Path/?utm_source=x#two">A</a>'))).toEqual([]);
    expect(findings(initial, page('<a href="/path/?utm_source=x">A</a>')).map(f => f.category === 'link' && f.url)).toEqual([
      'https://example.com/Path/?utm_source=x',
      'https://example.com/path/?utm_source=x',
    ]);
  });

  it('falls back to aria-label, image alt, title, then (no text) for anchor text', () => {
    const links = '<a href="/1" aria-label="Aria"> </a><a href="/2"><img alt="Logo"></a><a href="/3" title="Title"></a><a href="/4"></a>';
    expect(findings(page(''), page(links)).map(f => f.category === 'link' && f.texts)).toEqual([['Aria'], ['Logo'], ['Title'], ['(no text)']]);
  });

  it('ignores links outside the body and non-<a> elements', () => {
    const head = '<link rel="canonical" href="https://example.com/canonical">';
    const body = '<map><area href="/area"></map><button onclick="location.href=\'/btn\'">Go</button>';
    expect(findings(page(''), page(body, head))).toEqual([]);
  });

  it('counts link text as part of its text block', () => {
    expect(findings(page('<p>Read <a href="/more">more</a></p>'), page('<p>Read more</p>'))).toEqual([
      { category: 'link', direction: 'only in initial', url: 'https://example.com/more', scope: 'internal', texts: ['more'] },
    ]);
  });
});

describe('title and meta description', () => {
  const title = (t: string) => page('<p>Same</p>', t);

  it('reports a title missing in initial as only after rendering', () => {
    expect(findings(title(''), title('<title>Book a consultation</title>'))).toEqual([
      { category: 'title', direction: 'only after rendering', initial: null, rendered: 'Book a consultation' },
    ]);
  });

  it('treats an empty title and a missing title as no finding', () => {
    expect(findings(title('<title> </title>'), title(''))).toEqual([]);
  });

  it('reports different titles as changed, with the original values, whitespace collapsed', () => {
    expect(findings(title('<title>Lovable App</title>'), title('<title>Men’s Scalp  Expert</title>'))).toEqual([
      { category: 'title', direction: 'changed', initial: 'Lovable App', rendered: 'Men’s Scalp Expert' },
    ]);
  });

  it('treats a case-only title difference as no finding', () => {
    expect(findings(title('<title>Book an Eye Test</title>'), title('<title>book an eye test</title>'))).toEqual([]);
  });

  it('does not take an SVG <title> in the body as the page title', () => {
    expect(findings(page('<svg><title>Icon</title></svg>'), page('<svg><title>Other icon</title></svg>', '<title>Page</title>'))).toEqual([
      { category: 'title', direction: 'only after rendering', initial: null, rendered: 'Page' },
    ]);
  });

  it('uses the first meta description, matching the name case-insensitively', () => {
    const meta = (d: string) => page('', d);
    expect(findings(meta('<meta name="Description" content="A"><meta name="description" content="B">'), meta('<meta name="description" content="A">'))).toEqual([]);
    expect(findings(meta('<meta name="DESCRIPTION" content="Precision haircuts">'), meta(''))).toEqual([
      { category: 'description', direction: 'only in initial', initial: 'Precision haircuts', rendered: null },
    ]);
  });

  it('treats a meta description with no content as empty', () => {
    expect(findings(page('', '<meta name="description">'), page(''))).toEqual([]);
    expect(findings(page('', '<meta name="description">'), page('', '<meta name="description" content="New">'))).toEqual([
      { category: 'description', direction: 'only after rendering', initial: '', rendered: 'New' },
    ]);
  });

  it('lists title, then description, then links, then text blocks', () => {
    const initial = page('<p>Old</p>', '<title>A</title><meta name="description" content="A">');
    const rendered = page('<a href="/x">X</a>', '<title>B</title><meta name="description" content="B">');
    expect(findings(initial, rendered).map(f => `${f.category}: ${f.direction}`)).toEqual([
      'title: changed',
      'description: changed',
      'link: only after rendering',
      'text: only in initial',
    ]);
  });
});
