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
  private jobQueue: ScrapingJob<ProductOptions>[] = stryMutAct_9fa48("4862") ? ["Stryker was here"] : (stryCov_9fa48("4862"), []);
  private isProcessing = stryMutAct_9fa48("4863") ? true : (stryCov_9fa48("4863"), false);
  private performanceMetrics = stryMutAct_9fa48("4864") ? {} : (stryCov_9fa48("4864"), {
    totalJobs: 0,
    totalProducts: 0,
    averageTimePerProduct: 0,
    totalProcessingTime: 0
  });

  /**
   * Helper method to create ApiResponse objects with required fields
   */
  private createApiResponse<T, E = string>(success: boolean, data?: T, error?: E, message?: string): ApiResponse<T, E> {
    if (stryMutAct_9fa48("4865")) {
      {}
    } else {
      stryCov_9fa48("4865");
      return stryMutAct_9fa48("4866") ? {} : (stryCov_9fa48("4866"), {
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
    if (stryMutAct_9fa48("4867")) {
      {}
    } else {
      stryCov_9fa48("4867");
      return this.createApiResponse(stryMutAct_9fa48("4868") ? false : (stryCov_9fa48("4868"), true), data, stryMutAct_9fa48("4869") ? "Stryker was here!" : (stryCov_9fa48("4869"), ''), message);
    }
  }

  /**
   * Helper method to create error ApiResponse objects
   */
  private createErrorResponse<T, E>(error: E, message?: string): ApiResponse<T, E> {
    if (stryMutAct_9fa48("4870")) {
      {}
    } else {
      stryCov_9fa48("4870");
      return this.createApiResponse(stryMutAct_9fa48("4871") ? true : (stryCov_9fa48("4871"), false), undefined as T, error, message);
    }
  }
  constructor(storage?: StorageService, recipeManager?: RecipeManager, csvGenerator?: CsvGenerator, logger?: pino.Logger) {
    if (stryMutAct_9fa48("4872")) {
      {}
    } else {
      stryCov_9fa48("4872");
      this.logger = stryMutAct_9fa48("4875") ? logger && pino({
        level: process.env.LOG_LEVEL || 'warn',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard'
          }
        }
      }) : stryMutAct_9fa48("4874") ? false : stryMutAct_9fa48("4873") ? true : (stryCov_9fa48("4873", "4874", "4875"), logger || pino(stryMutAct_9fa48("4876") ? {} : (stryCov_9fa48("4876"), {
        level: stryMutAct_9fa48("4879") ? process.env.LOG_LEVEL && 'warn' : stryMutAct_9fa48("4878") ? false : stryMutAct_9fa48("4877") ? true : (stryCov_9fa48("4877", "4878", "4879"), process.env.LOG_LEVEL || (stryMutAct_9fa48("4880") ? "" : (stryCov_9fa48("4880"), 'warn'))),
        transport: stryMutAct_9fa48("4881") ? {} : (stryCov_9fa48("4881"), {
          target: stryMutAct_9fa48("4882") ? "" : (stryCov_9fa48("4882"), 'pino-pretty'),
          options: stryMutAct_9fa48("4883") ? {} : (stryCov_9fa48("4883"), {
            colorize: stryMutAct_9fa48("4884") ? false : (stryCov_9fa48("4884"), true),
            translateTime: stryMutAct_9fa48("4885") ? "" : (stryCov_9fa48("4885"), 'SYS:standard')
          })
        })
      })));
      this.storage = stryMutAct_9fa48("4888") ? storage && new StorageService() : stryMutAct_9fa48("4887") ? false : stryMutAct_9fa48("4886") ? true : (stryCov_9fa48("4886", "4887", "4888"), storage || new StorageService());
      this.recipeManager = stryMutAct_9fa48("4891") ? recipeManager && new RecipeManager() : stryMutAct_9fa48("4890") ? false : stryMutAct_9fa48("4889") ? true : (stryCov_9fa48("4889", "4890", "4891"), recipeManager || new RecipeManager());
      this.csvGenerator = stryMutAct_9fa48("4894") ? csvGenerator && new CsvGenerator() : stryMutAct_9fa48("4893") ? false : stryMutAct_9fa48("4892") ? true : (stryCov_9fa48("4892", "4893", "4894"), csvGenerator || new CsvGenerator());
    }
  }

  /**
   * Normalize a raw product with proper generic constraints
   *
   * @param rawProduct - Raw product object from adapter with generic constraints
   * @param url - Optional product URL for context
   */
  private async normalizeProduct<T extends NormalizableProductData>(rawProduct: T, url?: string): Promise<NormalizedProduct> {
    if (stryMutAct_9fa48("4895")) {
      {}
    } else {
      stryCov_9fa48("4895");
      return NormalizationToolkit.normalizeProduct(rawProduct, stryMutAct_9fa48("4898") ? url && '' : stryMutAct_9fa48("4897") ? false : stryMutAct_9fa48("4896") ? true : (stryCov_9fa48("4896", "4897", "4898"), url || (stryMutAct_9fa48("4899") ? "Stryker was here!" : (stryCov_9fa48("4899"), ''))));
    }
  }

  /**
   * Generate filename for CSV outputs
   *
   * @param siteUrl - The site URL being scraped
   * @param jobId - The job identifier
   */
  private generateFilename(siteUrl: string, jobId: string): string {
    if (stryMutAct_9fa48("4900")) {
      {}
    } else {
      stryCov_9fa48("4900");
      const domain = new URL(siteUrl).hostname;
      return stryMutAct_9fa48("4901") ? `` : (stryCov_9fa48("4901"), `${domain}-${jobId}.csv`);
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
    if (stryMutAct_9fa48("4902")) {
      {}
    } else {
      stryCov_9fa48("4902");
      try {
        if (stryMutAct_9fa48("4903")) {
          {}
        } else {
          stryCov_9fa48("4903");
          // Validate request
          if (stryMutAct_9fa48("4906") ? !request.siteUrl && !request.recipe : stryMutAct_9fa48("4905") ? false : stryMutAct_9fa48("4904") ? true : (stryCov_9fa48("4904", "4905", "4906"), (stryMutAct_9fa48("4907") ? request.siteUrl : (stryCov_9fa48("4907"), !request.siteUrl)) || (stryMutAct_9fa48("4908") ? request.recipe : (stryCov_9fa48("4908"), !request.recipe)))) {
            if (stryMutAct_9fa48("4909")) {
              {}
            } else {
              stryCov_9fa48("4909");
              return this.createErrorResponse<{
                jobId: string;
              }, string>(stryMutAct_9fa48("4910") ? "" : (stryCov_9fa48("4910"), 'Missing required fields: siteUrl and recipe'));
            }
          }

          // Create job
          const jobId = randomUUID();
          const job: ScrapingJob<ProductOptions> = stryMutAct_9fa48("4911") ? {} : (stryCov_9fa48("4911"), {
            id: jobId,
            status: stryMutAct_9fa48("4912") ? "" : (stryCov_9fa48("4912"), 'pending'),
            createdAt: new Date(),
            totalProducts: 0,
            processedProducts: 0,
            errors: stryMutAct_9fa48("4913") ? ["Stryker was here"] : (stryCov_9fa48("4913"), []),
            metadata: stryMutAct_9fa48("4914") ? {} : (stryCov_9fa48("4914"), {
              siteUrl: request.siteUrl,
              recipe: request.recipe,
              categories: stryMutAct_9fa48("4917") ? request.options?.categories && [] : stryMutAct_9fa48("4916") ? false : stryMutAct_9fa48("4915") ? true : (stryCov_9fa48("4915", "4916", "4917"), (stryMutAct_9fa48("4918") ? request.options.categories : (stryCov_9fa48("4918"), request.options?.categories)) || (stryMutAct_9fa48("4919") ? ["Stryker was here"] : (stryCov_9fa48("4919"), []))),
              options: request.options // Store the full options object for maxProducts access
            })
          });

          // Add to queue
          this.jobQueue.push(job);
          this.activeJobs.set(jobId, job);
          this.logger.info(stryMutAct_9fa48("4920") ? `` : (stryCov_9fa48("4920"), `Created scraping job ${jobId} for ${request.siteUrl}`));

          // Start processing if not already running
          if (stryMutAct_9fa48("4923") ? false : stryMutAct_9fa48("4922") ? true : stryMutAct_9fa48("4921") ? this.isProcessing : (stryCov_9fa48("4921", "4922", "4923"), !this.isProcessing)) {
            if (stryMutAct_9fa48("4924")) {
              {}
            } else {
              stryCov_9fa48("4924");
              this.processQueue();
            }
          }
          return this.createSuccessResponse(stryMutAct_9fa48("4925") ? {} : (stryCov_9fa48("4925"), {
            jobId
          }), stryMutAct_9fa48("4926") ? "" : (stryCov_9fa48("4926"), 'Scraping job created successfully'));
        }
      } catch (error) {
        if (stryMutAct_9fa48("4927")) {
          {}
        } else {
          stryCov_9fa48("4927");
          this.logger.error(stryMutAct_9fa48("4928") ? "" : (stryCov_9fa48("4928"), 'Failed to start scraping job:'), error);
          return this.createErrorResponse<{
            jobId: string;
          }, string>(stryMutAct_9fa48("4929") ? `` : (stryCov_9fa48("4929"), `Failed to start scraping job: ${error}`));
        }
      }
    }
  }

  /**
   * Process the job queue
   */
  private async processQueue(): Promise<void> {
    if (stryMutAct_9fa48("4930")) {
      {}
    } else {
      stryCov_9fa48("4930");
      if (stryMutAct_9fa48("4933") ? this.isProcessing && this.jobQueue.length === 0 : stryMutAct_9fa48("4932") ? false : stryMutAct_9fa48("4931") ? true : (stryCov_9fa48("4931", "4932", "4933"), this.isProcessing || (stryMutAct_9fa48("4935") ? this.jobQueue.length !== 0 : stryMutAct_9fa48("4934") ? false : (stryCov_9fa48("4934", "4935"), this.jobQueue.length === 0)))) {
        if (stryMutAct_9fa48("4936")) {
          {}
        } else {
          stryCov_9fa48("4936");
          return;
        }
      }
      this.isProcessing = stryMutAct_9fa48("4937") ? false : (stryCov_9fa48("4937"), true);
      while (stryMutAct_9fa48("4940") ? this.jobQueue.length <= 0 : stryMutAct_9fa48("4939") ? this.jobQueue.length >= 0 : stryMutAct_9fa48("4938") ? false : (stryCov_9fa48("4938", "4939", "4940"), this.jobQueue.length > 0)) {
        if (stryMutAct_9fa48("4941")) {
          {}
        } else {
          stryCov_9fa48("4941");
          const job = this.jobQueue.shift();
          if (stryMutAct_9fa48("4943") ? false : stryMutAct_9fa48("4942") ? true : (stryCov_9fa48("4942", "4943"), job)) {
            if (stryMutAct_9fa48("4944")) {
              {}
            } else {
              stryCov_9fa48("4944");
              await this.processJob(job);
            }
          }
        }
      }
      this.isProcessing = stryMutAct_9fa48("4945") ? true : (stryCov_9fa48("4945"), false);
    }
  }

  /**
   * Process a single job
   */
  private async processJob(job: ScrapingJob<ProductOptions>): Promise<void> {
    if (stryMutAct_9fa48("4946")) {
      {}
    } else {
      stryCov_9fa48("4946");
      try {
        if (stryMutAct_9fa48("4947")) {
          {}
        } else {
          stryCov_9fa48("4947");
          this.logger.info(stryMutAct_9fa48("4948") ? `` : (stryCov_9fa48("4948"), `Starting job ${job.id} for ${job.metadata.siteUrl}`));
          job.status = stryMutAct_9fa48("4949") ? "" : (stryCov_9fa48("4949"), 'running');
          job.startedAt = new Date();

          // Get recipe configuration
          const recipe = await this.recipeManager.getRecipe(job.metadata.recipe);
          if (stryMutAct_9fa48("4952") ? false : stryMutAct_9fa48("4951") ? true : stryMutAct_9fa48("4950") ? recipe : (stryCov_9fa48("4950", "4951", "4952"), !recipe)) {
            if (stryMutAct_9fa48("4953")) {
              {}
            } else {
              stryCov_9fa48("4953");
              throw new Error(stryMutAct_9fa48("4954") ? `` : (stryCov_9fa48("4954"), `Recipe not found: ${job.metadata.recipe}`));
            }
          }

          // Create adapter
          const adapter = await this.createAdapter(job.metadata.recipe, job.metadata.siteUrl);
          try {
            if (stryMutAct_9fa48("4955")) {
              {}
            } else {
              stryCov_9fa48("4955");
              // Discover products with optional limit
              const productUrls: string[] = stryMutAct_9fa48("4956") ? ["Stryker was here"] : (stryCov_9fa48("4956"), []);
              const options = stryMutAct_9fa48("4959") ? job.metadata.options && {} : stryMutAct_9fa48("4958") ? false : stryMutAct_9fa48("4957") ? true : (stryCov_9fa48("4957", "4958", "4959"), job.metadata.options || {});
              const maxProducts: number | undefined = (stryMutAct_9fa48("4962") ? typeof options.maxProducts !== 'number' : stryMutAct_9fa48("4961") ? false : stryMutAct_9fa48("4960") ? true : (stryCov_9fa48("4960", "4961", "4962"), typeof options.maxProducts === (stryMutAct_9fa48("4963") ? "" : (stryCov_9fa48("4963"), 'number')))) ? options.maxProducts : undefined;
              for await (const url of adapter.discoverProducts()) {
                if (stryMutAct_9fa48("4964")) {
                  {}
                } else {
                  stryCov_9fa48("4964");
                  productUrls.push(url);

                  // Stop discovering if we've reached the limit
                  if (stryMutAct_9fa48("4967") ? maxProducts || productUrls.length >= maxProducts : stryMutAct_9fa48("4966") ? false : stryMutAct_9fa48("4965") ? true : (stryCov_9fa48("4965", "4966", "4967"), maxProducts && (stryMutAct_9fa48("4970") ? productUrls.length < maxProducts : stryMutAct_9fa48("4969") ? productUrls.length > maxProducts : stryMutAct_9fa48("4968") ? true : (stryCov_9fa48("4968", "4969", "4970"), productUrls.length >= maxProducts)))) {
                    if (stryMutAct_9fa48("4971")) {
                      {}
                    } else {
                      stryCov_9fa48("4971");
                      this.logger.info(stryMutAct_9fa48("4972") ? `` : (stryCov_9fa48("4972"), `Reached product limit of ${maxProducts}, stopping discovery`));
                      break;
                    }
                  }
                }
              }
              job.totalProducts = productUrls.length;
              this.logger.info(stryMutAct_9fa48("4973") ? `` : (stryCov_9fa48("4973"), `Discovered ${productUrls.length} products for job ${job.id}${maxProducts ? stryMutAct_9fa48("4974") ? `` : (stryCov_9fa48("4974"), ` (limited to ${maxProducts})`) : stryMutAct_9fa48("4975") ? "Stryker was here!" : (stryCov_9fa48("4975"), '')}`));
              if (stryMutAct_9fa48("4978") ? productUrls.length !== 0 : stryMutAct_9fa48("4977") ? false : stryMutAct_9fa48("4976") ? true : (stryCov_9fa48("4976", "4977", "4978"), productUrls.length === 0)) {
                if (stryMutAct_9fa48("4979")) {
                  {}
                } else {
                  stryCov_9fa48("4979");
                  throw new Error(stryMutAct_9fa48("4980") ? "" : (stryCov_9fa48("4980"), 'No products found'));
                }
              }

              // Enhanced concurrent processing with optimized settings
              const products: NormalizedProduct[] = stryMutAct_9fa48("4981") ? ["Stryker was here"] : (stryCov_9fa48("4981"), []);
              const maxConcurrent = stryMutAct_9fa48("4982") ? Math.max(recipe.behavior?.maxConcurrent || 10,
              // Increased default from 5 to 10
              productUrls.length // Don't exceed the number of products
              ) : (stryCov_9fa48("4982"), Math.min(stryMutAct_9fa48("4985") ? recipe.behavior?.maxConcurrent && 10 : stryMutAct_9fa48("4984") ? false : stryMutAct_9fa48("4983") ? true : (stryCov_9fa48("4983", "4984", "4985"), (stryMutAct_9fa48("4986") ? recipe.behavior.maxConcurrent : (stryCov_9fa48("4986"), recipe.behavior?.maxConcurrent)) || 10),
              // Increased default from 5 to 10
              productUrls.length // Don't exceed the number of products
              ));
              const rateLimit = stryMutAct_9fa48("4987") ? Math.min(recipe.behavior?.rateLimit || 50, 10) : (stryCov_9fa48("4987"), Math.max(stryMutAct_9fa48("4990") ? recipe.behavior?.rateLimit && 50 : stryMutAct_9fa48("4989") ? false : stryMutAct_9fa48("4988") ? true : (stryCov_9fa48("4988", "4989", "4990"), (stryMutAct_9fa48("4991") ? recipe.behavior.rateLimit : (stryCov_9fa48("4991"), recipe.behavior?.rateLimit)) || 50), 10)); // Reduced default from 200ms to 50ms, minimum 10ms

              this.logger.info(stryMutAct_9fa48("4992") ? `` : (stryCov_9fa48("4992"), `Processing ${productUrls.length} products with ${maxConcurrent} concurrent workers and ${rateLimit}ms rate limit`));

              // Process products in optimized batches with connection pooling
              const batchSize = maxConcurrent;
              for (let i = 0; stryMutAct_9fa48("4995") ? i >= productUrls.length : stryMutAct_9fa48("4994") ? i <= productUrls.length : stryMutAct_9fa48("4993") ? false : (stryCov_9fa48("4993", "4994", "4995"), i < productUrls.length); stryMutAct_9fa48("4996") ? i -= batchSize : (stryCov_9fa48("4996"), i += batchSize)) {
                if (stryMutAct_9fa48("4997")) {
                  {}
                } else {
                  stryCov_9fa48("4997");
                  const batch = stryMutAct_9fa48("4998") ? productUrls : (stryCov_9fa48("4998"), productUrls.slice(i, stryMutAct_9fa48("4999") ? i - batchSize : (stryCov_9fa48("4999"), i + batchSize)));
                  const batchStartTime = Date.now();

                  // Process batch concurrently with better error handling
                  const batchPromises = batch.map(async (url, batchIndex) => {
                    if (stryMutAct_9fa48("5000")) {
                      {}
                    } else {
                      stryCov_9fa48("5000");
                      if (stryMutAct_9fa48("5003") ? false : stryMutAct_9fa48("5002") ? true : stryMutAct_9fa48("5001") ? url : (stryCov_9fa48("5001", "5002", "5003"), !url)) return null;
                      const globalIndex = stryMutAct_9fa48("5004") ? i - batchIndex : (stryCov_9fa48("5004"), i + batchIndex);
                      try {
                        if (stryMutAct_9fa48("5005")) {
                          {}
                        } else {
                          stryCov_9fa48("5005");
                          this.logger.debug(stryMutAct_9fa48("5006") ? `` : (stryCov_9fa48("5006"), `Processing product ${stryMutAct_9fa48("5007") ? globalIndex - 1 : (stryCov_9fa48("5007"), globalIndex + 1)}/${productUrls.length}: ${url}`));
                          const startTime = Date.now();
                          const rawProduct = await adapter.extractProduct(url);
                          const extractionTime = stryMutAct_9fa48("5008") ? Date.now() + startTime : (stryCov_9fa48("5008"), Date.now() - startTime);
                          this.logger.debug(stryMutAct_9fa48("5009") ? `` : (stryCov_9fa48("5009"), `Raw product data extracted in ${extractionTime}ms:`), stryMutAct_9fa48("5010") ? {} : (stryCov_9fa48("5010"), {
                            title: stryMutAct_9fa48("5012") ? rawProduct.title.substring(0, 50) : stryMutAct_9fa48("5011") ? rawProduct.title : (stryCov_9fa48("5011", "5012"), rawProduct.title?.substring(0, 50)),
                            hasAttributes: stryMutAct_9fa48("5016") ? Object.keys(rawProduct.attributes || {}).length <= 0 : stryMutAct_9fa48("5015") ? Object.keys(rawProduct.attributes || {}).length >= 0 : stryMutAct_9fa48("5014") ? false : stryMutAct_9fa48("5013") ? true : (stryCov_9fa48("5013", "5014", "5015", "5016"), Object.keys(stryMutAct_9fa48("5019") ? rawProduct.attributes && {} : stryMutAct_9fa48("5018") ? false : stryMutAct_9fa48("5017") ? true : (stryCov_9fa48("5017", "5018", "5019"), rawProduct.attributes || {})).length > 0),
                            hasVariations: stryMutAct_9fa48("5023") ? (rawProduct.variations || []).length <= 0 : stryMutAct_9fa48("5022") ? (rawProduct.variations || []).length >= 0 : stryMutAct_9fa48("5021") ? false : stryMutAct_9fa48("5020") ? true : (stryCov_9fa48("5020", "5021", "5022", "5023"), (stryMutAct_9fa48("5026") ? rawProduct.variations && [] : stryMutAct_9fa48("5025") ? false : stryMutAct_9fa48("5024") ? true : (stryCov_9fa48("5024", "5025", "5026"), rawProduct.variations || (stryMutAct_9fa48("5027") ? ["Stryker was here"] : (stryCov_9fa48("5027"), [])))).length > 0),
                            hasShortDescription: rawProduct.shortDescription,
                            hasStockStatus: rawProduct.stockStatus,
                            hasImages: stryMutAct_9fa48("5031") ? (rawProduct.images || []).length <= 0 : stryMutAct_9fa48("5030") ? (rawProduct.images || []).length >= 0 : stryMutAct_9fa48("5029") ? false : stryMutAct_9fa48("5028") ? true : (stryCov_9fa48("5028", "5029", "5030", "5031"), (stryMutAct_9fa48("5034") ? rawProduct.images && [] : stryMutAct_9fa48("5033") ? false : stryMutAct_9fa48("5032") ? true : (stryCov_9fa48("5032", "5033", "5034"), rawProduct.images || (stryMutAct_9fa48("5035") ? ["Stryker was here"] : (stryCov_9fa48("5035"), [])))).length > 0),
                            hasCategory: rawProduct.category
                          }));
                          const normalizedProduct = await this.normalizeProduct(rawProduct, url);
                          this.logger.debug(stryMutAct_9fa48("5036") ? "" : (stryCov_9fa48("5036"), 'Normalized product:'), stryMutAct_9fa48("5037") ? {} : (stryCov_9fa48("5037"), {
                            title: stryMutAct_9fa48("5039") ? normalizedProduct.title.substring(0, 50) : stryMutAct_9fa48("5038") ? normalizedProduct.title : (stryCov_9fa48("5038", "5039"), normalizedProduct.title?.substring(0, 50)),
                            productType: normalizedProduct.productType,
                            hasVariations: stryMutAct_9fa48("5043") ? normalizedProduct.variations.length <= 0 : stryMutAct_9fa48("5042") ? normalizedProduct.variations.length >= 0 : stryMutAct_9fa48("5041") ? false : stryMutAct_9fa48("5040") ? true : (stryCov_9fa48("5040", "5041", "5042", "5043"), normalizedProduct.variations.length > 0),
                            hasAttributes: stryMutAct_9fa48("5047") ? Object.keys(normalizedProduct.attributes).length <= 0 : stryMutAct_9fa48("5046") ? Object.keys(normalizedProduct.attributes).length >= 0 : stryMutAct_9fa48("5045") ? false : stryMutAct_9fa48("5044") ? true : (stryCov_9fa48("5044", "5045", "5046", "5047"), Object.keys(normalizedProduct.attributes).length > 0)
                          }));
                          job.processedProducts = stryMutAct_9fa48("5048") ? globalIndex - 1 : (stryCov_9fa48("5048"), globalIndex + 1);
                          return normalizedProduct;
                        }
                      } catch (error) {
                        if (stryMutAct_9fa48("5049")) {
                          {}
                        } else {
                          stryCov_9fa48("5049");
                          const errorMsg = stryMutAct_9fa48("5050") ? `` : (stryCov_9fa48("5050"), `Failed to process product ${url}: ${error}`);
                          this.logger.error(errorMsg);
                          const scrapingError = ErrorFactory.createScrapingError(errorMsg, ErrorCodes.PRODUCT_NOT_FOUND, stryMutAct_9fa48("5051") ? false : (stryCov_9fa48("5051"), true));
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
                  const batchTime = stryMutAct_9fa48("5052") ? Date.now() + batchStartTime : (stryCov_9fa48("5052"), Date.now() - batchStartTime);
                  this.logger.debug(stryMutAct_9fa48("5053") ? `` : (stryCov_9fa48("5053"), `Batch completed in ${batchTime}ms, processed ${validProducts.length}/${batch.length} products successfully`));

                  // Fixed delay between batches to respect configured rateLimit
                  if (stryMutAct_9fa48("5056") ? i + batchSize < productUrls.length || rateLimit > 0 : stryMutAct_9fa48("5055") ? false : stryMutAct_9fa48("5054") ? true : (stryCov_9fa48("5054", "5055", "5056"), (stryMutAct_9fa48("5059") ? i + batchSize >= productUrls.length : stryMutAct_9fa48("5058") ? i + batchSize <= productUrls.length : stryMutAct_9fa48("5057") ? true : (stryCov_9fa48("5057", "5058", "5059"), (stryMutAct_9fa48("5060") ? i - batchSize : (stryCov_9fa48("5060"), i + batchSize)) < productUrls.length)) && (stryMutAct_9fa48("5063") ? rateLimit <= 0 : stryMutAct_9fa48("5062") ? rateLimit >= 0 : stryMutAct_9fa48("5061") ? true : (stryCov_9fa48("5061", "5062", "5063"), rateLimit > 0)))) {
                    if (stryMutAct_9fa48("5064")) {
                      {}
                    } else {
                      stryCov_9fa48("5064");
                      this.logger.debug(stryMutAct_9fa48("5065") ? `` : (stryCov_9fa48("5065"), `Waiting ${rateLimit}ms before next batch...`));
                      await this.delay(rateLimit);
                    }
                  }
                }
              }

              // Generate CSV files
              const csvResult = await CsvGenerator.generateBothCsvs(products);
              this.logger.debug(stryMutAct_9fa48("5066") ? "" : (stryCov_9fa48("5066"), 'Product type detection results:'), stryMutAct_9fa48("5067") ? {} : (stryCov_9fa48("5067"), {
                totalProducts: products.length,
                productTypes: products.map(stryMutAct_9fa48("5068") ? () => undefined : (stryCov_9fa48("5068"), p => stryMutAct_9fa48("5069") ? {} : (stryCov_9fa48("5069"), {
                  title: stryMutAct_9fa48("5070") ? p.title : (stryCov_9fa48("5070"), p.title.substring(0, 50)),
                  productType: p.productType,
                  variationsCount: p.variations.length,
                  attributesCount: Object.keys(p.attributes).length,
                  hasAttributes: stryMutAct_9fa48("5074") ? Object.keys(p.attributes).length <= 0 : stryMutAct_9fa48("5073") ? Object.keys(p.attributes).length >= 0 : stryMutAct_9fa48("5072") ? false : stryMutAct_9fa48("5071") ? true : (stryCov_9fa48("5071", "5072", "5073", "5074"), Object.keys(p.attributes).length > 0),
                  attributes: p.attributes
                }))),
                variationCsvLength: csvResult.variationCsv.length,
                parentCsvLength: csvResult.parentCsv.length,
                variationCount: csvResult.variationCount
              }));

              // Store results
              const result: JobResult = stryMutAct_9fa48("5075") ? {} : (stryCov_9fa48("5075"), {
                jobId: job.id,
                parentCsv: csvResult.parentCsv,
                variationCsv: csvResult.variationCsv,
                productCount: products.length,
                variationCount: csvResult.variationCount,
                filename: this.generateFilename(job.metadata.siteUrl, job.id),
                metadata: job.metadata,
                createdAt: new Date(),
                expiresAt: new Date(stryMutAct_9fa48("5076") ? Date.now() - 24 * 60 * 60 * 1000 : (stryCov_9fa48("5076"), Date.now() + (stryMutAct_9fa48("5077") ? 24 * 60 * 60 / 1000 : (stryCov_9fa48("5077"), (stryMutAct_9fa48("5078") ? 24 * 60 / 60 : (stryCov_9fa48("5078"), (stryMutAct_9fa48("5079") ? 24 / 60 : (stryCov_9fa48("5079"), 24 * 60)) * 60)) * 1000)))) // 24 hours
              });
              await this.storage.storeJobResult(job.id, result);

              // Mark job as completed
              job.status = stryMutAct_9fa48("5080") ? "" : (stryCov_9fa48("5080"), 'completed');
              job.completedAt = new Date();
              // totalProducts should remain as the total discovered, not just successful ones
              job.processedProducts = products.length;

              // Update performance metrics
              const jobDuration = stryMutAct_9fa48("5081") ? job.completedAt.getTime() + job.startedAt!.getTime() : (stryCov_9fa48("5081"), job.completedAt.getTime() - job.startedAt!.getTime());
              stryMutAct_9fa48("5082") ? this.performanceMetrics.totalJobs-- : (stryCov_9fa48("5082"), this.performanceMetrics.totalJobs++);
              stryMutAct_9fa48("5083") ? this.performanceMetrics.totalProducts -= products.length : (stryCov_9fa48("5083"), this.performanceMetrics.totalProducts += products.length);
              stryMutAct_9fa48("5084") ? this.performanceMetrics.totalProcessingTime -= jobDuration : (stryCov_9fa48("5084"), this.performanceMetrics.totalProcessingTime += jobDuration);
              this.performanceMetrics.averageTimePerProduct = (stryMutAct_9fa48("5088") ? this.performanceMetrics.totalProducts <= 0 : stryMutAct_9fa48("5087") ? this.performanceMetrics.totalProducts >= 0 : stryMutAct_9fa48("5086") ? false : stryMutAct_9fa48("5085") ? true : (stryCov_9fa48("5085", "5086", "5087", "5088"), this.performanceMetrics.totalProducts > 0)) ? stryMutAct_9fa48("5089") ? this.performanceMetrics.totalProcessingTime * this.performanceMetrics.totalProducts : (stryCov_9fa48("5089"), this.performanceMetrics.totalProcessingTime / this.performanceMetrics.totalProducts) : 0;
              this.logger.info(stryMutAct_9fa48("5090") ? `` : (stryCov_9fa48("5090"), `Job ${job.id} completed successfully. Processed ${products.length} products in ${jobDuration}ms.`));
              this.logger.info(stryMutAct_9fa48("5091") ? `` : (stryCov_9fa48("5091"), `Performance Metrics - Avg: ${this.performanceMetrics.averageTimePerProduct.toFixed(2)}ms/product, Total: ${this.performanceMetrics.totalProducts} products`));
            }
          } finally {
            if (stryMutAct_9fa48("5092")) {
              {}
            } else {
              stryCov_9fa48("5092");
              // Clean up adapter resources (including Puppeteer)
              if (stryMutAct_9fa48("5095") ? adapter || typeof adapter.cleanup === 'function' : stryMutAct_9fa48("5094") ? false : stryMutAct_9fa48("5093") ? true : (stryCov_9fa48("5093", "5094", "5095"), adapter && (stryMutAct_9fa48("5097") ? typeof adapter.cleanup !== 'function' : stryMutAct_9fa48("5096") ? true : (stryCov_9fa48("5096", "5097"), typeof adapter.cleanup === (stryMutAct_9fa48("5098") ? "" : (stryCov_9fa48("5098"), 'function')))))) {
                if (stryMutAct_9fa48("5099")) {
                  {}
                } else {
                  stryCov_9fa48("5099");
                  await adapter.cleanup();
                }
              }
            }
          }
        }
      } catch (error) {
        if (stryMutAct_9fa48("5100")) {
          {}
        } else {
          stryCov_9fa48("5100");
          this.logger.error(stryMutAct_9fa48("5101") ? `` : (stryCov_9fa48("5101"), `Job ${job.id} failed:`), error);
          job.status = stryMutAct_9fa48("5102") ? "" : (stryCov_9fa48("5102"), 'failed');
          job.completedAt = new Date();
          const scrapingError = ErrorFactory.createScrapingError(stryMutAct_9fa48("5103") ? `` : (stryCov_9fa48("5103"), `Job failed: ${error}`), ErrorCodes.RECIPE_ERROR, stryMutAct_9fa48("5104") ? true : (stryCov_9fa48("5104"), false));
          job.errors.push(scrapingError);

          // Clean up adapter resources even on failure
          try {
            if (stryMutAct_9fa48("5105")) {
              {}
            } else {
              stryCov_9fa48("5105");
              const adapter = await this.createAdapter(job.metadata.recipe, job.metadata.siteUrl);
              if (stryMutAct_9fa48("5108") ? adapter || typeof adapter.cleanup === 'function' : stryMutAct_9fa48("5107") ? false : stryMutAct_9fa48("5106") ? true : (stryCov_9fa48("5106", "5107", "5108"), adapter && (stryMutAct_9fa48("5110") ? typeof adapter.cleanup !== 'function' : stryMutAct_9fa48("5109") ? true : (stryCov_9fa48("5109", "5110"), typeof adapter.cleanup === (stryMutAct_9fa48("5111") ? "" : (stryCov_9fa48("5111"), 'function')))))) {
                if (stryMutAct_9fa48("5112")) {
                  {}
                } else {
                  stryCov_9fa48("5112");
                  await adapter.cleanup();
                }
              }
            }
          } catch (cleanupError) {
            if (stryMutAct_9fa48("5113")) {
              {}
            } else {
              stryCov_9fa48("5113");
              this.logger.warn(stryMutAct_9fa48("5114") ? `` : (stryCov_9fa48("5114"), `Failed to cleanup adapter for failed job ${job.id}:`), cleanupError);
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
    if (stryMutAct_9fa48("5115")) {
      {}
    } else {
      stryCov_9fa48("5115");
      try {
        if (stryMutAct_9fa48("5116")) {
          {}
        } else {
          stryCov_9fa48("5116");
          // Try to create adapter using the recipe manager
          const adapter = await this.recipeManager.createAdapter(siteUrl, recipe);
          this.logger.info(stryMutAct_9fa48("5117") ? `` : (stryCov_9fa48("5117"), `Created adapter for ${siteUrl} using recipe: ${recipe}`));
          return adapter;
        }
      } catch (error) {
        if (stryMutAct_9fa48("5118")) {
          {}
        } else {
          stryCov_9fa48("5118");
          this.logger.warn(stryMutAct_9fa48("5119") ? `` : (stryCov_9fa48("5119"), `Failed to create adapter with recipe '${recipe}', trying auto-detection: ${error}`));
          try {
            if (stryMutAct_9fa48("5120")) {
              {}
            } else {
              stryCov_9fa48("5120");
              // Fallback to auto-detection
              const adapter = await this.recipeManager.createAdapter(siteUrl);
              this.logger.info(stryMutAct_9fa48("5121") ? `` : (stryCov_9fa48("5121"), `Created adapter for ${siteUrl} using auto-detected recipe`));
              return adapter;
            }
          } catch (fallbackError) {
            if (stryMutAct_9fa48("5122")) {
              {}
            } else {
              stryCov_9fa48("5122");
              this.logger.error(stryMutAct_9fa48("5123") ? `` : (stryCov_9fa48("5123"), `Failed to create adapter for ${siteUrl}: ${fallbackError}`));
              throw new Error(stryMutAct_9fa48("5124") ? `` : (stryCov_9fa48("5124"), `No suitable recipe found for ${siteUrl}. Please provide a valid recipe name or ensure a recipe exists for this site.`));
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
    if (stryMutAct_9fa48("5125")) {
      {}
    } else {
      stryCov_9fa48("5125");
      try {
        if (stryMutAct_9fa48("5126")) {
          {}
        } else {
          stryCov_9fa48("5126");
          const job = this.activeJobs.get(jobId);
          if (stryMutAct_9fa48("5129") ? false : stryMutAct_9fa48("5128") ? true : stryMutAct_9fa48("5127") ? job : (stryCov_9fa48("5127", "5128", "5129"), !job)) {
            if (stryMutAct_9fa48("5130")) {
              {}
            } else {
              stryCov_9fa48("5130");
              return this.createErrorResponse<ScrapingJob<ProductOptions>, string>(stryMutAct_9fa48("5131") ? "" : (stryCov_9fa48("5131"), 'Job not found'));
            }
          }
          return this.createSuccessResponse(job);
        }
      } catch (error) {
        if (stryMutAct_9fa48("5132")) {
          {}
        } else {
          stryCov_9fa48("5132");
          return this.createErrorResponse<ScrapingJob<ProductOptions>, string>(stryMutAct_9fa48("5133") ? `` : (stryCov_9fa48("5133"), `Failed to get job status: ${error}`));
        }
      }
    }
  }

  /**
   * Get all jobs
   */
  async getAllJobs(): Promise<ApiResponse<ScrapingJob<ProductOptions>[]>> {
    if (stryMutAct_9fa48("5134")) {
      {}
    } else {
      stryCov_9fa48("5134");
      try {
        if (stryMutAct_9fa48("5135")) {
          {}
        } else {
          stryCov_9fa48("5135");
          const jobs = Array.from(this.activeJobs.values());
          return this.createSuccessResponse(jobs);
        }
      } catch (error) {
        if (stryMutAct_9fa48("5136")) {
          {}
        } else {
          stryCov_9fa48("5136");
          return this.createErrorResponse<ScrapingJob<ProductOptions>[], string>(stryMutAct_9fa48("5137") ? `` : (stryCov_9fa48("5137"), `Failed to get jobs: ${error}`));
        }
      }
    }
  }

  /**
   * List all available recipes
   */
  async listRecipes(): Promise<ApiResponse<string[]>> {
    if (stryMutAct_9fa48("5138")) {
      {}
    } else {
      stryCov_9fa48("5138");
      try {
        if (stryMutAct_9fa48("5139")) {
          {}
        } else {
          stryCov_9fa48("5139");
          const recipes = await this.recipeManager.listRecipes();
          return this.createSuccessResponse(recipes);
        }
      } catch (error) {
        if (stryMutAct_9fa48("5140")) {
          {}
        } else {
          stryCov_9fa48("5140");
          return this.createErrorResponse<string[], string>(stryMutAct_9fa48("5141") ? `` : (stryCov_9fa48("5141"), `Failed to list recipes: ${error}`));
        }
      }
    }
  }

  /**
   * Get recipe configuration by name
   * @param recipeName - Name of the recipe
   */
  async getRecipe(recipeName: string): Promise<ApiResponse<RecipeConfig>> {
    if (stryMutAct_9fa48("5142")) {
      {}
    } else {
      stryCov_9fa48("5142");
      try {
        if (stryMutAct_9fa48("5143")) {
          {}
        } else {
          stryCov_9fa48("5143");
          const recipe = await this.recipeManager.getRecipe(recipeName);
          return this.createSuccessResponse(recipe);
        }
      } catch (error) {
        if (stryMutAct_9fa48("5144")) {
          {}
        } else {
          stryCov_9fa48("5144");
          return this.createErrorResponse(stryMutAct_9fa48("5145") ? `` : (stryCov_9fa48("5145"), `Failed to get recipe: ${error}`));
        }
      }
    }
  }

  /**
   * Get recipe configuration by site URL
   * @param siteUrl - Site URL
   */
  async getRecipeBySiteUrl(siteUrl: string): Promise<ApiResponse<RecipeConfig>> {
    if (stryMutAct_9fa48("5146")) {
      {}
    } else {
      stryCov_9fa48("5146");
      try {
        if (stryMutAct_9fa48("5147")) {
          {}
        } else {
          stryCov_9fa48("5147");
          const recipe = await this.recipeManager.getRecipeBySiteUrl(siteUrl);
          if (stryMutAct_9fa48("5149") ? false : stryMutAct_9fa48("5148") ? true : (stryCov_9fa48("5148", "5149"), recipe)) {
            if (stryMutAct_9fa48("5150")) {
              {}
            } else {
              stryCov_9fa48("5150");
              return this.createSuccessResponse(recipe);
            }
          } else {
            if (stryMutAct_9fa48("5151")) {
              {}
            } else {
              stryCov_9fa48("5151");
              return this.createErrorResponse(stryMutAct_9fa48("5152") ? "" : (stryCov_9fa48("5152"), 'No recipe found for this site'));
            }
          }
        }
      } catch (error) {
        if (stryMutAct_9fa48("5153")) {
          {}
        } else {
          stryCov_9fa48("5153");
          return this.createErrorResponse(stryMutAct_9fa48("5154") ? `` : (stryCov_9fa48("5154"), `Failed to get recipe for site: ${error}`));
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
    if (stryMutAct_9fa48("5155")) {
      {}
    } else {
      stryCov_9fa48("5155");
      try {
        if (stryMutAct_9fa48("5156")) {
          {}
        } else {
          stryCov_9fa48("5156");
          const job = this.activeJobs.get(jobId);
          if (stryMutAct_9fa48("5159") ? false : stryMutAct_9fa48("5158") ? true : stryMutAct_9fa48("5157") ? job : (stryCov_9fa48("5157", "5158", "5159"), !job)) {
            if (stryMutAct_9fa48("5160")) {
              {}
            } else {
              stryCov_9fa48("5160");
              return this.createErrorResponse<{
                cancelled: boolean;
              }, string>(stryMutAct_9fa48("5161") ? "" : (stryCov_9fa48("5161"), 'Job not found'));
            }
          }
          if (stryMutAct_9fa48("5164") ? job.status === 'completed' && job.status === 'failed' : stryMutAct_9fa48("5163") ? false : stryMutAct_9fa48("5162") ? true : (stryCov_9fa48("5162", "5163", "5164"), (stryMutAct_9fa48("5166") ? job.status !== 'completed' : stryMutAct_9fa48("5165") ? false : (stryCov_9fa48("5165", "5166"), job.status === (stryMutAct_9fa48("5167") ? "" : (stryCov_9fa48("5167"), 'completed')))) || (stryMutAct_9fa48("5169") ? job.status !== 'failed' : stryMutAct_9fa48("5168") ? false : (stryCov_9fa48("5168", "5169"), job.status === (stryMutAct_9fa48("5170") ? "" : (stryCov_9fa48("5170"), 'failed')))))) {
            if (stryMutAct_9fa48("5171")) {
              {}
            } else {
              stryCov_9fa48("5171");
              return this.createErrorResponse<{
                cancelled: boolean;
              }, string>(stryMutAct_9fa48("5172") ? "" : (stryCov_9fa48("5172"), 'Cannot cancel completed or failed job'));
            }
          }

          // Remove from queue if pending
          const queueIndex = this.jobQueue.findIndex(stryMutAct_9fa48("5173") ? () => undefined : (stryCov_9fa48("5173"), j => stryMutAct_9fa48("5176") ? j.id !== jobId : stryMutAct_9fa48("5175") ? false : stryMutAct_9fa48("5174") ? true : (stryCov_9fa48("5174", "5175", "5176"), j.id === jobId)));
          if (stryMutAct_9fa48("5179") ? queueIndex === -1 : stryMutAct_9fa48("5178") ? false : stryMutAct_9fa48("5177") ? true : (stryCov_9fa48("5177", "5178", "5179"), queueIndex !== (stryMutAct_9fa48("5180") ? +1 : (stryCov_9fa48("5180"), -1)))) {
            if (stryMutAct_9fa48("5181")) {
              {}
            } else {
              stryCov_9fa48("5181");
              this.jobQueue.splice(queueIndex, 1);
            }
          }

          // Mark as cancelled
          job.status = stryMutAct_9fa48("5182") ? "" : (stryCov_9fa48("5182"), 'failed');
          job.completedAt = new Date();
          const scrapingError = ErrorFactory.createScrapingError(stryMutAct_9fa48("5183") ? "" : (stryCov_9fa48("5183"), 'Job cancelled by user'), ErrorCodes.UNKNOWN_ERROR, stryMutAct_9fa48("5184") ? true : (stryCov_9fa48("5184"), false));
          job.errors.push(scrapingError);
          return this.createSuccessResponse(stryMutAct_9fa48("5185") ? {} : (stryCov_9fa48("5185"), {
            cancelled: stryMutAct_9fa48("5186") ? false : (stryCov_9fa48("5186"), true)
          }), stryMutAct_9fa48("5187") ? "" : (stryCov_9fa48("5187"), 'Job cancelled successfully'));
        }
      } catch (error) {
        if (stryMutAct_9fa48("5188")) {
          {}
        } else {
          stryCov_9fa48("5188");
          return this.createErrorResponse<{
            cancelled: boolean;
          }, string>(stryMutAct_9fa48("5189") ? `` : (stryCov_9fa48("5189"), `Failed to cancel job: ${error}`));
        }
      }
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<ApiResponse<GenericMetadata<unknown>>> {
    if (stryMutAct_9fa48("5190")) {
      {}
    } else {
      stryCov_9fa48("5190");
      try {
        if (stryMutAct_9fa48("5191")) {
          {}
        } else {
          stryCov_9fa48("5191");
          const stats = await this.storage.getStorageStats();
          return this.createSuccessResponse(stats);
        }
      } catch (error) {
        if (stryMutAct_9fa48("5192")) {
          {}
        } else {
          stryCov_9fa48("5192");
          return this.createErrorResponse(stryMutAct_9fa48("5193") ? `` : (stryCov_9fa48("5193"), `Failed to get storage stats: ${error}`));
        }
      }
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(): Promise<ApiResponse<GenericMetadata<unknown>>> {
    if (stryMutAct_9fa48("5194")) {
      {}
    } else {
      stryCov_9fa48("5194");
      try {
        if (stryMutAct_9fa48("5195")) {
          {}
        } else {
          stryCov_9fa48("5195");
          return this.createSuccessResponse(stryMutAct_9fa48("5196") ? {} : (stryCov_9fa48("5196"), {
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
        if (stryMutAct_9fa48("5197")) {
          {}
        } else {
          stryCov_9fa48("5197");
          return this.createErrorResponse(stryMutAct_9fa48("5198") ? `` : (stryCov_9fa48("5198"), `Failed to get performance metrics: ${error}`));
        }
      }
    }
  }

  /**
   * Get live performance metrics with real-time data
   */
  async getLivePerformanceMetrics(): Promise<ApiResponse<GenericMetadata<unknown>>> {
    if (stryMutAct_9fa48("5199")) {
      {}
    } else {
      stryCov_9fa48("5199");
      try {
        if (stryMutAct_9fa48("5200")) {
          {}
        } else {
          stryCov_9fa48("5200");
          const now = Date.now();
          const activeJobStats = Array.from(this.activeJobs.values()).map(stryMutAct_9fa48("5201") ? () => undefined : (stryCov_9fa48("5201"), job => stryMutAct_9fa48("5202") ? {} : (stryCov_9fa48("5202"), {
            id: job.id,
            status: job.status,
            progress: stryMutAct_9fa48("5203") ? job.processedProducts * Math.max(job.totalProducts, 1) : (stryCov_9fa48("5203"), job.processedProducts / (stryMutAct_9fa48("5204") ? Math.min(job.totalProducts, 1) : (stryCov_9fa48("5204"), Math.max(job.totalProducts, 1)))),
            duration: job.startedAt ? stryMutAct_9fa48("5205") ? now + job.startedAt.getTime() : (stryCov_9fa48("5205"), now - job.startedAt.getTime()) : 0,
            productsPerSecond: (stryMutAct_9fa48("5208") ? job.startedAt || job.processedProducts > 0 : stryMutAct_9fa48("5207") ? false : stryMutAct_9fa48("5206") ? true : (stryCov_9fa48("5206", "5207", "5208"), job.startedAt && (stryMutAct_9fa48("5211") ? job.processedProducts <= 0 : stryMutAct_9fa48("5210") ? job.processedProducts >= 0 : stryMutAct_9fa48("5209") ? true : (stryCov_9fa48("5209", "5210", "5211"), job.processedProducts > 0)))) ? (stryMutAct_9fa48("5212") ? job.processedProducts * ((now - job.startedAt.getTime()) / 1000) : (stryCov_9fa48("5212"), job.processedProducts / (stryMutAct_9fa48("5213") ? (now - job.startedAt.getTime()) * 1000 : (stryCov_9fa48("5213"), (stryMutAct_9fa48("5214") ? now + job.startedAt.getTime() : (stryCov_9fa48("5214"), now - job.startedAt.getTime())) / 1000)))).toFixed(2) : 0
          })));
          return this.createSuccessResponse(stryMutAct_9fa48("5215") ? {} : (stryCov_9fa48("5215"), {
            timestamp: now,
            activeJobs: activeJobStats,
            queueLength: this.jobQueue.length,
            isProcessing: this.isProcessing,
            systemLoad: stryMutAct_9fa48("5216") ? {} : (stryCov_9fa48("5216"), {
              memoryUsage: process.memoryUsage(),
              cpuUsage: process.cpuUsage(),
              uptime: process.uptime()
            })
          }));
        }
      } catch (error) {
        if (stryMutAct_9fa48("5217")) {
          {}
        } else {
          stryCov_9fa48("5217");
          return this.createErrorResponse(stryMutAct_9fa48("5218") ? `` : (stryCov_9fa48("5218"), `Failed to get live performance metrics: ${error}`));
        }
      }
    }
  }

  /**
  * Get performance recommendations based on current metrics
  */
  async getPerformanceRecommendations(): Promise<ApiResponse<GenericMetadata<unknown>>> {
    if (stryMutAct_9fa48("5219")) {
      {}
    } else {
      stryCov_9fa48("5219");
      try {
        if (stryMutAct_9fa48("5220")) {
          {}
        } else {
          stryCov_9fa48("5220");
          const recommendations = stryMutAct_9fa48("5221") ? ["Stryker was here"] : (stryCov_9fa48("5221"), []);

          // Analyze current performance and provide recommendations
          if (stryMutAct_9fa48("5225") ? this.performanceMetrics.averageTimePerProduct <= 5000 : stryMutAct_9fa48("5224") ? this.performanceMetrics.averageTimePerProduct >= 5000 : stryMutAct_9fa48("5223") ? false : stryMutAct_9fa48("5222") ? true : (stryCov_9fa48("5222", "5223", "5224", "5225"), this.performanceMetrics.averageTimePerProduct > 5000)) {
            if (stryMutAct_9fa48("5226")) {
              {}
            } else {
              stryCov_9fa48("5226");
              recommendations.push(stryMutAct_9fa48("5227") ? {} : (stryCov_9fa48("5227"), {
                type: stryMutAct_9fa48("5228") ? "" : (stryCov_9fa48("5228"), 'performance'),
                priority: stryMutAct_9fa48("5229") ? "" : (stryCov_9fa48("5229"), 'high'),
                message: stryMutAct_9fa48("5230") ? "" : (stryCov_9fa48("5230"), 'Average processing time per product is high (>5s). Consider enabling fast mode or reducing concurrent workers.'),
                suggestion: stryMutAct_9fa48("5231") ? "" : (stryCov_9fa48("5231"), 'Set fastMode: true in recipe behavior or reduce maxConcurrent to 5-8')
              }));
            }
          }
          if (stryMutAct_9fa48("5235") ? this.activeJobs.size <= 3 : stryMutAct_9fa48("5234") ? this.activeJobs.size >= 3 : stryMutAct_9fa48("5233") ? false : stryMutAct_9fa48("5232") ? true : (stryCov_9fa48("5232", "5233", "5234", "5235"), this.activeJobs.size > 3)) {
            if (stryMutAct_9fa48("5236")) {
              {}
            } else {
              stryCov_9fa48("5236");
              recommendations.push(stryMutAct_9fa48("5237") ? {} : (stryCov_9fa48("5237"), {
                type: stryMutAct_9fa48("5238") ? "" : (stryCov_9fa48("5238"), 'concurrency'),
                priority: stryMutAct_9fa48("5239") ? "" : (stryCov_9fa48("5239"), 'medium'),
                message: stryMutAct_9fa48("5240") ? "" : (stryCov_9fa48("5240"), 'High number of active jobs may impact performance.'),
                suggestion: stryMutAct_9fa48("5241") ? "" : (stryCov_9fa48("5241"), 'Consider reducing maxConcurrent in recipe behavior')
              }));
            }
          }
          if (stryMutAct_9fa48("5245") ? this.performanceMetrics.totalJobs <= 0 : stryMutAct_9fa48("5244") ? this.performanceMetrics.totalJobs >= 0 : stryMutAct_9fa48("5243") ? false : stryMutAct_9fa48("5242") ? true : (stryCov_9fa48("5242", "5243", "5244", "5245"), this.performanceMetrics.totalJobs > 0)) {
            if (stryMutAct_9fa48("5246")) {
              {}
            } else {
              stryCov_9fa48("5246");
              const avgJobTime = stryMutAct_9fa48("5247") ? this.performanceMetrics.totalProcessingTime * this.performanceMetrics.totalJobs : (stryCov_9fa48("5247"), this.performanceMetrics.totalProcessingTime / this.performanceMetrics.totalJobs);
              if (stryMutAct_9fa48("5251") ? avgJobTime <= 300000 : stryMutAct_9fa48("5250") ? avgJobTime >= 300000 : stryMutAct_9fa48("5249") ? false : stryMutAct_9fa48("5248") ? true : (stryCov_9fa48("5248", "5249", "5250", "5251"), avgJobTime > 300000)) {
                if (stryMutAct_9fa48("5252")) {
                  {}
                } else {
                  stryCov_9fa48("5252");
                  // 5 minutes
                  recommendations.push(stryMutAct_9fa48("5253") ? {} : (stryCov_9fa48("5253"), {
                    type: stryMutAct_9fa48("5254") ? "" : (stryCov_9fa48("5254"), 'optimization'),
                    priority: stryMutAct_9fa48("5255") ? "" : (stryCov_9fa48("5255"), 'high'),
                    message: stryMutAct_9fa48("5256") ? "" : (stryCov_9fa48("5256"), 'Average job completion time is high (>5min).'),
                    suggestion: stryMutAct_9fa48("5257") ? "" : (stryCov_9fa48("5257"), 'Review rateLimit settings and consider using HTTP client instead of Puppeteer for simple sites')
                  }));
                }
              }
            }
          }
          return this.createSuccessResponse(stryMutAct_9fa48("5258") ? {} : (stryCov_9fa48("5258"), {
            recommendations,
            currentSettings: stryMutAct_9fa48("5259") ? {} : (stryCov_9fa48("5259"), {
              defaultMaxConcurrent: 10,
              defaultRateLimit: 50,
              fastModeAvailable: stryMutAct_9fa48("5260") ? false : (stryCov_9fa48("5260"), true)
            })
          }));
        }
      } catch (error) {
        if (stryMutAct_9fa48("5261")) {
          {}
        } else {
          stryCov_9fa48("5261");
          return this.createErrorResponse(stryMutAct_9fa48("5262") ? `` : (stryCov_9fa48("5262"), `Failed to get performance recommendations: ${error}`));
        }
      }
    }
  }

  /**
   * Clean up resources (including Puppeteer browsers)
   */
  async cleanup(): Promise<void> {
    if (stryMutAct_9fa48("5263")) {
      {}
    } else {
      stryCov_9fa48("5263");
      this.logger.info(stryMutAct_9fa48("5264") ? "" : (stryCov_9fa48("5264"), 'Cleaning up ScrapingService resources...'));

      // Cancel all active jobs
      for (const [jobId, job] of this.activeJobs) {
        if (stryMutAct_9fa48("5265")) {
          {}
        } else {
          stryCov_9fa48("5265");
          if (stryMutAct_9fa48("5268") ? job.status !== 'running' : stryMutAct_9fa48("5267") ? false : stryMutAct_9fa48("5266") ? true : (stryCov_9fa48("5266", "5267", "5268"), job.status === (stryMutAct_9fa48("5269") ? "" : (stryCov_9fa48("5269"), 'running')))) {
            if (stryMutAct_9fa48("5270")) {
              {}
            } else {
              stryCov_9fa48("5270");
              try {
                if (stryMutAct_9fa48("5271")) {
                  {}
                } else {
                  stryCov_9fa48("5271");
                  await this.cancelJob(jobId);
                }
              } catch (error) {
                if (stryMutAct_9fa48("5272")) {
                  {}
                } else {
                  stryCov_9fa48("5272");
                  this.logger.warn(stryMutAct_9fa48("5273") ? `` : (stryCov_9fa48("5273"), `Failed to cancel job ${jobId} during cleanup:`), error);
                }
              }
            }
          }
        }
      }

      // Clear queues
      this.jobQueue = stryMutAct_9fa48("5274") ? ["Stryker was here"] : (stryCov_9fa48("5274"), []);
      this.activeJobs.clear();
      this.logger.info(stryMutAct_9fa48("5275") ? "" : (stryCov_9fa48("5275"), 'ScrapingService cleanup completed'));
    }
  }

  /**
   * Utility function to add delay
   * @param ms - Milliseconds to wait
   */
  private delay(ms: number): Promise<void> {
    if (stryMutAct_9fa48("5276")) {
      {}
    } else {
      stryCov_9fa48("5276");
      return new Promise(stryMutAct_9fa48("5277") ? () => undefined : (stryCov_9fa48("5277"), resolve => setTimeout(resolve, ms)));
    }
  }
}