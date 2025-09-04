// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import { randomUUID } from 'crypto';
import { ScrapingJob, ScrapingRequest, NormalizedProduct, JobResult, ApiResponse, RawProductData, NormalizableProductData, ProductOptions, GenericMetadata, RecipeConfig } from '../types';
import { SiteAdapter } from '../types';
import { NormalizationToolkit } from './normalization';
import { CsvGenerator } from './csv-generator';
import { StorageService } from './storage';
import { RecipeManager } from './recipe-manager';
import { ErrorFactory, ErrorCodes } from './error-handler';
import pino from 'pino';
export class ScrapingService {
  private logger: pino.Logger;
  private storage: StorageService;
  private recipeManager: RecipeManager;
  private csvGenerator: CsvGenerator;
  private activeJobs = new Map<string, ScrapingJob<ProductOptions>>();
  private jobQueue: ScrapingJob<ProductOptions>[] = stryMutAct_9fa48("2710") ? ["Stryker was here"] : (stryCov_9fa48("2710"), []);
  private isProcessing = stryMutAct_9fa48("2711") ? true : (stryCov_9fa48("2711"), false);
  private performanceMetrics = stryMutAct_9fa48("2712") ? {} : (stryCov_9fa48("2712"), {
    totalJobs: 0,
    totalProducts: 0,
    averageTimePerProduct: 0,
    totalProcessingTime: 0
  });

  /**
   * Helper method to create ApiResponse objects with required fields
   */
  private createApiResponse<T, E = string>(success: boolean, data?: T, error?: E, message?: string): ApiResponse<T, E> {
    if (stryMutAct_9fa48("2713")) {
      {}
    } else {
      stryCov_9fa48("2713");
      return stryMutAct_9fa48("2714") ? {} : (stryCov_9fa48("2714"), {
        success,
        data,
        error,
        message,
        timestamp: new Date(),
        requestId: randomUUID()
      });
    }
  }

  /**
   * Helper method to create success ApiResponse objects
   */
  private createSuccessResponse<T>(data: T, message?: string): ApiResponse<T, string> {
    if (stryMutAct_9fa48("2715")) {
      {}
    } else {
      stryCov_9fa48("2715");
      return this.createApiResponse(stryMutAct_9fa48("2716") ? false : (stryCov_9fa48("2716"), true), data, stryMutAct_9fa48("2717") ? "Stryker was here!" : (stryCov_9fa48("2717"), ''), message);
    }
  }

