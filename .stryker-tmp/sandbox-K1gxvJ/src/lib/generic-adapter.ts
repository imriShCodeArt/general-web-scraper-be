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
import { BaseAdapter } from './base-adapter';
import { RecipeConfig, RawProduct, RawVariation, ValidationError } from '../types';
import { ValidationErrorImpl } from './error-handler';
import { JSDOM } from 'jsdom';
export class GenericAdapter extends BaseAdapter {
  private archiveCategory?: string;
  constructor(config: RecipeConfig, baseUrl: string) {
    if (stryMutAct_9fa48("373")) {
      {}
    } else {
      stryCov_9fa48("373");
      super(config, baseUrl);
    }
  }

  /**
   * Discover product URLs using the recipe configuration
   */
  async *discoverProducts(): AsyncIterable<string> {
    if (stryMutAct_9fa48("374")) {
      {}
    } else {
      stryCov_9fa48("374");
      const {
        productLinks,
        pagination
      } = this.config.selectors;
      if (stryMutAct_9fa48("377") ? false : stryMutAct_9fa48("376") ? true : stryMutAct_9fa48("375") ? productLinks : (stryCov_9fa48("375", "376", "377"), !productLinks)) {
        if (stryMutAct_9fa48("378")) {
          {}
        } else {
          stryCov_9fa48("378");
          throw new Error(stryMutAct_9fa48("379") ? "" : (stryCov_9fa48("379"), 'Product links selector not configured in recipe'));
        }
      }
      let currentUrl = this.baseUrl;
      let pageCount = 0;
      const maxPages = stryMutAct_9fa48("382") ? pagination?.maxPages && 100 : stryMutAct_9fa48("381") ? false : stryMutAct_9fa48("380") ? true : (stryCov_9fa48("380", "381", "382"), (stryMutAct_9fa48("383") ? pagination.maxPages : (stryCov_9fa48("383"), pagination?.maxPages)) || 100);
      while (stryMutAct_9fa48("385") ? currentUrl || pageCount < maxPages : stryMutAct_9fa48("384") ? false : (stryCov_9fa48("384", "385"), currentUrl && (stryMutAct_9fa48("388") ? pageCount >= maxPages : stryMutAct_9fa48("387") ? pageCount <= maxPages : stryMutAct_9fa48("386") ? true : (stryCov_9fa48("386", "387", "388"), pageCount < maxPages)))) {
        if (stryMutAct_9fa48("389")) {
          {}
        } else {
          stryCov_9fa48("389");
          try {
            if (stryMutAct_9fa48("390")) {
              {}
            } else {
              stryCov_9fa48("390");
              const dom = await this.getDom(currentUrl);

              // Capture archive/category title from H1 on listing page
              const h1 = dom.window.document.querySelector(stryMutAct_9fa48("391") ? "" : (stryCov_9fa48("391"), 'h1'));
              const archiveTitle = stryMutAct_9fa48("394") ? h1.textContent?.trim() : stryMutAct_9fa48("393") ? h1?.textContent.trim() : stryMutAct_9fa48("392") ? h1?.textContent : (stryCov_9fa48("392", "393", "394"), h1?.textContent?.trim());
              if (stryMutAct_9fa48("397") ? archiveTitle || archiveTitle.length > 0 : stryMutAct_9fa48("396") ? false : stryMutAct_9fa48("395") ? true : (stryCov_9fa48("395", "396", "397"), archiveTitle && (stryMutAct_9fa48("400") ? archiveTitle.length <= 0 : stryMutAct_9fa48("399") ? archiveTitle.length >= 0 : stryMutAct_9fa48("398") ? true : (stryCov_9fa48("398", "399", "400"), archiveTitle.length > 0)))) {
                if (stryMutAct_9fa48("401")) {
                  {}
                } else {
                  stryCov_9fa48("401");
                  this.archiveCategory = archiveTitle;
                }
              }

              // Extract product URLs from current page
              const productUrls = this.extractProductUrlsWithSelector(dom, productLinks);
              for (const url of productUrls) {
                if (stryMutAct_9fa48("402")) {
                  {}
                } else {
                  stryCov_9fa48("402");
                  yield url;
                }
              }

              // Follow pagination if configured
              if (stryMutAct_9fa48("405") ? pagination.nextPage : stryMutAct_9fa48("404") ? false : stryMutAct_9fa48("403") ? true : (stryCov_9fa48("403", "404", "405"), pagination?.nextPage)) {
                if (stryMutAct_9fa48("406")) {
                  {}
                } else {
                  stryCov_9fa48("406");
                  const doc = dom.window.document;

                  // Support multiple potential selectors for "next" including <link rel="next">
                  const selectorCandidates: string[] = stryMutAct_9fa48("407") ? [] : (stryCov_9fa48("407"), [pagination.nextPage, stryMutAct_9fa48("408") ? "" : (stryCov_9fa48("408"), 'a[rel=\'next\']'), stryMutAct_9fa48("409") ? "" : (stryCov_9fa48("409"), 'link[rel=\'next\']'), stryMutAct_9fa48("410") ? "" : (stryCov_9fa48("410"), '.pagination__next'), stryMutAct_9fa48("411") ? "" : (stryCov_9fa48("411"), '.pagination .next a'), stryMutAct_9fa48("412") ? "" : (stryCov_9fa48("412"), '.pagination__item--next a'), stryMutAct_9fa48("413") ? "" : (stryCov_9fa48("413"), 'a[aria-label=\'Next\']'), stryMutAct_9fa48("414") ? "" : (stryCov_9fa48("414"), 'a[aria-label=\'Weiter\']')]);
                  let nextPageHref: string | null = null;
                  for (const sel of selectorCandidates) {
                    if (stryMutAct_9fa48("415")) {
                      {}
                    } else {
                      stryCov_9fa48("415");
                      const el = doc.querySelector(sel);
                      if (stryMutAct_9fa48("417") ? false : stryMutAct_9fa48("416") ? true : (stryCov_9fa48("416", "417"), el)) {
                        if (stryMutAct_9fa48("418")) {
                          {}
                        } else {
                          stryCov_9fa48("418");
                          // If it's a <link> tag in <head>
                          if (stryMutAct_9fa48("421") ? el.tagName || el.tagName.toLowerCase() === 'link' : stryMutAct_9fa48("420") ? false : stryMutAct_9fa48("419") ? true : (stryCov_9fa48("419", "420", "421"), el.tagName && (stryMutAct_9fa48("423") ? el.tagName.toLowerCase() !== 'link' : stryMutAct_9fa48("422") ? true : (stryCov_9fa48("422", "423"), (stryMutAct_9fa48("424") ? el.tagName.toUpperCase() : (stryCov_9fa48("424"), el.tagName.toLowerCase())) === (stryMutAct_9fa48("425") ? "" : (stryCov_9fa48("425"), 'link')))))) {
                            if (stryMutAct_9fa48("426")) {
                              {}
                            } else {
                              stryCov_9fa48("426");
                              nextPageHref = el.getAttribute(stryMutAct_9fa48("427") ? "" : (stryCov_9fa48("427"), 'href'));
                            }
                          } else {
                            if (stryMutAct_9fa48("428")) {
                              {}
                            } else {
                              stryCov_9fa48("428");
                              nextPageHref = el.getAttribute(stryMutAct_9fa48("429") ? "" : (stryCov_9fa48("429"), 'href'));
                            }
                          }
                          if (stryMutAct_9fa48("431") ? false : stryMutAct_9fa48("430") ? true : (stryCov_9fa48("430", "431"), nextPageHref)) break;
                        }
                      }
                    }
                  }
                  if (stryMutAct_9fa48("433") ? false : stryMutAct_9fa48("432") ? true : (stryCov_9fa48("432", "433"), nextPageHref)) {
                    if (stryMutAct_9fa48("434")) {
                      {}
                    } else {
                      stryCov_9fa48("434");
                      currentUrl = this.resolveUrl(nextPageHref);
                      stryMutAct_9fa48("435") ? pageCount-- : (stryCov_9fa48("435"), pageCount++);
                    }
                  } else {
                    if (stryMutAct_9fa48("436")) {
                      {}
                    } else {
                      stryCov_9fa48("436");
                      break;
                    }
                  }
                }
              } else {
                if (stryMutAct_9fa48("437")) {
                  {}
                } else {
                  stryCov_9fa48("437");
                  break;
                }
              }
            }
          } catch (error) {
            if (stryMutAct_9fa48("438")) {
              {}
            } else {
              stryCov_9fa48("438");
              console.error(stryMutAct_9fa48("439") ? `` : (stryCov_9fa48("439"), `Failed to process page ${currentUrl}:`), error);
              break;
            }
          }
        }
      }
    }
  }

  /**
   * Extract product data using the recipe configuration
   */
  async extractProduct(url: string): Promise<RawProduct> {
    if (stryMutAct_9fa48("440")) {
      {}
    } else {
      stryCov_9fa48("440");
      // Get waitForSelectors from behavior if configured
      const waitForSelectors = stryMutAct_9fa48("441") ? this.config.behavior.waitForSelectors : (stryCov_9fa48("441"), this.config.behavior?.waitForSelectors);
      const fastMode = stryMutAct_9fa48("444") ? this.config.behavior?.fastMode && false : stryMutAct_9fa48("443") ? false : stryMutAct_9fa48("442") ? true : (stryCov_9fa48("442", "443", "444"), (stryMutAct_9fa48("445") ? this.config.behavior.fastMode : (stryCov_9fa48("445"), this.config.behavior?.fastMode)) || (stryMutAct_9fa48("446") ? true : (stryCov_9fa48("446"), false)));
      const dom = await this.getDom(url, waitForSelectors ? stryMutAct_9fa48("447") ? {} : (stryCov_9fa48("447"), {
        waitForSelectors
      }) : {});
      const {
        selectors,
        transforms,
        fallbacks
      } = this.config;

      // Extract core product data with fast mode optimizations
      const product: RawProduct = stryMutAct_9fa48("448") ? {} : (stryCov_9fa48("448"), {
        id: stryMutAct_9fa48("451") ? this.extractWithFallbacks(dom, selectors.sku, fallbacks?.sku) && this.generateIdFromUrl(url) : stryMutAct_9fa48("450") ? false : stryMutAct_9fa48("449") ? true : (stryCov_9fa48("449", "450", "451"), this.extractWithFallbacks(dom, selectors.sku, stryMutAct_9fa48("452") ? fallbacks.sku : (stryCov_9fa48("452"), fallbacks?.sku)) || this.generateIdFromUrl(url)),
        title: this.extractWithFallbacks(dom, selectors.title, stryMutAct_9fa48("453") ? fallbacks.title : (stryCov_9fa48("453"), fallbacks?.title)),
        slug: stryMutAct_9fa48("456") ? this.extractWithFallbacks(dom, selectors.title, fallbacks?.title)?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') && 'product' : stryMutAct_9fa48("455") ? false : stryMutAct_9fa48("454") ? true : (stryCov_9fa48("454", "455", "456"), (stryMutAct_9fa48("458") ? this.extractWithFallbacks(dom, selectors.title, fallbacks?.title).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : stryMutAct_9fa48("457") ? this.extractWithFallbacks(dom, selectors.title, fallbacks?.title)?.toUpperCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : (stryCov_9fa48("457", "458"), this.extractWithFallbacks(dom, selectors.title, stryMutAct_9fa48("459") ? fallbacks.title : (stryCov_9fa48("459"), fallbacks?.title))?.toLowerCase().replace(stryMutAct_9fa48("461") ? /\S+/g : stryMutAct_9fa48("460") ? /\s/g : (stryCov_9fa48("460", "461"), /\s+/g), stryMutAct_9fa48("462") ? "" : (stryCov_9fa48("462"), '-')).replace(stryMutAct_9fa48("463") ? /[a-z0-9-]/g : (stryCov_9fa48("463"), /[^a-z0-9-]/g), stryMutAct_9fa48("464") ? "Stryker was here!" : (stryCov_9fa48("464"), '')))) || (stryMutAct_9fa48("465") ? "" : (stryCov_9fa48("465"), 'product'))),
        description: fastMode ? stryMutAct_9fa48("467") ? this.extractWithFallbacks(dom, selectors.description, selectors.descriptionFallbacks).substring(0, 500) : stryMutAct_9fa48("466") ? this.extractWithFallbacks(dom, selectors.description, selectors.descriptionFallbacks) : (stryCov_9fa48("466", "467"), this.extractWithFallbacks(dom, selectors.description, selectors.descriptionFallbacks)?.substring(0, 500)) : this.extractWithFallbacks(dom, selectors.description, selectors.descriptionFallbacks),
        shortDescription: selectors.shortDescription ? this.extractWithFallbacks(dom, selectors.shortDescription) : undefined,
        sku: this.extractWithFallbacks(dom, selectors.sku, stryMutAct_9fa48("468") ? fallbacks.sku : (stryCov_9fa48("468"), fallbacks?.sku)),
        stockStatus: this.extractStockStatusFromSelector(dom, selectors.stock),
        images: fastMode ? stryMutAct_9fa48("469") ? this.extractImagesFromSelector(dom, selectors.images) : (stryCov_9fa48("469"), this.extractImagesFromSelector(dom, selectors.images).slice(0, 3)) : this.extractImagesFromSelector(dom, selectors.images),
        // Limit images in fast mode
        category: selectors.category ? this.extractWithFallbacks(dom, selectors.category) : undefined,
        productType: stryMutAct_9fa48("470") ? "" : (stryCov_9fa48("470"), 'simple'),
        // Default to simple, could be enhanced to detect variable products
        attributes: fastMode ? {} : this.extractAttributesFromSelector(dom, selectors.attributes),
        // Skip attributes in fast mode
        variations: fastMode ? stryMutAct_9fa48("471") ? ["Stryker was here"] : (stryCov_9fa48("471"), []) : this.extractVariationsFromSelector(dom, stryMutAct_9fa48("474") ? selectors.variations && [] : stryMutAct_9fa48("473") ? false : stryMutAct_9fa48("472") ? true : (stryCov_9fa48("472", "473", "474"), selectors.variations || (stryMutAct_9fa48("475") ? ["Stryker was here"] : (stryCov_9fa48("475"), [])))),
        // Skip variations in fast mode
        price: this.extractPriceFromSelector(dom, selectors.price),
        salePrice: this.extractSalePrice(dom, selectors.price)
      });

      // Prefer archive H1 as category if configured/available
      if (stryMutAct_9fa48("478") ? !product.category || this.archiveCategory : stryMutAct_9fa48("477") ? false : stryMutAct_9fa48("476") ? true : (stryCov_9fa48("476", "477", "478"), (stryMutAct_9fa48("479") ? product.category : (stryCov_9fa48("479"), !product.category)) && this.archiveCategory)) {
        if (stryMutAct_9fa48("480")) {
          {}
        } else {
          stryCov_9fa48("480");
          product.category = this.archiveCategory;
        }
      }

      // Apply transformations (simplified in fast mode)
      if (stryMutAct_9fa48("483") ? transforms || !fastMode : stryMutAct_9fa48("482") ? false : stryMutAct_9fa48("481") ? true : (stryCov_9fa48("481", "482", "483"), transforms && (stryMutAct_9fa48("484") ? fastMode : (stryCov_9fa48("484"), !fastMode)))) {
        if (stryMutAct_9fa48("485")) {
          {}
        } else {
          stryCov_9fa48("485");
          if (stryMutAct_9fa48("488") ? transforms.title || product.title : stryMutAct_9fa48("487") ? false : stryMutAct_9fa48("486") ? true : (stryCov_9fa48("486", "487", "488"), transforms.title && product.title)) {
            if (stryMutAct_9fa48("489")) {
              {}
            } else {
              stryCov_9fa48("489");
              product.title = this.applyTransformations(product.title, transforms.title);
            }
          }
          if (stryMutAct_9fa48("492") ? transforms.price || product.variations : stryMutAct_9fa48("491") ? false : stryMutAct_9fa48("490") ? true : (stryCov_9fa48("490", "491", "492"), transforms.price && product.variations)) {
            if (stryMutAct_9fa48("493")) {
              {}
            } else {
              stryCov_9fa48("493");
              product.variations = product.variations.map(stryMutAct_9fa48("494") ? () => undefined : (stryCov_9fa48("494"), variation => stryMutAct_9fa48("495") ? {} : (stryCov_9fa48("495"), {
                ...variation,
                regularPrice: this.applyTransformations(stryMutAct_9fa48("498") ? variation.regularPrice && '' : stryMutAct_9fa48("497") ? false : stryMutAct_9fa48("496") ? true : (stryCov_9fa48("496", "497", "498"), variation.regularPrice || (stryMutAct_9fa48("499") ? "Stryker was here!" : (stryCov_9fa48("499"), ''))), transforms.price!)
              })));
            }
          }
          if (stryMutAct_9fa48("502") ? transforms.description || product.description : stryMutAct_9fa48("501") ? false : stryMutAct_9fa48("500") ? true : (stryCov_9fa48("500", "501", "502"), transforms.description && product.description)) {
            if (stryMutAct_9fa48("503")) {
              {}
            } else {
              stryCov_9fa48("503");
              product.description = this.applyTransformations(product.description, transforms.description);
            }
          }
          if (stryMutAct_9fa48("506") ? transforms.attributes || product.attributes : stryMutAct_9fa48("505") ? false : stryMutAct_9fa48("504") ? true : (stryCov_9fa48("504", "505", "506"), transforms.attributes && product.attributes)) {
            if (stryMutAct_9fa48("507")) {
              {}
            } else {
              stryCov_9fa48("507");
              // Convert the attributes to the expected type for transformations
              const stringAttributes: Record<string, string[]> = {};
              for (const [key, values] of Object.entries(product.attributes)) {
                if (stryMutAct_9fa48("508")) {
                  {}
                } else {
                  stryCov_9fa48("508");
                  stringAttributes[key] = stryMutAct_9fa48("509") ? values : (stryCov_9fa48("509"), values.filter(stryMutAct_9fa48("510") ? () => undefined : (stryCov_9fa48("510"), (v): v is string => stryMutAct_9fa48("513") ? v === undefined : stryMutAct_9fa48("512") ? false : stryMutAct_9fa48("511") ? true : (stryCov_9fa48("511", "512", "513"), v !== undefined))));
                }
              }
              product.attributes = this.applyAttributeTransformations(stringAttributes, transforms.attributes);
            }
          }
        }
      }

      // Extract embedded JSON data if configured
      if (stryMutAct_9fa48("516") ? selectors.embeddedJson || selectors.embeddedJson.length > 0 : stryMutAct_9fa48("515") ? false : stryMutAct_9fa48("514") ? true : (stryCov_9fa48("514", "515", "516"), selectors.embeddedJson && (stryMutAct_9fa48("519") ? selectors.embeddedJson.length <= 0 : stryMutAct_9fa48("518") ? selectors.embeddedJson.length >= 0 : stryMutAct_9fa48("517") ? true : (stryCov_9fa48("517", "518", "519"), selectors.embeddedJson.length > 0)))) {
        if (stryMutAct_9fa48("520")) {
          {}
        } else {
          stryCov_9fa48("520");
          const embeddedData = await this.extractEmbeddedJson(url, selectors.embeddedJson);
          if (stryMutAct_9fa48("524") ? embeddedData.length <= 0 : stryMutAct_9fa48("523") ? embeddedData.length >= 0 : stryMutAct_9fa48("522") ? false : stryMutAct_9fa48("521") ? true : (stryCov_9fa48("521", "522", "523", "524"), embeddedData.length > 0)) {
            if (stryMutAct_9fa48("525")) {
              {}
            } else {
              stryCov_9fa48("525");
              // Merge embedded data with extracted data
              this.mergeEmbeddedData(product, embeddedData);
            }
          }
        }
      }
      return product;
    }
  }

  /**
   * Extract data with fallback selectors
   */
  protected extractWithFallbacks(dom: JSDOM, selectors: string | string[], fallbacks?: string[]): string {
    if (stryMutAct_9fa48("526")) {
      {}
    } else {
      stryCov_9fa48("526");
      const selectorArray = Array.isArray(selectors) ? selectors : stryMutAct_9fa48("527") ? [] : (stryCov_9fa48("527"), [selectors]);

      // Try primary selectors first
      for (const selector of selectorArray) {
        if (stryMutAct_9fa48("528")) {
          {}
        } else {
          stryCov_9fa48("528");
          const result = this.extractText(dom, selector);
          if (stryMutAct_9fa48("530") ? false : stryMutAct_9fa48("529") ? true : (stryCov_9fa48("529", "530"), result)) {
            if (stryMutAct_9fa48("531")) {
              {}
            } else {
              stryCov_9fa48("531");
              // Filter out price-like content for description fields
              if (stryMutAct_9fa48("533") ? false : stryMutAct_9fa48("532") ? true : (stryCov_9fa48("532", "533"), this.isPriceLike(result))) {
                if (stryMutAct_9fa48("534")) {
                  {}
                } else {
                  stryCov_9fa48("534");
                  if (stryMutAct_9fa48("537") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("536") ? false : stryMutAct_9fa48("535") ? true : (stryCov_9fa48("535", "536", "537"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("538") ? "" : (stryCov_9fa48("538"), '1')))) console.log(stryMutAct_9fa48("539") ? `` : (stryCov_9fa48("539"), `Skipping price-like content for selector: ${selector} ->`), stryMutAct_9fa48("540") ? result : (stryCov_9fa48("540"), result.substring(0, 50)));
                  continue;
                }
              }
              if (stryMutAct_9fa48("543") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("542") ? false : stryMutAct_9fa48("541") ? true : (stryCov_9fa48("541", "542", "543"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("544") ? "" : (stryCov_9fa48("544"), '1')))) console.log(stryMutAct_9fa48("545") ? `` : (stryCov_9fa48("545"), `Found content with selector: ${selector}`), stryMutAct_9fa48("546") ? result : (stryCov_9fa48("546"), result.substring(0, 100)));
              return result;
            }
          } else {
            if (stryMutAct_9fa48("547")) {
              {}
            } else {
              stryCov_9fa48("547");
              if (stryMutAct_9fa48("550") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("549") ? false : stryMutAct_9fa48("548") ? true : (stryCov_9fa48("548", "549", "550"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("551") ? "" : (stryCov_9fa48("551"), '1')))) console.log(stryMutAct_9fa48("552") ? `` : (stryCov_9fa48("552"), `No content found with selector: ${selector}`));
            }
          }
        }
      }

      // Try fallback selectors if available
      if (stryMutAct_9fa48("554") ? false : stryMutAct_9fa48("553") ? true : (stryCov_9fa48("553", "554"), fallbacks)) {
        if (stryMutAct_9fa48("555")) {
          {}
        } else {
          stryCov_9fa48("555");
          if (stryMutAct_9fa48("558") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("557") ? false : stryMutAct_9fa48("556") ? true : (stryCov_9fa48("556", "557", "558"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("559") ? "" : (stryCov_9fa48("559"), '1')))) console.log(stryMutAct_9fa48("560") ? "" : (stryCov_9fa48("560"), 'Trying fallback selectors:'), fallbacks);
          for (const fallback of fallbacks) {
            if (stryMutAct_9fa48("561")) {
              {}
            } else {
              stryCov_9fa48("561");
              const result = this.extractText(dom, fallback);
              if (stryMutAct_9fa48("563") ? false : stryMutAct_9fa48("562") ? true : (stryCov_9fa48("562", "563"), result)) {
                if (stryMutAct_9fa48("564")) {
                  {}
                } else {
                  stryCov_9fa48("564");
                  // Filter out price-like content for fallback selectors too
                  if (stryMutAct_9fa48("566") ? false : stryMutAct_9fa48("565") ? true : (stryCov_9fa48("565", "566"), this.isPriceLike(result))) {
                    if (stryMutAct_9fa48("567")) {
                      {}
                    } else {
                      stryCov_9fa48("567");
                      if (stryMutAct_9fa48("570") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("569") ? false : stryMutAct_9fa48("568") ? true : (stryCov_9fa48("568", "569", "570"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("571") ? "" : (stryCov_9fa48("571"), '1')))) console.log(stryMutAct_9fa48("572") ? `` : (stryCov_9fa48("572"), `Skipping price-like content for fallback selector: ${fallback} ->`), stryMutAct_9fa48("573") ? result : (stryCov_9fa48("573"), result.substring(0, 50)));
                      continue;
                    }
                  }
                  if (stryMutAct_9fa48("576") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("575") ? false : stryMutAct_9fa48("574") ? true : (stryCov_9fa48("574", "575", "576"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("577") ? "" : (stryCov_9fa48("577"), '1')))) console.log(stryMutAct_9fa48("578") ? `` : (stryCov_9fa48("578"), `Found content with fallback selector: ${fallback}`), stryMutAct_9fa48("579") ? result : (stryCov_9fa48("579"), result.substring(0, 100)));
                  return result;
                }
              } else {
                if (stryMutAct_9fa48("580")) {
                  {}
                } else {
                  stryCov_9fa48("580");
                  if (stryMutAct_9fa48("583") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("582") ? false : stryMutAct_9fa48("581") ? true : (stryCov_9fa48("581", "582", "583"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("584") ? "" : (stryCov_9fa48("584"), '1')))) console.log(stryMutAct_9fa48("585") ? `` : (stryCov_9fa48("585"), `No content found with fallback selector: ${fallback}`));
                }
              }
            }
          }
        }
      }
      if (stryMutAct_9fa48("588") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("587") ? false : stryMutAct_9fa48("586") ? true : (stryCov_9fa48("586", "587", "588"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("589") ? "" : (stryCov_9fa48("589"), '1')))) console.log(stryMutAct_9fa48("590") ? "" : (stryCov_9fa48("590"), 'No content found with any selector or fallback'));
      return stryMutAct_9fa48("591") ? "Stryker was here!" : (stryCov_9fa48("591"), '');
    }
  }

