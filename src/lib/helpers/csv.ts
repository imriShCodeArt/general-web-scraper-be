// aggregateAttributesAcrossProducts is defined below with stricter types

export function buildParentHeaders(attrKeys: string[]): string[] {
  const headers: string[] = [];
  for (const key of attrKeys) {
    headers.push(`attribute:${key}`);
    headers.push(`attribute_data:${key}`);
    headers.push(`attribute_default:${key}`);
  }
  return headers;
}

export function formatAttributeDataFlags(
  position: number,
  visible = 1,
  isTaxonomy = 1,
  inVariations = 1,
): string {
  return `${position}|${visible}|${isTaxonomy}|${inVariations}`;
}

// Phase 2: Additional helpers for CSV generation

export function aggregateAttributesAcrossProducts(
  products: Array<{
    attributes: Record<string, string[]> | undefined;
    variations: Array<{ attributeAssignments?: Record<string, string> }> | undefined;
  }>,
): Set<string> {
  const keys = new Set<string>();
  for (const product of products) {
    for (const key of Object.keys(product.attributes || {})) keys.add(key);
    for (const variation of product.variations || []) {
      for (const key of Object.keys(variation.attributeAssignments || {})) keys.add(key);
    }
  }
  return keys;
}

export function buildParentRow(
  product: {
    title: string; slug?: string; sku: string; productType: string; description?: string; shortDescription?: string; stockStatus: string; images: string[]; category?: string; regularPrice?: string; salePrice?: string;
    attributes?: Record<string, string[]>;
    variations?: Array<{ attributeAssignments?: Record<string, string> }>;
  },
  unionKeys: string[],
  options: {
    attributeDisplayName: (raw: string) => string;
    cleanAttributeName: (raw: string) => string;
    defaultEligibleRawKeys: Set<string>;
  },
  rowBase: Record<string, string>,
): Record<string, string> {
  const row: Record<string, string> = { ...rowBase };
  const aggregated: Record<string, string[]> = {};
  for (const [k, vals] of (Object.entries(product.attributes || {}) as Array<[string, string[]]>)) {
    const list = Array.isArray(vals) ? vals : [];
    aggregated[k] = Array.from(new Set(list.filter(Boolean))) as string[];
  }
  for (const v of product.variations || []) {
    for (const [k, val] of (Object.entries(v.attributeAssignments || {}) as Array<[string, string]>)) {
      const list = aggregated[k] || [];
      if (typeof val === 'string' && val && !list.includes(val)) list.push(val);
      aggregated[k] = list;
    }
  }

  const isVariable = product.productType === 'variable';
  const firstVariation = (product.variations || [])[0];
  for (let i = 0; i < unionKeys.length; i++) {
    const raw = unionKeys[i];
    const headerName = options.attributeDisplayName(raw);
    const values = aggregated[raw] || [];
    const visible = 1;
    const isTaxonomy = /^pa_/i.test(raw) ? 1 : 0;
    const inVariations = isVariable ? 1 : 0;
    row[`attribute:${headerName}`] = values.join(' | ');
    row[`attribute_data:${headerName}`] = formatAttributeDataFlags(i, visible, isTaxonomy, inVariations);
    if (options.defaultEligibleRawKeys.has(raw) && isVariable && firstVariation && firstVariation.attributeAssignments) {
      const fv =
        firstVariation.attributeAssignments[raw] ||
        firstVariation.attributeAssignments[headerName] ||
        firstVariation.attributeAssignments[options.cleanAttributeName(raw)] ||
        firstVariation.attributeAssignments[`pa_${options.cleanAttributeName(raw)}`] ||
        '';
      if (fv) row[`attribute_default:${headerName}`] = fv as string;
    }
  }

  return row;
}

export function buildVariationRows(
  product: {
    title: string; slug?: string; sku: string; productType: string; description?: string; shortDescription?: string; images: string[];
    attributes?: Record<string, string[]>;
    variations: Array<{
      sku: string; regularPrice: string; salePrice?: string; taxClass?: string; stockStatus: string; images: string[]; attributeAssignments?: Record<string, string>;
    }>;
  },
  attributeDisplayName: (raw: string) => string,
): Array<Record<string, string>> {
  if (product.productType !== 'variable' || !product.variations || product.variations.length === 0) return [];
  const attributeHeadersSet = new Set<string>();
  const aggregated: Record<string, string[]> = {};
  for (const [key, vals] of (Object.entries(product.attributes || {}) as Array<[string, string[]]>)) {
    const list = Array.isArray(vals) ? vals : [];
    aggregated[key] = Array.from(new Set(list.filter(Boolean))) as string[];
  }
  for (const v of product.variations || []) {
    for (const k of Object.keys(v.attributeAssignments || {})) {
      const list = aggregated[k] || [];
      aggregated[k] = list;
    }
  }
  for (const raw of Object.keys(aggregated)) {
    const display = attributeDisplayName(raw);
    attributeHeadersSet.add(`meta:attribute_${display}`);
    if (/^pa_/i.test(raw)) attributeHeadersSet.add(`meta:attribute_${raw}`);
  }

  const rows: Record<string, string>[] = [];
  for (const variation of product.variations) {
    const row: Record<string, string> = {
      ID: '',
      post_type: 'product_variation',
      post_status: 'publish',
      parent_sku: product.sku,
      post_title: `${product.title} - ${Object.values(variation.attributeAssignments || {}).join(', ')}`,
      post_name: `${(product.slug || product.sku || '').toLowerCase()}-${variation.sku}`,
      post_content: product.description || '',
      post_excerpt: product.shortDescription || '',
      menu_order: '0',
      sku: variation.sku,
      stock_status: variation.stockStatus,
      regular_price: variation.regularPrice,
      sale_price: variation.salePrice || '',
      tax_class: variation.taxClass || 'parent',
      images: ((variation.images[0] || product.images[0] || '') as string).toString(),
    };
    for (const header of attributeHeadersSet) row[header] = row[header] || '';
    for (const [raw, val] of Object.entries(variation.attributeAssignments || {})) {
      const display = attributeDisplayName(raw);
      row[`meta:attribute_${display}`] = val as string;
      if (/^pa_/i.test(raw)) row[`meta:attribute_${raw}`] = val as string;
    }
    rows.push(row);
  }
  return rows;
}
