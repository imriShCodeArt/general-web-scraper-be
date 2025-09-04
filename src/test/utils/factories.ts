import { RecipeConfig, RawProduct, NormalizedProduct, ScrapingJob, JobResult } from '../../types';

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

function merge<T>(base: T, overrides?: DeepPartial<T>): T {
  if (!overrides) return base;
  const output: unknown = Array.isArray(base) ? [...base] : { ...base };
  for (const key of Object.keys(overrides) as Array<keyof T>) {
    const baseVal: unknown = (base as unknown as Record<string, unknown>)[key as string];
    const overrideVal: unknown = (overrides as unknown as Record<string, unknown>)[key as string];
    if (
      baseVal &&
      overrideVal &&
      typeof baseVal === 'object' &&
      !Array.isArray(baseVal) &&
      typeof overrideVal === 'object' &&
      !Array.isArray(overrideVal)
    ) {
      (output as Record<string, unknown>)[key as string] = merge(baseVal, overrideVal);
    } else if (overrideVal !== undefined) {
      (output as Record<string, unknown>)[key as string] = overrideVal;
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
      title: 'Premium Test Product',
      slug: 'premium-test-product',
      description:
        'A comprehensive test product description with detailed information about features, benefits, and specifications. This product is designed for testing purposes and includes realistic content for validation.',
      shortDescription: 'High-quality test product with advanced features',
      sku: 'TP-001',
      stockStatus: 'instock',
      images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      category: 'Test Category',
      productType: 'simple',
      attributes: {
        color: ['Red', 'Blue', 'Green'],
        size: ['Small', 'Medium', 'Large'],
        material: ['Cotton', 'Polyester'],
      },
      variations: [],
      regularPrice: '29.99',
      salePrice: '24.99',
      normalizedAt: new Date(),
      sourceUrl: 'https://example.com/p/test',
      confidence: 0.95,
    };
    return merge(base, overrides);
  },

  variableProduct(overrides?: DeepPartial<NormalizedProduct>): NormalizedProduct {
    const base: NormalizedProduct = {
      id: 'p-002',
      title: 'Variable Test Product Collection',
      slug: 'variable-test-product-collection',
      description:
        'A comprehensive variable product with multiple variations. Each variation offers different combinations of attributes while maintaining consistent quality and design. Perfect for testing complex product structures.',
      shortDescription: 'Multi-variation test product with extensive options',
      sku: 'VTP-001',
      stockStatus: 'instock',
      images: ['https://example.com/variable1.jpg', 'https://example.com/variable2.jpg'],
      category: 'Test Category',
      productType: 'variable',
      attributes: {
        color: ['Red', 'Blue', 'Green', 'Black', 'White'],
        size: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        material: ['Cotton', 'Polyester', 'Wool'],
      },
      variations: [
        {
          sku: 'VTP-001-RED-S',
          regularPrice: '34.99',
          salePrice: '29.99',
          taxClass: 'standard',
          stockStatus: 'instock',
          images: ['https://example.com/red-s.jpg'],
          attributeAssignments: {
            color: 'Red',
            size: 'S',
            material: 'Cotton',
          },
        },
        {
          sku: 'VTP-001-BLUE-M',
          regularPrice: '34.99',
          salePrice: '29.99',
          taxClass: 'standard',
          stockStatus: 'instock',
          images: ['https://example.com/blue-m.jpg'],
          attributeAssignments: {
            color: 'Blue',
            size: 'M',
            material: 'Polyester',
          },
        },
        {
          sku: 'VTP-001-GREEN-L',
          regularPrice: '34.99',
          salePrice: '29.99',
          taxClass: 'standard',
          stockStatus: 'outofstock',
          images: ['https://example.com/green-l.jpg'],
          attributeAssignments: {
            color: 'Green',
            size: 'L',
            material: 'Wool',
          },
        },
        {
          sku: 'VTP-001-BLACK-XL',
          regularPrice: '34.99',
          salePrice: '29.99',
          taxClass: 'standard',
          stockStatus: 'instock',
          images: ['https://example.com/black-xl.jpg'],
          attributeAssignments: {
            color: 'Black',
            size: 'XL',
            material: 'Cotton',
          },
        },
      ],
      regularPrice: '34.99',
      salePrice: '29.99',
      normalizedAt: new Date(),
      sourceUrl: 'https://example.com/p/variable-test',
      confidence: 0.92,
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
