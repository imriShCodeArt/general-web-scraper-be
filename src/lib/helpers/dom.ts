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


// New DOM selection helpers per Phase 1
export function selectText(dom: Document | { window: { document: Document } }, selector: string): string {
  const doc = (dom as any).window?.document || (dom as Document);
  try {
    const element = doc.querySelector(selector);
    if (!element) return '';
    if (selector.includes('description') || selector.includes('content') || selector.includes('p')) {
      const textContent = element.textContent?.trim() || '';
      const innerHTML = (element as HTMLElement).innerHTML || '';
      if (innerHTML.includes('<p>') || innerHTML.includes('<br>')) {
        const paragraphs = element.querySelectorAll('p, br + *, div');
        if (paragraphs.length > 0) {
          const paragraphTexts = Array.from(paragraphs as unknown as Element[])
            .map((p: Element) => p.textContent?.trim())
            .filter((text) => text && text.length > 10)
            .join('\n\n');
          if (paragraphTexts) return paragraphTexts;
        }
      }
      return textContent;
    }
    return element.textContent?.trim() || '';
  } catch {
    return '';
  }
}

export function selectAllText(dom: Document | { window: { document: Document } }, selector: string): string[] {
  const doc = (dom as any).window?.document || (dom as Document);
  try {
    return Array.from(doc.querySelectorAll(selector) as unknown as Element[])
      .map((el: Element) => el.textContent?.trim())
      .filter((t): t is string => !!t);
  } catch {
    return [];
  }
}

export function selectAttr(dom: Document | { window: { document: Document } }, selector: string, attr: string): string {
  const doc = (dom as any).window?.document || (dom as Document);
  try {
    const element = doc.querySelector(selector);
    return element?.getAttribute(attr) || '';
  } catch {
    return '';
  }
}

export function extractWithFallbacks(
  dom: Document | { window: { document: Document } },
  primary: string | string[],
  fallbacks?: string[],
  isPriceLike?: (text: string) => boolean,
): string {
  const selectors = Array.isArray(primary) ? primary : [primary];
  for (const sel of selectors) {
    const result = selectText(dom as any, sel);
    if (result) {
      if (isPriceLike && isPriceLike(result)) continue;
      return result;
    }
  }
  for (const fb of fallbacks || []) {
    const result = selectText(dom as any, fb);
    if (result) {
      if (isPriceLike && isPriceLike(result)) continue;
      return result;
    }
  }
  return '';
}

