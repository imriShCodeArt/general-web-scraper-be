import crypto from 'crypto';

export function generateSku(url: string): string {
  try {
    if (!url) {
      const hash = crypto.createHash('sha1').update('').digest('hex').slice(0, 8).toUpperCase();
      return `PRODUCT-${hash}`;
    }
    const normalized = url.split('?')[0].split('#')[0];
    const hash = crypto.createHash('sha1').update(normalized).digest('hex').slice(0, 8).toUpperCase();
    const slugPart = normalized.split('/').filter(Boolean).pop() || 'PRODUCT';
    const cleaned = slugPart.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12) || 'PRODUCT';
    return `${cleaned}-${hash}`;
  } catch {
    const hash = crypto.createHash('sha1').update('').digest('hex').slice(0, 8).toUpperCase();
    return `PRODUCT-${hash}`;
  }
}

export function buildVariationSku(parentSku: string, assignments: Record<string, string>): string {
  const suffix = Object.values(assignments)
    .filter(Boolean)
    .map((v) => v.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())
    .join('-')
    .slice(0, 32);
  return suffix ? `${parentSku}-${suffix}` : parentSku;
}


