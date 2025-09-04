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
import { SiteAdapter, RecipeConfig, ValidationError, Result, ScrapingError, RawProductData, NormalizableProductData, JsonData } from '../types';
import { HttpClient } from './http-client';
import { PuppeteerHttpClient } from './puppeteer-http-client';
import { JSDOM } from 'jsdom';
import { ErrorFactory, ErrorCodes, retryManager } from './error-handler';

/**
 * Enhanced Base Adapter with better generics, error handling, and validation
 */
export abstract class EnhancedBaseAdapter<T extends RawProductData = RawProductData> implements SiteAdapter<T> {
  protected httpClient: HttpClient;
  protected puppeteerClient: PuppeteerHttpClient | null = null;
  protected config: RecipeConfig;
  protected baseUrl: string;
  protected usePuppeteer: boolean;
  constructor(config: RecipeConfig, baseUrl: string) {
    if (stryMutAct_9fa48("1421")) {
      {}
    } else {
      stryCov_9fa48("1421");
      this.config = config;
      this.baseUrl = baseUrl;
      this.httpClient = new HttpClient();
      this.usePuppeteer = stryMutAct_9fa48("1424") ? config.behavior?.useHeadlessBrowser !== true : stryMutAct_9fa48("1423") ? false : stryMutAct_9fa48("1422") ? true : (stryCov_9fa48("1422", "1423", "1424"), (stryMutAct_9fa48("1425") ? config.behavior.useHeadlessBrowser : (stryCov_9fa48("1425"), config.behavior?.useHeadlessBrowser)) === (stryMutAct_9fa48("1426") ? false : (stryCov_9fa48("1426"), true)));

      // Initialize Puppeteer if needed
      if (stryMutAct_9fa48("1428") ? false : stryMutAct_9fa48("1427") ? true : (stryCov_9fa48("1427", "1428"), this.usePuppeteer)) {
        if (stryMutAct_9fa48("1429")) {
          {}
        } else {
          stryCov_9fa48("1429");
          this.puppeteerClient = new PuppeteerHttpClient();
        }
      }
    }
  }

  /**
   * Abstract method to discover product URLs
   */
  abstract discoverProducts(): AsyncIterable<string>;

  /**
   * Abstract method to extract product data
   */
  abstract extractProduct(url: string): Promise<T>;

  /**
   * Get configuration
   */
  getConfig(): RecipeConfig {
    if (stryMutAct_9fa48("1430")) {
      {}
    } else {
      stryCov_9fa48("1430");
      return this.config;
    }
  }

  /**
   * Validate a product using recipe validation rules with proper generic constraints
   */
  validateProduct(product: T): ValidationError[] {
    if (stryMutAct_9fa48("1431")) {
      {}
    } else {
      stryCov_9fa48("1431");
      const errors: ValidationError[] = stryMutAct_9fa48("1432") ? ["Stryker was here"] : (stryCov_9fa48("1432"), []);
      const validation = this.config.validation;
      if (stryMutAct_9fa48("1435") ? false : stryMutAct_9fa48("1434") ? true : stryMutAct_9fa48("1433") ? validation : (stryCov_9fa48("1433", "1434", "1435"), !validation)) {
        if (stryMutAct_9fa48("1436")) {
          {}
        } else {
          stryCov_9fa48("1436");
          return errors;
        }
      }

      // Required fields validation
      if (stryMutAct_9fa48("1438") ? false : stryMutAct_9fa48("1437") ? true : (stryCov_9fa48("1437", "1438"), validation.requiredFields)) {
        if (stryMutAct_9fa48("1439")) {
          {}
        } else {
          stryCov_9fa48("1439");
          for (const field of validation.requiredFields) {
            if (stryMutAct_9fa48("1440")) {
              {}
            } else {
              stryCov_9fa48("1440");
              const value = (product as JsonData<unknown>)[field];
              if (stryMutAct_9fa48("1443") ? !value && typeof value === 'string' && value.trim() === '' : stryMutAct_9fa48("1442") ? false : stryMutAct_9fa48("1441") ? true : (stryCov_9fa48("1441", "1442", "1443"), (stryMutAct_9fa48("1444") ? value : (stryCov_9fa48("1444"), !value)) || (stryMutAct_9fa48("1446") ? typeof value === 'string' || value.trim() === '' : stryMutAct_9fa48("1445") ? false : (stryCov_9fa48("1445", "1446"), (stryMutAct_9fa48("1448") ? typeof value !== 'string' : stryMutAct_9fa48("1447") ? true : (stryCov_9fa48("1447", "1448"), typeof value === (stryMutAct_9fa48("1449") ? "" : (stryCov_9fa48("1449"), 'string')))) && (stryMutAct_9fa48("1451") ? value.trim() !== '' : stryMutAct_9fa48("1450") ? true : (stryCov_9fa48("1450", "1451"), (stryMutAct_9fa48("1452") ? value : (stryCov_9fa48("1452"), value.trim())) === (stryMutAct_9fa48("1453") ? "Stryker was here!" : (stryCov_9fa48("1453"), '')))))))) {
                if (stryMutAct_9fa48("1454")) {
                  {}
                } else {
                  stryCov_9fa48("1454");
                  errors.push({
                    field,
                    value,
                    expected: 'non-empty value',
                    message: `Required field '${field}' is missing or empty`
                  } as ValidationError);
                }
              }
            }
          }
        }
      }

      // Price format validation
      if (stryMutAct_9fa48("1457") ? validation.priceFormat || (product as NormalizableProductData).price : stryMutAct_9fa48("1456") ? false : stryMutAct_9fa48("1455") ? true : (stryCov_9fa48("1455", "1456", "1457"), validation.priceFormat && (product as NormalizableProductData).price)) {
        if (stryMutAct_9fa48("1458")) {
          {}
        } else {
          stryCov_9fa48("1458");
          const priceRegex = new RegExp(validation.priceFormat);
          if (stryMutAct_9fa48("1461") ? false : stryMutAct_9fa48("1460") ? true : stryMutAct_9fa48("1459") ? priceRegex.test((product as NormalizableProductData).price!) : (stryCov_9fa48("1459", "1460", "1461"), !priceRegex.test((product as NormalizableProductData).price!))) {
            if (stryMutAct_9fa48("1462")) {
              {}
            } else {
              stryCov_9fa48("1462");
              errors.push({
                field: 'price',
                value: (product as NormalizableProductData).price,
                expected: `format matching ${validation.priceFormat}`,
                message: `Price format validation failed for '${(product as NormalizableProductData).price}'`
              } as ValidationError);
            }
          }
        }
      }

      // SKU format validation
      if (stryMutAct_9fa48("1465") ? validation.skuFormat || (product as NormalizableProductData).sku : stryMutAct_9fa48("1464") ? false : stryMutAct_9fa48("1463") ? true : (stryCov_9fa48("1463", "1464", "1465"), validation.skuFormat && (product as NormalizableProductData).sku)) {
        if (stryMutAct_9fa48("1466")) {
          {}
        } else {
          stryCov_9fa48("1466");
          const skuRegex = new RegExp(validation.skuFormat);
          if (stryMutAct_9fa48("1469") ? false : stryMutAct_9fa48("1468") ? true : stryMutAct_9fa48("1467") ? skuRegex.test((product as NormalizableProductData).sku!) : (stryCov_9fa48("1467", "1468", "1469"), !skuRegex.test((product as NormalizableProductData).sku!))) {
            if (stryMutAct_9fa48("1470")) {
              {}
            } else {
              stryCov_9fa48("1470");
              errors.push({
                field: 'sku',
                value: (product as NormalizableProductData).sku,
                expected: `format matching ${validation.skuFormat}`,
                message: `SKU format validation failed for '${(product as NormalizableProductData).sku}'`
              } as ValidationError);
            }
          }
        }
      }

      // Description length validation
      if (stryMutAct_9fa48("1473") ? validation.minDescriptionLength || (product as NormalizableProductData).description : stryMutAct_9fa48("1472") ? false : stryMutAct_9fa48("1471") ? true : (stryCov_9fa48("1471", "1472", "1473"), validation.minDescriptionLength && (product as NormalizableProductData).description)) {
        if (stryMutAct_9fa48("1474")) {
          {}
        } else {
          stryCov_9fa48("1474");
          if (stryMutAct_9fa48("1478") ? (product as NormalizableProductData).description!.length >= validation.minDescriptionLength : stryMutAct_9fa48("1477") ? (product as NormalizableProductData).description!.length <= validation.minDescriptionLength : stryMutAct_9fa48("1476") ? false : stryMutAct_9fa48("1475") ? true : (stryCov_9fa48("1475", "1476", "1477", "1478"), (product as NormalizableProductData).description!.length < validation.minDescriptionLength)) {
            if (stryMutAct_9fa48("1479")) {
              {}
            } else {
              stryCov_9fa48("1479");
              errors.push({
                field: 'description',
                value: (product as NormalizableProductData).description!.length,
                expected: `at least ${validation.minDescriptionLength} characters`,
                message: `Description is too short: ${(product as NormalizableProductData).description!.length} characters`
              } as ValidationError);
            }
          }
        }
      }

      // Title length validation
      if (stryMutAct_9fa48("1482") ? validation.maxTitleLength || (product as NormalizableProductData).title : stryMutAct_9fa48("1481") ? false : stryMutAct_9fa48("1480") ? true : (stryCov_9fa48("1480", "1481", "1482"), validation.maxTitleLength && (product as NormalizableProductData).title)) {
        if (stryMutAct_9fa48("1483")) {
          {}
        } else {
          stryCov_9fa48("1483");
          if (stryMutAct_9fa48("1487") ? (product as NormalizableProductData).title!.length <= validation.maxTitleLength : stryMutAct_9fa48("1486") ? (product as NormalizableProductData).title!.length >= validation.maxTitleLength : stryMutAct_9fa48("1485") ? false : stryMutAct_9fa48("1484") ? true : (stryCov_9fa48("1484", "1485", "1486", "1487"), (product as NormalizableProductData).title!.length > validation.maxTitleLength)) {
            if (stryMutAct_9fa48("1488")) {
              {}
            } else {
              stryCov_9fa48("1488");
              errors.push({
                field: 'title',
                value: (product as NormalizableProductData).title!.length,
                expected: `at most ${validation.maxTitleLength} characters`,
                message: `Title is too long: ${(product as NormalizableProductData).title!.length} characters`
              } as ValidationError);
            }
          }
        }
      }
      return errors;
    }
  }

