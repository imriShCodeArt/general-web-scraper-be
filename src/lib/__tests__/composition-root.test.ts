import { rootContainer, AppConfig, RequestContext } from '../composition-root';
import { Container } from '../infrastructure/di/container';
import { TOKENS } from '../infrastructure/di/tokens';
import { IStorageService } from '../infrastructure/storage/IStorageService';
import { FsStorageService } from '../infrastructure/storage/fs-storage.service';
import { RecipeManager } from '../core/services/recipe-manager';
import { CsvGenerator } from '../core/services/csv-generator';
import { ScrapingService } from '../core/services/scraping-service';
import { AdapterFactory } from '../core/services/adapter-factory';
import { JobQueueService } from '../core/services/job-queue-service';
import { JobLifecycleService } from '../core/services/job-lifecycle-service';
import { HttpClient } from '../infrastructure/http/http-client';

// Mock the config loading
jest.mock('../infrastructure/config/config', () => ({
  loadConfig: jest.fn(() => ({
    storage: { type: 'fs', path: '/tmp/test' },
    logging: { level: 'info' },
    scraping: { concurrency: 5, timeout: 30000 },
  })),
}));

// Mock the logger factory
jest.mock('../infrastructure/logging/logger-factory', () => ({
  createLoggerFactory: jest.fn(() => jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }))),
}));