  /**
   * Check if text looks like a price (should not be used for descriptions)
   */
  private isPriceLike(text: string): boolean {
    if (stryMutAct_9fa48("592")) {
      {}
    } else {
      stryCov_9fa48("592");
      if (stryMutAct_9fa48("595") ? false : stryMutAct_9fa48("594") ? true : stryMutAct_9fa48("593") ? text : (stryCov_9fa48("593", "594", "595"), !text)) return stryMutAct_9fa48("596") ? true : (stryCov_9fa48("596"), false);
      const t = stryMutAct_9fa48("597") ? text : (stryCov_9fa48("597"), text.trim());

      // Common currency tokens and numeric patterns
      const currencyPattern = /(₪|\$|€|£)/;
      const numberPattern = stryMutAct_9fa48("614") ? /^\s*(₪|\$|€|£)?\s*\d+[\d,.]*\s*(₪|\$|€|£)?\S*$/ : stryMutAct_9fa48("613") ? /^\s*(₪|\$|€|£)?\s*\d+[\d,.]*\s*(₪|\$|€|£)?\s$/ : stryMutAct_9fa48("612") ? /^\s*(₪|\$|€|£)?\s*\d+[\d,.]*\s*(₪|\$|€|£)\s*$/ : stryMutAct_9fa48("611") ? /^\s*(₪|\$|€|£)?\s*\d+[\d,.]*\S*(₪|\$|€|£)?\s*$/ : stryMutAct_9fa48("610") ? /^\s*(₪|\$|€|£)?\s*\d+[\d,.]*\s(₪|\$|€|£)?\s*$/ : stryMutAct_9fa48("609") ? /^\s*(₪|\$|€|£)?\s*\d+[\D,.]*\s*(₪|\$|€|£)?\s*$/ : stryMutAct_9fa48("608") ? /^\s*(₪|\$|€|£)?\s*\d+[^\d,.]*\s*(₪|\$|€|£)?\s*$/ : stryMutAct_9fa48("607") ? /^\s*(₪|\$|€|£)?\s*\d+[\d,.]\s*(₪|\$|€|£)?\s*$/ : stryMutAct_9fa48("606") ? /^\s*(₪|\$|€|£)?\s*\D+[\d,.]*\s*(₪|\$|€|£)?\s*$/ : stryMutAct_9fa48("605") ? /^\s*(₪|\$|€|£)?\s*\d[\d,.]*\s*(₪|\$|€|£)?\s*$/ : stryMutAct_9fa48("604") ? /^\s*(₪|\$|€|£)?\S*\d+[\d,.]*\s*(₪|\$|€|£)?\s*$/ : stryMutAct_9fa48("603") ? /^\s*(₪|\$|€|£)?\s\d+[\d,.]*\s*(₪|\$|€|£)?\s*$/ : stryMutAct_9fa48("602") ? /^\s*(₪|\$|€|£)\s*\d+[\d,.]*\s*(₪|\$|€|£)?\s*$/ : stryMutAct_9fa48("601") ? /^\S*(₪|\$|€|£)?\s*\d+[\d,.]*\s*(₪|\$|€|£)?\s*$/ : stryMutAct_9fa48("600") ? /^\s(₪|\$|€|£)?\s*\d+[\d,.]*\s*(₪|\$|€|£)?\s*$/ : stryMutAct_9fa48("599") ? /^\s*(₪|\$|€|£)?\s*\d+[\d,.]*\s*(₪|\$|€|£)?\s*/ : stryMutAct_9fa48("598") ? /\s*(₪|\$|€|£)?\s*\d+[\d,.]*\s*(₪|\$|€|£)?\s*$/ : (stryCov_9fa48("598", "599", "600", "601", "602", "603", "604", "605", "606", "607", "608", "609", "610", "611", "612", "613", "614"), /^\s*(₪|\$|€|£)?\s*\d+[\d,.]*\s*(₪|\$|€|£)?\s*$/);
      const containsOnlyPrice = numberPattern.test(t);
      const containsCurrencyAndNumber = stryMutAct_9fa48("617") ? currencyPattern.test(t) && /\d/.test(t) || t.length <= 20 : stryMutAct_9fa48("616") ? false : stryMutAct_9fa48("615") ? true : (stryCov_9fa48("615", "616", "617"), (stryMutAct_9fa48("619") ? currencyPattern.test(t) || /\d/.test(t) : stryMutAct_9fa48("618") ? true : (stryCov_9fa48("618", "619"), currencyPattern.test(t) && (stryMutAct_9fa48("620") ? /\D/ : (stryCov_9fa48("620"), /\d/)).test(t))) && (stryMutAct_9fa48("623") ? t.length > 20 : stryMutAct_9fa48("622") ? t.length < 20 : stryMutAct_9fa48("621") ? true : (stryCov_9fa48("621", "622", "623"), t.length <= 20)));

      // Hebrew "אין מוצרים בסל" or other cart snippets aren't product descriptions either
      const cartSnippet = /אין מוצרים בסל/;

      // Check for common price-related text patterns
      const pricePatterns = stryMutAct_9fa48("624") ? [] : (stryCov_9fa48("624"), [stryMutAct_9fa48("638") ? /^\s*\d+[\d,.]*\s*₪?\S*$/ : stryMutAct_9fa48("637") ? /^\s*\d+[\d,.]*\s*₪?\s$/ : stryMutAct_9fa48("636") ? /^\s*\d+[\d,.]*\s*₪\s*$/ : stryMutAct_9fa48("635") ? /^\s*\d+[\d,.]*\S*₪?\s*$/ : stryMutAct_9fa48("634") ? /^\s*\d+[\d,.]*\s₪?\s*$/ : stryMutAct_9fa48("633") ? /^\s*\d+[\D,.]*\s*₪?\s*$/ : stryMutAct_9fa48("632") ? /^\s*\d+[^\d,.]*\s*₪?\s*$/ : stryMutAct_9fa48("631") ? /^\s*\d+[\d,.]\s*₪?\s*$/ : stryMutAct_9fa48("630") ? /^\s*\D+[\d,.]*\s*₪?\s*$/ : stryMutAct_9fa48("629") ? /^\s*\d[\d,.]*\s*₪?\s*$/ : stryMutAct_9fa48("628") ? /^\S*\d+[\d,.]*\s*₪?\s*$/ : stryMutAct_9fa48("627") ? /^\s\d+[\d,.]*\s*₪?\s*$/ : stryMutAct_9fa48("626") ? /^\s*\d+[\d,.]*\s*₪?\s*/ : stryMutAct_9fa48("625") ? /\s*\d+[\d,.]*\s*₪?\s*$/ : (stryCov_9fa48("625", "626", "627", "628", "629", "630", "631", "632", "633", "634", "635", "636", "637", "638"), /^\s*\d+[\d,.]*\s*₪?\s*$/), stryMutAct_9fa48("651") ? /^\s*₪\s*\d+[\d,.]*\S*$/ : stryMutAct_9fa48("650") ? /^\s*₪\s*\d+[\d,.]*\s$/ : stryMutAct_9fa48("649") ? /^\s*₪\s*\d+[\D,.]*\s*$/ : stryMutAct_9fa48("648") ? /^\s*₪\s*\d+[^\d,.]*\s*$/ : stryMutAct_9fa48("647") ? /^\s*₪\s*\d+[\d,.]\s*$/ : stryMutAct_9fa48("646") ? /^\s*₪\s*\D+[\d,.]*\s*$/ : stryMutAct_9fa48("645") ? /^\s*₪\s*\d[\d,.]*\s*$/ : stryMutAct_9fa48("644") ? /^\s*₪\S*\d+[\d,.]*\s*$/ : stryMutAct_9fa48("643") ? /^\s*₪\s\d+[\d,.]*\s*$/ : stryMutAct_9fa48("642") ? /^\S*₪\s*\d+[\d,.]*\s*$/ : stryMutAct_9fa48("641") ? /^\s₪\s*\d+[\d,.]*\s*$/ : stryMutAct_9fa48("640") ? /^\s*₪\s*\d+[\d,.]*\s*/ : stryMutAct_9fa48("639") ? /\s*₪\s*\d+[\d,.]*\s*$/ : (stryCov_9fa48("639", "640", "641", "642", "643", "644", "645", "646", "647", "648", "649", "650", "651"), /^\s*₪\s*\d+[\d,.]*\s*$/), stryMutAct_9fa48("664") ? /^\s*\d+[\d,.]*\s*שח\S*$/ : stryMutAct_9fa48("663") ? /^\s*\d+[\d,.]*\s*שח\s$/ : stryMutAct_9fa48("662") ? /^\s*\d+[\d,.]*\S*שח\s*$/ : stryMutAct_9fa48("661") ? /^\s*\d+[\d,.]*\sשח\s*$/ : stryMutAct_9fa48("660") ? /^\s*\d+[\D,.]*\s*שח\s*$/ : stryMutAct_9fa48("659") ? /^\s*\d+[^\d,.]*\s*שח\s*$/ : stryMutAct_9fa48("658") ? /^\s*\d+[\d,.]\s*שח\s*$/ : stryMutAct_9fa48("657") ? /^\s*\D+[\d,.]*\s*שח\s*$/ : stryMutAct_9fa48("656") ? /^\s*\d[\d,.]*\s*שח\s*$/ : stryMutAct_9fa48("655") ? /^\S*\d+[\d,.]*\s*שח\s*$/ : stryMutAct_9fa48("654") ? /^\s\d+[\d,.]*\s*שח\s*$/ : stryMutAct_9fa48("653") ? /^\s*\d+[\d,.]*\s*שח\s*/ : stryMutAct_9fa48("652") ? /\s*\d+[\d,.]*\s*שח\s*$/ : (stryCov_9fa48("652", "653", "654", "655", "656", "657", "658", "659", "660", "661", "662", "663", "664"), /^\s*\d+[\d,.]*\s*שח\s*$/), stryMutAct_9fa48("677") ? /^\s*שח\s*\d+[\d,.]*\S*$/ : stryMutAct_9fa48("676") ? /^\s*שח\s*\d+[\d,.]*\s$/ : stryMutAct_9fa48("675") ? /^\s*שח\s*\d+[\D,.]*\s*$/ : stryMutAct_9fa48("674") ? /^\s*שח\s*\d+[^\d,.]*\s*$/ : stryMutAct_9fa48("673") ? /^\s*שח\s*\d+[\d,.]\s*$/ : stryMutAct_9fa48("672") ? /^\s*שח\s*\D+[\d,.]*\s*$/ : stryMutAct_9fa48("671") ? /^\s*שח\s*\d[\d,.]*\s*$/ : stryMutAct_9fa48("670") ? /^\s*שח\S*\d+[\d,.]*\s*$/ : stryMutAct_9fa48("669") ? /^\s*שח\s\d+[\d,.]*\s*$/ : stryMutAct_9fa48("668") ? /^\S*שח\s*\d+[\d,.]*\s*$/ : stryMutAct_9fa48("667") ? /^\sשח\s*\d+[\d,.]*\s*$/ : stryMutAct_9fa48("666") ? /^\s*שח\s*\d+[\d,.]*\s*/ : stryMutAct_9fa48("665") ? /\s*שח\s*\d+[\d,.]*\s*$/ : (stryCov_9fa48("665", "666", "667", "668", "669", "670", "671", "672", "673", "674", "675", "676", "677"), /^\s*שח\s*\d+[\d,.]*\s*$/), stryMutAct_9fa48("690") ? /^\s*\d+[\d,.]*\s*ILS\S*$/ : stryMutAct_9fa48("689") ? /^\s*\d+[\d,.]*\s*ILS\s$/ : stryMutAct_9fa48("688") ? /^\s*\d+[\d,.]*\S*ILS\s*$/ : stryMutAct_9fa48("687") ? /^\s*\d+[\d,.]*\sILS\s*$/ : stryMutAct_9fa48("686") ? /^\s*\d+[\D,.]*\s*ILS\s*$/ : stryMutAct_9fa48("685") ? /^\s*\d+[^\d,.]*\s*ILS\s*$/ : stryMutAct_9fa48("684") ? /^\s*\d+[\d,.]\s*ILS\s*$/ : stryMutAct_9fa48("683") ? /^\s*\D+[\d,.]*\s*ILS\s*$/ : stryMutAct_9fa48("682") ? /^\s*\d[\d,.]*\s*ILS\s*$/ : stryMutAct_9fa48("681") ? /^\S*\d+[\d,.]*\s*ILS\s*$/ : stryMutAct_9fa48("680") ? /^\s\d+[\d,.]*\s*ILS\s*$/ : stryMutAct_9fa48("679") ? /^\s*\d+[\d,.]*\s*ILS\s*/ : stryMutAct_9fa48("678") ? /\s*\d+[\d,.]*\s*ILS\s*$/ : (stryCov_9fa48("678", "679", "680", "681", "682", "683", "684", "685", "686", "687", "688", "689", "690"), /^\s*\d+[\d,.]*\s*ILS\s*$/), stryMutAct_9fa48("703") ? /^\s*ILS\s*\d+[\d,.]*\S*$/ : stryMutAct_9fa48("702") ? /^\s*ILS\s*\d+[\d,.]*\s$/ : stryMutAct_9fa48("701") ? /^\s*ILS\s*\d+[\D,.]*\s*$/ : stryMutAct_9fa48("700") ? /^\s*ILS\s*\d+[^\d,.]*\s*$/ : stryMutAct_9fa48("699") ? /^\s*ILS\s*\d+[\d,.]\s*$/ : stryMutAct_9fa48("698") ? /^\s*ILS\s*\D+[\d,.]*\s*$/ : stryMutAct_9fa48("697") ? /^\s*ILS\s*\d[\d,.]*\s*$/ : stryMutAct_9fa48("696") ? /^\s*ILS\S*\d+[\d,.]*\s*$/ : stryMutAct_9fa48("695") ? /^\s*ILS\s\d+[\d,.]*\s*$/ : stryMutAct_9fa48("694") ? /^\S*ILS\s*\d+[\d,.]*\s*$/ : stryMutAct_9fa48("693") ? /^\sILS\s*\d+[\d,.]*\s*$/ : stryMutAct_9fa48("692") ? /^\s*ILS\s*\d+[\d,.]*\s*/ : stryMutAct_9fa48("691") ? /\s*ILS\s*\d+[\d,.]*\s*$/ : (stryCov_9fa48("691", "692", "693", "694", "695", "696", "697", "698", "699", "700", "701", "702", "703"), /^\s*ILS\s*\d+[\d,.]*\s*$/), stryMutAct_9fa48("716") ? /^\s*\d+[\d,.]*\s*NIS\S*$/ : stryMutAct_9fa48("715") ? /^\s*\d+[\d,.]*\s*NIS\s$/ : stryMutAct_9fa48("714") ? /^\s*\d+[\d,.]*\S*NIS\s*$/ : stryMutAct_9fa48("713") ? /^\s*\d+[\d,.]*\sNIS\s*$/ : stryMutAct_9fa48("712") ? /^\s*\d+[\D,.]*\s*NIS\s*$/ : stryMutAct_9fa48("711") ? /^\s*\d+[^\d,.]*\s*NIS\s*$/ : stryMutAct_9fa48("710") ? /^\s*\d+[\d,.]\s*NIS\s*$/ : stryMutAct_9fa48("709") ? /^\s*\D+[\d,.]*\s*NIS\s*$/ : stryMutAct_9fa48("708") ? /^\s*\d[\d,.]*\s*NIS\s*$/ : stryMutAct_9fa48("707") ? /^\S*\d+[\d,.]*\s*NIS\s*$/ : stryMutAct_9fa48("706") ? /^\s\d+[\d,.]*\s*NIS\s*$/ : stryMutAct_9fa48("705") ? /^\s*\d+[\d,.]*\s*NIS\s*/ : stryMutAct_9fa48("704") ? /\s*\d+[\d,.]*\s*NIS\s*$/ : (stryCov_9fa48("704", "705", "706", "707", "708", "709", "710", "711", "712", "713", "714", "715", "716"), /^\s*\d+[\d,.]*\s*NIS\s*$/), stryMutAct_9fa48("729") ? /^\s*NIS\s*\d+[\d,.]*\S*$/ : stryMutAct_9fa48("728") ? /^\s*NIS\s*\d+[\d,.]*\s$/ : stryMutAct_9fa48("727") ? /^\s*NIS\s*\d+[\D,.]*\s*$/ : stryMutAct_9fa48("726") ? /^\s*NIS\s*\d+[^\d,.]*\s*$/ : stryMutAct_9fa48("725") ? /^\s*NIS\s*\d+[\d,.]\s*$/ : stryMutAct_9fa48("724") ? /^\s*NIS\s*\D+[\d,.]*\s*$/ : stryMutAct_9fa48("723") ? /^\s*NIS\s*\d[\d,.]*\s*$/ : stryMutAct_9fa48("722") ? /^\s*NIS\S*\d+[\d,.]*\s*$/ : stryMutAct_9fa48("721") ? /^\s*NIS\s\d+[\d,.]*\s*$/ : stryMutAct_9fa48("720") ? /^\S*NIS\s*\d+[\d,.]*\s*$/ : stryMutAct_9fa48("719") ? /^\sNIS\s*\d+[\d,.]*\s*$/ : stryMutAct_9fa48("718") ? /^\s*NIS\s*\d+[\d,.]*\s*/ : stryMutAct_9fa48("717") ? /\s*NIS\s*\d+[\d,.]*\s*$/ : (stryCov_9fa48("717", "718", "719", "720", "721", "722", "723", "724", "725", "726", "727", "728", "729"), /^\s*NIS\s*\d+[\d,.]*\s*$/)]);
      const matchesPricePattern = stryMutAct_9fa48("730") ? pricePatterns.every(pattern => pattern.test(t)) : (stryCov_9fa48("730"), pricePatterns.some(stryMutAct_9fa48("731") ? () => undefined : (stryCov_9fa48("731"), pattern => pattern.test(t))));

      // Check for very short numeric content that's likely a price
      const isShortNumeric = stryMutAct_9fa48("734") ? t.length <= 15 || /^\s*\d+[\d,.]*\s*$/.test(t) : stryMutAct_9fa48("733") ? false : stryMutAct_9fa48("732") ? true : (stryCov_9fa48("732", "733", "734"), (stryMutAct_9fa48("737") ? t.length > 15 : stryMutAct_9fa48("736") ? t.length < 15 : stryMutAct_9fa48("735") ? true : (stryCov_9fa48("735", "736", "737"), t.length <= 15)) && (stryMutAct_9fa48("748") ? /^\s*\d+[\d,.]*\S*$/ : stryMutAct_9fa48("747") ? /^\s*\d+[\d,.]*\s$/ : stryMutAct_9fa48("746") ? /^\s*\d+[\D,.]*\s*$/ : stryMutAct_9fa48("745") ? /^\s*\d+[^\d,.]*\s*$/ : stryMutAct_9fa48("744") ? /^\s*\d+[\d,.]\s*$/ : stryMutAct_9fa48("743") ? /^\s*\D+[\d,.]*\s*$/ : stryMutAct_9fa48("742") ? /^\s*\d[\d,.]*\s*$/ : stryMutAct_9fa48("741") ? /^\S*\d+[\d,.]*\s*$/ : stryMutAct_9fa48("740") ? /^\s\d+[\d,.]*\s*$/ : stryMutAct_9fa48("739") ? /^\s*\d+[\d,.]*\s*/ : stryMutAct_9fa48("738") ? /\s*\d+[\d,.]*\s*$/ : (stryCov_9fa48("738", "739", "740", "741", "742", "743", "744", "745", "746", "747", "748"), /^\s*\d+[\d,.]*\s*$/)).test(t));
      return stryMutAct_9fa48("751") ? (containsOnlyPrice || containsCurrencyAndNumber || cartSnippet.test(t) || matchesPricePattern) && isShortNumeric : stryMutAct_9fa48("750") ? false : stryMutAct_9fa48("749") ? true : (stryCov_9fa48("749", "750", "751"), (stryMutAct_9fa48("753") ? (containsOnlyPrice || containsCurrencyAndNumber || cartSnippet.test(t)) && matchesPricePattern : stryMutAct_9fa48("752") ? false : (stryCov_9fa48("752", "753"), (stryMutAct_9fa48("755") ? (containsOnlyPrice || containsCurrencyAndNumber) && cartSnippet.test(t) : stryMutAct_9fa48("754") ? false : (stryCov_9fa48("754", "755"), (stryMutAct_9fa48("757") ? containsOnlyPrice && containsCurrencyAndNumber : stryMutAct_9fa48("756") ? false : (stryCov_9fa48("756", "757"), containsOnlyPrice || containsCurrencyAndNumber)) || cartSnippet.test(t))) || matchesPricePattern)) || isShortNumeric);
    }
  }

  /**
   * Extract product URLs using the configured selector
   */
  protected extractProductUrlsWithSelector(dom: JSDOM, selector: string | string[]): string[] {
    if (stryMutAct_9fa48("758")) {
      {}
    } else {
      stryCov_9fa48("758");
      const selectorArray = Array.isArray(selector) ? selector : stryMutAct_9fa48("759") ? [] : (stryCov_9fa48("759"), [selector]);
      const urls: string[] = stryMutAct_9fa48("760") ? ["Stryker was here"] : (stryCov_9fa48("760"), []);
      const seen = new Set<string>();
      for (const sel of selectorArray) {
        if (stryMutAct_9fa48("761")) {
          {}
        } else {
          stryCov_9fa48("761");
          const links = dom.window.document.querySelectorAll(sel);
          for (const link of links) {
            if (stryMutAct_9fa48("762")) {
              {}
            } else {
              stryCov_9fa48("762");
              const href = link.getAttribute(stryMutAct_9fa48("763") ? "" : (stryCov_9fa48("763"), 'href'));
              if (stryMutAct_9fa48("765") ? false : stryMutAct_9fa48("764") ? true : (stryCov_9fa48("764", "765"), href)) {
                if (stryMutAct_9fa48("766")) {
                  {}
                } else {
                  stryCov_9fa48("766");
                  const resolved = this.resolveUrl(href);
                  // Accept only real product pages; exclude add-to-cart and category/archive links
                  // Support both singular and Shopify-style plural product paths
                  const isProduct = /(\/products\/|\/product\/)/.test(resolved);
                  const isAddToCart = (stryMutAct_9fa48("767") ? /[^?&]add-to-cart=/ : (stryCov_9fa48("767"), /[?&]add-to-cart=/)).test(resolved);
                  const isCategory = /\/product-category\//.test(resolved);
                  if (stryMutAct_9fa48("770") ? isProduct && !isAddToCart && !isCategory || !seen.has(resolved) : stryMutAct_9fa48("769") ? false : stryMutAct_9fa48("768") ? true : (stryCov_9fa48("768", "769", "770"), (stryMutAct_9fa48("772") ? isProduct && !isAddToCart || !isCategory : stryMutAct_9fa48("771") ? true : (stryCov_9fa48("771", "772"), (stryMutAct_9fa48("774") ? isProduct || !isAddToCart : stryMutAct_9fa48("773") ? true : (stryCov_9fa48("773", "774"), isProduct && (stryMutAct_9fa48("775") ? isAddToCart : (stryCov_9fa48("775"), !isAddToCart)))) && (stryMutAct_9fa48("776") ? isCategory : (stryCov_9fa48("776"), !isCategory)))) && (stryMutAct_9fa48("777") ? seen.has(resolved) : (stryCov_9fa48("777"), !seen.has(resolved))))) {
                    if (stryMutAct_9fa48("778")) {
                      {}
                    } else {
                      stryCov_9fa48("778");
                      urls.push(resolved);
                      seen.add(resolved);
                    }
                  }
                }
              }
            }
          }
          if (stryMutAct_9fa48("782") ? urls.length <= 0 : stryMutAct_9fa48("781") ? urls.length >= 0 : stryMutAct_9fa48("780") ? false : stryMutAct_9fa48("779") ? true : (stryCov_9fa48("779", "780", "781", "782"), urls.length > 0)) break; // Use first successful selector
        }
      }
      return urls;
    }
  }