  /**
   * Extract product with validation and error handling
   */
  async extractProductWithValidation(url: string): Promise<Result<T, ScrapingError>> {
    if (stryMutAct_9fa48("1489")) {
      {}
    } else {
      stryCov_9fa48("1489");
      try {
        if (stryMutAct_9fa48("1490")) {
          {}
        } else {
          stryCov_9fa48("1490");
          const product = await this.extractProduct(url);
          const validationErrors = this.validateProduct(product);
          if (stryMutAct_9fa48("1494") ? validationErrors.length <= 0 : stryMutAct_9fa48("1493") ? validationErrors.length >= 0 : stryMutAct_9fa48("1492") ? false : stryMutAct_9fa48("1491") ? true : (stryCov_9fa48("1491", "1492", "1493", "1494"), validationErrors.length > 0)) {
            if (stryMutAct_9fa48("1495")) {
              {}
            } else {
              stryCov_9fa48("1495");
              const errorMessage = stryMutAct_9fa48("1496") ? `` : (stryCov_9fa48("1496"), `Product validation failed: ${validationErrors.map(stryMutAct_9fa48("1497") ? () => undefined : (stryCov_9fa48("1497"), e => e.message)).join(stryMutAct_9fa48("1498") ? "" : (stryCov_9fa48("1498"), ', '))}`);
              const error = ErrorFactory.createScrapingError(errorMessage, ErrorCodes.VALIDATION_ERROR, stryMutAct_9fa48("1499") ? true : (stryCov_9fa48("1499"), false), stryMutAct_9fa48("1500") ? {} : (stryCov_9fa48("1500"), {
                url,
                validationErrors
              }));
              return stryMutAct_9fa48("1501") ? {} : (stryCov_9fa48("1501"), {
                success: stryMutAct_9fa48("1502") ? true : (stryCov_9fa48("1502"), false),
                error
              });
            }
          }
          return stryMutAct_9fa48("1503") ? {} : (stryCov_9fa48("1503"), {
            success: stryMutAct_9fa48("1504") ? false : (stryCov_9fa48("1504"), true),
            data: product
          });
        }
      } catch (error) {
        if (stryMutAct_9fa48("1505")) {
          {}
        } else {
          stryCov_9fa48("1505");
          const scrapingError = error instanceof Error ? ErrorFactory.createScrapingError(error.message, ErrorCodes.UNKNOWN_ERROR, stryMutAct_9fa48("1506") ? true : (stryCov_9fa48("1506"), false), stryMutAct_9fa48("1507") ? {} : (stryCov_9fa48("1507"), {
            url
          })) : ErrorFactory.createScrapingError(stryMutAct_9fa48("1508") ? "" : (stryCov_9fa48("1508"), 'Unknown error during product extraction'), ErrorCodes.UNKNOWN_ERROR, stryMutAct_9fa48("1509") ? true : (stryCov_9fa48("1509"), false), stryMutAct_9fa48("1510") ? {} : (stryCov_9fa48("1510"), {
            url
          }));
          return stryMutAct_9fa48("1511") ? {} : (stryCov_9fa48("1511"), {
            success: stryMutAct_9fa48("1512") ? true : (stryCov_9fa48("1512"), false),
            error: scrapingError
          });
        }
      }
    }
  }