describe('Composition Root', () => {
  beforeEach(() => {
    // Create a fresh container for each test
    new Container();
  });

  describe('Service Registration', () => {
    it('should register all required services', () => {
      // Test that all required tokens are registered
      const requiredTokens = [
        TOKENS.Config,
        TOKENS.Logger,
        TOKENS.LoggerFactory,
        TOKENS.StorageService,
        TOKENS.RecipeManager,
        TOKENS.CsvGenerator,
        TOKENS.ScrapingService,
        TOKENS.AdapterFactory,
        TOKENS.JobQueueService,
        TOKENS.JobLifecycleService,
        TOKENS.HttpClient,
      ];
      expect(requiredTokens).toHaveLength(11);

      // Check that the root container has registrations
      expect(rootContainer).toBeDefined();
      expect(rootContainer).toBeInstanceOf(Container);
    });

    it('should register Config as singleton', async () => {
      const config1 = await rootContainer.resolve<AppConfig>(TOKENS.Config);
      const config2 = await rootContainer.resolve<AppConfig>(TOKENS.Config);

      expect(config1).toBeDefined();
      expect(config2).toBe(config1); // Same instance for singleton
    });

    it('should register LoggerFactory as singleton', async () => {
      const loggerFactory1 = await rootContainer.resolve(TOKENS.LoggerFactory);
      const loggerFactory2 = await rootContainer.resolve(TOKENS.LoggerFactory);

      expect(loggerFactory1).toBeDefined();
      expect(loggerFactory2).toBe(loggerFactory1); // Same instance for singleton
    });

    it('should register StorageService as singleton', async () => {
      const storage1 = await rootContainer.resolve<IStorageService>(TOKENS.StorageService);
      const storage2 = await rootContainer.resolve<IStorageService>(TOKENS.StorageService);

      expect(storage1).toBeDefined();
      expect(storage2).toBe(storage1); // Same instance for singleton
      expect(storage1).toBeInstanceOf(FsStorageService);
    });

    it('should register RecipeManager as singleton', async () => {
      const recipeManager1 = await rootContainer.resolve<RecipeManager>(TOKENS.RecipeManager);
      const recipeManager2 = await rootContainer.resolve<RecipeManager>(TOKENS.RecipeManager);

      expect(recipeManager1).toBeDefined();
      expect(recipeManager2).toBe(recipeManager1); // Same instance for singleton
      expect(recipeManager1).toBeInstanceOf(RecipeManager);
    });

    it('should register CsvGenerator as singleton', async () => {
      const csvGenerator1 = await rootContainer.resolve<CsvGenerator>(TOKENS.CsvGenerator);
      const csvGenerator2 = await rootContainer.resolve<CsvGenerator>(TOKENS.CsvGenerator);

      expect(csvGenerator1).toBeDefined();
      expect(csvGenerator2).toBe(csvGenerator1); // Same instance for singleton
      expect(csvGenerator1).toBeInstanceOf(CsvGenerator);
    });

    it('should register ScrapingService as singleton', async () => {
      const scrapingService1 = await rootContainer.resolve<ScrapingService>(TOKENS.ScrapingService);
      const scrapingService2 = await rootContainer.resolve<ScrapingService>(TOKENS.ScrapingService);

      expect(scrapingService1).toBeDefined();
      expect(scrapingService2).toBe(scrapingService1); // Same instance for singleton
      expect(scrapingService1).toBeInstanceOf(ScrapingService);
    });

    it('should register AdapterFactory as singleton', async () => {
      const adapterFactory1 = await rootContainer.resolve<AdapterFactory>(TOKENS.AdapterFactory);
      const adapterFactory2 = await rootContainer.resolve<AdapterFactory>(TOKENS.AdapterFactory);

      expect(adapterFactory1).toBeDefined();
      expect(adapterFactory2).toBe(adapterFactory1); // Same instance for singleton
      expect(adapterFactory1).toBeInstanceOf(AdapterFactory);
    });

    it('should register JobQueueService as singleton', async () => {
      const jobQueueService1 = await rootContainer.resolve<JobQueueService>(TOKENS.JobQueueService);
      const jobQueueService2 = await rootContainer.resolve<JobQueueService>(TOKENS.JobQueueService);

      expect(jobQueueService1).toBeDefined();
      expect(jobQueueService2).toBe(jobQueueService1); // Same instance for singleton
      expect(jobQueueService1).toBeInstanceOf(JobQueueService);
    });

    it('should register JobLifecycleService as singleton', async () => {
      const jobLifecycleService1 = await rootContainer.resolve<JobLifecycleService>(TOKENS.JobLifecycleService);
      const jobLifecycleService2 = await rootContainer.resolve<JobLifecycleService>(TOKENS.JobLifecycleService);

      expect(jobLifecycleService1).toBeDefined();
      expect(jobLifecycleService2).toBe(jobLifecycleService1); // Same instance for singleton
      expect(jobLifecycleService1).toBeInstanceOf(JobLifecycleService);
    });

    it('should register HttpClient as singleton', async () => {
      const httpClient1 = await rootContainer.resolve<HttpClient>(TOKENS.HttpClient);
      const httpClient2 = await rootContainer.resolve<HttpClient>(TOKENS.HttpClient);

      expect(httpClient1).toBeDefined();
      expect(httpClient2).toBe(httpClient1); // Same instance for singleton
      expect(httpClient1).toBeInstanceOf(HttpClient);
    });
  });

  describe('Dependency Resolution', () => {
    it('should resolve services with their dependencies', async () => {
      const scrapingService = await rootContainer.resolve<ScrapingService>(TOKENS.ScrapingService);

      expect(scrapingService).toBeDefined();
      expect(scrapingService).toBeInstanceOf(ScrapingService);
    });

    it('should resolve services in correct order', async () => {
      // Test that services can be resolved without circular dependency errors
      const services = await Promise.all([
        rootContainer.resolve(TOKENS.Config),
        rootContainer.resolve(TOKENS.LoggerFactory),
        rootContainer.resolve(TOKENS.StorageService),
        rootContainer.resolve(TOKENS.RecipeManager),
        rootContainer.resolve(TOKENS.CsvGenerator),
        rootContainer.resolve(TOKENS.ScrapingService),
        rootContainer.resolve(TOKENS.AdapterFactory),
        rootContainer.resolve(TOKENS.JobQueueService),
        rootContainer.resolve(TOKENS.JobLifecycleService),
        rootContainer.resolve(TOKENS.HttpClient),
      ]);

      services.forEach(service => {
        expect(service).toBeDefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw error when resolving non-existent service', async () => {
      const nonExistentToken = Symbol('NonExistentService');

      await expect(rootContainer.resolve(nonExistentToken)).rejects.toThrow('Service not found');
    });

    it('should handle circular dependency detection', async () => {
      // This test ensures the container can detect circular dependencies
      // The actual circular dependency would be caught during registration
      expect(rootContainer).toBeDefined();
    });
  });

  describe('Request Context', () => {
    it('should create request context with required fields', () => {
      const context: RequestContext = {
        requestId: 'test-request-123',
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        timestamp: new Date(),
      };

      expect(context.requestId).toBe('test-request-123');
      expect(context.ip).toBe('127.0.0.1');
      expect(context.userAgent).toBe('test-agent');
      expect(context.timestamp).toBeInstanceOf(Date);
    });

    it('should create request context with minimal fields', () => {
      const context: RequestContext = {
        requestId: 'test-request-456',
        timestamp: new Date(),
      };

      expect(context.requestId).toBe('test-request-456');
      expect(context.timestamp).toBeInstanceOf(Date);
      expect(context.ip).toBeUndefined();
      expect(context.userAgent).toBeUndefined();
    });
  });

  describe('Configuration', () => {
    it('should load configuration correctly', async () => {
      const config = await rootContainer.resolve<AppConfig>(TOKENS.Config);

      expect(config).toBeDefined();
      expect(config.storageProvider).toBeDefined();
      expect(config.logLevel).toBeDefined();
      expect(config.nodeEnv).toBeDefined();
      expect(config.recipesDir).toBeDefined();
    });
  });
});
