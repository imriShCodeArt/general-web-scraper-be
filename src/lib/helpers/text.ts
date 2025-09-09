export function cleanText(input: string): string {
  if (!input) return '';
  return input
    .replace(/\s+/g, ' ')
    .replace(/[\u200F\u200E\u202A-\u202E]/g, '')
    .trim();
}

const PLACEHOLDER_PATTERNS = [
  'בחר אפשרות',
  'בחירת אפשרות',
  'Select option',
  'Choose option',
  'General',
];

export function isPlaceholder(text: string): boolean {
  if (!text) return true;
  const lower = text.toLowerCase();
  return PLACEHOLDER_PATTERNS.some((p) => lower.includes(p.toLowerCase()));
}