  /**
   * Extract product with retry logic
   */
  async extractProductWithRetry(url: string): Promise<T> {
    if (stryMutAct_9fa48("1513")) {
      {}
    } else {
      stryCov_9fa48("1513");
      const retryConfig = stryMutAct_9fa48("1514") ? {} : (stryCov_9fa48("1514"), {
        maxAttempts: stryMutAct_9fa48("1517") ? this.config.behavior?.retryAttempts && 3 : stryMutAct_9fa48("1516") ? false : stryMutAct_9fa48("1515") ? true : (stryCov_9fa48("1515", "1516", "1517"), (stryMutAct_9fa48("1518") ? this.config.behavior.retryAttempts : (stryCov_9fa48("1518"), this.config.behavior?.retryAttempts)) || 3),
        baseDelay: stryMutAct_9fa48("1521") ? this.config.behavior?.retryDelay && 1000 : stryMutAct_9fa48("1520") ? false : stryMutAct_9fa48("1519") ? true : (stryCov_9fa48("1519", "1520", "1521"), (stryMutAct_9fa48("1522") ? this.config.behavior.retryDelay : (stryCov_9fa48("1522"), this.config.behavior?.retryDelay)) || 1000),
        maxDelay: 30000,
        backoffMultiplier: 2,
        retryableErrors: stryMutAct_9fa48("1523") ? [] : (stryCov_9fa48("1523"), [ErrorCodes.NETWORK_ERROR, ErrorCodes.TIMEOUT_ERROR])
      });
      return await retryManager.executeWithRetry(stryMutAct_9fa48("1524") ? () => undefined : (stryCov_9fa48("1524"), () => this.extractProduct(url)), retryConfig, stryMutAct_9fa48("1525") ? `` : (stryCov_9fa48("1525"), `extractProduct(${url})`));
    }
  }

  /**
   * Common method to extract text content using CSS selector with error handling
   */
  protected extractText(dom: JSDOM, selector: string): string {
    if (stryMutAct_9fa48("1526")) {
      {}
    } else {
      stryCov_9fa48("1526");
      try {
        if (stryMutAct_9fa48("1527")) {
          {}
        } else {
          stryCov_9fa48("1527");
          const element = dom.window.document.querySelector(selector);
          if (stryMutAct_9fa48("1530") ? false : stryMutAct_9fa48("1529") ? true : stryMutAct_9fa48("1528") ? element : (stryCov_9fa48("1528", "1529", "1530"), !element)) {
            if (stryMutAct_9fa48("1531")) {
              {}
            } else {
              stryCov_9fa48("1531");
              return stryMutAct_9fa48("1532") ? "Stryker was here!" : (stryCov_9fa48("1532"), '');
            }
          }

          // For description fields, try to get all text content including multiple paragraphs
          if (stryMutAct_9fa48("1535") ? (selector.includes('description') || selector.includes('content')) && selector.includes('p') : stryMutAct_9fa48("1534") ? false : stryMutAct_9fa48("1533") ? true : (stryCov_9fa48("1533", "1534", "1535"), (stryMutAct_9fa48("1537") ? selector.includes('description') && selector.includes('content') : stryMutAct_9fa48("1536") ? false : (stryCov_9fa48("1536", "1537"), selector.includes(stryMutAct_9fa48("1538") ? "" : (stryCov_9fa48("1538"), 'description')) || selector.includes(stryMutAct_9fa48("1539") ? "" : (stryCov_9fa48("1539"), 'content')))) || selector.includes(stryMutAct_9fa48("1540") ? "" : (stryCov_9fa48("1540"), 'p')))) {
            if (stryMutAct_9fa48("1541")) {
              {}
            } else {
              stryCov_9fa48("1541");
              // Get all text nodes and paragraph content
              const textContent = stryMutAct_9fa48("1544") ? element.textContent?.trim() && '' : stryMutAct_9fa48("1543") ? false : stryMutAct_9fa48("1542") ? true : (stryCov_9fa48("1542", "1543", "1544"), (stryMutAct_9fa48("1546") ? element.textContent.trim() : stryMutAct_9fa48("1545") ? element.textContent : (stryCov_9fa48("1545", "1546"), element.textContent?.trim())) || (stryMutAct_9fa48("1547") ? "Stryker was here!" : (stryCov_9fa48("1547"), '')));
              const innerHTML = stryMutAct_9fa48("1550") ? element.innerHTML && '' : stryMutAct_9fa48("1549") ? false : stryMutAct_9fa48("1548") ? true : (stryCov_9fa48("1548", "1549", "1550"), element.innerHTML || (stryMutAct_9fa48("1551") ? "Stryker was here!" : (stryCov_9fa48("1551"), '')));

              // If we have HTML content, try to extract meaningful text
              if (stryMutAct_9fa48("1554") ? innerHTML.includes('<p>') && innerHTML.includes('<br>') : stryMutAct_9fa48("1553") ? false : stryMutAct_9fa48("1552") ? true : (stryCov_9fa48("1552", "1553", "1554"), innerHTML.includes(stryMutAct_9fa48("1555") ? "" : (stryCov_9fa48("1555"), '<p>')) || innerHTML.includes(stryMutAct_9fa48("1556") ? "" : (stryCov_9fa48("1556"), '<br>')))) {
                if (stryMutAct_9fa48("1557")) {
                  {}
                } else {
                  stryCov_9fa48("1557");
                  // Extract text from paragraphs and line breaks
                  const paragraphs = element.querySelectorAll(stryMutAct_9fa48("1558") ? "" : (stryCov_9fa48("1558"), 'p, br + *, div'));
                  if (stryMutAct_9fa48("1562") ? paragraphs.length <= 0 : stryMutAct_9fa48("1561") ? paragraphs.length >= 0 : stryMutAct_9fa48("1560") ? false : stryMutAct_9fa48("1559") ? true : (stryCov_9fa48("1559", "1560", "1561", "1562"), paragraphs.length > 0)) {
                    if (stryMutAct_9fa48("1563")) {
                      {}
                    } else {
                      stryCov_9fa48("1563");
                      const paragraphTexts = stryMutAct_9fa48("1564") ? Array.from(paragraphs).map(p => p.textContent?.trim())
                      // Filter out very short text
                      .join('\n\n') : (stryCov_9fa48("1564"), Array.from(paragraphs).map(stryMutAct_9fa48("1565") ? () => undefined : (stryCov_9fa48("1565"), p => stryMutAct_9fa48("1567") ? p.textContent.trim() : stryMutAct_9fa48("1566") ? p.textContent : (stryCov_9fa48("1566", "1567"), p.textContent?.trim()))).filter(stryMutAct_9fa48("1568") ? () => undefined : (stryCov_9fa48("1568"), text => stryMutAct_9fa48("1571") ? text || text.length > 10 : stryMutAct_9fa48("1570") ? false : stryMutAct_9fa48("1569") ? true : (stryCov_9fa48("1569", "1570", "1571"), text && (stryMutAct_9fa48("1574") ? text.length <= 10 : stryMutAct_9fa48("1573") ? text.length >= 10 : stryMutAct_9fa48("1572") ? true : (stryCov_9fa48("1572", "1573", "1574"), text.length > 10))))) // Filter out very short text
                      .join(stryMutAct_9fa48("1575") ? "" : (stryCov_9fa48("1575"), '\n\n')));
                      if (stryMutAct_9fa48("1577") ? false : stryMutAct_9fa48("1576") ? true : (stryCov_9fa48("1576", "1577"), paragraphTexts)) {
                        if (stryMutAct_9fa48("1578")) {
                          {}
                        } else {
                          stryCov_9fa48("1578");
                          return paragraphTexts;
                        }
                      }
                    }
                  }
                }
              }
              return textContent;
            }
          }
          return stryMutAct_9fa48("1581") ? element.textContent?.trim() && '' : stryMutAct_9fa48("1580") ? false : stryMutAct_9fa48("1579") ? true : (stryCov_9fa48("1579", "1580", "1581"), (stryMutAct_9fa48("1583") ? element.textContent.trim() : stryMutAct_9fa48("1582") ? element.textContent : (stryCov_9fa48("1582", "1583"), element.textContent?.trim())) || (stryMutAct_9fa48("1584") ? "Stryker was here!" : (stryCov_9fa48("1584"), '')));
        }
      } catch (error) {
        if (stryMutAct_9fa48("1585")) {
          {}
        } else {
          stryCov_9fa48("1585");
          console.warn(stryMutAct_9fa48("1586") ? `` : (stryCov_9fa48("1586"), `Failed to extract text from selector '${selector}':`), error);
          return stryMutAct_9fa48("1587") ? "Stryker was here!" : (stryCov_9fa48("1587"), '');
        }
      }
    }
  }

