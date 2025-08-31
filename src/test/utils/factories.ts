import { RecipeConfig, RawProduct, NormalizedProduct, ScrapingJob, JobResult } from '../../types';

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

function merge<T>(base: T, overrides?: DeepPartial<T>): T {
  if (!overrides) return base;
  const output: unknown = Array.isArray(base) ? [...base] : { ...base };
  for (const key of Object.keys(overrides) as Array<keyof T>) {
    const baseVal: unknown = (base as any)[key];
    const overrideVal: unknown = (overrides as any)[key];
    if (
      baseVal &&
      overrideVal &&
      typeof baseVal === 'object' &&
      !Array.isArray(baseVal) &&
      typeof overrideVal === 'object' &&
      !Array.isArray(overrideVal)
    ) {
      (output as any)[key] = merge(baseVal, overrideVal);
    } else if (overrideVal !== undefined) {
      (output as any)[key] = overrideVal;
    }
  }
  return output as T;
}

export const factories = {
  recipe(overrides?: DeepPartial<RecipeConfig>): RecipeConfig {
    const base: RecipeConfig = {
      name: 'test-recipe',
      description: 'Recipe for tests',
      version: '1.0.0',
      siteUrl: 'https://example.com',
      selectors: {
        title: '.product-title',
        price: '.product-price',
        images: '.product-image',
        stock: '.product-stock',
        sku: '.product-sku',
        description: '.product-description',
        productLinks: '.product-link',
        attributes: '.product-attributes',
      },
      behavior: {
        useHeadlessBrowser: false,
        rateLimit: 25,
        maxConcurrent: 2,
        retryAttempts: 1,
        retryDelay: 50,
      },
      validation: {
        requiredFields: ['title', 'sku'],
        minDescriptionLength: 5,
        maxTitleLength: 120,
      },
    };
    return merge(base, overrides);
  },

  rawProduct(overrides?: DeepPartial<RawProduct>): RawProduct {
    const base: RawProduct = {
      id: 'p-001',
      title: 'Test Product',
      slug: 'test-product',
      description: 'A test product description',
      shortDescription: 'Short desc',
      sku: 'TP-001',
      stockStatus: 'instock',
      images: ['https://example.com/image.jpg'],
      category: 'Test Category',
      productType: 'simple',
      attributes: { color: ['Red', 'Blue'] },
      variations: [],
      price: '19.99',
      salePrice: undefined,
    };
    return merge(base, overrides);
  },

  normalizedProduct(overrides?: DeepPartial<NormalizedProduct>): NormalizedProduct {
    const base: NormalizedProduct = {
      id: 'p-001',
      title: 'Test Product',
      slug: 'test-product',
      description: 'A test product description',
      shortDescription: 'Short desc',
      sku: 'TP-001',
      stockStatus: 'instock',
      images: ['https://example.com/image.jpg'],
      category: 'Test Category',
      productType: 'simple',
      attributes: { color: ['Red', 'Blue'] },
      variations: [],
      regularPrice: '19.99',
      salePrice: undefined,
      normalizedAt: new Date(),
      sourceUrl: 'https://example.com/p/test',
      confidence: 0.95,
    };
    return merge(base, overrides);
  },

  scrapingJob(overrides?: DeepPartial<ScrapingJob>): ScrapingJob {
    const base: ScrapingJob = {
      id: 'job-001',
      status: 'pending',
      createdAt: new Date(),
      totalProducts: 0,
      processedProducts: 0,
      errors: [],
      metadata: {
        siteUrl: 'https://example.com',
        recipe: 'test-recipe',
        categories: ['all'],
      },
    };
    return merge(base, overrides);
  },

  jobResult(overrides?: DeepPartial<JobResult>): JobResult {
    const base: JobResult = {
      jobId: 'job-001',
      parentCsv: 'id,title\n1,Parent',
      variationCsv: 'id,parent,title\n2,1,Child',
      productCount: 1,
      variationCount: 0,
      filename: 'example-job-001.csv',
      metadata: {
        siteUrl: 'https://example.com',
        recipe: 'test-recipe',
        categories: ['all'],
      },
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
    return merge(base, overrides);
  },
};

export type FactoryOverrides = {
  recipe?: DeepPartial<RecipeConfig>;
  rawProduct?: DeepPartial<RawProduct>;
  normalizedProduct?: DeepPartial<NormalizedProduct>;
  scrapingJob?: DeepPartial<ScrapingJob>;
  jobResult?: DeepPartial<JobResult>;
};


