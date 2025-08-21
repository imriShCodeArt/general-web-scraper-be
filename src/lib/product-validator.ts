import { Product, ProductValidationReport, ProductQualityEntry, DuplicateGroup } from '@/types';

export class ProductValidator {
  static validate(products: Product[]): ProductValidationReport {
    const perProduct: ProductQualityEntry[] = [];
    const missingCounts: Record<string, number> = {};

    // Duplicate detection maps
    const skuMap = new Map<string, number[]>();
    const slugMap = new Map<string, number[]>();
    const titleMap = new Map<string, number[]>();

    const normalize = (s: string) => s.trim().toLowerCase();

    products.forEach((p, index) => {
      // Track duplicates
      if (p.sku) {
        const key = normalize(p.sku);
        if (!skuMap.has(key)) skuMap.set(key, []);
        skuMap.get(key)!.push(index);
      }
      if (p.slug) {
        const key = normalize(p.slug);
        if (!slugMap.has(key)) slugMap.set(key, []);
        slugMap.get(key)!.push(index);
      }
      if (p.title) {
        const key = normalize(p.title);
        if (!titleMap.has(key)) titleMap.set(key, []);
        titleMap.get(key)!.push(index);
      }

      // Score and missing fields
      const missing: string[] = [];
      const warnings: string[] = [];
      let score = 100;

      const dec = (field: string, points: number, warn = false) => {
        if (warn) warnings.push(field);
        else missing.push(field);
        score = Math.max(0, score - points);
        missingCounts[field] = (missingCounts[field] || 0) + 1;
      };

      if (!p.title?.trim()) dec('title', 20);
      if (!p.url?.trim()) dec('url', 20);
      if (!p.sku?.trim()) dec('sku', 20);
      if (!p.slug?.trim()) dec('slug', 10, true);
      if (!p.category?.trim()) dec('category', 10, true);
      if (!p.description?.trim()) dec('description', 10, true);
      if (!p.shortDescription?.trim()) dec('shortDescription', 5, true);
      if (!Array.isArray(p.images) || p.images.length === 0) dec('images', 15);

      const hasAttributes = p.attributes && Object.keys(p.attributes).length > 0;
      if (!hasAttributes) dec('attributes', 5, true);

      // Variation sanity
      if (p.meta?.is_variable && (!Array.isArray(p.variations) || p.variations.length === 0)) {
        dec('variations', 5, true);
      }

      perProduct.push({
        url: p.url || '',
        sku: p.sku || '',
        title: p.title || '',
        score,
        missingFields: missing,
        warnings,
        issues: [
          ...missing.map((f) => ({ field: f, severity: 'error' as const, message: `${f} is missing` })),
          ...warnings.map((f) => ({ field: f, severity: 'warn' as const, message: `${f} is recommended` })),
        ],
      });
    });

    const makeDuplicateGroups = (map: Map<string, number[]>, type: DuplicateGroup['type']): DuplicateGroup[] => {
      const groups: DuplicateGroup[] = [];
      for (const [value, idxs] of Array.from(map.entries())) {
        if (value && idxs.length > 1) {
          groups.push({
            type,
            value,
            count: idxs.length,
            products: idxs.map((i) => ({ url: products[i].url, sku: products[i].sku, title: products[i].title })),
          });
        }
      }
      return groups.sort((a, b) => b.count - a.count);
    };

    const duplicates: DuplicateGroup[] = [
      ...makeDuplicateGroups(skuMap, 'sku'),
      ...makeDuplicateGroups(slugMap, 'slug'),
      ...makeDuplicateGroups(titleMap, 'title'),
    ];

    // Penalize duplicates in scores
    const duplicateSkuSet = new Set(duplicates.filter(d => d.type === 'sku').flatMap(d => d.products.map(p => p.sku.toLowerCase())));
    perProduct.forEach((entry) => {
      if (entry.sku && duplicateSkuSet.has(entry.sku.toLowerCase())) {
        entry.score = Math.max(0, entry.score - 15);
        entry.issues.push({ field: 'sku', severity: 'warn', message: 'Duplicate SKU detected' });
      }
    });

    const scores = perProduct.map(p => p.score);
    const averageScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const highQuality = perProduct.filter(p => p.score >= 85).length;
    const mediumQuality = perProduct.filter(p => p.score >= 70 && p.score < 85).length;
    const lowQuality = perProduct.filter(p => p.score < 70).length;

    return {
      totals: {
        numProducts: products.length,
        averageScore,
        highQuality,
        mediumQuality,
        lowQuality,
      },
      missingCounts,
      duplicates,
      perProduct,
    };
  }
}
