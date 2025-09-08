import { JSDOM } from 'jsdom';
import { collectRadioGroups, extractLabelText, getAttributeNameFor } from '../helpers/dom';

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


