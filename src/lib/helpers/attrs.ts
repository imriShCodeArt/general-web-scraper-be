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

// Phase 2: naming utilities for CSV header display
export function attributeDisplayName(rawKey: string): string {
  const withoutPrefix = (rawKey || '').replace(/^pa_/i, '');
  const cleaned = withoutPrefix.replace(/[_-]+/g, ' ').trim().toLowerCase();
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function cleanAttributeName(rawKey: string): string {
  return (rawKey || '')
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
}


