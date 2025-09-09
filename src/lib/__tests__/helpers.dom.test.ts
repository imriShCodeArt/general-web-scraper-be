import { JSDOM } from 'jsdom';
import { selectText, selectAllText, selectAttr, extractWithFallbacks, collectRadioGroups, extractLabelText, getAttributeNameFor } from '../helpers/dom';

describe('helpers/dom', () => {
  const html = `
    <html>
      <body>
        <h1 class="title">Title</h1>
        <div class="desc"><p>First para</p><p>Second para</p></div>
        <a class="link" href="/p/1">link</a>
      </body>
    </html>
  `;
  const dom = new JSDOM(html);

  test('selectText basic', () => {
    expect(selectText(dom as any, '.title')).toBe('Title');
  });

  test('selectText description paragraphs', () => {
    const t = selectText(dom as any, '.desc');
    expect(t.includes('First para')).toBe(true);
    expect(t.includes('Second para')).toBe(true);
  });

  test('selectAllText', () => {
    expect(selectAllText(dom as any, 'p')).toEqual(['First para', 'Second para']);
  });

  test('selectAttr', () => {
    expect(selectAttr(dom as any, '.link', 'href')).toBe('/p/1');
  });

  test('extractWithFallbacks uses primary then fallback and filters price-like when provided', () => {
    const html2 = new JSDOM('<div class="a">199₪</div><div class="b">ok</div>');
    const res = extractWithFallbacks(html2 as any, '.a', ['.b'], (t) => /₪|\d/.test(t));
    expect(res).toBe('ok');
  });
});

// (duplicate imports removed)

describe('DOM helpers', () => {
  test('collectRadioGroups groups radios by name', () => {
    const html = `
      <div class="options_group">
        <input type="radio" name="option[386]" value="1" />
        <input type="radio" name="option[386]" value="2" />
        <input type="radio" name="option[123]" value="A" />
      </div>`;
    const dom = new JSDOM(html);
    const groups = collectRadioGroups(dom.window.document);
    const byName = new Map(groups.map(g => [g.name, g.inputs.length]));
    expect(byName.get('option[386]')).toBe(2);
    expect(byName.get('option[123]')).toBe(1);
  });

  test('extractLabelText picks data-original-title or title or alt or text', () => {
    const html = '<img data-original-title=\'שחור\' alt=\'alt-text\' title=\'title-text\' />';
    const dom = new JSDOM(html);
    const el = dom.window.document.querySelector('img')!;
    expect(extractLabelText(el)).toBe('שחור');
  });

  test('getAttributeNameFor finds nearest label text', () => {
    const html = '<div><label class=\'control-label\'>צבע</label><div><input type=\'radio\'></div></div>';
    const dom = new JSDOM(html);
    const el = dom.window.document.querySelector('input')!;
    expect(getAttributeNameFor(el)).toBe('צבע');
  });
});


