import { StorageService } from '../../infrastructure/storage/storage';
import { RecipeManager } from './recipe-manager';
import { CsvGenerator } from './csv-generator';

/**
 * Centralized factory for default service instances.
 * Keeps `ScrapingService` free of direct `new` of infra/services.
 */
export const DefaultProviders = {
  getStorageService(): StorageService {
    return new StorageService();
  },
  getRecipeManager(): RecipeManager {
    return new RecipeManager();
  },
  getCsvGenerator(): CsvGenerator {
    return new CsvGenerator();
  },
};