  /**
   * Common method to extract attribute value with error handling
   */
  protected extractAttribute(dom: JSDOM, selector: string, attribute: string): string {
    if (stryMutAct_9fa48("1588")) {
      {}
    } else {
      stryCov_9fa48("1588");
      try {
        if (stryMutAct_9fa48("1589")) {
          {}
        } else {
          stryCov_9fa48("1589");
          const element = dom.window.document.querySelector(selector);
          return stryMutAct_9fa48("1592") ? element?.getAttribute(attribute) && '' : stryMutAct_9fa48("1591") ? false : stryMutAct_9fa48("1590") ? true : (stryCov_9fa48("1590", "1591", "1592"), (stryMutAct_9fa48("1593") ? element.getAttribute(attribute) : (stryCov_9fa48("1593"), element?.getAttribute(attribute))) || (stryMutAct_9fa48("1594") ? "Stryker was here!" : (stryCov_9fa48("1594"), '')));
        }
      } catch (error) {
        if (stryMutAct_9fa48("1595")) {
          {}
        } else {
          stryCov_9fa48("1595");
          console.warn(stryMutAct_9fa48("1596") ? `` : (stryCov_9fa48("1596"), `Failed to extract attribute '${attribute}' from selector '${selector}':`), error);
          return stryMutAct_9fa48("1597") ? "Stryker was here!" : (stryCov_9fa48("1597"), '');
        }
      }
    }
  }

  /**
   * Common method to extract multiple elements with error handling
   */
  protected extractElements(dom: JSDOM, selector: string): Element[] {
    if (stryMutAct_9fa48("1598")) {
      {}
    } else {
      stryCov_9fa48("1598");
      try {
        if (stryMutAct_9fa48("1599")) {
          {}
        } else {
          stryCov_9fa48("1599");
          return Array.from(dom.window.document.querySelectorAll(selector));
        }
      } catch (error) {
        if (stryMutAct_9fa48("1600")) {
          {}
        } else {
          stryCov_9fa48("1600");
          console.warn(stryMutAct_9fa48("1601") ? `` : (stryCov_9fa48("1601"), `Failed to extract elements from selector '${selector}':`), error);
          return stryMutAct_9fa48("1602") ? ["Stryker was here"] : (stryCov_9fa48("1602"), []);
        }
      }
    }
  }

  /**
   * Common method to extract image URLs with error handling
   */
  protected extractImages(dom: JSDOM, selector: string): string[] {
    if (stryMutAct_9fa48("1603")) {
      {}
    } else {
      stryCov_9fa48("1603");
      try {
        if (stryMutAct_9fa48("1604")) {
          {}
        } else {
          stryCov_9fa48("1604");
          const images = this.extractElements(dom, selector);
          return stryMutAct_9fa48("1605") ? images.map(img => {
            const src = img.getAttribute('src') || img.getAttribute('data-src');
            if (src) {
              return this.resolveUrl(src);
            }
            return null;
          }) : (stryCov_9fa48("1605"), images.map(img => {
            if (stryMutAct_9fa48("1606")) {
              {}
            } else {
              stryCov_9fa48("1606");
              const src = stryMutAct_9fa48("1609") ? img.getAttribute('src') && img.getAttribute('data-src') : stryMutAct_9fa48("1608") ? false : stryMutAct_9fa48("1607") ? true : (stryCov_9fa48("1607", "1608", "1609"), img.getAttribute(stryMutAct_9fa48("1610") ? "" : (stryCov_9fa48("1610"), 'src')) || img.getAttribute(stryMutAct_9fa48("1611") ? "" : (stryCov_9fa48("1611"), 'data-src')));
              if (stryMutAct_9fa48("1613") ? false : stryMutAct_9fa48("1612") ? true : (stryCov_9fa48("1612", "1613"), src)) {
                if (stryMutAct_9fa48("1614")) {
                  {}
                } else {
                  stryCov_9fa48("1614");
                  return this.resolveUrl(src);
                }
              }
              return null;
            }
          }).filter(stryMutAct_9fa48("1615") ? () => undefined : (stryCov_9fa48("1615"), (src): src is string => stryMutAct_9fa48("1618") ? src === null : stryMutAct_9fa48("1617") ? false : stryMutAct_9fa48("1616") ? true : (stryCov_9fa48("1616", "1617", "1618"), src !== null))));
        }
      } catch (error) {
        if (stryMutAct_9fa48("1619")) {
          {}
        } else {
          stryCov_9fa48("1619");
          console.warn(stryMutAct_9fa48("1620") ? `` : (stryCov_9fa48("1620"), `Failed to extract images from selector '${selector}':`), error);
          return stryMutAct_9fa48("1621") ? ["Stryker was here"] : (stryCov_9fa48("1621"), []);
        }
      }
    }
  }

  /**
   * Common method to extract price with error handling
   */
  protected extractPrice(dom: JSDOM, selector: string): string {
    if (stryMutAct_9fa48("1622")) {
      {}
    } else {
      stryCov_9fa48("1622");
      try {
        if (stryMutAct_9fa48("1623")) {
          {}
        } else {
          stryCov_9fa48("1623");
          const priceText = this.extractText(dom, selector);
          return this.cleanPrice(priceText);
        }
      } catch (error) {
        if (stryMutAct_9fa48("1624")) {
          {}
        } else {
          stryCov_9fa48("1624");
          console.warn(stryMutAct_9fa48("1625") ? `` : (stryCov_9fa48("1625"), `Failed to extract price from selector '${selector}':`), error);
          return stryMutAct_9fa48("1626") ? "Stryker was here!" : (stryCov_9fa48("1626"), '');
        }
      }
    }
  }

  /**
   * Common method to extract stock status with error handling
   */
  protected extractStockStatus(dom: JSDOM, selector: string): string {
    if (stryMutAct_9fa48("1627")) {
      {}
    } else {
      stryCov_9fa48("1627");
      try {
        if (stryMutAct_9fa48("1628")) {
          {}
        } else {
          stryCov_9fa48("1628");
          const stockText = this.extractText(dom, selector);
          return this.normalizeStockText(stockText);
        }
      } catch (error) {
        if (stryMutAct_9fa48("1629")) {
          {}
        } else {
          stryCov_9fa48("1629");
          console.warn(stryMutAct_9fa48("1630") ? `` : (stryCov_9fa48("1630"), `Failed to extract stock status from selector '${selector}':`), error);
          return stryMutAct_9fa48("1631") ? "" : (stryCov_9fa48("1631"), 'instock'); // Default to in stock
        }
      }
    }
  }

