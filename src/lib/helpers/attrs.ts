export function ensurePaPrefixed(name: string): string {
  const trimmed = (name || '').trim();
  if (/^pa_/i.test(trimmed)) return trimmed.replace(/^PA_/, 'pa_');
  return `pa_${trimmed}`;
}

export function normalizeAttrKey(name: string): string {
  const trimmed = (name || '').trim();
  // Remove WooCommerce prefixes then ensure pa_ prefix
  const noWoo = trimmed.replace(/^(pa_|attribute_)/i, '');
  const cleaned = noWoo.replace(/\s+/g, '_').replace(/["'<>]/g, '').trim();
  return ensurePaPrefixed(cleaned);
}

const PLACEHOLDER_PATTERNS = [
  'בחר אפשרות',
  'בחירת אפשרות',
  'Select option',
  'Choose option',
  'Select size',
  'Select color',
  'General',
];

export function isPlaceholderValue(text: string): boolean {
  if (!text) return true;
  const lower = text.toLowerCase();
  return PLACEHOLDER_PATTERNS.some((p) => lower.includes(p.toLowerCase()));
}


