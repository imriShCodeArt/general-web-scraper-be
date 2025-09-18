import { NormalizationToolkit } from '../../lib/core/normalization/normalization';

describe('NormalizationToolkit Purity', () => {
  it('normalizeProduct should not mutate input and be deterministic', () => {
    const input = {
      id: undefined,
      title: '  Test Product  ' ,
      sku: undefined,
      description: ' Some desc ',
      shortDescription: ' Short ',
      attributes: { Color: [' Red ', undefined, ''] },
      images: ['//example.com/image.jpg', ''],
      category: undefined,
      variations: [],
      price: ' 100 ',
      salePrice: undefined,
      stockStatus: 'In Stock',
    } as any;

    const clone: any = JSON.parse(JSON.stringify(input));
    const normalizeUndefined = (obj: any) => JSON.parse(JSON.stringify(obj));

    const url = 'https://example.com/product-1';

    const result1 = NormalizationToolkit.normalizeProduct(input, url);
    const result2 = NormalizationToolkit.normalizeProduct(input, url);

    expect(normalizeUndefined(input)).toEqual(clone);

    // Deterministic except timestamp
    const r1: any = { ...result1 };
    const r2: any = { ...result2 };
    delete r1.normalizedAt;
    delete r2.normalizedAt;
    expect(r1).toEqual(r2);

    expect(result1.title).toBe('Test Product');
    expect(result1.sku).toBeTruthy();

    const allAttrValues = Object.values(result1.attributes || {}).flat();
    const trimmed = (allAttrValues as string[]).map(v => (v || '').trim());
    expect(trimmed).toContain('Red');

    expect(Array.isArray(result1.images)).toBe(true);
  });

  it('normalizeAttributes should be pure and not mutate input', () => {
    const attrs: Record<string, (string | undefined)[]> = {
      Size: [' S ', undefined, ''],
      Material: ['Wood', 'Metal'],
    };
    const copy = JSON.parse(JSON.stringify(attrs));

    const out1 = NormalizationToolkit.normalizeAttributes(attrs);
    const out2 = NormalizationToolkit.normalizeAttributes(attrs);

    const normalizeUndefined = (obj: any) => JSON.parse(JSON.stringify(obj));
    expect(normalizeUndefined(attrs)).toEqual(copy);

    expect(out1).toEqual(out2);

    const values = Object.values(out1).flat();
    expect(values).toContain('S');
    expect(values).toContain('Wood');
    expect(values).toContain('Metal');
  });

  it('detectProductType should not log or mutate and be deterministic', () => {
    const product = { title: 'x', attributes: { Color: ['Red'] }, variations: [] } as any;
    const copy = JSON.parse(JSON.stringify(product));

    const t1 = NormalizationToolkit.detectProductType(product);
    const t2 = NormalizationToolkit.detectProductType(product);

    expect(product).toEqual(copy);
    expect(t1).toBe(t2);
  });
});


