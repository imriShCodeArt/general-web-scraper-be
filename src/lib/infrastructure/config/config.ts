import { z } from 'zod';

const ConfigSchema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  RECIPES_DIR: z.string().default('./recipes'),
  STORAGE_PROVIDER: z.enum(['fs', 's3']).default('fs'),
  S3_BUCKET: z.string().optional(),
});

export type AppEnv = z.infer<typeof ConfigSchema>;

export type AppConfig = {
  nodeEnv: AppEnv['NODE_ENV'];
  logLevel: AppEnv['LOG_LEVEL'];
  recipesDir: string;
  storageProvider: AppEnv['STORAGE_PROVIDER'];
  s3Bucket?: string;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = ConfigSchema.safeParse(env);
  if (!parsed.success) {
    const details = parsed.error.errors.map(e => `${e.path.join('.')} ${e.message}`).join('; ');
    throw new Error(`Invalid environment configuration: ${details}`);
  }
  const cfg = parsed.data;
  return {
    nodeEnv: cfg.NODE_ENV,
    logLevel: cfg.LOG_LEVEL,
    recipesDir: cfg.RECIPES_DIR,
    storageProvider: cfg.STORAGE_PROVIDER,
    s3Bucket: cfg.S3_BUCKET,
  };
}


