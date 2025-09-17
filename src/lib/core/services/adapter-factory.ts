import pino from 'pino';
import { RecipeManager } from './recipe-manager';
import { SiteAdapter, RawProductData } from '../../domain/types';

/**
 * AdapterFactory encapsulates creation and cleanup of site adapters.
 * It centralizes recipe/detection logic and ensures a single place
 * is responsible for adapter lifecycle management.
 */
export class AdapterFactory {
  private readonly recipeManager: RecipeManager;
  private readonly logger: pino.Logger;

  constructor(recipeManager: RecipeManager, logger: pino.Logger) {
    this.recipeManager = recipeManager;
    this.logger = logger;
  }

  /**
   * Create adapter based on a preferred recipe name with auto-detection fallback.
   */
  async createAdapter(
    siteUrl: string,
    preferredRecipe?: string,
  ): Promise<SiteAdapter<RawProductData>> {
    if (preferredRecipe) {
      try {
        const adapter = await this.recipeManager.createAdapter(siteUrl, preferredRecipe);
        this.logger.info(`Created adapter for ${siteUrl} using recipe: ${preferredRecipe}`);
        return adapter;
      } catch (error) {
        this.logger.warn(
          `Failed to create adapter with recipe '${preferredRecipe}', trying auto-detection: ${error}`,
        );
      }
    }

    // Fallback to auto-detection
    const adapter = await this.recipeManager.createAdapter(siteUrl);
    this.logger.info(`Created adapter for ${siteUrl} using auto-detected recipe`);
    return adapter;
  }

  /**
   * Cleanup adapter resources if supported by the adapter implementation.
   */
  async cleanupAdapter(adapter: SiteAdapter<RawProductData> | null | undefined): Promise<void> {
    if (adapter && typeof (adapter as unknown as { cleanup?: () => Promise<void> }).cleanup === 'function') {
      try {
        await (adapter as unknown as { cleanup: () => Promise<void> }).cleanup();
      } catch (error) {
        this.logger.warn('Failed to cleanup adapter:', error as unknown);
      }
    }
  }
}


