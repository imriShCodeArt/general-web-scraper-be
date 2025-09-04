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
    if (stryMutAct_9fa48("1957")) {
      {}
    } else {
      stryCov_9fa48("1957");
      super(config, baseUrl);
    }
  }

  /**
   * Discover product URLs using the recipe configuration
   */
  async *discoverProducts(): AsyncIterable<string> {
    if (stryMutAct_9fa48("1958")) {
      {}
    } else {
      stryCov_9fa48("1958");
      const {
        productLinks,
        pagination
      } = this.config.selectors;
      if (stryMutAct_9fa48("1961") ? false : stryMutAct_9fa48("1960") ? true : stryMutAct_9fa48("1959") ? productLinks : (stryCov_9fa48("1959", "1960", "1961"), !productLinks)) {
        if (stryMutAct_9fa48("1962")) {
          {}
        } else {
          stryCov_9fa48("1962");
          throw new Error(stryMutAct_9fa48("1963") ? "" : (stryCov_9fa48("1963"), 'Product links selector not configured in recipe'));
        }
      }
      let currentUrl = this.baseUrl;
      let pageCount = 0;
      const maxPages = stryMutAct_9fa48("1966") ? pagination?.maxPages && 100 : stryMutAct_9fa48("1965") ? false : stryMutAct_9fa48("1964") ? true : (stryCov_9fa48("1964", "1965", "1966"), (stryMutAct_9fa48("1967") ? pagination.maxPages : (stryCov_9fa48("1967"), pagination?.maxPages)) || 100);
      while (stryMutAct_9fa48("1969") ? currentUrl || pageCount < maxPages : stryMutAct_9fa48("1968") ? false : (stryCov_9fa48("1968", "1969"), currentUrl && (stryMutAct_9fa48("1972") ? pageCount >= maxPages : stryMutAct_9fa48("1971") ? pageCount <= maxPages : stryMutAct_9fa48("1970") ? true : (stryCov_9fa48("1970", "1971", "1972"), pageCount < maxPages)))) {
        if (stryMutAct_9fa48("1973")) {
          {}
        } else {
          stryCov_9fa48("1973");
          try {
            if (stryMutAct_9fa48("1974")) {
              {}
            } else {
              stryCov_9fa48("1974");
              const dom = await this.getDom(currentUrl);

              // Capture archive/category title from H1 on listing page
              const h1 = dom.window.document.querySelector(stryMutAct_9fa48("1975") ? "" : (stryCov_9fa48("1975"), 'h1'));
              const archiveTitle = stryMutAct_9fa48("1978") ? h1.textContent?.trim() : stryMutAct_9fa48("1977") ? h1?.textContent.trim() : stryMutAct_9fa48("1976") ? h1?.textContent : (stryCov_9fa48("1976", "1977", "1978"), h1?.textContent?.trim());
              if (stryMutAct_9fa48("1981") ? archiveTitle || archiveTitle.length > 0 : stryMutAct_9fa48("1980") ? false : stryMutAct_9fa48("1979") ? true : (stryCov_9fa48("1979", "1980", "1981"), archiveTitle && (stryMutAct_9fa48("1984") ? archiveTitle.length <= 0 : stryMutAct_9fa48("1983") ? archiveTitle.length >= 0 : stryMutAct_9fa48("1982") ? true : (stryCov_9fa48("1982", "1983", "1984"), archiveTitle.length > 0)))) {
                if (stryMutAct_9fa48("1985")) {
                  {}
                } else {
                  stryCov_9fa48("1985");
                  this.archiveCategory = archiveTitle;
                }
              }

              // Extract product URLs from current page
              const productUrls = this.extractProductUrlsWithSelector(dom, productLinks);
              for (const url of productUrls) {
                if (stryMutAct_9fa48("1986")) {
                  {}
                } else {
                  stryCov_9fa48("1986");
                  yield url;
                }
              }

              // Follow pagination if configured
              if (stryMutAct_9fa48("1989") ? pagination.nextPage : stryMutAct_9fa48("1988") ? false : stryMutAct_9fa48("1987") ? true : (stryCov_9fa48("1987", "1988", "1989"), pagination?.nextPage)) {
                if (stryMutAct_9fa48("1990")) {
                  {}
                } else {
                  stryCov_9fa48("1990");
                  const doc = dom.window.document;

                  // Support multiple potential selectors for "next" including <link rel="next">
                  const selectorCandidates: string[] = stryMutAct_9fa48("1991") ? [] : (stryCov_9fa48("1991"), [pagination.nextPage, stryMutAct_9fa48("1992") ? "" : (stryCov_9fa48("1992"), 'a[rel=\'next\']'), stryMutAct_9fa48("1993") ? "" : (stryCov_9fa48("1993"), 'link[rel=\'next\']'), stryMutAct_9fa48("1994") ? "" : (stryCov_9fa48("1994"), '.pagination__next'), stryMutAct_9fa48("1995") ? "" : (stryCov_9fa48("1995"), '.pagination .next a'), stryMutAct_9fa48("1996") ? "" : (stryCov_9fa48("1996"), '.pagination__item--next a'), stryMutAct_9fa48("1997") ? "" : (stryCov_9fa48("1997"), 'a[aria-label=\'Next\']'), stryMutAct_9fa48("1998") ? "" : (stryCov_9fa48("1998"), 'a[aria-label=\'Weiter\']')]);
                  let nextPageHref: string | null = null;
                  for (const sel of selectorCandidates) {
                    if (stryMutAct_9fa48("1999")) {
                      {}
                    } else {
                      stryCov_9fa48("1999");
                      const el = doc.querySelector(sel);
                      if (stryMutAct_9fa48("2001") ? false : stryMutAct_9fa48("2000") ? true : (stryCov_9fa48("2000", "2001"), el)) {
                        if (stryMutAct_9fa48("2002")) {
                          {}
                        } else {
                          stryCov_9fa48("2002");
                          // If it's a <link> tag in <head>
                          if (stryMutAct_9fa48("2005") ? el.tagName || el.tagName.toLowerCase() === 'link' : stryMutAct_9fa48("2004") ? false : stryMutAct_9fa48("2003") ? true : (stryCov_9fa48("2003", "2004", "2005"), el.tagName && (stryMutAct_9fa48("2007") ? el.tagName.toLowerCase() !== 'link' : stryMutAct_9fa48("2006") ? true : (stryCov_9fa48("2006", "2007"), (stryMutAct_9fa48("2008") ? el.tagName.toUpperCase() : (stryCov_9fa48("2008"), el.tagName.toLowerCase())) === (stryMutAct_9fa48("2009") ? "" : (stryCov_9fa48("2009"), 'link')))))) {
                            if (stryMutAct_9fa48("2010")) {
                              {}
                            } else {
                              stryCov_9fa48("2010");
                              nextPageHref = el.getAttribute(stryMutAct_9fa48("2011") ? "" : (stryCov_9fa48("2011"), 'href'));
                            }
                          } else {
                            if (stryMutAct_9fa48("2012")) {
                              {}
                            } else {
                              stryCov_9fa48("2012");
                              nextPageHref = el.getAttribute(stryMutAct_9fa48("2013") ? "" : (stryCov_9fa48("2013"), 'href'));
                            }
                          }
                          if (stryMutAct_9fa48("2015") ? false : stryMutAct_9fa48("2014") ? true : (stryCov_9fa48("2014", "2015"), nextPageHref)) break;
                        }
                      }
                    }
                  }
                  if (stryMutAct_9fa48("2017") ? false : stryMutAct_9fa48("2016") ? true : (stryCov_9fa48("2016", "2017"), nextPageHref)) {
                    if (stryMutAct_9fa48("2018")) {
                      {}
                    } else {
                      stryCov_9fa48("2018");
                      currentUrl = this.resolveUrl(nextPageHref);
                      stryMutAct_9fa48("2019") ? pageCount-- : (stryCov_9fa48("2019"), pageCount++);
                    }
                  } else {
                    if (stryMutAct_9fa48("2020")) {
                      {}
                    } else {
                      stryCov_9fa48("2020");
                      break;
                    }
                  }
                }
              } else {
                if (stryMutAct_9fa48("2021")) {
                  {}
                } else {
                  stryCov_9fa48("2021");
                  break;
                }
              }
            }
          } catch (error) {
            if (stryMutAct_9fa48("2022")) {
              {}
            } else {
              stryCov_9fa48("2022");
              console.error(stryMutAct_9fa48("2023") ? `` : (stryCov_9fa48("2023"), `Failed to process page ${currentUrl}:`), error);
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
    if (stryMutAct_9fa48("2024")) {
      {}
    } else {
      stryCov_9fa48("2024");
      // Get waitForSelectors from behavior if configured
      const waitForSelectors = stryMutAct_9fa48("2025") ? this.config.behavior.waitForSelectors : (stryCov_9fa48("2025"), this.config.behavior?.waitForSelectors);
      const fastMode = stryMutAct_9fa48("2028") ? this.config.behavior?.fastMode && false : stryMutAct_9fa48("2027") ? false : stryMutAct_9fa48("2026") ? true : (stryCov_9fa48("2026", "2027", "2028"), (stryMutAct_9fa48("2029") ? this.config.behavior.fastMode : (stryCov_9fa48("2029"), this.config.behavior?.fastMode)) || (stryMutAct_9fa48("2030") ? true : (stryCov_9fa48("2030"), false)));
      const dom = await this.getDom(url, waitForSelectors ? stryMutAct_9fa48("2031") ? {} : (stryCov_9fa48("2031"), {
        waitForSelectors
      }) : {});
      const {
        selectors,
        transforms,
        fallbacks
      } = this.config;

      // Extract core product data with fast mode optimizations
      const product: RawProduct = stryMutAct_9fa48("2032") ? {} : (stryCov_9fa48("2032"), {
        id: stryMutAct_9fa48("2035") ? this.extractWithFallbacks(dom, selectors.sku, fallbacks?.sku) && this.generateIdFromUrl(url) : stryMutAct_9fa48("2034") ? false : stryMutAct_9fa48("2033") ? true : (stryCov_9fa48("2033", "2034", "2035"), this.extractWithFallbacks(dom, selectors.sku, stryMutAct_9fa48("2036") ? fallbacks.sku : (stryCov_9fa48("2036"), fallbacks?.sku)) || this.generateIdFromUrl(url)),
        title: this.extractWithFallbacks(dom, selectors.title, stryMutAct_9fa48("2037") ? fallbacks.title : (stryCov_9fa48("2037"), fallbacks?.title)),
        slug: stryMutAct_9fa48("2040") ? this.extractWithFallbacks(dom, selectors.title, fallbacks?.title)?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') && 'product' : stryMutAct_9fa48("2039") ? false : stryMutAct_9fa48("2038") ? true : (stryCov_9fa48("2038", "2039", "2040"), (stryMutAct_9fa48("2042") ? this.extractWithFallbacks(dom, selectors.title, fallbacks?.title).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : stryMutAct_9fa48("2041") ? this.extractWithFallbacks(dom, selectors.title, fallbacks?.title)?.toUpperCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : (stryCov_9fa48("2041", "2042"), this.extractWithFallbacks(dom, selectors.title, stryMutAct_9fa48("2043") ? fallbacks.title : (stryCov_9fa48("2043"), fallbacks?.title))?.toLowerCase().replace(stryMutAct_9fa48("2045") ? /\S+/g : stryMutAct_9fa48("2044") ? /\s/g : (stryCov_9fa48("2044", "2045"), /\s+/g), stryMutAct_9fa48("2046") ? "" : (stryCov_9fa48("2046"), '-')).replace(stryMutAct_9fa48("2047") ? /[a-z0-9-]/g : (stryCov_9fa48("2047"), /[^a-z0-9-]/g), stryMutAct_9fa48("2048") ? "Stryker was here!" : (stryCov_9fa48("2048"), '')))) || (stryMutAct_9fa48("2049") ? "" : (stryCov_9fa48("2049"), 'product'))),
        description: fastMode ? stryMutAct_9fa48("2051") ? this.extractWithFallbacks(dom, selectors.description, selectors.descriptionFallbacks).substring(0, 500) : stryMutAct_9fa48("2050") ? this.extractWithFallbacks(dom, selectors.description, selectors.descriptionFallbacks) : (stryCov_9fa48("2050", "2051"), this.extractWithFallbacks(dom, selectors.description, selectors.descriptionFallbacks)?.substring(0, 500)) : this.extractWithFallbacks(dom, selectors.description, selectors.descriptionFallbacks),
        shortDescription: selectors.shortDescription ? this.extractWithFallbacks(dom, selectors.shortDescription) : undefined,
        sku: this.extractWithFallbacks(dom, selectors.sku, stryMutAct_9fa48("2052") ? fallbacks.sku : (stryCov_9fa48("2052"), fallbacks?.sku)),
        stockStatus: this.extractStockStatusFromSelector(dom, selectors.stock),
        images: fastMode ? stryMutAct_9fa48("2053") ? this.extractImagesFromSelector(dom, selectors.images) : (stryCov_9fa48("2053"), this.extractImagesFromSelector(dom, selectors.images).slice(0, 3)) : this.extractImagesFromSelector(dom, selectors.images),
        // Limit images in fast mode
        category: selectors.category ? this.extractWithFallbacks(dom, selectors.category) : undefined,
        productType: stryMutAct_9fa48("2054") ? "" : (stryCov_9fa48("2054"), 'simple'),
        // Default to simple, could be enhanced to detect variable products
        attributes: fastMode ? {} : this.extractAttributesFromSelector(dom, selectors.attributes),
        // Skip attributes in fast mode
        variations: fastMode ? stryMutAct_9fa48("2055") ? ["Stryker was here"] : (stryCov_9fa48("2055"), []) : this.extractVariationsFromSelector(dom, stryMutAct_9fa48("2058") ? selectors.variations && [] : stryMutAct_9fa48("2057") ? false : stryMutAct_9fa48("2056") ? true : (stryCov_9fa48("2056", "2057", "2058"), selectors.variations || (stryMutAct_9fa48("2059") ? ["Stryker was here"] : (stryCov_9fa48("2059"), [])))),
        // Skip variations in fast mode
        price: this.extractPriceFromSelector(dom, selectors.price),
        salePrice: this.extractSalePrice(dom, selectors.price)
      });

      // Prefer archive H1 as category if configured/available
      if (stryMutAct_9fa48("2062") ? !product.category || this.archiveCategory : stryMutAct_9fa48("2061") ? false : stryMutAct_9fa48("2060") ? true : (stryCov_9fa48("2060", "2061", "2062"), (stryMutAct_9fa48("2063") ? product.category : (stryCov_9fa48("2063"), !product.category)) && this.archiveCategory)) {
        if (stryMutAct_9fa48("2064")) {
          {}
        } else {
          stryCov_9fa48("2064");
          product.category = this.archiveCategory;
        }
      }

      // Apply transformations (simplified in fast mode)
      if (stryMutAct_9fa48("2067") ? transforms || !fastMode : stryMutAct_9fa48("2066") ? false : stryMutAct_9fa48("2065") ? true : (stryCov_9fa48("2065", "2066", "2067"), transforms && (stryMutAct_9fa48("2068") ? fastMode : (stryCov_9fa48("2068"), !fastMode)))) {
        if (stryMutAct_9fa48("2069")) {
          {}
        } else {
          stryCov_9fa48("2069");
          if (stryMutAct_9fa48("2072") ? transforms.title || product.title : stryMutAct_9fa48("2071") ? false : stryMutAct_9fa48("2070") ? true : (stryCov_9fa48("2070", "2071", "2072"), transforms.title && product.title)) {
            if (stryMutAct_9fa48("2073")) {
              {}
            } else {
              stryCov_9fa48("2073");
              product.title = this.applyTransformations(product.title, transforms.title);
            }
          }
          if (stryMutAct_9fa48("2076") ? transforms.price || product.variations : stryMutAct_9fa48("2075") ? false : stryMutAct_9fa48("2074") ? true : (stryCov_9fa48("2074", "2075", "2076"), transforms.price && product.variations)) {
            if (stryMutAct_9fa48("2077")) {
              {}
            } else {
              stryCov_9fa48("2077");
              product.variations = product.variations.map(stryMutAct_9fa48("2078") ? () => undefined : (stryCov_9fa48("2078"), variation => stryMutAct_9fa48("2079") ? {} : (stryCov_9fa48("2079"), {
                ...variation,
                regularPrice: this.applyTransformations(stryMutAct_9fa48("2082") ? variation.regularPrice && '' : stryMutAct_9fa48("2081") ? false : stryMutAct_9fa48("2080") ? true : (stryCov_9fa48("2080", "2081", "2082"), variation.regularPrice || (stryMutAct_9fa48("2083") ? "Stryker was here!" : (stryCov_9fa48("2083"), ''))), transforms.price!)
              })));
            }
          }
          if (stryMutAct_9fa48("2086") ? transforms.description || product.description : stryMutAct_9fa48("2085") ? false : stryMutAct_9fa48("2084") ? true : (stryCov_9fa48("2084", "2085", "2086"), transforms.description && product.description)) {
            if (stryMutAct_9fa48("2087")) {
              {}
            } else {
              stryCov_9fa48("2087");
              product.description = this.applyTransformations(product.description, transforms.description);
            }
          }
          if (stryMutAct_9fa48("2090") ? transforms.attributes || product.attributes : stryMutAct_9fa48("2089") ? false : stryMutAct_9fa48("2088") ? true : (stryCov_9fa48("2088", "2089", "2090"), transforms.attributes && product.attributes)) {
            if (stryMutAct_9fa48("2091")) {
              {}
            } else {
              stryCov_9fa48("2091");
              // Convert the attributes to the expected type for transformations
              const stringAttributes: Record<string, string[]> = {};
              for (const [key, values] of Object.entries(product.attributes)) {
                if (stryMutAct_9fa48("2092")) {
                  {}
                } else {
                  stryCov_9fa48("2092");
                  stringAttributes[key] = stryMutAct_9fa48("2093") ? values : (stryCov_9fa48("2093"), values.filter(stryMutAct_9fa48("2094") ? () => undefined : (stryCov_9fa48("2094"), (v): v is string => stryMutAct_9fa48("2097") ? v === undefined : stryMutAct_9fa48("2096") ? false : stryMutAct_9fa48("2095") ? true : (stryCov_9fa48("2095", "2096", "2097"), v !== undefined))));
                }
              }
              product.attributes = this.applyAttributeTransformations(stringAttributes, transforms.attributes);
            }
          }
        }
      }

      // Extract embedded JSON data if configured
      if (stryMutAct_9fa48("2100") ? selectors.embeddedJson || selectors.embeddedJson.length > 0 : stryMutAct_9fa48("2099") ? false : stryMutAct_9fa48("2098") ? true : (stryCov_9fa48("2098", "2099", "2100"), selectors.embeddedJson && (stryMutAct_9fa48("2103") ? selectors.embeddedJson.length <= 0 : stryMutAct_9fa48("2102") ? selectors.embeddedJson.length >= 0 : stryMutAct_9fa48("2101") ? true : (stryCov_9fa48("2101", "2102", "2103"), selectors.embeddedJson.length > 0)))) {
        if (stryMutAct_9fa48("2104")) {
          {}
        } else {
          stryCov_9fa48("2104");
          const embeddedData = await this.extractEmbeddedJson(url, selectors.embeddedJson);
          if (stryMutAct_9fa48("2108") ? embeddedData.length <= 0 : stryMutAct_9fa48("2107") ? embeddedData.length >= 0 : stryMutAct_9fa48("2106") ? false : stryMutAct_9fa48("2105") ? true : (stryCov_9fa48("2105", "2106", "2107", "2108"), embeddedData.length > 0)) {
            if (stryMutAct_9fa48("2109")) {
              {}
            } else {
              stryCov_9fa48("2109");
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
    if (stryMutAct_9fa48("2110")) {
      {}
    } else {
      stryCov_9fa48("2110");
      const selectorArray = Array.isArray(selectors) ? selectors : stryMutAct_9fa48("2111") ? [] : (stryCov_9fa48("2111"), [selectors]);

      // Try primary selectors first
      for (const selector of selectorArray) {
        if (stryMutAct_9fa48("2112")) {
          {}
        } else {
          stryCov_9fa48("2112");
          const result = this.extractText(dom, selector);
          if (stryMutAct_9fa48("2114") ? false : stryMutAct_9fa48("2113") ? true : (stryCov_9fa48("2113", "2114"), result)) {
            if (stryMutAct_9fa48("2115")) {
              {}
            } else {
              stryCov_9fa48("2115");
              // Filter out price-like content for description fields
              if (stryMutAct_9fa48("2117") ? false : stryMutAct_9fa48("2116") ? true : (stryCov_9fa48("2116", "2117"), this.isPriceLike(result))) {
                if (stryMutAct_9fa48("2118")) {
                  {}
                } else {
                  stryCov_9fa48("2118");
                  if (stryMutAct_9fa48("2121") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("2120") ? false : stryMutAct_9fa48("2119") ? true : (stryCov_9fa48("2119", "2120", "2121"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("2122") ? "" : (stryCov_9fa48("2122"), '1')))) console.log(stryMutAct_9fa48("2123") ? `` : (stryCov_9fa48("2123"), `Skipping price-like content for selector: ${selector} ->`), stryMutAct_9fa48("2124") ? result : (stryCov_9fa48("2124"), result.substring(0, 50)));
                  continue;
                }
              }
              if (stryMutAct_9fa48("2127") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("2126") ? false : stryMutAct_9fa48("2125") ? true : (stryCov_9fa48("2125", "2126", "2127"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("2128") ? "" : (stryCov_9fa48("2128"), '1')))) console.log(stryMutAct_9fa48("2129") ? `` : (stryCov_9fa48("2129"), `Found content with selector: ${selector}`), stryMutAct_9fa48("2130") ? result : (stryCov_9fa48("2130"), result.substring(0, 100)));
              return result;
            }
          } else {
            if (stryMutAct_9fa48("2131")) {
              {}
            } else {
              stryCov_9fa48("2131");
              if (stryMutAct_9fa48("2134") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("2133") ? false : stryMutAct_9fa48("2132") ? true : (stryCov_9fa48("2132", "2133", "2134"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("2135") ? "" : (stryCov_9fa48("2135"), '1')))) console.log(stryMutAct_9fa48("2136") ? `` : (stryCov_9fa48("2136"), `No content found with selector: ${selector}`));
            }
          }
        }
      }

      // Try fallback selectors if available
      if (stryMutAct_9fa48("2138") ? false : stryMutAct_9fa48("2137") ? true : (stryCov_9fa48("2137", "2138"), fallbacks)) {
        if (stryMutAct_9fa48("2139")) {
          {}
        } else {
          stryCov_9fa48("2139");
          if (stryMutAct_9fa48("2142") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("2141") ? false : stryMutAct_9fa48("2140") ? true : (stryCov_9fa48("2140", "2141", "2142"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("2143") ? "" : (stryCov_9fa48("2143"), '1')))) console.log(stryMutAct_9fa48("2144") ? "" : (stryCov_9fa48("2144"), 'Trying fallback selectors:'), fallbacks);
          for (const fallback of fallbacks) {
            if (stryMutAct_9fa48("2145")) {
              {}
            } else {
              stryCov_9fa48("2145");
              const result = this.extractText(dom, fallback);
              if (stryMutAct_9fa48("2147") ? false : stryMutAct_9fa48("2146") ? true : (stryCov_9fa48("2146", "2147"), result)) {
                if (stryMutAct_9fa48("2148")) {
                  {}
                } else {
                  stryCov_9fa48("2148");
                  // Filter out price-like content for fallback selectors too
                  if (stryMutAct_9fa48("2150") ? false : stryMutAct_9fa48("2149") ? true : (stryCov_9fa48("2149", "2150"), this.isPriceLike(result))) {
                    if (stryMutAct_9fa48("2151")) {
                      {}
                    } else {
                      stryCov_9fa48("2151");
                      if (stryMutAct_9fa48("2154") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("2153") ? false : stryMutAct_9fa48("2152") ? true : (stryCov_9fa48("2152", "2153", "2154"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("2155") ? "" : (stryCov_9fa48("2155"), '1')))) console.log(stryMutAct_9fa48("2156") ? `` : (stryCov_9fa48("2156"), `Skipping price-like content for fallback selector: ${fallback} ->`), stryMutAct_9fa48("2157") ? result : (stryCov_9fa48("2157"), result.substring(0, 50)));
                      continue;
                    }
                  }
                  if (stryMutAct_9fa48("2160") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("2159") ? false : stryMutAct_9fa48("2158") ? true : (stryCov_9fa48("2158", "2159", "2160"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("2161") ? "" : (stryCov_9fa48("2161"), '1')))) console.log(stryMutAct_9fa48("2162") ? `` : (stryCov_9fa48("2162"), `Found content with fallback selector: ${fallback}`), stryMutAct_9fa48("2163") ? result : (stryCov_9fa48("2163"), result.substring(0, 100)));
                  return result;
                }
              } else {
                if (stryMutAct_9fa48("2164")) {
                  {}
                } else {
                  stryCov_9fa48("2164");
                  if (stryMutAct_9fa48("2167") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("2166") ? false : stryMutAct_9fa48("2165") ? true : (stryCov_9fa48("2165", "2166", "2167"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("2168") ? "" : (stryCov_9fa48("2168"), '1')))) console.log(stryMutAct_9fa48("2169") ? `` : (stryCov_9fa48("2169"), `No content found with fallback selector: ${fallback}`));
                }
              }
            }
          }
        }
      }
      if (stryMutAct_9fa48("2172") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("2171") ? false : stryMutAct_9fa48("2170") ? true : (stryCov_9fa48("2170", "2171", "2172"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("2173") ? "" : (stryCov_9fa48("2173"), '1')))) console.log(stryMutAct_9fa48("2174") ? "" : (stryCov_9fa48("2174"), 'No content found with any selector or fallback'));
      return stryMutAct_9fa48("2175") ? "Stryker was here!" : (stryCov_9fa48("2175"), '');
    }
  }

  /**
   * Check if text looks like a price (should not be used for descriptions)
   */
  private isPriceLike(text: string): boolean {
    if (stryMutAct_9fa48("2176")) {
      {}
    } else {
      stryCov_9fa48("2176");
      if (stryMutAct_9fa48("2179") ? false : stryMutAct_9fa48("2178") ? true : stryMutAct_9fa48("2177") ? text : (stryCov_9fa48("2177", "2178", "2179"), !text)) return stryMutAct_9fa48("2180") ? true : (stryCov_9fa48("2180"), false);
      const t = stryMutAct_9fa48("2181") ? text : (stryCov_9fa48("2181"), text.trim());

      // Common currency tokens and numeric patterns
      const currencyPattern = /(₪|\$|€|£)/;
      const numberPattern = stryMutAct_9fa48("2198") ? /^\s*(₪|\$|€|£)?\s*\d+[\d,.]*\s*(₪|\$|€|£)?\S*$/ : stryMutAct_9fa48("2197") ? /^\s*(₪|\$|€|£)?\s*\d+[\d,.]*\s*(₪|\$|€|£)?\s$/ : stryMutAct_9fa48("2196") ? /^\s*(₪|\$|€|£)?\s*\d+[\d,.]*\s*(₪|\$|€|£)\s*$/ : stryMutAct_9fa48("2195") ? /^\s*(₪|\$|€|£)?\s*\d+[\d,.]*\S*(₪|\$|€|£)?\s*$/ : stryMutAct_9fa48("2194") ? /^\s*(₪|\$|€|£)?\s*\d+[\d,.]*\s(₪|\$|€|£)?\s*$/ : stryMutAct_9fa48("2193") ? /^\s*(₪|\$|€|£)?\s*\d+[\D,.]*\s*(₪|\$|€|£)?\s*$/ : stryMutAct_9fa48("2192") ? /^\s*(₪|\$|€|£)?\s*\d+[^\d,.]*\s*(₪|\$|€|£)?\s*$/ : stryMutAct_9fa48("2191") ? /^\s*(₪|\$|€|£)?\s*\d+[\d,.]\s*(₪|\$|€|£)?\s*$/ : stryMutAct_9fa48("2190") ? /^\s*(₪|\$|€|£)?\s*\D+[\d,.]*\s*(₪|\$|€|£)?\s*$/ : stryMutAct_9fa48("2189") ? /^\s*(₪|\$|€|£)?\s*\d[\d,.]*\s*(₪|\$|€|£)?\s*$/ : stryMutAct_9fa48("2188") ? /^\s*(₪|\$|€|£)?\S*\d+[\d,.]*\s*(₪|\$|€|£)?\s*$/ : stryMutAct_9fa48("2187") ? /^\s*(₪|\$|€|£)?\s\d+[\d,.]*\s*(₪|\$|€|£)?\s*$/ : stryMutAct_9fa48("2186") ? /^\s*(₪|\$|€|£)\s*\d+[\d,.]*\s*(₪|\$|€|£)?\s*$/ : stryMutAct_9fa48("2185") ? /^\S*(₪|\$|€|£)?\s*\d+[\d,.]*\s*(₪|\$|€|£)?\s*$/ : stryMutAct_9fa48("2184") ? /^\s(₪|\$|€|£)?\s*\d+[\d,.]*\s*(₪|\$|€|£)?\s*$/ : stryMutAct_9fa48("2183") ? /^\s*(₪|\$|€|£)?\s*\d+[\d,.]*\s*(₪|\$|€|£)?\s*/ : stryMutAct_9fa48("2182") ? /\s*(₪|\$|€|£)?\s*\d+[\d,.]*\s*(₪|\$|€|£)?\s*$/ : (stryCov_9fa48("2182", "2183", "2184", "2185", "2186", "2187", "2188", "2189", "2190", "2191", "2192", "2193", "2194", "2195", "2196", "2197", "2198"), /^\s*(₪|\$|€|£)?\s*\d+[\d,.]*\s*(₪|\$|€|£)?\s*$/);
      const containsOnlyPrice = numberPattern.test(t);
      const containsCurrencyAndNumber = stryMutAct_9fa48("2201") ? currencyPattern.test(t) && /\d/.test(t) || t.length <= 20 : stryMutAct_9fa48("2200") ? false : stryMutAct_9fa48("2199") ? true : (stryCov_9fa48("2199", "2200", "2201"), (stryMutAct_9fa48("2203") ? currencyPattern.test(t) || /\d/.test(t) : stryMutAct_9fa48("2202") ? true : (stryCov_9fa48("2202", "2203"), currencyPattern.test(t) && (stryMutAct_9fa48("2204") ? /\D/ : (stryCov_9fa48("2204"), /\d/)).test(t))) && (stryMutAct_9fa48("2207") ? t.length > 20 : stryMutAct_9fa48("2206") ? t.length < 20 : stryMutAct_9fa48("2205") ? true : (stryCov_9fa48("2205", "2206", "2207"), t.length <= 20)));

      // Hebrew "אין מוצרים בסל" or other cart snippets aren't product descriptions either
      const cartSnippet = /אין מוצרים בסל/;

      // Check for common price-related text patterns
      const pricePatterns = stryMutAct_9fa48("2208") ? [] : (stryCov_9fa48("2208"), [stryMutAct_9fa48("2222") ? /^\s*\d+[\d,.]*\s*₪?\S*$/ : stryMutAct_9fa48("2221") ? /^\s*\d+[\d,.]*\s*₪?\s$/ : stryMutAct_9fa48("2220") ? /^\s*\d+[\d,.]*\s*₪\s*$/ : stryMutAct_9fa48("2219") ? /^\s*\d+[\d,.]*\S*₪?\s*$/ : stryMutAct_9fa48("2218") ? /^\s*\d+[\d,.]*\s₪?\s*$/ : stryMutAct_9fa48("2217") ? /^\s*\d+[\D,.]*\s*₪?\s*$/ : stryMutAct_9fa48("2216") ? /^\s*\d+[^\d,.]*\s*₪?\s*$/ : stryMutAct_9fa48("2215") ? /^\s*\d+[\d,.]\s*₪?\s*$/ : stryMutAct_9fa48("2214") ? /^\s*\D+[\d,.]*\s*₪?\s*$/ : stryMutAct_9fa48("2213") ? /^\s*\d[\d,.]*\s*₪?\s*$/ : stryMutAct_9fa48("2212") ? /^\S*\d+[\d,.]*\s*₪?\s*$/ : stryMutAct_9fa48("2211") ? /^\s\d+[\d,.]*\s*₪?\s*$/ : stryMutAct_9fa48("2210") ? /^\s*\d+[\d,.]*\s*₪?\s*/ : stryMutAct_9fa48("2209") ? /\s*\d+[\d,.]*\s*₪?\s*$/ : (stryCov_9fa48("2209", "2210", "2211", "2212", "2213", "2214", "2215", "2216", "2217", "2218", "2219", "2220", "2221", "2222"), /^\s*\d+[\d,.]*\s*₪?\s*$/), stryMutAct_9fa48("2235") ? /^\s*₪\s*\d+[\d,.]*\S*$/ : stryMutAct_9fa48("2234") ? /^\s*₪\s*\d+[\d,.]*\s$/ : stryMutAct_9fa48("2233") ? /^\s*₪\s*\d+[\D,.]*\s*$/ : stryMutAct_9fa48("2232") ? /^\s*₪\s*\d+[^\d,.]*\s*$/ : stryMutAct_9fa48("2231") ? /^\s*₪\s*\d+[\d,.]\s*$/ : stryMutAct_9fa48("2230") ? /^\s*₪\s*\D+[\d,.]*\s*$/ : stryMutAct_9fa48("2229") ? /^\s*₪\s*\d[\d,.]*\s*$/ : stryMutAct_9fa48("2228") ? /^\s*₪\S*\d+[\d,.]*\s*$/ : stryMutAct_9fa48("2227") ? /^\s*₪\s\d+[\d,.]*\s*$/ : stryMutAct_9fa48("2226") ? /^\S*₪\s*\d+[\d,.]*\s*$/ : stryMutAct_9fa48("2225") ? /^\s₪\s*\d+[\d,.]*\s*$/ : stryMutAct_9fa48("2224") ? /^\s*₪\s*\d+[\d,.]*\s*/ : stryMutAct_9fa48("2223") ? /\s*₪\s*\d+[\d,.]*\s*$/ : (stryCov_9fa48("2223", "2224", "2225", "2226", "2227", "2228", "2229", "2230", "2231", "2232", "2233", "2234", "2235"), /^\s*₪\s*\d+[\d,.]*\s*$/), stryMutAct_9fa48("2248") ? /^\s*\d+[\d,.]*\s*שח\S*$/ : stryMutAct_9fa48("2247") ? /^\s*\d+[\d,.]*\s*שח\s$/ : stryMutAct_9fa48("2246") ? /^\s*\d+[\d,.]*\S*שח\s*$/ : stryMutAct_9fa48("2245") ? /^\s*\d+[\d,.]*\sשח\s*$/ : stryMutAct_9fa48("2244") ? /^\s*\d+[\D,.]*\s*שח\s*$/ : stryMutAct_9fa48("2243") ? /^\s*\d+[^\d,.]*\s*שח\s*$/ : stryMutAct_9fa48("2242") ? /^\s*\d+[\d,.]\s*שח\s*$/ : stryMutAct_9fa48("2241") ? /^\s*\D+[\d,.]*\s*שח\s*$/ : stryMutAct_9fa48("2240") ? /^\s*\d[\d,.]*\s*שח\s*$/ : stryMutAct_9fa48("2239") ? /^\S*\d+[\d,.]*\s*שח\s*$/ : stryMutAct_9fa48("2238") ? /^\s\d+[\d,.]*\s*שח\s*$/ : stryMutAct_9fa48("2237") ? /^\s*\d+[\d,.]*\s*שח\s*/ : stryMutAct_9fa48("2236") ? /\s*\d+[\d,.]*\s*שח\s*$/ : (stryCov_9fa48("2236", "2237", "2238", "2239", "2240", "2241", "2242", "2243", "2244", "2245", "2246", "2247", "2248"), /^\s*\d+[\d,.]*\s*שח\s*$/), stryMutAct_9fa48("2261") ? /^\s*שח\s*\d+[\d,.]*\S*$/ : stryMutAct_9fa48("2260") ? /^\s*שח\s*\d+[\d,.]*\s$/ : stryMutAct_9fa48("2259") ? /^\s*שח\s*\d+[\D,.]*\s*$/ : stryMutAct_9fa48("2258") ? /^\s*שח\s*\d+[^\d,.]*\s*$/ : stryMutAct_9fa48("2257") ? /^\s*שח\s*\d+[\d,.]\s*$/ : stryMutAct_9fa48("2256") ? /^\s*שח\s*\D+[\d,.]*\s*$/ : stryMutAct_9fa48("2255") ? /^\s*שח\s*\d[\d,.]*\s*$/ : stryMutAct_9fa48("2254") ? /^\s*שח\S*\d+[\d,.]*\s*$/ : stryMutAct_9fa48("2253") ? /^\s*שח\s\d+[\d,.]*\s*$/ : stryMutAct_9fa48("2252") ? /^\S*שח\s*\d+[\d,.]*\s*$/ : stryMutAct_9fa48("2251") ? /^\sשח\s*\d+[\d,.]*\s*$/ : stryMutAct_9fa48("2250") ? /^\s*שח\s*\d+[\d,.]*\s*/ : stryMutAct_9fa48("2249") ? /\s*שח\s*\d+[\d,.]*\s*$/ : (stryCov_9fa48("2249", "2250", "2251", "2252", "2253", "2254", "2255", "2256", "2257", "2258", "2259", "2260", "2261"), /^\s*שח\s*\d+[\d,.]*\s*$/), stryMutAct_9fa48("2274") ? /^\s*\d+[\d,.]*\s*ILS\S*$/ : stryMutAct_9fa48("2273") ? /^\s*\d+[\d,.]*\s*ILS\s$/ : stryMutAct_9fa48("2272") ? /^\s*\d+[\d,.]*\S*ILS\s*$/ : stryMutAct_9fa48("2271") ? /^\s*\d+[\d,.]*\sILS\s*$/ : stryMutAct_9fa48("2270") ? /^\s*\d+[\D,.]*\s*ILS\s*$/ : stryMutAct_9fa48("2269") ? /^\s*\d+[^\d,.]*\s*ILS\s*$/ : stryMutAct_9fa48("2268") ? /^\s*\d+[\d,.]\s*ILS\s*$/ : stryMutAct_9fa48("2267") ? /^\s*\D+[\d,.]*\s*ILS\s*$/ : stryMutAct_9fa48("2266") ? /^\s*\d[\d,.]*\s*ILS\s*$/ : stryMutAct_9fa48("2265") ? /^\S*\d+[\d,.]*\s*ILS\s*$/ : stryMutAct_9fa48("2264") ? /^\s\d+[\d,.]*\s*ILS\s*$/ : stryMutAct_9fa48("2263") ? /^\s*\d+[\d,.]*\s*ILS\s*/ : stryMutAct_9fa48("2262") ? /\s*\d+[\d,.]*\s*ILS\s*$/ : (stryCov_9fa48("2262", "2263", "2264", "2265", "2266", "2267", "2268", "2269", "2270", "2271", "2272", "2273", "2274"), /^\s*\d+[\d,.]*\s*ILS\s*$/), stryMutAct_9fa48("2287") ? /^\s*ILS\s*\d+[\d,.]*\S*$/ : stryMutAct_9fa48("2286") ? /^\s*ILS\s*\d+[\d,.]*\s$/ : stryMutAct_9fa48("2285") ? /^\s*ILS\s*\d+[\D,.]*\s*$/ : stryMutAct_9fa48("2284") ? /^\s*ILS\s*\d+[^\d,.]*\s*$/ : stryMutAct_9fa48("2283") ? /^\s*ILS\s*\d+[\d,.]\s*$/ : stryMutAct_9fa48("2282") ? /^\s*ILS\s*\D+[\d,.]*\s*$/ : stryMutAct_9fa48("2281") ? /^\s*ILS\s*\d[\d,.]*\s*$/ : stryMutAct_9fa48("2280") ? /^\s*ILS\S*\d+[\d,.]*\s*$/ : stryMutAct_9fa48("2279") ? /^\s*ILS\s\d+[\d,.]*\s*$/ : stryMutAct_9fa48("2278") ? /^\S*ILS\s*\d+[\d,.]*\s*$/ : stryMutAct_9fa48("2277") ? /^\sILS\s*\d+[\d,.]*\s*$/ : stryMutAct_9fa48("2276") ? /^\s*ILS\s*\d+[\d,.]*\s*/ : stryMutAct_9fa48("2275") ? /\s*ILS\s*\d+[\d,.]*\s*$/ : (stryCov_9fa48("2275", "2276", "2277", "2278", "2279", "2280", "2281", "2282", "2283", "2284", "2285", "2286", "2287"), /^\s*ILS\s*\d+[\d,.]*\s*$/), stryMutAct_9fa48("2300") ? /^\s*\d+[\d,.]*\s*NIS\S*$/ : stryMutAct_9fa48("2299") ? /^\s*\d+[\d,.]*\s*NIS\s$/ : stryMutAct_9fa48("2298") ? /^\s*\d+[\d,.]*\S*NIS\s*$/ : stryMutAct_9fa48("2297") ? /^\s*\d+[\d,.]*\sNIS\s*$/ : stryMutAct_9fa48("2296") ? /^\s*\d+[\D,.]*\s*NIS\s*$/ : stryMutAct_9fa48("2295") ? /^\s*\d+[^\d,.]*\s*NIS\s*$/ : stryMutAct_9fa48("2294") ? /^\s*\d+[\d,.]\s*NIS\s*$/ : stryMutAct_9fa48("2293") ? /^\s*\D+[\d,.]*\s*NIS\s*$/ : stryMutAct_9fa48("2292") ? /^\s*\d[\d,.]*\s*NIS\s*$/ : stryMutAct_9fa48("2291") ? /^\S*\d+[\d,.]*\s*NIS\s*$/ : stryMutAct_9fa48("2290") ? /^\s\d+[\d,.]*\s*NIS\s*$/ : stryMutAct_9fa48("2289") ? /^\s*\d+[\d,.]*\s*NIS\s*/ : stryMutAct_9fa48("2288") ? /\s*\d+[\d,.]*\s*NIS\s*$/ : (stryCov_9fa48("2288", "2289", "2290", "2291", "2292", "2293", "2294", "2295", "2296", "2297", "2298", "2299", "2300"), /^\s*\d+[\d,.]*\s*NIS\s*$/), stryMutAct_9fa48("2313") ? /^\s*NIS\s*\d+[\d,.]*\S*$/ : stryMutAct_9fa48("2312") ? /^\s*NIS\s*\d+[\d,.]*\s$/ : stryMutAct_9fa48("2311") ? /^\s*NIS\s*\d+[\D,.]*\s*$/ : stryMutAct_9fa48("2310") ? /^\s*NIS\s*\d+[^\d,.]*\s*$/ : stryMutAct_9fa48("2309") ? /^\s*NIS\s*\d+[\d,.]\s*$/ : stryMutAct_9fa48("2308") ? /^\s*NIS\s*\D+[\d,.]*\s*$/ : stryMutAct_9fa48("2307") ? /^\s*NIS\s*\d[\d,.]*\s*$/ : stryMutAct_9fa48("2306") ? /^\s*NIS\S*\d+[\d,.]*\s*$/ : stryMutAct_9fa48("2305") ? /^\s*NIS\s\d+[\d,.]*\s*$/ : stryMutAct_9fa48("2304") ? /^\S*NIS\s*\d+[\d,.]*\s*$/ : stryMutAct_9fa48("2303") ? /^\sNIS\s*\d+[\d,.]*\s*$/ : stryMutAct_9fa48("2302") ? /^\s*NIS\s*\d+[\d,.]*\s*/ : stryMutAct_9fa48("2301") ? /\s*NIS\s*\d+[\d,.]*\s*$/ : (stryCov_9fa48("2301", "2302", "2303", "2304", "2305", "2306", "2307", "2308", "2309", "2310", "2311", "2312", "2313"), /^\s*NIS\s*\d+[\d,.]*\s*$/)]);
      const matchesPricePattern = stryMutAct_9fa48("2314") ? pricePatterns.every(pattern => pattern.test(t)) : (stryCov_9fa48("2314"), pricePatterns.some(stryMutAct_9fa48("2315") ? () => undefined : (stryCov_9fa48("2315"), pattern => pattern.test(t))));

      // Check for very short numeric content that's likely a price
      const isShortNumeric = stryMutAct_9fa48("2318") ? t.length <= 15 || /^\s*\d+[\d,.]*\s*$/.test(t) : stryMutAct_9fa48("2317") ? false : stryMutAct_9fa48("2316") ? true : (stryCov_9fa48("2316", "2317", "2318"), (stryMutAct_9fa48("2321") ? t.length > 15 : stryMutAct_9fa48("2320") ? t.length < 15 : stryMutAct_9fa48("2319") ? true : (stryCov_9fa48("2319", "2320", "2321"), t.length <= 15)) && (stryMutAct_9fa48("2332") ? /^\s*\d+[\d,.]*\S*$/ : stryMutAct_9fa48("2331") ? /^\s*\d+[\d,.]*\s$/ : stryMutAct_9fa48("2330") ? /^\s*\d+[\D,.]*\s*$/ : stryMutAct_9fa48("2329") ? /^\s*\d+[^\d,.]*\s*$/ : stryMutAct_9fa48("2328") ? /^\s*\d+[\d,.]\s*$/ : stryMutAct_9fa48("2327") ? /^\s*\D+[\d,.]*\s*$/ : stryMutAct_9fa48("2326") ? /^\s*\d[\d,.]*\s*$/ : stryMutAct_9fa48("2325") ? /^\S*\d+[\d,.]*\s*$/ : stryMutAct_9fa48("2324") ? /^\s\d+[\d,.]*\s*$/ : stryMutAct_9fa48("2323") ? /^\s*\d+[\d,.]*\s*/ : stryMutAct_9fa48("2322") ? /\s*\d+[\d,.]*\s*$/ : (stryCov_9fa48("2322", "2323", "2324", "2325", "2326", "2327", "2328", "2329", "2330", "2331", "2332"), /^\s*\d+[\d,.]*\s*$/)).test(t));
      return stryMutAct_9fa48("2335") ? (containsOnlyPrice || containsCurrencyAndNumber || cartSnippet.test(t) || matchesPricePattern) && isShortNumeric : stryMutAct_9fa48("2334") ? false : stryMutAct_9fa48("2333") ? true : (stryCov_9fa48("2333", "2334", "2335"), (stryMutAct_9fa48("2337") ? (containsOnlyPrice || containsCurrencyAndNumber || cartSnippet.test(t)) && matchesPricePattern : stryMutAct_9fa48("2336") ? false : (stryCov_9fa48("2336", "2337"), (stryMutAct_9fa48("2339") ? (containsOnlyPrice || containsCurrencyAndNumber) && cartSnippet.test(t) : stryMutAct_9fa48("2338") ? false : (stryCov_9fa48("2338", "2339"), (stryMutAct_9fa48("2341") ? containsOnlyPrice && containsCurrencyAndNumber : stryMutAct_9fa48("2340") ? false : (stryCov_9fa48("2340", "2341"), containsOnlyPrice || containsCurrencyAndNumber)) || cartSnippet.test(t))) || matchesPricePattern)) || isShortNumeric);
    }
  }

  /**
   * Extract product URLs using the configured selector
   */
  protected extractProductUrlsWithSelector(dom: JSDOM, selector: string | string[]): string[] {
    if (stryMutAct_9fa48("2342")) {
      {}
    } else {
      stryCov_9fa48("2342");
      const selectorArray = Array.isArray(selector) ? selector : stryMutAct_9fa48("2343") ? [] : (stryCov_9fa48("2343"), [selector]);
      const urls: string[] = stryMutAct_9fa48("2344") ? ["Stryker was here"] : (stryCov_9fa48("2344"), []);
      const seen = new Set<string>();
      for (const sel of selectorArray) {
        if (stryMutAct_9fa48("2345")) {
          {}
        } else {
          stryCov_9fa48("2345");
          const links = dom.window.document.querySelectorAll(sel);
          for (const link of links) {
            if (stryMutAct_9fa48("2346")) {
              {}
            } else {
              stryCov_9fa48("2346");
              const href = link.getAttribute(stryMutAct_9fa48("2347") ? "" : (stryCov_9fa48("2347"), 'href'));
              if (stryMutAct_9fa48("2349") ? false : stryMutAct_9fa48("2348") ? true : (stryCov_9fa48("2348", "2349"), href)) {
                if (stryMutAct_9fa48("2350")) {
                  {}
                } else {
                  stryCov_9fa48("2350");
                  const resolved = this.resolveUrl(href);
                  // Accept only real product pages; exclude add-to-cart and category/archive links
                  // Support both singular and Shopify-style plural product paths
                  const isProduct = /(\/products\/|\/product\/)/.test(resolved);
                  const isAddToCart = (stryMutAct_9fa48("2351") ? /[^?&]add-to-cart=/ : (stryCov_9fa48("2351"), /[?&]add-to-cart=/)).test(resolved);
                  const isCategory = /\/product-category\//.test(resolved);
                  if (stryMutAct_9fa48("2354") ? isProduct && !isAddToCart && !isCategory || !seen.has(resolved) : stryMutAct_9fa48("2353") ? false : stryMutAct_9fa48("2352") ? true : (stryCov_9fa48("2352", "2353", "2354"), (stryMutAct_9fa48("2356") ? isProduct && !isAddToCart || !isCategory : stryMutAct_9fa48("2355") ? true : (stryCov_9fa48("2355", "2356"), (stryMutAct_9fa48("2358") ? isProduct || !isAddToCart : stryMutAct_9fa48("2357") ? true : (stryCov_9fa48("2357", "2358"), isProduct && (stryMutAct_9fa48("2359") ? isAddToCart : (stryCov_9fa48("2359"), !isAddToCart)))) && (stryMutAct_9fa48("2360") ? isCategory : (stryCov_9fa48("2360"), !isCategory)))) && (stryMutAct_9fa48("2361") ? seen.has(resolved) : (stryCov_9fa48("2361"), !seen.has(resolved))))) {
                    if (stryMutAct_9fa48("2362")) {
                      {}
                    } else {
                      stryCov_9fa48("2362");
                      urls.push(resolved);
                      seen.add(resolved);
                    }
                  }
                }
              }
            }
          }
          if (stryMutAct_9fa48("2366") ? urls.length <= 0 : stryMutAct_9fa48("2365") ? urls.length >= 0 : stryMutAct_9fa48("2364") ? false : stryMutAct_9fa48("2363") ? true : (stryCov_9fa48("2363", "2364", "2365", "2366"), urls.length > 0)) break; // Use first successful selector
        }
      }
      return urls;
    }
  }

  /**
   * Extract images using the configured selector
   */
  protected override extractImages(dom: JSDOM, selector: string | string[]): string[] {
    if (stryMutAct_9fa48("2367")) {
      {}
    } else {
      stryCov_9fa48("2367");
      const selectorArray = Array.isArray(selector) ? selector : stryMutAct_9fa48("2368") ? [] : (stryCov_9fa48("2368"), [selector]);

      // Shopify-focused gallery detection
      const doc = dom.window.document;
      const galleryScopes = stryMutAct_9fa48("2369") ? [] : (stryCov_9fa48("2369"), [stryMutAct_9fa48("2370") ? "" : (stryCov_9fa48("2370"), '.product__media'), stryMutAct_9fa48("2371") ? "" : (stryCov_9fa48("2371"), '.product-media'), stryMutAct_9fa48("2372") ? "" : (stryCov_9fa48("2372"), '.product__media-list'), stryMutAct_9fa48("2373") ? "" : (stryCov_9fa48("2373"), '.product__gallery'), stryMutAct_9fa48("2374") ? "" : (stryCov_9fa48("2374"), '[data-product-gallery]')]);

      // More lenient filtering - accept Shopify CDN and site-specific images
      const productCdnFilter = (u: string) => {
        if (stryMutAct_9fa48("2375")) {
          {}
        } else {
          stryCov_9fa48("2375");
          // Accept Shopify CDN images
          if (stryMutAct_9fa48("2377") ? false : stryMutAct_9fa48("2376") ? true : (stryCov_9fa48("2376", "2377"), (stryMutAct_9fa48("2378") ? /cdn\.shopify\.com\/.\/products\// : (stryCov_9fa48("2378"), /cdn\.shopify\.com\/.+\/products\//)).test(u))) return stryMutAct_9fa48("2379") ? false : (stryCov_9fa48("2379"), true);
          // Accept wash-and-dry.eu domain images
          if (stryMutAct_9fa48("2381") ? false : stryMutAct_9fa48("2380") ? true : (stryCov_9fa48("2380", "2381"), (stryMutAct_9fa48("2382") ? /wash-and-dry\.eu.\/files\// : (stryCov_9fa48("2382"), /wash-and-dry\.eu.*\/files\//)).test(u))) return stryMutAct_9fa48("2383") ? false : (stryCov_9fa48("2383"), true);
          // Accept any https URL that looks like a product image
          if (stryMutAct_9fa48("2386") ? u.startsWith('https://') || /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(u) : stryMutAct_9fa48("2385") ? false : stryMutAct_9fa48("2384") ? true : (stryCov_9fa48("2384", "2385", "2386"), (stryMutAct_9fa48("2387") ? u.endsWith('https://') : (stryCov_9fa48("2387"), u.startsWith(stryMutAct_9fa48("2388") ? "" : (stryCov_9fa48("2388"), 'https://')))) && (stryMutAct_9fa48("2389") ? /\.(jpg|jpeg|png|webp|gif)(\?)/i : (stryCov_9fa48("2389"), /\.(jpg|jpeg|png|webp|gif)(\?|$)/i)).test(u))) return stryMutAct_9fa48("2390") ? false : (stryCov_9fa48("2390"), true);
          return stryMutAct_9fa48("2391") ? true : (stryCov_9fa48("2391"), false);
        }
      };
      const notIconFilter = stryMutAct_9fa48("2392") ? () => undefined : (stryCov_9fa48("2392"), (() => {
        const notIconFilter = (u: string) => stryMutAct_9fa48("2393") ? /(icon|sprite|logo|favicon|placeholder)/i.test(u) : (stryCov_9fa48("2393"), !/(icon|sprite|logo|favicon|placeholder)/i.test(u));
        return notIconFilter;
      })());
      const getLargestFromSrcset = (srcset: string): string | null => {
        if (stryMutAct_9fa48("2394")) {
          {}
        } else {
          stryCov_9fa48("2394");
          try {
            if (stryMutAct_9fa48("2395")) {
              {}
            } else {
              stryCov_9fa48("2395");
              const parts = srcset.split(stryMutAct_9fa48("2396") ? "" : (stryCov_9fa48("2396"), ',')).map(stryMutAct_9fa48("2397") ? () => undefined : (stryCov_9fa48("2397"), s => stryMutAct_9fa48("2398") ? s : (stryCov_9fa48("2398"), s.trim())));
              const candidates = stryMutAct_9fa48("2399") ? parts.map(p => {
                const [url, size] = p.split(' ');
                const width = size && size.endsWith('w') ? parseInt(size) : 0;
                return {
                  url,
                  width
                };
              }) : (stryCov_9fa48("2399"), parts.map(p => {
                if (stryMutAct_9fa48("2400")) {
                  {}
                } else {
                  stryCov_9fa48("2400");
                  const [url, size] = p.split(stryMutAct_9fa48("2401") ? "" : (stryCov_9fa48("2401"), ' '));
                  const width = (stryMutAct_9fa48("2404") ? size || size.endsWith('w') : stryMutAct_9fa48("2403") ? false : stryMutAct_9fa48("2402") ? true : (stryCov_9fa48("2402", "2403", "2404"), size && (stryMutAct_9fa48("2405") ? size.startsWith('w') : (stryCov_9fa48("2405"), size.endsWith(stryMutAct_9fa48("2406") ? "" : (stryCov_9fa48("2406"), 'w')))))) ? parseInt(size) : 0;
                  return stryMutAct_9fa48("2407") ? {} : (stryCov_9fa48("2407"), {
                    url,
                    width
                  });
                }
              }).filter(stryMutAct_9fa48("2408") ? () => undefined : (stryCov_9fa48("2408"), c => stryMutAct_9fa48("2409") ? !c.url : (stryCov_9fa48("2409"), !(stryMutAct_9fa48("2410") ? c.url : (stryCov_9fa48("2410"), !c.url))))));
              if (stryMutAct_9fa48("2413") ? candidates.length !== 0 : stryMutAct_9fa48("2412") ? false : stryMutAct_9fa48("2411") ? true : (stryCov_9fa48("2411", "2412", "2413"), candidates.length === 0)) return null;
              stryMutAct_9fa48("2414") ? candidates : (stryCov_9fa48("2414"), candidates.sort(stryMutAct_9fa48("2415") ? () => undefined : (stryCov_9fa48("2415"), (a, b) => stryMutAct_9fa48("2416") ? b.width + a.width : (stryCov_9fa48("2416"), b.width - a.width))));
              return stryMutAct_9fa48("2419") ? candidates[0].url && null : stryMutAct_9fa48("2418") ? false : stryMutAct_9fa48("2417") ? true : (stryCov_9fa48("2417", "2418", "2419"), candidates[0].url || null);
            }
          } catch {
            if (stryMutAct_9fa48("2420")) {
              {}
            } else {
              stryCov_9fa48("2420");
              return null;
            }
          }
        }
      };

      // 0) Try LD+JSON Product images first
      try {
        if (stryMutAct_9fa48("2421")) {
          {}
        } else {
          stryCov_9fa48("2421");
          const ldScripts = Array.from(doc.querySelectorAll(stryMutAct_9fa48("2422") ? "" : (stryCov_9fa48("2422"), 'script[type=\'application/ld+json\']')));
          const ldImages: string[] = stryMutAct_9fa48("2423") ? ["Stryker was here"] : (stryCov_9fa48("2423"), []);
          for (const s of ldScripts) {
            if (stryMutAct_9fa48("2424")) {
              {}
            } else {
              stryCov_9fa48("2424");
              const raw = stryMutAct_9fa48("2426") ? s.textContent.trim() : stryMutAct_9fa48("2425") ? s.textContent : (stryCov_9fa48("2425", "2426"), s.textContent?.trim());
              if (stryMutAct_9fa48("2429") ? false : stryMutAct_9fa48("2428") ? true : stryMutAct_9fa48("2427") ? raw : (stryCov_9fa48("2427", "2428", "2429"), !raw)) continue;
              let json: Record<string, unknown>;
              try {
                if (stryMutAct_9fa48("2430")) {
                  {}
                } else {
                  stryCov_9fa48("2430");
                  json = JSON.parse(raw);
                }
              } catch {
                if (stryMutAct_9fa48("2431")) {
                  {}
                } else {
                  stryCov_9fa48("2431");
                  continue;
                }
              }
              const products: Record<string, unknown>[] = stryMutAct_9fa48("2432") ? ["Stryker was here"] : (stryCov_9fa48("2432"), []);
              if (stryMutAct_9fa48("2435") ? json || json['@type'] === 'Product' : stryMutAct_9fa48("2434") ? false : stryMutAct_9fa48("2433") ? true : (stryCov_9fa48("2433", "2434", "2435"), json && (stryMutAct_9fa48("2437") ? json['@type'] !== 'Product' : stryMutAct_9fa48("2436") ? true : (stryCov_9fa48("2436", "2437"), json[stryMutAct_9fa48("2438") ? "" : (stryCov_9fa48("2438"), '@type')] === (stryMutAct_9fa48("2439") ? "" : (stryCov_9fa48("2439"), 'Product')))))) products.push(json);
              if (stryMutAct_9fa48("2441") ? false : stryMutAct_9fa48("2440") ? true : (stryCov_9fa48("2440", "2441"), Array.isArray(json))) products.push(...(stryMutAct_9fa48("2442") ? json : (stryCov_9fa48("2442"), json.filter(stryMutAct_9fa48("2443") ? () => undefined : (stryCov_9fa48("2443"), j => stryMutAct_9fa48("2446") ? j['@type'] !== 'Product' : stryMutAct_9fa48("2445") ? false : stryMutAct_9fa48("2444") ? true : (stryCov_9fa48("2444", "2445", "2446"), j[stryMutAct_9fa48("2447") ? "" : (stryCov_9fa48("2447"), '@type')] === (stryMutAct_9fa48("2448") ? "" : (stryCov_9fa48("2448"), 'Product'))))))));
              if (stryMutAct_9fa48("2450") ? false : stryMutAct_9fa48("2449") ? true : (stryCov_9fa48("2449", "2450"), Array.isArray(json[stryMutAct_9fa48("2451") ? "" : (stryCov_9fa48("2451"), '@graph')]))) products.push(...(stryMutAct_9fa48("2452") ? json['@graph'] : (stryCov_9fa48("2452"), json[stryMutAct_9fa48("2453") ? "" : (stryCov_9fa48("2453"), '@graph')].filter(stryMutAct_9fa48("2454") ? () => undefined : (stryCov_9fa48("2454"), (g: Record<string, unknown>) => stryMutAct_9fa48("2457") ? g['@type'] !== 'Product' : stryMutAct_9fa48("2456") ? false : stryMutAct_9fa48("2455") ? true : (stryCov_9fa48("2455", "2456", "2457"), g[stryMutAct_9fa48("2458") ? "" : (stryCov_9fa48("2458"), '@type')] === (stryMutAct_9fa48("2459") ? "" : (stryCov_9fa48("2459"), 'Product'))))))));
              for (const p of products) {
                if (stryMutAct_9fa48("2460")) {
                  {}
                } else {
                  stryCov_9fa48("2460");
                  if (stryMutAct_9fa48("2462") ? false : stryMutAct_9fa48("2461") ? true : (stryCov_9fa48("2461", "2462"), p.image)) {
                    if (stryMutAct_9fa48("2463")) {
                      {}
                    } else {
                      stryCov_9fa48("2463");
                      if (stryMutAct_9fa48("2466") ? typeof p.image !== 'string' : stryMutAct_9fa48("2465") ? false : stryMutAct_9fa48("2464") ? true : (stryCov_9fa48("2464", "2465", "2466"), typeof p.image === (stryMutAct_9fa48("2467") ? "" : (stryCov_9fa48("2467"), 'string')))) {
                        if (stryMutAct_9fa48("2468")) {
                          {}
                        } else {
                          stryCov_9fa48("2468");
                          ldImages.push(p.image);
                        }
                      } else if (stryMutAct_9fa48("2470") ? false : stryMutAct_9fa48("2469") ? true : (stryCov_9fa48("2469", "2470"), Array.isArray(p.image))) {
                        if (stryMutAct_9fa48("2471")) {
                          {}
                        } else {
                          stryCov_9fa48("2471");
                          for (const im of p.image) if (stryMutAct_9fa48("2474") ? typeof im !== 'string' : stryMutAct_9fa48("2473") ? false : stryMutAct_9fa48("2472") ? true : (stryCov_9fa48("2472", "2473", "2474"), typeof im === (stryMutAct_9fa48("2475") ? "" : (stryCov_9fa48("2475"), 'string')))) ldImages.push(im);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          const filteredLd = stryMutAct_9fa48("2477") ? ldImages.map(u => this.resolveUrl(u)).filter(notIconFilter) : stryMutAct_9fa48("2476") ? ldImages.map(u => this.resolveUrl(u)).filter(productCdnFilter) : (stryCov_9fa48("2476", "2477"), ldImages.map(stryMutAct_9fa48("2478") ? () => undefined : (stryCov_9fa48("2478"), u => this.resolveUrl(u))).filter(productCdnFilter).filter(notIconFilter));
          if (stryMutAct_9fa48("2482") ? filteredLd.length <= 0 : stryMutAct_9fa48("2481") ? filteredLd.length >= 0 : stryMutAct_9fa48("2480") ? false : stryMutAct_9fa48("2479") ? true : (stryCov_9fa48("2479", "2480", "2481", "2482"), filteredLd.length > 0)) {
            if (stryMutAct_9fa48("2483")) {
              {}
            } else {
              stryCov_9fa48("2483");
              if (stryMutAct_9fa48("2486") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("2485") ? false : stryMutAct_9fa48("2484") ? true : (stryCov_9fa48("2484", "2485", "2486"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("2487") ? "" : (stryCov_9fa48("2487"), '1')))) console.log(stryMutAct_9fa48("2488") ? `` : (stryCov_9fa48("2488"), `[extractImages] Found ${filteredLd.length} LD+JSON images, but continuing to check configured selectors`));
              // Don't return immediately - continue to check configured selectors for more images
            }
          }
        }
      } catch {
        // Ignore errors and continue with other methods
      }

      // 0b) Try Shopify Product JSON (script id starts with ProductJson)
      try {
        if (stryMutAct_9fa48("2489")) {
          {}
        } else {
          stryCov_9fa48("2489");
          const productJsonScripts = Array.from(doc.querySelectorAll(stryMutAct_9fa48("2490") ? "" : (stryCov_9fa48("2490"), 'script[id^=\'ProductJson\']')));
          const jsonImages: string[] = stryMutAct_9fa48("2491") ? ["Stryker was here"] : (stryCov_9fa48("2491"), []);
          for (const s of productJsonScripts) {
            if (stryMutAct_9fa48("2492")) {
              {}
            } else {
              stryCov_9fa48("2492");
              const raw = stryMutAct_9fa48("2494") ? s.textContent.trim() : stryMutAct_9fa48("2493") ? s.textContent : (stryCov_9fa48("2493", "2494"), s.textContent?.trim());
              if (stryMutAct_9fa48("2497") ? false : stryMutAct_9fa48("2496") ? true : stryMutAct_9fa48("2495") ? raw : (stryCov_9fa48("2495", "2496", "2497"), !raw)) continue;
              let json: Record<string, unknown>;
              try {
                if (stryMutAct_9fa48("2498")) {
                  {}
                } else {
                  stryCov_9fa48("2498");
                  json = JSON.parse(raw);
                }
              } catch {
                if (stryMutAct_9fa48("2499")) {
                  {}
                } else {
                  stryCov_9fa48("2499");
                  continue;
                }
              }
              // Common Shopify product JSON: images: string[] or media: [{src|preview_image}]
              if (stryMutAct_9fa48("2501") ? false : stryMutAct_9fa48("2500") ? true : (stryCov_9fa48("2500", "2501"), Array.isArray(stryMutAct_9fa48("2502") ? json.images : (stryCov_9fa48("2502"), json?.images)))) {
                if (stryMutAct_9fa48("2503")) {
                  {}
                } else {
                  stryCov_9fa48("2503");
                  for (const u of json.images) if (stryMutAct_9fa48("2506") ? typeof u !== 'string' : stryMutAct_9fa48("2505") ? false : stryMutAct_9fa48("2504") ? true : (stryCov_9fa48("2504", "2505", "2506"), typeof u === (stryMutAct_9fa48("2507") ? "" : (stryCov_9fa48("2507"), 'string')))) jsonImages.push(u);
                }
              }
              if (stryMutAct_9fa48("2509") ? false : stryMutAct_9fa48("2508") ? true : (stryCov_9fa48("2508", "2509"), Array.isArray(stryMutAct_9fa48("2510") ? json.media : (stryCov_9fa48("2510"), json?.media)))) {
                if (stryMutAct_9fa48("2511")) {
                  {}
                } else {
                  stryCov_9fa48("2511");
                  for (const m of json.media) {
                    if (stryMutAct_9fa48("2512")) {
                      {}
                    } else {
                      stryCov_9fa48("2512");
                      const u = stryMutAct_9fa48("2515") ? (m?.src || m?.preview_image?.src || m?.image) && m?.url : stryMutAct_9fa48("2514") ? false : stryMutAct_9fa48("2513") ? true : (stryCov_9fa48("2513", "2514", "2515"), (stryMutAct_9fa48("2517") ? (m?.src || m?.preview_image?.src) && m?.image : stryMutAct_9fa48("2516") ? false : (stryCov_9fa48("2516", "2517"), (stryMutAct_9fa48("2519") ? m?.src && m?.preview_image?.src : stryMutAct_9fa48("2518") ? false : (stryCov_9fa48("2518", "2519"), (stryMutAct_9fa48("2520") ? m.src : (stryCov_9fa48("2520"), m?.src)) || (stryMutAct_9fa48("2522") ? m.preview_image?.src : stryMutAct_9fa48("2521") ? m?.preview_image.src : (stryCov_9fa48("2521", "2522"), m?.preview_image?.src)))) || (stryMutAct_9fa48("2523") ? m.image : (stryCov_9fa48("2523"), m?.image)))) || (stryMutAct_9fa48("2524") ? m.url : (stryCov_9fa48("2524"), m?.url)));
                      if (stryMutAct_9fa48("2527") ? typeof u !== 'string' : stryMutAct_9fa48("2526") ? false : stryMutAct_9fa48("2525") ? true : (stryCov_9fa48("2525", "2526", "2527"), typeof u === (stryMutAct_9fa48("2528") ? "" : (stryCov_9fa48("2528"), 'string')))) jsonImages.push(u);
                    }
                  }
                }
              }
            }
          }
          const filteredJson = stryMutAct_9fa48("2530") ? jsonImages.map(u => this.resolveUrl(u)).filter(notIconFilter) : stryMutAct_9fa48("2529") ? jsonImages.map(u => this.resolveUrl(u)).filter(productCdnFilter) : (stryCov_9fa48("2529", "2530"), jsonImages.map(stryMutAct_9fa48("2531") ? () => undefined : (stryCov_9fa48("2531"), u => this.resolveUrl(u))).filter(productCdnFilter).filter(notIconFilter));
          if (stryMutAct_9fa48("2535") ? filteredJson.length <= 0 : stryMutAct_9fa48("2534") ? filteredJson.length >= 0 : stryMutAct_9fa48("2533") ? false : stryMutAct_9fa48("2532") ? true : (stryCov_9fa48("2532", "2533", "2534", "2535"), filteredJson.length > 0)) {
            if (stryMutAct_9fa48("2536")) {
              {}
            } else {
              stryCov_9fa48("2536");
              if (stryMutAct_9fa48("2539") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("2538") ? false : stryMutAct_9fa48("2537") ? true : (stryCov_9fa48("2537", "2538", "2539"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("2540") ? "" : (stryCov_9fa48("2540"), '1')))) console.log(stryMutAct_9fa48("2541") ? `` : (stryCov_9fa48("2541"), `[extractImages] Found ${filteredJson.length} Shopify JSON images, but continuing to check configured selectors`));
              // Don't return immediately - continue to check configured selectors for more images
            }
          }
        }
      } catch {
        // Ignore errors and continue with other methods
      }
      const collectImagesFromScope = (scope: Element): string[] => {
        if (stryMutAct_9fa48("2542")) {
          {}
        } else {
          stryCov_9fa48("2542");
          const urls: string[] = stryMutAct_9fa48("2543") ? ["Stryker was here"] : (stryCov_9fa48("2543"), []);
          // Consider <img> and <source> inside <picture>
          const imgNodes = scope.querySelectorAll(stryMutAct_9fa48("2544") ? "" : (stryCov_9fa48("2544"), 'img, picture source'));
          imgNodes.forEach(n => {
            if (stryMutAct_9fa48("2545")) {
              {}
            } else {
              stryCov_9fa48("2545");
              let src: string | null = null;
              const srcset = stryMutAct_9fa48("2548") ? n.getAttribute('srcset') && n.getAttribute('data-srcset') : stryMutAct_9fa48("2547") ? false : stryMutAct_9fa48("2546") ? true : (stryCov_9fa48("2546", "2547", "2548"), n.getAttribute(stryMutAct_9fa48("2549") ? "" : (stryCov_9fa48("2549"), 'srcset')) || n.getAttribute(stryMutAct_9fa48("2550") ? "" : (stryCov_9fa48("2550"), 'data-srcset')));
              if (stryMutAct_9fa48("2552") ? false : stryMutAct_9fa48("2551") ? true : (stryCov_9fa48("2551", "2552"), srcset)) {
                if (stryMutAct_9fa48("2553")) {
                  {}
                } else {
                  stryCov_9fa48("2553");
                  src = getLargestFromSrcset(srcset);
                }
              }
              if (stryMutAct_9fa48("2556") ? false : stryMutAct_9fa48("2555") ? true : stryMutAct_9fa48("2554") ? src : (stryCov_9fa48("2554", "2555", "2556"), !src)) {
                if (stryMutAct_9fa48("2557")) {
                  {}
                } else {
                  stryCov_9fa48("2557");
                  src = stryMutAct_9fa48("2560") ? (n.getAttribute('data-image') || n.getAttribute('data-original-src') || n.getAttribute('data-src')) && n.getAttribute('src') : stryMutAct_9fa48("2559") ? false : stryMutAct_9fa48("2558") ? true : (stryCov_9fa48("2558", "2559", "2560"), (stryMutAct_9fa48("2562") ? (n.getAttribute('data-image') || n.getAttribute('data-original-src')) && n.getAttribute('data-src') : stryMutAct_9fa48("2561") ? false : (stryCov_9fa48("2561", "2562"), (stryMutAct_9fa48("2564") ? n.getAttribute('data-image') && n.getAttribute('data-original-src') : stryMutAct_9fa48("2563") ? false : (stryCov_9fa48("2563", "2564"), n.getAttribute(stryMutAct_9fa48("2565") ? "" : (stryCov_9fa48("2565"), 'data-image')) || n.getAttribute(stryMutAct_9fa48("2566") ? "" : (stryCov_9fa48("2566"), 'data-original-src')))) || n.getAttribute(stryMutAct_9fa48("2567") ? "" : (stryCov_9fa48("2567"), 'data-src')))) || n.getAttribute(stryMutAct_9fa48("2568") ? "" : (stryCov_9fa48("2568"), 'src')));
                }
              }
              if (stryMutAct_9fa48("2570") ? false : stryMutAct_9fa48("2569") ? true : (stryCov_9fa48("2569", "2570"), src)) {
                if (stryMutAct_9fa48("2571")) {
                  {}
                } else {
                  stryCov_9fa48("2571");
                  urls.push(this.resolveUrl(src));
                }
              }
            }
          });
          // Also extract background-image URLs
          const bgNodes = scope.querySelectorAll(stryMutAct_9fa48("2572") ? "" : (stryCov_9fa48("2572"), '[style*=\'background-image\']'));
          bgNodes.forEach(n => {
            if (stryMutAct_9fa48("2573")) {
              {}
            } else {
              stryCov_9fa48("2573");
              const style = stryMutAct_9fa48("2576") ? (n as HTMLElement).getAttribute('style') && '' : stryMutAct_9fa48("2575") ? false : stryMutAct_9fa48("2574") ? true : (stryCov_9fa48("2574", "2575", "2576"), (n as HTMLElement).getAttribute(stryMutAct_9fa48("2577") ? "" : (stryCov_9fa48("2577"), 'style')) || (stryMutAct_9fa48("2578") ? "Stryker was here!" : (stryCov_9fa48("2578"), '')));
              const match = style.match(stryMutAct_9fa48("2584") ? /background-image:\s*url\((['"]?)([)'"]+)\1\)/i : stryMutAct_9fa48("2583") ? /background-image:\s*url\((['"]?)([^)'"])\1\)/i : stryMutAct_9fa48("2582") ? /background-image:\s*url\(([^'"]?)([^)'"]+)\1\)/i : stryMutAct_9fa48("2581") ? /background-image:\s*url\((['"])([^)'"]+)\1\)/i : stryMutAct_9fa48("2580") ? /background-image:\S*url\((['"]?)([^)'"]+)\1\)/i : stryMutAct_9fa48("2579") ? /background-image:\surl\((['"]?)([^)'"]+)\1\)/i : (stryCov_9fa48("2579", "2580", "2581", "2582", "2583", "2584"), /background-image:\s*url\((['"]?)([^)'"]+)\1\)/i));
              if (stryMutAct_9fa48("2587") ? match || match[2] : stryMutAct_9fa48("2586") ? false : stryMutAct_9fa48("2585") ? true : (stryCov_9fa48("2585", "2586", "2587"), match && match[2])) {
                if (stryMutAct_9fa48("2588")) {
                  {}
                } else {
                  stryCov_9fa48("2588");
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
        if (stryMutAct_9fa48("2589")) {
          {}
        } else {
          stryCov_9fa48("2589");
          const nodes = this.extractElements(dom, sel);
          if (stryMutAct_9fa48("2593") ? nodes.length <= 0 : stryMutAct_9fa48("2592") ? nodes.length >= 0 : stryMutAct_9fa48("2591") ? false : stryMutAct_9fa48("2590") ? true : (stryCov_9fa48("2590", "2591", "2592", "2593"), nodes.length > 0)) {
            if (stryMutAct_9fa48("2594")) {
              {}
            } else {
              stryCov_9fa48("2594");
              const urls = stryMutAct_9fa48("2597") ? nodes.map(img => {
                const srcset = img.getAttribute('srcset') || img.getAttribute('data-srcset');
                if (srcset) {
                  const largest = getLargestFromSrcset(srcset);
                  if (largest) return this.resolveUrl(largest);
                }
                const src = img.getAttribute('data-image') || img.getAttribute('data-original-src') || img.getAttribute('data-src') || img.getAttribute('src');
                return src ? this.resolveUrl(src) : null;
              }).filter(productCdnFilter).filter(notIconFilter) : stryMutAct_9fa48("2596") ? nodes.map(img => {
                const srcset = img.getAttribute('srcset') || img.getAttribute('data-srcset');
                if (srcset) {
                  const largest = getLargestFromSrcset(srcset);
                  if (largest) return this.resolveUrl(largest);
                }
                const src = img.getAttribute('data-image') || img.getAttribute('data-original-src') || img.getAttribute('data-src') || img.getAttribute('src');
                return src ? this.resolveUrl(src) : null;
              }).filter((u): u is string => !!u).filter(notIconFilter) : stryMutAct_9fa48("2595") ? nodes.map(img => {
                const srcset = img.getAttribute('srcset') || img.getAttribute('data-srcset');
                if (srcset) {
                  const largest = getLargestFromSrcset(srcset);
                  if (largest) return this.resolveUrl(largest);
                }
                const src = img.getAttribute('data-image') || img.getAttribute('data-original-src') || img.getAttribute('data-src') || img.getAttribute('src');
                return src ? this.resolveUrl(src) : null;
              }).filter((u): u is string => !!u).filter(productCdnFilter) : (stryCov_9fa48("2595", "2596", "2597"), nodes.map(img => {
                if (stryMutAct_9fa48("2598")) {
                  {}
                } else {
                  stryCov_9fa48("2598");
                  const srcset = stryMutAct_9fa48("2601") ? img.getAttribute('srcset') && img.getAttribute('data-srcset') : stryMutAct_9fa48("2600") ? false : stryMutAct_9fa48("2599") ? true : (stryCov_9fa48("2599", "2600", "2601"), img.getAttribute(stryMutAct_9fa48("2602") ? "" : (stryCov_9fa48("2602"), 'srcset')) || img.getAttribute(stryMutAct_9fa48("2603") ? "" : (stryCov_9fa48("2603"), 'data-srcset')));
                  if (stryMutAct_9fa48("2605") ? false : stryMutAct_9fa48("2604") ? true : (stryCov_9fa48("2604", "2605"), srcset)) {
                    if (stryMutAct_9fa48("2606")) {
                      {}
                    } else {
                      stryCov_9fa48("2606");
                      const largest = getLargestFromSrcset(srcset);
                      if (stryMutAct_9fa48("2608") ? false : stryMutAct_9fa48("2607") ? true : (stryCov_9fa48("2607", "2608"), largest)) return this.resolveUrl(largest);
                    }
                  }
                  const src = stryMutAct_9fa48("2611") ? (img.getAttribute('data-image') || img.getAttribute('data-original-src') || img.getAttribute('data-src')) && img.getAttribute('src') : stryMutAct_9fa48("2610") ? false : stryMutAct_9fa48("2609") ? true : (stryCov_9fa48("2609", "2610", "2611"), (stryMutAct_9fa48("2613") ? (img.getAttribute('data-image') || img.getAttribute('data-original-src')) && img.getAttribute('data-src') : stryMutAct_9fa48("2612") ? false : (stryCov_9fa48("2612", "2613"), (stryMutAct_9fa48("2615") ? img.getAttribute('data-image') && img.getAttribute('data-original-src') : stryMutAct_9fa48("2614") ? false : (stryCov_9fa48("2614", "2615"), img.getAttribute(stryMutAct_9fa48("2616") ? "" : (stryCov_9fa48("2616"), 'data-image')) || img.getAttribute(stryMutAct_9fa48("2617") ? "" : (stryCov_9fa48("2617"), 'data-original-src')))) || img.getAttribute(stryMutAct_9fa48("2618") ? "" : (stryCov_9fa48("2618"), 'data-src')))) || img.getAttribute(stryMutAct_9fa48("2619") ? "" : (stryCov_9fa48("2619"), 'src')));
                  return src ? this.resolveUrl(src) : null;
                }
              }).filter(stryMutAct_9fa48("2620") ? () => undefined : (stryCov_9fa48("2620"), (u): u is string => stryMutAct_9fa48("2621") ? !u : (stryCov_9fa48("2621"), !(stryMutAct_9fa48("2622") ? u : (stryCov_9fa48("2622"), !u))))).filter(productCdnFilter).filter(notIconFilter));
              if (stryMutAct_9fa48("2626") ? urls.length <= 0 : stryMutAct_9fa48("2625") ? urls.length >= 0 : stryMutAct_9fa48("2624") ? false : stryMutAct_9fa48("2623") ? true : (stryCov_9fa48("2623", "2624", "2625", "2626"), urls.length > 0)) {
                if (stryMutAct_9fa48("2627")) {
                  {}
                } else {
                  stryCov_9fa48("2627");
                  if (stryMutAct_9fa48("2630") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("2629") ? false : stryMutAct_9fa48("2628") ? true : (stryCov_9fa48("2628", "2629", "2630"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("2631") ? "" : (stryCov_9fa48("2631"), '1')))) console.log(stryMutAct_9fa48("2632") ? `` : (stryCov_9fa48("2632"), `[extractImages] Found ${urls.length} images from selector ${sel}`));
                  return Array.from(new Set(urls));
                }
              }
            }
          }
        }
      }

      // 2) Try gallery scopes as fallback
      for (const scopeSel of stryMutAct_9fa48("2633") ? [] : (stryCov_9fa48("2633"), [...galleryScopes, stryMutAct_9fa48("2634") ? "" : (stryCov_9fa48("2634"), '.product-gallery')])) {
        if (stryMutAct_9fa48("2635")) {
          {}
        } else {
          stryCov_9fa48("2635");
          const scope = doc.querySelector(scopeSel);
          if (stryMutAct_9fa48("2637") ? false : stryMutAct_9fa48("2636") ? true : (stryCov_9fa48("2636", "2637"), scope)) {
            if (stryMutAct_9fa48("2638")) {
              {}
            } else {
              stryCov_9fa48("2638");
              const urls = stryMutAct_9fa48("2640") ? collectImagesFromScope(scope).filter(notIconFilter) : stryMutAct_9fa48("2639") ? collectImagesFromScope(scope).filter(productCdnFilter) : (stryCov_9fa48("2639", "2640"), collectImagesFromScope(scope).filter(productCdnFilter).filter(notIconFilter));
              if (stryMutAct_9fa48("2644") ? urls.length <= 0 : stryMutAct_9fa48("2643") ? urls.length >= 0 : stryMutAct_9fa48("2642") ? false : stryMutAct_9fa48("2641") ? true : (stryCov_9fa48("2641", "2642", "2643", "2644"), urls.length > 0)) {
                if (stryMutAct_9fa48("2645")) {
                  {}
                } else {
                  stryCov_9fa48("2645");
                  if (stryMutAct_9fa48("2648") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("2647") ? false : stryMutAct_9fa48("2646") ? true : (stryCov_9fa48("2646", "2647", "2648"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("2649") ? "" : (stryCov_9fa48("2649"), '1')))) console.log(stryMutAct_9fa48("2650") ? `` : (stryCov_9fa48("2650"), `[extractImages] Found ${urls.length} images from gallery scope ${scopeSel}`));
                  return Array.from(new Set(urls));
                }
              }
            }
          }
        }
      }

      // 1b) Try to parse <noscript> fallbacks which often contain plain <img>
      const noscripts = Array.from(doc.querySelectorAll(stryMutAct_9fa48("2651") ? "" : (stryCov_9fa48("2651"), 'noscript')));
      for (const ns of noscripts) {
        if (stryMutAct_9fa48("2652")) {
          {}
        } else {
          stryCov_9fa48("2652");
          const html = stryMutAct_9fa48("2655") ? ns.textContent && '' : stryMutAct_9fa48("2654") ? false : stryMutAct_9fa48("2653") ? true : (stryCov_9fa48("2653", "2654", "2655"), ns.textContent || (stryMutAct_9fa48("2656") ? "Stryker was here!" : (stryCov_9fa48("2656"), '')));
          if (stryMutAct_9fa48("2659") ? !html && html.length < 10 : stryMutAct_9fa48("2658") ? false : stryMutAct_9fa48("2657") ? true : (stryCov_9fa48("2657", "2658", "2659"), (stryMutAct_9fa48("2660") ? html : (stryCov_9fa48("2660"), !html)) || (stryMutAct_9fa48("2663") ? html.length >= 10 : stryMutAct_9fa48("2662") ? html.length <= 10 : stryMutAct_9fa48("2661") ? false : (stryCov_9fa48("2661", "2662", "2663"), html.length < 10)))) continue;
          try {
            if (stryMutAct_9fa48("2664")) {
              {}
            } else {
              stryCov_9fa48("2664");
              const frag = new dom.window.DOMParser().parseFromString(html, stryMutAct_9fa48("2665") ? "" : (stryCov_9fa48("2665"), 'text/html'));
              const imgs = frag.querySelectorAll(stryMutAct_9fa48("2666") ? "" : (stryCov_9fa48("2666"), 'img'));
              const urls = stryMutAct_9fa48("2669") ? Array.from(imgs).map(im => im.getAttribute('src') || im.getAttribute('data-src')).map(u => this.resolveUrl(u)).filter(productCdnFilter).filter(notIconFilter) : stryMutAct_9fa48("2668") ? Array.from(imgs).map(im => im.getAttribute('src') || im.getAttribute('data-src')).filter((u): u is string => !!u).map(u => this.resolveUrl(u)).filter(notIconFilter) : stryMutAct_9fa48("2667") ? Array.from(imgs).map(im => im.getAttribute('src') || im.getAttribute('data-src')).filter((u): u is string => !!u).map(u => this.resolveUrl(u)).filter(productCdnFilter) : (stryCov_9fa48("2667", "2668", "2669"), Array.from(imgs).map(stryMutAct_9fa48("2670") ? () => undefined : (stryCov_9fa48("2670"), im => stryMutAct_9fa48("2673") ? im.getAttribute('src') && im.getAttribute('data-src') : stryMutAct_9fa48("2672") ? false : stryMutAct_9fa48("2671") ? true : (stryCov_9fa48("2671", "2672", "2673"), im.getAttribute(stryMutAct_9fa48("2674") ? "" : (stryCov_9fa48("2674"), 'src')) || im.getAttribute(stryMutAct_9fa48("2675") ? "" : (stryCov_9fa48("2675"), 'data-src'))))).filter(stryMutAct_9fa48("2676") ? () => undefined : (stryCov_9fa48("2676"), (u): u is string => stryMutAct_9fa48("2677") ? !u : (stryCov_9fa48("2677"), !(stryMutAct_9fa48("2678") ? u : (stryCov_9fa48("2678"), !u))))).map(stryMutAct_9fa48("2679") ? () => undefined : (stryCov_9fa48("2679"), u => this.resolveUrl(u))).filter(productCdnFilter).filter(notIconFilter));
              if (stryMutAct_9fa48("2683") ? urls.length <= 0 : stryMutAct_9fa48("2682") ? urls.length >= 0 : stryMutAct_9fa48("2681") ? false : stryMutAct_9fa48("2680") ? true : (stryCov_9fa48("2680", "2681", "2682", "2683"), urls.length > 0)) return Array.from(new Set(urls));
            }
          } catch {
            // Ignore parsing errors and continue
          }
        }
      }

      // 2) Fallback to configured selectors but apply strict filtering
      for (const sel of selectorArray) {
        if (stryMutAct_9fa48("2684")) {
          {}
        } else {
          stryCov_9fa48("2684");
          const nodes = this.extractElements(dom, sel);
          if (stryMutAct_9fa48("2688") ? nodes.length <= 0 : stryMutAct_9fa48("2687") ? nodes.length >= 0 : stryMutAct_9fa48("2686") ? false : stryMutAct_9fa48("2685") ? true : (stryCov_9fa48("2685", "2686", "2687", "2688"), nodes.length > 0)) {
            if (stryMutAct_9fa48("2689")) {
              {}
            } else {
              stryCov_9fa48("2689");
              const urls = stryMutAct_9fa48("2692") ? nodes.map(img => {
                const srcset = img.getAttribute('srcset') || img.getAttribute('data-srcset');
                if (srcset) {
                  const largest = getLargestFromSrcset(srcset);
                  if (largest) return this.resolveUrl(largest);
                }
                const src = img.getAttribute('data-original-src') || img.getAttribute('data-src') || img.getAttribute('src');
                return src ? this.resolveUrl(src) : null;
              }).filter(productCdnFilter).filter(notIconFilter) : stryMutAct_9fa48("2691") ? nodes.map(img => {
                const srcset = img.getAttribute('srcset') || img.getAttribute('data-srcset');
                if (srcset) {
                  const largest = getLargestFromSrcset(srcset);
                  if (largest) return this.resolveUrl(largest);
                }
                const src = img.getAttribute('data-original-src') || img.getAttribute('data-src') || img.getAttribute('src');
                return src ? this.resolveUrl(src) : null;
              }).filter((u): u is string => !!u).filter(notIconFilter) : stryMutAct_9fa48("2690") ? nodes.map(img => {
                const srcset = img.getAttribute('srcset') || img.getAttribute('data-srcset');
                if (srcset) {
                  const largest = getLargestFromSrcset(srcset);
                  if (largest) return this.resolveUrl(largest);
                }
                const src = img.getAttribute('data-original-src') || img.getAttribute('data-src') || img.getAttribute('src');
                return src ? this.resolveUrl(src) : null;
              }).filter((u): u is string => !!u).filter(productCdnFilter) : (stryCov_9fa48("2690", "2691", "2692"), nodes.map(img => {
                if (stryMutAct_9fa48("2693")) {
                  {}
                } else {
                  stryCov_9fa48("2693");
                  const srcset = stryMutAct_9fa48("2696") ? img.getAttribute('srcset') && img.getAttribute('data-srcset') : stryMutAct_9fa48("2695") ? false : stryMutAct_9fa48("2694") ? true : (stryCov_9fa48("2694", "2695", "2696"), img.getAttribute(stryMutAct_9fa48("2697") ? "" : (stryCov_9fa48("2697"), 'srcset')) || img.getAttribute(stryMutAct_9fa48("2698") ? "" : (stryCov_9fa48("2698"), 'data-srcset')));
                  if (stryMutAct_9fa48("2700") ? false : stryMutAct_9fa48("2699") ? true : (stryCov_9fa48("2699", "2700"), srcset)) {
                    if (stryMutAct_9fa48("2701")) {
                      {}
                    } else {
                      stryCov_9fa48("2701");
                      const largest = getLargestFromSrcset(srcset);
                      if (stryMutAct_9fa48("2703") ? false : stryMutAct_9fa48("2702") ? true : (stryCov_9fa48("2702", "2703"), largest)) return this.resolveUrl(largest);
                    }
                  }
                  const src = stryMutAct_9fa48("2706") ? (img.getAttribute('data-original-src') || img.getAttribute('data-src')) && img.getAttribute('src') : stryMutAct_9fa48("2705") ? false : stryMutAct_9fa48("2704") ? true : (stryCov_9fa48("2704", "2705", "2706"), (stryMutAct_9fa48("2708") ? img.getAttribute('data-original-src') && img.getAttribute('data-src') : stryMutAct_9fa48("2707") ? false : (stryCov_9fa48("2707", "2708"), img.getAttribute(stryMutAct_9fa48("2709") ? "" : (stryCov_9fa48("2709"), 'data-original-src')) || img.getAttribute(stryMutAct_9fa48("2710") ? "" : (stryCov_9fa48("2710"), 'data-src')))) || img.getAttribute(stryMutAct_9fa48("2711") ? "" : (stryCov_9fa48("2711"), 'src')));
                  return src ? this.resolveUrl(src) : null;
                }
              }).filter(stryMutAct_9fa48("2712") ? () => undefined : (stryCov_9fa48("2712"), (u): u is string => stryMutAct_9fa48("2713") ? !u : (stryCov_9fa48("2713"), !(stryMutAct_9fa48("2714") ? u : (stryCov_9fa48("2714"), !u))))).filter(productCdnFilter).filter(notIconFilter));
              if (stryMutAct_9fa48("2718") ? urls.length <= 0 : stryMutAct_9fa48("2717") ? urls.length >= 0 : stryMutAct_9fa48("2716") ? false : stryMutAct_9fa48("2715") ? true : (stryCov_9fa48("2715", "2716", "2717", "2718"), urls.length > 0)) {
                if (stryMutAct_9fa48("2719")) {
                  {}
                } else {
                  stryCov_9fa48("2719");
                  return Array.from(new Set(urls));
                }
              }
            }
          }
        }
      }

      // 3) Last resort: OpenGraph image
      const og = stryMutAct_9fa48("2720") ? doc.querySelector('meta[property=\'og:image\']').getAttribute('content') : (stryCov_9fa48("2720"), doc.querySelector(stryMutAct_9fa48("2721") ? "" : (stryCov_9fa48("2721"), 'meta[property=\'og:image\']'))?.getAttribute(stryMutAct_9fa48("2722") ? "" : (stryCov_9fa48("2722"), 'content')));
      if (stryMutAct_9fa48("2725") ? og && productCdnFilter(og) || notIconFilter(og) : stryMutAct_9fa48("2724") ? false : stryMutAct_9fa48("2723") ? true : (stryCov_9fa48("2723", "2724", "2725"), (stryMutAct_9fa48("2727") ? og || productCdnFilter(og) : stryMutAct_9fa48("2726") ? true : (stryCov_9fa48("2726", "2727"), og && productCdnFilter(og))) && notIconFilter(og))) {
        if (stryMutAct_9fa48("2728")) {
          {}
        } else {
          stryCov_9fa48("2728");
          return stryMutAct_9fa48("2729") ? [] : (stryCov_9fa48("2729"), [this.resolveUrl(og)]);
        }
      }
      return stryMutAct_9fa48("2730") ? ["Stryker was here"] : (stryCov_9fa48("2730"), []);
    }
  }

  /**
   * Extract stock status using the configured selector
   */
  protected override extractStockStatus(dom: JSDOM, selector: string | string[]): string {
    if (stryMutAct_9fa48("2731")) {
      {}
    } else {
      stryCov_9fa48("2731");
      const selectorArray = Array.isArray(selector) ? selector : stryMutAct_9fa48("2732") ? [] : (stryCov_9fa48("2732"), [selector]);
      for (const sel of selectorArray) {
        if (stryMutAct_9fa48("2733")) {
          {}
        } else {
          stryCov_9fa48("2733");
          const stockText = this.extractText(dom, sel);
          if (stryMutAct_9fa48("2735") ? false : stryMutAct_9fa48("2734") ? true : (stryCov_9fa48("2734", "2735"), stockText)) {
            if (stryMutAct_9fa48("2736")) {
              {}
            } else {
              stryCov_9fa48("2736");
              return this.normalizeStockText(stockText);
            }
          }
        }
      }
      return stryMutAct_9fa48("2737") ? "" : (stryCov_9fa48("2737"), 'instock'); // Default
    }
  }

  /**
   * Extract stock status from a selector that can be either a string or array of strings
   */
  private extractStockStatusFromSelector(dom: JSDOM, selector: string | string[]): string {
    if (stryMutAct_9fa48("2738")) {
      {}
    } else {
      stryCov_9fa48("2738");
      if (stryMutAct_9fa48("2740") ? false : stryMutAct_9fa48("2739") ? true : (stryCov_9fa48("2739", "2740"), Array.isArray(selector))) {
        if (stryMutAct_9fa48("2741")) {
          {}
        } else {
          stryCov_9fa48("2741");
          // Try each selector until one works
          for (const sel of selector) {
            if (stryMutAct_9fa48("2742")) {
              {}
            } else {
              stryCov_9fa48("2742");
              const status = this.extractStockStatus(dom, sel);
              if (stryMutAct_9fa48("2745") ? status || status.trim() : stryMutAct_9fa48("2744") ? false : stryMutAct_9fa48("2743") ? true : (stryCov_9fa48("2743", "2744", "2745"), status && (stryMutAct_9fa48("2746") ? status : (stryCov_9fa48("2746"), status.trim())))) {
                if (stryMutAct_9fa48("2747")) {
                  {}
                } else {
                  stryCov_9fa48("2747");
                  return status;
                }
              }
            }
          }
          return stryMutAct_9fa48("2748") ? "" : (stryCov_9fa48("2748"), 'instock');
        }
      }
      return this.extractStockStatus(dom, selector);
    }
  }

  /**
   * Extract images from a selector that can be either a string or array of strings
   */
  private extractImagesFromSelector(dom: JSDOM, selector: string | string[]): string[] {
    if (stryMutAct_9fa48("2749")) {
      {}
    } else {
      stryCov_9fa48("2749");
      if (stryMutAct_9fa48("2751") ? false : stryMutAct_9fa48("2750") ? true : (stryCov_9fa48("2750", "2751"), Array.isArray(selector))) {
        if (stryMutAct_9fa48("2752")) {
          {}
        } else {
          stryCov_9fa48("2752");
          // Try each selector until one works
          for (const sel of selector) {
            if (stryMutAct_9fa48("2753")) {
              {}
            } else {
              stryCov_9fa48("2753");
              const images = this.extractImages(dom, sel);
              if (stryMutAct_9fa48("2756") ? images || images.length > 0 : stryMutAct_9fa48("2755") ? false : stryMutAct_9fa48("2754") ? true : (stryCov_9fa48("2754", "2755", "2756"), images && (stryMutAct_9fa48("2759") ? images.length <= 0 : stryMutAct_9fa48("2758") ? images.length >= 0 : stryMutAct_9fa48("2757") ? true : (stryCov_9fa48("2757", "2758", "2759"), images.length > 0)))) {
                if (stryMutAct_9fa48("2760")) {
                  {}
                } else {
                  stryCov_9fa48("2760");
                  return images;
                }
              }
            }
          }
          return stryMutAct_9fa48("2761") ? ["Stryker was here"] : (stryCov_9fa48("2761"), []);
        }
      }
      return this.extractImages(dom, selector);
    }
  }

  /**
   * Extract attributes from a selector that can be either a string or array of strings
   */
  private extractAttributesFromSelector(dom: JSDOM, selector: string | string[]): Record<string, string[]> {
    if (stryMutAct_9fa48("2762")) {
      {}
    } else {
      stryCov_9fa48("2762");
      if (stryMutAct_9fa48("2764") ? false : stryMutAct_9fa48("2763") ? true : (stryCov_9fa48("2763", "2764"), Array.isArray(selector))) {
        if (stryMutAct_9fa48("2765")) {
          {}
        } else {
          stryCov_9fa48("2765");
          // Try each selector until one works
          for (const sel of selector) {
            if (stryMutAct_9fa48("2766")) {
              {}
            } else {
              stryCov_9fa48("2766");
              const attrs = this.extractAttributes(dom, sel);
              if (stryMutAct_9fa48("2769") ? attrs || Object.keys(attrs).length > 0 : stryMutAct_9fa48("2768") ? false : stryMutAct_9fa48("2767") ? true : (stryCov_9fa48("2767", "2768", "2769"), attrs && (stryMutAct_9fa48("2772") ? Object.keys(attrs).length <= 0 : stryMutAct_9fa48("2771") ? Object.keys(attrs).length >= 0 : stryMutAct_9fa48("2770") ? true : (stryCov_9fa48("2770", "2771", "2772"), Object.keys(attrs).length > 0)))) {
                if (stryMutAct_9fa48("2773")) {
                  {}
                } else {
                  stryCov_9fa48("2773");
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
    if (stryMutAct_9fa48("2774")) {
      {}
    } else {
      stryCov_9fa48("2774");
      if (stryMutAct_9fa48("2776") ? false : stryMutAct_9fa48("2775") ? true : (stryCov_9fa48("2775", "2776"), Array.isArray(selector))) {
        if (stryMutAct_9fa48("2777")) {
          {}
        } else {
          stryCov_9fa48("2777");
          // Try each selector until one works
          for (const sel of selector) {
            if (stryMutAct_9fa48("2778")) {
              {}
            } else {
              stryCov_9fa48("2778");
              const variations = this.extractVariations(dom, sel);
              if (stryMutAct_9fa48("2781") ? variations || variations.length > 0 : stryMutAct_9fa48("2780") ? false : stryMutAct_9fa48("2779") ? true : (stryCov_9fa48("2779", "2780", "2781"), variations && (stryMutAct_9fa48("2784") ? variations.length <= 0 : stryMutAct_9fa48("2783") ? variations.length >= 0 : stryMutAct_9fa48("2782") ? true : (stryCov_9fa48("2782", "2783", "2784"), variations.length > 0)))) {
                if (stryMutAct_9fa48("2785")) {
                  {}
                } else {
                  stryCov_9fa48("2785");
                  return variations;
                }
              }
            }
          }
          return stryMutAct_9fa48("2786") ? ["Stryker was here"] : (stryCov_9fa48("2786"), []);
        }
      }
      return this.extractVariations(dom, selector);
    }
  }

  /**
   * Extract price from a selector that can be either a string or array of strings
   */
  private extractPriceFromSelector(dom: JSDOM, selector: string | string[]): string {
    if (stryMutAct_9fa48("2787")) {
      {}
    } else {
      stryCov_9fa48("2787");
      if (stryMutAct_9fa48("2789") ? false : stryMutAct_9fa48("2788") ? true : (stryCov_9fa48("2788", "2789"), Array.isArray(selector))) {
        if (stryMutAct_9fa48("2790")) {
          {}
        } else {
          stryCov_9fa48("2790");
          // Try each selector until one works
          for (const sel of selector) {
            if (stryMutAct_9fa48("2791")) {
              {}
            } else {
              stryCov_9fa48("2791");
              const price = this.extractPrice(dom, sel);
              if (stryMutAct_9fa48("2794") ? price || price.trim() : stryMutAct_9fa48("2793") ? false : stryMutAct_9fa48("2792") ? true : (stryCov_9fa48("2792", "2793", "2794"), price && (stryMutAct_9fa48("2795") ? price : (stryCov_9fa48("2795"), price.trim())))) {
                if (stryMutAct_9fa48("2796")) {
                  {}
                } else {
                  stryCov_9fa48("2796");
                  return price;
                }
              }
            }
          }
          return stryMutAct_9fa48("2797") ? "Stryker was here!" : (stryCov_9fa48("2797"), '');
        }
      }
      return this.extractPrice(dom, selector);
    }
  }

  /**
   * Extract attributes using the configured selector
   */
  protected override extractAttributes(dom: JSDOM, selector: string | string[]): Record<string, string[]> {
    if (stryMutAct_9fa48("2798")) {
      {}
    } else {
      stryCov_9fa48("2798");
      const selectorArray = Array.isArray(selector) ? selector : stryMutAct_9fa48("2799") ? [] : (stryCov_9fa48("2799"), [selector]);
      const attributes: Record<string, string[]> = {};
      for (const sel of selectorArray) {
        if (stryMutAct_9fa48("2800")) {
          {}
        } else {
          stryCov_9fa48("2800");
          const attributeElements = this.extractElements(dom, sel);
          if (stryMutAct_9fa48("2804") ? attributeElements.length <= 0 : stryMutAct_9fa48("2803") ? attributeElements.length >= 0 : stryMutAct_9fa48("2802") ? false : stryMutAct_9fa48("2801") ? true : (stryCov_9fa48("2801", "2802", "2803", "2804"), attributeElements.length > 0)) {
            if (stryMutAct_9fa48("2805")) {
              {}
            } else {
              stryCov_9fa48("2805");
              for (const element of attributeElements) {
                if (stryMutAct_9fa48("2806")) {
                  {}
                } else {
                  stryCov_9fa48("2806");
                  // Case 1: Structured name/value nodes present
                  const nameElement = element.querySelector(stryMutAct_9fa48("2807") ? "" : (stryCov_9fa48("2807"), '[data-attribute-name], .attribute-name, .attr-name, .option-name'));
                  const valueElements = element.querySelectorAll(stryMutAct_9fa48("2808") ? "" : (stryCov_9fa48("2808"), '[data-attribute-value], .attribute-value, .attr-value, .option-value'));
                  if (stryMutAct_9fa48("2811") ? nameElement || valueElements.length > 0 : stryMutAct_9fa48("2810") ? false : stryMutAct_9fa48("2809") ? true : (stryCov_9fa48("2809", "2810", "2811"), nameElement && (stryMutAct_9fa48("2814") ? valueElements.length <= 0 : stryMutAct_9fa48("2813") ? valueElements.length >= 0 : stryMutAct_9fa48("2812") ? true : (stryCov_9fa48("2812", "2813", "2814"), valueElements.length > 0)))) {
                    if (stryMutAct_9fa48("2815")) {
                      {}
                    } else {
                      stryCov_9fa48("2815");
                      const name = stryMutAct_9fa48("2818") ? nameElement.textContent?.trim() && '' : stryMutAct_9fa48("2817") ? false : stryMutAct_9fa48("2816") ? true : (stryCov_9fa48("2816", "2817", "2818"), (stryMutAct_9fa48("2820") ? nameElement.textContent.trim() : stryMutAct_9fa48("2819") ? nameElement.textContent : (stryCov_9fa48("2819", "2820"), nameElement.textContent?.trim())) || (stryMutAct_9fa48("2821") ? "Stryker was here!" : (stryCov_9fa48("2821"), '')));
                      const values = stryMutAct_9fa48("2822") ? Array.from(valueElements).map(val => (val as Element).textContent?.trim()) : (stryCov_9fa48("2822"), Array.from(valueElements).map(stryMutAct_9fa48("2823") ? () => undefined : (stryCov_9fa48("2823"), val => stryMutAct_9fa48("2825") ? (val as Element).textContent.trim() : stryMutAct_9fa48("2824") ? (val as Element).textContent : (stryCov_9fa48("2824", "2825"), (val as Element).textContent?.trim()))).filter(stryMutAct_9fa48("2826") ? () => undefined : (stryCov_9fa48("2826"), (val): val is string => stryMutAct_9fa48("2829") ? val !== undefined || !this.isPlaceholderValue(val) : stryMutAct_9fa48("2828") ? false : stryMutAct_9fa48("2827") ? true : (stryCov_9fa48("2827", "2828", "2829"), (stryMutAct_9fa48("2831") ? val === undefined : stryMutAct_9fa48("2830") ? true : (stryCov_9fa48("2830", "2831"), val !== undefined)) && (stryMutAct_9fa48("2832") ? this.isPlaceholderValue(val) : (stryCov_9fa48("2832"), !this.isPlaceholderValue(val)))))));
                      if (stryMutAct_9fa48("2835") ? name || values.length > 0 : stryMutAct_9fa48("2834") ? false : stryMutAct_9fa48("2833") ? true : (stryCov_9fa48("2833", "2834", "2835"), name && (stryMutAct_9fa48("2838") ? values.length <= 0 : stryMutAct_9fa48("2837") ? values.length >= 0 : stryMutAct_9fa48("2836") ? true : (stryCov_9fa48("2836", "2837", "2838"), values.length > 0)))) {
                        if (stryMutAct_9fa48("2839")) {
                          {}
                        } else {
                          stryCov_9fa48("2839");
                          attributes[name] = values;
                        }
                      }
                    }
                  }

                  // Case 2: WooCommerce selects (no explicit name node)
                  const selectNodes = element.querySelectorAll(stryMutAct_9fa48("2840") ? "" : (stryCov_9fa48("2840"), 'select[name*="attribute"], select[name*="pa_"], select[class*="attribute"], .variations select'));
                  for (const select of Array.from(selectNodes)) {
                    if (stryMutAct_9fa48("2841")) {
                      {}
                    } else {
                      stryCov_9fa48("2841");
                      const rawName = stryMutAct_9fa48("2844") ? (select.getAttribute('name') || select.getAttribute('data-attribute')) && '' : stryMutAct_9fa48("2843") ? false : stryMutAct_9fa48("2842") ? true : (stryCov_9fa48("2842", "2843", "2844"), (stryMutAct_9fa48("2846") ? select.getAttribute('name') && select.getAttribute('data-attribute') : stryMutAct_9fa48("2845") ? false : (stryCov_9fa48("2845", "2846"), select.getAttribute(stryMutAct_9fa48("2847") ? "" : (stryCov_9fa48("2847"), 'name')) || select.getAttribute(stryMutAct_9fa48("2848") ? "" : (stryCov_9fa48("2848"), 'data-attribute')))) || (stryMutAct_9fa48("2849") ? "Stryker was here!" : (stryCov_9fa48("2849"), '')));
                      if (stryMutAct_9fa48("2852") ? false : stryMutAct_9fa48("2851") ? true : stryMutAct_9fa48("2850") ? rawName : (stryCov_9fa48("2850", "2851", "2852"), !rawName)) continue;
                      // Derive display name: attribute_pa_color -> Color; attribute_size -> Size
                      const nameClean = stryMutAct_9fa48("2853") ? rawName.replace(/^attribute_/i, '').replace(/^pa_/i, '').replace(/[_-]+/g, ' ') : (stryCov_9fa48("2853"), rawName.replace(stryMutAct_9fa48("2854") ? /attribute_/i : (stryCov_9fa48("2854"), /^attribute_/i), stryMutAct_9fa48("2855") ? "Stryker was here!" : (stryCov_9fa48("2855"), '')).replace(stryMutAct_9fa48("2856") ? /pa_/i : (stryCov_9fa48("2856"), /^pa_/i), stryMutAct_9fa48("2857") ? "Stryker was here!" : (stryCov_9fa48("2857"), '')).replace(stryMutAct_9fa48("2859") ? /[^_-]+/g : stryMutAct_9fa48("2858") ? /[_-]/g : (stryCov_9fa48("2858", "2859"), /[_-]+/g), stryMutAct_9fa48("2860") ? "" : (stryCov_9fa48("2860"), ' ')).trim());
                      const displayName = nameClean.replace(stryMutAct_9fa48("2861") ? /\b\W/g : (stryCov_9fa48("2861"), /\b\w/g), stryMutAct_9fa48("2862") ? () => undefined : (stryCov_9fa48("2862"), c => stryMutAct_9fa48("2863") ? c.toLowerCase() : (stryCov_9fa48("2863"), c.toUpperCase())));
                      const options = Array.from(select.querySelectorAll('option')) as HTMLOptionElement[];
                      const values = stryMutAct_9fa48("2864") ? options.map(o => (o.textContent || '').trim()) : (stryCov_9fa48("2864"), options.map(stryMutAct_9fa48("2865") ? () => undefined : (stryCov_9fa48("2865"), o => stryMutAct_9fa48("2866") ? o.textContent || '' : (stryCov_9fa48("2866"), (stryMutAct_9fa48("2869") ? o.textContent && '' : stryMutAct_9fa48("2868") ? false : stryMutAct_9fa48("2867") ? true : (stryCov_9fa48("2867", "2868", "2869"), o.textContent || (stryMutAct_9fa48("2870") ? "Stryker was here!" : (stryCov_9fa48("2870"), '')))).trim()))).filter(stryMutAct_9fa48("2871") ? () => undefined : (stryCov_9fa48("2871"), v => stryMutAct_9fa48("2874") ? v || !this.isPlaceholderValue(v) : stryMutAct_9fa48("2873") ? false : stryMutAct_9fa48("2872") ? true : (stryCov_9fa48("2872", "2873", "2874"), v && (stryMutAct_9fa48("2875") ? this.isPlaceholderValue(v) : (stryCov_9fa48("2875"), !this.isPlaceholderValue(v)))))));
                      if (stryMutAct_9fa48("2878") ? displayName || values.length > 0 : stryMutAct_9fa48("2877") ? false : stryMutAct_9fa48("2876") ? true : (stryCov_9fa48("2876", "2877", "2878"), displayName && (stryMutAct_9fa48("2881") ? values.length <= 0 : stryMutAct_9fa48("2880") ? values.length >= 0 : stryMutAct_9fa48("2879") ? true : (stryCov_9fa48("2879", "2880", "2881"), values.length > 0)))) {
                        if (stryMutAct_9fa48("2882")) {
                          {}
                        } else {
                          stryCov_9fa48("2882");
                          const existing = stryMutAct_9fa48("2885") ? attributes[displayName] && [] : stryMutAct_9fa48("2884") ? false : stryMutAct_9fa48("2883") ? true : (stryCov_9fa48("2883", "2884", "2885"), attributes[displayName] || (stryMutAct_9fa48("2886") ? ["Stryker was here"] : (stryCov_9fa48("2886"), [])));
                          attributes[displayName] = Array.from(new Set(stryMutAct_9fa48("2887") ? [] : (stryCov_9fa48("2887"), [...existing, ...values])));
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
    if (stryMutAct_9fa48("2888")) {
      {}
    } else {
      stryCov_9fa48("2888");
      if (stryMutAct_9fa48("2891") ? false : stryMutAct_9fa48("2890") ? true : stryMutAct_9fa48("2889") ? selector : (stryCov_9fa48("2889", "2890", "2891"), !selector)) return stryMutAct_9fa48("2892") ? ["Stryker was here"] : (stryCov_9fa48("2892"), []);
      const selectorArray = Array.isArray(selector) ? selector : stryMutAct_9fa48("2893") ? [] : (stryCov_9fa48("2893"), [selector]);
      const variations: RawVariation[] = stryMutAct_9fa48("2894") ? ["Stryker was here"] : (stryCov_9fa48("2894"), []);

      // 0) Shopify: parse variants from Product JSON embedded in the page
      try {
        if (stryMutAct_9fa48("2895")) {
          {}
        } else {
          stryCov_9fa48("2895");
          // Common Shopify script patterns - including the meta script pattern
          const scriptCandidates = [
          // Add the meta script pattern that contains variant data FIRST (most comprehensive)
          ...Array.from(dom.window.document.querySelectorAll('script:not([id]):not([type])')), ...Array.from(dom.window.document.querySelectorAll('script[id^=\'ProductJson\']')), ...Array.from(dom.window.document.querySelectorAll('script[type=\'application/ld+json\']')), ...Array.from(dom.window.document.querySelectorAll('script[type=\'application/json\']'))] as HTMLScriptElement[];
          for (const script of scriptCandidates) {
            if (stryMutAct_9fa48("2896")) {
              {}
            } else {
              stryCov_9fa48("2896");
              const raw = stryMutAct_9fa48("2898") ? script.textContent.trim() : stryMutAct_9fa48("2897") ? script.textContent : (stryCov_9fa48("2897", "2898"), script.textContent?.trim());
              if (stryMutAct_9fa48("2901") ? false : stryMutAct_9fa48("2900") ? true : stryMutAct_9fa48("2899") ? raw : (stryCov_9fa48("2899", "2900", "2901"), !raw)) continue;

              // Try to find the meta script pattern: var meta = {...}
              if (stryMutAct_9fa48("2904") ? raw.includes('var meta =') || raw.includes('variants') : stryMutAct_9fa48("2903") ? false : stryMutAct_9fa48("2902") ? true : (stryCov_9fa48("2902", "2903", "2904"), raw.includes(stryMutAct_9fa48("2905") ? "" : (stryCov_9fa48("2905"), 'var meta =')) && raw.includes(stryMutAct_9fa48("2906") ? "" : (stryCov_9fa48("2906"), 'variants')))) {
                if (stryMutAct_9fa48("2907")) {
                  {}
                } else {
                  stryCov_9fa48("2907");
                  try {
                    if (stryMutAct_9fa48("2908")) {
                      {}
                    } else {
                      stryCov_9fa48("2908");
                      // Extract the JSON part after "var meta ="
                      const metaMatch = raw.match(stryMutAct_9fa48("2913") ? /var meta\s*=\s*({.});/s : stryMutAct_9fa48("2912") ? /var meta\s*=\S*({.*?});/s : stryMutAct_9fa48("2911") ? /var meta\s*=\s({.*?});/s : stryMutAct_9fa48("2910") ? /var meta\S*=\s*({.*?});/s : stryMutAct_9fa48("2909") ? /var meta\s=\s*({.*?});/s : (stryCov_9fa48("2909", "2910", "2911", "2912", "2913"), /var meta\s*=\s*({.*?});/s));
                      if (stryMutAct_9fa48("2916") ? metaMatch || metaMatch[1] : stryMutAct_9fa48("2915") ? false : stryMutAct_9fa48("2914") ? true : (stryCov_9fa48("2914", "2915", "2916"), metaMatch && metaMatch[1])) {
                        if (stryMutAct_9fa48("2917")) {
                          {}
                        } else {
                          stryCov_9fa48("2917");
                          const json = JSON.parse(metaMatch[1]);

                          // Check if this has product variants
                          if (stryMutAct_9fa48("2920") ? json?.product?.variants || Array.isArray(json.product.variants) : stryMutAct_9fa48("2919") ? false : stryMutAct_9fa48("2918") ? true : (stryCov_9fa48("2918", "2919", "2920"), (stryMutAct_9fa48("2922") ? json.product?.variants : stryMutAct_9fa48("2921") ? json?.product.variants : (stryCov_9fa48("2921", "2922"), json?.product?.variants)) && Array.isArray(json.product.variants))) {
                            if (stryMutAct_9fa48("2923")) {
                              {}
                            } else {
                              stryCov_9fa48("2923");
                              const variants = json.product.variants;
                              if (stryMutAct_9fa48("2926") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("2925") ? false : stryMutAct_9fa48("2924") ? true : (stryCov_9fa48("2924", "2925", "2926"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("2927") ? "" : (stryCov_9fa48("2927"), '1')))) console.log(stryMutAct_9fa48("2928") ? `` : (stryCov_9fa48("2928"), `[extractVariations] Found ${variants.length} variants in meta script`));
                              for (const v of variants) {
                                if (stryMutAct_9fa48("2929")) {
                                  {}
                                } else {
                                  stryCov_9fa48("2929");
                                  const price = (stryMutAct_9fa48("2930") ? v.price * 100 : (stryCov_9fa48("2930"), v.price / 100)).toString(); // Shopify prices are in cents
                                  const stockStatus = (stryMutAct_9fa48("2933") ? v.available !== false : stryMutAct_9fa48("2932") ? false : stryMutAct_9fa48("2931") ? true : (stryCov_9fa48("2931", "2932", "2933"), v.available === (stryMutAct_9fa48("2934") ? true : (stryCov_9fa48("2934"), false)))) ? stryMutAct_9fa48("2935") ? "" : (stryCov_9fa48("2935"), 'outofstock') : stryMutAct_9fa48("2936") ? "" : (stryCov_9fa48("2936"), 'instock');
                                  const images: string[] = stryMutAct_9fa48("2937") ? ["Stryker was here"] : (stryCov_9fa48("2937"), []);

                                  // Extract variant-specific images if available
                                  if (stryMutAct_9fa48("2940") ? v.featured_image || v.featured_image.src || v.featured_image.url : stryMutAct_9fa48("2939") ? false : stryMutAct_9fa48("2938") ? true : (stryCov_9fa48("2938", "2939", "2940"), v.featured_image && (stryMutAct_9fa48("2942") ? v.featured_image.src && v.featured_image.url : stryMutAct_9fa48("2941") ? true : (stryCov_9fa48("2941", "2942"), v.featured_image.src || v.featured_image.url)))) {
                                    if (stryMutAct_9fa48("2943")) {
                                      {}
                                    } else {
                                      stryCov_9fa48("2943");
                                      images.push(stryMutAct_9fa48("2946") ? v.featured_image.url && v.featured_image.src : stryMutAct_9fa48("2945") ? false : stryMutAct_9fa48("2944") ? true : (stryCov_9fa48("2944", "2945", "2946"), v.featured_image.url || v.featured_image.src));
                                    }
                                  }
                                  variations.push(stryMutAct_9fa48("2947") ? {} : (stryCov_9fa48("2947"), {
                                    sku: stryMutAct_9fa48("2950") ? ((v.sku || '').toString() || this.extractVariantSkuFromLinks(dom, v.id)) && 'SKU' : stryMutAct_9fa48("2949") ? false : stryMutAct_9fa48("2948") ? true : (stryCov_9fa48("2948", "2949", "2950"), (stryMutAct_9fa48("2952") ? (v.sku || '').toString() && this.extractVariantSkuFromLinks(dom, v.id) : stryMutAct_9fa48("2951") ? false : (stryCov_9fa48("2951", "2952"), (stryMutAct_9fa48("2955") ? v.sku && '' : stryMutAct_9fa48("2954") ? false : stryMutAct_9fa48("2953") ? true : (stryCov_9fa48("2953", "2954", "2955"), v.sku || (stryMutAct_9fa48("2956") ? "Stryker was here!" : (stryCov_9fa48("2956"), '')))).toString() || this.extractVariantSkuFromLinks(dom, v.id))) || (stryMutAct_9fa48("2957") ? "" : (stryCov_9fa48("2957"), 'SKU'))),
                                    regularPrice: price,
                                    salePrice: stryMutAct_9fa48("2958") ? "Stryker was here!" : (stryCov_9fa48("2958"), ''),
                                    taxClass: stryMutAct_9fa48("2959") ? "Stryker was here!" : (stryCov_9fa48("2959"), ''),
                                    stockStatus,
                                    images,
                                    attributeAssignments: stryMutAct_9fa48("2960") ? {} : (stryCov_9fa48("2960"), {
                                      Size: stryMutAct_9fa48("2963") ? (v.public_title || v.title || v.option1) && '' : stryMutAct_9fa48("2962") ? false : stryMutAct_9fa48("2961") ? true : (stryCov_9fa48("2961", "2962", "2963"), (stryMutAct_9fa48("2965") ? (v.public_title || v.title) && v.option1 : stryMutAct_9fa48("2964") ? false : (stryCov_9fa48("2964", "2965"), (stryMutAct_9fa48("2967") ? v.public_title && v.title : stryMutAct_9fa48("2966") ? false : (stryCov_9fa48("2966", "2967"), v.public_title || v.title)) || v.option1)) || (stryMutAct_9fa48("2968") ? "Stryker was here!" : (stryCov_9fa48("2968"), '')))
                                    })
                                  }));
                                }
                              }
                              if (stryMutAct_9fa48("2972") ? variations.length <= 0 : stryMutAct_9fa48("2971") ? variations.length >= 0 : stryMutAct_9fa48("2970") ? false : stryMutAct_9fa48("2969") ? true : (stryCov_9fa48("2969", "2970", "2971", "2972"), variations.length > 0)) {
                                if (stryMutAct_9fa48("2973")) {
                                  {}
                                } else {
                                  stryCov_9fa48("2973");
                                  if (stryMutAct_9fa48("2976") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("2975") ? false : stryMutAct_9fa48("2974") ? true : (stryCov_9fa48("2974", "2975", "2976"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("2977") ? "" : (stryCov_9fa48("2977"), '1')))) console.log(stryMutAct_9fa48("2978") ? `` : (stryCov_9fa48("2978"), `Extracted ${variations.length} variations from Shopify meta script`));
                                  return variations;
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  } catch (e) {
                    if (stryMutAct_9fa48("2979")) {
                      {}
                    } else {
                      stryCov_9fa48("2979");
                      if (stryMutAct_9fa48("2982") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("2981") ? false : stryMutAct_9fa48("2980") ? true : (stryCov_9fa48("2980", "2981", "2982"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("2983") ? "" : (stryCov_9fa48("2983"), '1')))) console.log(stryMutAct_9fa48("2984") ? "" : (stryCov_9fa48("2984"), '[extractVariations] Failed to parse meta script variants:'), e);
                    }
                  }
                }
              }
              let json: Record<string, unknown>;
              try {
                if (stryMutAct_9fa48("2985")) {
                  {}
                } else {
                  stryCov_9fa48("2985");
                  json = JSON.parse(raw);
                }
              } catch {
                if (stryMutAct_9fa48("2986")) {
                  {}
                } else {
                  stryCov_9fa48("2986");
                  // Some themes wrap multiple JSON objects or arrays; try to find an object with variants
                  continue;
                }
              }

              // Case A: Direct Shopify product JSON with variants
              if (stryMutAct_9fa48("2989") ? json || Array.isArray(json.variants) : stryMutAct_9fa48("2988") ? false : stryMutAct_9fa48("2987") ? true : (stryCov_9fa48("2987", "2988", "2989"), json && Array.isArray(json.variants))) {
                if (stryMutAct_9fa48("2990")) {
                  {}
                } else {
                  stryCov_9fa48("2990");
                  const optionNames: string[] = Array.isArray(json.options) ? stryMutAct_9fa48("2991") ? json.options.map((o: Record<string, unknown>) => typeof o === 'string' ? o : o?.name as string) : (stryCov_9fa48("2991"), json.options.map(stryMutAct_9fa48("2992") ? () => undefined : (stryCov_9fa48("2992"), (o: Record<string, unknown>) => (stryMutAct_9fa48("2995") ? typeof o !== 'string' : stryMutAct_9fa48("2994") ? false : stryMutAct_9fa48("2993") ? true : (stryCov_9fa48("2993", "2994", "2995"), typeof o === (stryMutAct_9fa48("2996") ? "" : (stryCov_9fa48("2996"), 'string')))) ? o : o?.name as string)).filter(stryMutAct_9fa48("2997") ? () => undefined : (stryCov_9fa48("2997"), (n: string) => stryMutAct_9fa48("2998") ? !n : (stryCov_9fa48("2998"), !(stryMutAct_9fa48("2999") ? n : (stryCov_9fa48("2999"), !n)))))) : stryMutAct_9fa48("3000") ? ["Stryker was here"] : (stryCov_9fa48("3000"), []);
                  for (const v of json.variants) {
                    if (stryMutAct_9fa48("3001")) {
                      {}
                    } else {
                      stryCov_9fa48("3001");
                      const attributeAssignments: Record<string, string> = {};
                      const opts = stryMutAct_9fa48("3002") ? [v.option1, v.option2, v.option3] : (stryCov_9fa48("3002"), (stryMutAct_9fa48("3003") ? [] : (stryCov_9fa48("3003"), [v.option1, v.option2, v.option3])).filter(stryMutAct_9fa48("3004") ? () => undefined : (stryCov_9fa48("3004"), (x: unknown) => stryMutAct_9fa48("3007") ? typeof x !== 'string' : stryMutAct_9fa48("3006") ? false : stryMutAct_9fa48("3005") ? true : (stryCov_9fa48("3005", "3006", "3007"), typeof x === (stryMutAct_9fa48("3008") ? "" : (stryCov_9fa48("3008"), 'string'))))));
                      for (let i = 0; stryMutAct_9fa48("3011") ? i >= opts.length : stryMutAct_9fa48("3010") ? i <= opts.length : stryMutAct_9fa48("3009") ? false : (stryCov_9fa48("3009", "3010", "3011"), i < opts.length); stryMutAct_9fa48("3012") ? i-- : (stryCov_9fa48("3012"), i++)) {
                        if (stryMutAct_9fa48("3013")) {
                          {}
                        } else {
                          stryCov_9fa48("3013");
                          const key = stryMutAct_9fa48("3016") ? optionNames[i] && `option${i + 1}` : stryMutAct_9fa48("3015") ? false : stryMutAct_9fa48("3014") ? true : (stryCov_9fa48("3014", "3015", "3016"), optionNames[i] || (stryMutAct_9fa48("3017") ? `` : (stryCov_9fa48("3017"), `option${stryMutAct_9fa48("3018") ? i - 1 : (stryCov_9fa48("3018"), i + 1)}`)));
                          attributeAssignments[key] = opts[i];
                        }
                      }
                      const price = (stryMutAct_9fa48("3019") ? (v.price ?? v.compare_at_price) && '' : (stryCov_9fa48("3019"), (stryMutAct_9fa48("3020") ? v.price && v.compare_at_price : (stryCov_9fa48("3020"), v.price ?? v.compare_at_price)) ?? (stryMutAct_9fa48("3021") ? "Stryker was here!" : (stryCov_9fa48("3021"), '')))).toString();
                      const sale = (stryMutAct_9fa48("3022") ? v.compare_at_price && '' : (stryCov_9fa48("3022"), v.compare_at_price ?? (stryMutAct_9fa48("3023") ? "Stryker was here!" : (stryCov_9fa48("3023"), '')))).toString();
                      const stockStatus = (stryMutAct_9fa48("3026") ? v.available !== false : stryMutAct_9fa48("3025") ? false : stryMutAct_9fa48("3024") ? true : (stryCov_9fa48("3024", "3025", "3026"), v.available === (stryMutAct_9fa48("3027") ? true : (stryCov_9fa48("3027"), false)))) ? stryMutAct_9fa48("3028") ? "" : (stryCov_9fa48("3028"), 'outofstock') : stryMutAct_9fa48("3029") ? "" : (stryCov_9fa48("3029"), 'instock');
                      const images: string[] = stryMutAct_9fa48("3030") ? ["Stryker was here"] : (stryCov_9fa48("3030"), []);
                      if (stryMutAct_9fa48("3033") ? v.featured_image || v.featured_image.src || v.featured_image.url : stryMutAct_9fa48("3032") ? false : stryMutAct_9fa48("3031") ? true : (stryCov_9fa48("3031", "3032", "3033"), v.featured_image && (stryMutAct_9fa48("3035") ? v.featured_image.src && v.featured_image.url : stryMutAct_9fa48("3034") ? true : (stryCov_9fa48("3034", "3035"), v.featured_image.src || v.featured_image.url)))) {
                        if (stryMutAct_9fa48("3036")) {
                          {}
                        } else {
                          stryCov_9fa48("3036");
                          images.push(stryMutAct_9fa48("3039") ? v.featured_image.url && v.featured_image.src : stryMutAct_9fa48("3038") ? false : stryMutAct_9fa48("3037") ? true : (stryCov_9fa48("3037", "3038", "3039"), v.featured_image.url || v.featured_image.src));
                        }
                      }
                      variations.push(stryMutAct_9fa48("3040") ? {} : (stryCov_9fa48("3040"), {
                        // Try explicit SKU; fallback to variant URL query param SKU
                        sku: stryMutAct_9fa48("3043") ? ((v.sku || '').toString() || this.extractVariantSkuFromLinks(dom, v.id) || this.extractText(dom, '.sku, [data-sku], .product-sku')) && 'SKU' : stryMutAct_9fa48("3042") ? false : stryMutAct_9fa48("3041") ? true : (stryCov_9fa48("3041", "3042", "3043"), (stryMutAct_9fa48("3045") ? ((v.sku || '').toString() || this.extractVariantSkuFromLinks(dom, v.id)) && this.extractText(dom, '.sku, [data-sku], .product-sku') : stryMutAct_9fa48("3044") ? false : (stryCov_9fa48("3044", "3045"), (stryMutAct_9fa48("3047") ? (v.sku || '').toString() && this.extractVariantSkuFromLinks(dom, v.id) : stryMutAct_9fa48("3046") ? false : (stryCov_9fa48("3046", "3047"), (stryMutAct_9fa48("3050") ? v.sku && '' : stryMutAct_9fa48("3049") ? false : stryMutAct_9fa48("3048") ? true : (stryCov_9fa48("3048", "3049", "3050"), v.sku || (stryMutAct_9fa48("3051") ? "Stryker was here!" : (stryCov_9fa48("3051"), '')))).toString() || this.extractVariantSkuFromLinks(dom, v.id))) || this.extractText(dom, stryMutAct_9fa48("3052") ? "" : (stryCov_9fa48("3052"), '.sku, [data-sku], .product-sku')))) || (stryMutAct_9fa48("3053") ? "" : (stryCov_9fa48("3053"), 'SKU'))),
                        regularPrice: price,
                        salePrice: sale,
                        taxClass: stryMutAct_9fa48("3054") ? "Stryker was here!" : (stryCov_9fa48("3054"), ''),
                        stockStatus,
                        images,
                        attributeAssignments
                      }));
                    }
                  }
                  if (stryMutAct_9fa48("3058") ? variations.length <= 0 : stryMutAct_9fa48("3057") ? variations.length >= 0 : stryMutAct_9fa48("3056") ? false : stryMutAct_9fa48("3055") ? true : (stryCov_9fa48("3055", "3056", "3057", "3058"), variations.length > 0)) {
                    if (stryMutAct_9fa48("3059")) {
                      {}
                    } else {
                      stryCov_9fa48("3059");
                      if (stryMutAct_9fa48("3062") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("3061") ? false : stryMutAct_9fa48("3060") ? true : (stryCov_9fa48("3060", "3061", "3062"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("3063") ? "" : (stryCov_9fa48("3063"), '1')))) console.log(stryMutAct_9fa48("3064") ? `` : (stryCov_9fa48("3064"), `Extracted ${variations.length} variations from Shopify Product JSON`));
                      return variations;
                    }
                  }
                }
              }

              // Case B: LD+JSON with Product/offers (can be single or array)
              if (stryMutAct_9fa48("3067") ? json || json['@type'] === 'Product' || Array.isArray(json['@graph']) && json['@graph'].some((g: Record<string, unknown>) => g['@type'] === 'Product') : stryMutAct_9fa48("3066") ? false : stryMutAct_9fa48("3065") ? true : (stryCov_9fa48("3065", "3066", "3067"), json && (stryMutAct_9fa48("3069") ? json['@type'] === 'Product' && Array.isArray(json['@graph']) && json['@graph'].some((g: Record<string, unknown>) => g['@type'] === 'Product') : stryMutAct_9fa48("3068") ? true : (stryCov_9fa48("3068", "3069"), (stryMutAct_9fa48("3071") ? json['@type'] !== 'Product' : stryMutAct_9fa48("3070") ? false : (stryCov_9fa48("3070", "3071"), json[stryMutAct_9fa48("3072") ? "" : (stryCov_9fa48("3072"), '@type')] === (stryMutAct_9fa48("3073") ? "" : (stryCov_9fa48("3073"), 'Product')))) || (stryMutAct_9fa48("3075") ? Array.isArray(json['@graph']) || json['@graph'].some((g: Record<string, unknown>) => g['@type'] === 'Product') : stryMutAct_9fa48("3074") ? false : (stryCov_9fa48("3074", "3075"), Array.isArray(json[stryMutAct_9fa48("3076") ? "" : (stryCov_9fa48("3076"), '@graph')]) && (stryMutAct_9fa48("3077") ? json['@graph'].every((g: Record<string, unknown>) => g['@type'] === 'Product') : (stryCov_9fa48("3077"), json[stryMutAct_9fa48("3078") ? "" : (stryCov_9fa48("3078"), '@graph')].some(stryMutAct_9fa48("3079") ? () => undefined : (stryCov_9fa48("3079"), (g: Record<string, unknown>) => stryMutAct_9fa48("3082") ? g['@type'] !== 'Product' : stryMutAct_9fa48("3081") ? false : stryMutAct_9fa48("3080") ? true : (stryCov_9fa48("3080", "3081", "3082"), g[stryMutAct_9fa48("3083") ? "" : (stryCov_9fa48("3083"), '@type')] === (stryMutAct_9fa48("3084") ? "" : (stryCov_9fa48("3084"), 'Product'))))))))))))) {
                if (stryMutAct_9fa48("3085")) {
                  {}
                } else {
                  stryCov_9fa48("3085");
                  const productObj = Array.isArray(json[stryMutAct_9fa48("3086") ? "" : (stryCov_9fa48("3086"), '@graph')]) ? json[stryMutAct_9fa48("3087") ? "" : (stryCov_9fa48("3087"), '@graph')].find(stryMutAct_9fa48("3088") ? () => undefined : (stryCov_9fa48("3088"), (g: Record<string, unknown>) => stryMutAct_9fa48("3091") ? g['@type'] !== 'Product' : stryMutAct_9fa48("3090") ? false : stryMutAct_9fa48("3089") ? true : (stryCov_9fa48("3089", "3090", "3091"), g[stryMutAct_9fa48("3092") ? "" : (stryCov_9fa48("3092"), '@type')] === (stryMutAct_9fa48("3093") ? "" : (stryCov_9fa48("3093"), 'Product'))))) : json;
                  const offers = stryMutAct_9fa48("3094") ? productObj.offers : (stryCov_9fa48("3094"), productObj?.offers);
                  const offersArray = Array.isArray(offers) ? offers : offers ? stryMutAct_9fa48("3095") ? [] : (stryCov_9fa48("3095"), [offers]) : stryMutAct_9fa48("3096") ? ["Stryker was here"] : (stryCov_9fa48("3096"), []);
                  for (const offer of offersArray) {
                    if (stryMutAct_9fa48("3097")) {
                      {}
                    } else {
                      stryCov_9fa48("3097");
                      // LD+JSON lacks explicit option mapping; capture price/sku and leave attributes empty
                      const price = (stryMutAct_9fa48("3098") ? offer.price && '' : (stryCov_9fa48("3098"), offer.price ?? (stryMutAct_9fa48("3099") ? "Stryker was here!" : (stryCov_9fa48("3099"), '')))).toString();
                      const stockStatus = /InStock/i.test(stryMutAct_9fa48("3102") ? offer.availability && '' : stryMutAct_9fa48("3101") ? false : stryMutAct_9fa48("3100") ? true : (stryCov_9fa48("3100", "3101", "3102"), offer.availability || (stryMutAct_9fa48("3103") ? "Stryker was here!" : (stryCov_9fa48("3103"), '')))) ? stryMutAct_9fa48("3104") ? "" : (stryCov_9fa48("3104"), 'instock') : stryMutAct_9fa48("3105") ? "" : (stryCov_9fa48("3105"), 'outofstock');
                      variations.push(stryMutAct_9fa48("3106") ? {} : (stryCov_9fa48("3106"), {
                        sku: stryMutAct_9fa48("3109") ? ((offer.sku || '').toString() || this.extractText(dom, '.sku, [data-sku], .product-sku')) && 'SKU' : stryMutAct_9fa48("3108") ? false : stryMutAct_9fa48("3107") ? true : (stryCov_9fa48("3107", "3108", "3109"), (stryMutAct_9fa48("3111") ? (offer.sku || '').toString() && this.extractText(dom, '.sku, [data-sku], .product-sku') : stryMutAct_9fa48("3110") ? false : (stryCov_9fa48("3110", "3111"), (stryMutAct_9fa48("3114") ? offer.sku && '' : stryMutAct_9fa48("3113") ? false : stryMutAct_9fa48("3112") ? true : (stryCov_9fa48("3112", "3113", "3114"), offer.sku || (stryMutAct_9fa48("3115") ? "Stryker was here!" : (stryCov_9fa48("3115"), '')))).toString() || this.extractText(dom, stryMutAct_9fa48("3116") ? "" : (stryCov_9fa48("3116"), '.sku, [data-sku], .product-sku')))) || (stryMutAct_9fa48("3117") ? "" : (stryCov_9fa48("3117"), 'SKU'))),
                        regularPrice: price,
                        taxClass: stryMutAct_9fa48("3118") ? "Stryker was here!" : (stryCov_9fa48("3118"), ''),
                        stockStatus,
                        images: stryMutAct_9fa48("3119") ? ["Stryker was here"] : (stryCov_9fa48("3119"), []),
                        attributeAssignments: {}
                      }));
                    }
                  }
                  if (stryMutAct_9fa48("3123") ? variations.length <= 0 : stryMutAct_9fa48("3122") ? variations.length >= 0 : stryMutAct_9fa48("3121") ? false : stryMutAct_9fa48("3120") ? true : (stryCov_9fa48("3120", "3121", "3122", "3123"), variations.length > 0)) {
                    if (stryMutAct_9fa48("3124")) {
                      {}
                    } else {
                      stryCov_9fa48("3124");
                      if (stryMutAct_9fa48("3127") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("3126") ? false : stryMutAct_9fa48("3125") ? true : (stryCov_9fa48("3125", "3126", "3127"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("3128") ? "" : (stryCov_9fa48("3128"), '1')))) console.log(stryMutAct_9fa48("3129") ? `` : (stryCov_9fa48("3129"), `Extracted ${variations.length} variations from LD+JSON offers`));
                      return variations;
                    }
                  }
                }
              }
            }
          }
        }
      } catch (e) {
        if (stryMutAct_9fa48("3130")) {
          {}
        } else {
          stryCov_9fa48("3130");
          if (stryMutAct_9fa48("3133") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("3132") ? false : stryMutAct_9fa48("3131") ? true : (stryCov_9fa48("3131", "3132", "3133"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("3134") ? "" : (stryCov_9fa48("3134"), '1')))) console.warn(stryMutAct_9fa48("3135") ? "" : (stryCov_9fa48("3135"), 'Failed to parse Shopify/LD+JSON variants:'), e);
        }
      }

      // 1) WooCommerce: parse JSON from data-product_variations on form.variations_form
      const forms = dom.window.document.querySelectorAll(stryMutAct_9fa48("3136") ? "" : (stryCov_9fa48("3136"), 'form.variations_form[data-product_variations]'));
      if (stryMutAct_9fa48("3139") ? forms || forms.length > 0 : stryMutAct_9fa48("3138") ? false : stryMutAct_9fa48("3137") ? true : (stryCov_9fa48("3137", "3138", "3139"), forms && (stryMutAct_9fa48("3142") ? forms.length <= 0 : stryMutAct_9fa48("3141") ? forms.length >= 0 : stryMutAct_9fa48("3140") ? true : (stryCov_9fa48("3140", "3141", "3142"), forms.length > 0)))) {
        if (stryMutAct_9fa48("3143")) {
          {}
        } else {
          stryCov_9fa48("3143");
          for (const form of Array.from(forms)) {
            if (stryMutAct_9fa48("3144")) {
              {}
            } else {
              stryCov_9fa48("3144");
              const raw = form.getAttribute(stryMutAct_9fa48("3145") ? "" : (stryCov_9fa48("3145"), 'data-product_variations'));
              if (stryMutAct_9fa48("3148") ? raw || raw.trim() !== '' : stryMutAct_9fa48("3147") ? false : stryMutAct_9fa48("3146") ? true : (stryCov_9fa48("3146", "3147", "3148"), raw && (stryMutAct_9fa48("3150") ? raw.trim() === '' : stryMutAct_9fa48("3149") ? true : (stryCov_9fa48("3149", "3150"), (stryMutAct_9fa48("3151") ? raw : (stryCov_9fa48("3151"), raw.trim())) !== (stryMutAct_9fa48("3152") ? "Stryker was here!" : (stryCov_9fa48("3152"), '')))))) {
                if (stryMutAct_9fa48("3153")) {
                  {}
                } else {
                  stryCov_9fa48("3153");
                  try {
                    if (stryMutAct_9fa48("3154")) {
                      {}
                    } else {
                      stryCov_9fa48("3154");
                      // Some themes HTML-encode quotes, handle that
                      const normalized = raw.replace(/&quot;/g, stryMutAct_9fa48("3155") ? "" : (stryCov_9fa48("3155"), '"')).replace(/&#34;/g, stryMutAct_9fa48("3156") ? "" : (stryCov_9fa48("3156"), '"')).replace(/&amp;/g, stryMutAct_9fa48("3157") ? "" : (stryCov_9fa48("3157"), '&'));
                      const parsed = JSON.parse(normalized);
                      if (stryMutAct_9fa48("3159") ? false : stryMutAct_9fa48("3158") ? true : (stryCov_9fa48("3158", "3159"), Array.isArray(parsed))) {
                        if (stryMutAct_9fa48("3160")) {
                          {}
                        } else {
                          stryCov_9fa48("3160");
                          for (const v of parsed) {
                            if (stryMutAct_9fa48("3161")) {
                              {}
                            } else {
                              stryCov_9fa48("3161");
                              const attrs = stryMutAct_9fa48("3164") ? v.attributes && {} : stryMutAct_9fa48("3163") ? false : stryMutAct_9fa48("3162") ? true : (stryCov_9fa48("3162", "3163", "3164"), v.attributes || {});
                              const attributeAssignments: Record<string, string> = {};
                              Object.keys(attrs).forEach(k => {
                                if (stryMutAct_9fa48("3165")) {
                                  {}
                                } else {
                                  stryCov_9fa48("3165");
                                  // keys like attribute_pa_color -> clean to pa_color
                                  const cleanKey = k.replace(stryMutAct_9fa48("3166") ? /attribute_/ : (stryCov_9fa48("3166"), /^attribute_/), stryMutAct_9fa48("3167") ? "Stryker was here!" : (stryCov_9fa48("3167"), ''));
                                  const value = attrs[k];
                                  if (stryMutAct_9fa48("3170") ? typeof value === 'string' || value.trim() !== '' : stryMutAct_9fa48("3169") ? false : stryMutAct_9fa48("3168") ? true : (stryCov_9fa48("3168", "3169", "3170"), (stryMutAct_9fa48("3172") ? typeof value !== 'string' : stryMutAct_9fa48("3171") ? true : (stryCov_9fa48("3171", "3172"), typeof value === (stryMutAct_9fa48("3173") ? "" : (stryCov_9fa48("3173"), 'string')))) && (stryMutAct_9fa48("3175") ? value.trim() === '' : stryMutAct_9fa48("3174") ? true : (stryCov_9fa48("3174", "3175"), (stryMutAct_9fa48("3176") ? value : (stryCov_9fa48("3176"), value.trim())) !== (stryMutAct_9fa48("3177") ? "Stryker was here!" : (stryCov_9fa48("3177"), '')))))) {
                                    if (stryMutAct_9fa48("3178")) {
                                      {}
                                    } else {
                                      stryCov_9fa48("3178");
                                      attributeAssignments[cleanKey] = value;
                                    }
                                  }
                                }
                              });
                              const price = (stryMutAct_9fa48("3179") ? (v.display_price ?? v.price ?? v.display_regular_price ?? v.regular_price) && '' : (stryCov_9fa48("3179"), (stryMutAct_9fa48("3180") ? (v.display_price ?? v.price ?? v.display_regular_price) && v.regular_price : (stryCov_9fa48("3180"), (stryMutAct_9fa48("3181") ? (v.display_price ?? v.price) && v.display_regular_price : (stryCov_9fa48("3181"), (stryMutAct_9fa48("3182") ? v.display_price && v.price : (stryCov_9fa48("3182"), v.display_price ?? v.price)) ?? v.display_regular_price)) ?? v.regular_price)) ?? (stryMutAct_9fa48("3183") ? "Stryker was here!" : (stryCov_9fa48("3183"), '')))).toString();
                              const sale = (stryMutAct_9fa48("3184") ? (v.display_sale_price ?? v.sale_price) && '' : (stryCov_9fa48("3184"), (stryMutAct_9fa48("3185") ? v.display_sale_price && v.sale_price : (stryCov_9fa48("3185"), v.display_sale_price ?? v.sale_price)) ?? (stryMutAct_9fa48("3186") ? "Stryker was here!" : (stryCov_9fa48("3186"), '')))).toString();
                              const stockStatus = (stryMutAct_9fa48("3189") ? v.is_in_stock !== false : stryMutAct_9fa48("3188") ? false : stryMutAct_9fa48("3187") ? true : (stryCov_9fa48("3187", "3188", "3189"), v.is_in_stock === (stryMutAct_9fa48("3190") ? true : (stryCov_9fa48("3190"), false)))) ? stryMutAct_9fa48("3191") ? "" : (stryCov_9fa48("3191"), 'outofstock') : stryMutAct_9fa48("3192") ? "" : (stryCov_9fa48("3192"), 'instock');
                              const images: string[] = stryMutAct_9fa48("3193") ? ["Stryker was here"] : (stryCov_9fa48("3193"), []);
                              if (stryMutAct_9fa48("3196") ? v.image || v.image.src || v.image.full_src : stryMutAct_9fa48("3195") ? false : stryMutAct_9fa48("3194") ? true : (stryCov_9fa48("3194", "3195", "3196"), v.image && (stryMutAct_9fa48("3198") ? v.image.src && v.image.full_src : stryMutAct_9fa48("3197") ? true : (stryCov_9fa48("3197", "3198"), v.image.src || v.image.full_src)))) {
                                if (stryMutAct_9fa48("3199")) {
                                  {}
                                } else {
                                  stryCov_9fa48("3199");
                                  images.push(stryMutAct_9fa48("3202") ? v.image.full_src && v.image.src : stryMutAct_9fa48("3201") ? false : stryMutAct_9fa48("3200") ? true : (stryCov_9fa48("3200", "3201", "3202"), v.image.full_src || v.image.src));
                                }
                              }
                              variations.push(stryMutAct_9fa48("3203") ? {} : (stryCov_9fa48("3203"), {
                                sku: stryMutAct_9fa48("3206") ? ((v.sku || '').toString() || this.extractText(dom, '.sku, [data-sku], .product-sku')) && 'SKU' : stryMutAct_9fa48("3205") ? false : stryMutAct_9fa48("3204") ? true : (stryCov_9fa48("3204", "3205", "3206"), (stryMutAct_9fa48("3208") ? (v.sku || '').toString() && this.extractText(dom, '.sku, [data-sku], .product-sku') : stryMutAct_9fa48("3207") ? false : (stryCov_9fa48("3207", "3208"), (stryMutAct_9fa48("3211") ? v.sku && '' : stryMutAct_9fa48("3210") ? false : stryMutAct_9fa48("3209") ? true : (stryCov_9fa48("3209", "3210", "3211"), v.sku || (stryMutAct_9fa48("3212") ? "Stryker was here!" : (stryCov_9fa48("3212"), '')))).toString() || this.extractText(dom, stryMutAct_9fa48("3213") ? "" : (stryCov_9fa48("3213"), '.sku, [data-sku], .product-sku')))) || (stryMutAct_9fa48("3214") ? "" : (stryCov_9fa48("3214"), 'SKU'))),
                                regularPrice: price,
                                salePrice: sale,
                                taxClass: stryMutAct_9fa48("3215") ? "Stryker was here!" : (stryCov_9fa48("3215"), ''),
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
                    if (stryMutAct_9fa48("3216")) {
                      {}
                    } else {
                      stryCov_9fa48("3216");
                      if (stryMutAct_9fa48("3219") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("3218") ? false : stryMutAct_9fa48("3217") ? true : (stryCov_9fa48("3217", "3218", "3219"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("3220") ? "" : (stryCov_9fa48("3220"), '1')))) console.warn(stryMutAct_9fa48("3221") ? "" : (stryCov_9fa48("3221"), 'Failed to parse data-product_variations JSON:'), e);
                    }
                  }
                }
              }
            }
          }
          if (stryMutAct_9fa48("3225") ? variations.length <= 0 : stryMutAct_9fa48("3224") ? variations.length >= 0 : stryMutAct_9fa48("3223") ? false : stryMutAct_9fa48("3222") ? true : (stryCov_9fa48("3222", "3223", "3224", "3225"), variations.length > 0)) {
            if (stryMutAct_9fa48("3226")) {
              {}
            } else {
              stryCov_9fa48("3226");
              if (stryMutAct_9fa48("3229") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("3228") ? false : stryMutAct_9fa48("3227") ? true : (stryCov_9fa48("3227", "3228", "3229"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("3230") ? "" : (stryCov_9fa48("3230"), '1')))) console.log(stryMutAct_9fa48("3231") ? `` : (stryCov_9fa48("3231"), `Extracted ${variations.length} variations from data-product_variations JSON`));
              return variations;
            }
          }
        }
      }

      // 2) Fallback: extract from DOM selects/prices as before
      // First, try to extract variations from variation forms (WooCommerce style)
      for (const sel of selectorArray) {
        if (stryMutAct_9fa48("3232")) {
          {}
        } else {
          stryCov_9fa48("3232");
          const variationElements = this.extractElements(dom, sel);
          if (stryMutAct_9fa48("3236") ? variationElements.length <= 0 : stryMutAct_9fa48("3235") ? variationElements.length >= 0 : stryMutAct_9fa48("3234") ? false : stryMutAct_9fa48("3233") ? true : (stryCov_9fa48("3233", "3234", "3235", "3236"), variationElements.length > 0)) {
            if (stryMutAct_9fa48("3237")) {
              {}
            } else {
              stryCov_9fa48("3237");
              if (stryMutAct_9fa48("3240") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("3239") ? false : stryMutAct_9fa48("3238") ? true : (stryCov_9fa48("3238", "3239", "3240"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("3241") ? "" : (stryCov_9fa48("3241"), '1')))) console.log(stryMutAct_9fa48("3242") ? `` : (stryCov_9fa48("3242"), `Found ${variationElements.length} variation elements with selector: ${sel}`));
              for (const element of variationElements) {
                if (stryMutAct_9fa48("3243")) {
                  {}
                } else {
                  stryCov_9fa48("3243");
                  // Look for variation options in select elements
                  const selectElements = element.querySelectorAll(stryMutAct_9fa48("3244") ? "" : (stryCov_9fa48("3244"), 'select[name*="attribute"], select[class*="variation"], select[class*="attribute"]'));
                  if (stryMutAct_9fa48("3248") ? selectElements.length <= 0 : stryMutAct_9fa48("3247") ? selectElements.length >= 0 : stryMutAct_9fa48("3246") ? false : stryMutAct_9fa48("3245") ? true : (stryCov_9fa48("3245", "3246", "3247", "3248"), selectElements.length > 0)) {
                    if (stryMutAct_9fa48("3249")) {
                      {}
                    } else {
                      stryCov_9fa48("3249");
                      if (stryMutAct_9fa48("3252") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("3251") ? false : stryMutAct_9fa48("3250") ? true : (stryCov_9fa48("3250", "3251", "3252"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("3253") ? "" : (stryCov_9fa48("3253"), '1')))) console.log(stryMutAct_9fa48("3254") ? `` : (stryCov_9fa48("3254"), `Found ${selectElements.length} variation select elements`));

                      // Only create variations if we have actual variation data (different prices, SKUs, etc.)
                      // Don't create variations for every attribute option to avoid CSV duplication
                      const basePrice = stryMutAct_9fa48("3257") ? this.extractText(dom, '.price, [data-price], .product-price') && '' : stryMutAct_9fa48("3256") ? false : stryMutAct_9fa48("3255") ? true : (stryCov_9fa48("3255", "3256", "3257"), this.extractText(dom, stryMutAct_9fa48("3258") ? "" : (stryCov_9fa48("3258"), '.price, [data-price], .product-price')) || (stryMutAct_9fa48("3259") ? "Stryker was here!" : (stryCov_9fa48("3259"), '')));
                      const baseSku = stryMutAct_9fa48("3262") ? this.extractText(dom, '.sku, [data-sku], .product-sku') && 'SKU' : stryMutAct_9fa48("3261") ? false : stryMutAct_9fa48("3260") ? true : (stryCov_9fa48("3260", "3261", "3262"), this.extractText(dom, stryMutAct_9fa48("3263") ? "" : (stryCov_9fa48("3263"), '.sku, [data-sku], .product-sku')) || (stryMutAct_9fa48("3264") ? "" : (stryCov_9fa48("3264"), 'SKU')));

                      // Check if this is a true variable product with different prices/SKUs
                      const hasPriceVariations = this.checkForPriceVariations(dom);
                      const hasSkuVariations = this.checkForSkuVariations(dom);
                      if (stryMutAct_9fa48("3267") ? hasPriceVariations && hasSkuVariations : stryMutAct_9fa48("3266") ? false : stryMutAct_9fa48("3265") ? true : (stryCov_9fa48("3265", "3266", "3267"), hasPriceVariations || hasSkuVariations)) {
                        if (stryMutAct_9fa48("3268")) {
                          {}
                        } else {
                          stryCov_9fa48("3268");
                          if (stryMutAct_9fa48("3271") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("3270") ? false : stryMutAct_9fa48("3269") ? true : (stryCov_9fa48("3269", "3270", "3271"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("3272") ? "" : (stryCov_9fa48("3272"), '1')))) console.log(stryMutAct_9fa48("3273") ? "" : (stryCov_9fa48("3273"), 'Found actual price/SKU variations, creating variation records'));

                          // Extract options from each select
                          for (const select of Array.from(selectElements)) {
                            if (stryMutAct_9fa48("3274")) {
                              {}
                            } else {
                              stryCov_9fa48("3274");
                              const options = select.querySelectorAll(stryMutAct_9fa48("3275") ? "" : (stryCov_9fa48("3275"), 'option[value]:not([value=""])'));
                              const attributeName = stryMutAct_9fa48("3278") ? (select.getAttribute('name') || select.getAttribute('data-attribute')) && 'Unknown' : stryMutAct_9fa48("3277") ? false : stryMutAct_9fa48("3276") ? true : (stryCov_9fa48("3276", "3277", "3278"), (stryMutAct_9fa48("3280") ? select.getAttribute('name') && select.getAttribute('data-attribute') : stryMutAct_9fa48("3279") ? false : (stryCov_9fa48("3279", "3280"), select.getAttribute(stryMutAct_9fa48("3281") ? "" : (stryCov_9fa48("3281"), 'name')) || select.getAttribute(stryMutAct_9fa48("3282") ? "" : (stryCov_9fa48("3282"), 'data-attribute')))) || (stryMutAct_9fa48("3283") ? "" : (stryCov_9fa48("3283"), 'Unknown')));
                              if (stryMutAct_9fa48("3286") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("3285") ? false : stryMutAct_9fa48("3284") ? true : (stryCov_9fa48("3284", "3285", "3286"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("3287") ? "" : (stryCov_9fa48("3287"), '1')))) console.log(stryMutAct_9fa48("3288") ? `` : (stryCov_9fa48("3288"), `Found ${options.length} options for attribute: ${attributeName}`));
                              for (const option of Array.from(options)) {
                                if (stryMutAct_9fa48("3289")) {
                                  {}
                                } else {
                                  stryCov_9fa48("3289");
                                  const value = option.getAttribute(stryMutAct_9fa48("3290") ? "" : (stryCov_9fa48("3290"), 'value'));
                                  const text = stryMutAct_9fa48("3292") ? option.textContent.trim() : stryMutAct_9fa48("3291") ? option.textContent : (stryCov_9fa48("3291", "3292"), option.textContent?.trim());
                                  if (stryMutAct_9fa48("3295") ? value && text || !this.isPlaceholderValue(text) : stryMutAct_9fa48("3294") ? false : stryMutAct_9fa48("3293") ? true : (stryCov_9fa48("3293", "3294", "3295"), (stryMutAct_9fa48("3297") ? value || text : stryMutAct_9fa48("3296") ? true : (stryCov_9fa48("3296", "3297"), value && text)) && (stryMutAct_9fa48("3298") ? this.isPlaceholderValue(text) : (stryCov_9fa48("3298"), !this.isPlaceholderValue(text))))) {
                                    if (stryMutAct_9fa48("3299")) {
                                      {}
                                    } else {
                                      stryCov_9fa48("3299");
                                      // Create a variation for each option
                                      const sku = stryMutAct_9fa48("3300") ? `` : (stryCov_9fa48("3300"), `${baseSku}-${value}`);
                                      variations.push(stryMutAct_9fa48("3301") ? {} : (stryCov_9fa48("3301"), {
                                        sku,
                                        regularPrice: basePrice,
                                        taxClass: stryMutAct_9fa48("3302") ? "Stryker was here!" : (stryCov_9fa48("3302"), ''),
                                        stockStatus: stryMutAct_9fa48("3303") ? "" : (stryCov_9fa48("3303"), 'instock'),
                                        images: stryMutAct_9fa48("3304") ? ["Stryker was here"] : (stryCov_9fa48("3304"), []),
                                        attributeAssignments: stryMutAct_9fa48("3305") ? {} : (stryCov_9fa48("3305"), {
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
                        if (stryMutAct_9fa48("3306")) {
                          {}
                        } else {
                          stryCov_9fa48("3306");
                          if (stryMutAct_9fa48("3309") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("3308") ? false : stryMutAct_9fa48("3307") ? true : (stryCov_9fa48("3307", "3308", "3309"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("3310") ? "" : (stryCov_9fa48("3310"), '1')))) console.log(stryMutAct_9fa48("3311") ? "" : (stryCov_9fa48("3311"), 'No actual price/SKU variations found, treating as simple product with attributes'));
                          // Don't create variations - this is just a simple product with attribute options
                        }
                      }
                    }
                  }

                  // Also try traditional variation extraction
                  const sku = stryMutAct_9fa48("3314") ? element.querySelector('[data-sku], .sku, .product-sku').textContent?.trim() : stryMutAct_9fa48("3313") ? element.querySelector('[data-sku], .sku, .product-sku')?.textContent.trim() : stryMutAct_9fa48("3312") ? element.querySelector('[data-sku], .sku, .product-sku')?.textContent : (stryCov_9fa48("3312", "3313", "3314"), element.querySelector(stryMutAct_9fa48("3315") ? "" : (stryCov_9fa48("3315"), '[data-sku], .sku, .product-sku'))?.textContent?.trim());
                  const price = stryMutAct_9fa48("3318") ? element.querySelector('[data-price], .price, .product-price').textContent?.trim() : stryMutAct_9fa48("3317") ? element.querySelector('[data-price], .price, .product-price')?.textContent.trim() : stryMutAct_9fa48("3316") ? element.querySelector('[data-price], .price, .product-price')?.textContent : (stryCov_9fa48("3316", "3317", "3318"), element.querySelector(stryMutAct_9fa48("3319") ? "" : (stryCov_9fa48("3319"), '[data-price], .price, .product-price'))?.textContent?.trim());
                  if (stryMutAct_9fa48("3322") ? sku || !variations.some(v => v.sku === sku) : stryMutAct_9fa48("3321") ? false : stryMutAct_9fa48("3320") ? true : (stryCov_9fa48("3320", "3321", "3322"), sku && (stryMutAct_9fa48("3323") ? variations.some(v => v.sku === sku) : (stryCov_9fa48("3323"), !(stryMutAct_9fa48("3324") ? variations.every(v => v.sku === sku) : (stryCov_9fa48("3324"), variations.some(stryMutAct_9fa48("3325") ? () => undefined : (stryCov_9fa48("3325"), v => stryMutAct_9fa48("3328") ? v.sku !== sku : stryMutAct_9fa48("3327") ? false : stryMutAct_9fa48("3326") ? true : (stryCov_9fa48("3326", "3327", "3328"), v.sku === sku))))))))) {
                    if (stryMutAct_9fa48("3329")) {
                      {}
                    } else {
                      stryCov_9fa48("3329");
                      variations.push(stryMutAct_9fa48("3330") ? {} : (stryCov_9fa48("3330"), {
                        sku,
                        regularPrice: this.cleanPrice(stryMutAct_9fa48("3333") ? price && '' : stryMutAct_9fa48("3332") ? false : stryMutAct_9fa48("3331") ? true : (stryCov_9fa48("3331", "3332", "3333"), price || (stryMutAct_9fa48("3334") ? "Stryker was here!" : (stryCov_9fa48("3334"), '')))),
                        taxClass: stryMutAct_9fa48("3335") ? "Stryker was here!" : (stryCov_9fa48("3335"), ''),
                        stockStatus: stryMutAct_9fa48("3336") ? "" : (stryCov_9fa48("3336"), 'instock'),
                        images: stryMutAct_9fa48("3337") ? ["Stryker was here"] : (stryCov_9fa48("3337"), []),
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
      if (stryMutAct_9fa48("3340") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("3339") ? false : stryMutAct_9fa48("3338") ? true : (stryCov_9fa48("3338", "3339", "3340"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("3341") ? "" : (stryCov_9fa48("3341"), '1')))) console.log(stryMutAct_9fa48("3342") ? `` : (stryCov_9fa48("3342"), `Extracted ${variations.length} variations total`));
      return variations;
    }
  }

  /**
   * Extract variant SKU from ?variant= links on the page
   */
  private extractVariantSkuFromLinks(dom: JSDOM, variantId?: string): string | '' {
    if (stryMutAct_9fa48("3343")) {
      {}
    } else {
      stryCov_9fa48("3343");
      try {
        if (stryMutAct_9fa48("3344")) {
          {}
        } else {
          stryCov_9fa48("3344");
          const anchors = dom.window.document.querySelectorAll(stryMutAct_9fa48("3345") ? "" : (stryCov_9fa48("3345"), 'a[href*="?variant="]'));
          for (const a of Array.from(anchors)) {
            if (stryMutAct_9fa48("3346")) {
              {}
            } else {
              stryCov_9fa48("3346");
              const href = stryMutAct_9fa48("3349") ? a.getAttribute('href') && '' : stryMutAct_9fa48("3348") ? false : stryMutAct_9fa48("3347") ? true : (stryCov_9fa48("3347", "3348", "3349"), a.getAttribute(stryMutAct_9fa48("3350") ? "" : (stryCov_9fa48("3350"), 'href')) || (stryMutAct_9fa48("3351") ? "Stryker was here!" : (stryCov_9fa48("3351"), '')));
              const u = new URL(href, this.baseUrl);
              const v = u.searchParams.get(stryMutAct_9fa48("3352") ? "" : (stryCov_9fa48("3352"), 'variant'));
              if (stryMutAct_9fa48("3355") ? v || !variantId || v === String(variantId) : stryMutAct_9fa48("3354") ? false : stryMutAct_9fa48("3353") ? true : (stryCov_9fa48("3353", "3354", "3355"), v && (stryMutAct_9fa48("3357") ? !variantId && v === String(variantId) : stryMutAct_9fa48("3356") ? true : (stryCov_9fa48("3356", "3357"), (stryMutAct_9fa48("3358") ? variantId : (stryCov_9fa48("3358"), !variantId)) || (stryMutAct_9fa48("3360") ? v !== String(variantId) : stryMutAct_9fa48("3359") ? false : (stryCov_9fa48("3359", "3360"), v === String(variantId))))))) {
                if (stryMutAct_9fa48("3361")) {
                  {}
                } else {
                  stryCov_9fa48("3361");
                  return v;
                }
              }
            }
          }
        }
      } catch {
        // Ignore URL parsing errors and continue
      }
      return stryMutAct_9fa48("3362") ? "Stryker was here!" : (stryCov_9fa48("3362"), '');
    }
  }

  /**
   * Check if a value is a placeholder
   */
  protected isPlaceholderValue(value: string): boolean {
    if (stryMutAct_9fa48("3363")) {
      {}
    } else {
      stryCov_9fa48("3363");
      const placeholders = stryMutAct_9fa48("3364") ? [] : (stryCov_9fa48("3364"), [stryMutAct_9fa48("3365") ? "" : (stryCov_9fa48("3365"), 'בחר אפשרות'), stryMutAct_9fa48("3366") ? "" : (stryCov_9fa48("3366"), 'בחירת אפשרות'), stryMutAct_9fa48("3367") ? "" : (stryCov_9fa48("3367"), 'Select option'), stryMutAct_9fa48("3368") ? "" : (stryCov_9fa48("3368"), 'Choose option'), stryMutAct_9fa48("3369") ? "" : (stryCov_9fa48("3369"), 'בחר גודל'), stryMutAct_9fa48("3370") ? "" : (stryCov_9fa48("3370"), 'בחר צבע'), stryMutAct_9fa48("3371") ? "" : (stryCov_9fa48("3371"), 'בחר מודל'), stryMutAct_9fa48("3372") ? "" : (stryCov_9fa48("3372"), 'Select size'), stryMutAct_9fa48("3373") ? "" : (stryCov_9fa48("3373"), 'Select color'), stryMutAct_9fa48("3374") ? "" : (stryCov_9fa48("3374"), 'Select model'), stryMutAct_9fa48("3375") ? "" : (stryCov_9fa48("3375"), 'General'), stryMutAct_9fa48("3376") ? "" : (stryCov_9fa48("3376"), 'בחירת אפשרותA'), stryMutAct_9fa48("3377") ? "" : (stryCov_9fa48("3377"), 'בחירת אפשרותB'), stryMutAct_9fa48("3378") ? "" : (stryCov_9fa48("3378"), 'בחירת אפשרותC'), stryMutAct_9fa48("3379") ? "" : (stryCov_9fa48("3379"), 'בחירת אפשרותD'), stryMutAct_9fa48("3380") ? "" : (stryCov_9fa48("3380"), 'בחירת אפשרותE'), stryMutAct_9fa48("3381") ? "" : (stryCov_9fa48("3381"), 'בחירת אפשרותF'), stryMutAct_9fa48("3382") ? "" : (stryCov_9fa48("3382"), 'בחירת אפשרותG'), stryMutAct_9fa48("3383") ? "" : (stryCov_9fa48("3383"), 'בחירת אפשרותH'), stryMutAct_9fa48("3384") ? "" : (stryCov_9fa48("3384"), 'בחירת אפשרותI'), stryMutAct_9fa48("3385") ? "" : (stryCov_9fa48("3385"), 'בחירת אפשרותJ'), stryMutAct_9fa48("3386") ? "" : (stryCov_9fa48("3386"), 'בחירת אפשרותK'), stryMutAct_9fa48("3387") ? "" : (stryCov_9fa48("3387"), 'בחירת אפשרותL'), stryMutAct_9fa48("3388") ? "" : (stryCov_9fa48("3388"), 'בחירת אפשרותM'), stryMutAct_9fa48("3389") ? "" : (stryCov_9fa48("3389"), 'בחירת אפשרותN'), stryMutAct_9fa48("3390") ? "" : (stryCov_9fa48("3390"), 'בחירת אפשרותO'), stryMutAct_9fa48("3391") ? "" : (stryCov_9fa48("3391"), 'בחירת אפשרותP'), stryMutAct_9fa48("3392") ? "" : (stryCov_9fa48("3392"), 'בחירת אפשרותQ'), stryMutAct_9fa48("3393") ? "" : (stryCov_9fa48("3393"), 'בחירת אפשרותR'), stryMutAct_9fa48("3394") ? "" : (stryCov_9fa48("3394"), 'בחירת אפשרותS'), stryMutAct_9fa48("3395") ? "" : (stryCov_9fa48("3395"), 'בחירת אפשרותT'), stryMutAct_9fa48("3396") ? "" : (stryCov_9fa48("3396"), 'בחירת אפשרותU'), stryMutAct_9fa48("3397") ? "" : (stryCov_9fa48("3397"), 'בחירת אפשרותV'), stryMutAct_9fa48("3398") ? "" : (stryCov_9fa48("3398"), 'בחירת אפשרותW'), stryMutAct_9fa48("3399") ? "" : (stryCov_9fa48("3399"), 'בחירת אפשרותX'), stryMutAct_9fa48("3400") ? "" : (stryCov_9fa48("3400"), 'בחירת אפשרותY'), stryMutAct_9fa48("3401") ? "" : (stryCov_9fa48("3401"), 'בחירת אפשרותZ'), stryMutAct_9fa48("3402") ? "" : (stryCov_9fa48("3402"), 'בחירת אפשרות0'), stryMutAct_9fa48("3403") ? "" : (stryCov_9fa48("3403"), 'בחירת אפשרות1'), stryMutAct_9fa48("3404") ? "" : (stryCov_9fa48("3404"), 'בחירת אפשרות2'), stryMutAct_9fa48("3405") ? "" : (stryCov_9fa48("3405"), 'בחירת אפשרות3'), stryMutAct_9fa48("3406") ? "" : (stryCov_9fa48("3406"), 'בחירת אפשרות4'), stryMutAct_9fa48("3407") ? "" : (stryCov_9fa48("3407"), 'בחירת אפשרות5'), stryMutAct_9fa48("3408") ? "" : (stryCov_9fa48("3408"), 'בחירת אפשרות6'), stryMutAct_9fa48("3409") ? "" : (stryCov_9fa48("3409"), 'בחירת אפשרות7'), stryMutAct_9fa48("3410") ? "" : (stryCov_9fa48("3410"), 'בחירת אפשרות8'), stryMutAct_9fa48("3411") ? "" : (stryCov_9fa48("3411"), 'בחירת אפשרות9'), stryMutAct_9fa48("3412") ? "" : (stryCov_9fa48("3412"), 'בחירת אפשרותא'), stryMutAct_9fa48("3413") ? "" : (stryCov_9fa48("3413"), 'בחירת אפשרותב'), stryMutAct_9fa48("3414") ? "" : (stryCov_9fa48("3414"), 'בחירת אפשרותג'), stryMutAct_9fa48("3415") ? "" : (stryCov_9fa48("3415"), 'בחירת אפשרותד'), stryMutAct_9fa48("3416") ? "" : (stryCov_9fa48("3416"), 'בחירת אפשרותה'), stryMutAct_9fa48("3417") ? "" : (stryCov_9fa48("3417"), 'בחירת אפשרותו'), stryMutAct_9fa48("3418") ? "" : (stryCov_9fa48("3418"), 'בחירת אפשרותז'), stryMutAct_9fa48("3419") ? "" : (stryCov_9fa48("3419"), 'בחירת אפשרותח'), stryMutAct_9fa48("3420") ? "" : (stryCov_9fa48("3420"), 'בחירת אפשרותט'), stryMutAct_9fa48("3421") ? "" : (stryCov_9fa48("3421"), 'בחירת אפשרותי'), stryMutAct_9fa48("3422") ? "" : (stryCov_9fa48("3422"), 'בחירת אפשרותכ'), stryMutAct_9fa48("3423") ? "" : (stryCov_9fa48("3423"), 'בחירת אפשרותל'), stryMutAct_9fa48("3424") ? "" : (stryCov_9fa48("3424"), 'בחירת אפשרותמ'), stryMutAct_9fa48("3425") ? "" : (stryCov_9fa48("3425"), 'בחירת אפשרותנ'), stryMutAct_9fa48("3426") ? "" : (stryCov_9fa48("3426"), 'בחירת אפשרותס'), stryMutAct_9fa48("3427") ? "" : (stryCov_9fa48("3427"), 'בחירת אפשרותע'), stryMutAct_9fa48("3428") ? "" : (stryCov_9fa48("3428"), 'בחירת אפשרותפ'), stryMutAct_9fa48("3429") ? "" : (stryCov_9fa48("3429"), 'בחירת אפשרותצ'), stryMutAct_9fa48("3430") ? "" : (stryCov_9fa48("3430"), 'בחירת אפשרותק'), stryMutAct_9fa48("3431") ? "" : (stryCov_9fa48("3431"), 'בחירת אפשרותר'), stryMutAct_9fa48("3432") ? "" : (stryCov_9fa48("3432"), 'בחירת אפשרותש'), stryMutAct_9fa48("3433") ? "" : (stryCov_9fa48("3433"), 'בחירת אפשרותת')]);
      return stryMutAct_9fa48("3434") ? placeholders.every(placeholder => value.toLowerCase().includes(placeholder.toLowerCase())) : (stryCov_9fa48("3434"), placeholders.some(stryMutAct_9fa48("3435") ? () => undefined : (stryCov_9fa48("3435"), placeholder => stryMutAct_9fa48("3436") ? value.toUpperCase().includes(placeholder.toLowerCase()) : (stryCov_9fa48("3436"), value.toLowerCase().includes(stryMutAct_9fa48("3437") ? placeholder.toUpperCase() : (stryCov_9fa48("3437"), placeholder.toLowerCase()))))));
    }
  }

  /**
   * Check if there are actual price variations (different prices for different options)
   */
  private checkForPriceVariations(dom: JSDOM): boolean {
    if (stryMutAct_9fa48("3438")) {
      {}
    } else {
      stryCov_9fa48("3438");
      // Look for price variations in the DOM
      const priceElements = dom.window.document.querySelectorAll(stryMutAct_9fa48("3439") ? "" : (stryCov_9fa48("3439"), '[data-price], .price, .product-price, .variation-price'));
      const prices = new Set<string>();
      priceElements.forEach((el: Element) => {
        if (stryMutAct_9fa48("3440")) {
          {}
        } else {
          stryCov_9fa48("3440");
          const price = stryMutAct_9fa48("3442") ? el.textContent.trim() : stryMutAct_9fa48("3441") ? el.textContent : (stryCov_9fa48("3441", "3442"), el.textContent?.trim());
          if (stryMutAct_9fa48("3445") ? price || price !== '' : stryMutAct_9fa48("3444") ? false : stryMutAct_9fa48("3443") ? true : (stryCov_9fa48("3443", "3444", "3445"), price && (stryMutAct_9fa48("3447") ? price === '' : stryMutAct_9fa48("3446") ? true : (stryCov_9fa48("3446", "3447"), price !== (stryMutAct_9fa48("3448") ? "Stryker was here!" : (stryCov_9fa48("3448"), '')))))) {
            if (stryMutAct_9fa48("3449")) {
              {}
            } else {
              stryCov_9fa48("3449");
              prices.add(price);
            }
          }
        }
      });

      // If we have more than one unique price, there are price variations
      const hasVariations = stryMutAct_9fa48("3453") ? prices.size <= 1 : stryMutAct_9fa48("3452") ? prices.size >= 1 : stryMutAct_9fa48("3451") ? false : stryMutAct_9fa48("3450") ? true : (stryCov_9fa48("3450", "3451", "3452", "3453"), prices.size > 1);
      if (stryMutAct_9fa48("3456") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("3455") ? false : stryMutAct_9fa48("3454") ? true : (stryCov_9fa48("3454", "3455", "3456"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("3457") ? "" : (stryCov_9fa48("3457"), '1')))) console.log(stryMutAct_9fa48("3458") ? `` : (stryCov_9fa48("3458"), `Price variation check - found ${prices.size} unique prices:`), Array.from(prices));
      return hasVariations;
    }
  }

  /**
   * Check if there are actual SKU variations (different SKUs for different options)
   */
  private checkForSkuVariations(dom: JSDOM): boolean {
    if (stryMutAct_9fa48("3459")) {
      {}
    } else {
      stryCov_9fa48("3459");
      // Look for SKU variations in the DOM
      const skuElements = dom.window.document.querySelectorAll(stryMutAct_9fa48("3460") ? "" : (stryCov_9fa48("3460"), '[data-sku], .sku, .product-sku, .variation-sku'));
      const skus = new Set<string>();
      skuElements.forEach((el: Element) => {
        if (stryMutAct_9fa48("3461")) {
          {}
        } else {
          stryCov_9fa48("3461");
          const sku = stryMutAct_9fa48("3463") ? el.textContent.trim() : stryMutAct_9fa48("3462") ? el.textContent : (stryCov_9fa48("3462", "3463"), el.textContent?.trim());
          if (stryMutAct_9fa48("3466") ? sku || sku !== '' : stryMutAct_9fa48("3465") ? false : stryMutAct_9fa48("3464") ? true : (stryCov_9fa48("3464", "3465", "3466"), sku && (stryMutAct_9fa48("3468") ? sku === '' : stryMutAct_9fa48("3467") ? true : (stryCov_9fa48("3467", "3468"), sku !== (stryMutAct_9fa48("3469") ? "Stryker was here!" : (stryCov_9fa48("3469"), '')))))) {
            if (stryMutAct_9fa48("3470")) {
              {}
            } else {
              stryCov_9fa48("3470");
              skus.add(sku);
            }
          }
        }
      });

      // If we have more than one unique SKU, there are SKU variations
      const hasVariations = stryMutAct_9fa48("3474") ? skus.size <= 1 : stryMutAct_9fa48("3473") ? skus.size >= 1 : stryMutAct_9fa48("3472") ? false : stryMutAct_9fa48("3471") ? true : (stryCov_9fa48("3471", "3472", "3473", "3474"), skus.size > 1);
      if (stryMutAct_9fa48("3477") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("3476") ? false : stryMutAct_9fa48("3475") ? true : (stryCov_9fa48("3475", "3476", "3477"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("3478") ? "" : (stryCov_9fa48("3478"), '1')))) console.log(stryMutAct_9fa48("3479") ? `` : (stryCov_9fa48("3479"), `SKU variation check - found ${skus.size} unique SKUs:`), Array.from(skus));
      return hasVariations;
    }
  }

  /**
   * Wait for selectors to be present in the DOM
   */
  protected async waitForSelectors(dom: JSDOM, selectors: string[]): Promise<void> {
    if (stryMutAct_9fa48("3480")) {
      {}
    } else {
      stryCov_9fa48("3480");
      // Simple implementation - in a real scenario, you might want to use a proper wait mechanism
      let attempts = 0;
      const maxAttempts = 10;
      while (stryMutAct_9fa48("3483") ? attempts >= maxAttempts : stryMutAct_9fa48("3482") ? attempts <= maxAttempts : stryMutAct_9fa48("3481") ? false : (stryCov_9fa48("3481", "3482", "3483"), attempts < maxAttempts)) {
        if (stryMutAct_9fa48("3484")) {
          {}
        } else {
          stryCov_9fa48("3484");
          const allPresent = stryMutAct_9fa48("3485") ? selectors.some(selector => dom.window.document.querySelector(selector)) : (stryCov_9fa48("3485"), selectors.every(stryMutAct_9fa48("3486") ? () => undefined : (stryCov_9fa48("3486"), selector => dom.window.document.querySelector(selector))));
          if (stryMutAct_9fa48("3488") ? false : stryMutAct_9fa48("3487") ? true : (stryCov_9fa48("3487", "3488"), allPresent)) {
            if (stryMutAct_9fa48("3489")) {
              {}
            } else {
              stryCov_9fa48("3489");
              break;
            }
          }
          await new Promise(stryMutAct_9fa48("3490") ? () => undefined : (stryCov_9fa48("3490"), resolve => setTimeout(resolve, 100)));
          stryMutAct_9fa48("3491") ? attempts-- : (stryCov_9fa48("3491"), attempts++);
        }
      }
    }
  }

  /**
   * Apply transformations to text
   */
  protected override applyTransformations(text: string, transformations: string[]): string {
    if (stryMutAct_9fa48("3492")) {
      {}
    } else {
      stryCov_9fa48("3492");
      let result = text;
      for (const transform of transformations) {
        if (stryMutAct_9fa48("3493")) {
          {}
        } else {
          stryCov_9fa48("3493");
          try {
            if (stryMutAct_9fa48("3494")) {
              {}
            } else {
              stryCov_9fa48("3494");
              if (stryMutAct_9fa48("3496") ? false : stryMutAct_9fa48("3495") ? true : (stryCov_9fa48("3495", "3496"), transform.includes(stryMutAct_9fa48("3497") ? "" : (stryCov_9fa48("3497"), '->')))) {
                if (stryMutAct_9fa48("3498")) {
                  {}
                } else {
                  stryCov_9fa48("3498");
                  const [pattern, replacement] = transform.split(stryMutAct_9fa48("3499") ? "" : (stryCov_9fa48("3499"), '->')).map(stryMutAct_9fa48("3500") ? () => undefined : (stryCov_9fa48("3500"), s => stryMutAct_9fa48("3501") ? s : (stryCov_9fa48("3501"), s.trim())));
                  if (stryMutAct_9fa48("3504") ? pattern || replacement : stryMutAct_9fa48("3503") ? false : stryMutAct_9fa48("3502") ? true : (stryCov_9fa48("3502", "3503", "3504"), pattern && replacement)) {
                    if (stryMutAct_9fa48("3505")) {
                      {}
                    } else {
                      stryCov_9fa48("3505");
                      const regex = new RegExp(pattern, stryMutAct_9fa48("3506") ? "" : (stryCov_9fa48("3506"), 'g'));
                      result = result.replace(regex, replacement);
                    }
                  }
                }
              } else if (stryMutAct_9fa48("3509") ? transform.endsWith('trim:') : stryMutAct_9fa48("3508") ? false : stryMutAct_9fa48("3507") ? true : (stryCov_9fa48("3507", "3508", "3509"), transform.startsWith(stryMutAct_9fa48("3510") ? "" : (stryCov_9fa48("3510"), 'trim:')))) {
                if (stryMutAct_9fa48("3511")) {
                  {}
                } else {
                  stryCov_9fa48("3511");
                  const chars = stryMutAct_9fa48("3512") ? transform : (stryCov_9fa48("3512"), transform.substring(5));
                  result = stryMutAct_9fa48("3513") ? result : (stryCov_9fa48("3513"), result.trim());
                  if (stryMutAct_9fa48("3515") ? false : stryMutAct_9fa48("3514") ? true : (stryCov_9fa48("3514", "3515"), chars)) {
                    if (stryMutAct_9fa48("3516")) {
                      {}
                    } else {
                      stryCov_9fa48("3516");
                      result = result.replace(new RegExp(stryMutAct_9fa48("3517") ? `` : (stryCov_9fa48("3517"), `^[${chars}]+|[${chars}]+$`), stryMutAct_9fa48("3518") ? "" : (stryCov_9fa48("3518"), 'g')), stryMutAct_9fa48("3519") ? "Stryker was here!" : (stryCov_9fa48("3519"), ''));
                    }
                  }
                }
              } else if (stryMutAct_9fa48("3522") ? transform.endsWith('replace:') : stryMutAct_9fa48("3521") ? false : stryMutAct_9fa48("3520") ? true : (stryCov_9fa48("3520", "3521", "3522"), transform.startsWith(stryMutAct_9fa48("3523") ? "" : (stryCov_9fa48("3523"), 'replace:')))) {
                if (stryMutAct_9fa48("3524")) {
                  {}
                } else {
                  stryCov_9fa48("3524");
                  const [search, replace] = stryMutAct_9fa48("3525") ? transform.split('|') : (stryCov_9fa48("3525"), transform.substring(8).split(stryMutAct_9fa48("3526") ? "" : (stryCov_9fa48("3526"), '|')));
                  if (stryMutAct_9fa48("3529") ? search || replace : stryMutAct_9fa48("3528") ? false : stryMutAct_9fa48("3527") ? true : (stryCov_9fa48("3527", "3528", "3529"), search && replace)) {
                    if (stryMutAct_9fa48("3530")) {
                      {}
                    } else {
                      stryCov_9fa48("3530");
                      result = result.replace(new RegExp(search, stryMutAct_9fa48("3531") ? "" : (stryCov_9fa48("3531"), 'g')), replace);
                    }
                  }
                }
              }
            }
          } catch (error) {
            if (stryMutAct_9fa48("3532")) {
              {}
            } else {
              stryCov_9fa48("3532");
              console.warn(stryMutAct_9fa48("3533") ? `` : (stryCov_9fa48("3533"), `Failed to apply transformation: ${transform}`), error);
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
    if (stryMutAct_9fa48("3534")) {
      {}
    } else {
      stryCov_9fa48("3534");
      const result: Record<string, string[]> = {};
      for (const [attrName, attrValues] of Object.entries(attributes)) {
        if (stryMutAct_9fa48("3535")) {
          {}
        } else {
          stryCov_9fa48("3535");
          const transforms = transformations[attrName];
          if (stryMutAct_9fa48("3537") ? false : stryMutAct_9fa48("3536") ? true : (stryCov_9fa48("3536", "3537"), transforms)) {
            if (stryMutAct_9fa48("3538")) {
              {}
            } else {
              stryCov_9fa48("3538");
              result[attrName] = attrValues.map(stryMutAct_9fa48("3539") ? () => undefined : (stryCov_9fa48("3539"), value => this.applyTransformations(value, transforms)));
            }
          } else {
            if (stryMutAct_9fa48("3540")) {
              {}
            } else {
              stryCov_9fa48("3540");
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
    if (stryMutAct_9fa48("3541")) {
      {}
    } else {
      stryCov_9fa48("3541");
      // This is a basic implementation - you might want to make this more sophisticated
      for (const data of embeddedData) {
        if (stryMutAct_9fa48("3542")) {
          {}
        } else {
          stryCov_9fa48("3542");
          if (stryMutAct_9fa48("3545") ? data.name && !product.title || typeof data.name === 'string' : stryMutAct_9fa48("3544") ? false : stryMutAct_9fa48("3543") ? true : (stryCov_9fa48("3543", "3544", "3545"), (stryMutAct_9fa48("3547") ? data.name || !product.title : stryMutAct_9fa48("3546") ? true : (stryCov_9fa48("3546", "3547"), data.name && (stryMutAct_9fa48("3548") ? product.title : (stryCov_9fa48("3548"), !product.title)))) && (stryMutAct_9fa48("3550") ? typeof data.name !== 'string' : stryMutAct_9fa48("3549") ? true : (stryCov_9fa48("3549", "3550"), typeof data.name === (stryMutAct_9fa48("3551") ? "" : (stryCov_9fa48("3551"), 'string')))))) {
            if (stryMutAct_9fa48("3552")) {
              {}
            } else {
              stryCov_9fa48("3552");
              product.title = data.name;
            }
          }
          if (stryMutAct_9fa48("3555") ? data.description && !product.description || typeof data.description === 'string' : stryMutAct_9fa48("3554") ? false : stryMutAct_9fa48("3553") ? true : (stryCov_9fa48("3553", "3554", "3555"), (stryMutAct_9fa48("3557") ? data.description || !product.description : stryMutAct_9fa48("3556") ? true : (stryCov_9fa48("3556", "3557"), data.description && (stryMutAct_9fa48("3558") ? product.description : (stryCov_9fa48("3558"), !product.description)))) && (stryMutAct_9fa48("3560") ? typeof data.description !== 'string' : stryMutAct_9fa48("3559") ? true : (stryCov_9fa48("3559", "3560"), typeof data.description === (stryMutAct_9fa48("3561") ? "" : (stryCov_9fa48("3561"), 'string')))))) {
            if (stryMutAct_9fa48("3562")) {
              {}
            } else {
              stryCov_9fa48("3562");
              product.description = data.description;
            }
          }
          if (stryMutAct_9fa48("3565") ? data.sku && !product.sku || typeof data.sku === 'string' : stryMutAct_9fa48("3564") ? false : stryMutAct_9fa48("3563") ? true : (stryCov_9fa48("3563", "3564", "3565"), (stryMutAct_9fa48("3567") ? data.sku || !product.sku : stryMutAct_9fa48("3566") ? true : (stryCov_9fa48("3566", "3567"), data.sku && (stryMutAct_9fa48("3568") ? product.sku : (stryCov_9fa48("3568"), !product.sku)))) && (stryMutAct_9fa48("3570") ? typeof data.sku !== 'string' : stryMutAct_9fa48("3569") ? true : (stryCov_9fa48("3569", "3570"), typeof data.sku === (stryMutAct_9fa48("3571") ? "" : (stryCov_9fa48("3571"), 'string')))))) {
            if (stryMutAct_9fa48("3572")) {
              {}
            } else {
              stryCov_9fa48("3572");
              product.sku = data.sku;
            }
          }
          if (stryMutAct_9fa48("3575") ? data.price && product.variations || product.variations.length > 0 : stryMutAct_9fa48("3574") ? false : stryMutAct_9fa48("3573") ? true : (stryCov_9fa48("3573", "3574", "3575"), (stryMutAct_9fa48("3577") ? data.price || product.variations : stryMutAct_9fa48("3576") ? true : (stryCov_9fa48("3576", "3577"), data.price && product.variations)) && (stryMutAct_9fa48("3580") ? product.variations.length <= 0 : stryMutAct_9fa48("3579") ? product.variations.length >= 0 : stryMutAct_9fa48("3578") ? true : (stryCov_9fa48("3578", "3579", "3580"), product.variations.length > 0)))) {
            if (stryMutAct_9fa48("3581")) {
              {}
            } else {
              stryCov_9fa48("3581");
              const firstVariation = product.variations[0];
              if (stryMutAct_9fa48("3583") ? false : stryMutAct_9fa48("3582") ? true : (stryCov_9fa48("3582", "3583"), firstVariation)) {
                if (stryMutAct_9fa48("3584")) {
                  {}
                } else {
                  stryCov_9fa48("3584");
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
    if (stryMutAct_9fa48("3585")) {
      {}
    } else {
      stryCov_9fa48("3585");
      const selectorArray = Array.isArray(priceSelectors) ? priceSelectors : stryMutAct_9fa48("3586") ? [] : (stryCov_9fa48("3586"), [priceSelectors]);
      for (const selector of selectorArray) {
        if (stryMutAct_9fa48("3587")) {
          {}
        } else {
          stryCov_9fa48("3587");
          // Look for sale price indicators
          const salePriceSelectors = stryMutAct_9fa48("3588") ? [] : (stryCov_9fa48("3588"), [stryMutAct_9fa48("3589") ? `` : (stryCov_9fa48("3589"), `${selector}.sale-price`), stryMutAct_9fa48("3590") ? `` : (stryCov_9fa48("3590"), `${selector}.discount-price`), stryMutAct_9fa48("3591") ? `` : (stryCov_9fa48("3591"), `${selector}[class*="sale"]`), stryMutAct_9fa48("3592") ? `` : (stryCov_9fa48("3592"), `${selector}[class*="discount"]`), stryMutAct_9fa48("3593") ? "" : (stryCov_9fa48("3593"), '.sale-price'), stryMutAct_9fa48("3594") ? "" : (stryCov_9fa48("3594"), '.discount-price'), stryMutAct_9fa48("3595") ? "" : (stryCov_9fa48("3595"), '.price .sale'), stryMutAct_9fa48("3596") ? "" : (stryCov_9fa48("3596"), '.price .discount'), stryMutAct_9fa48("3597") ? "" : (stryCov_9fa48("3597"), '[class*="sale-price"]'), stryMutAct_9fa48("3598") ? "" : (stryCov_9fa48("3598"), '[class*="discount-price"]')]);
          for (const saleSelector of salePriceSelectors) {
            if (stryMutAct_9fa48("3599")) {
              {}
            } else {
              stryCov_9fa48("3599");
              const saleElement = dom.window.document.querySelector(saleSelector);
              if (stryMutAct_9fa48("3601") ? false : stryMutAct_9fa48("3600") ? true : (stryCov_9fa48("3600", "3601"), saleElement)) {
                if (stryMutAct_9fa48("3602")) {
                  {}
                } else {
                  stryCov_9fa48("3602");
                  const saleText = stryMutAct_9fa48("3604") ? saleElement.textContent.trim() : stryMutAct_9fa48("3603") ? saleElement.textContent : (stryCov_9fa48("3603", "3604"), saleElement.textContent?.trim());
                  if (stryMutAct_9fa48("3607") ? saleText || this.isValidPrice(saleText) : stryMutAct_9fa48("3606") ? false : stryMutAct_9fa48("3605") ? true : (stryCov_9fa48("3605", "3606", "3607"), saleText && this.isValidPrice(saleText))) {
                    if (stryMutAct_9fa48("3608")) {
                      {}
                    } else {
                      stryCov_9fa48("3608");
                      if (stryMutAct_9fa48("3611") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("3610") ? false : stryMutAct_9fa48("3609") ? true : (stryCov_9fa48("3609", "3610", "3611"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("3612") ? "" : (stryCov_9fa48("3612"), '1')))) console.log(stryMutAct_9fa48("3613") ? `` : (stryCov_9fa48("3613"), `Found sale price: ${saleText}`));
                      return this.cleanPrice(saleText);
                    }
                  }
                }
              }
            }
          }

          // Also check if the main price selector has a sale indicator
          const mainPriceElement = dom.window.document.querySelector(selector);
          if (stryMutAct_9fa48("3615") ? false : stryMutAct_9fa48("3614") ? true : (stryCov_9fa48("3614", "3615"), mainPriceElement)) {
            if (stryMutAct_9fa48("3616")) {
              {}
            } else {
              stryCov_9fa48("3616");
              const parentElement = mainPriceElement.parentElement;
              if (stryMutAct_9fa48("3619") ? parentElement || parentElement.classList.contains('sale') || parentElement.classList.contains('discount') || parentElement.querySelector('.sale, .discount, .sale-price, .discount-price') : stryMutAct_9fa48("3618") ? false : stryMutAct_9fa48("3617") ? true : (stryCov_9fa48("3617", "3618", "3619"), parentElement && (stryMutAct_9fa48("3621") ? (parentElement.classList.contains('sale') || parentElement.classList.contains('discount')) && parentElement.querySelector('.sale, .discount, .sale-price, .discount-price') : stryMutAct_9fa48("3620") ? true : (stryCov_9fa48("3620", "3621"), (stryMutAct_9fa48("3623") ? parentElement.classList.contains('sale') && parentElement.classList.contains('discount') : stryMutAct_9fa48("3622") ? false : (stryCov_9fa48("3622", "3623"), parentElement.classList.contains(stryMutAct_9fa48("3624") ? "" : (stryCov_9fa48("3624"), 'sale')) || parentElement.classList.contains(stryMutAct_9fa48("3625") ? "" : (stryCov_9fa48("3625"), 'discount')))) || parentElement.querySelector(stryMutAct_9fa48("3626") ? "" : (stryCov_9fa48("3626"), '.sale, .discount, .sale-price, .discount-price')))))) {
                if (stryMutAct_9fa48("3627")) {
                  {}
                } else {
                  stryCov_9fa48("3627");
                  const priceText = stryMutAct_9fa48("3629") ? mainPriceElement.textContent.trim() : stryMutAct_9fa48("3628") ? mainPriceElement.textContent : (stryCov_9fa48("3628", "3629"), mainPriceElement.textContent?.trim());
                  if (stryMutAct_9fa48("3632") ? priceText || this.isValidPrice(priceText) : stryMutAct_9fa48("3631") ? false : stryMutAct_9fa48("3630") ? true : (stryCov_9fa48("3630", "3631", "3632"), priceText && this.isValidPrice(priceText))) {
                    if (stryMutAct_9fa48("3633")) {
                      {}
                    } else {
                      stryCov_9fa48("3633");
                      if (stryMutAct_9fa48("3636") ? process.env.SCRAPER_DEBUG !== '1' : stryMutAct_9fa48("3635") ? false : stryMutAct_9fa48("3634") ? true : (stryCov_9fa48("3634", "3635", "3636"), process.env.SCRAPER_DEBUG === (stryMutAct_9fa48("3637") ? "" : (stryCov_9fa48("3637"), '1')))) console.log(stryMutAct_9fa48("3638") ? `` : (stryCov_9fa48("3638"), `Found sale price from main selector: ${priceText}`));
                      return this.cleanPrice(priceText);
                    }
                  }
                }
              }
            }
          }
        }
      }
      return stryMutAct_9fa48("3639") ? "Stryker was here!" : (stryCov_9fa48("3639"), '');
    }
  }

  /**
   * Check if text is a valid price
   */
  private isValidPrice(text: string): boolean {
    if (stryMutAct_9fa48("3640")) {
      {}
    } else {
      stryCov_9fa48("3640");
      if (stryMutAct_9fa48("3643") ? false : stryMutAct_9fa48("3642") ? true : stryMutAct_9fa48("3641") ? text : (stryCov_9fa48("3641", "3642", "3643"), !text)) return stryMutAct_9fa48("3644") ? true : (stryCov_9fa48("3644"), false);
      const t = stryMutAct_9fa48("3645") ? text : (stryCov_9fa48("3645"), text.trim());

      // Must contain at least one digit
      if (stryMutAct_9fa48("3648") ? false : stryMutAct_9fa48("3647") ? true : stryMutAct_9fa48("3646") ? /\d/.test(t) : (stryCov_9fa48("3646", "3647", "3648"), !(stryMutAct_9fa48("3649") ? /\D/ : (stryCov_9fa48("3649"), /\d/)).test(t))) return stryMutAct_9fa48("3650") ? true : (stryCov_9fa48("3650"), false);

      // Must be reasonably short (price text shouldn't be very long)
      if (stryMutAct_9fa48("3654") ? t.length <= 50 : stryMutAct_9fa48("3653") ? t.length >= 50 : stryMutAct_9fa48("3652") ? false : stryMutAct_9fa48("3651") ? true : (stryCov_9fa48("3651", "3652", "3653", "3654"), t.length > 50)) return stryMutAct_9fa48("3655") ? true : (stryCov_9fa48("3655"), false);

      // Should contain currency symbols or be numeric
      const currencyPattern = /(₪|\$|€|£)/;
      const numericPattern = stryMutAct_9fa48("3666") ? /^\s*\d+[\d,.]*\S*$/ : stryMutAct_9fa48("3665") ? /^\s*\d+[\d,.]*\s$/ : stryMutAct_9fa48("3664") ? /^\s*\d+[\D,.]*\s*$/ : stryMutAct_9fa48("3663") ? /^\s*\d+[^\d,.]*\s*$/ : stryMutAct_9fa48("3662") ? /^\s*\d+[\d,.]\s*$/ : stryMutAct_9fa48("3661") ? /^\s*\D+[\d,.]*\s*$/ : stryMutAct_9fa48("3660") ? /^\s*\d[\d,.]*\s*$/ : stryMutAct_9fa48("3659") ? /^\S*\d+[\d,.]*\s*$/ : stryMutAct_9fa48("3658") ? /^\s\d+[\d,.]*\s*$/ : stryMutAct_9fa48("3657") ? /^\s*\d+[\d,.]*\s*/ : stryMutAct_9fa48("3656") ? /\s*\d+[\d,.]*\s*$/ : (stryCov_9fa48("3656", "3657", "3658", "3659", "3660", "3661", "3662", "3663", "3664", "3665", "3666"), /^\s*\d+[\d,.]*\s*$/);
      return stryMutAct_9fa48("3669") ? currencyPattern.test(t) && numericPattern.test(t) : stryMutAct_9fa48("3668") ? false : stryMutAct_9fa48("3667") ? true : (stryCov_9fa48("3667", "3668", "3669"), currencyPattern.test(t) || numericPattern.test(t));
    }
  }

  /**
   * Generate a simple ID from URL
   */
  private generateIdFromUrl(url: string): string {
    if (stryMutAct_9fa48("3670")) {
      {}
    } else {
      stryCov_9fa48("3670");
      const urlParts = url.split(stryMutAct_9fa48("3671") ? "" : (stryCov_9fa48("3671"), '/'));
      const lastPart = urlParts[stryMutAct_9fa48("3672") ? urlParts.length + 1 : (stryCov_9fa48("3672"), urlParts.length - 1)];
      return stryMutAct_9fa48("3675") ? lastPart?.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() && 'PRODUCT' : stryMutAct_9fa48("3674") ? false : stryMutAct_9fa48("3673") ? true : (stryCov_9fa48("3673", "3674", "3675"), (stryMutAct_9fa48("3677") ? lastPart.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : stryMutAct_9fa48("3676") ? lastPart?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : (stryCov_9fa48("3676", "3677"), lastPart?.replace(stryMutAct_9fa48("3678") ? /[a-zA-Z0-9]/g : (stryCov_9fa48("3678"), /[^a-zA-Z0-9]/g), stryMutAct_9fa48("3679") ? "Stryker was here!" : (stryCov_9fa48("3679"), '')).toUpperCase())) || (stryMutAct_9fa48("3680") ? "" : (stryCov_9fa48("3680"), 'PRODUCT')));
    }
  }

  /**
   * Validate product data according to recipe validation rules
   */
  validateProduct(product: RawProduct): ValidationError[] {
    if (stryMutAct_9fa48("3681")) {
      {}
    } else {
      stryCov_9fa48("3681");
      const errors: ValidationError[] = stryMutAct_9fa48("3682") ? ["Stryker was here"] : (stryCov_9fa48("3682"), []);
      const {
        validation
      } = this.config;
      if (stryMutAct_9fa48("3685") ? false : stryMutAct_9fa48("3684") ? true : stryMutAct_9fa48("3683") ? validation : (stryCov_9fa48("3683", "3684", "3685"), !validation)) {
        if (stryMutAct_9fa48("3686")) {
          {}
        } else {
          stryCov_9fa48("3686");
          return errors;
        }
      }

      // Check required fields
      if (stryMutAct_9fa48("3688") ? false : stryMutAct_9fa48("3687") ? true : (stryCov_9fa48("3687", "3688"), validation.requiredFields)) {
        if (stryMutAct_9fa48("3689")) {
          {}
        } else {
          stryCov_9fa48("3689");
          for (const field of validation.requiredFields) {
            if (stryMutAct_9fa48("3690")) {
              {}
            } else {
              stryCov_9fa48("3690");
              if (stryMutAct_9fa48("3693") ? !product[field as keyof RawProduct] && typeof product[field as keyof RawProduct] === 'string' && (product[field as keyof RawProduct] as string).trim() === '' : stryMutAct_9fa48("3692") ? false : stryMutAct_9fa48("3691") ? true : (stryCov_9fa48("3691", "3692", "3693"), (stryMutAct_9fa48("3694") ? product[field as keyof RawProduct] : (stryCov_9fa48("3694"), !product[field as keyof RawProduct])) || (stryMutAct_9fa48("3696") ? typeof product[field as keyof RawProduct] === 'string' || (product[field as keyof RawProduct] as string).trim() === '' : stryMutAct_9fa48("3695") ? false : (stryCov_9fa48("3695", "3696"), (stryMutAct_9fa48("3698") ? typeof product[field as keyof RawProduct] !== 'string' : stryMutAct_9fa48("3697") ? true : (stryCov_9fa48("3697", "3698"), typeof product[field as keyof RawProduct] === (stryMutAct_9fa48("3699") ? "" : (stryCov_9fa48("3699"), 'string')))) && (stryMutAct_9fa48("3701") ? (product[field as keyof RawProduct] as string).trim() !== '' : stryMutAct_9fa48("3700") ? true : (stryCov_9fa48("3700", "3701"), (stryMutAct_9fa48("3702") ? product[field as keyof RawProduct] as string : (stryCov_9fa48("3702"), (product[field as keyof RawProduct] as string).trim())) === (stryMutAct_9fa48("3703") ? "Stryker was here!" : (stryCov_9fa48("3703"), '')))))))) {
                if (stryMutAct_9fa48("3704")) {
                  {}
                } else {
                  stryCov_9fa48("3704");
                  errors.push(new ValidationErrorImpl(field, product[field as keyof RawProduct], stryMutAct_9fa48("3705") ? "" : (stryCov_9fa48("3705"), 'required'), stryMutAct_9fa48("3706") ? `` : (stryCov_9fa48("3706"), `Required field '${field}' is missing or empty`)));
                }
              }
            }
          }
        }
      }

      // Check description length
      if (stryMutAct_9fa48("3709") ? validation.minDescriptionLength || product.description : stryMutAct_9fa48("3708") ? false : stryMutAct_9fa48("3707") ? true : (stryCov_9fa48("3707", "3708", "3709"), validation.minDescriptionLength && product.description)) {
        if (stryMutAct_9fa48("3710")) {
          {}
        } else {
          stryCov_9fa48("3710");
          if (stryMutAct_9fa48("3714") ? product.description.length >= validation.minDescriptionLength : stryMutAct_9fa48("3713") ? product.description.length <= validation.minDescriptionLength : stryMutAct_9fa48("3712") ? false : stryMutAct_9fa48("3711") ? true : (stryCov_9fa48("3711", "3712", "3713", "3714"), product.description.length < validation.minDescriptionLength)) {
            if (stryMutAct_9fa48("3715")) {
              {}
            } else {
              stryCov_9fa48("3715");
              errors.push(new ValidationErrorImpl(stryMutAct_9fa48("3716") ? "" : (stryCov_9fa48("3716"), 'description'), product.description.length, validation.minDescriptionLength, stryMutAct_9fa48("3717") ? `` : (stryCov_9fa48("3717"), `Description must be at least ${validation.minDescriptionLength} characters long`)));
            }
          }
        }
      }

      // Check title length
      if (stryMutAct_9fa48("3720") ? validation.maxTitleLength || product.title : stryMutAct_9fa48("3719") ? false : stryMutAct_9fa48("3718") ? true : (stryCov_9fa48("3718", "3719", "3720"), validation.maxTitleLength && product.title)) {
        if (stryMutAct_9fa48("3721")) {
          {}
        } else {
          stryCov_9fa48("3721");
          if (stryMutAct_9fa48("3725") ? product.title.length <= validation.maxTitleLength : stryMutAct_9fa48("3724") ? product.title.length >= validation.maxTitleLength : stryMutAct_9fa48("3723") ? false : stryMutAct_9fa48("3722") ? true : (stryCov_9fa48("3722", "3723", "3724", "3725"), product.title.length > validation.maxTitleLength)) {
            if (stryMutAct_9fa48("3726")) {
              {}
            } else {
              stryCov_9fa48("3726");
              errors.push(new ValidationErrorImpl(stryMutAct_9fa48("3727") ? "" : (stryCov_9fa48("3727"), 'title'), product.title.length, validation.maxTitleLength, stryMutAct_9fa48("3728") ? `` : (stryCov_9fa48("3728"), `Title must be no more than ${validation.maxTitleLength} characters long`)));
            }
          }
        }
      }
      return errors;
    }
  }
}