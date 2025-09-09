export function buildAdapterCacheKey(recipeName: string, siteUrl: string): string {
  return `${recipeName}:${siteUrl}`;
}

export function validateSiteUrl(expected: string, actual: string): boolean {
  try {
    if (expected === '*') return true;

    if (expected.startsWith('*.')) {
      const recipeDomain = expected.substring(2);
      const siteHost = new URL(actual).hostname;
      return siteHost.endsWith(recipeDomain);
    }

    const recipeHost = new URL(expected).hostname;
    const siteHost = new URL(actual).hostname;
    return recipeHost === siteHost;
  } catch {
    return false;
  }
}


