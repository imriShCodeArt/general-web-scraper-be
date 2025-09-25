// Infrastructure services registry
import { Container } from '../container';
import { TOKENS } from '../tokens';
import { IStorageService } from '../../storage/IStorageService';
import { FsStorageService } from '../../storage/fs-storage.service';
import { S3StorageService } from '../../storage/s3-storage.service';
import { HttpClient } from '../../http/http-client';
import pino from 'pino';
import { createLoggerFactory } from '../../logging/logger-factory';
import { AppConfig } from '../../../infrastructure/config/config';

/**
 * Registers infrastructure services
 */
export function registerInfrastructureServices(container: Container, _config: AppConfig): void {
  // Logger factory
  container.register(TOKENS.LoggerFactory, {
    lifetime: 'singleton',
    factory: async (c) => {
      const cfg = await c.resolve<AppConfig>(TOKENS.Config);
      const isProd = cfg.nodeEnv === 'production';
      const options: pino.LoggerOptions = isProd
        ? { level: cfg.logLevel }
        : { level: cfg.logLevel, transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } } };
      return createLoggerFactory(options);
    },
  });

  // Logger
  container.register(TOKENS.Logger, {
    lifetime: 'singleton',
    factory: async (c) => {
      const factory = await c.resolve<ReturnType<typeof createLoggerFactory>>(TOKENS.LoggerFactory);
      return factory();
    },
  });

  // Storage service
  container.register(TOKENS.StorageService, {
    lifetime: 'singleton',
    factory: async (c) => {
      const cfg = await c.resolve<AppConfig>(TOKENS.Config);
      if (cfg.storageProvider === 's3') {
        return new S3StorageService(cfg.s3Bucket || 'placeholder-bucket') as unknown as IStorageService;
      }
      return new FsStorageService() as unknown as IStorageService;
    },
    destroy: async (s) => {
      if (typeof (s as unknown as { destroy?: () => Promise<void> }).destroy === 'function') {
        await (s as unknown as { destroy: () => Promise<void> }).destroy();
      }
    },
  });

  // HTTP client
  container.register(TOKENS.HttpClient, {
    lifetime: 'singleton',
    factory: () => new HttpClient(),
  });
}
