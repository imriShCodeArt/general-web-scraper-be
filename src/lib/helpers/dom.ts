// Intentionally no imports

export interface RadioGroup {
  name: string;
  inputs: HTMLInputElement[];
}

export function collectRadioGroups(root: Document | Element): RadioGroup[] {
  const container = (root as Element).querySelector?.('.options_group') || root;
  const inputs = Array.from(container.querySelectorAll('input[type="radio"], input.optstyle[type="radio"]')) as HTMLInputElement[];
  const groups = new Map<string, HTMLInputElement[]>();

  for (const input of inputs) {
    const name = input.getAttribute('name') || '';
    if (!name) continue;
    const list = groups.get(name) || [];
    list.push(input);
    groups.set(name, list);
  }

  return Array.from(groups.entries()).map(([name, inputs]) => ({ name, inputs }));
}

export function extractLabelText(el: Element): string {
  const title = el.getAttribute('data-original-title') || el.getAttribute('title');
  if (title) return title.trim();
  const alt = el.getAttribute('alt');
  if (alt) return alt.trim();
  const text = el.textContent || '';
  return text.trim();
}

export function getAttributeNameFor(el: Element, scope?: Element | Document): string | null {
  // Find the nearest label/control label around the element
  let current: Element | null = el;
  const limit = (scope as Element) || el.ownerDocument?.body || el;
  while (current && current !== limit) {
    const label = current.previousElementSibling as HTMLElement | null;
    if (label && /label|control-label/i.test(label.className) || label?.tagName === 'LABEL') {
      const text = label.textContent?.trim();
      if (text) return text;
    }
    current = current.parentElement;
  }
  return null;
}