  /**
   * Common method to extract attributes with error handling
   */
  protected extractAttributes(dom: JSDOM, selector: string): Record<string, string[]> {
    if (stryMutAct_9fa48("1632")) {
      {}
    } else {
      stryCov_9fa48("1632");
      try {
        if (stryMutAct_9fa48("1633")) {
          {}
        } else {
          stryCov_9fa48("1633");
          const attributes: Record<string, string[]> = {};
          const attributeElements = this.extractElements(dom, selector);
          for (const element of attributeElements) {
            if (stryMutAct_9fa48("1634")) {
              {}
            } else {
              stryCov_9fa48("1634");
              const nameElement = element.querySelector(stryMutAct_9fa48("1635") ? "" : (stryCov_9fa48("1635"), '[data-attribute-name], .attribute-name, .attr-name'));
              const valueElements = element.querySelectorAll(stryMutAct_9fa48("1636") ? "" : (stryCov_9fa48("1636"), '[data-attribute-value], .attribute-value, .attr-value, option'));
              if (stryMutAct_9fa48("1639") ? nameElement || valueElements.length > 0 : stryMutAct_9fa48("1638") ? false : stryMutAct_9fa48("1637") ? true : (stryCov_9fa48("1637", "1638", "1639"), nameElement && (stryMutAct_9fa48("1642") ? valueElements.length <= 0 : stryMutAct_9fa48("1641") ? valueElements.length >= 0 : stryMutAct_9fa48("1640") ? true : (stryCov_9fa48("1640", "1641", "1642"), valueElements.length > 0)))) {
                if (stryMutAct_9fa48("1643")) {
                  {}
                } else {
                  stryCov_9fa48("1643");
                  const name = stryMutAct_9fa48("1646") ? nameElement.textContent?.trim() && '' : stryMutAct_9fa48("1645") ? false : stryMutAct_9fa48("1644") ? true : (stryCov_9fa48("1644", "1645", "1646"), (stryMutAct_9fa48("1648") ? nameElement.textContent.trim() : stryMutAct_9fa48("1647") ? nameElement.textContent : (stryCov_9fa48("1647", "1648"), nameElement.textContent?.trim())) || (stryMutAct_9fa48("1649") ? "Stryker was here!" : (stryCov_9fa48("1649"), '')));
                  const values = stryMutAct_9fa48("1650") ? Array.from(valueElements).map(val => val.textContent?.trim()) : (stryCov_9fa48("1650"), Array.from(valueElements).map(stryMutAct_9fa48("1651") ? () => undefined : (stryCov_9fa48("1651"), val => stryMutAct_9fa48("1653") ? val.textContent.trim() : stryMutAct_9fa48("1652") ? val.textContent : (stryCov_9fa48("1652", "1653"), val.textContent?.trim()))).filter(stryMutAct_9fa48("1654") ? () => undefined : (stryCov_9fa48("1654"), val => stryMutAct_9fa48("1657") ? val && val !== 'בחר אפשרות' || val !== 'Select option' : stryMutAct_9fa48("1656") ? false : stryMutAct_9fa48("1655") ? true : (stryCov_9fa48("1655", "1656", "1657"), (stryMutAct_9fa48("1659") ? val || val !== 'בחר אפשרות' : stryMutAct_9fa48("1658") ? true : (stryCov_9fa48("1658", "1659"), val && (stryMutAct_9fa48("1661") ? val === 'בחר אפשרות' : stryMutAct_9fa48("1660") ? true : (stryCov_9fa48("1660", "1661"), val !== (stryMutAct_9fa48("1662") ? "" : (stryCov_9fa48("1662"), 'בחר אפשרות')))))) && (stryMutAct_9fa48("1664") ? val === 'Select option' : stryMutAct_9fa48("1663") ? true : (stryCov_9fa48("1663", "1664"), val !== (stryMutAct_9fa48("1665") ? "" : (stryCov_9fa48("1665"), 'Select option'))))))));
                  if (stryMutAct_9fa48("1668") ? name || values.length > 0 : stryMutAct_9fa48("1667") ? false : stryMutAct_9fa48("1666") ? true : (stryCov_9fa48("1666", "1667", "1668"), name && (stryMutAct_9fa48("1671") ? values.length <= 0 : stryMutAct_9fa48("1670") ? values.length >= 0 : stryMutAct_9fa48("1669") ? true : (stryCov_9fa48("1669", "1670", "1671"), values.length > 0)))) {
                    if (stryMutAct_9fa48("1672")) {
                      {}
                    } else {
                      stryCov_9fa48("1672");
                      attributes[name] = values;
                    }
                  }
                }
              }
            }
          }
          return attributes;
        }
      } catch (error) {
        if (stryMutAct_9fa48("1673")) {
          {}
        } else {
          stryCov_9fa48("1673");
          console.warn(stryMutAct_9fa48("1674") ? `` : (stryCov_9fa48("1674"), `Failed to extract attributes from selector '${selector}':`), error);
          return {};
        }
      }
    }
  }

  /**
   * Common method to extract variations with error handling and proper typing
   */
  protected extractVariations(dom: JSDOM, selector: string): RawProductData['variations'] {
    if (stryMutAct_9fa48("1675")) {
      {}
    } else {
      stryCov_9fa48("1675");
      try {
        if (stryMutAct_9fa48("1676")) {
          {}
        } else {
          stryCov_9fa48("1676");
          const variations: RawProductData['variations'] = stryMutAct_9fa48("1677") ? ["Stryker was here"] : (stryCov_9fa48("1677"), []);
          const variationElements = this.extractElements(dom, selector);
          for (const element of variationElements) {
            if (stryMutAct_9fa48("1678")) {
              {}
            } else {
              stryCov_9fa48("1678");
              const sku = stryMutAct_9fa48("1681") ? element.querySelector('[data-sku], .sku, .product-sku').textContent?.trim() : stryMutAct_9fa48("1680") ? element.querySelector('[data-sku], .sku, .product-sku')?.textContent.trim() : stryMutAct_9fa48("1679") ? element.querySelector('[data-sku], .sku, .product-sku')?.textContent : (stryCov_9fa48("1679", "1680", "1681"), element.querySelector(stryMutAct_9fa48("1682") ? "" : (stryCov_9fa48("1682"), '[data-sku], .sku, .product-sku'))?.textContent?.trim());
              const price = stryMutAct_9fa48("1685") ? element.querySelector('[data-price], .price, .product-price').textContent?.trim() : stryMutAct_9fa48("1684") ? element.querySelector('[data-price], .price, .product-price')?.textContent.trim() : stryMutAct_9fa48("1683") ? element.querySelector('[data-price], .price, .product-price')?.textContent : (stryCov_9fa48("1683", "1684", "1685"), element.querySelector(stryMutAct_9fa48("1686") ? "" : (stryCov_9fa48("1686"), '[data-price], .price, .product-price'))?.textContent?.trim());
              if (stryMutAct_9fa48("1688") ? false : stryMutAct_9fa48("1687") ? true : (stryCov_9fa48("1687", "1688"), sku)) {
                if (stryMutAct_9fa48("1689")) {
                  {}
                } else {
                  stryCov_9fa48("1689");
                  variations.push(stryMutAct_9fa48("1690") ? {} : (stryCov_9fa48("1690"), {
                    sku,
                    regularPrice: this.cleanPrice(stryMutAct_9fa48("1693") ? price && '' : stryMutAct_9fa48("1692") ? false : stryMutAct_9fa48("1691") ? true : (stryCov_9fa48("1691", "1692", "1693"), price || (stryMutAct_9fa48("1694") ? "Stryker was here!" : (stryCov_9fa48("1694"), '')))),
                    taxClass: stryMutAct_9fa48("1695") ? "Stryker was here!" : (stryCov_9fa48("1695"), ''),
                    stockStatus: stryMutAct_9fa48("1696") ? "" : (stryCov_9fa48("1696"), 'instock'),
                    images: stryMutAct_9fa48("1697") ? ["Stryker was here"] : (stryCov_9fa48("1697"), []),
                    attributeAssignments: {}
                  }));
                }
              }
            }
          }
          return variations;
        }
      } catch (error) {
        if (stryMutAct_9fa48("1698")) {
          {}
        } else {
          stryCov_9fa48("1698");
          console.warn(stryMutAct_9fa48("1699") ? `` : (stryCov_9fa48("1699"), `Failed to extract variations from selector '${selector}':`), error);
          return stryMutAct_9fa48("1700") ? ["Stryker was here"] : (stryCov_9fa48("1700"), []);
        }
      }
    }
  }

