export function aggregateAttributesAcrossProducts(
  products: Array<{
    attributes: Record<string, string[]>;
    variations: Array<{ attributeAssignments?: Record<string, string> }>;
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
