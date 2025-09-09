export function createAssignments(name: string, value: string): Record<string, string> {
  return { [name]: value };
}

export function mergeVariationSources<T extends { attributeAssignments?: Record<string, string> }>(
  ...lists: T[]
): T[] {
  return lists.reduce<T[]>((acc, item) => {
    const last = acc[acc.length - 1];
    if (!last) {
      acc.push(item);
      return acc;
    }
    const merged: T = {
      ...last,
      ...item,
      attributeAssignments: {
        ...(last.attributeAssignments || {}),
        ...(item.attributeAssignments || {}),
      },
    } as T;
    acc[acc.length - 1] = merged;
    return acc;
  }, [] as T[]);
}

export function dedupeBySku<T extends { sku: string }>(list: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of list) {
    if (item.sku && !seen.has(item.sku)) {
      seen.add(item.sku);
      result.push(item);
    }
  }
  return result;
}