  /**
   * Resolve relative URLs to absolute URLs
   */
  protected resolveUrl(url: string): string {
    if (stryMutAct_9fa48("1701")) {
      {}
    } else {
      stryCov_9fa48("1701");
      try {
        if (stryMutAct_9fa48("1702")) {
          {}
        } else {
          stryCov_9fa48("1702");
          if (stryMutAct_9fa48("1705") ? url.endsWith('http') : stryMutAct_9fa48("1704") ? false : stryMutAct_9fa48("1703") ? true : (stryCov_9fa48("1703", "1704", "1705"), url.startsWith(stryMutAct_9fa48("1706") ? "" : (stryCov_9fa48("1706"), 'http')))) {
            if (stryMutAct_9fa48("1707")) {
              {}
            } else {
              stryCov_9fa48("1707");
              return url;
            }
          }
          if (stryMutAct_9fa48("1710") ? url.endsWith('//') : stryMutAct_9fa48("1709") ? false : stryMutAct_9fa48("1708") ? true : (stryCov_9fa48("1708", "1709", "1710"), url.startsWith(stryMutAct_9fa48("1711") ? "" : (stryCov_9fa48("1711"), '//')))) {
            if (stryMutAct_9fa48("1712")) {
              {}
            } else {
              stryCov_9fa48("1712");
              return stryMutAct_9fa48("1713") ? `` : (stryCov_9fa48("1713"), `https:${url}`);
            }
          }
          if (stryMutAct_9fa48("1716") ? url.endsWith('/') : stryMutAct_9fa48("1715") ? false : stryMutAct_9fa48("1714") ? true : (stryCov_9fa48("1714", "1715", "1716"), url.startsWith(stryMutAct_9fa48("1717") ? "" : (stryCov_9fa48("1717"), '/')))) {
            if (stryMutAct_9fa48("1718")) {
              {}
            } else {
              stryCov_9fa48("1718");
              const baseUrl = new URL(this.baseUrl);
              return stryMutAct_9fa48("1719") ? `` : (stryCov_9fa48("1719"), `${baseUrl.protocol}//${baseUrl.host}${url}`);
            }
          }
          return stryMutAct_9fa48("1720") ? `` : (stryCov_9fa48("1720"), `${this.baseUrl}/${url}`);
        }
      } catch (error) {
        if (stryMutAct_9fa48("1721")) {
          {}
        } else {
          stryCov_9fa48("1721");
          console.warn(stryMutAct_9fa48("1722") ? `` : (stryCov_9fa48("1722"), `Failed to resolve URL '${url}':`), error);
          return url;
        }
      }
    }
  }

  /**
   * Clean price text
   */
  protected cleanPrice(priceText: string): string {
    if (stryMutAct_9fa48("1723")) {
      {}
    } else {
      stryCov_9fa48("1723");
      try {
        if (stryMutAct_9fa48("1724")) {
          {}
        } else {
          stryCov_9fa48("1724");
          return stryMutAct_9fa48("1725") ? priceText.replace(/[^\d.,]/g, '').replace(',', '.') : (stryCov_9fa48("1725"), priceText.replace(stryMutAct_9fa48("1727") ? /[^\D.,]/g : stryMutAct_9fa48("1726") ? /[\d.,]/g : (stryCov_9fa48("1726", "1727"), /[^\d.,]/g), stryMutAct_9fa48("1728") ? "Stryker was here!" : (stryCov_9fa48("1728"), '')).replace(stryMutAct_9fa48("1729") ? "" : (stryCov_9fa48("1729"), ','), stryMutAct_9fa48("1730") ? "" : (stryCov_9fa48("1730"), '.')).trim());
        }
      } catch (error) {
        if (stryMutAct_9fa48("1731")) {
          {}
        } else {
          stryCov_9fa48("1731");
          console.warn(stryMutAct_9fa48("1732") ? `` : (stryCov_9fa48("1732"), `Failed to clean price text '${priceText}':`), error);
          return stryMutAct_9fa48("1733") ? "Stryker was here!" : (stryCov_9fa48("1733"), '');
        }
      }
    }
  }

  /**
   * Normalize stock text
   */
  protected normalizeStockText(stockText: string): string {
    if (stryMutAct_9fa48("1734")) {
      {}
    } else {
      stryCov_9fa48("1734");
      try {
        if (stryMutAct_9fa48("1735")) {
          {}
        } else {
          stryCov_9fa48("1735");
          const text = stryMutAct_9fa48("1736") ? stockText.toUpperCase() : (stryCov_9fa48("1736"), stockText.toLowerCase());
          if (stryMutAct_9fa48("1739") ? (text.includes('out') || text.includes('unavailable')) && text.includes('0') : stryMutAct_9fa48("1738") ? false : stryMutAct_9fa48("1737") ? true : (stryCov_9fa48("1737", "1738", "1739"), (stryMutAct_9fa48("1741") ? text.includes('out') && text.includes('unavailable') : stryMutAct_9fa48("1740") ? false : (stryCov_9fa48("1740", "1741"), text.includes(stryMutAct_9fa48("1742") ? "" : (stryCov_9fa48("1742"), 'out')) || text.includes(stryMutAct_9fa48("1743") ? "" : (stryCov_9fa48("1743"), 'unavailable')))) || text.includes(stryMutAct_9fa48("1744") ? "" : (stryCov_9fa48("1744"), '0')))) {
            if (stryMutAct_9fa48("1745")) {
              {}
            } else {
              stryCov_9fa48("1745");
              return stryMutAct_9fa48("1746") ? "" : (stryCov_9fa48("1746"), 'outofstock');
            }
          }
          if (stryMutAct_9fa48("1749") ? (text.includes('in') || text.includes('available')) && text.includes('stock') : stryMutAct_9fa48("1748") ? false : stryMutAct_9fa48("1747") ? true : (stryCov_9fa48("1747", "1748", "1749"), (stryMutAct_9fa48("1751") ? text.includes('in') && text.includes('available') : stryMutAct_9fa48("1750") ? false : (stryCov_9fa48("1750", "1751"), text.includes(stryMutAct_9fa48("1752") ? "" : (stryCov_9fa48("1752"), 'in')) || text.includes(stryMutAct_9fa48("1753") ? "" : (stryCov_9fa48("1753"), 'available')))) || text.includes(stryMutAct_9fa48("1754") ? "" : (stryCov_9fa48("1754"), 'stock')))) {
            if (stryMutAct_9fa48("1755")) {
              {}
            } else {
              stryCov_9fa48("1755");
              return stryMutAct_9fa48("1756") ? "" : (stryCov_9fa48("1756"), 'instock');
            }
          }
          return stryMutAct_9fa48("1757") ? "" : (stryCov_9fa48("1757"), 'instock'); // Default to in stock
        }
      } catch (error) {
        if (stryMutAct_9fa48("1758")) {
          {}
        } else {
          stryCov_9fa48("1758");
          console.warn(stryMutAct_9fa48("1759") ? `` : (stryCov_9fa48("1759"), `Failed to normalize stock text '${stockText}':`), error);
          return stryMutAct_9fa48("1760") ? "" : (stryCov_9fa48("1760"), 'instock');
        }
      }
    }
  }

