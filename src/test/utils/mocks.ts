import { ScrapingService } from '../../lib/core/services/scraping-service';
import { RecipeManager } from '../../lib/core/services/recipe-manager';
import { IStorageService } from '../../lib/infrastructure/storage/IStorageService';

export const mockInstances = {
  scrapingService(): jest.Mocked<ScrapingService> {
    return {
      startScraping: jest.fn(),
      getJobStatus: jest.fn(),
      getAllJobs: jest.fn(),
      listRecipes: jest.fn(),
      getRecipe: jest.fn(),
      getRecipeBySiteUrl: jest.fn(),
      cancelJob: jest.fn(),
      getStorageStats: jest.fn(),
      getPerformanceMetrics: jest.fn(),
      getLivePerformanceMetrics: jest.fn(),
      getPerformanceRecommendations: jest.fn(),
      cleanup: jest.fn(),
    } as unknown as jest.Mocked<ScrapingService>;
  },

  recipeManager(): jest.Mocked<RecipeManager> {
    return {
      createAdapter: jest.fn(),
      createAdapterFromFile: jest.fn(),
      listRecipes: jest.fn(),
      listRecipesWithDetails: jest.fn(),
      getRecipe: jest.fn(),
      getRecipeBySiteUrl: jest.fn(),
      loadRecipeFromFile: jest.fn(),
      validateRecipe: jest.fn(),
      clearCaches: jest.fn(),
      getCachedAdapter: jest.fn(),
      removeCachedAdapter: jest.fn(),
      getRecipeLoader: jest.fn(),
    } as unknown as jest.Mocked<RecipeManager>;
  },

  storageService(): jest.Mocked<IStorageService> {
    return {
      storeJobResult: jest.fn(),
      getJobResult: jest.fn(),
      getStorageStats: jest.fn(),
      getAllJobIds: jest.fn(),
      deleteJobResult: jest.fn(),
      stopCleanupInterval: jest.fn(),
      clearAll: jest.fn(),
    } as unknown as jest.Mocked<IStorageService>;
  },
};


