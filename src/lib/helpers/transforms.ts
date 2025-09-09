// Text transform helpers extracted per Phase 1

export type TransformSpec = string;

export function applyTransforms(text: string, transforms: TransformSpec[]): string {
  let result = text;
  for (const transform of transforms || []) {
    try {
      if (transform.includes('->')) {
        const [pattern, replacement] = transform.split('->').map((s) => s.trim());
        if (pattern && replacement) {
          const regex = new RegExp(pattern, 'g');
          result = result.replace(regex, replacement);
        }
      } else if (transform.startsWith('trim:')) {
        const chars = transform.substring(5);
        result = result.trim();
        if (chars) {
          result = result.replace(new RegExp(`^[${chars}]+|[${chars}]+$`, 'g'), '');
        }
      } else if (transform.startsWith('replace:')) {
        const [search, replace] = transform.substring(8).split('|');
        if (search && replace) {
          result = result.replace(new RegExp(search, 'g'), replace);
        }
      }
    } catch (error) {
      // Keep behavior identical: swallow and continue with warning in callers if desired
      // No console here to keep helpers pure; callers can log failures
      continue;
    }
  }
  return result;
}

export function applyAttributeTransforms(
  attributes: Record<string, string[]>,
  transformations: Record<string, TransformSpec[]>,
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const [attrName, values] of Object.entries(attributes)) {
    const spec = transformations[attrName];
    result[attrName] = spec ? values.map((v) => applyTransforms(v, spec)) : values;
  }
  return result;
}