  /**
   * Extract embedded JSON data with error handling and proper typing
   */
  protected async extractEmbeddedJson(url: string, selectors: string[]): Promise<JsonData<unknown>[]> {
    if (stryMutAct_9fa48("1761")) {
      {}
    } else {
      stryCov_9fa48("1761");
      try {
        if (stryMutAct_9fa48("1762")) {
          {}
        } else {
          stryCov_9fa48("1762");
          return await this.httpClient.extractEmbeddedJson(url, selectors);
        }
      } catch (error) {
        if (stryMutAct_9fa48("1763")) {
          {}
        } else {
          stryCov_9fa48("1763");
          console.warn(stryMutAct_9fa48("1764") ? `` : (stryCov_9fa48("1764"), `Failed to extract embedded JSON from '${url}':`), error);
          return stryMutAct_9fa48("1765") ? ["Stryker was here"] : (stryCov_9fa48("1765"), []);
        }
      }
    }
  }

  /**
   * Follow pagination with error handling and retry
   */
  protected async followPagination(baseUrl: string, pattern: string, nextPageSelector: string): Promise<string[]> {
    if (stryMutAct_9fa48("1766")) {
      {}
    } else {
      stryCov_9fa48("1766");
      const urls: string[] = stryMutAct_9fa48("1767") ? ["Stryker was here"] : (stryCov_9fa48("1767"), []);
      let currentUrl = baseUrl;
      let pageCount = 0;
      const maxPages = 100; // Safety limit - could be configurable in future

      while (stryMutAct_9fa48("1769") ? currentUrl || pageCount < maxPages : stryMutAct_9fa48("1768") ? false : (stryCov_9fa48("1768", "1769"), currentUrl && (stryMutAct_9fa48("1772") ? pageCount >= maxPages : stryMutAct_9fa48("1771") ? pageCount <= maxPages : stryMutAct_9fa48("1770") ? true : (stryCov_9fa48("1770", "1771", "1772"), pageCount < maxPages)))) {
        if (stryMutAct_9fa48("1773")) {
          {}
        } else {
          stryCov_9fa48("1773");
          try {
            if (stryMutAct_9fa48("1774")) {
              {}
            } else {
              stryCov_9fa48("1774");
              const dom = await this.getDom(currentUrl);

              // Extract product URLs from current page
              const productUrls = this.extractProductUrls(dom);
              urls.push(...productUrls);

              // Find next page
              const nextPageElement = dom.window.document.querySelector(nextPageSelector);
              if (stryMutAct_9fa48("1776") ? false : stryMutAct_9fa48("1775") ? true : (stryCov_9fa48("1775", "1776"), nextPageElement)) {
                if (stryMutAct_9fa48("1777")) {
                  {}
                } else {
                  stryCov_9fa48("1777");
                  const nextPageUrl = nextPageElement.getAttribute(stryMutAct_9fa48("1778") ? "" : (stryCov_9fa48("1778"), 'href'));
                  if (stryMutAct_9fa48("1780") ? false : stryMutAct_9fa48("1779") ? true : (stryCov_9fa48("1779", "1780"), nextPageUrl)) {
                    if (stryMutAct_9fa48("1781")) {
                      {}
                    } else {
                      stryCov_9fa48("1781");
                      currentUrl = this.resolveUrl(nextPageUrl);
                      stryMutAct_9fa48("1782") ? pageCount-- : (stryCov_9fa48("1782"), pageCount++);
                    }
                  } else {
                    if (stryMutAct_9fa48("1783")) {
                      {}
                    } else {
                      stryCov_9fa48("1783");
                      break;
                    }
                  }
                }
              } else {
                if (stryMutAct_9fa48("1784")) {
                  {}
                } else {
                  stryCov_9fa48("1784");
                  break;
                }
              }
            }
          } catch (error) {
            if (stryMutAct_9fa48("1785")) {
              {}
            } else {
              stryCov_9fa48("1785");
              console.error(stryMutAct_9fa48("1786") ? `` : (stryCov_9fa48("1786"), `Failed to process page ${currentUrl}:`), error);
              break;
            }
          }
        }
      }
      return urls;
    }
  }

  /**
   * Extract product URLs from a page (generic implementation)
   */
  protected extractProductUrls(dom: JSDOM): string[] {
    if (stryMutAct_9fa48("1787")) {
      {}
    } else {
      stryCov_9fa48("1787");
      try {
        if (stryMutAct_9fa48("1788")) {
          {}
        } else {
          stryCov_9fa48("1788");
          // This is a generic implementation - subclasses should override
          const productLinks = dom.window.document.querySelectorAll(stryMutAct_9fa48("1789") ? "" : (stryCov_9fa48("1789"), 'a[href*="/product/"], a[href*="/item/"], a[href*="/item/"], a[href*="/p/"]'));
          return stryMutAct_9fa48("1790") ? Array.from(productLinks).map(link => link.getAttribute('href')).map(href => this.resolveUrl(href)) : (stryCov_9fa48("1790"), Array.from(productLinks).map(stryMutAct_9fa48("1791") ? () => undefined : (stryCov_9fa48("1791"), link => link.getAttribute(stryMutAct_9fa48("1792") ? "" : (stryCov_9fa48("1792"), 'href')))).filter(stryMutAct_9fa48("1793") ? () => undefined : (stryCov_9fa48("1793"), (href): href is string => stryMutAct_9fa48("1796") ? href === null : stryMutAct_9fa48("1795") ? false : stryMutAct_9fa48("1794") ? true : (stryCov_9fa48("1794", "1795", "1796"), href !== null))).map(stryMutAct_9fa48("1797") ? () => undefined : (stryCov_9fa48("1797"), href => this.resolveUrl(href))));
        }
      } catch (error) {
        if (stryMutAct_9fa48("1798")) {
          {}
        } else {
          stryCov_9fa48("1798");
          console.warn(stryMutAct_9fa48("1799") ? "" : (stryCov_9fa48("1799"), 'Failed to extract product URLs:'), error);
          return stryMutAct_9fa48("1800") ? ["Stryker was here"] : (stryCov_9fa48("1800"), []);
        }
      }
    }
  }

