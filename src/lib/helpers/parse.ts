// Parsing helpers per Phase 4

import { JSDOM } from 'jsdom';

export function parsePrice(text: string): string {
  if (!text) return '';

  // Remove currency symbols and clean up
  const cleaned = text
    .replace(/[^\d.,\s-]/g, '') // Keep only digits, dots, commas, spaces, and hyphens
    .replace(/\s+/g, '') // Remove spaces
    .trim();

  // Handle different decimal separators
  if (cleaned.includes(',') && cleaned.includes('.')) {
    // Check if it's European format (dot as thousands, comma as decimal)
    const lastDot = cleaned.lastIndexOf('.');
    const lastComma = cleaned.lastIndexOf(',');
    if (lastComma > lastDot) {
      // European format: 1.234,56 -> 1234.56
      return cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      // US format: 1,234.56 -> 1234.56
      return cleaned.replace(/,/g, '');
    }
  } else if (cleaned.includes(',')) {
    // Could be either thousands or decimal separator
    const parts = cleaned.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      // Likely decimal separator
      return cleaned.replace(',', '.');
    } else {
      // Likely thousands separator
      return cleaned.replace(/,/g, '');
    }
  }

  return cleaned;
}

export function parseNumber(text: string): number {
  if (!text) return 0;

  const cleaned = parsePrice(text);
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export interface StockStatusConfig {
  inStockSelectors?: string[];
  outOfStockSelectors?: string[];
  inStockText?: string[];
  outOfStockText?: string[];
}

export function extractStockStatus(
  dom: JSDOM,
  selectorOrConfig: string | StockStatusConfig,
): string {
  const doc = dom.window.document;

  if (typeof selectorOrConfig === 'string') {
    // Simple selector-based extraction
    const element = doc.querySelector(selectorOrConfig);
    if (!element) return 'unknown';

    const text = element.textContent?.toLowerCase().trim() || '';
    if (text.includes('in stock') || text.includes('available') || text.includes('in stock')) {
      return 'instock';
    } else if (text.includes('out of stock') || text.includes('unavailable') || text.includes('sold out')) {
      return 'outofstock';
    }
    return 'unknown';
  }

  // Configuration-based extraction
  const config = selectorOrConfig;

  // Check selectors first
  if (config.inStockSelectors) {
    for (const selector of config.inStockSelectors) {
      const element = doc.querySelector(selector);
      if (element) return 'instock';
    }
  }

  if (config.outOfStockSelectors) {
    for (const selector of config.outOfStockSelectors) {
      const element = doc.querySelector(selector);
      if (element) return 'outofstock';
    }
  }

  // Check text patterns
  const bodyText = doc.body?.textContent?.toLowerCase() || '';

  if (config.inStockText) {
    for (const pattern of config.inStockText) {
      if (bodyText.includes(pattern.toLowerCase())) {
        return 'instock';
      }
    }
  }

  if (config.outOfStockText) {
    for (const pattern of config.outOfStockText) {
      if (bodyText.includes(pattern.toLowerCase())) {
        return 'outofstock';
      }
    }
  }

  return 'unknown';
}