  /**
   * Extract images using the configured selector
   */
  protected override extractImages(dom: JSDOM, selector: string | string[]): string[] {
    if (stryMutAct_9fa48("783")) {
      {}
    } else {
      stryCov_9fa48("783");
      const selectorArray = Array.isArray(selector) ? selector : stryMutAct_9fa48("784") ? [] : (stryCov_9fa48("784"), [selector]);

      // Shopify-focused gallery detection
      const doc = dom.window.document;
      const galleryScopes = stryMutAct_9fa48("785") ? [] : (stryCov_9fa48("785"), [stryMutAct_9fa48("786") ? "" : (stryCov_9fa48("786"), '.product__media'), stryMutAct_9fa48("787") ? "" : (stryCov_9fa48("787"), '.product-media'), stryMutAct_9fa48("788") ? "" : (stryCov_9fa48("788"), '.product__media-list'), stryMutAct_9fa48("789") ? "" : (stryCov_9fa48("789"), '.product__gallery'), stryMutAct_9fa48("790") ? "" : (stryCov_9fa48("790"), '[data-product-gallery]')]);

      // More lenient filtering - accept Shopify CDN and site-specific images
      const productCdnFilter = (u: string) => {
        if (stryMutAct_9fa48("791")) {
          {}
        } else {
          stryCov_9fa48("791");
          // Accept Shopify CDN images
          if (stryMutAct_9fa48("793") ? false : stryMutAct_9fa48("792") ? true : (stryCov_9fa48("792", "793"), (stryMutAct_9fa48("794") ? /cdn\.shopify\.com\/.\/products\// : (stryCov_9fa48("794"), /cdn\.shopify\.com\/.+\/products\//)).test(u))) return stryMutAct_9fa48("795") ? false : (stryCov_9fa48("795"), true);
          // Accept wash-and-dry.eu domain images
          if (stryMutAct_9fa48("797") ? false : stryMutAct_9fa48("796") ? true : (stryCov_9fa48("796", "797"), (stryMutAct_9fa48("798") ? /wash-and-dry\.eu.\/files\// : (stryCov_9fa48("798"), /wash-and-dry\.eu.*\/files\//)).test(u))) return stryMutAct_9fa48("799") ? false : (stryCov_9fa48("799"), true);
          // Accept any https URL that looks like a product image
          if (stryMutAct_9fa48("802") ? u.startsWith('https://') || /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(u) : stryMutAct_9fa48("801") ? false : stryMutAct_9fa48("800") ? true : (stryCov_9fa48("800", "801", "802"), (stryMutAct_9fa48("803") ? u.endsWith('https://') : (stryCov_9fa48("803"), u.startsWith(stryMutAct_9fa48("804") ? "" : (stryCov_9fa48("804"), 'https://')))) && (stryMutAct_9fa48("805") ? /\.(jpg|jpeg|png|webp|gif)(\?)/i : (stryCov_9fa48("805"), /\.(jpg|jpeg|png|webp|gif)(\?|$)/i)).test(u))) return stryMutAct_9fa48("806") ? false : (stryCov_9fa48("806"), true);
          return stryMutAct_9fa48("807") ? true : (stryCov_9fa48("807"), false);
        }
      };
      const notIconFilter = stryMutAct_9fa48("808") ? () => undefined : (stryCov_9fa48("808"), (() => {
        const notIconFilter = (u: string) => stryMutAct_9fa48("809") ? /(icon|sprite|logo|favicon|placeholder)/i.test(u) : (stryCov_9fa48("809"), !/(icon|sprite|logo|favicon|placeholder)/i.test(u));
        return notIconFilter;
      })());
      const getLargestFromSrcset = (srcset: string): string | null => {
        if (stryMutAct_9fa48("810")) {
          {}
        } else {
          stryCov_9fa48("810");
          try {
            if (stryMutAct_9fa48("811")) {
              {}
            } else {
              stryCov_9fa48("811");
              const parts = srcset.split(stryMutAct_9fa48("812") ? "" : (stryCov_9fa48("812"), ',')).map(stryMutAct_9fa48("813") ? () => undefined : (stryCov_9fa48("813"), s => stryMutAct_9fa48("814") ? s : (stryCov_9fa48("814"), s.trim())));
              const candidates = stryMutAct_9fa48("815") ? parts.map(p => {
                const [url, size] = p.split(' ');
                const width = size && size.endsWith('w') ? parseInt(size) : 0;
                return {
                  url,
                  width
                };
              }) : (stryCov_9fa48("815"), parts.map(p => {
                if (stryMutAct_9fa48("816")) {
                  {}
                } else {
                  stryCov_9fa48("816");
                  const [url, size] = p.split(stryMutAct_9fa48("817") ? "" : (stryCov_9fa48("817"), ' '));
                  const width = (stryMutAct_9fa48("820") ? size || size.endsWith('w') : stryMutAct_9fa48("819") ? false : stryMutAct_9fa48("818") ? true : (stryCov_9fa48("818", "819", "820"), size && (stryMutAct_9fa48("821") ? size.startsWith('w') : (stryCov_9fa48("821"), size.endsWith(stryMutAct_9fa48("822") ? "" : (stryCov_9fa48("822"), 'w')))))) ? parseInt(size) : 0;
                  return stryMutAct_9fa48("823") ? {} : (stryCov_9fa48("823"), {
                    url,
                    width
                  });
                }
              }).filter(stryMutAct_9fa48("824") ? () => undefined : (stryCov_9fa48("824"), c => stryMutAct_9fa48("825") ? !c.url : (stryCov_9fa48("825"), !(stryMutAct_9fa48("826") ? c.url : (stryCov_9fa48("826"), !c.url))))));
              if (stryMutAct_9fa48("829") ? candidates.length !== 0 : stryMutAct_9fa48("828") ? false : stryMutAct_9fa48("827") ? true : (stryCov_9fa48("827", "828", "829"), candidates.length === 0)) return null;
              stryMutAct_9fa48("830") ? candidates : (stryCov_9fa48("830"), candidates.sort(stryMutAct_9fa48("831") ? () => undefined : (stryCov_9fa48("831"), (a, b) => stryMutAct_9fa48("832") ? b.width + a.width : (stryCov_9fa48("832"), b.width - a.width))));
              return stryMutAct_9fa48("835") ? candidates[0].url && null : stryMutAct_9fa48("834") ? false : stryMutAct_9fa48("833") ? true : (stryCov_9fa48("833", "834", "835"), candidates[0].url || null);
            }
          } catch {
            if (stryMutAct_9fa48("836")) {
              {}
            } else {
              stryCov_9fa48("836");
              return null;
            }
          }
        }
      };

      // 0) Try LD+JSON Product images first
      try {
        if (stryMutAct_9fa48("837")) {
          {}
        } else {
          stryCov_9fa48("837");
          const ldScripts = Array.from(doc.querySelectorAll(stryMutAct_9fa48("838") ? "" : (stryCov_9fa48("838"), 'script[type=\'application/ld+json\']')));
          const ldImages: string[] = stryMutAct_9fa48("839") ? ["Stryker was here"] : (stryCov_9fa48("839"), []);
          for (const s of ldScripts) {
            if (stryMutAct_9fa48("840")) {
              {}
            } else {
              stryCov_9fa48("840");
              const raw = stryMutAct_9fa48("842") ? s.textContent.trim() : stryMutAct_9fa48("841") ? s.textContent : (stryCov_9fa48("841", "842"), s.textContent?.trim());
              if (stryMutAct_9fa48("845") ? false : stryMutAct_9fa48("844") ? true : stryMutAct_9fa48("843") ? raw : (stryCov_9fa48("843", "844", "845"), !raw)) continue;
              let json: Record<string, unknown>;
              try {
                if (stryMutAct_9fa48("846")) {
                  {}
                } else {
                  stryCov_9fa48("846");
                  json = JSON.parse(raw);
                }
              } catch {
                if (stryMutAct_9fa48("847")) {
                  {}
                } else {
                  stryCov_9fa48("847");
                  continue;
                }
              }
              const products: Record<string, unknown>[] = stryMutAct_9fa48("848") ? ["Stryker was here"] : (stryCov_9fa48("848"), []);
              if (stryMutAct_9fa48("851") ? json || json['@type'] === 'Product' : stryMutAct_9fa48("850") ? false : stryMutAct_9fa48("849") ? true : (stryCov_9fa48("849", "850", "851"), json && (stryMutAct_9fa48("853") ? json['@type'] !== 'Product' : stryMutAct_9fa48("852") ? true : (stryCov_9fa48("852", "853"), json[stryMutAct_9fa48("854") ? "" : (stryCov_9fa48("854"), '@type')] === (stryMutAct_9fa48("855") ? "" : (stryCov_9fa48("855"), 'Product')))))) products.push(json);
              if (stryMutAct_9fa48("857") ? false : stryMutAct_9fa48("856") ? true : (stryCov_9fa48("856", "857"), Array.isArray(json))) products.push(...(stryMutAct_9fa48("858") ? json : (stryCov_9fa48("858"), json.filter(stryMutAct_9fa48("859") ? () => undefined : (stryCov_9fa48("859"), j => stryMutAct_9fa48("862") ? j['@type'] !== 'Product' : stryMutAct_9fa48("861") ? false : stryMutAct_9fa48("860") ? true : (stryCov_9fa48("860", "861", "862"), j[stryMutAct_9fa48("863") ? "" : (stryCov_9fa48("863"), '@type')] === (stryMutAct_9fa48("864") ? "" : (stryCov_9fa48("864"), 'Product'))))))));
              if (stryMutAct_9fa48("866") ? false : stryMutAct_9fa48("865") ? true : (stryCov_9fa48("865", "866"), Array.isArray(json[stryMutAct_9fa48("867") ? "" : (stryCov_9fa48("867"), '@graph')]))) products.push(...(stryMutAct_9fa48("868") ? json['@graph'] : (stryCov_9fa48("868"), json[stryMutAct_9fa48("869") ? "" : (stryCov_9fa48("869"), '@graph')].filter(stryMutAct_9fa48("870") ? () => undefined : (stryCov_9fa48("870"), (g: Record<string, unknown>) => stryMutAct_9fa48("873") ? g['@type'] !== 'Product' : stryMutAct_9fa48("872") ? false : stryMutAct_9fa48("871") ? true : (stryCov_9fa48("871", "872", "873"), g[stryMutAct_9fa48("874") ? "" : (stryCov_9fa48("874"), '@type')] === (stryMutAct_9fa48("875") ? "" : (stryCov_9fa48("875"), 'Product'))))))));
              for (const p of products) {
                if (stryMutAct_9fa48("876")) {
                  {}
                } else {
                  stryCov_9fa48("876");
                  if (stryMutAct_9fa48("878") ? false : stryMutAct_9fa48("877") ? true : (stryCov_9fa48("877", "878"), p.image)) {
                    if (stryMutAct_9fa48("879")) {
                      {}
                    } else {
                      stryCov_9fa48("879");
                      if (stryMutAct_9fa48("882") ? typeof p.image !== 'string' : stryMutAct_9fa48("881") ? false : stryMutAct_9fa48("880") ? true : (stryCov_9fa48("880", "881", "882"), typeof p.image === (stryMutAct_9fa48("883") ? "" : (stryCov_9fa48("883"), 'string')))) {
                        if (stryMutAct_9fa48("884")) {
                          {}
                        } else {
                          stryCov_9fa48("884");
                          ldImages.push(p.image);
                        }
                      } else if (stryMutAct_9fa48("886") ? false : stryMutAct_9fa48("885") ? true : (stryCov_9fa48("885", "886"), Array.isArray(p.image))) {
                        if (stryMutAct_9fa48("887")) {
                          {}
                        } else {
                          stryCov_9fa48("887");
                          for (const im of p.image) if (stryMutAct_9fa48("890") ? typeof im !== 'string' : stryMutAct_9fa48("889") ? false : stryMutAct_9fa48("888") ? true : (stryCov_9fa48("888", "889", "890"), typeof im === (stryMutAct_9fa48("891") ? "" : (stryCov_9fa48("891"), 'string')))) ldImages.push(im);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          const filteredLd = stryMutAct_9fa48("893") ? ldImages.map(u => this.resolveUrl(u)).filter(notIconFilter) : stryMutAct_9fa48("892") ? ldImages.map(u => this.resolveUrl(u)).filter(productCdnFilter) : (stryCov_9fa48("892", "893"), ldImages.map(stryMutAct_9fa48("894") ? () => undefined : (stryCov_9fa48("894"), u => this.resolveUrl(u))).filter(productCdnFilter).filter(notIconFilter));
          if (stryMutAct_9fa48("898") ? filteredLd.length <= 0 : stryMutAct_9fa48("897") ? filteredLd.length >= 0 : stryMutAct_9fa48("896") ? false : stryMutAct_9fa48("895") ? true : (stryCov_9fa48("895", "896", "897", "898"), filteredLd.length > 0)) {
            if (stryMutAct_9fa48("899")) {
              {}
            } else {
              stryCov_9fa48("899");
              if (stryMutAct_9fa48("902") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("901") ? false : stryMutAct_9fa48("900") ? true : (stryCov_9fa48("900", "901", "902"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("903") ? "" : (stryCov_9fa48("903"), '1')))) console.log(stryMutAct_9fa48("904") ? `` : (stryCov_9fa48("904"), `[extractImages] Found ${filteredLd.length} LD+JSON images, but continuing to check configured selectors`));
              // Don't return immediately - continue to check configured selectors for more images
            }
          }
        }
      } catch {
        // Ignore errors and continue with other methods
      }

      // 0b) Try Shopify Product JSON (script id starts with ProductJson)
      try {
        if (stryMutAct_9fa48("905")) {
          {}
        } else {
          stryCov_9fa48("905");
          const productJsonScripts = Array.from(doc.querySelectorAll(stryMutAct_9fa48("906") ? "" : (stryCov_9fa48("906"), 'script[id^=\'ProductJson\']')));
          const jsonImages: string[] = stryMutAct_9fa48("907") ? ["Stryker was here"] : (stryCov_9fa48("907"), []);
          for (const s of productJsonScripts) {
            if (stryMutAct_9fa48("908")) {
              {}
            } else {
              stryCov_9fa48("908");
              const raw = stryMutAct_9fa48("910") ? s.textContent.trim() : stryMutAct_9fa48("909") ? s.textContent : (stryCov_9fa48("909", "910"), s.textContent?.trim());
              if (stryMutAct_9fa48("913") ? false : stryMutAct_9fa48("912") ? true : stryMutAct_9fa48("911") ? raw : (stryCov_9fa48("911", "912", "913"), !raw)) continue;
              let json: Record<string, unknown>;
              try {
                if (stryMutAct_9fa48("914")) {
                  {}
                } else {
                  stryCov_9fa48("914");
                  json = JSON.parse(raw);
                }
              } catch {
                if (stryMutAct_9fa48("915")) {
                  {}
                } else {
                  stryCov_9fa48("915");
                  continue;
                }
              }
              // Common Shopify product JSON: images: string[] or media: [{src|preview_image}]
              if (stryMutAct_9fa48("917") ? false : stryMutAct_9fa48("916") ? true : (stryCov_9fa48("916", "917"), Array.isArray(stryMutAct_9fa48("918") ? json.images : (stryCov_9fa48("918"), json?.images)))) {
                if (stryMutAct_9fa48("919")) {
                  {}
                } else {
                  stryCov_9fa48("919");
                  for (const u of json.images) if (stryMutAct_9fa48("922") ? typeof u !== 'string' : stryMutAct_9fa48("921") ? false : stryMutAct_9fa48("920") ? true : (stryCov_9fa48("920", "921", "922"), typeof u === (stryMutAct_9fa48("923") ? "" : (stryCov_9fa48("923"), 'string')))) jsonImages.push(u);
                }
              }
              if (stryMutAct_9fa48("925") ? false : stryMutAct_9fa48("924") ? true : (stryCov_9fa48("924", "925"), Array.isArray(stryMutAct_9fa48("926") ? json.media : (stryCov_9fa48("926"), json?.media)))) {
                if (stryMutAct_9fa48("927")) {
                  {}
                } else {
                  stryCov_9fa48("927");
                  for (const m of json.media) {
                    if (stryMutAct_9fa48("928")) {
                      {}
                    } else {
                      stryCov_9fa48("928");
                      const u = stryMutAct_9fa48("931") ? (m?.src || m?.preview_image?.src || m?.image) && m?.url : stryMutAct_9fa48("930") ? false : stryMutAct_9fa48("929") ? true : (stryCov_9fa48("929", "930", "931"), (stryMutAct_9fa48("933") ? (m?.src || m?.preview_image?.src) && m?.image : stryMutAct_9fa48("932") ? false : (stryCov_9fa48("932", "933"), (stryMutAct_9fa48("935") ? m?.src && m?.preview_image?.src : stryMutAct_9fa48("934") ? false : (stryCov_9fa48("934", "935"), (stryMutAct_9fa48("936") ? m.src : (stryCov_9fa48("936"), m?.src)) || (stryMutAct_9fa48("938") ? m.preview_image?.src : stryMutAct_9fa48("937") ? m?.preview_image.src : (stryCov_9fa48("937", "938"), m?.preview_image?.src)))) || (stryMutAct_9fa48("939") ? m.image : (stryCov_9fa48("939"), m?.image)))) || (stryMutAct_9fa48("940") ? m.url : (stryCov_9fa48("940"), m?.url)));
                      if (stryMutAct_9fa48("943") ? typeof u !== 'string' : stryMutAct_9fa48("942") ? false : stryMutAct_9fa48("941") ? true : (stryCov_9fa48("941", "942", "943"), typeof u === (stryMutAct_9fa48("944") ? "" : (stryCov_9fa48("944"), 'string')))) jsonImages.push(u);
                    }
                  }
                }
              }
            }
          }
          const filteredJson = stryMutAct_9fa48("946") ? jsonImages.map(u => this.resolveUrl(u)).filter(notIconFilter) : stryMutAct_9fa48("945") ? jsonImages.map(u => this.resolveUrl(u)).filter(productCdnFilter) : (stryCov_9fa48("945", "946"), jsonImages.map(stryMutAct_9fa48("947") ? () => undefined : (stryCov_9fa48("947"), u => this.resolveUrl(u))).filter(productCdnFilter).filter(notIconFilter));
          if (stryMutAct_9fa48("951") ? filteredJson.length <= 0 : stryMutAct_9fa48("950") ? filteredJson.length >= 0 : stryMutAct_9fa48("949") ? false : stryMutAct_9fa48("948") ? true : (stryCov_9fa48("948", "949", "950", "951"), filteredJson.length > 0)) {
            if (stryMutAct_9fa48("952")) {
              {}
            } else {
              stryCov_9fa48("952");
              if (stryMutAct_9fa48("955") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("954") ? false : stryMutAct_9fa48("953") ? true : (stryCov_9fa48("953", "954", "955"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("956") ? "" : (stryCov_9fa48("956"), '1')))) console.log(stryMutAct_9fa48("957") ? `` : (stryCov_9fa48("957"), `[extractImages] Found ${filteredJson.length} Shopify JSON images, but continuing to check configured selectors`));
              // Don't return immediately - continue to check configured selectors for more images
            }
          }
        }
      } catch {
        // Ignore errors and continue with other methods
      }
      const collectImagesFromScope = (scope: Element): string[] => {
        if (stryMutAct_9fa48("958")) {
          {}
        } else {
          stryCov_9fa48("958");
          const urls: string[] = stryMutAct_9fa48("959") ? ["Stryker was here"] : (stryCov_9fa48("959"), []);
          // Consider <img> and <source> inside <picture>
          const imgNodes = scope.querySelectorAll(stryMutAct_9fa48("960") ? "" : (stryCov_9fa48("960"), 'img, picture source'));
          imgNodes.forEach(n => {
            if (stryMutAct_9fa48("961")) {
              {}
            } else {
              stryCov_9fa48("961");
              let src: string | null = null;
              const srcset = stryMutAct_9fa48("964") ? n.getAttribute('srcset') && n.getAttribute('data-srcset') : stryMutAct_9fa48("963") ? false : stryMutAct_9fa48("962") ? true : (stryCov_9fa48("962", "963", "964"), n.getAttribute(stryMutAct_9fa48("965") ? "" : (stryCov_9fa48("965"), 'srcset')) || n.getAttribute(stryMutAct_9fa48("966") ? "" : (stryCov_9fa48("966"), 'data-srcset')));
              if (stryMutAct_9fa48("968") ? false : stryMutAct_9fa48("967") ? true : (stryCov_9fa48("967", "968"), srcset)) {
                if (stryMutAct_9fa48("969")) {
                  {}
                } else {
                  stryCov_9fa48("969");
                  src = getLargestFromSrcset(srcset);
                }
              }
              if (stryMutAct_9fa48("972") ? false : stryMutAct_9fa48("971") ? true : stryMutAct_9fa48("970") ? src : (stryCov_9fa48("970", "971", "972"), !src)) {
                if (stryMutAct_9fa48("973")) {
                  {}
                } else {
                  stryCov_9fa48("973");
                  src = stryMutAct_9fa48("976") ? (n.getAttribute('data-image') || n.getAttribute('data-original-src') || n.getAttribute('data-src')) && n.getAttribute('src') : stryMutAct_9fa48("975") ? false : stryMutAct_9fa48("974") ? true : (stryCov_9fa48("974", "975", "976"), (stryMutAct_9fa48("978") ? (n.getAttribute('data-image') || n.getAttribute('data-original-src')) && n.getAttribute('data-src') : stryMutAct_9fa48("977") ? false : (stryCov_9fa48("977", "978"), (stryMutAct_9fa48("980") ? n.getAttribute('data-image') && n.getAttribute('data-original-src') : stryMutAct_9fa48("979") ? false : (stryCov_9fa48("979", "980"), n.getAttribute(stryMutAct_9fa48("981") ? "" : (stryCov_9fa48("981"), 'data-image')) || n.getAttribute(stryMutAct_9fa48("982") ? "" : (stryCov_9fa48("982"), 'data-original-src')))) || n.getAttribute(stryMutAct_9fa48("983") ? "" : (stryCov_9fa48("983"), 'data-src')))) || n.getAttribute(stryMutAct_9fa48("984") ? "" : (stryCov_9fa48("984"), 'src')));
                }
              }
              if (stryMutAct_9fa48("986") ? false : stryMutAct_9fa48("985") ? true : (stryCov_9fa48("985", "986"), src)) {
                if (stryMutAct_9fa48("987")) {
                  {}
                } else {
                  stryCov_9fa48("987");
                  urls.push(this.resolveUrl(src));
                }
              }
            }
          });
          // Also extract background-image URLs
          const bgNodes = scope.querySelectorAll(stryMutAct_9fa48("988") ? "" : (stryCov_9fa48("988"), '[style*=\'background-image\']'));
          bgNodes.forEach(n => {
            if (stryMutAct_9fa48("989")) {
              {}
            } else {
              stryCov_9fa48("989");
              const style = stryMutAct_9fa48("992") ? (n as HTMLElement).getAttribute('style') && '' : stryMutAct_9fa48("991") ? false : stryMutAct_9fa48("990") ? true : (stryCov_9fa48("990", "991", "992"), (n as HTMLElement).getAttribute(stryMutAct_9fa48("993") ? "" : (stryCov_9fa48("993"), 'style')) || (stryMutAct_9fa48("994") ? "Stryker was here!" : (stryCov_9fa48("994"), '')));
              const match = style.match(stryMutAct_9fa48("1000") ? /background-image:\s*url\((['"]?)([)'"]+)\1\)/i : stryMutAct_9fa48("999") ? /background-image:\s*url\((['"]?)([^)'"])\1\)/i : stryMutAct_9fa48("998") ? /background-image:\s*url\(([^'"]?)([^)'"]+)\1\)/i : stryMutAct_9fa48("997") ? /background-image:\s*url\((['"])([^)'"]+)\1\)/i : stryMutAct_9fa48("996") ? /background-image:\S*url\((['"]?)([^)'"]+)\1\)/i : stryMutAct_9fa48("995") ? /background-image:\surl\((['"]?)([^)'"]+)\1\)/i : (stryCov_9fa48("995", "996", "997", "998", "999", "1000"), /background-image:\s*url\((['"]?)([^)'"]+)\1\)/i));
              if (stryMutAct_9fa48("1003") ? match || match[2] : stryMutAct_9fa48("1002") ? false : stryMutAct_9fa48("1001") ? true : (stryCov_9fa48("1001", "1002", "1003"), match && match[2])) {
                if (stryMutAct_9fa48("1004")) {
                  {}
                } else {
                  stryCov_9fa48("1004");
                  urls.push(this.resolveUrl(match[2]));
                }
              }
            }
          });
          return urls;
        }
      };

      // 1) Try configured selectors FIRST (these are more reliable than gallery scopes)
      for (const sel of selectorArray) {
        if (stryMutAct_9fa48("1005")) {
          {}
        } else {
          stryCov_9fa48("1005");
          const nodes = this.extractElements(dom, sel);
          if (stryMutAct_9fa48("1009") ? nodes.length <= 0 : stryMutAct_9fa48("1008") ? nodes.length >= 0 : stryMutAct_9fa48("1007") ? false : stryMutAct_9fa48("1006") ? true : (stryCov_9fa48("1006", "1007", "1008", "1009"), nodes.length > 0)) {
            if (stryMutAct_9fa48("1010")) {
              {}
            } else {
              stryCov_9fa48("1010");
              const urls = stryMutAct_9fa48("1013") ? nodes.map(img => {
                const srcset = img.getAttribute('srcset') || img.getAttribute('data-srcset');
                if (srcset) {
                  const largest = getLargestFromSrcset(srcset);
                  if (largest) return this.resolveUrl(largest);
                }
                const src = img.getAttribute('data-image') || img.getAttribute('data-original-src') || img.getAttribute('data-src') || img.getAttribute('src');
                return src ? this.resolveUrl(src) : null;
              }).filter(productCdnFilter).filter(notIconFilter) : stryMutAct_9fa48("1012") ? nodes.map(img => {
                const srcset = img.getAttribute('srcset') || img.getAttribute('data-srcset');
                if (srcset) {
                  const largest = getLargestFromSrcset(srcset);
                  if (largest) return this.resolveUrl(largest);
                }
                const src = img.getAttribute('data-image') || img.getAttribute('data-original-src') || img.getAttribute('data-src') || img.getAttribute('src');
                return src ? this.resolveUrl(src) : null;
              }).filter((u): u is string => !!u).filter(notIconFilter) : stryMutAct_9fa48("1011") ? nodes.map(img => {
                const srcset = img.getAttribute('srcset') || img.getAttribute('data-srcset');
                if (srcset) {
                  const largest = getLargestFromSrcset(srcset);
                  if (largest) return this.resolveUrl(largest);
                }
                const src = img.getAttribute('data-image') || img.getAttribute('data-original-src') || img.getAttribute('data-src') || img.getAttribute('src');
                return src ? this.resolveUrl(src) : null;
              }).filter((u): u is string => !!u).filter(productCdnFilter) : (stryCov_9fa48("1011", "1012", "1013"), nodes.map(img => {
                if (stryMutAct_9fa48("1014")) {
                  {}
                } else {
                  stryCov_9fa48("1014");
                  const srcset = stryMutAct_9fa48("1017") ? img.getAttribute('srcset') && img.getAttribute('data-srcset') : stryMutAct_9fa48("1016") ? false : stryMutAct_9fa48("1015") ? true : (stryCov_9fa48("1015", "1016", "1017"), img.getAttribute(stryMutAct_9fa48("1018") ? "" : (stryCov_9fa48("1018"), 'srcset')) || img.getAttribute(stryMutAct_9fa48("1019") ? "" : (stryCov_9fa48("1019"), 'data-srcset')));
                  if (stryMutAct_9fa48("1021") ? false : stryMutAct_9fa48("1020") ? true : (stryCov_9fa48("1020", "1021"), srcset)) {
                    if (stryMutAct_9fa48("1022")) {
                      {}
                    } else {
                      stryCov_9fa48("1022");
                      const largest = getLargestFromSrcset(srcset);
                      if (stryMutAct_9fa48("1024") ? false : stryMutAct_9fa48("1023") ? true : (stryCov_9fa48("1023", "1024"), largest)) return this.resolveUrl(largest);
                    }
                  }
                  const src = stryMutAct_9fa48("1027") ? (img.getAttribute('data-image') || img.getAttribute('data-original-src') || img.getAttribute('data-src')) && img.getAttribute('src') : stryMutAct_9fa48("1026") ? false : stryMutAct_9fa48("1025") ? true : (stryCov_9fa48("1025", "1026", "1027"), (stryMutAct_9fa48("1029") ? (img.getAttribute('data-image') || img.getAttribute('data-original-src')) && img.getAttribute('data-src') : stryMutAct_9fa48("1028") ? false : (stryCov_9fa48("1028", "1029"), (stryMutAct_9fa48("1031") ? img.getAttribute('data-image') && img.getAttribute('data-original-src') : stryMutAct_9fa48("1030") ? false : (stryCov_9fa48("1030", "1031"), img.getAttribute(stryMutAct_9fa48("1032") ? "" : (stryCov_9fa48("1032"), 'data-image')) || img.getAttribute(stryMutAct_9fa48("1033") ? "" : (stryCov_9fa48("1033"), 'data-original-src')))) || img.getAttribute(stryMutAct_9fa48("1034") ? "" : (stryCov_9fa48("1034"), 'data-src')))) || img.getAttribute(stryMutAct_9fa48("1035") ? "" : (stryCov_9fa48("1035"), 'src')));
                  return src ? this.resolveUrl(src) : null;
                }
              }).filter(stryMutAct_9fa48("1036") ? () => undefined : (stryCov_9fa48("1036"), (u): u is string => stryMutAct_9fa48("1037") ? !u : (stryCov_9fa48("1037"), !(stryMutAct_9fa48("1038") ? u : (stryCov_9fa48("1038"), !u))))).filter(productCdnFilter).filter(notIconFilter));
              if (stryMutAct_9fa48("1042") ? urls.length <= 0 : stryMutAct_9fa48("1041") ? urls.length >= 0 : stryMutAct_9fa48("1040") ? false : stryMutAct_9fa48("1039") ? true : (stryCov_9fa48("1039", "1040", "1041", "1042"), urls.length > 0)) {
                if (stryMutAct_9fa48("1043")) {
                  {}
                } else {
                  stryCov_9fa48("1043");
                  if (stryMutAct_9fa48("1046") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("1045") ? false : stryMutAct_9fa48("1044") ? true : (stryCov_9fa48("1044", "1045", "1046"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("1047") ? "" : (stryCov_9fa48("1047"), '1')))) console.log(stryMutAct_9fa48("1048") ? `` : (stryCov_9fa48("1048"), `[extractImages] Found ${urls.length} images from selector ${sel}`));
                  return Array.from(new Set(urls));
                }
              }
            }
          }
        }
      }

      // 2) Try gallery scopes as fallback
      for (const scopeSel of stryMutAct_9fa48("1049") ? [] : (stryCov_9fa48("1049"), [...galleryScopes, stryMutAct_9fa48("1050") ? "" : (stryCov_9fa48("1050"), '.product-gallery')])) {
        if (stryMutAct_9fa48("1051")) {
          {}
        } else {
          stryCov_9fa48("1051");
          const scope = doc.querySelector(scopeSel);
          if (stryMutAct_9fa48("1053") ? false : stryMutAct_9fa48("1052") ? true : (stryCov_9fa48("1052", "1053"), scope)) {
            if (stryMutAct_9fa48("1054")) {
              {}
            } else {
              stryCov_9fa48("1054");
              const urls = stryMutAct_9fa48("1056") ? collectImagesFromScope(scope).filter(notIconFilter) : stryMutAct_9fa48("1055") ? collectImagesFromScope(scope).filter(productCdnFilter) : (stryCov_9fa48("1055", "1056"), collectImagesFromScope(scope).filter(productCdnFilter).filter(notIconFilter));
              if (stryMutAct_9fa48("1060") ? urls.length <= 0 : stryMutAct_9fa48("1059") ? urls.length >= 0 : stryMutAct_9fa48("1058") ? false : stryMutAct_9fa48("1057") ? true : (stryCov_9fa48("1057", "1058", "1059", "1060"), urls.length > 0)) {
                if (stryMutAct_9fa48("1061")) {
                  {}
                } else {
                  stryCov_9fa48("1061");
                  if (stryMutAct_9fa48("1064") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("1063") ? false : stryMutAct_9fa48("1062") ? true : (stryCov_9fa48("1062", "1063", "1064"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("1065") ? "" : (stryCov_9fa48("1065"), '1')))) console.log(stryMutAct_9fa48("1066") ? `` : (stryCov_9fa48("1066"), `[extractImages] Found ${urls.length} images from gallery scope ${scopeSel}`));
                  return Array.from(new Set(urls));
                }
              }
            }
          }
        }
      }

      // 1b) Try to parse <noscript> fallbacks which often contain plain <img>
      const noscripts = Array.from(doc.querySelectorAll(stryMutAct_9fa48("1067") ? "" : (stryCov_9fa48("1067"), 'noscript')));
      for (const ns of noscripts) {
        if (stryMutAct_9fa48("1068")) {
          {}
        } else {
          stryCov_9fa48("1068");
          const html = stryMutAct_9fa48("1071") ? ns.textContent && '' : stryMutAct_9fa48("1070") ? false : stryMutAct_9fa48("1069") ? true : (stryCov_9fa48("1069", "1070", "1071"), ns.textContent || (stryMutAct_9fa48("1072") ? "Stryker was here!" : (stryCov_9fa48("1072"), '')));
          if (stryMutAct_9fa48("1075") ? !html && html.length < 10 : stryMutAct_9fa48("1074") ? false : stryMutAct_9fa48("1073") ? true : (stryCov_9fa48("1073", "1074", "1075"), (stryMutAct_9fa48("1076") ? html : (stryCov_9fa48("1076"), !html)) || (stryMutAct_9fa48("1079") ? html.length >= 10 : stryMutAct_9fa48("1078") ? html.length <= 10 : stryMutAct_9fa48("1077") ? false : (stryCov_9fa48("1077", "1078", "1079"), html.length < 10)))) continue;
          try {
            if (stryMutAct_9fa48("1080")) {
              {}
            } else {
              stryCov_9fa48("1080");
              const frag = new dom.window.DOMParser().parseFromString(html, stryMutAct_9fa48("1081") ? "" : (stryCov_9fa48("1081"), 'text/html'));
              const imgs = frag.querySelectorAll(stryMutAct_9fa48("1082") ? "" : (stryCov_9fa48("1082"), 'img'));
              const urls = stryMutAct_9fa48("1085") ? Array.from(imgs).map(im => im.getAttribute('src') || im.getAttribute('data-src')).map(u => this.resolveUrl(u)).filter(productCdnFilter).filter(notIconFilter) : stryMutAct_9fa48("1084") ? Array.from(imgs).map(im => im.getAttribute('src') || im.getAttribute('data-src')).filter((u): u is string => !!u).map(u => this.resolveUrl(u)).filter(notIconFilter) : stryMutAct_9fa48("1083") ? Array.from(imgs).map(im => im.getAttribute('src') || im.getAttribute('data-src')).filter((u): u is string => !!u).map(u => this.resolveUrl(u)).filter(productCdnFilter) : (stryCov_9fa48("1083", "1084", "1085"), Array.from(imgs).map(stryMutAct_9fa48("1086") ? () => undefined : (stryCov_9fa48("1086"), im => stryMutAct_9fa48("1089") ? im.getAttribute('src') && im.getAttribute('data-src') : stryMutAct_9fa48("1088") ? false : stryMutAct_9fa48("1087") ? true : (stryCov_9fa48("1087", "1088", "1089"), im.getAttribute(stryMutAct_9fa48("1090") ? "" : (stryCov_9fa48("1090"), 'src')) || im.getAttribute(stryMutAct_9fa48("1091") ? "" : (stryCov_9fa48("1091"), 'data-src'))))).filter(stryMutAct_9fa48("1092") ? () => undefined : (stryCov_9fa48("1092"), (u): u is string => stryMutAct_9fa48("1093") ? !u : (stryCov_9fa48("1093"), !(stryMutAct_9fa48("1094") ? u : (stryCov_9fa48("1094"), !u))))).map(stryMutAct_9fa48("1095") ? () => undefined : (stryCov_9fa48("1095"), u => this.resolveUrl(u))).filter(productCdnFilter).filter(notIconFilter));
              if (stryMutAct_9fa48("1099") ? urls.length <= 0 : stryMutAct_9fa48("1098") ? urls.length >= 0 : stryMutAct_9fa48("1097") ? false : stryMutAct_9fa48("1096") ? true : (stryCov_9fa48("1096", "1097", "1098", "1099"), urls.length > 0)) return Array.from(new Set(urls));
            }
          } catch {
            // Ignore parsing errors and continue
          }
        }
      }

      // 2) Fallback to configured selectors but apply strict filtering
      for (const sel of selectorArray) {
        if (stryMutAct_9fa48("1100")) {
          {}
        } else {
          stryCov_9fa48("1100");
          const nodes = this.extractElements(dom, sel);
          if (stryMutAct_9fa48("1104") ? nodes.length <= 0 : stryMutAct_9fa48("1103") ? nodes.length >= 0 : stryMutAct_9fa48("1102") ? false : stryMutAct_9fa48("1101") ? true : (stryCov_9fa48("1101", "1102", "1103", "1104"), nodes.length > 0)) {
            if (stryMutAct_9fa48("1105")) {
              {}
            } else {
              stryCov_9fa48("1105");
              const urls = stryMutAct_9fa48("1108") ? nodes.map(img => {
                const srcset = img.getAttribute('srcset') || img.getAttribute('data-srcset');
                if (srcset) {
                  const largest = getLargestFromSrcset(srcset);
                  if (largest) return this.resolveUrl(largest);
                }
                const src = img.getAttribute('data-original-src') || img.getAttribute('data-src') || img.getAttribute('src');
                return src ? this.resolveUrl(src) : null;
              }).filter(productCdnFilter).filter(notIconFilter) : stryMutAct_9fa48("1107") ? nodes.map(img => {
                const srcset = img.getAttribute('srcset') || img.getAttribute('data-srcset');
                if (srcset) {
                  const largest = getLargestFromSrcset(srcset);
                  if (largest) return this.resolveUrl(largest);
                }
                const src = img.getAttribute('data-original-src') || img.getAttribute('data-src') || img.getAttribute('src');
                return src ? this.resolveUrl(src) : null;
              }).filter((u): u is string => !!u).filter(notIconFilter) : stryMutAct_9fa48("1106") ? nodes.map(img => {
                const srcset = img.getAttribute('srcset') || img.getAttribute('data-srcset');
                if (srcset) {
                  const largest = getLargestFromSrcset(srcset);
                  if (largest) return this.resolveUrl(largest);
                }
                const src = img.getAttribute('data-original-src') || img.getAttribute('data-src') || img.getAttribute('src');
                return src ? this.resolveUrl(src) : null;
              }).filter((u): u is string => !!u).filter(productCdnFilter) : (stryCov_9fa48("1106", "1107", "1108"), nodes.map(img => {
                if (stryMutAct_9fa48("1109")) {
                  {}
                } else {
                  stryCov_9fa48("1109");
                  const srcset = stryMutAct_9fa48("1112") ? img.getAttribute('srcset') && img.getAttribute('data-srcset') : stryMutAct_9fa48("1111") ? false : stryMutAct_9fa48("1110") ? true : (stryCov_9fa48("1110", "1111", "1112"), img.getAttribute(stryMutAct_9fa48("1113") ? "" : (stryCov_9fa48("1113"), 'srcset')) || img.getAttribute(stryMutAct_9fa48("1114") ? "" : (stryCov_9fa48("1114"), 'data-srcset')));
                  if (stryMutAct_9fa48("1116") ? false : stryMutAct_9fa48("1115") ? true : (stryCov_9fa48("1115", "1116"), srcset)) {
                    if (stryMutAct_9fa48("1117")) {
                      {}
                    } else {
                      stryCov_9fa48("1117");
                      const largest = getLargestFromSrcset(srcset);
                      if (stryMutAct_9fa48("1119") ? false : stryMutAct_9fa48("1118") ? true : (stryCov_9fa48("1118", "1119"), largest)) return this.resolveUrl(largest);
                    }
                  }
                  const src = stryMutAct_9fa48("1122") ? (img.getAttribute('data-original-src') || img.getAttribute('data-src')) && img.getAttribute('src') : stryMutAct_9fa48("1121") ? false : stryMutAct_9fa48("1120") ? true : (stryCov_9fa48("1120", "1121", "1122"), (stryMutAct_9fa48("1124") ? img.getAttribute('data-original-src') && img.getAttribute('data-src') : stryMutAct_9fa48("1123") ? false : (stryCov_9fa48("1123", "1124"), img.getAttribute(stryMutAct_9fa48("1125") ? "" : (stryCov_9fa48("1125"), 'data-original-src')) || img.getAttribute(stryMutAct_9fa48("1126") ? "" : (stryCov_9fa48("1126"), 'data-src')))) || img.getAttribute(stryMutAct_9fa48("1127") ? "" : (stryCov_9fa48("1127"), 'src')));
                  return src ? this.resolveUrl(src) : null;
                }
              }).filter(stryMutAct_9fa48("1128") ? () => undefined : (stryCov_9fa48("1128"), (u): u is string => stryMutAct_9fa48("1129") ? !u : (stryCov_9fa48("1129"), !(stryMutAct_9fa48("1130") ? u : (stryCov_9fa48("1130"), !u))))).filter(productCdnFilter).filter(notIconFilter));
              if (stryMutAct_9fa48("1134") ? urls.length <= 0 : stryMutAct_9fa48("1133") ? urls.length >= 0 : stryMutAct_9fa48("1132") ? false : stryMutAct_9fa48("1131") ? true : (stryCov_9fa48("1131", "1132", "1133", "1134"), urls.length > 0)) {
                if (stryMutAct_9fa48("1135")) {
                  {}
                } else {
                  stryCov_9fa48("1135");
                  return Array.from(new Set(urls));
                }
              }
            }
          }
        }
      }

      // 3) Last resort: OpenGraph image
      const og = stryMutAct_9fa48("1136") ? doc.querySelector('meta[property=\'og:image\']').getAttribute('content') : (stryCov_9fa48("1136"), doc.querySelector(stryMutAct_9fa48("1137") ? "" : (stryCov_9fa48("1137"), 'meta[property=\'og:image\']'))?.getAttribute(stryMutAct_9fa48("1138") ? "" : (stryCov_9fa48("1138"), 'content')));
      if (stryMutAct_9fa48("1141") ? og && productCdnFilter(og) || notIconFilter(og) : stryMutAct_9fa48("1140") ? false : stryMutAct_9fa48("1139") ? true : (stryCov_9fa48("1139", "1140", "1141"), (stryMutAct_9fa48("1143") ? og || productCdnFilter(og) : stryMutAct_9fa48("1142") ? true : (stryCov_9fa48("1142", "1143"), og && productCdnFilter(og))) && notIconFilter(og))) {
        if (stryMutAct_9fa48("1144")) {
          {}
        } else {
          stryCov_9fa48("1144");
          return stryMutAct_9fa48("1145") ? [] : (stryCov_9fa48("1145"), [this.resolveUrl(og)]);
        }
      }
      return stryMutAct_9fa48("1146") ? ["Stryker was here"] : (stryCov_9fa48("1146"), []);
    }
  }

  /**
   * Extract stock status using the configured selector
   */
  protected override extractStockStatus(dom: JSDOM, selector: string | string[]): string {
    if (stryMutAct_9fa48("1147")) {
      {}
    } else {
      stryCov_9fa48("1147");
      const selectorArray = Array.isArray(selector) ? selector : stryMutAct_9fa48("1148") ? [] : (stryCov_9fa48("1148"), [selector]);
      for (const sel of selectorArray) {
        if (stryMutAct_9fa48("1149")) {
          {}
        } else {
          stryCov_9fa48("1149");
          const stockText = this.extractText(dom, sel);
          if (stryMutAct_9fa48("1151") ? false : stryMutAct_9fa48("1150") ? true : (stryCov_9fa48("1150", "1151"), stockText)) {
            if (stryMutAct_9fa48("1152")) {
              {}
            } else {
              stryCov_9fa48("1152");
              return this.normalizeStockText(stockText);
            }
          }
        }
      }
      return stryMutAct_9fa48("1153") ? "" : (stryCov_9fa48("1153"), 'instock'); // Default
    }
  }

  /**
   * Extract stock status from a selector that can be either a string or array of strings
   */
  private extractStockStatusFromSelector(dom: JSDOM, selector: string | string[]): string {
    if (stryMutAct_9fa48("1154")) {
      {}
    } else {
      stryCov_9fa48("1154");
      if (stryMutAct_9fa48("1156") ? false : stryMutAct_9fa48("1155") ? true : (stryCov_9fa48("1155", "1156"), Array.isArray(selector))) {
        if (stryMutAct_9fa48("1157")) {
          {}
        } else {
          stryCov_9fa48("1157");
          // Try each selector until one works
          for (const sel of selector) {
            if (stryMutAct_9fa48("1158")) {
              {}
            } else {
              stryCov_9fa48("1158");
              const status = this.extractStockStatus(dom, sel);
              if (stryMutAct_9fa48("1161") ? status || status.trim() : stryMutAct_9fa48("1160") ? false : stryMutAct_9fa48("1159") ? true : (stryCov_9fa48("1159", "1160", "1161"), status && (stryMutAct_9fa48("1162") ? status : (stryCov_9fa48("1162"), status.trim())))) {
                if (stryMutAct_9fa48("1163")) {
                  {}
                } else {
                  stryCov_9fa48("1163");
                  return status;
                }
              }
            }
          }
          return stryMutAct_9fa48("1164") ? "" : (stryCov_9fa48("1164"), 'instock');
        }
      }
      return this.extractStockStatus(dom, selector);
    }
  }

  /**
   * Extract images from a selector that can be either a string or array of strings
   */
  private extractImagesFromSelector(dom: JSDOM, selector: string | string[]): string[] {
    if (stryMutAct_9fa48("1165")) {
      {}
    } else {
      stryCov_9fa48("1165");
      if (stryMutAct_9fa48("1167") ? false : stryMutAct_9fa48("1166") ? true : (stryCov_9fa48("1166", "1167"), Array.isArray(selector))) {
        if (stryMutAct_9fa48("1168")) {
          {}
        } else {
          stryCov_9fa48("1168");
          // Try each selector until one works
          for (const sel of selector) {
            if (stryMutAct_9fa48("1169")) {
              {}
            } else {
              stryCov_9fa48("1169");
              const images = this.extractImages(dom, sel);
              if (stryMutAct_9fa48("1172") ? images || images.length > 0 : stryMutAct_9fa48("1171") ? false : stryMutAct_9fa48("1170") ? true : (stryCov_9fa48("1170", "1171", "1172"), images && (stryMutAct_9fa48("1175") ? images.length <= 0 : stryMutAct_9fa48("1174") ? images.length >= 0 : stryMutAct_9fa48("1173") ? true : (stryCov_9fa48("1173", "1174", "1175"), images.length > 0)))) {
                if (stryMutAct_9fa48("1176")) {
                  {}
                } else {
                  stryCov_9fa48("1176");
                  return images;
                }
              }
            }
          }
          return stryMutAct_9fa48("1177") ? ["Stryker was here"] : (stryCov_9fa48("1177"), []);
        }
      }
      return this.extractImages(dom, selector);
    }
  }

  /**
   * Extract attributes from a selector that can be either a string or array of strings
   */
  private extractAttributesFromSelector(dom: JSDOM, selector: string | string[]): Record<string, string[]> {
    if (stryMutAct_9fa48("1178")) {
      {}
    } else {
      stryCov_9fa48("1178");
      if (stryMutAct_9fa48("1180") ? false : stryMutAct_9fa48("1179") ? true : (stryCov_9fa48("1179", "1180"), Array.isArray(selector))) {
        if (stryMutAct_9fa48("1181")) {
          {}
        } else {
          stryCov_9fa48("1181");
          // Try each selector until one works
          for (const sel of selector) {
            if (stryMutAct_9fa48("1182")) {
              {}
            } else {
              stryCov_9fa48("1182");
              const attrs = this.extractAttributes(dom, sel);
              if (stryMutAct_9fa48("1185") ? attrs || Object.keys(attrs).length > 0 : stryMutAct_9fa48("1184") ? false : stryMutAct_9fa48("1183") ? true : (stryCov_9fa48("1183", "1184", "1185"), attrs && (stryMutAct_9fa48("1188") ? Object.keys(attrs).length <= 0 : stryMutAct_9fa48("1187") ? Object.keys(attrs).length >= 0 : stryMutAct_9fa48("1186") ? true : (stryCov_9fa48("1186", "1187", "1188"), Object.keys(attrs).length > 0)))) {
                if (stryMutAct_9fa48("1189")) {
                  {}
                } else {
                  stryCov_9fa48("1189");
                  return attrs;
                }
              }
            }
          }
          return {};
        }
      }
      return this.extractAttributes(dom, selector);
    }
  }

  /**
   * Extract variations from a selector that can be either a string or array of strings
   */
  private extractVariationsFromSelector(dom: JSDOM, selector: string | string[]): RawProduct['variations'] {
    if (stryMutAct_9fa48("1190")) {
      {}
    } else {
      stryCov_9fa48("1190");
      if (stryMutAct_9fa48("1192") ? false : stryMutAct_9fa48("1191") ? true : (stryCov_9fa48("1191", "1192"), Array.isArray(selector))) {
        if (stryMutAct_9fa48("1193")) {
          {}
        } else {
          stryCov_9fa48("1193");
          // Try each selector until one works
          for (const sel of selector) {
            if (stryMutAct_9fa48("1194")) {
              {}
            } else {
              stryCov_9fa48("1194");
              const variations = this.extractVariations(dom, sel);
              if (stryMutAct_9fa48("1197") ? variations || variations.length > 0 : stryMutAct_9fa48("1196") ? false : stryMutAct_9fa48("1195") ? true : (stryCov_9fa48("1195", "1196", "1197"), variations && (stryMutAct_9fa48("1200") ? variations.length <= 0 : stryMutAct_9fa48("1199") ? variations.length >= 0 : stryMutAct_9fa48("1198") ? true : (stryCov_9fa48("1198", "1199", "1200"), variations.length > 0)))) {
                if (stryMutAct_9fa48("1201")) {
                  {}
                } else {
                  stryCov_9fa48("1201");
                  return variations;
                }
              }
            }
          }
          return stryMutAct_9fa48("1202") ? ["Stryker was here"] : (stryCov_9fa48("1202"), []);
        }
      }
      return this.extractVariations(dom, selector);
    }
  }

  /**
   * Extract price from a selector that can be either a string or array of strings
   */
  private extractPriceFromSelector(dom: JSDOM, selector: string | string[]): string {
    if (stryMutAct_9fa48("1203")) {
      {}
    } else {
      stryCov_9fa48("1203");
      if (stryMutAct_9fa48("1205") ? false : stryMutAct_9fa48("1204") ? true : (stryCov_9fa48("1204", "1205"), Array.isArray(selector))) {
        if (stryMutAct_9fa48("1206")) {
          {}
        } else {
          stryCov_9fa48("1206");
          // Try each selector until one works
          for (const sel of selector) {
            if (stryMutAct_9fa48("1207")) {
              {}
            } else {
              stryCov_9fa48("1207");
              const price = this.extractPrice(dom, sel);
              if (stryMutAct_9fa48("1210") ? price || price.trim() : stryMutAct_9fa48("1209") ? false : stryMutAct_9fa48("1208") ? true : (stryCov_9fa48("1208", "1209", "1210"), price && (stryMutAct_9fa48("1211") ? price : (stryCov_9fa48("1211"), price.trim())))) {
                if (stryMutAct_9fa48("1212")) {
                  {}
                } else {
                  stryCov_9fa48("1212");
                  return price;
                }
              }
            }
          }
          return stryMutAct_9fa48("1213") ? "Stryker was here!" : (stryCov_9fa48("1213"), '');
        }
      }
      return this.extractPrice(dom, selector);
    }
  }

  /**
   * Extract attributes using the configured selector
   */
  protected override extractAttributes(dom: JSDOM, selector: string | string[]): Record<string, string[]> {
    if (stryMutAct_9fa48("1214")) {
      {}
    } else {
      stryCov_9fa48("1214");
      const selectorArray = Array.isArray(selector) ? selector : stryMutAct_9fa48("1215") ? [] : (stryCov_9fa48("1215"), [selector]);
      const attributes: Record<string, string[]> = {};
      for (const sel of selectorArray) {
        if (stryMutAct_9fa48("1216")) {
          {}
        } else {
          stryCov_9fa48("1216");
          const attributeElements = this.extractElements(dom, sel);
          if (stryMutAct_9fa48("1220") ? attributeElements.length <= 0 : stryMutAct_9fa48("1219") ? attributeElements.length >= 0 : stryMutAct_9fa48("1218") ? false : stryMutAct_9fa48("1217") ? true : (stryCov_9fa48("1217", "1218", "1219", "1220"), attributeElements.length > 0)) {
            if (stryMutAct_9fa48("1221")) {
              {}
            } else {
              stryCov_9fa48("1221");
              for (const element of attributeElements) {
                if (stryMutAct_9fa48("1222")) {
                  {}
                } else {
                  stryCov_9fa48("1222");
                  // Case 1: Structured name/value nodes present
                  const nameElement = element.querySelector(stryMutAct_9fa48("1223") ? "" : (stryCov_9fa48("1223"), '[data-attribute-name], .attribute-name, .attr-name, .option-name'));
                  const valueElements = element.querySelectorAll(stryMutAct_9fa48("1224") ? "" : (stryCov_9fa48("1224"), '[data-attribute-value], .attribute-value, .attr-value, .option-value'));
                  if (stryMutAct_9fa48("1227") ? nameElement || valueElements.length > 0 : stryMutAct_9fa48("1226") ? false : stryMutAct_9fa48("1225") ? true : (stryCov_9fa48("1225", "1226", "1227"), nameElement && (stryMutAct_9fa48("1230") ? valueElements.length <= 0 : stryMutAct_9fa48("1229") ? valueElements.length >= 0 : stryMutAct_9fa48("1228") ? true : (stryCov_9fa48("1228", "1229", "1230"), valueElements.length > 0)))) {
                    if (stryMutAct_9fa48("1231")) {
                      {}
                    } else {
                      stryCov_9fa48("1231");
                      const name = stryMutAct_9fa48("1234") ? nameElement.textContent?.trim() && '' : stryMutAct_9fa48("1233") ? false : stryMutAct_9fa48("1232") ? true : (stryCov_9fa48("1232", "1233", "1234"), (stryMutAct_9fa48("1236") ? nameElement.textContent.trim() : stryMutAct_9fa48("1235") ? nameElement.textContent : (stryCov_9fa48("1235", "1236"), nameElement.textContent?.trim())) || (stryMutAct_9fa48("1237") ? "Stryker was here!" : (stryCov_9fa48("1237"), '')));
                      const values = stryMutAct_9fa48("1238") ? Array.from(valueElements).map(val => (val as Element).textContent?.trim()) : (stryCov_9fa48("1238"), Array.from(valueElements).map(stryMutAct_9fa48("1239") ? () => undefined : (stryCov_9fa48("1239"), val => stryMutAct_9fa48("1241") ? (val as Element).textContent.trim() : stryMutAct_9fa48("1240") ? (val as Element).textContent : (stryCov_9fa48("1240", "1241"), (val as Element).textContent?.trim()))).filter(stryMutAct_9fa48("1242") ? () => undefined : (stryCov_9fa48("1242"), (val): val is string => stryMutAct_9fa48("1245") ? val !== undefined || !this.isPlaceholderValue(val) : stryMutAct_9fa48("1244") ? false : stryMutAct_9fa48("1243") ? true : (stryCov_9fa48("1243", "1244", "1245"), (stryMutAct_9fa48("1247") ? val === undefined : stryMutAct_9fa48("1246") ? true : (stryCov_9fa48("1246", "1247"), val !== undefined)) && (stryMutAct_9fa48("1248") ? this.isPlaceholderValue(val) : (stryCov_9fa48("1248"), !this.isPlaceholderValue(val)))))));
                      if (stryMutAct_9fa48("1251") ? name || values.length > 0 : stryMutAct_9fa48("1250") ? false : stryMutAct_9fa48("1249") ? true : (stryCov_9fa48("1249", "1250", "1251"), name && (stryMutAct_9fa48("1254") ? values.length <= 0 : stryMutAct_9fa48("1253") ? values.length >= 0 : stryMutAct_9fa48("1252") ? true : (stryCov_9fa48("1252", "1253", "1254"), values.length > 0)))) {
                        if (stryMutAct_9fa48("1255")) {
                          {}
                        } else {
                          stryCov_9fa48("1255");
                          attributes[name] = values;
                        }
                      }
                    }
                  }

                  // Case 2: WooCommerce selects (no explicit name node)
                  const selectNodes = element.querySelectorAll(stryMutAct_9fa48("1256") ? "" : (stryCov_9fa48("1256"), 'select[name*="attribute"], select[name*="pa_"], select[class*="attribute"], .variations select'));
                  for (const select of Array.from(selectNodes)) {
                    if (stryMutAct_9fa48("1257")) {
                      {}
                    } else {
                      stryCov_9fa48("1257");
                      const rawName = stryMutAct_9fa48("1260") ? (select.getAttribute('name') || select.getAttribute('data-attribute')) && '' : stryMutAct_9fa48("1259") ? false : stryMutAct_9fa48("1258") ? true : (stryCov_9fa48("1258", "1259", "1260"), (stryMutAct_9fa48("1262") ? select.getAttribute('name') && select.getAttribute('data-attribute') : stryMutAct_9fa48("1261") ? false : (stryCov_9fa48("1261", "1262"), select.getAttribute(stryMutAct_9fa48("1263") ? "" : (stryCov_9fa48("1263"), 'name')) || select.getAttribute(stryMutAct_9fa48("1264") ? "" : (stryCov_9fa48("1264"), 'data-attribute')))) || (stryMutAct_9fa48("1265") ? "Stryker was here!" : (stryCov_9fa48("1265"), '')));
                      if (stryMutAct_9fa48("1268") ? false : stryMutAct_9fa48("1267") ? true : stryMutAct_9fa48("1266") ? rawName : (stryCov_9fa48("1266", "1267", "1268"), !rawName)) continue;
                      // Derive display name: attribute_pa_color -> Color; attribute_size -> Size
                      const nameClean = stryMutAct_9fa48("1269") ? rawName.replace(/^attribute_/i, '').replace(/^pa_/i, '').replace(/[_-]+/g, ' ') : (stryCov_9fa48("1269"), rawName.replace(stryMutAct_9fa48("1270") ? /attribute_/i : (stryCov_9fa48("1270"), /^attribute_/i), stryMutAct_9fa48("1271") ? "Stryker was here!" : (stryCov_9fa48("1271"), '')).replace(stryMutAct_9fa48("1272") ? /pa_/i : (stryCov_9fa48("1272"), /^pa_/i), stryMutAct_9fa48("1273") ? "Stryker was here!" : (stryCov_9fa48("1273"), '')).replace(stryMutAct_9fa48("1275") ? /[^_-]+/g : stryMutAct_9fa48("1274") ? /[_-]/g : (stryCov_9fa48("1274", "1275"), /[_-]+/g), stryMutAct_9fa48("1276") ? "" : (stryCov_9fa48("1276"), ' ')).trim());
                      const displayName = nameClean.replace(stryMutAct_9fa48("1277") ? /\b\W/g : (stryCov_9fa48("1277"), /\b\w/g), stryMutAct_9fa48("1278") ? () => undefined : (stryCov_9fa48("1278"), c => stryMutAct_9fa48("1279") ? c.toLowerCase() : (stryCov_9fa48("1279"), c.toUpperCase())));
                      const options = Array.from(select.querySelectorAll('option')) as HTMLOptionElement[];
                      const values = stryMutAct_9fa48("1280") ? options.map(o => (o.textContent || '').trim()) : (stryCov_9fa48("1280"), options.map(stryMutAct_9fa48("1281") ? () => undefined : (stryCov_9fa48("1281"), o => stryMutAct_9fa48("1282") ? o.textContent || '' : (stryCov_9fa48("1282"), (stryMutAct_9fa48("1285") ? o.textContent && '' : stryMutAct_9fa48("1284") ? false : stryMutAct_9fa48("1283") ? true : (stryCov_9fa48("1283", "1284", "1285"), o.textContent || (stryMutAct_9fa48("1286") ? "Stryker was here!" : (stryCov_9fa48("1286"), '')))).trim()))).filter(stryMutAct_9fa48("1287") ? () => undefined : (stryCov_9fa48("1287"), v => stryMutAct_9fa48("1290") ? v || !this.isPlaceholderValue(v) : stryMutAct_9fa48("1289") ? false : stryMutAct_9fa48("1288") ? true : (stryCov_9fa48("1288", "1289", "1290"), v && (stryMutAct_9fa48("1291") ? this.isPlaceholderValue(v) : (stryCov_9fa48("1291"), !this.isPlaceholderValue(v)))))));
                      if (stryMutAct_9fa48("1294") ? displayName || values.length > 0 : stryMutAct_9fa48("1293") ? false : stryMutAct_9fa48("1292") ? true : (stryCov_9fa48("1292", "1293", "1294"), displayName && (stryMutAct_9fa48("1297") ? values.length <= 0 : stryMutAct_9fa48("1296") ? values.length >= 0 : stryMutAct_9fa48("1295") ? true : (stryCov_9fa48("1295", "1296", "1297"), values.length > 0)))) {
                        if (stryMutAct_9fa48("1298")) {
                          {}
                        } else {
                          stryCov_9fa48("1298");
                          const existing = stryMutAct_9fa48("1301") ? attributes[displayName] && [] : stryMutAct_9fa48("1300") ? false : stryMutAct_9fa48("1299") ? true : (stryCov_9fa48("1299", "1300", "1301"), attributes[displayName] || (stryMutAct_9fa48("1302") ? ["Stryker was here"] : (stryCov_9fa48("1302"), [])));
                          attributes[displayName] = Array.from(new Set(stryMutAct_9fa48("1303") ? [] : (stryCov_9fa48("1303"), [...existing, ...values])));
                        }
                      }
                    }
                  }
                }
              }
              break; // Use first successful selector
            }
          }
        }
      }
      return attributes;
    }
  }

  /**
   * Extract variations using the configured selector - improved for WooCommerce
   */
  protected override extractVariations(dom: JSDOM, selector?: string | string[]): RawVariation[] {
    if (stryMutAct_9fa48("1304")) {
      {}
    } else {
      stryCov_9fa48("1304");
      if (stryMutAct_9fa48("1307") ? false : stryMutAct_9fa48("1306") ? true : stryMutAct_9fa48("1305") ? selector : (stryCov_9fa48("1305", "1306", "1307"), !selector)) return stryMutAct_9fa48("1308") ? ["Stryker was here"] : (stryCov_9fa48("1308"), []);
      const selectorArray = Array.isArray(selector) ? selector : stryMutAct_9fa48("1309") ? [] : (stryCov_9fa48("1309"), [selector]);
      const variations: RawVariation[] = stryMutAct_9fa48("1310") ? ["Stryker was here"] : (stryCov_9fa48("1310"), []);

      // 0) Shopify: parse variants from Product JSON embedded in the page
      try {
        if (stryMutAct_9fa48("1311")) {
          {}
        } else {
          stryCov_9fa48("1311");
          // Common Shopify script patterns - including the meta script pattern
          const scriptCandidates = [
          // Add the meta script pattern that contains variant data FIRST (most comprehensive)
          ...Array.from(dom.window.document.querySelectorAll('script:not([id]):not([type])')), ...Array.from(dom.window.document.querySelectorAll('script[id^=\'ProductJson\']')), ...Array.from(dom.window.document.querySelectorAll('script[type=\'application/ld+json\']')), ...Array.from(dom.window.document.querySelectorAll('script[type=\'application/json\']'))] as HTMLScriptElement[];
          for (const script of scriptCandidates) {
            if (stryMutAct_9fa48("1312")) {
              {}
            } else {
              stryCov_9fa48("1312");
              const raw = stryMutAct_9fa48("1314") ? script.textContent.trim() : stryMutAct_9fa48("1313") ? script.textContent : (stryCov_9fa48("1313", "1314"), script.textContent?.trim());
              if (stryMutAct_9fa48("1317") ? false : stryMutAct_9fa48("1316") ? true : stryMutAct_9fa48("1315") ? raw : (stryCov_9fa48("1315", "1316", "1317"), !raw)) continue;

              // Try to find the meta script pattern: var meta = {...}
              if (stryMutAct_9fa48("1320") ? raw.includes('var meta =') || raw.includes('variants') : stryMutAct_9fa48("1319") ? false : stryMutAct_9fa48("1318") ? true : (stryCov_9fa48("1318", "1319", "1320"), raw.includes(stryMutAct_9fa48("1321") ? "" : (stryCov_9fa48("1321"), 'var meta =')) && raw.includes(stryMutAct_9fa48("1322") ? "" : (stryCov_9fa48("1322"), 'variants')))) {
                if (stryMutAct_9fa48("1323")) {
                  {}
                } else {
                  stryCov_9fa48("1323");
                  try {
                    if (stryMutAct_9fa48("1324")) {
                      {}
                    } else {
                      stryCov_9fa48("1324");
                      // Extract the JSON part after "var meta ="
                      const metaMatch = raw.match(stryMutAct_9fa48("1329") ? /var meta\s*=\s*({.});/s : stryMutAct_9fa48("1328") ? /var meta\s*=\S*({.*?});/s : stryMutAct_9fa48("1327") ? /var meta\s*=\s({.*?});/s : stryMutAct_9fa48("1326") ? /var meta\S*=\s*({.*?});/s : stryMutAct_9fa48("1325") ? /var meta\s=\s*({.*?});/s : (stryCov_9fa48("1325", "1326", "1327", "1328", "1329"), /var meta\s*=\s*({.*?});/s));
                      if (stryMutAct_9fa48("1332") ? metaMatch || metaMatch[1] : stryMutAct_9fa48("1331") ? false : stryMutAct_9fa48("1330") ? true : (stryCov_9fa48("1330", "1331", "1332"), metaMatch && metaMatch[1])) {
                        if (stryMutAct_9fa48("1333")) {
                          {}
                        } else {
                          stryCov_9fa48("1333");
                          const json = JSON.parse(metaMatch[1]);

                          // Check if this has product variants
                          if (stryMutAct_9fa48("1336") ? json?.product?.variants || Array.isArray(json.product.variants) : stryMutAct_9fa48("1335") ? false : stryMutAct_9fa48("1334") ? true : (stryCov_9fa48("1334", "1335", "1336"), (stryMutAct_9fa48("1338") ? json.product?.variants : stryMutAct_9fa48("1337") ? json?.product.variants : (stryCov_9fa48("1337", "1338"), json?.product?.variants)) && Array.isArray(json.product.variants))) {
                            if (stryMutAct_9fa48("1339")) {
                              {}
                            } else {
                              stryCov_9fa48("1339");
                              const variants = json.product.variants;
                              if (stryMutAct_9fa48("1342") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("1341") ? false : stryMutAct_9fa48("1340") ? true : (stryCov_9fa48("1340", "1341", "1342"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("1343") ? "" : (stryCov_9fa48("1343"), '1')))) console.log(stryMutAct_9fa48("1344") ? `` : (stryCov_9fa48("1344"), `[extractVariations] Found ${variants.length} variants in meta script`));
                              for (const v of variants) {
                                if (stryMutAct_9fa48("1345")) {
                                  {}
                                } else {
                                  stryCov_9fa48("1345");
                                  const price = (stryMutAct_9fa48("1346") ? v.price * 100 : (stryCov_9fa48("1346"), v.price / 100)).toString(); // Shopify prices are in cents
                                  const stockStatus = (stryMutAct_9fa48("1349") ? v.available !== false : stryMutAct_9fa48("1348") ? false : stryMutAct_9fa48("1347") ? true : (stryCov_9fa48("1347", "1348", "1349"), v.available === (stryMutAct_9fa48("1350") ? true : (stryCov_9fa48("1350"), false)))) ? stryMutAct_9fa48("1351") ? "" : (stryCov_9fa48("1351"), 'outofstock') : stryMutAct_9fa48("1352") ? "" : (stryCov_9fa48("1352"), 'instock');
                                  const images: string[] = stryMutAct_9fa48("1353") ? ["Stryker was here"] : (stryCov_9fa48("1353"), []);

                                  // Extract variant-specific images if available
                                  if (stryMutAct_9fa48("1356") ? v.featured_image || v.featured_image.src || v.featured_image.url : stryMutAct_9fa48("1355") ? false : stryMutAct_9fa48("1354") ? true : (stryCov_9fa48("1354", "1355", "1356"), v.featured_image && (stryMutAct_9fa48("1358") ? v.featured_image.src && v.featured_image.url : stryMutAct_9fa48("1357") ? true : (stryCov_9fa48("1357", "1358"), v.featured_image.src || v.featured_image.url)))) {
                                    if (stryMutAct_9fa48("1359")) {
                                      {}
                                    } else {
                                      stryCov_9fa48("1359");
                                      images.push(stryMutAct_9fa48("1362") ? v.featured_image.url && v.featured_image.src : stryMutAct_9fa48("1361") ? false : stryMutAct_9fa48("1360") ? true : (stryCov_9fa48("1360", "1361", "1362"), v.featured_image.url || v.featured_image.src));
                                    }
                                  }
                                  variations.push(stryMutAct_9fa48("1363") ? {} : (stryCov_9fa48("1363"), {
                                    sku: stryMutAct_9fa48("1366") ? ((v.sku || '').toString() || this.extractVariantSkuFromLinks(dom, v.id)) && 'SKU' : stryMutAct_9fa48("1365") ? false : stryMutAct_9fa48("1364") ? true : (stryCov_9fa48("1364", "1365", "1366"), (stryMutAct_9fa48("1368") ? (v.sku || '').toString() && this.extractVariantSkuFromLinks(dom, v.id) : stryMutAct_9fa48("1367") ? false : (stryCov_9fa48("1367", "1368"), (stryMutAct_9fa48("1371") ? v.sku && '' : stryMutAct_9fa48("1370") ? false : stryMutAct_9fa48("1369") ? true : (stryCov_9fa48("1369", "1370", "1371"), v.sku || (stryMutAct_9fa48("1372") ? "Stryker was here!" : (stryCov_9fa48("1372"), '')))).toString() || this.extractVariantSkuFromLinks(dom, v.id))) || (stryMutAct_9fa48("1373") ? "" : (stryCov_9fa48("1373"), 'SKU'))),
                                    regularPrice: price,
                                    salePrice: stryMutAct_9fa48("1374") ? "Stryker was here!" : (stryCov_9fa48("1374"), ''),
                                    taxClass: stryMutAct_9fa48("1375") ? "Stryker was here!" : (stryCov_9fa48("1375"), ''),
                                    stockStatus,
                                    images,
                                    attributeAssignments: stryMutAct_9fa48("1376") ? {} : (stryCov_9fa48("1376"), {
                                      Size: stryMutAct_9fa48("1379") ? (v.public_title || v.title || v.option1) && '' : stryMutAct_9fa48("1378") ? false : stryMutAct_9fa48("1377") ? true : (stryCov_9fa48("1377", "1378", "1379"), (stryMutAct_9fa48("1381") ? (v.public_title || v.title) && v.option1 : stryMutAct_9fa48("1380") ? false : (stryCov_9fa48("1380", "1381"), (stryMutAct_9fa48("1383") ? v.public_title && v.title : stryMutAct_9fa48("1382") ? false : (stryCov_9fa48("1382", "1383"), v.public_title || v.title)) || v.option1)) || (stryMutAct_9fa48("1384") ? "Stryker was here!" : (stryCov_9fa48("1384"), '')))
                                    })
                                  }));
                                }
                              }
                              if (stryMutAct_9fa48("1388") ? variations.length <= 0 : stryMutAct_9fa48("1387") ? variations.length >= 0 : stryMutAct_9fa48("1386") ? false : stryMutAct_9fa48("1385") ? true : (stryCov_9fa48("1385", "1386", "1387", "1388"), variations.length > 0)) {
                                if (stryMutAct_9fa48("1389")) {
                                  {}
                                } else {
                                  stryCov_9fa48("1389");
                                  if (stryMutAct_9fa48("1392") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("1391") ? false : stryMutAct_9fa48("1390") ? true : (stryCov_9fa48("1390", "1391", "1392"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("1393") ? "" : (stryCov_9fa48("1393"), '1')))) console.log(stryMutAct_9fa48("1394") ? `` : (stryCov_9fa48("1394"), `Extracted ${variations.length} variations from Shopify meta script`));
                                  return variations;
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  } catch (e) {
                    if (stryMutAct_9fa48("1395")) {
                      {}
                    } else {
                      stryCov_9fa48("1395");
                      if (stryMutAct_9fa48("1398") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("1397") ? false : stryMutAct_9fa48("1396") ? true : (stryCov_9fa48("1396", "1397", "1398"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("1399") ? "" : (stryCov_9fa48("1399"), '1')))) console.log(stryMutAct_9fa48("1400") ? "" : (stryCov_9fa48("1400"), '[extractVariations] Failed to parse meta script variants:'), e);
                    }
                  }
                }
              }
              let json: Record<string, unknown>;
              try {
                if (stryMutAct_9fa48("1401")) {
                  {}
                } else {
                  stryCov_9fa48("1401");
                  json = JSON.parse(raw);
                }
              } catch {
                if (stryMutAct_9fa48("1402")) {
                  {}
                } else {
                  stryCov_9fa48("1402");
                  // Some themes wrap multiple JSON objects or arrays; try to find an object with variants
                  continue;
                }
              }

              // Case A: Direct Shopify product JSON with variants
              if (stryMutAct_9fa48("1405") ? json || Array.isArray(json.variants) : stryMutAct_9fa48("1404") ? false : stryMutAct_9fa48("1403") ? true : (stryCov_9fa48("1403", "1404", "1405"), json && Array.isArray(json.variants))) {
                if (stryMutAct_9fa48("1406")) {
                  {}
                } else {
                  stryCov_9fa48("1406");
                  const optionNames: string[] = Array.isArray(json.options) ? stryMutAct_9fa48("1407") ? json.options.map((o: Record<string, unknown>) => typeof o === 'string' ? o : o?.name as string) : (stryCov_9fa48("1407"), json.options.map(stryMutAct_9fa48("1408") ? () => undefined : (stryCov_9fa48("1408"), (o: Record<string, unknown>) => (stryMutAct_9fa48("1411") ? typeof o !== 'string' : stryMutAct_9fa48("1410") ? false : stryMutAct_9fa48("1409") ? true : (stryCov_9fa48("1409", "1410", "1411"), typeof o === (stryMutAct_9fa48("1412") ? "" : (stryCov_9fa48("1412"), 'string')))) ? o : o?.name as string)).filter(stryMutAct_9fa48("1413") ? () => undefined : (stryCov_9fa48("1413"), (n: string) => stryMutAct_9fa48("1414") ? !n : (stryCov_9fa48("1414"), !(stryMutAct_9fa48("1415") ? n : (stryCov_9fa48("1415"), !n)))))) : stryMutAct_9fa48("1416") ? ["Stryker was here"] : (stryCov_9fa48("1416"), []);
                  for (const v of json.variants) {
                    if (stryMutAct_9fa48("1417")) {
                      {}
                    } else {
                      stryCov_9fa48("1417");
                      const attributeAssignments: Record<string, string> = {};
                      const opts = stryMutAct_9fa48("1418") ? [v.option1, v.option2, v.option3] : (stryCov_9fa48("1418"), (stryMutAct_9fa48("1419") ? [] : (stryCov_9fa48("1419"), [v.option1, v.option2, v.option3])).filter(stryMutAct_9fa48("1420") ? () => undefined : (stryCov_9fa48("1420"), (x: unknown) => stryMutAct_9fa48("1423") ? typeof x !== 'string' : stryMutAct_9fa48("1422") ? false : stryMutAct_9fa48("1421") ? true : (stryCov_9fa48("1421", "1422", "1423"), typeof x === (stryMutAct_9fa48("1424") ? "" : (stryCov_9fa48("1424"), 'string'))))));
                      for (let i = 0; stryMutAct_9fa48("1427") ? i >= opts.length : stryMutAct_9fa48("1426") ? i <= opts.length : stryMutAct_9fa48("1425") ? false : (stryCov_9fa48("1425", "1426", "1427"), i < opts.length); stryMutAct_9fa48("1428") ? i-- : (stryCov_9fa48("1428"), i++)) {
                        if (stryMutAct_9fa48("1429")) {
                          {}
                        } else {
                          stryCov_9fa48("1429");
                          const key = stryMutAct_9fa48("1432") ? optionNames[i] && `option${i + 1}` : stryMutAct_9fa48("1431") ? false : stryMutAct_9fa48("1430") ? true : (stryCov_9fa48("1430", "1431", "1432"), optionNames[i] || (stryMutAct_9fa48("1433") ? `` : (stryCov_9fa48("1433"), `option${stryMutAct_9fa48("1434") ? i - 1 : (stryCov_9fa48("1434"), i + 1)}`)));
                          attributeAssignments[key] = opts[i];
                        }
                      }
                      const price = (stryMutAct_9fa48("1435") ? (v.price ?? v.compare_at_price) && '' : (stryCov_9fa48("1435"), (stryMutAct_9fa48("1436") ? v.price && v.compare_at_price : (stryCov_9fa48("1436"), v.price ?? v.compare_at_price)) ?? (stryMutAct_9fa48("1437") ? "Stryker was here!" : (stryCov_9fa48("1437"), '')))).toString();
                      const sale = (stryMutAct_9fa48("1438") ? v.compare_at_price && '' : (stryCov_9fa48("1438"), v.compare_at_price ?? (stryMutAct_9fa48("1439") ? "Stryker was here!" : (stryCov_9fa48("1439"), '')))).toString();
                      const stockStatus = (stryMutAct_9fa48("1442") ? v.available !== false : stryMutAct_9fa48("1441") ? false : stryMutAct_9fa48("1440") ? true : (stryCov_9fa48("1440", "1441", "1442"), v.available === (stryMutAct_9fa48("1443") ? true : (stryCov_9fa48("1443"), false)))) ? stryMutAct_9fa48("1444") ? "" : (stryCov_9fa48("1444"), 'outofstock') : stryMutAct_9fa48("1445") ? "" : (stryCov_9fa48("1445"), 'instock');
                      const images: string[] = stryMutAct_9fa48("1446") ? ["Stryker was here"] : (stryCov_9fa48("1446"), []);
                      if (stryMutAct_9fa48("1449") ? v.featured_image || v.featured_image.src || v.featured_image.url : stryMutAct_9fa48("1448") ? false : stryMutAct_9fa48("1447") ? true : (stryCov_9fa48("1447", "1448", "1449"), v.featured_image && (stryMutAct_9fa48("1451") ? v.featured_image.src && v.featured_image.url : stryMutAct_9fa48("1450") ? true : (stryCov_9fa48("1450", "1451"), v.featured_image.src || v.featured_image.url)))) {
                        if (stryMutAct_9fa48("1452")) {
                          {}
                        } else {
                          stryCov_9fa48("1452");
                          images.push(stryMutAct_9fa48("1455") ? v.featured_image.url && v.featured_image.src : stryMutAct_9fa48("1454") ? false : stryMutAct_9fa48("1453") ? true : (stryCov_9fa48("1453", "1454", "1455"), v.featured_image.url || v.featured_image.src));
                        }
                      }
                      variations.push(stryMutAct_9fa48("1456") ? {} : (stryCov_9fa48("1456"), {
                        // Try explicit SKU; fallback to variant URL query param SKU
                        sku: stryMutAct_9fa48("1459") ? ((v.sku || '').toString() || this.extractVariantSkuFromLinks(dom, v.id) || this.extractText(dom, '.sku, [data-sku], .product-sku')) && 'SKU' : stryMutAct_9fa48("1458") ? false : stryMutAct_9fa48("1457") ? true : (stryCov_9fa48("1457", "1458", "1459"), (stryMutAct_9fa48("1461") ? ((v.sku || '').toString() || this.extractVariantSkuFromLinks(dom, v.id)) && this.extractText(dom, '.sku, [data-sku], .product-sku') : stryMutAct_9fa48("1460") ? false : (stryCov_9fa48("1460", "1461"), (stryMutAct_9fa48("1463") ? (v.sku || '').toString() && this.extractVariantSkuFromLinks(dom, v.id) : stryMutAct_9fa48("1462") ? false : (stryCov_9fa48("1462", "1463"), (stryMutAct_9fa48("1466") ? v.sku && '' : stryMutAct_9fa48("1465") ? false : stryMutAct_9fa48("1464") ? true : (stryCov_9fa48("1464", "1465", "1466"), v.sku || (stryMutAct_9fa48("1467") ? "Stryker was here!" : (stryCov_9fa48("1467"), '')))).toString() || this.extractVariantSkuFromLinks(dom, v.id))) || this.extractText(dom, stryMutAct_9fa48("1468") ? "" : (stryCov_9fa48("1468"), '.sku, [data-sku], .product-sku')))) || (stryMutAct_9fa48("1469") ? "" : (stryCov_9fa48("1469"), 'SKU'))),
                        regularPrice: price,
                        salePrice: sale,
                        taxClass: stryMutAct_9fa48("1470") ? "Stryker was here!" : (stryCov_9fa48("1470"), ''),
                        stockStatus,
                        images,
                        attributeAssignments
                      }));
                    }
                  }
                  if (stryMutAct_9fa48("1474") ? variations.length <= 0 : stryMutAct_9fa48("1473") ? variations.length >= 0 : stryMutAct_9fa48("1472") ? false : stryMutAct_9fa48("1471") ? true : (stryCov_9fa48("1471", "1472", "1473", "1474"), variations.length > 0)) {
                    if (stryMutAct_9fa48("1475")) {
                      {}
                    } else {
                      stryCov_9fa48("1475");
                      if (stryMutAct_9fa48("1478") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("1477") ? false : stryMutAct_9fa48("1476") ? true : (stryCov_9fa48("1476", "1477", "1478"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("1479") ? "" : (stryCov_9fa48("1479"), '1')))) console.log(stryMutAct_9fa48("1480") ? `` : (stryCov_9fa48("1480"), `Extracted ${variations.length} variations from Shopify Product JSON`));
                      return variations;
                    }
                  }
                }
              }

              // Case B: LD+JSON with Product/offers (can be single or array)
              if (stryMutAct_9fa48("1483") ? json || json['@type'] === 'Product' || Array.isArray(json['@graph']) && json['@graph'].some((g: Record<string, unknown>) => g['@type'] === 'Product') : stryMutAct_9fa48("1482") ? false : stryMutAct_9fa48("1481") ? true : (stryCov_9fa48("1481", "1482", "1483"), json && (stryMutAct_9fa48("1485") ? json['@type'] === 'Product' && Array.isArray(json['@graph']) && json['@graph'].some((g: Record<string, unknown>) => g['@type'] === 'Product') : stryMutAct_9fa48("1484") ? true : (stryCov_9fa48("1484", "1485"), (stryMutAct_9fa48("1487") ? json['@type'] !== 'Product' : stryMutAct_9fa48("1486") ? false : (stryCov_9fa48("1486", "1487"), json[stryMutAct_9fa48("1488") ? "" : (stryCov_9fa48("1488"), '@type')] === (stryMutAct_9fa48("1489") ? "" : (stryCov_9fa48("1489"), 'Product')))) || (stryMutAct_9fa48("1491") ? Array.isArray(json['@graph']) || json['@graph'].some((g: Record<string, unknown>) => g['@type'] === 'Product') : stryMutAct_9fa48("1490") ? false : (stryCov_9fa48("1490", "1491"), Array.isArray(json[stryMutAct_9fa48("1492") ? "" : (stryCov_9fa48("1492"), '@graph')]) && (stryMutAct_9fa48("1493") ? json['@graph'].every((g: Record<string, unknown>) => g['@type'] === 'Product') : (stryCov_9fa48("1493"), json[stryMutAct_9fa48("1494") ? "" : (stryCov_9fa48("1494"), '@graph')].some(stryMutAct_9fa48("1495") ? () => undefined : (stryCov_9fa48("1495"), (g: Record<string, unknown>) => stryMutAct_9fa48("1498") ? g['@type'] !== 'Product' : stryMutAct_9fa48("1497") ? false : stryMutAct_9fa48("1496") ? true : (stryCov_9fa48("1496", "1497", "1498"), g[stryMutAct_9fa48("1499") ? "" : (stryCov_9fa48("1499"), '@type')] === (stryMutAct_9fa48("1500") ? "" : (stryCov_9fa48("1500"), 'Product'))))))))))))) {
                if (stryMutAct_9fa48("1501")) {
                  {}
                } else {
                  stryCov_9fa48("1501");
                  const productObj = Array.isArray(json[stryMutAct_9fa48("1502") ? "" : (stryCov_9fa48("1502"), '@graph')]) ? json[stryMutAct_9fa48("1503") ? "" : (stryCov_9fa48("1503"), '@graph')].find(stryMutAct_9fa48("1504") ? () => undefined : (stryCov_9fa48("1504"), (g: Record<string, unknown>) => stryMutAct_9fa48("1507") ? g['@type'] !== 'Product' : stryMutAct_9fa48("1506") ? false : stryMutAct_9fa48("1505") ? true : (stryCov_9fa48("1505", "1506", "1507"), g[stryMutAct_9fa48("1508") ? "" : (stryCov_9fa48("1508"), '@type')] === (stryMutAct_9fa48("1509") ? "" : (stryCov_9fa48("1509"), 'Product'))))) : json;
                  const offers = stryMutAct_9fa48("1510") ? productObj.offers : (stryCov_9fa48("1510"), productObj?.offers);
                  const offersArray = Array.isArray(offers) ? offers : offers ? stryMutAct_9fa48("1511") ? [] : (stryCov_9fa48("1511"), [offers]) : stryMutAct_9fa48("1512") ? ["Stryker was here"] : (stryCov_9fa48("1512"), []);
                  for (const offer of offersArray) {
                    if (stryMutAct_9fa48("1513")) {
                      {}
                    } else {
                      stryCov_9fa48("1513");
                      // LD+JSON lacks explicit option mapping; capture price/sku and leave attributes empty
                      const price = (stryMutAct_9fa48("1514") ? offer.price && '' : (stryCov_9fa48("1514"), offer.price ?? (stryMutAct_9fa48("1515") ? "Stryker was here!" : (stryCov_9fa48("1515"), '')))).toString();
                      const stockStatus = /InStock/i.test(stryMutAct_9fa48("1518") ? offer.availability && '' : stryMutAct_9fa48("1517") ? false : stryMutAct_9fa48("1516") ? true : (stryCov_9fa48("1516", "1517", "1518"), offer.availability || (stryMutAct_9fa48("1519") ? "Stryker was here!" : (stryCov_9fa48("1519"), '')))) ? stryMutAct_9fa48("1520") ? "" : (stryCov_9fa48("1520"), 'instock') : stryMutAct_9fa48("1521") ? "" : (stryCov_9fa48("1521"), 'outofstock');
                      variations.push(stryMutAct_9fa48("1522") ? {} : (stryCov_9fa48("1522"), {
                        sku: stryMutAct_9fa48("1525") ? ((offer.sku || '').toString() || this.extractText(dom, '.sku, [data-sku], .product-sku')) && 'SKU' : stryMutAct_9fa48("1524") ? false : stryMutAct_9fa48("1523") ? true : (stryCov_9fa48("1523", "1524", "1525"), (stryMutAct_9fa48("1527") ? (offer.sku || '').toString() && this.extractText(dom, '.sku, [data-sku], .product-sku') : stryMutAct_9fa48("1526") ? false : (stryCov_9fa48("1526", "1527"), (stryMutAct_9fa48("1530") ? offer.sku && '' : stryMutAct_9fa48("1529") ? false : stryMutAct_9fa48("1528") ? true : (stryCov_9fa48("1528", "1529", "1530"), offer.sku || (stryMutAct_9fa48("1531") ? "Stryker was here!" : (stryCov_9fa48("1531"), '')))).toString() || this.extractText(dom, stryMutAct_9fa48("1532") ? "" : (stryCov_9fa48("1532"), '.sku, [data-sku], .product-sku')))) || (stryMutAct_9fa48("1533") ? "" : (stryCov_9fa48("1533"), 'SKU'))),
                        regularPrice: price,
                        taxClass: stryMutAct_9fa48("1534") ? "Stryker was here!" : (stryCov_9fa48("1534"), ''),
                        stockStatus,
                        images: stryMutAct_9fa48("1535") ? ["Stryker was here"] : (stryCov_9fa48("1535"), []),
                        attributeAssignments: {}
                      }));
                    }
                  }
                  if (stryMutAct_9fa48("1539") ? variations.length <= 0 : stryMutAct_9fa48("1538") ? variations.length >= 0 : stryMutAct_9fa48("1537") ? false : stryMutAct_9fa48("1536") ? true : (stryCov_9fa48("1536", "1537", "1538", "1539"), variations.length > 0)) {
                    if (stryMutAct_9fa48("1540")) {
                      {}
                    } else {
                      stryCov_9fa48("1540");
                      if (stryMutAct_9fa48("1543") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("1542") ? false : stryMutAct_9fa48("1541") ? true : (stryCov_9fa48("1541", "1542", "1543"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("1544") ? "" : (stryCov_9fa48("1544"), '1')))) console.log(stryMutAct_9fa48("1545") ? `` : (stryCov_9fa48("1545"), `Extracted ${variations.length} variations from LD+JSON offers`));
                      return variations;
                    }
                  }
                }
              }
            }
          }
        }
      } catch (e) {
        if (stryMutAct_9fa48("1546")) {
          {}
        } else {
          stryCov_9fa48("1546");
          if (stryMutAct_9fa48("1549") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("1548") ? false : stryMutAct_9fa48("1547") ? true : (stryCov_9fa48("1547", "1548", "1549"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("1550") ? "" : (stryCov_9fa48("1550"), '1')))) console.warn(stryMutAct_9fa48("1551") ? "" : (stryCov_9fa48("1551"), 'Failed to parse Shopify/LD+JSON variants:'), e);
        }
      }

      // 1) WooCommerce: parse JSON from data-product_variations on form.variations_form
      const forms = dom.window.document.querySelectorAll(stryMutAct_9fa48("1552") ? "" : (stryCov_9fa48("1552"), 'form.variations_form[data-product_variations]'));
      if (stryMutAct_9fa48("1555") ? forms || forms.length > 0 : stryMutAct_9fa48("1554") ? false : stryMutAct_9fa48("1553") ? true : (stryCov_9fa48("1553", "1554", "1555"), forms && (stryMutAct_9fa48("1558") ? forms.length <= 0 : stryMutAct_9fa48("1557") ? forms.length >= 0 : stryMutAct_9fa48("1556") ? true : (stryCov_9fa48("1556", "1557", "1558"), forms.length > 0)))) {
        if (stryMutAct_9fa48("1559")) {
          {}
        } else {
          stryCov_9fa48("1559");
          for (const form of Array.from(forms)) {
            if (stryMutAct_9fa48("1560")) {
              {}
            } else {
              stryCov_9fa48("1560");
              const raw = form.getAttribute(stryMutAct_9fa48("1561") ? "" : (stryCov_9fa48("1561"), 'data-product_variations'));
              if (stryMutAct_9fa48("1564") ? raw || raw.trim() !== '' : stryMutAct_9fa48("1563") ? false : stryMutAct_9fa48("1562") ? true : (stryCov_9fa48("1562", "1563", "1564"), raw && (stryMutAct_9fa48("1566") ? raw.trim() === '' : stryMutAct_9fa48("1565") ? true : (stryCov_9fa48("1565", "1566"), (stryMutAct_9fa48("1567") ? raw : (stryCov_9fa48("1567"), raw.trim())) !== (stryMutAct_9fa48("1568") ? "Stryker was here!" : (stryCov_9fa48("1568"), '')))))) {
                if (stryMutAct_9fa48("1569")) {
                  {}
                } else {
                  stryCov_9fa48("1569");
                  try {
                    if (stryMutAct_9fa48("1570")) {
                      {}
                    } else {
                      stryCov_9fa48("1570");
                      // Some themes HTML-encode quotes, handle that
                      const normalized = raw.replace(/&quot;/g, stryMutAct_9fa48("1571") ? "" : (stryCov_9fa48("1571"), '"')).replace(/&#34;/g, stryMutAct_9fa48("1572") ? "" : (stryCov_9fa48("1572"), '"')).replace(/&amp;/g, stryMutAct_9fa48("1573") ? "" : (stryCov_9fa48("1573"), '&'));
                      const parsed = JSON.parse(normalized);
                      if (stryMutAct_9fa48("1575") ? false : stryMutAct_9fa48("1574") ? true : (stryCov_9fa48("1574", "1575"), Array.isArray(parsed))) {
                        if (stryMutAct_9fa48("1576")) {
                          {}
                        } else {
                          stryCov_9fa48("1576");
                          for (const v of parsed) {
                            if (stryMutAct_9fa48("1577")) {
                              {}
                            } else {
                              stryCov_9fa48("1577");
                              const attrs = stryMutAct_9fa48("1580") ? v.attributes && {} : stryMutAct_9fa48("1579") ? false : stryMutAct_9fa48("1578") ? true : (stryCov_9fa48("1578", "1579", "1580"), v.attributes || {});
                              const attributeAssignments: Record<string, string> = {};
                              Object.keys(attrs).forEach(k => {
                                if (stryMutAct_9fa48("1581")) {
                                  {}
                                } else {
                                  stryCov_9fa48("1581");
                                  // keys like attribute_pa_color -> clean to pa_color
                                  const cleanKey = k.replace(stryMutAct_9fa48("1582") ? /attribute_/ : (stryCov_9fa48("1582"), /^attribute_/), stryMutAct_9fa48("1583") ? "Stryker was here!" : (stryCov_9fa48("1583"), ''));
                                  const value = attrs[k];
                                  if (stryMutAct_9fa48("1586") ? typeof value === 'string' || value.trim() !== '' : stryMutAct_9fa48("1585") ? false : stryMutAct_9fa48("1584") ? true : (stryCov_9fa48("1584", "1585", "1586"), (stryMutAct_9fa48("1588") ? typeof value !== 'string' : stryMutAct_9fa48("1587") ? true : (stryCov_9fa48("1587", "1588"), typeof value === (stryMutAct_9fa48("1589") ? "" : (stryCov_9fa48("1589"), 'string')))) && (stryMutAct_9fa48("1591") ? value.trim() === '' : stryMutAct_9fa48("1590") ? true : (stryCov_9fa48("1590", "1591"), (stryMutAct_9fa48("1592") ? value : (stryCov_9fa48("1592"), value.trim())) !== (stryMutAct_9fa48("1593") ? "Stryker was here!" : (stryCov_9fa48("1593"), '')))))) {
                                    if (stryMutAct_9fa48("1594")) {
                                      {}
                                    } else {
                                      stryCov_9fa48("1594");
                                      attributeAssignments[cleanKey] = value;
                                    }
                                  }
                                }
                              });
                              const price = (stryMutAct_9fa48("1595") ? (v.display_price ?? v.price ?? v.display_regular_price ?? v.regular_price) && '' : (stryCov_9fa48("1595"), (stryMutAct_9fa48("1596") ? (v.display_price ?? v.price ?? v.display_regular_price) && v.regular_price : (stryCov_9fa48("1596"), (stryMutAct_9fa48("1597") ? (v.display_price ?? v.price) && v.display_regular_price : (stryCov_9fa48("1597"), (stryMutAct_9fa48("1598") ? v.display_price && v.price : (stryCov_9fa48("1598"), v.display_price ?? v.price)) ?? v.display_regular_price)) ?? v.regular_price)) ?? (stryMutAct_9fa48("1599") ? "Stryker was here!" : (stryCov_9fa48("1599"), '')))).toString();
                              const sale = (stryMutAct_9fa48("1600") ? (v.display_sale_price ?? v.sale_price) && '' : (stryCov_9fa48("1600"), (stryMutAct_9fa48("1601") ? v.display_sale_price && v.sale_price : (stryCov_9fa48("1601"), v.display_sale_price ?? v.sale_price)) ?? (stryMutAct_9fa48("1602") ? "Stryker was here!" : (stryCov_9fa48("1602"), '')))).toString();
                              const stockStatus = (stryMutAct_9fa48("1605") ? v.is_in_stock !== false : stryMutAct_9fa48("1604") ? false : stryMutAct_9fa48("1603") ? true : (stryCov_9fa48("1603", "1604", "1605"), v.is_in_stock === (stryMutAct_9fa48("1606") ? true : (stryCov_9fa48("1606"), false)))) ? stryMutAct_9fa48("1607") ? "" : (stryCov_9fa48("1607"), 'outofstock') : stryMutAct_9fa48("1608") ? "" : (stryCov_9fa48("1608"), 'instock');
                              const images: string[] = stryMutAct_9fa48("1609") ? ["Stryker was here"] : (stryCov_9fa48("1609"), []);
                              if (stryMutAct_9fa48("1612") ? v.image || v.image.src || v.image.full_src : stryMutAct_9fa48("1611") ? false : stryMutAct_9fa48("1610") ? true : (stryCov_9fa48("1610", "1611", "1612"), v.image && (stryMutAct_9fa48("1614") ? v.image.src && v.image.full_src : stryMutAct_9fa48("1613") ? true : (stryCov_9fa48("1613", "1614"), v.image.src || v.image.full_src)))) {
                                if (stryMutAct_9fa48("1615")) {
                                  {}
                                } else {
                                  stryCov_9fa48("1615");
                                  images.push(stryMutAct_9fa48("1618") ? v.image.full_src && v.image.src : stryMutAct_9fa48("1617") ? false : stryMutAct_9fa48("1616") ? true : (stryCov_9fa48("1616", "1617", "1618"), v.image.full_src || v.image.src));
                                }
                              }
                              variations.push(stryMutAct_9fa48("1619") ? {} : (stryCov_9fa48("1619"), {
                                sku: stryMutAct_9fa48("1622") ? ((v.sku || '').toString() || this.extractText(dom, '.sku, [data-sku], .product-sku')) && 'SKU' : stryMutAct_9fa48("1621") ? false : stryMutAct_9fa48("1620") ? true : (stryCov_9fa48("1620", "1621", "1622"), (stryMutAct_9fa48("1624") ? (v.sku || '').toString() && this.extractText(dom, '.sku, [data-sku], .product-sku') : stryMutAct_9fa48("1623") ? false : (stryCov_9fa48("1623", "1624"), (stryMutAct_9fa48("1627") ? v.sku && '' : stryMutAct_9fa48("1626") ? false : stryMutAct_9fa48("1625") ? true : (stryCov_9fa48("1625", "1626", "1627"), v.sku || (stryMutAct_9fa48("1628") ? "Stryker was here!" : (stryCov_9fa48("1628"), '')))).toString() || this.extractText(dom, stryMutAct_9fa48("1629") ? "" : (stryCov_9fa48("1629"), '.sku, [data-sku], .product-sku')))) || (stryMutAct_9fa48("1630") ? "" : (stryCov_9fa48("1630"), 'SKU'))),
                                regularPrice: price,
                                salePrice: sale,
                                taxClass: stryMutAct_9fa48("1631") ? "Stryker was here!" : (stryCov_9fa48("1631"), ''),
                                stockStatus,
                                images,
                                attributeAssignments
                              }));
                            }
                          }
                        }
                      }
                    }
                  } catch (e) {
                    if (stryMutAct_9fa48("1632")) {
                      {}
                    } else {
                      stryCov_9fa48("1632");
                      if (stryMutAct_9fa48("1635") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("1634") ? false : stryMutAct_9fa48("1633") ? true : (stryCov_9fa48("1633", "1634", "1635"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("1636") ? "" : (stryCov_9fa48("1636"), '1')))) console.warn(stryMutAct_9fa48("1637") ? "" : (stryCov_9fa48("1637"), 'Failed to parse data-product_variations JSON:'), e);
                    }
                  }
                }
              }
            }
          }
          if (stryMutAct_9fa48("1641") ? variations.length <= 0 : stryMutAct_9fa48("1640") ? variations.length >= 0 : stryMutAct_9fa48("1639") ? false : stryMutAct_9fa48("1638") ? true : (stryCov_9fa48("1638", "1639", "1640", "1641"), variations.length > 0)) {
            if (stryMutAct_9fa48("1642")) {
              {}
            } else {
              stryCov_9fa48("1642");
              if (stryMutAct_9fa48("1645") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("1644") ? false : stryMutAct_9fa48("1643") ? true : (stryCov_9fa48("1643", "1644", "1645"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("1646") ? "" : (stryCov_9fa48("1646"), '1')))) console.log(stryMutAct_9fa48("1647") ? `` : (stryCov_9fa48("1647"), `Extracted ${variations.length} variations from data-product_variations JSON`));
              return variations;
            }
          }
        }
      }

      // 2) Fallback: extract from DOM selects/prices as before
      // First, try to extract variations from variation forms (WooCommerce style)
      for (const sel of selectorArray) {
        if (stryMutAct_9fa48("1648")) {
          {}
        } else {
          stryCov_9fa48("1648");
          const variationElements = this.extractElements(dom, sel);
          if (stryMutAct_9fa48("1652") ? variationElements.length <= 0 : stryMutAct_9fa48("1651") ? variationElements.length >= 0 : stryMutAct_9fa48("1650") ? false : stryMutAct_9fa48("1649") ? true : (stryCov_9fa48("1649", "1650", "1651", "1652"), variationElements.length > 0)) {
            if (stryMutAct_9fa48("1653")) {
              {}
            } else {
              stryCov_9fa48("1653");
              if (stryMutAct_9fa48("1656") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("1655") ? false : stryMutAct_9fa48("1654") ? true : (stryCov_9fa48("1654", "1655", "1656"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("1657") ? "" : (stryCov_9fa48("1657"), '1')))) console.log(stryMutAct_9fa48("1658") ? `` : (stryCov_9fa48("1658"), `Found ${variationElements.length} variation elements with selector: ${sel}`));
              for (const element of variationElements) {
                if (stryMutAct_9fa48("1659")) {
                  {}
                } else {
                  stryCov_9fa48("1659");
                  // Look for variation options in select elements
                  const selectElements = element.querySelectorAll(stryMutAct_9fa48("1660") ? "" : (stryCov_9fa48("1660"), 'select[name*="attribute"], select[class*="variation"], select[class*="attribute"]'));
                  if (stryMutAct_9fa48("1664") ? selectElements.length <= 0 : stryMutAct_9fa48("1663") ? selectElements.length >= 0 : stryMutAct_9fa48("1662") ? false : stryMutAct_9fa48("1661") ? true : (stryCov_9fa48("1661", "1662", "1663", "1664"), selectElements.length > 0)) {
                    if (stryMutAct_9fa48("1665")) {
                      {}
                    } else {
                      stryCov_9fa48("1665");
                      if (stryMutAct_9fa48("1668") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("1667") ? false : stryMutAct_9fa48("1666") ? true : (stryCov_9fa48("1666", "1667", "1668"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("1669") ? "" : (stryCov_9fa48("1669"), '1')))) console.log(stryMutAct_9fa48("1670") ? `` : (stryCov_9fa48("1670"), `Found ${selectElements.length} variation select elements`));

                      // Only create variations if we have actual variation data (different prices, SKUs, etc.)
                      // Don't create variations for every attribute option to avoid CSV duplication
                      const basePrice = stryMutAct_9fa48("1673") ? this.extractText(dom, '.price, [data-price], .product-price') && '' : stryMutAct_9fa48("1672") ? false : stryMutAct_9fa48("1671") ? true : (stryCov_9fa48("1671", "1672", "1673"), this.extractText(dom, stryMutAct_9fa48("1674") ? "" : (stryCov_9fa48("1674"), '.price, [data-price], .product-price')) || (stryMutAct_9fa48("1675") ? "Stryker was here!" : (stryCov_9fa48("1675"), '')));
                      const baseSku = stryMutAct_9fa48("1678") ? this.extractText(dom, '.sku, [data-sku], .product-sku') && 'SKU' : stryMutAct_9fa48("1677") ? false : stryMutAct_9fa48("1676") ? true : (stryCov_9fa48("1676", "1677", "1678"), this.extractText(dom, stryMutAct_9fa48("1679") ? "" : (stryCov_9fa48("1679"), '.sku, [data-sku], .product-sku')) || (stryMutAct_9fa48("1680") ? "" : (stryCov_9fa48("1680"), 'SKU')));

                      // Check if this is a true variable product with different prices/SKUs
                      const hasPriceVariations = this.checkForPriceVariations(dom);
                      const hasSkuVariations = this.checkForSkuVariations(dom);
                      if (stryMutAct_9fa48("1683") ? hasPriceVariations && hasSkuVariations : stryMutAct_9fa48("1682") ? false : stryMutAct_9fa48("1681") ? true : (stryCov_9fa48("1681", "1682", "1683"), hasPriceVariations || hasSkuVariations)) {
                        if (stryMutAct_9fa48("1684")) {
                          {}
                        } else {
                          stryCov_9fa48("1684");
                          if (stryMutAct_9fa48("1687") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("1686") ? false : stryMutAct_9fa48("1685") ? true : (stryCov_9fa48("1685", "1686", "1687"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("1688") ? "" : (stryCov_9fa48("1688"), '1')))) console.log(stryMutAct_9fa48("1689") ? "" : (stryCov_9fa48("1689"), 'Found actual price/SKU variations, creating variation records'));

                          // Extract options from each select
                          for (const select of Array.from(selectElements)) {
                            if (stryMutAct_9fa48("1690")) {
                              {}
                            } else {
                              stryCov_9fa48("1690");
                              const options = select.querySelectorAll(stryMutAct_9fa48("1691") ? "" : (stryCov_9fa48("1691"), 'option[value]:not([value=""])'));
                              const attributeName = stryMutAct_9fa48("1694") ? (select.getAttribute('name') || select.getAttribute('data-attribute')) && 'Unknown' : stryMutAct_9fa48("1693") ? false : stryMutAct_9fa48("1692") ? true : (stryCov_9fa48("1692", "1693", "1694"), (stryMutAct_9fa48("1696") ? select.getAttribute('name') && select.getAttribute('data-attribute') : stryMutAct_9fa48("1695") ? false : (stryCov_9fa48("1695", "1696"), select.getAttribute(stryMutAct_9fa48("1697") ? "" : (stryCov_9fa48("1697"), 'name')) || select.getAttribute(stryMutAct_9fa48("1698") ? "" : (stryCov_9fa48("1698"), 'data-attribute')))) || (stryMutAct_9fa48("1699") ? "" : (stryCov_9fa48("1699"), 'Unknown')));
                              if (stryMutAct_9fa48("1702") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("1701") ? false : stryMutAct_9fa48("1700") ? true : (stryCov_9fa48("1700", "1701", "1702"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("1703") ? "" : (stryCov_9fa48("1703"), '1')))) console.log(stryMutAct_9fa48("1704") ? `` : (stryCov_9fa48("1704"), `Found ${options.length} options for attribute: ${attributeName}`));
                              for (const option of Array.from(options)) {
                                if (stryMutAct_9fa48("1705")) {
                                  {}
                                } else {
                                  stryCov_9fa48("1705");
                                  const value = option.getAttribute(stryMutAct_9fa48("1706") ? "" : (stryCov_9fa48("1706"), 'value'));
                                  const text = stryMutAct_9fa48("1708") ? option.textContent.trim() : stryMutAct_9fa48("1707") ? option.textContent : (stryCov_9fa48("1707", "1708"), option.textContent?.trim());
                                  if (stryMutAct_9fa48("1711") ? value && text || !this.isPlaceholderValue(text) : stryMutAct_9fa48("1710") ? false : stryMutAct_9fa48("1709") ? true : (stryCov_9fa48("1709", "1710", "1711"), (stryMutAct_9fa48("1713") ? value || text : stryMutAct_9fa48("1712") ? true : (stryCov_9fa48("1712", "1713"), value && text)) && (stryMutAct_9fa48("1714") ? this.isPlaceholderValue(text) : (stryCov_9fa48("1714"), !this.isPlaceholderValue(text))))) {
                                    if (stryMutAct_9fa48("1715")) {
                                      {}
                                    } else {
                                      stryCov_9fa48("1715");
                                      // Create a variation for each option
                                      const sku = stryMutAct_9fa48("1716") ? `` : (stryCov_9fa48("1716"), `${baseSku}-${value}`);
                                      variations.push(stryMutAct_9fa48("1717") ? {} : (stryCov_9fa48("1717"), {
                                        sku,
                                        regularPrice: basePrice,
                                        taxClass: stryMutAct_9fa48("1718") ? "Stryker was here!" : (stryCov_9fa48("1718"), ''),
                                        stockStatus: stryMutAct_9fa48("1719") ? "" : (stryCov_9fa48("1719"), 'instock'),
                                        images: stryMutAct_9fa48("1720") ? ["Stryker was here"] : (stryCov_9fa48("1720"), []),
                                        attributeAssignments: stryMutAct_9fa48("1721") ? {} : (stryCov_9fa48("1721"), {
                                          [attributeName!]: value
                                        })
                                      }));
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      } else {
                        if (stryMutAct_9fa48("1722")) {
                          {}
                        } else {
                          stryCov_9fa48("1722");
                          if (stryMutAct_9fa48("1725") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("1724") ? false : stryMutAct_9fa48("1723") ? true : (stryCov_9fa48("1723", "1724", "1725"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("1726") ? "" : (stryCov_9fa48("1726"), '1')))) console.log(stryMutAct_9fa48("1727") ? "" : (stryCov_9fa48("1727"), 'No actual price/SKU variations found, treating as simple product with attributes'));
                          // Don't create variations - this is just a simple product with attribute options
                        }
                      }
                    }
                  }

                  // Also try traditional variation extraction
                  const sku = stryMutAct_9fa48("1730") ? element.querySelector('[data-sku], .sku, .product-sku').textContent?.trim() : stryMutAct_9fa48("1729") ? element.querySelector('[data-sku], .sku, .product-sku')?.textContent.trim() : stryMutAct_9fa48("1728") ? element.querySelector('[data-sku], .sku, .product-sku')?.textContent : (stryCov_9fa48("1728", "1729", "1730"), element.querySelector(stryMutAct_9fa48("1731") ? "" : (stryCov_9fa48("1731"), '[data-sku], .sku, .product-sku'))?.textContent?.trim());
                  const price = stryMutAct_9fa48("1734") ? element.querySelector('[data-price], .price, .product-price').textContent?.trim() : stryMutAct_9fa48("1733") ? element.querySelector('[data-price], .price, .product-price')?.textContent.trim() : stryMutAct_9fa48("1732") ? element.querySelector('[data-price], .price, .product-price')?.textContent : (stryCov_9fa48("1732", "1733", "1734"), element.querySelector(stryMutAct_9fa48("1735") ? "" : (stryCov_9fa48("1735"), '[data-price], .price, .product-price'))?.textContent?.trim());
                  if (stryMutAct_9fa48("1738") ? sku || !variations.some(v => v.sku === sku) : stryMutAct_9fa48("1737") ? false : stryMutAct_9fa48("1736") ? true : (stryCov_9fa48("1736", "1737", "1738"), sku && (stryMutAct_9fa48("1739") ? variations.some(v => v.sku === sku) : (stryCov_9fa48("1739"), !(stryMutAct_9fa48("1740") ? variations.every(v => v.sku === sku) : (stryCov_9fa48("1740"), variations.some(stryMutAct_9fa48("1741") ? () => undefined : (stryCov_9fa48("1741"), v => stryMutAct_9fa48("1744") ? v.sku !== sku : stryMutAct_9fa48("1743") ? false : stryMutAct_9fa48("1742") ? true : (stryCov_9fa48("1742", "1743", "1744"), v.sku === sku))))))))) {
                    if (stryMutAct_9fa48("1745")) {
                      {}
                    } else {
                      stryCov_9fa48("1745");
                      variations.push(stryMutAct_9fa48("1746") ? {} : (stryCov_9fa48("1746"), {
                        sku,
                        regularPrice: this.cleanPrice(stryMutAct_9fa48("1749") ? price && '' : stryMutAct_9fa48("1748") ? false : stryMutAct_9fa48("1747") ? true : (stryCov_9fa48("1747", "1748", "1749"), price || (stryMutAct_9fa48("1750") ? "Stryker was here!" : (stryCov_9fa48("1750"), '')))),
                        taxClass: stryMutAct_9fa48("1751") ? "Stryker was here!" : (stryCov_9fa48("1751"), ''),
                        stockStatus: stryMutAct_9fa48("1752") ? "" : (stryCov_9fa48("1752"), 'instock'),
                        images: stryMutAct_9fa48("1753") ? ["Stryker was here"] : (stryCov_9fa48("1753"), []),
                        attributeAssignments: {}
                      }));
                    }
                  }
                }
              }
              break; // Use first successful selector
            }
          }
        }
      }
      if (stryMutAct_9fa48("1756") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("1755") ? false : stryMutAct_9fa48("1754") ? true : (stryCov_9fa48("1754", "1755", "1756"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("1757") ? "" : (stryCov_9fa48("1757"), '1')))) console.log(stryMutAct_9fa48("1758") ? `` : (stryCov_9fa48("1758"), `Extracted ${variations.length} variations total`));
      return variations;
    }
  }

  /**
   * Extract variant SKU from ?variant= links on the page
   */
  private extractVariantSkuFromLinks(dom: JSDOM, variantId?: string): string | '' {
    if (stryMutAct_9fa48("1759")) {
      {}
    } else {
      stryCov_9fa48("1759");
      try {
        if (stryMutAct_9fa48("1760")) {
          {}
        } else {
          stryCov_9fa48("1760");
          const anchors = dom.window.document.querySelectorAll(stryMutAct_9fa48("1761") ? "" : (stryCov_9fa48("1761"), 'a[href*="?variant="]'));
          for (const a of Array.from(anchors)) {
            if (stryMutAct_9fa48("1762")) {
              {}
            } else {
              stryCov_9fa48("1762");
              const href = stryMutAct_9fa48("1765") ? a.getAttribute('href') && '' : stryMutAct_9fa48("1764") ? false : stryMutAct_9fa48("1763") ? true : (stryCov_9fa48("1763", "1764", "1765"), a.getAttribute(stryMutAct_9fa48("1766") ? "" : (stryCov_9fa48("1766"), 'href')) || (stryMutAct_9fa48("1767") ? "Stryker was here!" : (stryCov_9fa48("1767"), '')));
              const u = new URL(href, this.baseUrl);
              const v = u.searchParams.get(stryMutAct_9fa48("1768") ? "" : (stryCov_9fa48("1768"), 'variant'));
              if (stryMutAct_9fa48("1771") ? v || !variantId || v === String(variantId) : stryMutAct_9fa48("1770") ? false : stryMutAct_9fa48("1769") ? true : (stryCov_9fa48("1769", "1770", "1771"), v && (stryMutAct_9fa48("1773") ? !variantId && v === String(variantId) : stryMutAct_9fa48("1772") ? true : (stryCov_9fa48("1772", "1773"), (stryMutAct_9fa48("1774") ? variantId : (stryCov_9fa48("1774"), !variantId)) || (stryMutAct_9fa48("1776") ? v !== String(variantId) : stryMutAct_9fa48("1775") ? false : (stryCov_9fa48("1775", "1776"), v === String(variantId))))))) {
                if (stryMutAct_9fa48("1777")) {
                  {}
                } else {
                  stryCov_9fa48("1777");
                  return v;
                }
              }
            }
          }
        }
      } catch {
        // Ignore URL parsing errors and continue
      }
      return stryMutAct_9fa48("1778") ? "Stryker was here!" : (stryCov_9fa48("1778"), '');
    }
  }

  /**
   * Check if a value is a placeholder
   */
  protected isPlaceholderValue(value: string): boolean {
    if (stryMutAct_9fa48("1779")) {
      {}
    } else {
      stryCov_9fa48("1779");
      const placeholders = stryMutAct_9fa48("1780") ? [] : (stryCov_9fa48("1780"), [stryMutAct_9fa48("1781") ? "" : (stryCov_9fa48("1781"), 'בחר אפשרות'), stryMutAct_9fa48("1782") ? "" : (stryCov_9fa48("1782"), 'בחירת אפשרות'), stryMutAct_9fa48("1783") ? "" : (stryCov_9fa48("1783"), 'Select option'), stryMutAct_9fa48("1784") ? "" : (stryCov_9fa48("1784"), 'Choose option'), stryMutAct_9fa48("1785") ? "" : (stryCov_9fa48("1785"), 'בחר גודל'), stryMutAct_9fa48("1786") ? "" : (stryCov_9fa48("1786"), 'בחר צבע'), stryMutAct_9fa48("1787") ? "" : (stryCov_9fa48("1787"), 'בחר מודל'), stryMutAct_9fa48("1788") ? "" : (stryCov_9fa48("1788"), 'Select size'), stryMutAct_9fa48("1789") ? "" : (stryCov_9fa48("1789"), 'Select color'), stryMutAct_9fa48("1790") ? "" : (stryCov_9fa48("1790"), 'Select model'), stryMutAct_9fa48("1791") ? "" : (stryCov_9fa48("1791"), 'General'), stryMutAct_9fa48("1792") ? "" : (stryCov_9fa48("1792"), 'בחירת אפשרותA'), stryMutAct_9fa48("1793") ? "" : (stryCov_9fa48("1793"), 'בחירת אפשרותB'), stryMutAct_9fa48("1794") ? "" : (stryCov_9fa48("1794"), 'בחירת אפשרותC'), stryMutAct_9fa48("1795") ? "" : (stryCov_9fa48("1795"), 'בחירת אפשרותD'), stryMutAct_9fa48("1796") ? "" : (stryCov_9fa48("1796"), 'בחירת אפשרותE'), stryMutAct_9fa48("1797") ? "" : (stryCov_9fa48("1797"), 'בחירת אפשרותF'), stryMutAct_9fa48("1798") ? "" : (stryCov_9fa48("1798"), 'בחירת אפשרותG'), stryMutAct_9fa48("1799") ? "" : (stryCov_9fa48("1799"), 'בחירת אפשרותH'), stryMutAct_9fa48("1800") ? "" : (stryCov_9fa48("1800"), 'בחירת אפשרותI'), stryMutAct_9fa48("1801") ? "" : (stryCov_9fa48("1801"), 'בחירת אפשרותJ'), stryMutAct_9fa48("1802") ? "" : (stryCov_9fa48("1802"), 'בחירת אפשרותK'), stryMutAct_9fa48("1803") ? "" : (stryCov_9fa48("1803"), 'בחירת אפשרותL'), stryMutAct_9fa48("1804") ? "" : (stryCov_9fa48("1804"), 'בחירת אפשרותM'), stryMutAct_9fa48("1805") ? "" : (stryCov_9fa48("1805"), 'בחירת אפשרותN'), stryMutAct_9fa48("1806") ? "" : (stryCov_9fa48("1806"), 'בחירת אפשרותO'), stryMutAct_9fa48("1807") ? "" : (stryCov_9fa48("1807"), 'בחירת אפשרותP'), stryMutAct_9fa48("1808") ? "" : (stryCov_9fa48("1808"), 'בחירת אפשרותQ'), stryMutAct_9fa48("1809") ? "" : (stryCov_9fa48("1809"), 'בחירת אפשרותR'), stryMutAct_9fa48("1810") ? "" : (stryCov_9fa48("1810"), 'בחירת אפשרותS'), stryMutAct_9fa48("1811") ? "" : (stryCov_9fa48("1811"), 'בחירת אפשרותT'), stryMutAct_9fa48("1812") ? "" : (stryCov_9fa48("1812"), 'בחירת אפשרותU'), stryMutAct_9fa48("1813") ? "" : (stryCov_9fa48("1813"), 'בחירת אפשרותV'), stryMutAct_9fa48("1814") ? "" : (stryCov_9fa48("1814"), 'בחירת אפשרותW'), stryMutAct_9fa48("1815") ? "" : (stryCov_9fa48("1815"), 'בחירת אפשרותX'), stryMutAct_9fa48("1816") ? "" : (stryCov_9fa48("1816"), 'בחירת אפשרותY'), stryMutAct_9fa48("1817") ? "" : (stryCov_9fa48("1817"), 'בחירת אפשרותZ'), stryMutAct_9fa48("1818") ? "" : (stryCov_9fa48("1818"), 'בחירת אפשרות0'), stryMutAct_9fa48("1819") ? "" : (stryCov_9fa48("1819"), 'בחירת אפשרות1'), stryMutAct_9fa48("1820") ? "" : (stryCov_9fa48("1820"), 'בחירת אפשרות2'), stryMutAct_9fa48("1821") ? "" : (stryCov_9fa48("1821"), 'בחירת אפשרות3'), stryMutAct_9fa48("1822") ? "" : (stryCov_9fa48("1822"), 'בחירת אפשרות4'), stryMutAct_9fa48("1823") ? "" : (stryCov_9fa48("1823"), 'בחירת אפשרות5'), stryMutAct_9fa48("1824") ? "" : (stryCov_9fa48("1824"), 'בחירת אפשרות6'), stryMutAct_9fa48("1825") ? "" : (stryCov_9fa48("1825"), 'בחירת אפשרות7'), stryMutAct_9fa48("1826") ? "" : (stryCov_9fa48("1826"), 'בחירת אפשרות8'), stryMutAct_9fa48("1827") ? "" : (stryCov_9fa48("1827"), 'בחירת אפשרות9'), stryMutAct_9fa48("1828") ? "" : (stryCov_9fa48("1828"), 'בחירת אפשרותא'), stryMutAct_9fa48("1829") ? "" : (stryCov_9fa48("1829"), 'בחירת אפשרותב'), stryMutAct_9fa48("1830") ? "" : (stryCov_9fa48("1830"), 'בחירת אפשרותג'), stryMutAct_9fa48("1831") ? "" : (stryCov_9fa48("1831"), 'בחירת אפשרותד'), stryMutAct_9fa48("1832") ? "" : (stryCov_9fa48("1832"), 'בחירת אפשרותה'), stryMutAct_9fa48("1833") ? "" : (stryCov_9fa48("1833"), 'בחירת אפשרותו'), stryMutAct_9fa48("1834") ? "" : (stryCov_9fa48("1834"), 'בחירת אפשרותז'), stryMutAct_9fa48("1835") ? "" : (stryCov_9fa48("1835"), 'בחירת אפשרותח'), stryMutAct_9fa48("1836") ? "" : (stryCov_9fa48("1836"), 'בחירת אפשרותט'), stryMutAct_9fa48("1837") ? "" : (stryCov_9fa48("1837"), 'בחירת אפשרותי'), stryMutAct_9fa48("1838") ? "" : (stryCov_9fa48("1838"), 'בחירת אפשרותכ'), stryMutAct_9fa48("1839") ? "" : (stryCov_9fa48("1839"), 'בחירת אפשרותל'), stryMutAct_9fa48("1840") ? "" : (stryCov_9fa48("1840"), 'בחירת אפשרותמ'), stryMutAct_9fa48("1841") ? "" : (stryCov_9fa48("1841"), 'בחירת אפשרותנ'), stryMutAct_9fa48("1842") ? "" : (stryCov_9fa48("1842"), 'בחירת אפשרותס'), stryMutAct_9fa48("1843") ? "" : (stryCov_9fa48("1843"), 'בחירת אפשרותע'), stryMutAct_9fa48("1844") ? "" : (stryCov_9fa48("1844"), 'בחירת אפשרותפ'), stryMutAct_9fa48("1845") ? "" : (stryCov_9fa48("1845"), 'בחירת אפשרותצ'), stryMutAct_9fa48("1846") ? "" : (stryCov_9fa48("1846"), 'בחירת אפשרותק'), stryMutAct_9fa48("1847") ? "" : (stryCov_9fa48("1847"), 'בחירת אפשרותר'), stryMutAct_9fa48("1848") ? "" : (stryCov_9fa48("1848"), 'בחירת אפשרותש'), stryMutAct_9fa48("1849") ? "" : (stryCov_9fa48("1849"), 'בחירת אפשרותת')]);
      return stryMutAct_9fa48("1850") ? placeholders.every(placeholder => value.toLowerCase().includes(placeholder.toLowerCase())) : (stryCov_9fa48("1850"), placeholders.some(stryMutAct_9fa48("1851") ? () => undefined : (stryCov_9fa48("1851"), placeholder => stryMutAct_9fa48("1852") ? value.toUpperCase().includes(placeholder.toLowerCase()) : (stryCov_9fa48("1852"), value.toLowerCase().includes(stryMutAct_9fa48("1853") ? placeholder.toUpperCase() : (stryCov_9fa48("1853"), placeholder.toLowerCase()))))));
    }
  }

  /**
   * Check if there are actual price variations (different prices for different options)
   */
  private checkForPriceVariations(dom: JSDOM): boolean {
    if (stryMutAct_9fa48("1854")) {
      {}
    } else {
      stryCov_9fa48("1854");
      // Look for price variations in the DOM
      const priceElements = dom.window.document.querySelectorAll(stryMutAct_9fa48("1855") ? "" : (stryCov_9fa48("1855"), '[data-price], .price, .product-price, .variation-price'));
      const prices = new Set<string>();
      priceElements.forEach((el: Element) => {
        if (stryMutAct_9fa48("1856")) {
          {}
        } else {
          stryCov_9fa48("1856");
          const price = stryMutAct_9fa48("1858") ? el.textContent.trim() : stryMutAct_9fa48("1857") ? el.textContent : (stryCov_9fa48("1857", "1858"), el.textContent?.trim());
          if (stryMutAct_9fa48("1861") ? price || price !== '' : stryMutAct_9fa48("1860") ? false : stryMutAct_9fa48("1859") ? true : (stryCov_9fa48("1859", "1860", "1861"), price && (stryMutAct_9fa48("1863") ? price === '' : stryMutAct_9fa48("1862") ? true : (stryCov_9fa48("1862", "1863"), price !== (stryMutAct_9fa48("1864") ? "Stryker was here!" : (stryCov_9fa48("1864"), '')))))) {
            if (stryMutAct_9fa48("1865")) {
              {}
            } else {
              stryCov_9fa48("1865");
              prices.add(price);
            }
          }
        }
      });

      // If we have more than one unique price, there are price variations
      const hasVariations = stryMutAct_9fa48("1869") ? prices.size <= 1 : stryMutAct_9fa48("1868") ? prices.size >= 1 : stryMutAct_9fa48("1867") ? false : stryMutAct_9fa48("1866") ? true : (stryCov_9fa48("1866", "1867", "1868", "1869"), prices.size > 1);
      if (stryMutAct_9fa48("1872") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("1871") ? false : stryMutAct_9fa48("1870") ? true : (stryCov_9fa48("1870", "1871", "1872"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("1873") ? "" : (stryCov_9fa48("1873"), '1')))) console.log(stryMutAct_9fa48("1874") ? `` : (stryCov_9fa48("1874"), `Price variation check - found ${prices.size} unique prices:`), Array.from(prices));
      return hasVariations;
    }
  }

  /**
   * Check if there are actual SKU variations (different SKUs for different options)
   */
  private checkForSkuVariations(dom: JSDOM): boolean {
    if (stryMutAct_9fa48("1875")) {
      {}
    } else {
      stryCov_9fa48("1875");
      // Look for SKU variations in the DOM
      const skuElements = dom.window.document.querySelectorAll(stryMutAct_9fa48("1876") ? "" : (stryCov_9fa48("1876"), '[data-sku], .sku, .product-sku, .variation-sku'));
      const skus = new Set<string>();
      skuElements.forEach((el: Element) => {
        if (stryMutAct_9fa48("1877")) {
          {}
        } else {
          stryCov_9fa48("1877");
          const sku = stryMutAct_9fa48("1879") ? el.textContent.trim() : stryMutAct_9fa48("1878") ? el.textContent : (stryCov_9fa48("1878", "1879"), el.textContent?.trim());
          if (stryMutAct_9fa48("1882") ? sku || sku !== '' : stryMutAct_9fa48("1881") ? false : stryMutAct_9fa48("1880") ? true : (stryCov_9fa48("1880", "1881", "1882"), sku && (stryMutAct_9fa48("1884") ? sku === '' : stryMutAct_9fa48("1883") ? true : (stryCov_9fa48("1883", "1884"), sku !== (stryMutAct_9fa48("1885") ? "Stryker was here!" : (stryCov_9fa48("1885"), '')))))) {
            if (stryMutAct_9fa48("1886")) {
              {}
            } else {
              stryCov_9fa48("1886");
              skus.add(sku);
            }
          }
        }
      });

      // If we have more than one unique SKU, there are SKU variations
      const hasVariations = stryMutAct_9fa48("1890") ? skus.size <= 1 : stryMutAct_9fa48("1889") ? skus.size >= 1 : stryMutAct_9fa48("1888") ? false : stryMutAct_9fa48("1887") ? true : (stryCov_9fa48("1887", "1888", "1889", "1890"), skus.size > 1);
      if (stryMutAct_9fa48("1893") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("1892") ? false : stryMutAct_9fa48("1891") ? true : (stryCov_9fa48("1891", "1892", "1893"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("1894") ? "" : (stryCov_9fa48("1894"), '1')))) console.log(stryMutAct_9fa48("1895") ? `` : (stryCov_9fa48("1895"), `SKU variation check - found ${skus.size} unique SKUs:`), Array.from(skus));
      return hasVariations;
    }
  }

  /**
   * Wait for selectors to be present in the DOM
   */
  protected async waitForSelectors(dom: JSDOM, selectors: string[]): Promise<void> {
    if (stryMutAct_9fa48("1896")) {
      {}
    } else {
      stryCov_9fa48("1896");
      // Simple implementation - in a real scenario, you might want to use a proper wait mechanism
      let attempts = 0;
      const maxAttempts = 10;
      while (stryMutAct_9fa48("1899") ? attempts >= maxAttempts : stryMutAct_9fa48("1898") ? attempts <= maxAttempts : stryMutAct_9fa48("1897") ? false : (stryCov_9fa48("1897", "1898", "1899"), attempts < maxAttempts)) {
        if (stryMutAct_9fa48("1900")) {
          {}
        } else {
          stryCov_9fa48("1900");
          const allPresent = stryMutAct_9fa48("1901") ? selectors.some(selector => dom.window.document.querySelector(selector)) : (stryCov_9fa48("1901"), selectors.every(stryMutAct_9fa48("1902") ? () => undefined : (stryCov_9fa48("1902"), selector => dom.window.document.querySelector(selector))));
          if (stryMutAct_9fa48("1904") ? false : stryMutAct_9fa48("1903") ? true : (stryCov_9fa48("1903", "1904"), allPresent)) {
            if (stryMutAct_9fa48("1905")) {
              {}
            } else {
              stryCov_9fa48("1905");
              break;
            }
          }
          await new Promise(stryMutAct_9fa48("1906") ? () => undefined : (stryCov_9fa48("1906"), resolve => setTimeout(resolve, 100)));
          stryMutAct_9fa48("1907") ? attempts-- : (stryCov_9fa48("1907"), attempts++);
        }
      }
    }
  }

  /**
   * Apply transformations to text
   */
  protected override applyTransformations(text: string, transformations: string[]): string {
    if (stryMutAct_9fa48("1908")) {
      {}
    } else {
      stryCov_9fa48("1908");
      let result = text;
      for (const transform of transformations) {
        if (stryMutAct_9fa48("1909")) {
          {}
        } else {
          stryCov_9fa48("1909");
          try {
            if (stryMutAct_9fa48("1910")) {
              {}
            } else {
              stryCov_9fa48("1910");
              if (stryMutAct_9fa48("1912") ? false : stryMutAct_9fa48("1911") ? true : (stryCov_9fa48("1911", "1912"), transform.includes(stryMutAct_9fa48("1913") ? "" : (stryCov_9fa48("1913"), '->')))) {
                if (stryMutAct_9fa48("1914")) {
                  {}
                } else {
                  stryCov_9fa48("1914");
                  const [pattern, replacement] = transform.split(stryMutAct_9fa48("1915") ? "" : (stryCov_9fa48("1915"), '->')).map(stryMutAct_9fa48("1916") ? () => undefined : (stryCov_9fa48("1916"), s => stryMutAct_9fa48("1917") ? s : (stryCov_9fa48("1917"), s.trim())));
                  if (stryMutAct_9fa48("1920") ? pattern || replacement : stryMutAct_9fa48("1919") ? false : stryMutAct_9fa48("1918") ? true : (stryCov_9fa48("1918", "1919", "1920"), pattern && replacement)) {
                    if (stryMutAct_9fa48("1921")) {
                      {}
                    } else {
                      stryCov_9fa48("1921");
                      const regex = new RegExp(pattern, stryMutAct_9fa48("1922") ? "" : (stryCov_9fa48("1922"), 'g'));
                      result = result.replace(regex, replacement);
                    }
                  }
                }
              } else if (stryMutAct_9fa48("1925") ? transform.endsWith('trim:') : stryMutAct_9fa48("1924") ? false : stryMutAct_9fa48("1923") ? true : (stryCov_9fa48("1923", "1924", "1925"), transform.startsWith(stryMutAct_9fa48("1926") ? "" : (stryCov_9fa48("1926"), 'trim:')))) {
                if (stryMutAct_9fa48("1927")) {
                  {}
                } else {
                  stryCov_9fa48("1927");
                  const chars = stryMutAct_9fa48("1928") ? transform : (stryCov_9fa48("1928"), transform.substring(5));
                  result = stryMutAct_9fa48("1929") ? result : (stryCov_9fa48("1929"), result.trim());
                  if (stryMutAct_9fa48("1931") ? false : stryMutAct_9fa48("1930") ? true : (stryCov_9fa48("1930", "1931"), chars)) {
                    if (stryMutAct_9fa48("1932")) {
                      {}
                    } else {
                      stryCov_9fa48("1932");
                      result = result.replace(new RegExp(stryMutAct_9fa48("1933") ? `` : (stryCov_9fa48("1933"), `^[${chars}]+|[${chars}]+$`), stryMutAct_9fa48("1934") ? "" : (stryCov_9fa48("1934"), 'g')), stryMutAct_9fa48("1935") ? "Stryker was here!" : (stryCov_9fa48("1935"), ''));
                    }
                  }
                }
              } else if (stryMutAct_9fa48("1938") ? transform.endsWith('replace:') : stryMutAct_9fa48("1937") ? false : stryMutAct_9fa48("1936") ? true : (stryCov_9fa48("1936", "1937", "1938"), transform.startsWith(stryMutAct_9fa48("1939") ? "" : (stryCov_9fa48("1939"), 'replace:')))) {
                if (stryMutAct_9fa48("1940")) {
                  {}
                } else {
                  stryCov_9fa48("1940");
                  const [search, replace] = stryMutAct_9fa48("1941") ? transform.split('|') : (stryCov_9fa48("1941"), transform.substring(8).split(stryMutAct_9fa48("1942") ? "" : (stryCov_9fa48("1942"), '|')));
                  if (stryMutAct_9fa48("1945") ? search || replace : stryMutAct_9fa48("1944") ? false : stryMutAct_9fa48("1943") ? true : (stryCov_9fa48("1943", "1944", "1945"), search && replace)) {
                    if (stryMutAct_9fa48("1946")) {
                      {}
                    } else {
                      stryCov_9fa48("1946");
                      result = result.replace(new RegExp(search, stryMutAct_9fa48("1947") ? "" : (stryCov_9fa48("1947"), 'g')), replace);
                    }
                  }
                }
              }
            }
          } catch (error) {
            if (stryMutAct_9fa48("1948")) {
              {}
            } else {
              stryCov_9fa48("1948");
              console.warn(stryMutAct_9fa48("1949") ? `` : (stryCov_9fa48("1949"), `Failed to apply transformation: ${transform}`), error);
            }
          }
        }
      }
      return result;
    }
  }

  /**
   * Apply transformations to attributes
   */
  protected applyAttributeTransformations(attributes: Record<string, string[]>, transformations: Record<string, string[]>): Record<string, string[]> {
    if (stryMutAct_9fa48("1950")) {
      {}
    } else {
      stryCov_9fa48("1950");
      const result: Record<string, string[]> = {};
      for (const [attrName, attrValues] of Object.entries(attributes)) {
        if (stryMutAct_9fa48("1951")) {
          {}
        } else {
          stryCov_9fa48("1951");
          const transforms = transformations[attrName];
          if (stryMutAct_9fa48("1953") ? false : stryMutAct_9fa48("1952") ? true : (stryCov_9fa48("1952", "1953"), transforms)) {
            if (stryMutAct_9fa48("1954")) {
              {}
            } else {
              stryCov_9fa48("1954");
              result[attrName] = attrValues.map(stryMutAct_9fa48("1955") ? () => undefined : (stryCov_9fa48("1955"), value => this.applyTransformations(value, transforms)));
            }
          } else {
            if (stryMutAct_9fa48("1956")) {
              {}
            } else {
              stryCov_9fa48("1956");
              result[attrName] = attrValues;
            }
          }
        }
      }
      return result;
    }
  }

  /**
   * Merge embedded JSON data with extracted data
   */
  protected mergeEmbeddedData(product: RawProduct, embeddedData: Record<string, unknown>[]): void {
    if (stryMutAct_9fa48("1957")) {
      {}
    } else {
      stryCov_9fa48("1957");
      // This is a basic implementation - you might want to make this more sophisticated
      for (const data of embeddedData) {
        if (stryMutAct_9fa48("1958")) {
          {}
        } else {
          stryCov_9fa48("1958");
          if (stryMutAct_9fa48("1961") ? data.name && !product.title || typeof data.name === 'string' : stryMutAct_9fa48("1960") ? false : stryMutAct_9fa48("1959") ? true : (stryCov_9fa48("1959", "1960", "1961"), (stryMutAct_9fa48("1963") ? data.name || !product.title : stryMutAct_9fa48("1962") ? true : (stryCov_9fa48("1962", "1963"), data.name && (stryMutAct_9fa48("1964") ? product.title : (stryCov_9fa48("1964"), !product.title)))) && (stryMutAct_9fa48("1966") ? typeof data.name !== 'string' : stryMutAct_9fa48("1965") ? true : (stryCov_9fa48("1965", "1966"), typeof data.name === (stryMutAct_9fa48("1967") ? "" : (stryCov_9fa48("1967"), 'string')))))) {
            if (stryMutAct_9fa48("1968")) {
              {}
            } else {
              stryCov_9fa48("1968");
              product.title = data.name;
            }
          }
          if (stryMutAct_9fa48("1971") ? data.description && !product.description || typeof data.description === 'string' : stryMutAct_9fa48("1970") ? false : stryMutAct_9fa48("1969") ? true : (stryCov_9fa48("1969", "1970", "1971"), (stryMutAct_9fa48("1973") ? data.description || !product.description : stryMutAct_9fa48("1972") ? true : (stryCov_9fa48("1972", "1973"), data.description && (stryMutAct_9fa48("1974") ? product.description : (stryCov_9fa48("1974"), !product.description)))) && (stryMutAct_9fa48("1976") ? typeof data.description !== 'string' : stryMutAct_9fa48("1975") ? true : (stryCov_9fa48("1975", "1976"), typeof data.description === (stryMutAct_9fa48("1977") ? "" : (stryCov_9fa48("1977"), 'string')))))) {
            if (stryMutAct_9fa48("1978")) {
              {}
            } else {
              stryCov_9fa48("1978");
              product.description = data.description;
            }
          }
          if (stryMutAct_9fa48("1981") ? data.sku && !product.sku || typeof data.sku === 'string' : stryMutAct_9fa48("1980") ? false : stryMutAct_9fa48("1979") ? true : (stryCov_9fa48("1979", "1980", "1981"), (stryMutAct_9fa48("1983") ? data.sku || !product.sku : stryMutAct_9fa48("1982") ? true : (stryCov_9fa48("1982", "1983"), data.sku && (stryMutAct_9fa48("1984") ? product.sku : (stryCov_9fa48("1984"), !product.sku)))) && (stryMutAct_9fa48("1986") ? typeof data.sku !== 'string' : stryMutAct_9fa48("1985") ? true : (stryCov_9fa48("1985", "1986"), typeof data.sku === (stryMutAct_9fa48("1987") ? "" : (stryCov_9fa48("1987"), 'string')))))) {
            if (stryMutAct_9fa48("1988")) {
              {}
            } else {
              stryCov_9fa48("1988");
              product.sku = data.sku;
            }
          }
          if (stryMutAct_9fa48("1991") ? data.price && product.variations || product.variations.length > 0 : stryMutAct_9fa48("1990") ? false : stryMutAct_9fa48("1989") ? true : (stryCov_9fa48("1989", "1990", "1991"), (stryMutAct_9fa48("1993") ? data.price || product.variations : stryMutAct_9fa48("1992") ? true : (stryCov_9fa48("1992", "1993"), data.price && product.variations)) && (stryMutAct_9fa48("1996") ? product.variations.length <= 0 : stryMutAct_9fa48("1995") ? product.variations.length >= 0 : stryMutAct_9fa48("1994") ? true : (stryCov_9fa48("1994", "1995", "1996"), product.variations.length > 0)))) {
            if (stryMutAct_9fa48("1997")) {
              {}
            } else {
              stryCov_9fa48("1997");
              const firstVariation = product.variations[0];
              if (stryMutAct_9fa48("1999") ? false : stryMutAct_9fa48("1998") ? true : (stryCov_9fa48("1998", "1999"), firstVariation)) {
                if (stryMutAct_9fa48("2000")) {
                  {}
                } else {
                  stryCov_9fa48("2000");
                  firstVariation.regularPrice = data.price.toString();
                }
              }
            }
          }
        }
      }
    }
  }

  /**
   * Extract sale price if available
   */
  private extractSalePrice(dom: JSDOM, priceSelectors: string | string[]): string {
    if (stryMutAct_9fa48("2001")) {
      {}
    } else {
      stryCov_9fa48("2001");
      const selectorArray = Array.isArray(priceSelectors) ? priceSelectors : stryMutAct_9fa48("2002") ? [] : (stryCov_9fa48("2002"), [priceSelectors]);
      for (const selector of selectorArray) {
        if (stryMutAct_9fa48("2003")) {
          {}
        } else {
          stryCov_9fa48("2003");
          // Look for sale price indicators
          const salePriceSelectors = stryMutAct_9fa48("2004") ? [] : (stryCov_9fa48("2004"), [stryMutAct_9fa48("2005") ? `` : (stryCov_9fa48("2005"), `${selector}.sale-price`), stryMutAct_9fa48("2006") ? `` : (stryCov_9fa48("2006"), `${selector}.discount-price`), stryMutAct_9fa48("2007") ? `` : (stryCov_9fa48("2007"), `${selector}[class*="sale"]`), stryMutAct_9fa48("2008") ? `` : (stryCov_9fa48("2008"), `${selector}[class*="discount"]`), stryMutAct_9fa48("2009") ? "" : (stryCov_9fa48("2009"), '.sale-price'), stryMutAct_9fa48("2010") ? "" : (stryCov_9fa48("2010"), '.discount-price'), stryMutAct_9fa48("2011") ? "" : (stryCov_9fa48("2011"), '.price .sale'), stryMutAct_9fa48("2012") ? "" : (stryCov_9fa48("2012"), '.price .discount'), stryMutAct_9fa48("2013") ? "" : (stryCov_9fa48("2013"), '[class*="sale-price"]'), stryMutAct_9fa48("2014") ? "" : (stryCov_9fa48("2014"), '[class*="discount-price"]')]);
          for (const saleSelector of salePriceSelectors) {
            if (stryMutAct_9fa48("2015")) {
              {}
            } else {
              stryCov_9fa48("2015");
              const saleElement = dom.window.document.querySelector(saleSelector);
              if (stryMutAct_9fa48("2017") ? false : stryMutAct_9fa48("2016") ? true : (stryCov_9fa48("2016", "2017"), saleElement)) {
                if (stryMutAct_9fa48("2018")) {
                  {}
                } else {
                  stryCov_9fa48("2018");
                  const saleText = stryMutAct_9fa48("2020") ? saleElement.textContent.trim() : stryMutAct_9fa48("2019") ? saleElement.textContent : (stryCov_9fa48("2019", "2020"), saleElement.textContent?.trim());
                  if (stryMutAct_9fa48("2023") ? saleText || this.isValidPrice(saleText) : stryMutAct_9fa48("2022") ? false : stryMutAct_9fa48("2021") ? true : (stryCov_9fa48("2021", "2022", "2023"), saleText && this.isValidPrice(saleText))) {
                    if (stryMutAct_9fa48("2024")) {
                      {}
                    } else {
                      stryCov_9fa48("2024");
                      if (stryMutAct_9fa48("2027") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("2026") ? false : stryMutAct_9fa48("2025") ? true : (stryCov_9fa48("2025", "2026", "2027"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("2028") ? "" : (stryCov_9fa48("2028"), '1')))) console.log(stryMutAct_9fa48("2029") ? `` : (stryCov_9fa48("2029"), `Found sale price: ${saleText}`));
                      return this.cleanPrice(saleText);
                    }
                  }
                }
              }
            }
          }

          // Also check if the main price selector has a sale indicator
          const mainPriceElement = dom.window.document.querySelector(selector);
          if (stryMutAct_9fa48("2031") ? false : stryMutAct_9fa48("2030") ? true : (stryCov_9fa48("2030", "2031"), mainPriceElement)) {
            if (stryMutAct_9fa48("2032")) {
              {}
            } else {
              stryCov_9fa48("2032");
              const parentElement = mainPriceElement.parentElement;
              if (stryMutAct_9fa48("2035") ? parentElement || parentElement.classList.contains('sale') || parentElement.classList.contains('discount') || parentElement.querySelector('.sale, .discount, .sale-price, .discount-price') : stryMutAct_9fa48("2034") ? false : stryMutAct_9fa48("2033") ? true : (stryCov_9fa48("2033", "2034", "2035"), parentElement && (stryMutAct_9fa48("2037") ? (parentElement.classList.contains('sale') || parentElement.classList.contains('discount')) && parentElement.querySelector('.sale, .discount, .sale-price, .discount-price') : stryMutAct_9fa48("2036") ? true : (stryCov_9fa48("2036", "2037"), (stryMutAct_9fa48("2039") ? parentElement.classList.contains('sale') && parentElement.classList.contains('discount') : stryMutAct_9fa48("2038") ? false : (stryCov_9fa48("2038", "2039"), parentElement.classList.contains(stryMutAct_9fa48("2040") ? "" : (stryCov_9fa48("2040"), 'sale')) || parentElement.classList.contains(stryMutAct_9fa48("2041") ? "" : (stryCov_9fa48("2041"), 'discount')))) || parentElement.querySelector(stryMutAct_9fa48("2042") ? "" : (stryCov_9fa48("2042"), '.sale, .discount, .sale-price, .discount-price')))))) {
                if (stryMutAct_9fa48("2043")) {
                  {}
                } else {
                  stryCov_9fa48("2043");
                  const priceText = stryMutAct_9fa48("2045") ? mainPriceElement.textContent.trim() : stryMutAct_9fa48("2044") ? mainPriceElement.textContent : (stryCov_9fa48("2044", "2045"), mainPriceElement.textContent?.trim());
                  if (stryMutAct_9fa48("2048") ? priceText || this.isValidPrice(priceText) : stryMutAct_9fa48("2047") ? false : stryMutAct_9fa48("2046") ? true : (stryCov_9fa48("2046", "2047", "2048"), priceText && this.isValidPrice(priceText))) {
                    if (stryMutAct_9fa48("2049")) {
                      {}
                    } else {
                      stryCov_9fa48("2049");
                      if (stryMutAct_9fa48("2052") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("2051") ? false : stryMutAct_9fa48("2050") ? true : (stryCov_9fa48("2050", "2051", "2052"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("2053") ? "" : (stryCov_9fa48("2053"), '1')))) console.log(stryMutAct_9fa48("2054") ? `` : (stryCov_9fa48("2054"), `Found sale price from main selector: ${priceText}`));
                      return this.cleanPrice(priceText);
                    }
                  }
                }
              }
            }
          }
        }
      }
      return stryMutAct_9fa48("2055") ? "Stryker was here!" : (stryCov_9fa48("2055"), '');
    }
  }

  /**
   * Check if text is a valid price
   */
  private isValidPrice(text: string): boolean {
    if (stryMutAct_9fa48("2056")) {
      {}
    } else {
      stryCov_9fa48("2056");
      if (stryMutAct_9fa48("2059") ? false : stryMutAct_9fa48("2058") ? true : stryMutAct_9fa48("2057") ? text : (stryCov_9fa48("2057", "2058", "2059"), !text)) return stryMutAct_9fa48("2060") ? true : (stryCov_9fa48("2060"), false);
      const t = stryMutAct_9fa48("2061") ? text : (stryCov_9fa48("2061"), text.trim());

      // Must contain at least one digit
      if (stryMutAct_9fa48("2064") ? false : stryMutAct_9fa48("2063") ? true : stryMutAct_9fa48("2062") ? /\d/.test(t) : (stryCov_9fa48("2062", "2063", "2064"), !(stryMutAct_9fa48("2065") ? /\D/ : (stryCov_9fa48("2065"), /\d/)).test(t))) return stryMutAct_9fa48("2066") ? true : (stryCov_9fa48("2066"), false);

      // Must be reasonably short (price text shouldn't be very long)
      if (stryMutAct_9fa48("2070") ? t.length <= 50 : stryMutAct_9fa48("2069") ? t.length >= 50 : stryMutAct_9fa48("2068") ? false : stryMutAct_9fa48("2067") ? true : (stryCov_9fa48("2067", "2068", "2069", "2070"), t.length > 50)) return stryMutAct_9fa48("2071") ? true : (stryCov_9fa48("2071"), false);

      // Should contain currency symbols or be numeric
      const currencyPattern = /(₪|\$|€|£)/;
      const numericPattern = stryMutAct_9fa48("2082") ? /^\s*\d+[\d,.]*\S*$/ : stryMutAct_9fa48("2081") ? /^\s*\d+[\d,.]*\s$/ : stryMutAct_9fa48("2080") ? /^\s*\d+[\D,.]*\s*$/ : stryMutAct_9fa48("2079") ? /^\s*\d+[^\d,.]*\s*$/ : stryMutAct_9fa48("2078") ? /^\s*\d+[\d,.]\s*$/ : stryMutAct_9fa48("2077") ? /^\s*\D+[\d,.]*\s*$/ : stryMutAct_9fa48("2076") ? /^\s*\d[\d,.]*\s*$/ : stryMutAct_9fa48("2075") ? /^\S*\d+[\d,.]*\s*$/ : stryMutAct_9fa48("2074") ? /^\s\d+[\d,.]*\s*$/ : stryMutAct_9fa48("2073") ? /^\s*\d+[\d,.]*\s*/ : stryMutAct_9fa48("2072") ? /\s*\d+[\d,.]*\s*$/ : (stryCov_9fa48("2072", "2073", "2074", "2075", "2076", "2077", "2078", "2079", "2080", "2081", "2082"), /^\s*\d+[\d,.]*\s*$/);
      return stryMutAct_9fa48("2085") ? currencyPattern.test(t) && numericPattern.test(t) : stryMutAct_9fa48("2084") ? false : stryMutAct_9fa48("2083") ? true : (stryCov_9fa48("2083", "2084", "2085"), currencyPattern.test(t) || numericPattern.test(t));
    }
  }

  /**
   * Generate a simple ID from URL
   */
  private generateIdFromUrl(url: string): string {
    if (stryMutAct_9fa48("2086")) {
      {}
    } else {
      stryCov_9fa48("2086");
      const urlParts = url.split(stryMutAct_9fa48("2087") ? "" : (stryCov_9fa48("2087"), '/'));
      const lastPart = urlParts[stryMutAct_9fa48("2088") ? urlParts.length + 1 : (stryCov_9fa48("2088"), urlParts.length - 1)];
      return stryMutAct_9fa48("2091") ? lastPart?.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() && 'PRODUCT' : stryMutAct_9fa48("2090") ? false : stryMutAct_9fa48("2089") ? true : (stryCov_9fa48("2089", "2090", "2091"), (stryMutAct_9fa48("2093") ? lastPart.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : stryMutAct_9fa48("2092") ? lastPart?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : (stryCov_9fa48("2092", "2093"), lastPart?.replace(stryMutAct_9fa48("2094") ? /[a-zA-Z0-9]/g : (stryCov_9fa48("2094"), /[^a-zA-Z0-9]/g), stryMutAct_9fa48("2095") ? "Stryker was here!" : (stryCov_9fa48("2095"), '')).toUpperCase())) || (stryMutAct_9fa48("2096") ? "" : (stryCov_9fa48("2096"), 'PRODUCT')));
    }
  }

  /**
   * Validate product data according to recipe validation rules
   */
  validateProduct(product: RawProduct): ValidationError[] {
    if (stryMutAct_9fa48("2097")) {
      {}
    } else {
      stryCov_9fa48("2097");
      const errors: ValidationError[] = stryMutAct_9fa48("2098") ? ["Stryker was here"] : (stryCov_9fa48("2098"), []);
      const {
        validation
      } = this.config;
      if (stryMutAct_9fa48("2101") ? false : stryMutAct_9fa48("2100") ? true : stryMutAct_9fa48("2099") ? validation : (stryCov_9fa48("2099", "2100", "2101"), !validation)) {
        if (stryMutAct_9fa48("2102")) {
          {}
        } else {
          stryCov_9fa48("2102");
          return errors;
        }
      }

      // Check required fields
      if (stryMutAct_9fa48("2104") ? false : stryMutAct_9fa48("2103") ? true : (stryCov_9fa48("2103", "2104"), validation.requiredFields)) {
        if (stryMutAct_9fa48("2105")) {
          {}
        } else {
          stryCov_9fa48("2105");
          for (const field of validation.requiredFields) {
            if (stryMutAct_9fa48("2106")) {
              {}
            } else {
              stryCov_9fa48("2106");
              if (stryMutAct_9fa48("2109") ? !product[field as keyof RawProduct] && typeof product[field as keyof RawProduct] === 'string' && (product[field as keyof RawProduct] as string).trim() === '' : stryMutAct_9fa48("2108") ? false : stryMutAct_9fa48("2107") ? true : (stryCov_9fa48("2107", "2108", "2109"), (stryMutAct_9fa48("2110") ? product[field as keyof RawProduct] : (stryCov_9fa48("2110"), !product[field as keyof RawProduct])) || (stryMutAct_9fa48("2112") ? typeof product[field as keyof RawProduct] === 'string' || (product[field as keyof RawProduct] as string).trim() === '' : stryMutAct_9fa48("2111") ? false : (stryCov_9fa48("2111", "2112"), (stryMutAct_9fa48("2114") ? typeof product[field as keyof RawProduct] !== 'string' : stryMutAct_9fa48("2113") ? true : (stryCov_9fa48("2113", "2114"), typeof product[field as keyof RawProduct] === (stryMutAct_9fa48("2115") ? "" : (stryCov_9fa48("2115"), 'string')))) && (stryMutAct_9fa48("2117") ? (product[field as keyof RawProduct] as string).trim() !== '' : stryMutAct_9fa48("2116") ? true : (stryCov_9fa48("2116", "2117"), (stryMutAct_9fa48("2118") ? product[field as keyof RawProduct] as string : (stryCov_9fa48("2118"), (product[field as keyof RawProduct] as string).trim())) === (stryMutAct_9fa48("2119") ? "Stryker was here!" : (stryCov_9fa48("2119"), '')))))))) {
                if (stryMutAct_9fa48("2120")) {
                  {}
                } else {
                  stryCov_9fa48("2120");
                  errors.push(new ValidationErrorImpl(field, product[field as keyof RawProduct], stryMutAct_9fa48("2121") ? "" : (stryCov_9fa48("2121"), 'required'), stryMutAct_9fa48("2122") ? `` : (stryCov_9fa48("2122"), `Required field '${field}' is missing or empty`)));
                }
              }
            }
          }
        }
      }

      // Check description length
      if (stryMutAct_9fa48("2125") ? validation.minDescriptionLength || product.description : stryMutAct_9fa48("2124") ? false : stryMutAct_9fa48("2123") ? true : (stryCov_9fa48("2123", "2124", "2125"), validation.minDescriptionLength && product.description)) {
        if (stryMutAct_9fa48("2126")) {
          {}
        } else {
          stryCov_9fa48("2126");
          if (stryMutAct_9fa48("2130") ? product.description.length >= validation.minDescriptionLength : stryMutAct_9fa48("2129") ? product.description.length <= validation.minDescriptionLength : stryMutAct_9fa48("2128") ? false : stryMutAct_9fa48("2127") ? true : (stryCov_9fa48("2127", "2128", "2129", "2130"), product.description.length < validation.minDescriptionLength)) {
            if (stryMutAct_9fa48("2131")) {
              {}
            } else {
              stryCov_9fa48("2131");
              errors.push(new ValidationErrorImpl(stryMutAct_9fa48("2132") ? "" : (stryCov_9fa48("2132"), 'description'), product.description.length, validation.minDescriptionLength, stryMutAct_9fa48("2133") ? `` : (stryCov_9fa48("2133"), `Description must be at least ${validation.minDescriptionLength} characters long`)));
            }
          }
        }
      }

      // Check title length
      if (stryMutAct_9fa48("2136") ? validation.maxTitleLength || product.title : stryMutAct_9fa48("2135") ? false : stryMutAct_9fa48("2134") ? true : (stryCov_9fa48("2134", "2135", "2136"), validation.maxTitleLength && product.title)) {
        if (stryMutAct_9fa48("2137")) {
          {}
        } else {
          stryCov_9fa48("2137");
          if (stryMutAct_9fa48("2141") ? product.title.length <= validation.maxTitleLength : stryMutAct_9fa48("2140") ? product.title.length >= validation.maxTitleLength : stryMutAct_9fa48("2139") ? false : stryMutAct_9fa48("2138") ? true : (stryCov_9fa48("2138", "2139", "2140", "2141"), product.title.length > validation.maxTitleLength)) {
            if (stryMutAct_9fa48("2142")) {
              {}
            } else {
              stryCov_9fa48("2142");
              errors.push(new ValidationErrorImpl(stryMutAct_9fa48("2143") ? "" : (stryCov_9fa48("2143"), 'title'), product.title.length, validation.maxTitleLength, stryMutAct_9fa48("2144") ? `` : (stryCov_9fa48("2144"), `Title must be no more than ${validation.maxTitleLength} characters long`)));
            }
          }
        }
      }
      return errors;
    }
  }
}