  /**
   * Apply text transformations with error handling
   */
  protected applyTransformations(text: string, transformations: string[]): string {
    if (stryMutAct_9fa48("1801")) {
      {}
    } else {
      stryCov_9fa48("1801");
      let result = text;
      for (const transform of transformations) {
        if (stryMutAct_9fa48("1802")) {
          {}
        } else {
          stryCov_9fa48("1802");
          try {
            if (stryMutAct_9fa48("1803")) {
              {}
            } else {
              stryCov_9fa48("1803");
              // Simple regex replacement for now
              // In a real implementation, this could be more sophisticated
              if (stryMutAct_9fa48("1805") ? false : stryMutAct_9fa48("1804") ? true : (stryCov_9fa48("1804", "1805"), transform.includes(stryMutAct_9fa48("1806") ? "" : (stryCov_9fa48("1806"), '->')))) {
                if (stryMutAct_9fa48("1807")) {
                  {}
                } else {
                  stryCov_9fa48("1807");
                  const [pattern, replacement] = transform.split(stryMutAct_9fa48("1808") ? "" : (stryCov_9fa48("1808"), '->')).map(stryMutAct_9fa48("1809") ? () => undefined : (stryCov_9fa48("1809"), s => stryMutAct_9fa48("1810") ? s : (stryCov_9fa48("1810"), s.trim())));
                  if (stryMutAct_9fa48("1813") ? pattern || replacement : stryMutAct_9fa48("1812") ? false : stryMutAct_9fa48("1811") ? true : (stryCov_9fa48("1811", "1812", "1813"), pattern && replacement)) {
                    if (stryMutAct_9fa48("1814")) {
                      {}
                    } else {
                      stryCov_9fa48("1814");
                      const regex = new RegExp(pattern, stryMutAct_9fa48("1815") ? "" : (stryCov_9fa48("1815"), 'g'));
                      result = result.replace(regex, replacement);
                    }
                  }
                }
              }
            }
          } catch (error) {
            if (stryMutAct_9fa48("1816")) {
              {}
            } else {
              stryCov_9fa48("1816");
              console.warn(stryMutAct_9fa48("1817") ? `` : (stryCov_9fa48("1817"), `Failed to apply transformation: ${transform}`), error);
            }
          }
        }
      }
      return result;
    }
  }

  /**
   * Get DOM using the appropriate method (JSDOM or Puppeteer) with error handling
   */
  protected async getDom(url: string, options?: {
    waitForSelectors?: string[];
  }): Promise<JSDOM> {
    if (stryMutAct_9fa48("1818")) {
      {}
    } else {
      stryCov_9fa48("1818");
      try {
        if (stryMutAct_9fa48("1819")) {
          {}
        } else {
          stryCov_9fa48("1819");
          // Smart Puppeteer usage: use it when explicitly enabled in recipe
          const needsJavaScript = stryMutAct_9fa48("1822") ? this.config.behavior?.useHeadlessBrowser !== true : stryMutAct_9fa48("1821") ? false : stryMutAct_9fa48("1820") ? true : (stryCov_9fa48("1820", "1821", "1822"), (stryMutAct_9fa48("1823") ? this.config.behavior.useHeadlessBrowser : (stryCov_9fa48("1823"), this.config.behavior?.useHeadlessBrowser)) === (stryMutAct_9fa48("1824") ? false : (stryCov_9fa48("1824"), true)));
          if (stryMutAct_9fa48("1827") ? needsJavaScript || this.puppeteerClient : stryMutAct_9fa48("1826") ? false : stryMutAct_9fa48("1825") ? true : (stryCov_9fa48("1825", "1826", "1827"), needsJavaScript && this.puppeteerClient)) {
            if (stryMutAct_9fa48("1828")) {
              {}
            } else {
              stryCov_9fa48("1828");
              try {
                if (stryMutAct_9fa48("1829")) {
                  {}
                } else {
                  stryCov_9fa48("1829");
                  console.log(stryMutAct_9fa48("1830") ? "" : (stryCov_9fa48("1830"), '🔍 DEBUG: Using Puppeteer for JavaScript execution:'), url);
                  return await this.puppeteerClient.getDom(url, options);
                }
              } catch (error) {
                if (stryMutAct_9fa48("1831")) {
                  {}
                } else {
                  stryCov_9fa48("1831");
                  console.warn(stryMutAct_9fa48("1832") ? "" : (stryCov_9fa48("1832"), '❌ DEBUG: Puppeteer failed, falling back to JSDOM:'), error);
                  return await this.httpClient.getDom(url);
                }
              }
            }
          } else {
            if (stryMutAct_9fa48("1833")) {
              {}
            } else {
              stryCov_9fa48("1833");
              console.log(stryMutAct_9fa48("1834") ? "" : (stryCov_9fa48("1834"), '🔍 DEBUG: Using JSDOM (faster, no JavaScript execution):'), url);
              return await this.httpClient.getDom(url);
            }
          }
        }
      } catch (error) {
        if (stryMutAct_9fa48("1835")) {
          {}
        } else {
          stryCov_9fa48("1835");
          throw ErrorFactory.createScrapingError(stryMutAct_9fa48("1836") ? `` : (stryCov_9fa48("1836"), `Failed to get DOM for ${url}: ${error}`), ErrorCodes.NETWORK_ERROR, stryMutAct_9fa48("1837") ? false : (stryCov_9fa48("1837"), true), stryMutAct_9fa48("1838") ? {} : (stryCov_9fa48("1838"), {
            url,
            options
          }));
        }
      }
    }
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    if (stryMutAct_9fa48("1839")) {
      {}
    } else {
      stryCov_9fa48("1839");
      try {
        if (stryMutAct_9fa48("1840")) {
          {}
        } else {
          stryCov_9fa48("1840");
          if (stryMutAct_9fa48("1842") ? false : stryMutAct_9fa48("1841") ? true : (stryCov_9fa48("1841", "1842"), this.puppeteerClient)) {
            if (stryMutAct_9fa48("1843")) {
              {}
            } else {
              stryCov_9fa48("1843");
              await this.puppeteerClient.close();
            }
          }
        }
      } catch (error) {
        if (stryMutAct_9fa48("1844")) {
          {}
        } else {
          stryCov_9fa48("1844");
          console.warn(stryMutAct_9fa48("1845") ? "" : (stryCov_9fa48("1845"), 'Failed to cleanup Puppeteer client:'), error);
        }
      }
    }
  }

  /**
   * Get HTTP client instance
   */
  getHttpClient(): HttpClient {
    if (stryMutAct_9fa48("1846")) {
      {}
    } else {
      stryCov_9fa48("1846");
      return this.httpClient;
    }
  }

  /**
   * Get base URL
   */
  getBaseUrl(): string {
    if (stryMutAct_9fa48("1847")) {
      {}
    } else {
      stryCov_9fa48("1847");
      return this.baseUrl;
    }
  }
}