import { IStorageService } from '../../infrastructure/storage/IStorageService';
import { FsStorageService } from '../../infrastructure/storage/fs-storage.service';
import { RecipeManager } from './recipe-manager';
import { CsvGenerator } from './csv-generator';

/**
 * Centralized factory for default service instances.
 * Keeps `ScrapingService` free of direct `new` of infra/services.
 */
export const DefaultProviders = {
  getStorageService(): IStorageService {
    return new FsStorageService();
  },
  getRecipeManager(): RecipeManager {
    return new RecipeManager();
  },
  getCsvGenerator(): CsvGenerator {
    return new CsvGenerator();
  },
};


