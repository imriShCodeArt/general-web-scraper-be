/**
 * Naming and filename utilities
 */

/**
 * Generate CSV filenames for a scraping job
 * @param siteUrl The site URL being scraped
 * @param jobId Unique job identifier
 * @param now Optional timestamp (defaults to current time)
 * @returns Object with parent and variation CSV filenames
 */
export function makeCsvFilenames(
  siteUrl: string,
  jobId: string,
  _now?: Date,
): {
  parent: string;
  variation: string;
} {
  // Extract domain from URL for potential future use
  const domain = extractDomain(siteUrl);
  sanitizeFilename(domain); // Keep for potential future use

  return {
    parent: `parent-${jobId}.csv`,
    variation: `variation-${jobId}.csv`,
  };
}

/**
 * Generate output directory path for a job
 * @param siteUrl The site URL being scraped
 * @param jobId Unique job identifier
 * @param baseDir Base output directory (defaults to 'output')
 * @returns Output directory path
 */
export function makeOutputDirectory(
  siteUrl: string,
  jobId: string,
  baseDir: string = 'output',
): string {
  const domain = extractDomain(siteUrl);
  const safeDomain = sanitizeFilename(domain);
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  return `${baseDir}/${safeDomain}/${timestamp}/${jobId}`;
}

/**
 * Generate a unique job ID
 * @param prefix Optional prefix for the job ID
 * @returns Unique job identifier
 */
export function generateJobId(prefix?: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  const jobId = `${timestamp}-${random}`;

  return prefix ? `${prefix}-${jobId}` : jobId;
}

/**
 * Generate a unique product SKU
 * @param url Product URL
 * @param prefix Optional prefix for the SKU
 * @returns Unique product SKU
 */
export function generateProductSku(url: string, prefix?: string): string {
  const domain = extractDomain(url);
  const path = new URL(url).pathname;
  const hash = hashString(path);
  const sku = `${domain}-${hash}`;

  return prefix ? `${prefix}-${sku}` : sku;
}

/**
 * Generate a variation SKU based on parent SKU and attribute assignments
 * @param parentSku Parent product SKU
 * @param assignments Attribute assignments
 * @returns Variation SKU
 */
export function generateVariationSku(
  parentSku: string,
  assignments: Record<string, string>,
): string {
  const sortedAssignments = Object.entries(assignments)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}-${value}`)
    .join('-');

  return `${parentSku}-${hashString(sortedAssignments)}`;
}

/**
 * Extract domain from URL
 * @param url URL to extract domain from
 * @returns Domain name
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    // Fallback for invalid URLs
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }
}

/**
 * Sanitize filename by removing invalid characters
 * @param filename Filename to sanitize
 * @returns Sanitized filename
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Create a hash from a string
 * @param str String to hash
 * @returns Hash string
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Generate a timestamp-based filename
 * @param prefix Filename prefix
 * @param extension File extension (without dot)
 * @param timestamp Optional timestamp (defaults to current time)
 * @returns Timestamped filename
 */
export function makeTimestampedFilename(
  prefix: string,
  extension: string,
  timestamp?: Date,
): string {
  const ts = timestamp || new Date();
  const dateStr = ts.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = ts.toISOString().split('T')[1].split('.')[0].replace(/:/g, '-'); // HH-MM-SS

  return `${prefix}-${dateStr}-${timeStr}.${extension}`;
}

/**
 * Generate a backup filename
 * @param originalFilename Original filename
 * @param timestamp Optional timestamp (defaults to current time)
 * @returns Backup filename
 */
export function makeBackupFilename(
  originalFilename: string,
  timestamp?: Date,
): string {
  const ts = timestamp || new Date();
  const timeStr = ts.toISOString().split('T')[1].split('.')[0].replace(/:/g, '-'); // HH-MM-SS

  const lastDotIndex = originalFilename.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return `${originalFilename}.backup-${timeStr}`;
  }

  const name = originalFilename.substring(0, lastDotIndex);
  const extension = originalFilename.substring(lastDotIndex);

  return `${name}.backup-${timeStr}${extension}`;
}
