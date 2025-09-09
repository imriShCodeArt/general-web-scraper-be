// URL helpers extracted per Phase 1

export function resolveUrl(baseUrl: string, relativeOrAbsolute: string): string {
  try {
    const url = relativeOrAbsolute || '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('//')) return `https:${url}`;
    if (url.startsWith('/')) {
      const base = new URL(baseUrl);
      return `${base.protocol}//${base.host}${url}`;
    }
    return `${baseUrl.replace(/\/?$/, '')}/${url.replace(/^\//, '')}`;
  } catch {
    return relativeOrAbsolute;
  }
}

export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = '';
    // Sort query params for stability
    const params = Array.from(u.searchParams.entries()).sort(([a], [b]) => a.localeCompare(b));
    u.search = params.length ? '?' + params.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&') : '';
    // Remove default ports
    if ((u.protocol === 'http:' && u.port === '80') || (u.protocol === 'https:' && u.port === '443')) {
      u.port = '';
    }
    return u.toString();
  } catch {
    return url;
  }
}

export function isInternalUrl(url: string, baseHost: string): boolean {
  try {
    const u = new URL(url);
    return u.host === baseHost;
  } catch {
    return false;
  }
}


