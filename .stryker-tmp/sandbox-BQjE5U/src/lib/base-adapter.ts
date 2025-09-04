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
import { SiteAdapter, RawProduct, RecipeConfig, ValidationError } from '../types';
import { HttpClient } from './http-client';
import { PuppeteerHttpClient } from './puppeteer-http-client';
import { JSDOM } from 'jsdom';
import { ErrorFactory, ErrorCodes } from './error-handler';
import { RawProductData, JsonData } from '../types';

/**
 * Base adapter class that provides common functionality for all site adapters
 */
export abstract class BaseAdapter implements SiteAdapter<RawProduct> {
  protected httpClient: HttpClient;
  protected puppeteerClient: PuppeteerHttpClient | null = null;
  protected config: RecipeConfig;
  protected baseUrl: string;
  protected usePuppeteer: boolean;
  constructor(config: RecipeConfig, baseUrl: string) {
    if (stryMutAct_9fa48("515")) {
      {}
    } else {
      stryCov_9fa48("515");
      this.config = config;
      this.baseUrl = baseUrl;
      this.httpClient = new HttpClient();
      this.usePuppeteer = stryMutAct_9fa48("518") ? config.behavior?.useHeadlessBrowser !== true : stryMutAct_9fa48("517") ? false : stryMutAct_9fa48("516") ? true : (stryCov_9fa48("516", "517", "518"), (stryMutAct_9fa48("519") ? config.behavior.useHeadlessBrowser : (stryCov_9fa48("519"), config.behavior?.useHeadlessBrowser)) === (stryMutAct_9fa48("520") ? false : (stryCov_9fa48("520"), true)));

      // Initialize Puppeteer if needed
      if (stryMutAct_9fa48("522") ? false : stryMutAct_9fa48("521") ? true : (stryCov_9fa48("521", "522"), this.usePuppeteer)) {
        if (stryMutAct_9fa48("523")) {
          {}
        } else {
          stryCov_9fa48("523");
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
  abstract extractProduct(url: string): Promise<RawProduct>;

  /**
   * Get configuration
   */
  getConfig(): RecipeConfig {
    if (stryMutAct_9fa48("524")) {
      {}
    } else {
      stryCov_9fa48("524");
      return this.config;
    }
  }

  /**
   * Validate a product using recipe validation rules with proper generic constraints
   */
  validateProduct(product: RawProduct): ValidationError[] {
    if (stryMutAct_9fa48("525")) {
      {}
    } else {
      stryCov_9fa48("525");
      const errors: ValidationError[] = stryMutAct_9fa48("526") ? ["Stryker was here"] : (stryCov_9fa48("526"), []);
      const validation = this.config.validation;
      if (stryMutAct_9fa48("529") ? false : stryMutAct_9fa48("528") ? true : stryMutAct_9fa48("527") ? validation : (stryCov_9fa48("527", "528", "529"), !validation)) {
        if (stryMutAct_9fa48("530")) {
          {}
        } else {
          stryCov_9fa48("530");
          return errors;
        }
      }

      // Required fields validation
      if (stryMutAct_9fa48("532") ? false : stryMutAct_9fa48("531") ? true : (stryCov_9fa48("531", "532"), validation.requiredFields)) {
        if (stryMutAct_9fa48("533")) {
          {}
        } else {
          stryCov_9fa48("533");
          for (const field of validation.requiredFields) {
            if (stryMutAct_9fa48("534")) {
              {}
            } else {
              stryCov_9fa48("534");
              const value = (product as any)[field];
              if (stryMutAct_9fa48("537") ? !value && typeof value === 'string' && value.trim() === '' : stryMutAct_9fa48("536") ? false : stryMutAct_9fa48("535") ? true : (stryCov_9fa48("535", "536", "537"), (stryMutAct_9fa48("538") ? value : (stryCov_9fa48("538"), !value)) || (stryMutAct_9fa48("540") ? typeof value === 'string' || value.trim() === '' : stryMutAct_9fa48("539") ? false : (stryCov_9fa48("539", "540"), (stryMutAct_9fa48("542") ? typeof value !== 'string' : stryMutAct_9fa48("541") ? true : (stryCov_9fa48("541", "542"), typeof value === (stryMutAct_9fa48("543") ? "" : (stryCov_9fa48("543"), 'string')))) && (stryMutAct_9fa48("545") ? value.trim() !== '' : stryMutAct_9fa48("544") ? true : (stryCov_9fa48("544", "545"), (stryMutAct_9fa48("546") ? value : (stryCov_9fa48("546"), value.trim())) === (stryMutAct_9fa48("547") ? "Stryker was here!" : (stryCov_9fa48("547"), '')))))))) {
                if (stryMutAct_9fa48("548")) {
                  {}
                } else {
                  stryCov_9fa48("548");
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
      if (stryMutAct_9fa48("551") ? validation.priceFormat || product.price : stryMutAct_9fa48("550") ? false : stryMutAct_9fa48("549") ? true : (stryCov_9fa48("549", "550", "551"), validation.priceFormat && product.price)) {
        if (stryMutAct_9fa48("552")) {
          {}
        } else {
          stryCov_9fa48("552");
          const priceRegex = new RegExp(validation.priceFormat);
          if (stryMutAct_9fa48("555") ? false : stryMutAct_9fa48("554") ? true : stryMutAct_9fa48("553") ? priceRegex.test(product.price) : (stryCov_9fa48("553", "554", "555"), !priceRegex.test(product.price))) {
            if (stryMutAct_9fa48("556")) {
              {}
            } else {
              stryCov_9fa48("556");
              errors.push({
                field: 'price',
                value: product.price,
                expected: `format matching ${validation.priceFormat}`,
                message: `Price format validation failed for '${product.price}'`
              } as ValidationError);
            }
          }
        }
      }

      // SKU format validation
      if (stryMutAct_9fa48("559") ? validation.skuFormat || product.sku : stryMutAct_9fa48("558") ? false : stryMutAct_9fa48("557") ? true : (stryCov_9fa48("557", "558", "559"), validation.skuFormat && product.sku)) {
        if (stryMutAct_9fa48("560")) {
          {}
        } else {
          stryCov_9fa48("560");
          const skuRegex = new RegExp(validation.skuFormat);
          if (stryMutAct_9fa48("563") ? false : stryMutAct_9fa48("562") ? true : stryMutAct_9fa48("561") ? skuRegex.test(product.sku) : (stryCov_9fa48("561", "562", "563"), !skuRegex.test(product.sku))) {
            if (stryMutAct_9fa48("564")) {
              {}
            } else {
              stryCov_9fa48("564");
              errors.push({
                field: 'sku',
                value: product.sku,
                expected: `format matching ${validation.skuFormat}`,
                message: `SKU format validation failed for '${product.sku}'`
              } as ValidationError);
            }
          }
        }
      }

      // Description length validation
      if (stryMutAct_9fa48("567") ? validation.minDescriptionLength || product.description : stryMutAct_9fa48("566") ? false : stryMutAct_9fa48("565") ? true : (stryCov_9fa48("565", "566", "567"), validation.minDescriptionLength && product.description)) {
        if (stryMutAct_9fa48("568")) {
          {}
        } else {
          stryCov_9fa48("568");
          if (stryMutAct_9fa48("572") ? product.description.length >= validation.minDescriptionLength : stryMutAct_9fa48("571") ? product.description.length <= validation.minDescriptionLength : stryMutAct_9fa48("570") ? false : stryMutAct_9fa48("569") ? true : (stryCov_9fa48("569", "570", "571", "572"), product.description.length < validation.minDescriptionLength)) {
            if (stryMutAct_9fa48("573")) {
              {}
            } else {
              stryCov_9fa48("573");
              errors.push({
                field: 'description',
                value: product.description.length,
                expected: `at least ${validation.minDescriptionLength} characters`,
                message: `Description is too short: ${product.description.length} characters`
              } as ValidationError);
            }
          }
        }
      }

      // Title length validation
      if (stryMutAct_9fa48("576") ? validation.maxTitleLength || product.title : stryMutAct_9fa48("575") ? false : stryMutAct_9fa48("574") ? true : (stryCov_9fa48("574", "575", "576"), validation.maxTitleLength && product.title)) {
        if (stryMutAct_9fa48("577")) {
          {}
        } else {
          stryCov_9fa48("577");
          if (stryMutAct_9fa48("581") ? product.title.length <= validation.maxTitleLength : stryMutAct_9fa48("580") ? product.title.length >= validation.maxTitleLength : stryMutAct_9fa48("579") ? false : stryMutAct_9fa48("578") ? true : (stryCov_9fa48("578", "579", "580", "581"), product.title.length > validation.maxTitleLength)) {
            if (stryMutAct_9fa48("582")) {
              {}
            } else {
              stryCov_9fa48("582");
              errors.push({
                field: 'title',
                value: product.title.length,
                expected: `at most ${validation.maxTitleLength} characters`,
                message: `Title is too long: ${product.title.length} characters`
              } as ValidationError);
            }
          }
        }
      }
      return errors;
    }
  }

  /**
   * Common method to extract text content using CSS selector with error handling
   */
  protected extractText(dom: JSDOM, selector: string): string {
    if (stryMutAct_9fa48("583")) {
      {}
    } else {
      stryCov_9fa48("583");
      try {
        if (stryMutAct_9fa48("584")) {
          {}
        } else {
          stryCov_9fa48("584");
          const element = dom.window.document.querySelector(selector);
          if (stryMutAct_9fa48("587") ? false : stryMutAct_9fa48("586") ? true : stryMutAct_9fa48("585") ? element : (stryCov_9fa48("585", "586", "587"), !element)) {
            if (stryMutAct_9fa48("588")) {
              {}
            } else {
              stryCov_9fa48("588");
              return stryMutAct_9fa48("589") ? "Stryker was here!" : (stryCov_9fa48("589"), '');
            }
          }

          // For description fields, try to get all text content including multiple paragraphs
          if (stryMutAct_9fa48("592") ? (selector.includes('description') || selector.includes('content')) && selector.includes('p') : stryMutAct_9fa48("591") ? false : stryMutAct_9fa48("590") ? true : (stryCov_9fa48("590", "591", "592"), (stryMutAct_9fa48("594") ? selector.includes('description') && selector.includes('content') : stryMutAct_9fa48("593") ? false : (stryCov_9fa48("593", "594"), selector.includes(stryMutAct_9fa48("595") ? "" : (stryCov_9fa48("595"), 'description')) || selector.includes(stryMutAct_9fa48("596") ? "" : (stryCov_9fa48("596"), 'content')))) || selector.includes(stryMutAct_9fa48("597") ? "" : (stryCov_9fa48("597"), 'p')))) {
            if (stryMutAct_9fa48("598")) {
              {}
            } else {
              stryCov_9fa48("598");
              // Get all text nodes and paragraph content
              const textContent = stryMutAct_9fa48("601") ? element.textContent?.trim() && '' : stryMutAct_9fa48("600") ? false : stryMutAct_9fa48("599") ? true : (stryCov_9fa48("599", "600", "601"), (stryMutAct_9fa48("603") ? element.textContent.trim() : stryMutAct_9fa48("602") ? element.textContent : (stryCov_9fa48("602", "603"), element.textContent?.trim())) || (stryMutAct_9fa48("604") ? "Stryker was here!" : (stryCov_9fa48("604"), '')));
              const innerHTML = stryMutAct_9fa48("607") ? element.innerHTML && '' : stryMutAct_9fa48("606") ? false : stryMutAct_9fa48("605") ? true : (stryCov_9fa48("605", "606", "607"), element.innerHTML || (stryMutAct_9fa48("608") ? "Stryker was here!" : (stryCov_9fa48("608"), '')));

              // If we have HTML content, try to extract meaningful text
              if (stryMutAct_9fa48("611") ? innerHTML.includes('<p>') && innerHTML.includes('<br>') : stryMutAct_9fa48("610") ? false : stryMutAct_9fa48("609") ? true : (stryCov_9fa48("609", "610", "611"), innerHTML.includes(stryMutAct_9fa48("612") ? "" : (stryCov_9fa48("612"), '<p>')) || innerHTML.includes(stryMutAct_9fa48("613") ? "" : (stryCov_9fa48("613"), '<br>')))) {
                if (stryMutAct_9fa48("614")) {
                  {}
                } else {
                  stryCov_9fa48("614");
                  // Extract text from paragraphs and line breaks
                  const paragraphs = element.querySelectorAll(stryMutAct_9fa48("615") ? "" : (stryCov_9fa48("615"), 'p, br + *, div'));
                  if (stryMutAct_9fa48("619") ? paragraphs.length <= 0 : stryMutAct_9fa48("618") ? paragraphs.length >= 0 : stryMutAct_9fa48("617") ? false : stryMutAct_9fa48("616") ? true : (stryCov_9fa48("616", "617", "618", "619"), paragraphs.length > 0)) {
                    if (stryMutAct_9fa48("620")) {
                      {}
                    } else {
                      stryCov_9fa48("620");
                      const paragraphTexts = stryMutAct_9fa48("621") ? Array.from(paragraphs).map(p => p.textContent?.trim())
                      // Filter out very short text
                      .join('\n\n') : (stryCov_9fa48("621"), Array.from(paragraphs).map(stryMutAct_9fa48("622") ? () => undefined : (stryCov_9fa48("622"), p => stryMutAct_9fa48("624") ? p.textContent.trim() : stryMutAct_9fa48("623") ? p.textContent : (stryCov_9fa48("623", "624"), p.textContent?.trim()))).filter(stryMutAct_9fa48("625") ? () => undefined : (stryCov_9fa48("625"), text => stryMutAct_9fa48("628") ? text || text.length > 10 : stryMutAct_9fa48("627") ? false : stryMutAct_9fa48("626") ? true : (stryCov_9fa48("626", "627", "628"), text && (stryMutAct_9fa48("631") ? text.length <= 10 : stryMutAct_9fa48("630") ? text.length >= 10 : stryMutAct_9fa48("629") ? true : (stryCov_9fa48("629", "630", "631"), text.length > 10))))) // Filter out very short text
                      .join(stryMutAct_9fa48("632") ? "" : (stryCov_9fa48("632"), '\n\n')));
                      if (stryMutAct_9fa48("634") ? false : stryMutAct_9fa48("633") ? true : (stryCov_9fa48("633", "634"), paragraphTexts)) {
                        if (stryMutAct_9fa48("635")) {
                          {}
                        } else {
                          stryCov_9fa48("635");
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
          return stryMutAct_9fa48("638") ? element.textContent?.trim() && '' : stryMutAct_9fa48("637") ? false : stryMutAct_9fa48("636") ? true : (stryCov_9fa48("636", "637", "638"), (stryMutAct_9fa48("640") ? element.textContent.trim() : stryMutAct_9fa48("639") ? element.textContent : (stryCov_9fa48("639", "640"), element.textContent?.trim())) || (stryMutAct_9fa48("641") ? "Stryker was here!" : (stryCov_9fa48("641"), '')));
        }
      } catch (error) {
        if (stryMutAct_9fa48("642")) {
          {}
        } else {
          stryCov_9fa48("642");
          console.warn(stryMutAct_9fa48("643") ? `` : (stryCov_9fa48("643"), `Failed to extract text from selector '${selector}':`), error);
          return stryMutAct_9fa48("644") ? "Stryker was here!" : (stryCov_9fa48("644"), '');
        }
      }
    }
  }

  /**
   * Common method to extract attribute value with error handling
   */
  protected extractAttribute(dom: JSDOM, selector: string, attribute: string): string {
    if (stryMutAct_9fa48("645")) {
      {}
    } else {
      stryCov_9fa48("645");
      try {
        if (stryMutAct_9fa48("646")) {
          {}
        } else {
          stryCov_9fa48("646");
          const element = dom.window.document.querySelector(selector);
          return stryMutAct_9fa48("649") ? element?.getAttribute(attribute) && '' : stryMutAct_9fa48("648") ? false : stryMutAct_9fa48("647") ? true : (stryCov_9fa48("647", "648", "649"), (stryMutAct_9fa48("650") ? element.getAttribute(attribute) : (stryCov_9fa48("650"), element?.getAttribute(attribute))) || (stryMutAct_9fa48("651") ? "Stryker was here!" : (stryCov_9fa48("651"), '')));
        }
      } catch (error) {
        if (stryMutAct_9fa48("652")) {
          {}
        } else {
          stryCov_9fa48("652");
          console.warn(stryMutAct_9fa48("653") ? `` : (stryCov_9fa48("653"), `Failed to extract attribute '${attribute}' from selector '${selector}':`), error);
          return stryMutAct_9fa48("654") ? "Stryker was here!" : (stryCov_9fa48("654"), '');
        }
      }
    }
  }

  /**
   * Common method to extract multiple elements with error handling
   */
  protected extractElements(dom: JSDOM, selector: string): Element[] {
    if (stryMutAct_9fa48("655")) {
      {}
    } else {
      stryCov_9fa48("655");
      try {
        if (stryMutAct_9fa48("656")) {
          {}
        } else {
          stryCov_9fa48("656");
          return Array.from(dom.window.document.querySelectorAll(selector));
        }
      } catch (error) {
        if (stryMutAct_9fa48("657")) {
          {}
        } else {
          stryCov_9fa48("657");
          console.warn(stryMutAct_9fa48("658") ? `` : (stryCov_9fa48("658"), `Failed to extract elements from selector '${selector}':`), error);
          return stryMutAct_9fa48("659") ? ["Stryker was here"] : (stryCov_9fa48("659"), []);
        }
      }
    }
  }

  /**
   * Common method to extract image URLs with error handling
   */
  protected extractImages(dom: JSDOM, selector: string): string[] {
    if (stryMutAct_9fa48("660")) {
      {}
    } else {
      stryCov_9fa48("660");
      try {
        if (stryMutAct_9fa48("661")) {
          {}
        } else {
          stryCov_9fa48("661");
          const images = this.extractElements(dom, selector);
          return stryMutAct_9fa48("662") ? images.map(img => {
            const src = img.getAttribute('src') || img.getAttribute('data-src');
            if (src) {
              return this.resolveUrl(src);
            }
            return null;
          }) : (stryCov_9fa48("662"), images.map(img => {
            if (stryMutAct_9fa48("663")) {
              {}
            } else {
              stryCov_9fa48("663");
              const src = stryMutAct_9fa48("666") ? img.getAttribute('src') && img.getAttribute('data-src') : stryMutAct_9fa48("665") ? false : stryMutAct_9fa48("664") ? true : (stryCov_9fa48("664", "665", "666"), img.getAttribute(stryMutAct_9fa48("667") ? "" : (stryCov_9fa48("667"), 'src')) || img.getAttribute(stryMutAct_9fa48("668") ? "" : (stryCov_9fa48("668"), 'data-src')));
              if (stryMutAct_9fa48("670") ? false : stryMutAct_9fa48("669") ? true : (stryCov_9fa48("669", "670"), src)) {
                if (stryMutAct_9fa48("671")) {
                  {}
                } else {
                  stryCov_9fa48("671");
                  return this.resolveUrl(src);
                }
              }
              return null;
            }
          }).filter(stryMutAct_9fa48("672") ? () => undefined : (stryCov_9fa48("672"), (src): src is string => stryMutAct_9fa48("675") ? src === null : stryMutAct_9fa48("674") ? false : stryMutAct_9fa48("673") ? true : (stryCov_9fa48("673", "674", "675"), src !== null))));
        }
      } catch (error) {
        if (stryMutAct_9fa48("676")) {
          {}
        } else {
          stryCov_9fa48("676");
          console.warn(stryMutAct_9fa48("677") ? `` : (stryCov_9fa48("677"), `Failed to extract images from selector '${selector}':`), error);
          return stryMutAct_9fa48("678") ? ["Stryker was here"] : (stryCov_9fa48("678"), []);
        }
      }
    }
  }

  /**
   * Common method to extract price with error handling
   */
  protected extractPrice(dom: JSDOM, selector: string): string {
    if (stryMutAct_9fa48("679")) {
      {}
    } else {
      stryCov_9fa48("679");
      try {
        if (stryMutAct_9fa48("680")) {
          {}
        } else {
          stryCov_9fa48("680");
          const priceText = this.extractText(dom, selector);
          return this.cleanPrice(priceText);
        }
      } catch (error) {
        if (stryMutAct_9fa48("681")) {
          {}
        } else {
          stryCov_9fa48("681");
          console.warn(stryMutAct_9fa48("682") ? `` : (stryCov_9fa48("682"), `Failed to extract price from selector '${selector}':`), error);
          return stryMutAct_9fa48("683") ? "Stryker was here!" : (stryCov_9fa48("683"), '');
        }
      }
    }
  }

  /**
   * Common method to extract stock status with error handling
   */
  protected extractStockStatus(dom: JSDOM, selector: string): string {
    if (stryMutAct_9fa48("684")) {
      {}
    } else {
      stryCov_9fa48("684");
      try {
        if (stryMutAct_9fa48("685")) {
          {}
        } else {
          stryCov_9fa48("685");
          const stockText = this.extractText(dom, selector);
          return this.normalizeStockText(stockText);
        }
      } catch (error) {
        if (stryMutAct_9fa48("686")) {
          {}
        } else {
          stryCov_9fa48("686");
          console.warn(stryMutAct_9fa48("687") ? `` : (stryCov_9fa48("687"), `Failed to extract stock status from selector '${selector}':`), error);
          return stryMutAct_9fa48("688") ? "" : (stryCov_9fa48("688"), 'instock'); // Default to in stock
        }
      }
    }
  }

  /**
   * Common method to extract attributes with error handling
   */
  protected extractAttributes(dom: JSDOM, selector: string): Record<string, string[]> {
    if (stryMutAct_9fa48("689")) {
      {}
    } else {
      stryCov_9fa48("689");
      try {
        if (stryMutAct_9fa48("690")) {
          {}
        } else {
          stryCov_9fa48("690");
          const attributes: Record<string, string[]> = {};
          const attributeElements = this.extractElements(dom, selector);
          for (const element of attributeElements) {
            if (stryMutAct_9fa48("691")) {
              {}
            } else {
              stryCov_9fa48("691");
              const nameElement = element.querySelector(stryMutAct_9fa48("692") ? "" : (stryCov_9fa48("692"), '[data-attribute-name], .attribute-name, .attr-name'));
              const valueElements = element.querySelectorAll(stryMutAct_9fa48("693") ? "" : (stryCov_9fa48("693"), '[data-attribute-value], .attribute-value, .attr-value, option'));
              if (stryMutAct_9fa48("696") ? nameElement || valueElements.length > 0 : stryMutAct_9fa48("695") ? false : stryMutAct_9fa48("694") ? true : (stryCov_9fa48("694", "695", "696"), nameElement && (stryMutAct_9fa48("699") ? valueElements.length <= 0 : stryMutAct_9fa48("698") ? valueElements.length >= 0 : stryMutAct_9fa48("697") ? true : (stryCov_9fa48("697", "698", "699"), valueElements.length > 0)))) {
                if (stryMutAct_9fa48("700")) {
                  {}
                } else {
                  stryCov_9fa48("700");
                  const name = stryMutAct_9fa48("703") ? nameElement.textContent?.trim() && '' : stryMutAct_9fa48("702") ? false : stryMutAct_9fa48("701") ? true : (stryCov_9fa48("701", "702", "703"), (stryMutAct_9fa48("705") ? nameElement.textContent.trim() : stryMutAct_9fa48("704") ? nameElement.textContent : (stryCov_9fa48("704", "705"), nameElement.textContent?.trim())) || (stryMutAct_9fa48("706") ? "Stryker was here!" : (stryCov_9fa48("706"), '')));
                  const values = stryMutAct_9fa48("707") ? Array.from(valueElements).map(val => val.textContent?.trim()) : (stryCov_9fa48("707"), Array.from(valueElements).map(stryMutAct_9fa48("708") ? () => undefined : (stryCov_9fa48("708"), val => stryMutAct_9fa48("710") ? val.textContent.trim() : stryMutAct_9fa48("709") ? val.textContent : (stryCov_9fa48("709", "710"), val.textContent?.trim()))).filter(stryMutAct_9fa48("711") ? () => undefined : (stryCov_9fa48("711"), val => stryMutAct_9fa48("714") ? val && val !== 'בחר אפשרות' || val !== 'Select option' : stryMutAct_9fa48("713") ? false : stryMutAct_9fa48("712") ? true : (stryCov_9fa48("712", "713", "714"), (stryMutAct_9fa48("716") ? val || val !== 'בחר אפשרות' : stryMutAct_9fa48("715") ? true : (stryCov_9fa48("715", "716"), val && (stryMutAct_9fa48("718") ? val === 'בחר אפשרות' : stryMutAct_9fa48("717") ? true : (stryCov_9fa48("717", "718"), val !== (stryMutAct_9fa48("719") ? "" : (stryCov_9fa48("719"), 'בחר אפשרות')))))) && (stryMutAct_9fa48("721") ? val === 'Select option' : stryMutAct_9fa48("720") ? true : (stryCov_9fa48("720", "721"), val !== (stryMutAct_9fa48("722") ? "" : (stryCov_9fa48("722"), 'Select option'))))))));
                  if (stryMutAct_9fa48("725") ? name || values.length > 0 : stryMutAct_9fa48("724") ? false : stryMutAct_9fa48("723") ? true : (stryCov_9fa48("723", "724", "725"), name && (stryMutAct_9fa48("728") ? values.length <= 0 : stryMutAct_9fa48("727") ? values.length >= 0 : stryMutAct_9fa48("726") ? true : (stryCov_9fa48("726", "727", "728"), values.length > 0)))) {
                    if (stryMutAct_9fa48("729")) {
                      {}
                    } else {
                      stryCov_9fa48("729");
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
        if (stryMutAct_9fa48("730")) {
          {}
        } else {
          stryCov_9fa48("730");
          console.warn(stryMutAct_9fa48("731") ? `` : (stryCov_9fa48("731"), `Failed to extract attributes from selector '${selector}':`), error);
          return {};
        }
      }
    }
  }

  /**
   * Common method to extract variations with error handling and proper typing
   */
  protected extractVariations(dom: JSDOM, selector: string): RawProductData['variations'] {
    if (stryMutAct_9fa48("732")) {
      {}
    } else {
      stryCov_9fa48("732");
      try {
        if (stryMutAct_9fa48("733")) {
          {}
        } else {
          stryCov_9fa48("733");
          const variations: RawProductData['variations'] = stryMutAct_9fa48("734") ? ["Stryker was here"] : (stryCov_9fa48("734"), []);
          const variationElements = this.extractElements(dom, selector);
          for (const element of variationElements) {
            if (stryMutAct_9fa48("735")) {
              {}
            } else {
              stryCov_9fa48("735");
              const sku = stryMutAct_9fa48("738") ? element.querySelector('[data-sku], .sku, .product-sku').textContent?.trim() : stryMutAct_9fa48("737") ? element.querySelector('[data-sku], .sku, .product-sku')?.textContent.trim() : stryMutAct_9fa48("736") ? element.querySelector('[data-sku], .sku, .product-sku')?.textContent : (stryCov_9fa48("736", "737", "738"), element.querySelector(stryMutAct_9fa48("739") ? "" : (stryCov_9fa48("739"), '[data-sku], .sku, .product-sku'))?.textContent?.trim());
              const price = stryMutAct_9fa48("742") ? element.querySelector('[data-price], .price, .product-price').textContent?.trim() : stryMutAct_9fa48("741") ? element.querySelector('[data-price], .price, .product-price')?.textContent.trim() : stryMutAct_9fa48("740") ? element.querySelector('[data-price], .price, .product-price')?.textContent : (stryCov_9fa48("740", "741", "742"), element.querySelector(stryMutAct_9fa48("743") ? "" : (stryCov_9fa48("743"), '[data-price], .price, .product-price'))?.textContent?.trim());
              if (stryMutAct_9fa48("745") ? false : stryMutAct_9fa48("744") ? true : (stryCov_9fa48("744", "745"), sku)) {
                if (stryMutAct_9fa48("746")) {
                  {}
                } else {
                  stryCov_9fa48("746");
                  variations.push(stryMutAct_9fa48("747") ? {} : (stryCov_9fa48("747"), {
                    sku,
                    regularPrice: this.cleanPrice(stryMutAct_9fa48("750") ? price && '' : stryMutAct_9fa48("749") ? false : stryMutAct_9fa48("748") ? true : (stryCov_9fa48("748", "749", "750"), price || (stryMutAct_9fa48("751") ? "Stryker was here!" : (stryCov_9fa48("751"), '')))),
                    taxClass: stryMutAct_9fa48("752") ? "Stryker was here!" : (stryCov_9fa48("752"), ''),
                    stockStatus: stryMutAct_9fa48("753") ? "" : (stryCov_9fa48("753"), 'instock'),
                    images: stryMutAct_9fa48("754") ? ["Stryker was here"] : (stryCov_9fa48("754"), []),
                    attributeAssignments: {}
                  }));
                }
              }
            }
          }
          return variations;
        }
      } catch (error) {
        if (stryMutAct_9fa48("755")) {
          {}
        } else {
          stryCov_9fa48("755");
          console.warn(stryMutAct_9fa48("756") ? `` : (stryCov_9fa48("756"), `Failed to extract variations from selector '${selector}':`), error);
          return stryMutAct_9fa48("757") ? ["Stryker was here"] : (stryCov_9fa48("757"), []);
        }
      }
    }
  }

  /**
   * Resolve relative URLs to absolute URLs
   */
  protected resolveUrl(url: string): string {
    if (stryMutAct_9fa48("758")) {
      {}
    } else {
      stryCov_9fa48("758");
      try {
        if (stryMutAct_9fa48("759")) {
          {}
        } else {
          stryCov_9fa48("759");
          if (stryMutAct_9fa48("762") ? url.endsWith('http') : stryMutAct_9fa48("761") ? false : stryMutAct_9fa48("760") ? true : (stryCov_9fa48("760", "761", "762"), url.startsWith(stryMutAct_9fa48("763") ? "" : (stryCov_9fa48("763"), 'http')))) {
            if (stryMutAct_9fa48("764")) {
              {}
            } else {
              stryCov_9fa48("764");
              return url;
            }
          }
          if (stryMutAct_9fa48("767") ? url.endsWith('//') : stryMutAct_9fa48("766") ? false : stryMutAct_9fa48("765") ? true : (stryCov_9fa48("765", "766", "767"), url.startsWith(stryMutAct_9fa48("768") ? "" : (stryCov_9fa48("768"), '//')))) {
            if (stryMutAct_9fa48("769")) {
              {}
            } else {
              stryCov_9fa48("769");
              return stryMutAct_9fa48("770") ? `` : (stryCov_9fa48("770"), `https:${url}`);
            }
          }
          if (stryMutAct_9fa48("773") ? url.endsWith('/') : stryMutAct_9fa48("772") ? false : stryMutAct_9fa48("771") ? true : (stryCov_9fa48("771", "772", "773"), url.startsWith(stryMutAct_9fa48("774") ? "" : (stryCov_9fa48("774"), '/')))) {
            if (stryMutAct_9fa48("775")) {
              {}
            } else {
              stryCov_9fa48("775");
              const baseUrl = new URL(this.baseUrl);
              return stryMutAct_9fa48("776") ? `` : (stryCov_9fa48("776"), `${baseUrl.protocol}//${baseUrl.host}${url}`);
            }
          }
          return stryMutAct_9fa48("777") ? `` : (stryCov_9fa48("777"), `${this.baseUrl}/${url}`);
        }
      } catch (error) {
        if (stryMutAct_9fa48("778")) {
          {}
        } else {
          stryCov_9fa48("778");
          console.warn(stryMutAct_9fa48("779") ? `` : (stryCov_9fa48("779"), `Failed to resolve URL '${url}':`), error);
          return url;
        }
      }
    }
  }

  /**
   * Clean price text
   */
  protected cleanPrice(priceText: string): string {
    if (stryMutAct_9fa48("780")) {
      {}
    } else {
      stryCov_9fa48("780");
      try {
        if (stryMutAct_9fa48("781")) {
          {}
        } else {
          stryCov_9fa48("781");
          return stryMutAct_9fa48("782") ? priceText.replace(/[^\d.,]/g, '').replace(',', '.') : (stryCov_9fa48("782"), priceText.replace(stryMutAct_9fa48("784") ? /[^\D.,]/g : stryMutAct_9fa48("783") ? /[\d.,]/g : (stryCov_9fa48("783", "784"), /[^\d.,]/g), stryMutAct_9fa48("785") ? "Stryker was here!" : (stryCov_9fa48("785"), '')).replace(stryMutAct_9fa48("786") ? "" : (stryCov_9fa48("786"), ','), stryMutAct_9fa48("787") ? "" : (stryCov_9fa48("787"), '.')).trim());
        }
      } catch (error) {
        if (stryMutAct_9fa48("788")) {
          {}
        } else {
          stryCov_9fa48("788");
          console.warn(stryMutAct_9fa48("789") ? `` : (stryCov_9fa48("789"), `Failed to clean price text '${priceText}':`), error);
          return stryMutAct_9fa48("790") ? "Stryker was here!" : (stryCov_9fa48("790"), '');
        }
      }
    }
  }

  /**
   * Normalize stock text
   */
  protected normalizeStockText(stockText: string): string {
    if (stryMutAct_9fa48("791")) {
      {}
    } else {
      stryCov_9fa48("791");
      try {
        if (stryMutAct_9fa48("792")) {
          {}
        } else {
          stryCov_9fa48("792");
          const text = stryMutAct_9fa48("793") ? stockText.toUpperCase() : (stryCov_9fa48("793"), stockText.toLowerCase());
          if (stryMutAct_9fa48("796") ? (text.includes('out') || text.includes('unavailable')) && text.includes('0') : stryMutAct_9fa48("795") ? false : stryMutAct_9fa48("794") ? true : (stryCov_9fa48("794", "795", "796"), (stryMutAct_9fa48("798") ? text.includes('out') && text.includes('unavailable') : stryMutAct_9fa48("797") ? false : (stryCov_9fa48("797", "798"), text.includes(stryMutAct_9fa48("799") ? "" : (stryCov_9fa48("799"), 'out')) || text.includes(stryMutAct_9fa48("800") ? "" : (stryCov_9fa48("800"), 'unavailable')))) || text.includes(stryMutAct_9fa48("801") ? "" : (stryCov_9fa48("801"), '0')))) {
            if (stryMutAct_9fa48("802")) {
              {}
            } else {
              stryCov_9fa48("802");
              return stryMutAct_9fa48("803") ? "" : (stryCov_9fa48("803"), 'outofstock');
            }
          }
          if (stryMutAct_9fa48("806") ? (text.includes('in') || text.includes('available')) && text.includes('stock') : stryMutAct_9fa48("805") ? false : stryMutAct_9fa48("804") ? true : (stryCov_9fa48("804", "805", "806"), (stryMutAct_9fa48("808") ? text.includes('in') && text.includes('available') : stryMutAct_9fa48("807") ? false : (stryCov_9fa48("807", "808"), text.includes(stryMutAct_9fa48("809") ? "" : (stryCov_9fa48("809"), 'in')) || text.includes(stryMutAct_9fa48("810") ? "" : (stryCov_9fa48("810"), 'available')))) || text.includes(stryMutAct_9fa48("811") ? "" : (stryCov_9fa48("811"), 'stock')))) {
            if (stryMutAct_9fa48("812")) {
              {}
            } else {
              stryCov_9fa48("812");
              return stryMutAct_9fa48("813") ? "" : (stryCov_9fa48("813"), 'instock');
            }
          }
          return stryMutAct_9fa48("814") ? "" : (stryCov_9fa48("814"), 'instock'); // Default to in stock
        }
      } catch (error) {
        if (stryMutAct_9fa48("815")) {
          {}
        } else {
          stryCov_9fa48("815");
          console.warn(stryMutAct_9fa48("816") ? `` : (stryCov_9fa48("816"), `Failed to normalize stock text '${stockText}':`), error);
          return stryMutAct_9fa48("817") ? "" : (stryCov_9fa48("817"), 'instock');
        }
      }
    }
  }

  /**
   * Extract embedded JSON data with error handling and proper typing
   */
  protected async extractEmbeddedJson(url: string, selectors: string[]): Promise<JsonData<unknown>[]> {
    if (stryMutAct_9fa48("818")) {
      {}
    } else {
      stryCov_9fa48("818");
      try {
        if (stryMutAct_9fa48("819")) {
          {}
        } else {
          stryCov_9fa48("819");
          return await this.httpClient.extractEmbeddedJson(url, selectors);
        }
      } catch (error) {
        if (stryMutAct_9fa48("820")) {
          {}
        } else {
          stryCov_9fa48("820");
          console.warn(stryMutAct_9fa48("821") ? `` : (stryCov_9fa48("821"), `Failed to extract embedded JSON from '${url}':`), error);
          return stryMutAct_9fa48("822") ? ["Stryker was here"] : (stryCov_9fa48("822"), []);
        }
      }
    }
  }

  /**
   * Follow pagination with error handling and retry
   */
  protected async followPagination(baseUrl: string, pattern: string, nextPageSelector: string): Promise<string[]> {
    if (stryMutAct_9fa48("823")) {
      {}
    } else {
      stryCov_9fa48("823");
      const urls: string[] = stryMutAct_9fa48("824") ? ["Stryker was here"] : (stryCov_9fa48("824"), []);
      let currentUrl = baseUrl;
      let pageCount = 0;
      const maxPages = 100; // Safety limit - could be configurable in future

      while (stryMutAct_9fa48("826") ? currentUrl || pageCount < maxPages : stryMutAct_9fa48("825") ? false : (stryCov_9fa48("825", "826"), currentUrl && (stryMutAct_9fa48("829") ? pageCount >= maxPages : stryMutAct_9fa48("828") ? pageCount <= maxPages : stryMutAct_9fa48("827") ? true : (stryCov_9fa48("827", "828", "829"), pageCount < maxPages)))) {
        if (stryMutAct_9fa48("830")) {
          {}
        } else {
          stryCov_9fa48("830");
          try {
            if (stryMutAct_9fa48("831")) {
              {}
            } else {
              stryCov_9fa48("831");
              const dom = await this.getDom(currentUrl);

              // Extract product URLs from current page
              const productUrls = this.extractProductUrls(dom);
              urls.push(...productUrls);

              // Find next page
              const nextPageElement = dom.window.document.querySelector(nextPageSelector);
              if (stryMutAct_9fa48("833") ? false : stryMutAct_9fa48("832") ? true : (stryCov_9fa48("832", "833"), nextPageElement)) {
                if (stryMutAct_9fa48("834")) {
                  {}
                } else {
                  stryCov_9fa48("834");
                  const nextPageUrl = nextPageElement.getAttribute(stryMutAct_9fa48("835") ? "" : (stryCov_9fa48("835"), 'href'));
                  if (stryMutAct_9fa48("837") ? false : stryMutAct_9fa48("836") ? true : (stryCov_9fa48("836", "837"), nextPageUrl)) {
                    if (stryMutAct_9fa48("838")) {
                      {}
                    } else {
                      stryCov_9fa48("838");
                      currentUrl = this.resolveUrl(nextPageUrl);
                      stryMutAct_9fa48("839") ? pageCount-- : (stryCov_9fa48("839"), pageCount++);
                    }
                  } else {
                    if (stryMutAct_9fa48("840")) {
                      {}
                    } else {
                      stryCov_9fa48("840");
                      break;
                    }
                  }
                }
              } else {
                if (stryMutAct_9fa48("841")) {
                  {}
                } else {
                  stryCov_9fa48("841");
                  break;
                }
              }
            }
          } catch (error) {
            if (stryMutAct_9fa48("842")) {
              {}
            } else {
              stryCov_9fa48("842");
              console.error(stryMutAct_9fa48("843") ? `` : (stryCov_9fa48("843"), `Failed to process page ${currentUrl}:`), error);
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
    if (stryMutAct_9fa48("844")) {
      {}
    } else {
      stryCov_9fa48("844");
      try {
        if (stryMutAct_9fa48("845")) {
          {}
        } else {
          stryCov_9fa48("845");
          // This is a generic implementation - subclasses should override
          const productLinks = dom.window.document.querySelectorAll(stryMutAct_9fa48("846") ? "" : (stryCov_9fa48("846"), 'a[href*="/product/"], a[href*="/item/"], a[href*="/item/"], a[href*="/p/"]'));
          return stryMutAct_9fa48("847") ? Array.from(productLinks).map(link => link.getAttribute('href')).map(href => this.resolveUrl(href)) : (stryCov_9fa48("847"), Array.from(productLinks).map(stryMutAct_9fa48("848") ? () => undefined : (stryCov_9fa48("848"), link => link.getAttribute(stryMutAct_9fa48("849") ? "" : (stryCov_9fa48("849"), 'href')))).filter(stryMutAct_9fa48("850") ? () => undefined : (stryCov_9fa48("850"), (href): href is string => stryMutAct_9fa48("853") ? href === null : stryMutAct_9fa48("852") ? false : stryMutAct_9fa48("851") ? true : (stryCov_9fa48("851", "852", "853"), href !== null))).map(stryMutAct_9fa48("854") ? () => undefined : (stryCov_9fa48("854"), href => this.resolveUrl(href))));
        }
      } catch (error) {
        if (stryMutAct_9fa48("855")) {
          {}
        } else {
          stryCov_9fa48("855");
          console.warn(stryMutAct_9fa48("856") ? "" : (stryCov_9fa48("856"), 'Failed to extract product URLs:'), error);
          return stryMutAct_9fa48("857") ? ["Stryker was here"] : (stryCov_9fa48("857"), []);
        }
      }
    }
  }

  /**
   * Apply text transformations with error handling
   */
  protected applyTransformations(text: string, transformations: string[]): string {
    if (stryMutAct_9fa48("858")) {
      {}
    } else {
      stryCov_9fa48("858");
      let result = text;
      for (const transform of transformations) {
        if (stryMutAct_9fa48("859")) {
          {}
        } else {
          stryCov_9fa48("859");
          try {
            if (stryMutAct_9fa48("860")) {
              {}
            } else {
              stryCov_9fa48("860");
              // Simple regex replacement for now
              // In a real implementation, this could be more sophisticated
              if (stryMutAct_9fa48("862") ? false : stryMutAct_9fa48("861") ? true : (stryCov_9fa48("861", "862"), transform.includes(stryMutAct_9fa48("863") ? "" : (stryCov_9fa48("863"), '->')))) {
                if (stryMutAct_9fa48("864")) {
                  {}
                } else {
                  stryCov_9fa48("864");
                  const [pattern, replacement] = transform.split(stryMutAct_9fa48("865") ? "" : (stryCov_9fa48("865"), '->')).map(stryMutAct_9fa48("866") ? () => undefined : (stryCov_9fa48("866"), s => stryMutAct_9fa48("867") ? s : (stryCov_9fa48("867"), s.trim())));
                  if (stryMutAct_9fa48("870") ? pattern || replacement : stryMutAct_9fa48("869") ? false : stryMutAct_9fa48("868") ? true : (stryCov_9fa48("868", "869", "870"), pattern && replacement)) {
                    if (stryMutAct_9fa48("871")) {
                      {}
                    } else {
                      stryCov_9fa48("871");
                      const regex = new RegExp(pattern, stryMutAct_9fa48("872") ? "" : (stryCov_9fa48("872"), 'g'));
                      result = result.replace(regex, replacement);
                    }
                  }
                }
              }
            }
          } catch (error) {
            if (stryMutAct_9fa48("873")) {
              {}
            } else {
              stryCov_9fa48("873");
              console.warn(stryMutAct_9fa48("874") ? `` : (stryCov_9fa48("874"), `Failed to apply transformation: ${transform}`), error);
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
    if (stryMutAct_9fa48("875")) {
      {}
    } else {
      stryCov_9fa48("875");
      try {
        if (stryMutAct_9fa48("876")) {
          {}
        } else {
          stryCov_9fa48("876");
          // Smart Puppeteer usage: use it when explicitly enabled in recipe
          const needsJavaScript = stryMutAct_9fa48("879") ? this.config.behavior?.useHeadlessBrowser !== true : stryMutAct_9fa48("878") ? false : stryMutAct_9fa48("877") ? true : (stryCov_9fa48("877", "878", "879"), (stryMutAct_9fa48("880") ? this.config.behavior.useHeadlessBrowser : (stryCov_9fa48("880"), this.config.behavior?.useHeadlessBrowser)) === (stryMutAct_9fa48("881") ? false : (stryCov_9fa48("881"), true)));
          if (stryMutAct_9fa48("884") ? needsJavaScript || this.puppeteerClient : stryMutAct_9fa48("883") ? false : stryMutAct_9fa48("882") ? true : (stryCov_9fa48("882", "883", "884"), needsJavaScript && this.puppeteerClient)) {
            if (stryMutAct_9fa48("885")) {
              {}
            } else {
              stryCov_9fa48("885");
              try {
                if (stryMutAct_9fa48("886")) {
                  {}
                } else {
                  stryCov_9fa48("886");
                  console.log(stryMutAct_9fa48("887") ? "" : (stryCov_9fa48("887"), '🔍 DEBUG: Using Puppeteer for JavaScript execution:'), url);
                  return await this.puppeteerClient.getDom(url, options);
                }
              } catch (error) {
                if (stryMutAct_9fa48("888")) {
                  {}
                } else {
                  stryCov_9fa48("888");
                  console.warn(stryMutAct_9fa48("889") ? "" : (stryCov_9fa48("889"), '❌ DEBUG: Puppeteer failed, falling back to JSDOM:'), error);
                  return await this.httpClient.getDom(url);
                }
              }
            }
          } else {
            if (stryMutAct_9fa48("890")) {
              {}
            } else {
              stryCov_9fa48("890");
              console.log(stryMutAct_9fa48("891") ? "" : (stryCov_9fa48("891"), '🔍 DEBUG: Using JSDOM (faster, no JavaScript execution):'), url);
              return await this.httpClient.getDom(url);
            }
          }
        }
      } catch (error) {
        if (stryMutAct_9fa48("892")) {
          {}
        } else {
          stryCov_9fa48("892");
          throw ErrorFactory.createScrapingError(stryMutAct_9fa48("893") ? `` : (stryCov_9fa48("893"), `Failed to get DOM for ${url}: ${error}`), ErrorCodes.NETWORK_ERROR, stryMutAct_9fa48("894") ? false : (stryCov_9fa48("894"), true), stryMutAct_9fa48("895") ? {} : (stryCov_9fa48("895"), {
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
    if (stryMutAct_9fa48("896")) {
      {}
    } else {
      stryCov_9fa48("896");
      try {
        if (stryMutAct_9fa48("897")) {
          {}
        } else {
          stryCov_9fa48("897");
          if (stryMutAct_9fa48("899") ? false : stryMutAct_9fa48("898") ? true : (stryCov_9fa48("898", "899"), this.puppeteerClient)) {
            if (stryMutAct_9fa48("900")) {
              {}
            } else {
              stryCov_9fa48("900");
              await this.puppeteerClient.close();
            }
          }
        }
      } catch (error) {
        if (stryMutAct_9fa48("901")) {
          {}
        } else {
          stryCov_9fa48("901");
          console.warn(stryMutAct_9fa48("902") ? "" : (stryCov_9fa48("902"), 'Failed to cleanup Puppeteer client:'), error);
        }
      }
    }
  }

  /**
   * Get HTTP client instance
   */
  getHttpClient(): HttpClient {
    if (stryMutAct_9fa48("903")) {
      {}
    } else {
      stryCov_9fa48("903");
      return this.httpClient;
    }
  }

  /**
   * Get base URL
   */
  getBaseUrl(): string {
    if (stryMutAct_9fa48("904")) {
      {}
    } else {
      stryCov_9fa48("904");
      return this.baseUrl;
    }
  }
}