  /**
   * Helper method to create error ApiResponse objects
   */
  private createErrorResponse<T, E>(error: E, message?: string): ApiResponse<T, E> {
    if (stryMutAct_9fa48("2718")) {
      {}
    } else {
      stryCov_9fa48("2718");
      return this.createApiResponse(stryMutAct_9fa48("2719") ? true : (stryCov_9fa48("2719"), false), undefined as T, error, message);
    }
  }
  constructor(storage?: StorageService, recipeManager?: RecipeManager, csvGenerator?: CsvGenerator, logger?: pino.Logger) {
    if (stryMutAct_9fa48("2720")) {
      {}
    } else {
      stryCov_9fa48("2720");
      this.logger = stryMutAct_9fa48("2723") ? logger && pino({
        level: process.env.LOG_LEVEL || 'warn',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard'
          }
        }
      }) : stryMutAct_9fa48("2722") ? false : stryMutAct_9fa48("2721") ? true : (stryCov_9fa48("2721", "2722", "2723"), logger || pino(stryMutAct_9fa48("2724") ? {} : (stryCov_9fa48("2724"), {
        level: stryMutAct_9fa48("2727") ? process.env.LOG_LEVEL && 'warn' : stryMutAct_9fa48("2726") ? false : stryMutAct_9fa48("2725") ? true : (stryCov_9fa48("2725", "2726", "2727"), process.env.LOG_LEVEL || (stryMutAct_9fa48("2728") ? "" : (stryCov_9fa48("2728"), 'warn'))),
        transport: stryMutAct_9fa48("2729") ? {} : (stryCov_9fa48("2729"), {
          target: stryMutAct_9fa48("2730") ? "" : (stryCov_9fa48("2730"), 'pino-pretty'),
          options: stryMutAct_9fa48("2731") ? {} : (stryCov_9fa48("2731"), {
            colorize: stryMutAct_9fa48("2732") ? false : (stryCov_9fa48("2732"), true),
            translateTime: stryMutAct_9fa48("2733") ? "" : (stryCov_9fa48("2733"), 'SYS:standard')
          })
        })
      })));
      this.storage = stryMutAct_9fa48("2736") ? storage && new StorageService() : stryMutAct_9fa48("2735") ? false : stryMutAct_9fa48("2734") ? true : (stryCov_9fa48("2734", "2735", "2736"), storage || new StorageService());
      this.recipeManager = stryMutAct_9fa48("2739") ? recipeManager && new RecipeManager() : stryMutAct_9fa48("2738") ? false : stryMutAct_9fa48("2737") ? true : (stryCov_9fa48("2737", "2738", "2739"), recipeManager || new RecipeManager());
      this.csvGenerator = stryMutAct_9fa48("2742") ? csvGenerator && new CsvGenerator() : stryMutAct_9fa48("2741") ? false : stryMutAct_9fa48("2740") ? true : (stryCov_9fa48("2740", "2741", "2742"), csvGenerator || new CsvGenerator());
    }
  }

  /**
   * Normalize a raw product with proper generic constraints
   *
   * @param rawProduct - Raw product object from adapter with generic constraints
   * @param url - Optional product URL for context
   */
  private async normalizeProduct<T extends NormalizableProductData>(rawProduct: T, url?: string): Promise<NormalizedProduct> {
    if (stryMutAct_9fa48("2743")) {
      {}
    } else {
      stryCov_9fa48("2743");
      return NormalizationToolkit.normalizeProduct(rawProduct, stryMutAct_9fa48("2746") ? url && '' : stryMutAct_9fa48("2745") ? false : stryMutAct_9fa48("2744") ? true : (stryCov_9fa48("2744", "2745", "2746"), url || (stryMutAct_9fa48("2747") ? "Stryker was here!" : (stryCov_9fa48("2747"), ''))));
    }
  }

  /**
   * Generate filename for CSV outputs
   *
   * @param siteUrl - The site URL being scraped
   * @param jobId - The job identifier
   */
  private generateFilename(siteUrl: string, jobId: string): string {
    if (stryMutAct_9fa48("2748")) {
      {}
    } else {
      stryCov_9fa48("2748");
      const domain = new URL(siteUrl).hostname;
      return stryMutAct_9fa48("2749") ? `` : (stryCov_9fa48("2749"), `${domain}-${jobId}.csv`);
    }
  }

  /**
   * Start a new scraping job.
   *
   * @param request - Includes `siteUrl`, `recipe`, and optional `options`.
   * @returns ApiResponse containing the created `jobId`.
   */
  async startScraping(request: ScrapingRequest<ProductOptions>): Promise<ApiResponse<{
    jobId: string;
  }>> {
    if (stryMutAct_9fa48("2750")) {
      {}
    } else {
      stryCov_9fa48("2750");
      try {
        if (stryMutAct_9fa48("2751")) {
          {}
        } else {
          stryCov_9fa48("2751");
          // Validate request
          if (stryMutAct_9fa48("2754") ? !request.siteUrl && !request.recipe : stryMutAct_9fa48("2753") ? false : stryMutAct_9fa48("2752") ? true : (stryCov_9fa48("2752", "2753", "2754"), (stryMutAct_9fa48("2755") ? request.siteUrl : (stryCov_9fa48("2755"), !request.siteUrl)) || (stryMutAct_9fa48("2756") ? request.recipe : (stryCov_9fa48("2756"), !request.recipe)))) {
            if (stryMutAct_9fa48("2757")) {
              {}
            } else {
              stryCov_9fa48("2757");
              return this.createErrorResponse<{
                jobId: string;
              }, string>(stryMutAct_9fa48("2758") ? "" : (stryCov_9fa48("2758"), 'Missing required fields: siteUrl and recipe'));
            }
          }

          // Create job
          const jobId = randomUUID();
          const job: ScrapingJob<ProductOptions> = stryMutAct_9fa48("2759") ? {} : (stryCov_9fa48("2759"), {
            id: jobId,
            status: stryMutAct_9fa48("2760") ? "" : (stryCov_9fa48("2760"), 'pending'),
            createdAt: new Date(),
            totalProducts: 0,
            processedProducts: 0,
            errors: stryMutAct_9fa48("2761") ? ["Stryker was here"] : (stryCov_9fa48("2761"), []),
            metadata: stryMutAct_9fa48("2762") ? {} : (stryCov_9fa48("2762"), {
              siteUrl: request.siteUrl,
              recipe: request.recipe,
              categories: stryMutAct_9fa48("2765") ? request.options?.categories && [] : stryMutAct_9fa48("2764") ? false : stryMutAct_9fa48("2763") ? true : (stryCov_9fa48("2763", "2764", "2765"), (stryMutAct_9fa48("2766") ? request.options.categories : (stryCov_9fa48("2766"), request.options?.categories)) || (stryMutAct_9fa48("2767") ? ["Stryker was here"] : (stryCov_9fa48("2767"), []))),
              options: request.options // Store the full options object for maxProducts access
            })
          });

          // Add to queue
          this.jobQueue.push(job);
          this.activeJobs.set(jobId, job);
          this.logger.info(stryMutAct_9fa48("2768") ? `` : (stryCov_9fa48("2768"), `Created scraping job ${jobId} for ${request.siteUrl}`));

          // Start processing if not already running
          if (stryMutAct_9fa48("2771") ? false : stryMutAct_9fa48("2770") ? true : stryMutAct_9fa48("2769") ? this.isProcessing : (stryCov_9fa48("2769", "2770", "2771"), !this.isProcessing)) {
            if (stryMutAct_9fa48("2772")) {
              {}
            } else {
              stryCov_9fa48("2772");
              this.processQueue();
            }
          }
          return this.createSuccessResponse(stryMutAct_9fa48("2773") ? {} : (stryCov_9fa48("2773"), {
            jobId
          }), stryMutAct_9fa48("2774") ? "" : (stryCov_9fa48("2774"), 'Scraping job created successfully'));
        }
      } catch (error) {
        if (stryMutAct_9fa48("2775")) {
          {}
        } else {
          stryCov_9fa48("2775");
          this.logger.error(stryMutAct_9fa48("2776") ? "" : (stryCov_9fa48("2776"), 'Failed to start scraping job:'), error);
          return this.createErrorResponse<{
            jobId: string;
          }, string>(stryMutAct_9fa48("2777") ? `` : (stryCov_9fa48("2777"), `Failed to start scraping job: ${error}`));
        }
      }
    }
  }

  /**
   * Process the job queue
   */
  private async processQueue(): Promise<void> {
    if (stryMutAct_9fa48("2778")) {
      {}
    } else {
      stryCov_9fa48("2778");
      if (stryMutAct_9fa48("2781") ? this.isProcessing && this.jobQueue.length === 0 : stryMutAct_9fa48("2780") ? false : stryMutAct_9fa48("2779") ? true : (stryCov_9fa48("2779", "2780", "2781"), this.isProcessing || (stryMutAct_9fa48("2783") ? this.jobQueue.length !== 0 : stryMutAct_9fa48("2782") ? false : (stryCov_9fa48("2782", "2783"), this.jobQueue.length === 0)))) {
        if (stryMutAct_9fa48("2784")) {
          {}
        } else {
          stryCov_9fa48("2784");
          return;
        }
      }
      this.isProcessing = stryMutAct_9fa48("2785") ? false : (stryCov_9fa48("2785"), true);
      while (stryMutAct_9fa48("2788") ? this.jobQueue.length <= 0 : stryMutAct_9fa48("2787") ? this.jobQueue.length >= 0 : stryMutAct_9fa48("2786") ? false : (stryCov_9fa48("2786", "2787", "2788"), this.jobQueue.length > 0)) {
        if (stryMutAct_9fa48("2789")) {
          {}
        } else {
          stryCov_9fa48("2789");
          const job = this.jobQueue.shift();
          if (stryMutAct_9fa48("2791") ? false : stryMutAct_9fa48("2790") ? true : (stryCov_9fa48("2790", "2791"), job)) {
            if (stryMutAct_9fa48("2792")) {
              {}
            } else {
              stryCov_9fa48("2792");
              await this.processJob(job);
            }
          }
        }
      }
      this.isProcessing = stryMutAct_9fa48("2793") ? true : (stryCov_9fa48("2793"), false);
    }
  }

  /**
   * Process a single job
   */
  private async processJob(job: ScrapingJob<ProductOptions>): Promise<void> {
    if (stryMutAct_9fa48("2794")) {
      {}
    } else {
      stryCov_9fa48("2794");
      try {
        if (stryMutAct_9fa48("2795")) {
          {}
        } else {
          stryCov_9fa48("2795");
          this.logger.info(stryMutAct_9fa48("2796") ? `` : (stryCov_9fa48("2796"), `Starting job ${job.id} for ${job.metadata.siteUrl}`));
          job.status = stryMutAct_9fa48("2797") ? "" : (stryCov_9fa48("2797"), 'running');
          job.startedAt = new Date();

          // Get recipe configuration
          const recipe = await this.recipeManager.getRecipe(job.metadata.recipe);
          if (stryMutAct_9fa48("2800") ? false : stryMutAct_9fa48("2799") ? true : stryMutAct_9fa48("2798") ? recipe : (stryCov_9fa48("2798", "2799", "2800"), !recipe)) {
            if (stryMutAct_9fa48("2801")) {
              {}
            } else {
              stryCov_9fa48("2801");
              throw new Error(stryMutAct_9fa48("2802") ? `` : (stryCov_9fa48("2802"), `Recipe not found: ${job.metadata.recipe}`));
            }
          }

          // Create adapter
          const adapter = await this.createAdapter(job.metadata.recipe, job.metadata.siteUrl);
          try {
            if (stryMutAct_9fa48("2803")) {
              {}
            } else {
              stryCov_9fa48("2803");
              // Discover products with optional limit
              const productUrls: string[] = stryMutAct_9fa48("2804") ? ["Stryker was here"] : (stryCov_9fa48("2804"), []);
              const options = stryMutAct_9fa48("2807") ? job.metadata.options && {} : stryMutAct_9fa48("2806") ? false : stryMutAct_9fa48("2805") ? true : (stryCov_9fa48("2805", "2806", "2807"), job.metadata.options || {});
              const maxProducts: number | undefined = (stryMutAct_9fa48("2810") ? typeof options.maxProducts !== 'number' : stryMutAct_9fa48("2809") ? false : stryMutAct_9fa48("2808") ? true : (stryCov_9fa48("2808", "2809", "2810"), typeof options.maxProducts === (stryMutAct_9fa48("2811") ? "" : (stryCov_9fa48("2811"), 'number')))) ? options.maxProducts : undefined;
              for await (const url of adapter.discoverProducts()) {
                if (stryMutAct_9fa48("2812")) {
                  {}
                } else {
                  stryCov_9fa48("2812");
                  productUrls.push(url);

                  // Stop discovering if we've reached the limit
                  if (stryMutAct_9fa48("2815") ? maxProducts || productUrls.length >= maxProducts : stryMutAct_9fa48("2814") ? false : stryMutAct_9fa48("2813") ? true : (stryCov_9fa48("2813", "2814", "2815"), maxProducts && (stryMutAct_9fa48("2818") ? productUrls.length < maxProducts : stryMutAct_9fa48("2817") ? productUrls.length > maxProducts : stryMutAct_9fa48("2816") ? true : (stryCov_9fa48("2816", "2817", "2818"), productUrls.length >= maxProducts)))) {
                    if (stryMutAct_9fa48("2819")) {
                      {}
                    } else {
                      stryCov_9fa48("2819");
                      this.logger.info(stryMutAct_9fa48("2820") ? `` : (stryCov_9fa48("2820"), `Reached product limit of ${maxProducts}, stopping discovery`));
                      break;
                    }
                  }
                }
              }
              job.totalProducts = productUrls.length;
              this.logger.info(stryMutAct_9fa48("2821") ? `` : (stryCov_9fa48("2821"), `Discovered ${productUrls.length} products for job ${job.id}${maxProducts ? stryMutAct_9fa48("2822") ? `` : (stryCov_9fa48("2822"), ` (limited to ${maxProducts})`) : stryMutAct_9fa48("2823") ? "Stryker was here!" : (stryCov_9fa48("2823"), '')}`));
              if (stryMutAct_9fa48("2826") ? productUrls.length !== 0 : stryMutAct_9fa48("2825") ? false : stryMutAct_9fa48("2824") ? true : (stryCov_9fa48("2824", "2825", "2826"), productUrls.length === 0)) {
                if (stryMutAct_9fa48("2827")) {
                  {}
                } else {
                  stryCov_9fa48("2827");
                  throw new Error(stryMutAct_9fa48("2828") ? "" : (stryCov_9fa48("2828"), 'No products found'));
                }
              }

              // Enhanced concurrent processing with optimized settings
              const products: NormalizedProduct[] = stryMutAct_9fa48("2829") ? ["Stryker was here"] : (stryCov_9fa48("2829"), []);
              const maxConcurrent = stryMutAct_9fa48("2830") ? Math.max(recipe.behavior?.maxConcurrent || 10,
              // Increased default from 5 to 10
              productUrls.length // Don't exceed the number of products
              ) : (stryCov_9fa48("2830"), Math.min(stryMutAct_9fa48("2833") ? recipe.behavior?.maxConcurrent && 10 : stryMutAct_9fa48("2832") ? false : stryMutAct_9fa48("2831") ? true : (stryCov_9fa48("2831", "2832", "2833"), (stryMutAct_9fa48("2834") ? recipe.behavior.maxConcurrent : (stryCov_9fa48("2834"), recipe.behavior?.maxConcurrent)) || 10),
              // Increased default from 5 to 10
              productUrls.length // Don't exceed the number of products
              ));
              const rateLimit = stryMutAct_9fa48("2835") ? Math.min(recipe.behavior?.rateLimit || 50, 10) : (stryCov_9fa48("2835"), Math.max(stryMutAct_9fa48("2838") ? recipe.behavior?.rateLimit && 50 : stryMutAct_9fa48("2837") ? false : stryMutAct_9fa48("2836") ? true : (stryCov_9fa48("2836", "2837", "2838"), (stryMutAct_9fa48("2839") ? recipe.behavior.rateLimit : (stryCov_9fa48("2839"), recipe.behavior?.rateLimit)) || 50), 10)); // Reduced default from 200ms to 50ms, minimum 10ms

              this.logger.info(stryMutAct_9fa48("2840") ? `` : (stryCov_9fa48("2840"), `Processing ${productUrls.length} products with ${maxConcurrent} concurrent workers and ${rateLimit}ms rate limit`));

              // Process products in optimized batches with connection pooling
              const batchSize = maxConcurrent;
              for (let i = 0; stryMutAct_9fa48("2843") ? i >= productUrls.length : stryMutAct_9fa48("2842") ? i <= productUrls.length : stryMutAct_9fa48("2841") ? false : (stryCov_9fa48("2841", "2842", "2843"), i < productUrls.length); stryMutAct_9fa48("2844") ? i -= batchSize : (stryCov_9fa48("2844"), i += batchSize)) {
                if (stryMutAct_9fa48("2845")) {
                  {}
                } else {
                  stryCov_9fa48("2845");
                  const batch = stryMutAct_9fa48("2846") ? productUrls : (stryCov_9fa48("2846"), productUrls.slice(i, stryMutAct_9fa48("2847") ? i - batchSize : (stryCov_9fa48("2847"), i + batchSize)));
                  const batchStartTime = Date.now();

                  // Process batch concurrently with better error handling
                  const batchPromises = batch.map(async (url, batchIndex) => {
                    if (stryMutAct_9fa48("2848")) {
                      {}
                    } else {
                      stryCov_9fa48("2848");
                      if (stryMutAct_9fa48("2851") ? false : stryMutAct_9fa48("2850") ? true : stryMutAct_9fa48("2849") ? url : (stryCov_9fa48("2849", "2850", "2851"), !url)) return null;
                      const globalIndex = stryMutAct_9fa48("2852") ? i - batchIndex : (stryCov_9fa48("2852"), i + batchIndex);
                      try {
                        if (stryMutAct_9fa48("2853")) {
                          {}
                        } else {
                          stryCov_9fa48("2853");
                          this.logger.debug(stryMutAct_9fa48("2854") ? `` : (stryCov_9fa48("2854"), `Processing product ${stryMutAct_9fa48("2855") ? globalIndex - 1 : (stryCov_9fa48("2855"), globalIndex + 1)}/${productUrls.length}: ${url}`));
                          const startTime = Date.now();
                          const rawProduct = await adapter.extractProduct(url);
                          const extractionTime = stryMutAct_9fa48("2856") ? Date.now() + startTime : (stryCov_9fa48("2856"), Date.now() - startTime);
                          this.logger.debug(stryMutAct_9fa48("2857") ? `` : (stryCov_9fa48("2857"), `Raw product data extracted in ${extractionTime}ms:`), stryMutAct_9fa48("2858") ? {} : (stryCov_9fa48("2858"), {
                            title: stryMutAct_9fa48("2860") ? rawProduct.title.substring(0, 50) : stryMutAct_9fa48("2859") ? rawProduct.title : (stryCov_9fa48("2859", "2860"), rawProduct.title?.substring(0, 50)),
                            hasAttributes: stryMutAct_9fa48("2864") ? Object.keys(rawProduct.attributes || {}).length <= 0 : stryMutAct_9fa48("2863") ? Object.keys(rawProduct.attributes || {}).length >= 0 : stryMutAct_9fa48("2862") ? false : stryMutAct_9fa48("2861") ? true : (stryCov_9fa48("2861", "2862", "2863", "2864"), Object.keys(stryMutAct_9fa48("2867") ? rawProduct.attributes && {} : stryMutAct_9fa48("2866") ? false : stryMutAct_9fa48("2865") ? true : (stryCov_9fa48("2865", "2866", "2867"), rawProduct.attributes || {})).length > 0),
                            hasVariations: stryMutAct_9fa48("2871") ? (rawProduct.variations || []).length <= 0 : stryMutAct_9fa48("2870") ? (rawProduct.variations || []).length >= 0 : stryMutAct_9fa48("2869") ? false : stryMutAct_9fa48("2868") ? true : (stryCov_9fa48("2868", "2869", "2870", "2871"), (stryMutAct_9fa48("2874") ? rawProduct.variations && [] : stryMutAct_9fa48("2873") ? false : stryMutAct_9fa48("2872") ? true : (stryCov_9fa48("2872", "2873", "2874"), rawProduct.variations || (stryMutAct_9fa48("2875") ? ["Stryker was here"] : (stryCov_9fa48("2875"), [])))).length > 0),
                            hasShortDescription: rawProduct.shortDescription,
                            hasStockStatus: rawProduct.stockStatus,
                            hasImages: stryMutAct_9fa48("2879") ? (rawProduct.images || []).length <= 0 : stryMutAct_9fa48("2878") ? (rawProduct.images || []).length >= 0 : stryMutAct_9fa48("2877") ? false : stryMutAct_9fa48("2876") ? true : (stryCov_9fa48("2876", "2877", "2878", "2879"), (stryMutAct_9fa48("2882") ? rawProduct.images && [] : stryMutAct_9fa48("2881") ? false : stryMutAct_9fa48("2880") ? true : (stryCov_9fa48("2880", "2881", "2882"), rawProduct.images || (stryMutAct_9fa48("2883") ? ["Stryker was here"] : (stryCov_9fa48("2883"), [])))).length > 0),
                            hasCategory: rawProduct.category
                          }));
                          const normalizedProduct = await this.normalizeProduct(rawProduct, url);
                          this.logger.debug(stryMutAct_9fa48("2884") ? "" : (stryCov_9fa48("2884"), 'Normalized product:'), stryMutAct_9fa48("2885") ? {} : (stryCov_9fa48("2885"), {
                            title: stryMutAct_9fa48("2887") ? normalizedProduct.title.substring(0, 50) : stryMutAct_9fa48("2886") ? normalizedProduct.title : (stryCov_9fa48("2886", "2887"), normalizedProduct.title?.substring(0, 50)),
                            productType: normalizedProduct.productType,
                            hasVariations: stryMutAct_9fa48("2891") ? normalizedProduct.variations.length <= 0 : stryMutAct_9fa48("2890") ? normalizedProduct.variations.length >= 0 : stryMutAct_9fa48("2889") ? false : stryMutAct_9fa48("2888") ? true : (stryCov_9fa48("2888", "2889", "2890", "2891"), normalizedProduct.variations.length > 0),
                            hasAttributes: stryMutAct_9fa48("2895") ? Object.keys(normalizedProduct.attributes).length <= 0 : stryMutAct_9fa48("2894") ? Object.keys(normalizedProduct.attributes).length >= 0 : stryMutAct_9fa48("2893") ? false : stryMutAct_9fa48("2892") ? true : (stryCov_9fa48("2892", "2893", "2894", "2895"), Object.keys(normalizedProduct.attributes).length > 0)
                          }));
                          job.processedProducts = stryMutAct_9fa48("2896") ? globalIndex - 1 : (stryCov_9fa48("2896"), globalIndex + 1);
                          return normalizedProduct;
                        }
                      } catch (error) {
                        if (stryMutAct_9fa48("2897")) {
                          {}
                        } else {
                          stryCov_9fa48("2897");
                          const errorMsg = stryMutAct_9fa48("2898") ? `` : (stryCov_9fa48("2898"), `Failed to process product ${url}: ${error}`);
                          this.logger.error(errorMsg);
                          const scrapingError = ErrorFactory.createScrapingError(errorMsg, ErrorCodes.PRODUCT_NOT_FOUND, stryMutAct_9fa48("2899") ? false : (stryCov_9fa48("2899"), true));
                          job.errors.push(scrapingError);
                          return null;
                        }
                      }
                    }
                  });

                  // Wait for batch to complete
                  const batchResults = await Promise.all(batchPromises);
                  const validProducts = batchResults.filter(p => p !== null) as NormalizedProduct[];
                  products.push(...validProducts);
                  const batchTime = stryMutAct_9fa48("2900") ? Date.now() + batchStartTime : (stryCov_9fa48("2900"), Date.now() - batchStartTime);
                  this.logger.debug(stryMutAct_9fa48("2901") ? `` : (stryCov_9fa48("2901"), `Batch completed in ${batchTime}ms, processed ${validProducts.length}/${batch.length} products successfully`));

                  // Fixed delay between batches to respect configured rateLimit
                  if (stryMutAct_9fa48("2904") ? i + batchSize < productUrls.length || rateLimit > 0 : stryMutAct_9fa48("2903") ? false : stryMutAct_9fa48("2902") ? true : (stryCov_9fa48("2902", "2903", "2904"), (stryMutAct_9fa48("2907") ? i + batchSize >= productUrls.length : stryMutAct_9fa48("2906") ? i + batchSize <= productUrls.length : stryMutAct_9fa48("2905") ? true : (stryCov_9fa48("2905", "2906", "2907"), (stryMutAct_9fa48("2908") ? i - batchSize : (stryCov_9fa48("2908"), i + batchSize)) < productUrls.length)) && (stryMutAct_9fa48("2911") ? rateLimit <= 0 : stryMutAct_9fa48("2910") ? rateLimit >= 0 : stryMutAct_9fa48("2909") ? true : (stryCov_9fa48("2909", "2910", "2911"), rateLimit > 0)))) {
                    if (stryMutAct_9fa48("2912")) {
                      {}
                    } else {
                      stryCov_9fa48("2912");
                      this.logger.debug(stryMutAct_9fa48("2913") ? `` : (stryCov_9fa48("2913"), `Waiting ${rateLimit}ms before next batch...`));
                      await this.delay(rateLimit);
                    }
                  }
                }
              }

              // Generate CSV files
              const csvResult = await CsvGenerator.generateBothCsvs(products);
              this.logger.debug(stryMutAct_9fa48("2914") ? "" : (stryCov_9fa48("2914"), 'Product type detection results:'), stryMutAct_9fa48("2915") ? {} : (stryCov_9fa48("2915"), {
                totalProducts: products.length,
                productTypes: products.map(stryMutAct_9fa48("2916") ? () => undefined : (stryCov_9fa48("2916"), p => stryMutAct_9fa48("2917") ? {} : (stryCov_9fa48("2917"), {
                  title: stryMutAct_9fa48("2918") ? p.title : (stryCov_9fa48("2918"), p.title.substring(0, 50)),
                  productType: p.productType,
                  variationsCount: p.variations.length,
                  attributesCount: Object.keys(p.attributes).length,
                  hasAttributes: stryMutAct_9fa48("2922") ? Object.keys(p.attributes).length <= 0 : stryMutAct_9fa48("2921") ? Object.keys(p.attributes).length >= 0 : stryMutAct_9fa48("2920") ? false : stryMutAct_9fa48("2919") ? true : (stryCov_9fa48("2919", "2920", "2921", "2922"), Object.keys(p.attributes).length > 0),
                  attributes: p.attributes
                }))),
                variationCsvLength: csvResult.variationCsv.length,
                parentCsvLength: csvResult.parentCsv.length,
                variationCount: csvResult.variationCount
              }));

              // Store results
              const result: JobResult = stryMutAct_9fa48("2923") ? {} : (stryCov_9fa48("2923"), {
                jobId: job.id,
                parentCsv: csvResult.parentCsv,
                variationCsv: csvResult.variationCsv,
                productCount: products.length,
                variationCount: csvResult.variationCount,
                filename: this.generateFilename(job.metadata.siteUrl, job.id),
                metadata: job.metadata,
                createdAt: new Date(),
                expiresAt: new Date(stryMutAct_9fa48("2924") ? Date.now() - 24 * 60 * 60 * 1000 : (stryCov_9fa48("2924"), Date.now() + (stryMutAct_9fa48("2925") ? 24 * 60 * 60 / 1000 : (stryCov_9fa48("2925"), (stryMutAct_9fa48("2926") ? 24 * 60 / 60 : (stryCov_9fa48("2926"), (stryMutAct_9fa48("2927") ? 24 / 60 : (stryCov_9fa48("2927"), 24 * 60)) * 60)) * 1000)))) // 24 hours
              });
              await this.storage.storeJobResult(job.id, result);

              // Mark job as completed
              job.status = stryMutAct_9fa48("2928") ? "" : (stryCov_9fa48("2928"), 'completed');
              job.completedAt = new Date();
              // totalProducts should remain as the total discovered, not just successful ones
              job.processedProducts = products.length;

              // Update performance metrics
              const jobDuration = stryMutAct_9fa48("2929") ? job.completedAt.getTime() + job.startedAt!.getTime() : (stryCov_9fa48("2929"), job.completedAt.getTime() - job.startedAt!.getTime());
              stryMutAct_9fa48("2930") ? this.performanceMetrics.totalJobs-- : (stryCov_9fa48("2930"), this.performanceMetrics.totalJobs++);
              stryMutAct_9fa48("2931") ? this.performanceMetrics.totalProducts -= products.length : (stryCov_9fa48("2931"), this.performanceMetrics.totalProducts += products.length);
              stryMutAct_9fa48("2932") ? this.performanceMetrics.totalProcessingTime -= jobDuration : (stryCov_9fa48("2932"), this.performanceMetrics.totalProcessingTime += jobDuration);
              this.performanceMetrics.averageTimePerProduct = (stryMutAct_9fa48("2936") ? this.performanceMetrics.totalProducts <= 0 : stryMutAct_9fa48("2935") ? this.performanceMetrics.totalProducts >= 0 : stryMutAct_9fa48("2934") ? false : stryMutAct_9fa48("2933") ? true : (stryCov_9fa48("2933", "2934", "2935", "2936"), this.performanceMetrics.totalProducts > 0)) ? stryMutAct_9fa48("2937") ? this.performanceMetrics.totalProcessingTime * this.performanceMetrics.totalProducts : (stryCov_9fa48("2937"), this.performanceMetrics.totalProcessingTime / this.performanceMetrics.totalProducts) : 0;
              this.logger.info(stryMutAct_9fa48("2938") ? `` : (stryCov_9fa48("2938"), `Job ${job.id} completed successfully. Processed ${products.length} products in ${jobDuration}ms.`));
              this.logger.info(stryMutAct_9fa48("2939") ? `` : (stryCov_9fa48("2939"), `Performance Metrics - Avg: ${this.performanceMetrics.averageTimePerProduct.toFixed(2)}ms/product, Total: ${this.performanceMetrics.totalProducts} products`));
            }
          } finally {
            if (stryMutAct_9fa48("2940")) {
              {}
            } else {
              stryCov_9fa48("2940");
              // Clean up adapter resources (including Puppeteer)
              if (stryMutAct_9fa48("2943") ? adapter || typeof adapter.cleanup === 'function' : stryMutAct_9fa48("2942") ? false : stryMutAct_9fa48("2941") ? true : (stryCov_9fa48("2941", "2942", "2943"), adapter && (stryMutAct_9fa48("2945") ? typeof adapter.cleanup !== 'function' : stryMutAct_9fa48("2944") ? true : (stryCov_9fa48("2944", "2945"), typeof adapter.cleanup === (stryMutAct_9fa48("2946") ? "" : (stryCov_9fa48("2946"), 'function')))))) {
                if (stryMutAct_9fa48("2947")) {
                  {}
                } else {
                  stryCov_9fa48("2947");
                  await adapter.cleanup();
                }
              }
            }
          }
        }
      } catch (error) {
        if (stryMutAct_9fa48("2948")) {
          {}
        } else {
          stryCov_9fa48("2948");
          this.logger.error(stryMutAct_9fa48("2949") ? `` : (stryCov_9fa48("2949"), `Job ${job.id} failed:`), error);
          job.status = stryMutAct_9fa48("2950") ? "" : (stryCov_9fa48("2950"), 'failed');
          job.completedAt = new Date();
          const scrapingError = ErrorFactory.createScrapingError(stryMutAct_9fa48("2951") ? `` : (stryCov_9fa48("2951"), `Job failed: ${error}`), ErrorCodes.RECIPE_ERROR, stryMutAct_9fa48("2952") ? true : (stryCov_9fa48("2952"), false));
          job.errors.push(scrapingError);

          // Clean up adapter resources even on failure
          try {
            if (stryMutAct_9fa48("2953")) {
              {}
            } else {
              stryCov_9fa48("2953");
              const adapter = await this.createAdapter(job.metadata.recipe, job.metadata.siteUrl);
              if (stryMutAct_9fa48("2956") ? adapter || typeof adapter.cleanup === 'function' : stryMutAct_9fa48("2955") ? false : stryMutAct_9fa48("2954") ? true : (stryCov_9fa48("2954", "2955", "2956"), adapter && (stryMutAct_9fa48("2958") ? typeof adapter.cleanup !== 'function' : stryMutAct_9fa48("2957") ? true : (stryCov_9fa48("2957", "2958"), typeof adapter.cleanup === (stryMutAct_9fa48("2959") ? "" : (stryCov_9fa48("2959"), 'function')))))) {
                if (stryMutAct_9fa48("2960")) {
                  {}
                } else {
                  stryCov_9fa48("2960");
                  await adapter.cleanup();
                }
              }
            }
          } catch (cleanupError) {
            if (stryMutAct_9fa48("2961")) {
              {}
            } else {
              stryCov_9fa48("2961");
              this.logger.warn(stryMutAct_9fa48("2962") ? `` : (stryCov_9fa48("2962"), `Failed to cleanup adapter for failed job ${job.id}:`), cleanupError);
            }
          }
        }
      }
    }
  }

  /**
   * Create adapter based on recipe or auto-detection.
   * @param recipe - Recipe name to prefer
   * @param siteUrl - Target website URL
   */
  private async createAdapter(recipe: string, siteUrl: string): Promise<SiteAdapter<RawProductData>> {
    if (stryMutAct_9fa48("2963")) {
      {}
    } else {
      stryCov_9fa48("2963");
      try {
        if (stryMutAct_9fa48("2964")) {
          {}
        } else {
          stryCov_9fa48("2964");
          // Try to create adapter using the recipe manager
          const adapter = await this.recipeManager.createAdapter(siteUrl, recipe);
          this.logger.info(stryMutAct_9fa48("2965") ? `` : (stryCov_9fa48("2965"), `Created adapter for ${siteUrl} using recipe: ${recipe}`));
          return adapter;
        }
      } catch (error) {
        if (stryMutAct_9fa48("2966")) {
          {}
        } else {
          stryCov_9fa48("2966");
          this.logger.warn(stryMutAct_9fa48("2967") ? `` : (stryCov_9fa48("2967"), `Failed to create adapter with recipe '${recipe}', trying auto-detection: ${error}`));
          try {
            if (stryMutAct_9fa48("2968")) {
              {}
            } else {
              stryCov_9fa48("2968");
              // Fallback to auto-detection
              const adapter = await this.recipeManager.createAdapter(siteUrl);
              this.logger.info(stryMutAct_9fa48("2969") ? `` : (stryCov_9fa48("2969"), `Created adapter for ${siteUrl} using auto-detected recipe`));
              return adapter;
            }
          } catch (fallbackError) {
            if (stryMutAct_9fa48("2970")) {
              {}
            } else {
              stryCov_9fa48("2970");
              this.logger.error(stryMutAct_9fa48("2971") ? `` : (stryCov_9fa48("2971"), `Failed to create adapter for ${siteUrl}: ${fallbackError}`));
              throw new Error(stryMutAct_9fa48("2972") ? `` : (stryCov_9fa48("2972"), `No suitable recipe found for ${siteUrl}. Please provide a valid recipe name or ensure a recipe exists for this site.`));
            }
          }
        }
      }
    }
  }

  /**
   * Get job status
   * @param jobId - The job identifier
   */
  async getJobStatus(jobId: string): Promise<ApiResponse<ScrapingJob<ProductOptions>>> {
    if (stryMutAct_9fa48("2973")) {
      {}
    } else {
      stryCov_9fa48("2973");
      try {
        if (stryMutAct_9fa48("2974")) {
          {}
        } else {
          stryCov_9fa48("2974");
          const job = this.activeJobs.get(jobId);
          if (stryMutAct_9fa48("2977") ? false : stryMutAct_9fa48("2976") ? true : stryMutAct_9fa48("2975") ? job : (stryCov_9fa48("2975", "2976", "2977"), !job)) {
            if (stryMutAct_9fa48("2978")) {
              {}
            } else {
              stryCov_9fa48("2978");
              return this.createErrorResponse<ScrapingJob<ProductOptions>, string>(stryMutAct_9fa48("2979") ? "" : (stryCov_9fa48("2979"), 'Job not found'));
            }
          }
          return this.createSuccessResponse(job);
        }
      } catch (error) {
        if (stryMutAct_9fa48("2980")) {
          {}
        } else {
          stryCov_9fa48("2980");
          return this.createErrorResponse<ScrapingJob<ProductOptions>, string>(stryMutAct_9fa48("2981") ? `` : (stryCov_9fa48("2981"), `Failed to get job status: ${error}`));
        }
      }
    }
  }

  /**
   * Get all jobs
   */
  async getAllJobs(): Promise<ApiResponse<ScrapingJob<ProductOptions>[]>> {
    if (stryMutAct_9fa48("2982")) {
      {}
    } else {
      stryCov_9fa48("2982");
      try {
        if (stryMutAct_9fa48("2983")) {
          {}
        } else {
          stryCov_9fa48("2983");
          const jobs = Array.from(this.activeJobs.values());
          return this.createSuccessResponse(jobs);
        }
      } catch (error) {
        if (stryMutAct_9fa48("2984")) {
          {}
        } else {
          stryCov_9fa48("2984");
          return this.createErrorResponse<ScrapingJob<ProductOptions>[], string>(stryMutAct_9fa48("2985") ? `` : (stryCov_9fa48("2985"), `Failed to get jobs: ${error}`));
        }
      }
    }
  }

  /**
   * List all available recipes
   */
  async listRecipes(): Promise<ApiResponse<string[]>> {
    if (stryMutAct_9fa48("2986")) {
      {}
    } else {
      stryCov_9fa48("2986");
      try {
        if (stryMutAct_9fa48("2987")) {
          {}
        } else {
          stryCov_9fa48("2987");
          const recipes = await this.recipeManager.listRecipes();
          return this.createSuccessResponse(recipes);
        }
      } catch (error) {
        if (stryMutAct_9fa48("2988")) {
          {}
        } else {
          stryCov_9fa48("2988");
          return this.createErrorResponse<string[], string>(stryMutAct_9fa48("2989") ? `` : (stryCov_9fa48("2989"), `Failed to list recipes: ${error}`));
        }
      }
    }
  }

  /**
   * Get recipe configuration by name
   * @param recipeName - Name of the recipe
   */
  async getRecipe(recipeName: string): Promise<ApiResponse<RecipeConfig>> {
    if (stryMutAct_9fa48("2990")) {
      {}
    } else {
      stryCov_9fa48("2990");
      try {
        if (stryMutAct_9fa48("2991")) {
          {}
        } else {
          stryCov_9fa48("2991");
          const recipe = await this.recipeManager.getRecipe(recipeName);
          return this.createSuccessResponse(recipe);
        }
      } catch (error) {
        if (stryMutAct_9fa48("2992")) {
          {}
        } else {
          stryCov_9fa48("2992");
          return this.createErrorResponse(stryMutAct_9fa48("2993") ? `` : (stryCov_9fa48("2993"), `Failed to get recipe: ${error}`));
        }
      }
    }
  }

  /**
   * Get recipe configuration by site URL
   * @param siteUrl - Site URL
   */
  async getRecipeBySiteUrl(siteUrl: string): Promise<ApiResponse<RecipeConfig>> {
    if (stryMutAct_9fa48("2994")) {
      {}
    } else {
      stryCov_9fa48("2994");
      try {
        if (stryMutAct_9fa48("2995")) {
          {}
        } else {
          stryCov_9fa48("2995");
          const recipe = await this.recipeManager.getRecipeBySiteUrl(siteUrl);
          if (stryMutAct_9fa48("2997") ? false : stryMutAct_9fa48("2996") ? true : (stryCov_9fa48("2996", "2997"), recipe)) {
            if (stryMutAct_9fa48("2998")) {
              {}
            } else {
              stryCov_9fa48("2998");
              return this.createSuccessResponse(recipe);
            }
          } else {
            if (stryMutAct_9fa48("2999")) {
              {}
            } else {
              stryCov_9fa48("2999");
              return this.createErrorResponse(stryMutAct_9fa48("3000") ? "" : (stryCov_9fa48("3000"), 'No recipe found for this site'));
            }
          }
        }
      } catch (error) {
        if (stryMutAct_9fa48("3001")) {
          {}
        } else {
          stryCov_9fa48("3001");
          return this.createErrorResponse(stryMutAct_9fa48("3002") ? `` : (stryCov_9fa48("3002"), `Failed to get recipe for site: ${error}`));
        }
      }
    }
  }

  /**
   * Cancel a job
   * @param jobId - The job identifier
   */
  async cancelJob(jobId: string): Promise<ApiResponse<{
    cancelled: boolean;
  }>> {
    if (stryMutAct_9fa48("3003")) {
      {}
    } else {
      stryCov_9fa48("3003");
      try {
        if (stryMutAct_9fa48("3004")) {
          {}
        } else {
          stryCov_9fa48("3004");
          const job = this.activeJobs.get(jobId);
          if (stryMutAct_9fa48("3007") ? false : stryMutAct_9fa48("3006") ? true : stryMutAct_9fa48("3005") ? job : (stryCov_9fa48("3005", "3006", "3007"), !job)) {
            if (stryMutAct_9fa48("3008")) {
              {}
            } else {
              stryCov_9fa48("3008");
              return this.createErrorResponse<{
                cancelled: boolean;
              }, string>(stryMutAct_9fa48("3009") ? "" : (stryCov_9fa48("3009"), 'Job not found'));
            }
          }
          if (stryMutAct_9fa48("3012") ? job.status === 'completed' && job.status === 'failed' : stryMutAct_9fa48("3011") ? false : stryMutAct_9fa48("3010") ? true : (stryCov_9fa48("3010", "3011", "3012"), (stryMutAct_9fa48("3014") ? job.status !== 'completed' : stryMutAct_9fa48("3013") ? false : (stryCov_9fa48("3013", "3014"), job.status === (stryMutAct_9fa48("3015") ? "" : (stryCov_9fa48("3015"), 'completed')))) || (stryMutAct_9fa48("3017") ? job.status !== 'failed' : stryMutAct_9fa48("3016") ? false : (stryCov_9fa48("3016", "3017"), job.status === (stryMutAct_9fa48("3018") ? "" : (stryCov_9fa48("3018"), 'failed')))))) {
            if (stryMutAct_9fa48("3019")) {
              {}
            } else {
              stryCov_9fa48("3019");
              return this.createErrorResponse<{
                cancelled: boolean;
              }, string>(stryMutAct_9fa48("3020") ? "" : (stryCov_9fa48("3020"), 'Cannot cancel completed or failed job'));
            }
          }

          // Remove from queue if pending
          const queueIndex = this.jobQueue.findIndex(stryMutAct_9fa48("3021") ? () => undefined : (stryCov_9fa48("3021"), j => stryMutAct_9fa48("3024") ? j.id !== jobId : stryMutAct_9fa48("3023") ? false : stryMutAct_9fa48("3022") ? true : (stryCov_9fa48("3022", "3023", "3024"), j.id === jobId)));
          if (stryMutAct_9fa48("3027") ? queueIndex === -1 : stryMutAct_9fa48("3026") ? false : stryMutAct_9fa48("3025") ? true : (stryCov_9fa48("3025", "3026", "3027"), queueIndex !== (stryMutAct_9fa48("3028") ? +1 : (stryCov_9fa48("3028"), -1)))) {
            if (stryMutAct_9fa48("3029")) {
              {}
            } else {
              stryCov_9fa48("3029");
              this.jobQueue.splice(queueIndex, 1);
            }
          }

          // Mark as cancelled
          job.status = stryMutAct_9fa48("3030") ? "" : (stryCov_9fa48("3030"), 'failed');
          job.completedAt = new Date();
          const scrapingError = ErrorFactory.createScrapingError(stryMutAct_9fa48("3031") ? "" : (stryCov_9fa48("3031"), 'Job cancelled by user'), ErrorCodes.UNKNOWN_ERROR, stryMutAct_9fa48("3032") ? true : (stryCov_9fa48("3032"), false));
          job.errors.push(scrapingError);
          return this.createSuccessResponse(stryMutAct_9fa48("3033") ? {} : (stryCov_9fa48("3033"), {
            cancelled: stryMutAct_9fa48("3034") ? false : (stryCov_9fa48("3034"), true)
          }), stryMutAct_9fa48("3035") ? "" : (stryCov_9fa48("3035"), 'Job cancelled successfully'));
        }
      } catch (error) {
        if (stryMutAct_9fa48("3036")) {
          {}
        } else {
          stryCov_9fa48("3036");
          return this.createErrorResponse<{
            cancelled: boolean;
          }, string>(stryMutAct_9fa48("3037") ? `` : (stryCov_9fa48("3037"), `Failed to cancel job: ${error}`));
        }
      }
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<ApiResponse<GenericMetadata<unknown>>> {
    if (stryMutAct_9fa48("3038")) {
      {}
    } else {
      stryCov_9fa48("3038");
      try {
        if (stryMutAct_9fa48("3039")) {
          {}
        } else {
          stryCov_9fa48("3039");
          const stats = await this.storage.getStorageStats();
          return this.createSuccessResponse(stats);
        }
      } catch (error) {
        if (stryMutAct_9fa48("3040")) {
          {}
        } else {
          stryCov_9fa48("3040");
          return this.createErrorResponse(stryMutAct_9fa48("3041") ? `` : (stryCov_9fa48("3041"), `Failed to get storage stats: ${error}`));
        }
      }
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(): Promise<ApiResponse<GenericMetadata<unknown>>> {
    if (stryMutAct_9fa48("3042")) {
      {}
    } else {
      stryCov_9fa48("3042");
      try {
        if (stryMutAct_9fa48("3043")) {
          {}
        } else {
          stryCov_9fa48("3043");
          return this.createSuccessResponse(stryMutAct_9fa48("3044") ? {} : (stryCov_9fa48("3044"), {
            ...this.performanceMetrics,
            activeJobs: this.activeJobs.size,
            queuedJobs: this.jobQueue.length,
            isProcessing: this.isProcessing,
            // Backward/compat aliases used by some tests
            currentActiveJobs: this.activeJobs.size,
            queueLength: this.jobQueue.length
          }));
        }
      } catch (error) {
        if (stryMutAct_9fa48("3045")) {
          {}
        } else {
          stryCov_9fa48("3045");
          return this.createErrorResponse(stryMutAct_9fa48("3046") ? `` : (stryCov_9fa48("3046"), `Failed to get performance metrics: ${error}`));
        }
      }
    }
  }

  /**
   * Get live performance metrics with real-time data
   */
  async getLivePerformanceMetrics(): Promise<ApiResponse<GenericMetadata<unknown>>> {
    if (stryMutAct_9fa48("3047")) {
      {}
    } else {
      stryCov_9fa48("3047");
      try {
        if (stryMutAct_9fa48("3048")) {
          {}
        } else {
          stryCov_9fa48("3048");
          const now = Date.now();
          const activeJobStats = Array.from(this.activeJobs.values()).map(stryMutAct_9fa48("3049") ? () => undefined : (stryCov_9fa48("3049"), job => stryMutAct_9fa48("3050") ? {} : (stryCov_9fa48("3050"), {
            id: job.id,
            status: job.status,
            progress: stryMutAct_9fa48("3051") ? job.processedProducts * Math.max(job.totalProducts, 1) : (stryCov_9fa48("3051"), job.processedProducts / (stryMutAct_9fa48("3052") ? Math.min(job.totalProducts, 1) : (stryCov_9fa48("3052"), Math.max(job.totalProducts, 1)))),
            duration: job.startedAt ? stryMutAct_9fa48("3053") ? now + job.startedAt.getTime() : (stryCov_9fa48("3053"), now - job.startedAt.getTime()) : 0,
            productsPerSecond: (stryMutAct_9fa48("3056") ? job.startedAt || job.processedProducts > 0 : stryMutAct_9fa48("3055") ? false : stryMutAct_9fa48("3054") ? true : (stryCov_9fa48("3054", "3055", "3056"), job.startedAt && (stryMutAct_9fa48("3059") ? job.processedProducts <= 0 : stryMutAct_9fa48("3058") ? job.processedProducts >= 0 : stryMutAct_9fa48("3057") ? true : (stryCov_9fa48("3057", "3058", "3059"), job.processedProducts > 0)))) ? (stryMutAct_9fa48("3060") ? job.processedProducts * ((now - job.startedAt.getTime()) / 1000) : (stryCov_9fa48("3060"), job.processedProducts / (stryMutAct_9fa48("3061") ? (now - job.startedAt.getTime()) * 1000 : (stryCov_9fa48("3061"), (stryMutAct_9fa48("3062") ? now + job.startedAt.getTime() : (stryCov_9fa48("3062"), now - job.startedAt.getTime())) / 1000)))).toFixed(2) : 0
          })));
          return this.createSuccessResponse(stryMutAct_9fa48("3063") ? {} : (stryCov_9fa48("3063"), {
            timestamp: now,
            activeJobs: activeJobStats,
            queueLength: this.jobQueue.length,
            isProcessing: this.isProcessing,
            systemLoad: stryMutAct_9fa48("3064") ? {} : (stryCov_9fa48("3064"), {
              memoryUsage: process.memoryUsage(),
              cpuUsage: process.cpuUsage(),
              uptime: process.uptime()
            })
          }));
        }
      } catch (error) {
        if (stryMutAct_9fa48("3065")) {
          {}
        } else {
          stryCov_9fa48("3065");
          return this.createErrorResponse(stryMutAct_9fa48("3066") ? `` : (stryCov_9fa48("3066"), `Failed to get live performance metrics: ${error}`));
        }
      }
    }
  }

  /**
  * Get performance recommendations based on current metrics
  */
  async getPerformanceRecommendations(): Promise<ApiResponse<GenericMetadata<unknown>>> {
    if (stryMutAct_9fa48("3067")) {
      {}
    } else {
      stryCov_9fa48("3067");
      try {
        if (stryMutAct_9fa48("3068")) {
          {}
        } else {
          stryCov_9fa48("3068");
          const recommendations = stryMutAct_9fa48("3069") ? ["Stryker was here"] : (stryCov_9fa48("3069"), []);

          // Analyze current performance and provide recommendations
          if (stryMutAct_9fa48("3073") ? this.performanceMetrics.averageTimePerProduct <= 5000 : stryMutAct_9fa48("3072") ? this.performanceMetrics.averageTimePerProduct >= 5000 : stryMutAct_9fa48("3071") ? false : stryMutAct_9fa48("3070") ? true : (stryCov_9fa48("3070", "3071", "3072", "3073"), this.performanceMetrics.averageTimePerProduct > 5000)) {
            if (stryMutAct_9fa48("3074")) {
              {}
            } else {
              stryCov_9fa48("3074");
              recommendations.push(stryMutAct_9fa48("3075") ? {} : (stryCov_9fa48("3075"), {
                type: stryMutAct_9fa48("3076") ? "" : (stryCov_9fa48("3076"), 'performance'),
                priority: stryMutAct_9fa48("3077") ? "" : (stryCov_9fa48("3077"), 'high'),
                message: stryMutAct_9fa48("3078") ? "" : (stryCov_9fa48("3078"), 'Average processing time per product is high (>5s). Consider enabling fast mode or reducing concurrent workers.'),
                suggestion: stryMutAct_9fa48("3079") ? "" : (stryCov_9fa48("3079"), 'Set fastMode: true in recipe behavior or reduce maxConcurrent to 5-8')
              }));
            }
          }
          if (stryMutAct_9fa48("3083") ? this.activeJobs.size <= 3 : stryMutAct_9fa48("3082") ? this.activeJobs.size >= 3 : stryMutAct_9fa48("3081") ? false : stryMutAct_9fa48("3080") ? true : (stryCov_9fa48("3080", "3081", "3082", "3083"), this.activeJobs.size > 3)) {
            if (stryMutAct_9fa48("3084")) {
              {}
            } else {
              stryCov_9fa48("3084");
              recommendations.push(stryMutAct_9fa48("3085") ? {} : (stryCov_9fa48("3085"), {
                type: stryMutAct_9fa48("3086") ? "" : (stryCov_9fa48("3086"), 'concurrency'),
                priority: stryMutAct_9fa48("3087") ? "" : (stryCov_9fa48("3087"), 'medium'),
                message: stryMutAct_9fa48("3088") ? "" : (stryCov_9fa48("3088"), 'High number of active jobs may impact performance.'),
                suggestion: stryMutAct_9fa48("3089") ? "" : (stryCov_9fa48("3089"), 'Consider reducing maxConcurrent in recipe behavior')
              }));
            }
          }
          if (stryMutAct_9fa48("3093") ? this.performanceMetrics.totalJobs <= 0 : stryMutAct_9fa48("3092") ? this.performanceMetrics.totalJobs >= 0 : stryMutAct_9fa48("3091") ? false : stryMutAct_9fa48("3090") ? true : (stryCov_9fa48("3090", "3091", "3092", "3093"), this.performanceMetrics.totalJobs > 0)) {
            if (stryMutAct_9fa48("3094")) {
              {}
            } else {
              stryCov_9fa48("3094");
              const avgJobTime = stryMutAct_9fa48("3095") ? this.performanceMetrics.totalProcessingTime * this.performanceMetrics.totalJobs : (stryCov_9fa48("3095"), this.performanceMetrics.totalProcessingTime / this.performanceMetrics.totalJobs);
              if (stryMutAct_9fa48("3099") ? avgJobTime <= 300000 : stryMutAct_9fa48("3098") ? avgJobTime >= 300000 : stryMutAct_9fa48("3097") ? false : stryMutAct_9fa48("3096") ? true : (stryCov_9fa48("3096", "3097", "3098", "3099"), avgJobTime > 300000)) {
                if (stryMutAct_9fa48("3100")) {
                  {}
                } else {
                  stryCov_9fa48("3100");
                  // 5 minutes
                  recommendations.push(stryMutAct_9fa48("3101") ? {} : (stryCov_9fa48("3101"), {
                    type: stryMutAct_9fa48("3102") ? "" : (stryCov_9fa48("3102"), 'optimization'),
                    priority: stryMutAct_9fa48("3103") ? "" : (stryCov_9fa48("3103"), 'high'),
                    message: stryMutAct_9fa48("3104") ? "" : (stryCov_9fa48("3104"), 'Average job completion time is high (>5min).'),
                    suggestion: stryMutAct_9fa48("3105") ? "" : (stryCov_9fa48("3105"), 'Review rateLimit settings and consider using HTTP client instead of Puppeteer for simple sites')
                  }));
                }
              }
            }
          }
          return this.createSuccessResponse(stryMutAct_9fa48("3106") ? {} : (stryCov_9fa48("3106"), {
            recommendations,
            currentSettings: stryMutAct_9fa48("3107") ? {} : (stryCov_9fa48("3107"), {
              defaultMaxConcurrent: 10,
              defaultRateLimit: 50,
              fastModeAvailable: stryMutAct_9fa48("3108") ? false : (stryCov_9fa48("3108"), true)
            })
          }));
        }
      } catch (error) {
        if (stryMutAct_9fa48("3109")) {
          {}
        } else {
          stryCov_9fa48("3109");
          return this.createErrorResponse(stryMutAct_9fa48("3110") ? `` : (stryCov_9fa48("3110"), `Failed to get performance recommendations: ${error}`));
        }
      }
    }
  }

  /**
   * Clean up resources (including Puppeteer browsers)
   */
  async cleanup(): Promise<void> {
    if (stryMutAct_9fa48("3111")) {
      {}
    } else {
      stryCov_9fa48("3111");
      this.logger.info(stryMutAct_9fa48("3112") ? "" : (stryCov_9fa48("3112"), 'Cleaning up ScrapingService resources...'));

      // Cancel all active jobs
      for (const [jobId, job] of this.activeJobs) {
        if (stryMutAct_9fa48("3113")) {
          {}
        } else {
          stryCov_9fa48("3113");
          if (stryMutAct_9fa48("3116") ? job.status !== 'running' : stryMutAct_9fa48("3115") ? false : stryMutAct_9fa48("3114") ? true : (stryCov_9fa48("3114", "3115", "3116"), job.status === (stryMutAct_9fa48("3117") ? "" : (stryCov_9fa48("3117"), 'running')))) {
            if (stryMutAct_9fa48("3118")) {
              {}
            } else {
              stryCov_9fa48("3118");
              try {
                if (stryMutAct_9fa48("3119")) {
                  {}
                } else {
                  stryCov_9fa48("3119");
                  await this.cancelJob(jobId);
                }
              } catch (error) {
                if (stryMutAct_9fa48("3120")) {
                  {}
                } else {
                  stryCov_9fa48("3120");
                  this.logger.warn(stryMutAct_9fa48("3121") ? `` : (stryCov_9fa48("3121"), `Failed to cancel job ${jobId} during cleanup:`), error);
                }
              }
            }
          }
        }
      }

      // Clear queues
      this.jobQueue = stryMutAct_9fa48("3122") ? ["Stryker was here"] : (stryCov_9fa48("3122"), []);
      this.activeJobs.clear();
      this.logger.info(stryMutAct_9fa48("3123") ? "" : (stryCov_9fa48("3123"), 'ScrapingService cleanup completed'));
    }
  }

  /**
   * Utility function to add delay
   * @param ms - Milliseconds to wait
   */
  private delay(ms: number): Promise<void> {
    if (stryMutAct_9fa48("3124")) {
      {}
    } else {
      stryCov_9fa48("3124");
      return new Promise(stryMutAct_9fa48("3125") ? () => undefined : (stryCov_9fa48("3125"), resolve => setTimeout(resolve, ms)));
    }
  }
}