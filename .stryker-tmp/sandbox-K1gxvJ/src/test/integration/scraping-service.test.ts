// @ts-nocheck
import { ScrapingService } from '../../lib/scraping-service';
import { RecipeManager } from '../../lib/recipe-manager';
import { SiteAdapter, RawProduct } from '../../types';
import { CsvGenerator } from '../../lib/csv-generator';
import path from 'path';
import fs from 'fs';

describe('ScrapingService integration', () => {
  let service: ScrapingService;

  const fixturesDir = path.resolve(__dirname, '../fixtures');
  const productsFixture = JSON.parse(
    fs.readFileSync(path.join(fixturesDir, 'mock-products.json'), 'utf8'),
  );

  beforeEach(() => {
    service = new ScrapingService();
  });

  afterEach(async () => {
    await service.cleanup();
    jest.restoreAllMocks();
  });

  function createFakeAdapter(urls: string[]): SiteAdapter {
    return {
      discoverProducts: async function* () {
        for (const u of urls) {
          yield u;
        }
      },
      extractProduct: async (url: string): Promise<RawProduct> => {
        const base = productsFixture.rawProducts[0];
        return {
          ...base,
          id: path.basename(url),
          title: `${base.title} - ${path.basename(url)}`,
        } as unknown as RawProduct;
      },
      cleanup: async () => {
        // no-op
      },
    } as unknown as SiteAdapter;
  }

  it('starts, processes, and completes a job with limited products', async () => {
    const urls = ['https://example.com/p/1', 'https://example.com/p/2', 'https://example.com/p/3'];

    jest
      .spyOn(RecipeManager.prototype, 'createAdapter')
      .mockResolvedValue(createFakeAdapter(urls));

    jest.spyOn(RecipeManager.prototype, 'getRecipe').mockResolvedValue({
      name: 'mock-recipe',
      description: 'Mock',
      version: '1.0.0',
      siteUrl: 'https://example.com',
      selectors: {
        title: '.title',
        price: '.price',
        images: '.images',
        stock: '.stock',
        sku: '.sku',
        description: '.description',
        productLinks: '.link',
        attributes: '.attrs',
      },
      behavior: { useHeadlessBrowser: false, rateLimit: 50, maxConcurrent: 2, retryAttempts: 0, retryDelay: 0 },
      validation: { requiredFields: ['title', 'sku'], minDescriptionLength: 5, maxTitleLength: 120 },
    });

    jest.spyOn(CsvGenerator, 'generateBothCsvs').mockResolvedValue({
      parentCsv: 'id,title\n1,Alpha',
      variationCsv: 'id,parent_id,title\n2,1,Alpha Var',
      productCount: 1,
      variationCount: 1,
    });

    const start = await service.startScraping({
      siteUrl: 'https://example.com',
      recipe: 'mock-recipe',
      options: { maxProducts: 2 },
    });

    expect(start.success).toBe(true);
    const jobId = (start.data as { jobId: string }).jobId;
    expect(jobId).toBeTruthy();

    // Poll for completion
    const until = Date.now() + 5000;
    // eslint-disable-next-line no-constant-condition
    while (Date.now() < until) {
      const status = await service.getJobStatus(jobId);
      if (status.success && status.data?.status === 'completed') break;
      await new Promise((r) => setTimeout(r, 50));
    }

    const final = await service.getJobStatus(jobId);
    expect(final.success).toBe(true);
    expect(final.data?.status).toBe('completed');
    // total discovered may be >= processed due to normalization; processed equals maxProducts
    expect(final.data?.processedProducts).toBe(2);

    const perf = await service.getPerformanceMetrics();
    expect(perf.success).toBe(true);
    expect(perf.data?.totalJobs).toBeGreaterThanOrEqual(1);
  });

  it('returns error when getting unknown job', async () => {
    const res = await service.getJobStatus('unknown');
    expect(res.success).toBe(false);
    expect(res.error).toBeTruthy();
  });
});


