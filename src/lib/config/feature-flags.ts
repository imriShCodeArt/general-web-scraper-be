/**
 * Feature flags for controlled rollout of new functionality
 * Phase 10: Rollout implementation
 */

export interface FeatureFlags {
  /** Enable batch-wide attribute union for parent CSV generation */
  batchWideAttributeUnion: boolean;

  /** Enable normalized attribute keys (pa_ prefix) by default */
  normalizedAttributeKeys: boolean;

  /** Enable performance optimizations (caching, retry, tightened selectors) */
  performanceOptimizations: boolean;

  /** Enable debug logging for rollout validation */
  rolloutDebugMode: boolean;

  /** Enable strict WooCommerce validation */
  strictWooCommerceValidation: boolean;
}

/**
 * Default feature flags configuration
 * These can be overridden via environment variables or config files
 */
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  batchWideAttributeUnion: true, // Enabled after successful validation
  normalizedAttributeKeys: true, // Enabled after successful validation
  performanceOptimizations: true, // Already stable from Phase 8
  rolloutDebugMode: false,
  strictWooCommerceValidation: true, // Keep strict validation enabled
};

/**
 * Environment variable names for feature flags
 */
const FEATURE_FLAG_ENV_VARS = {
  batchWideAttributeUnion: 'SCRAPER_BATCH_WIDE_ATTRIBUTE_UNION',
  normalizedAttributeKeys: 'SCRAPER_NORMALIZED_ATTRIBUTE_KEYS',
  performanceOptimizations: 'SCRAPER_PERFORMANCE_OPTIMIZATIONS',
  rolloutDebugMode: 'SCRAPER_ROLLOUT_DEBUG_MODE',
  strictWooCommerceValidation: 'SCRAPER_STRICT_WOOCOMMERCE_VALIDATION',
} as const;

/**
 * Parse boolean value from environment variable
 */
function parseBooleanEnv(value: string | undefined, defaultValue: boolean): boolean {
  if (!value || value === '') return defaultValue;
  const lowerValue = value.toLowerCase();
  if (lowerValue === 'true' || value === '1') return true;
  if (lowerValue === 'false' || value === '0') return false;
  return defaultValue; // fallback to default for unknown values
}

/**
 * Get current feature flags configuration
 * Reads from environment variables and merges with defaults
 */
export function getFeatureFlags(): FeatureFlags {
  return {
    batchWideAttributeUnion: parseBooleanEnv(
      process.env[FEATURE_FLAG_ENV_VARS.batchWideAttributeUnion],
      DEFAULT_FEATURE_FLAGS.batchWideAttributeUnion,
    ),
    normalizedAttributeKeys: parseBooleanEnv(
      process.env[FEATURE_FLAG_ENV_VARS.normalizedAttributeKeys],
      DEFAULT_FEATURE_FLAGS.normalizedAttributeKeys,
    ),
    performanceOptimizations: parseBooleanEnv(
      process.env[FEATURE_FLAG_ENV_VARS.performanceOptimizations],
      DEFAULT_FEATURE_FLAGS.performanceOptimizations,
    ),
    rolloutDebugMode: parseBooleanEnv(
      process.env[FEATURE_FLAG_ENV_VARS.rolloutDebugMode],
      DEFAULT_FEATURE_FLAGS.rolloutDebugMode,
    ),
    strictWooCommerceValidation: parseBooleanEnv(
      process.env[FEATURE_FLAG_ENV_VARS.strictWooCommerceValidation],
      DEFAULT_FEATURE_FLAGS.strictWooCommerceValidation,
    ),
  };
}

/**
 * Check if a specific feature flag is enabled
 */
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[flag];
}

/**
 * Get feature flags for logging/debugging
 */
export function getFeatureFlagsSummary(): Record<string, boolean> {
  const flags = getFeatureFlags();
  return {
    'batch-wide-attribute-union': flags.batchWideAttributeUnion,
    'normalized-attribute-keys': flags.normalizedAttributeKeys,
    'performance-optimizations': flags.performanceOptimizations,
    'rollout-debug-mode': flags.rolloutDebugMode,
    'strict-woocommerce-validation': flags.strictWooCommerceValidation,
  };
}

/**
 * Validate feature flags configuration
 */
export function validateFeatureFlags(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Add validation rules here if needed
  // For now, all combinations are valid

  return {
    valid: errors.length === 0,
    errors,
  };
}
