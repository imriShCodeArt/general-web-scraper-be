// Core services registry
import { Container } from '../container';
import { TOKENS } from '../tokens';
import { RecipeManager } from '../../../core/services/recipe-manager';
import { RecipeLoader } from '../../../utils/recipe-loader';
import { CsvGenerator } from '../../../core/services/csv-generator';
import { ScrapingService } from '../../../core/services/scraping-service';
import { AdapterFactory } from '../../../core/services/adapter-factory';
import { JobQueueService } from '../../../core/services/job-queue-service';
import { JobLifecycleService } from '../../../core/services/job-lifecycle-service';
import { AppConfig } from '../../../infrastructure/config/config';

/**
 * Registers core business services
 */
export function registerCoreServices(container: Container, _config: AppConfig): void {
  // Recipe loader service
  container.register(TOKENS.RecipeLoaderService, {
    lifetime: 'singleton',
    factory: async (c) => {
      const cfg = await c.resolve<AppConfig>(TOKENS.Config);
      return new RecipeLoader(cfg.recipesDir);
    },
  });

  // Recipe manager
  container.register(TOKENS.RecipeManager, {
    lifetime: 'singleton',
    factory: async (c) => {
      const cfg = await c.resolve<AppConfig>(TOKENS.Config);
      const recipeLoader = await c.resolve<RecipeLoader>(TOKENS.RecipeLoaderService);
      return new RecipeManager(cfg.recipesDir, recipeLoader);
    },
  });

  // CSV generator
  container.register(TOKENS.CsvGenerator, {
    lifetime: 'singleton',
    factory: () => new CsvGenerator(),
  });

  // Adapter factory
  container.register(TOKENS.AdapterFactory, {
    lifetime: 'singleton',
    factory: async (c) => new AdapterFactory(
      await c.resolve(TOKENS.RecipeManager),
      await c.resolve(TOKENS.Logger),
    ),
  });

  // Job queue service
  container.register(TOKENS.JobQueueService, {
    lifetime: 'singleton',
    factory: () => new JobQueueService(),
  });

  // Job lifecycle service
  container.register(TOKENS.JobLifecycleService, {
    lifetime: 'singleton',
    factory: () => new JobLifecycleService(),
  });

  // Scraping service
  container.register(TOKENS.ScrapingService, {
    lifetime: 'singleton',
    factory: async (c) => new ScrapingService(
      await c.resolve(TOKENS.StorageService),
      await c.resolve(TOKENS.RecipeManager),
      await c.resolve(TOKENS.CsvGenerator),
      await c.resolve(TOKENS.Logger),
      await c.resolve(TOKENS.AdapterFactory),
      await c.resolve(TOKENS.JobQueueService),
      await c.resolve(TOKENS.JobLifecycleService),
    ),
  });
}
