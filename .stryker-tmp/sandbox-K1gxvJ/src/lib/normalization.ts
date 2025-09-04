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
import { NormalizedProduct, RawVariation, ProductVariation, NormalizableProductData } from '../types';
import { debug } from './logger';
export class NormalizationToolkit {
  /**
   * Normalize raw product data into standardized format with proper generic constraints
   */
  static normalizeProduct<T extends NormalizableProductData>(raw: T, url: string): NormalizedProduct {
    if (stryMutAct_9fa48("2145")) {
      {}
    } else {
      stryCov_9fa48("2145");
      debug(stryMutAct_9fa48("2146") ? "" : (stryCov_9fa48("2146"), '🔍 DEBUG: normalizeProduct called with:'), stryMutAct_9fa48("2147") ? {} : (stryCov_9fa48("2147"), {
        url,
        rawTitle: raw.title,
        rawSku: raw.sku,
        rawDescription: raw.description,
        rawAttributes: raw.attributes,
        rawVariations: raw.variations
      }));
      const result: NormalizedProduct = stryMutAct_9fa48("2148") ? {} : (stryCov_9fa48("2148"), {
        id: stryMutAct_9fa48("2151") ? raw.id && this.generateSku(url) : stryMutAct_9fa48("2150") ? false : stryMutAct_9fa48("2149") ? true : (stryCov_9fa48("2149", "2150", "2151"), raw.id || this.generateSku(url)),
        title: this.cleanText(stryMutAct_9fa48("2154") ? raw.title && '' : stryMutAct_9fa48("2153") ? false : stryMutAct_9fa48("2152") ? true : (stryCov_9fa48("2152", "2153", "2154"), raw.title || (stryMutAct_9fa48("2155") ? "Stryker was here!" : (stryCov_9fa48("2155"), '')))),
        slug: this.generateSlug(stryMutAct_9fa48("2158") ? raw.title && url : stryMutAct_9fa48("2157") ? false : stryMutAct_9fa48("2156") ? true : (stryCov_9fa48("2156", "2157", "2158"), raw.title || url)),
        description: this.cleanText(stryMutAct_9fa48("2161") ? raw.description && '' : stryMutAct_9fa48("2160") ? false : stryMutAct_9fa48("2159") ? true : (stryCov_9fa48("2159", "2160", "2161"), raw.description || (stryMutAct_9fa48("2162") ? "Stryker was here!" : (stryCov_9fa48("2162"), '')))),
        shortDescription: this.cleanText(stryMutAct_9fa48("2165") ? raw.shortDescription && '' : stryMutAct_9fa48("2164") ? false : stryMutAct_9fa48("2163") ? true : (stryCov_9fa48("2163", "2164", "2165"), raw.shortDescription || (stryMutAct_9fa48("2166") ? "Stryker was here!" : (stryCov_9fa48("2166"), '')))),
        sku: this.cleanSku(stryMutAct_9fa48("2169") ? raw.sku && this.generateSku(url) : stryMutAct_9fa48("2168") ? false : stryMutAct_9fa48("2167") ? true : (stryCov_9fa48("2167", "2168", "2169"), raw.sku || this.generateSku(url))),
        stockStatus: this.normalizeStockStatus(raw.stockStatus),
        images: this.normalizeImages(stryMutAct_9fa48("2170") ? raw.images || [] : (stryCov_9fa48("2170"), (stryMutAct_9fa48("2173") ? raw.images && [] : stryMutAct_9fa48("2172") ? false : stryMutAct_9fa48("2171") ? true : (stryCov_9fa48("2171", "2172", "2173"), raw.images || (stryMutAct_9fa48("2174") ? ["Stryker was here"] : (stryCov_9fa48("2174"), [])))).filter(stryMutAct_9fa48("2175") ? () => undefined : (stryCov_9fa48("2175"), (img): img is string => stryMutAct_9fa48("2178") ? img === undefined : stryMutAct_9fa48("2177") ? false : stryMutAct_9fa48("2176") ? true : (stryCov_9fa48("2176", "2177", "2178"), img !== undefined))))),
        category: this.cleanText(stryMutAct_9fa48("2181") ? raw.category && 'Uncategorized' : stryMutAct_9fa48("2180") ? false : stryMutAct_9fa48("2179") ? true : (stryCov_9fa48("2179", "2180", "2181"), raw.category || (stryMutAct_9fa48("2182") ? "" : (stryCov_9fa48("2182"), 'Uncategorized')))),
        productType: this.detectProductType(raw),
        attributes: this.normalizeAttributes(stryMutAct_9fa48("2185") ? raw.attributes && {} as Record<string, (string | undefined)[]> : stryMutAct_9fa48("2184") ? false : stryMutAct_9fa48("2183") ? true : (stryCov_9fa48("2183", "2184", "2185"), raw.attributes || {} as Record<string, (string | undefined)[]>)),
        variations: this.normalizeVariations(stryMutAct_9fa48("2188") ? raw.variations && [] : stryMutAct_9fa48("2187") ? false : stryMutAct_9fa48("2186") ? true : (stryCov_9fa48("2186", "2187", "2188"), raw.variations || (stryMutAct_9fa48("2189") ? ["Stryker was here"] : (stryCov_9fa48("2189"), [])))),
        regularPrice: this.cleanText(stryMutAct_9fa48("2192") ? raw.price && '' : stryMutAct_9fa48("2191") ? false : stryMutAct_9fa48("2190") ? true : (stryCov_9fa48("2190", "2191", "2192"), raw.price || (stryMutAct_9fa48("2193") ? "Stryker was here!" : (stryCov_9fa48("2193"), '')))),
        salePrice: this.cleanText(stryMutAct_9fa48("2196") ? raw.salePrice && '' : stryMutAct_9fa48("2195") ? false : stryMutAct_9fa48("2194") ? true : (stryCov_9fa48("2194", "2195", "2196"), raw.salePrice || (stryMutAct_9fa48("2197") ? "Stryker was here!" : (stryCov_9fa48("2197"), '')))),
        normalizedAt: new Date(),
        sourceUrl: url,
        confidence: 0.8 // Default confidence score
      });

      // Ensure parent SKU is unique and not equal to any variation SKU
      if (stryMutAct_9fa48("2200") ? result.productType === 'variable' || result.variations.length > 0 : stryMutAct_9fa48("2199") ? false : stryMutAct_9fa48("2198") ? true : (stryCov_9fa48("2198", "2199", "2200"), (stryMutAct_9fa48("2202") ? result.productType !== 'variable' : stryMutAct_9fa48("2201") ? true : (stryCov_9fa48("2201", "2202"), result.productType === (stryMutAct_9fa48("2203") ? "" : (stryCov_9fa48("2203"), 'variable')))) && (stryMutAct_9fa48("2206") ? result.variations.length <= 0 : stryMutAct_9fa48("2205") ? result.variations.length >= 0 : stryMutAct_9fa48("2204") ? true : (stryCov_9fa48("2204", "2205", "2206"), result.variations.length > 0)))) {
        if (stryMutAct_9fa48("2207")) {
          {}
        } else {
          stryCov_9fa48("2207");
          const variationSkus = new Set(result.variations.map(stryMutAct_9fa48("2208") ? () => undefined : (stryCov_9fa48("2208"), v => v.sku)));
          if (stryMutAct_9fa48("2210") ? false : stryMutAct_9fa48("2209") ? true : (stryCov_9fa48("2209", "2210"), variationSkus.has(result.sku))) {
            if (stryMutAct_9fa48("2211")) {
              {}
            } else {
              stryCov_9fa48("2211");
              const base = stryMutAct_9fa48("2214") ? result.sku && this.generateSku(url) : stryMutAct_9fa48("2213") ? false : stryMutAct_9fa48("2212") ? true : (stryCov_9fa48("2212", "2213", "2214"), result.sku || this.generateSku(url));
              // Append a suffix to make the parent SKU distinct
              result.sku = this.cleanSku(stryMutAct_9fa48("2215") ? `` : (stryCov_9fa48("2215"), `${base}-PARENT`));
            }
          }
        }
      }
      debug(stryMutAct_9fa48("2216") ? "" : (stryCov_9fa48("2216"), '🔍 DEBUG: normalizeProduct result:'), stryMutAct_9fa48("2217") ? {} : (stryCov_9fa48("2217"), {
        title: result.title,
        productType: result.productType,
        attributesCount: Object.keys(result.attributes).length,
        variationsCount: result.variations.length
      }));
      return result;
    }
  }

  /**
   * Clean and decode text content
   */
  static cleanText(text: string): string {
    if (stryMutAct_9fa48("2218")) {
      {}
    } else {
      stryCov_9fa48("2218");
      if (stryMutAct_9fa48("2221") ? false : stryMutAct_9fa48("2220") ? true : stryMutAct_9fa48("2219") ? text : (stryCov_9fa48("2219", "2220", "2221"), !text)) return stryMutAct_9fa48("2222") ? "Stryker was here!" : (stryCov_9fa48("2222"), '');
      return stryMutAct_9fa48("2224") ? text

      // Decode percent encoding
      .replace(/%20/g, ' ').replace(/%2B/g, '+').replace(/%2F/g, '/').replace(/%3F/g, '?').replace(/%3D/g, '=').replace(/%26/g, '&')
      // Decode HTML entities
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, '\'').replace(/&nbsp;/g, ' ')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove placeholder text
      .replace(/(בחר אפשרות|בחירת אפשרות|Select option|Choose option)/gi, '').trim() : stryMutAct_9fa48("2223") ? text.trim()
      // Decode percent encoding
      .replace(/%20/g, ' ').replace(/%2B/g, '+').replace(/%2F/g, '/').replace(/%3F/g, '?').replace(/%3D/g, '=').replace(/%26/g, '&')
      // Decode HTML entities
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, '\'').replace(/&nbsp;/g, ' ')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove placeholder text
      .replace(/(בחר אפשרות|בחירת אפשרות|Select option|Choose option)/gi, '') : (stryCov_9fa48("2223", "2224"), text.trim()
      // Decode percent encoding
      .replace(/%20/g, stryMutAct_9fa48("2225") ? "" : (stryCov_9fa48("2225"), ' ')).replace(/%2B/g, stryMutAct_9fa48("2226") ? "" : (stryCov_9fa48("2226"), '+')).replace(/%2F/g, stryMutAct_9fa48("2227") ? "" : (stryCov_9fa48("2227"), '/')).replace(/%3F/g, stryMutAct_9fa48("2228") ? "" : (stryCov_9fa48("2228"), '?')).replace(/%3D/g, stryMutAct_9fa48("2229") ? "" : (stryCov_9fa48("2229"), '=')).replace(/%26/g, stryMutAct_9fa48("2230") ? "" : (stryCov_9fa48("2230"), '&'))
      // Decode HTML entities
      .replace(/&amp;/g, stryMutAct_9fa48("2231") ? "" : (stryCov_9fa48("2231"), '&')).replace(/&lt;/g, stryMutAct_9fa48("2232") ? "" : (stryCov_9fa48("2232"), '<')).replace(/&gt;/g, stryMutAct_9fa48("2233") ? "" : (stryCov_9fa48("2233"), '>')).replace(/&quot;/g, stryMutAct_9fa48("2234") ? "" : (stryCov_9fa48("2234"), '"')).replace(/&#39;/g, stryMutAct_9fa48("2235") ? "" : (stryCov_9fa48("2235"), '\'')).replace(/&nbsp;/g, stryMutAct_9fa48("2236") ? "" : (stryCov_9fa48("2236"), ' '))
      // Remove extra whitespace
      .replace(stryMutAct_9fa48("2238") ? /\S+/g : stryMutAct_9fa48("2237") ? /\s/g : (stryCov_9fa48("2237", "2238"), /\s+/g), stryMutAct_9fa48("2239") ? "" : (stryCov_9fa48("2239"), ' '))
      // Remove placeholder text
      .replace(/(בחר אפשרות|בחירת אפשרות|Select option|Choose option)/gi, stryMutAct_9fa48("2240") ? "Stryker was here!" : (stryCov_9fa48("2240"), '')).trim());
    }
  }

  /**
   * Generate a clean SKU
   */
  static cleanSku(sku: string): string {
    if (stryMutAct_9fa48("2241")) {
      {}
    } else {
      stryCov_9fa48("2241");
      if (stryMutAct_9fa48("2244") ? false : stryMutAct_9fa48("2243") ? true : stryMutAct_9fa48("2242") ? sku : (stryCov_9fa48("2242", "2243", "2244"), !sku)) return stryMutAct_9fa48("2245") ? "Stryker was here!" : (stryCov_9fa48("2245"), '');
      return stryMutAct_9fa48("2247") ? sku.replace(/[^a-zA-Z0-9\-_]/g, '').toUpperCase() : stryMutAct_9fa48("2246") ? sku.trim().replace(/[^a-zA-Z0-9\-_]/g, '').toLowerCase() : (stryCov_9fa48("2246", "2247"), sku.trim().replace(stryMutAct_9fa48("2248") ? /[a-zA-Z0-9\-_]/g : (stryCov_9fa48("2248"), /[^a-zA-Z0-9\-_]/g), stryMutAct_9fa48("2249") ? "Stryker was here!" : (stryCov_9fa48("2249"), '')).toUpperCase());
    }
  }

  /**
   * Generate SKU from URL if none provided
   */
  static generateSku(url: string): string {
    if (stryMutAct_9fa48("2250")) {
      {}
    } else {
      stryCov_9fa48("2250");
      const urlParts = url.split(stryMutAct_9fa48("2251") ? "" : (stryCov_9fa48("2251"), '/'));
      const lastPart = urlParts[stryMutAct_9fa48("2252") ? urlParts.length + 1 : (stryCov_9fa48("2252"), urlParts.length - 1)];
      return stryMutAct_9fa48("2255") ? lastPart?.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() && 'PRODUCT' : stryMutAct_9fa48("2254") ? false : stryMutAct_9fa48("2253") ? true : (stryCov_9fa48("2253", "2254", "2255"), (stryMutAct_9fa48("2257") ? lastPart.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : stryMutAct_9fa48("2256") ? lastPart?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : (stryCov_9fa48("2256", "2257"), lastPart?.replace(stryMutAct_9fa48("2258") ? /[a-zA-Z0-9]/g : (stryCov_9fa48("2258"), /[^a-zA-Z0-9]/g), stryMutAct_9fa48("2259") ? "Stryker was here!" : (stryCov_9fa48("2259"), '')).toUpperCase())) || (stryMutAct_9fa48("2260") ? "" : (stryCov_9fa48("2260"), 'PRODUCT')));
    }
  }

  /**
   * Generate slug from title
   */
  static generateSlug(title: string): string {
    if (stryMutAct_9fa48("2261")) {
      {}
    } else {
      stryCov_9fa48("2261");
      // Preserve Unicode letters/numbers (incl. Hebrew), strip punctuation, collapse spaces -> dashes
      const unicodeSlug = stryMutAct_9fa48("2263") ? title.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}\s-]+/gu, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') : stryMutAct_9fa48("2262") ? title.trim().toUpperCase().normalize('NFKC').replace(/[^\p{L}\p{N}\s-]+/gu, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') : (stryCov_9fa48("2262", "2263"), title.trim().toLowerCase().normalize(stryMutAct_9fa48("2264") ? "" : (stryCov_9fa48("2264"), 'NFKC')).replace(stryMutAct_9fa48("2269") ? /[^\p{L}\p{N}\S-]+/gu : stryMutAct_9fa48("2268") ? /[^\p{L}\P{N}\s-]+/gu : stryMutAct_9fa48("2267") ? /[^\P{L}\p{N}\s-]+/gu : stryMutAct_9fa48("2266") ? /[\p{L}\p{N}\s-]+/gu : stryMutAct_9fa48("2265") ? /[^\p{L}\p{N}\s-]/gu : (stryCov_9fa48("2265", "2266", "2267", "2268", "2269"), /[^\p{L}\p{N}\s-]+/gu), stryMutAct_9fa48("2270") ? "Stryker was here!" : (stryCov_9fa48("2270"), '')).replace(stryMutAct_9fa48("2272") ? /\S+/g : stryMutAct_9fa48("2271") ? /\s/g : (stryCov_9fa48("2271", "2272"), /\s+/g), stryMutAct_9fa48("2273") ? "" : (stryCov_9fa48("2273"), '-')).replace(stryMutAct_9fa48("2274") ? /-/g : (stryCov_9fa48("2274"), /-+/g), stryMutAct_9fa48("2275") ? "" : (stryCov_9fa48("2275"), '-')).replace(stryMutAct_9fa48("2277") ? /^-|-/g : stryMutAct_9fa48("2276") ? /-|-$/g : (stryCov_9fa48("2276", "2277"), /^-|-$/g), stryMutAct_9fa48("2278") ? "Stryker was here!" : (stryCov_9fa48("2278"), '')));
      return unicodeSlug;
    }
  }

  /**
   * Normalize stock status
   */
  static normalizeStockStatus(status?: string): 'instock' | 'outofstock' {
    if (stryMutAct_9fa48("2279")) {
      {}
    } else {
      stryCov_9fa48("2279");
      if (stryMutAct_9fa48("2282") ? false : stryMutAct_9fa48("2281") ? true : stryMutAct_9fa48("2280") ? status : (stryCov_9fa48("2280", "2281", "2282"), !status)) return stryMutAct_9fa48("2283") ? "" : (stryCov_9fa48("2283"), 'instock');
      const normalized = stryMutAct_9fa48("2285") ? status.toUpperCase().trim() : stryMutAct_9fa48("2284") ? status.toLowerCase() : (stryCov_9fa48("2284", "2285"), status.toLowerCase().trim());
      if (stryMutAct_9fa48("2288") ? (normalized.includes('out') || normalized.includes('unavailable')) && normalized.includes('0') : stryMutAct_9fa48("2287") ? false : stryMutAct_9fa48("2286") ? true : (stryCov_9fa48("2286", "2287", "2288"), (stryMutAct_9fa48("2290") ? normalized.includes('out') && normalized.includes('unavailable') : stryMutAct_9fa48("2289") ? false : (stryCov_9fa48("2289", "2290"), normalized.includes(stryMutAct_9fa48("2291") ? "" : (stryCov_9fa48("2291"), 'out')) || normalized.includes(stryMutAct_9fa48("2292") ? "" : (stryCov_9fa48("2292"), 'unavailable')))) || normalized.includes(stryMutAct_9fa48("2293") ? "" : (stryCov_9fa48("2293"), '0')))) {
        if (stryMutAct_9fa48("2294")) {
          {}
        } else {
          stryCov_9fa48("2294");
          return stryMutAct_9fa48("2295") ? "" : (stryCov_9fa48("2295"), 'outofstock');
        }
      }
      return stryMutAct_9fa48("2296") ? "" : (stryCov_9fa48("2296"), 'instock');
    }
  }

  /**
   * Normalize image URLs to absolute URLs
   */
  static normalizeImages(images: string[], baseUrl?: string): string[] {
    if (stryMutAct_9fa48("2297")) {
      {}
    } else {
      stryCov_9fa48("2297");
      if (stryMutAct_9fa48("2300") ? !images && images.length === 0 : stryMutAct_9fa48("2299") ? false : stryMutAct_9fa48("2298") ? true : (stryCov_9fa48("2298", "2299", "2300"), (stryMutAct_9fa48("2301") ? images : (stryCov_9fa48("2301"), !images)) || (stryMutAct_9fa48("2303") ? images.length !== 0 : stryMutAct_9fa48("2302") ? false : (stryCov_9fa48("2302", "2303"), images.length === 0)))) return stryMutAct_9fa48("2304") ? ["Stryker was here"] : (stryCov_9fa48("2304"), []);
      return stryMutAct_9fa48("2306") ? images.map(img => {
        if (img.startsWith('http')) return img;
        if (baseUrl && img.startsWith('/')) {
          const url = new URL(baseUrl);
          return `${url.protocol}//${url.host}${img}`;
        }
        return img;
      }).filter(img => img.startsWith('http')) : stryMutAct_9fa48("2305") ? images.filter(img => img && img.trim()).map(img => {
        if (img.startsWith('http')) return img;
        if (baseUrl && img.startsWith('/')) {
          const url = new URL(baseUrl);
          return `${url.protocol}//${url.host}${img}`;
        }
        return img;
      }) : (stryCov_9fa48("2305", "2306"), images.filter(stryMutAct_9fa48("2307") ? () => undefined : (stryCov_9fa48("2307"), img => stryMutAct_9fa48("2310") ? img || img.trim() : stryMutAct_9fa48("2309") ? false : stryMutAct_9fa48("2308") ? true : (stryCov_9fa48("2308", "2309", "2310"), img && (stryMutAct_9fa48("2311") ? img : (stryCov_9fa48("2311"), img.trim()))))).map(img => {
        if (stryMutAct_9fa48("2312")) {
          {}
        } else {
          stryCov_9fa48("2312");
          if (stryMutAct_9fa48("2315") ? img.endsWith('http') : stryMutAct_9fa48("2314") ? false : stryMutAct_9fa48("2313") ? true : (stryCov_9fa48("2313", "2314", "2315"), img.startsWith(stryMutAct_9fa48("2316") ? "" : (stryCov_9fa48("2316"), 'http')))) return img;
          if (stryMutAct_9fa48("2319") ? baseUrl || img.startsWith('/') : stryMutAct_9fa48("2318") ? false : stryMutAct_9fa48("2317") ? true : (stryCov_9fa48("2317", "2318", "2319"), baseUrl && (stryMutAct_9fa48("2320") ? img.endsWith('/') : (stryCov_9fa48("2320"), img.startsWith(stryMutAct_9fa48("2321") ? "" : (stryCov_9fa48("2321"), '/')))))) {
            if (stryMutAct_9fa48("2322")) {
              {}
            } else {
              stryCov_9fa48("2322");
              const url = new URL(baseUrl);
              return stryMutAct_9fa48("2323") ? `` : (stryCov_9fa48("2323"), `${url.protocol}//${url.host}${img}`);
            }
          }
          return img;
        }
      }).filter(stryMutAct_9fa48("2324") ? () => undefined : (stryCov_9fa48("2324"), img => stryMutAct_9fa48("2325") ? img.endsWith('http') : (stryCov_9fa48("2325"), img.startsWith(stryMutAct_9fa48("2326") ? "" : (stryCov_9fa48("2326"), 'http'))))));
    }
  }

  /**
   * Detect product type (simple vs variable) with proper generic constraints
   */
  static detectProductType<T extends NormalizableProductData>(raw: T): 'simple' | 'variable' {
    if (stryMutAct_9fa48("2327")) {
      {}
    } else {
      stryCov_9fa48("2327");
      debug(stryMutAct_9fa48("2328") ? "" : (stryCov_9fa48("2328"), '🔍 DEBUG: detectProductType called with raw product:'), stryMutAct_9fa48("2329") ? {} : (stryCov_9fa48("2329"), {
        hasVariations: stryMutAct_9fa48("2330") ? !raw.variations : (stryCov_9fa48("2330"), !(stryMutAct_9fa48("2331") ? raw.variations : (stryCov_9fa48("2331"), !raw.variations))),
        variationsLength: stryMutAct_9fa48("2334") ? raw.variations?.length && 0 : stryMutAct_9fa48("2333") ? false : stryMutAct_9fa48("2332") ? true : (stryCov_9fa48("2332", "2333", "2334"), (stryMutAct_9fa48("2335") ? raw.variations.length : (stryCov_9fa48("2335"), raw.variations?.length)) || 0),
        hasAttributes: stryMutAct_9fa48("2336") ? !raw.attributes : (stryCov_9fa48("2336"), !(stryMutAct_9fa48("2337") ? raw.attributes : (stryCov_9fa48("2337"), !raw.attributes))),
        attributesKeys: raw.attributes ? Object.keys(raw.attributes) : stryMutAct_9fa48("2338") ? ["Stryker was here"] : (stryCov_9fa48("2338"), []),
        attributesValues: raw.attributes ? Object.values(raw.attributes) : stryMutAct_9fa48("2339") ? ["Stryker was here"] : (stryCov_9fa48("2339"), [])
      }));

      // If we already have parsed variations (e.g., from WooCommerce JSON), treat as variable
      if (stryMutAct_9fa48("2342") ? raw.variations || raw.variations.length > 0 : stryMutAct_9fa48("2341") ? false : stryMutAct_9fa48("2340") ? true : (stryCov_9fa48("2340", "2341", "2342"), raw.variations && (stryMutAct_9fa48("2345") ? raw.variations.length <= 0 : stryMutAct_9fa48("2344") ? raw.variations.length >= 0 : stryMutAct_9fa48("2343") ? true : (stryCov_9fa48("2343", "2344", "2345"), raw.variations.length > 0)))) {
        if (stryMutAct_9fa48("2346")) {
          {}
        } else {
          stryCov_9fa48("2346");
          debug(stryMutAct_9fa48("2347") ? "" : (stryCov_9fa48("2347"), '✅ DEBUG: Product type = variable (has parsed variations)'));
          return stryMutAct_9fa48("2348") ? "" : (stryCov_9fa48("2348"), 'variable');
        }
      }

      // Don't mark as variable just because of multiple attribute values
      if (stryMutAct_9fa48("2351") ? raw.attributes || Object.keys(raw.attributes).length > 0 : stryMutAct_9fa48("2350") ? false : stryMutAct_9fa48("2349") ? true : (stryCov_9fa48("2349", "2350", "2351"), raw.attributes && (stryMutAct_9fa48("2354") ? Object.keys(raw.attributes).length <= 0 : stryMutAct_9fa48("2353") ? Object.keys(raw.attributes).length >= 0 : stryMutAct_9fa48("2352") ? true : (stryCov_9fa48("2352", "2353", "2354"), Object.keys(raw.attributes).length > 0)))) {
        if (stryMutAct_9fa48("2355")) {
          {}
        } else {
          stryCov_9fa48("2355");
          debug(stryMutAct_9fa48("2356") ? "" : (stryCov_9fa48("2356"), 'ℹ️ DEBUG: Product has attributes but no variations - treating as simple'));
          return stryMutAct_9fa48("2357") ? "" : (stryCov_9fa48("2357"), 'simple');
        }
      }
      debug(stryMutAct_9fa48("2358") ? "" : (stryCov_9fa48("2358"), '❌ DEBUG: Product type = simple (no variations or attributes)'));
      return stryMutAct_9fa48("2359") ? "" : (stryCov_9fa48("2359"), 'simple');
    }
  }

  /**
   * Normalize product attributes
   */
  static normalizeAttributes(attributes: Record<string, (string | undefined)[]>): Record<string, string[]> {
    if (stryMutAct_9fa48("2360")) {
      {}
    } else {
      stryCov_9fa48("2360");
      debug(stryMutAct_9fa48("2361") ? "" : (stryCov_9fa48("2361"), '🔍 DEBUG: normalizeAttributes called with:'), attributes);
      const normalized: Record<string, string[]> = {};
      for (const [key, values] of Object.entries(attributes)) {
        if (stryMutAct_9fa48("2362")) {
          {}
        } else {
          stryCov_9fa48("2362");
          debug(stryMutAct_9fa48("2363") ? "" : (stryCov_9fa48("2363"), '🔍 DEBUG: Processing attribute:'), key, stryMutAct_9fa48("2364") ? "" : (stryCov_9fa48("2364"), 'values:'), values);
          if (stryMutAct_9fa48("2367") ? !values && values.length === 0 : stryMutAct_9fa48("2366") ? false : stryMutAct_9fa48("2365") ? true : (stryCov_9fa48("2365", "2366", "2367"), (stryMutAct_9fa48("2368") ? values : (stryCov_9fa48("2368"), !values)) || (stryMutAct_9fa48("2370") ? values.length !== 0 : stryMutAct_9fa48("2369") ? false : (stryCov_9fa48("2369", "2370"), values.length === 0)))) {
            if (stryMutAct_9fa48("2371")) {
              {}
            } else {
              stryCov_9fa48("2371");
              debug(stryMutAct_9fa48("2372") ? "" : (stryCov_9fa48("2372"), '❌ DEBUG: Skipping empty attribute:'), key);
              continue;
            }
          }
          const cleanKey = this.cleanAttributeName(key);
          const cleanValues = stryMutAct_9fa48("2374") ? values.map(value => this.cleanText(value)).filter(value => value && !this.isPlaceholder(value)) : stryMutAct_9fa48("2373") ? values.filter((value): value is string => value !== undefined).map(value => this.cleanText(value)) : (stryCov_9fa48("2373", "2374"), values.filter(stryMutAct_9fa48("2375") ? () => undefined : (stryCov_9fa48("2375"), (value): value is string => stryMutAct_9fa48("2378") ? value === undefined : stryMutAct_9fa48("2377") ? false : stryMutAct_9fa48("2376") ? true : (stryCov_9fa48("2376", "2377", "2378"), value !== undefined))).map(stryMutAct_9fa48("2379") ? () => undefined : (stryCov_9fa48("2379"), value => this.cleanText(value))).filter(stryMutAct_9fa48("2380") ? () => undefined : (stryCov_9fa48("2380"), value => stryMutAct_9fa48("2383") ? value || !this.isPlaceholder(value) : stryMutAct_9fa48("2382") ? false : stryMutAct_9fa48("2381") ? true : (stryCov_9fa48("2381", "2382", "2383"), value && (stryMutAct_9fa48("2384") ? this.isPlaceholder(value) : (stryCov_9fa48("2384"), !this.isPlaceholder(value)))))));
          debug(stryMutAct_9fa48("2385") ? "" : (stryCov_9fa48("2385"), '🔍 DEBUG: Cleaned attribute:'), cleanKey, stryMutAct_9fa48("2386") ? "" : (stryCov_9fa48("2386"), 'cleanValues:'), cleanValues);
          if (stryMutAct_9fa48("2390") ? cleanValues.length <= 0 : stryMutAct_9fa48("2389") ? cleanValues.length >= 0 : stryMutAct_9fa48("2388") ? false : stryMutAct_9fa48("2387") ? true : (stryCov_9fa48("2387", "2388", "2389", "2390"), cleanValues.length > 0)) {
            if (stryMutAct_9fa48("2391")) {
              {}
            } else {
              stryCov_9fa48("2391");
              normalized[cleanKey] = cleanValues;
              debug(stryMutAct_9fa48("2392") ? "" : (stryCov_9fa48("2392"), '✅ DEBUG: Added normalized attribute:'), cleanKey, stryMutAct_9fa48("2393") ? "" : (stryCov_9fa48("2393"), '='), cleanValues);
            }
          } else {
            if (stryMutAct_9fa48("2394")) {
              {}
            } else {
              stryCov_9fa48("2394");
              debug(stryMutAct_9fa48("2395") ? "" : (stryCov_9fa48("2395"), '❌ DEBUG: No clean values for attribute:'), cleanKey);
            }
          }
        }
      }
      debug(stryMutAct_9fa48("2396") ? "" : (stryCov_9fa48("2396"), '🔍 DEBUG: Final normalized attributes:'), normalized);
      return normalized;
    }
  }

  /**
   * Clean attribute names
   */
  static cleanAttributeName(name: string): string {
    if (stryMutAct_9fa48("2397")) {
      {}
    } else {
      stryCov_9fa48("2397");
      return stryMutAct_9fa48("2399") ? name

      // Remove WooCommerce prefixes
      .replace(/^(pa_|attribute_)/, '')
      // Decode percent encoding
      .replace(/%20/g, ' ').replace(/%2B/g, '+')
      // Capitalize first letter (preserve Hebrew)
      .replace(/^([a-z])/, match => match.toUpperCase()).trim() : stryMutAct_9fa48("2398") ? name.trim()
      // Remove WooCommerce prefixes
      .replace(/^(pa_|attribute_)/, '')
      // Decode percent encoding
      .replace(/%20/g, ' ').replace(/%2B/g, '+')
      // Capitalize first letter (preserve Hebrew)
      .replace(/^([a-z])/, match => match.toUpperCase()) : (stryCov_9fa48("2398", "2399"), name.trim()
      // Remove WooCommerce prefixes
      .replace(stryMutAct_9fa48("2400") ? /(pa_|attribute_)/ : (stryCov_9fa48("2400"), /^(pa_|attribute_)/), stryMutAct_9fa48("2401") ? "Stryker was here!" : (stryCov_9fa48("2401"), ''))
      // Decode percent encoding
      .replace(/%20/g, stryMutAct_9fa48("2402") ? "" : (stryCov_9fa48("2402"), ' ')).replace(/%2B/g, stryMutAct_9fa48("2403") ? "" : (stryCov_9fa48("2403"), '+'))
      // Capitalize first letter (preserve Hebrew)
      .replace(stryMutAct_9fa48("2405") ? /^([^a-z])/ : stryMutAct_9fa48("2404") ? /([a-z])/ : (stryCov_9fa48("2404", "2405"), /^([a-z])/), stryMutAct_9fa48("2406") ? () => undefined : (stryCov_9fa48("2406"), match => stryMutAct_9fa48("2407") ? match.toLowerCase() : (stryCov_9fa48("2407"), match.toUpperCase()))).trim());
    }
  }

  /**
   * Check if text is a placeholder
   */
  static isPlaceholder(text: string): boolean {
    if (stryMutAct_9fa48("2408")) {
      {}
    } else {
      stryCov_9fa48("2408");
      debug(stryMutAct_9fa48("2409") ? "" : (stryCov_9fa48("2409"), '🔍 DEBUG: Checking if text is placeholder:'), text);
      const placeholders = stryMutAct_9fa48("2410") ? [] : (stryCov_9fa48("2410"), [stryMutAct_9fa48("2411") ? "" : (stryCov_9fa48("2411"), 'בחר אפשרות'), stryMutAct_9fa48("2412") ? "" : (stryCov_9fa48("2412"), 'בחירת אפשרות'), stryMutAct_9fa48("2413") ? "" : (stryCov_9fa48("2413"), 'Select option'), stryMutAct_9fa48("2414") ? "" : (stryCov_9fa48("2414"), 'Choose option'), stryMutAct_9fa48("2415") ? "" : (stryCov_9fa48("2415"), 'בחר גודל'), stryMutAct_9fa48("2416") ? "" : (stryCov_9fa48("2416"), 'בחר צבע'), stryMutAct_9fa48("2417") ? "" : (stryCov_9fa48("2417"), 'בחר מודל'), stryMutAct_9fa48("2418") ? "" : (stryCov_9fa48("2418"), 'Select size'), stryMutAct_9fa48("2419") ? "" : (stryCov_9fa48("2419"), 'Select color'), stryMutAct_9fa48("2420") ? "" : (stryCov_9fa48("2420"), 'Select model'), stryMutAct_9fa48("2421") ? "" : (stryCov_9fa48("2421"), 'General'), // Common in WooCommerce
      stryMutAct_9fa48("2422") ? "" : (stryCov_9fa48("2422"), 'בחירת אפשרות'), // Hebrew "Choose option"
      stryMutAct_9fa48("2423") ? "" : (stryCov_9fa48("2423"), 'בחירת אפשרותA - רינבוקורן Lets Go'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2424") ? "" : (stryCov_9fa48("2424"), 'בחירת אפשרותB - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2425") ? "" : (stryCov_9fa48("2425"), 'בחירת אפשרותC - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2426") ? "" : (stryCov_9fa48("2426"), 'בחירת אפשרותD - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2427") ? "" : (stryCov_9fa48("2427"), 'בחירת אפשרותE - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2428") ? "" : (stryCov_9fa48("2428"), 'בחירת אפשרותF - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2429") ? "" : (stryCov_9fa48("2429"), 'בחירת אפשרותG - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2430") ? "" : (stryCov_9fa48("2430"), 'בחירת אפשרותH - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2431") ? "" : (stryCov_9fa48("2431"), 'בחירת אפשרותI - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2432") ? "" : (stryCov_9fa48("2432"), 'בחירת אפשרותJ - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2433") ? "" : (stryCov_9fa48("2433"), 'בחירת אפשרותK - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2434") ? "" : (stryCov_9fa48("2434"), 'בחירת אפשרותL - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2435") ? "" : (stryCov_9fa48("2435"), 'בחירת אפשרותM - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2436") ? "" : (stryCov_9fa48("2436"), 'בחירת אפשרותN - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2437") ? "" : (stryCov_9fa48("2437"), 'בחירת אפשרותO - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2438") ? "" : (stryCov_9fa48("2438"), 'בחירת אפשרותP - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2439") ? "" : (stryCov_9fa48("2439"), 'בחירת אפשרותQ - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2440") ? "" : (stryCov_9fa48("2440"), 'בחירת אפשרותR - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2441") ? "" : (stryCov_9fa48("2441"), 'בחירת אפשרותS - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2442") ? "" : (stryCov_9fa48("2442"), 'בחירת אפשרותT - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2443") ? "" : (stryCov_9fa48("2443"), 'בחירת אפשרותU - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2444") ? "" : (stryCov_9fa48("2444"), 'בחירת אפשרותV - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2445") ? "" : (stryCov_9fa48("2445"), 'בחירת אפשרותW - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2446") ? "" : (stryCov_9fa48("2446"), 'בחירת אפשרותX - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2447") ? "" : (stryCov_9fa48("2447"), 'בחירת אפשרותY - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2448") ? "" : (stryCov_9fa48("2448"), 'בחירת אפשרותZ - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2449") ? "" : (stryCov_9fa48("2449"), 'בחירת אפשרות0 - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2450") ? "" : (stryCov_9fa48("2450"), 'בחירת אפשרות1 - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2451") ? "" : (stryCov_9fa48("2451"), 'בחירת אפשרות2 - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2452") ? "" : (stryCov_9fa48("2452"), 'בחירת אפשרות3 - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2453") ? "" : (stryCov_9fa48("2453"), 'בחירת אפשרות4 - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2454") ? "" : (stryCov_9fa48("2454"), 'בחירת אפשרות5 - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2455") ? "" : (stryCov_9fa48("2455"), 'בחירת אפשרות6 - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2456") ? "" : (stryCov_9fa48("2456"), 'בחירת אפשרות7 - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2457") ? "" : (stryCov_9fa48("2457"), 'בחירת אפשרות8 - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2458") ? "" : (stryCov_9fa48("2458"), 'בחירת אפשרות9 - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2459") ? "" : (stryCov_9fa48("2459"), 'בחירת אפשרותא - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2460") ? "" : (stryCov_9fa48("2460"), 'בחירת אפשרותב - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2461") ? "" : (stryCov_9fa48("2461"), 'בחירת אפשרותג - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2462") ? "" : (stryCov_9fa48("2462"), 'בחירת אפשרותד - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2463") ? "" : (stryCov_9fa48("2463"), 'בחירת אפשרותה - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2464") ? "" : (stryCov_9fa48("2464"), 'בחירת אפשרותו - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2465") ? "" : (stryCov_9fa48("2465"), 'בחירת אפשרותז - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2466") ? "" : (stryCov_9fa48("2466"), 'בחירת אפשרותח - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2467") ? "" : (stryCov_9fa48("2467"), 'בחירת אפשרותט - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2468") ? "" : (stryCov_9fa48("2468"), 'בחירת אפשרותי - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2469") ? "" : (stryCov_9fa48("2469"), 'בחירת אפשרותכ - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2470") ? "" : (stryCov_9fa48("2470"), 'בחירת אפשרותל - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2471") ? "" : (stryCov_9fa48("2471"), 'בחירת אפשרותמ - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2472") ? "" : (stryCov_9fa48("2472"), 'בחירת אפשרותנ - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2473") ? "" : (stryCov_9fa48("2473"), 'בחירת אפשרותס - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2474") ? "" : (stryCov_9fa48("2474"), 'בחירת אפשרותע - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2475") ? "" : (stryCov_9fa48("2475"), 'בחירת אפשרותפ - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2476") ? "" : (stryCov_9fa48("2476"), 'בחירת אפשרותצ - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2477") ? "" : (stryCov_9fa48("2477"), 'בחירת אפשרותק - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2478") ? "" : (stryCov_9fa48("2478"), 'בחירת אפשרותר - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2479") ? "" : (stryCov_9fa48("2479"), 'בחירת אפשרותש - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2480") ? "" : (stryCov_9fa48("2480"), 'בחירת אפשרותת - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("2481") ? "" : (stryCov_9fa48("2481"), 'בחירת אפשרותא'), // Hebrew with option prefix
      stryMutAct_9fa48("2482") ? "" : (stryCov_9fa48("2482"), 'בחירת אפשרותB'), // Hebrew with option prefix
      stryMutAct_9fa48("2483") ? "" : (stryCov_9fa48("2483"), 'בחירת אפשרותC'), // Hebrew with option prefix
      stryMutAct_9fa48("2484") ? "" : (stryCov_9fa48("2484"), 'בחירת אפשרותD'), // Hebrew with option prefix
      stryMutAct_9fa48("2485") ? "" : (stryCov_9fa48("2485"), 'בחירת אפשרותE'), // Hebrew with option prefix
      stryMutAct_9fa48("2486") ? "" : (stryCov_9fa48("2486"), 'בחירת אפשרותF'), // Hebrew with option prefix
      stryMutAct_9fa48("2487") ? "" : (stryCov_9fa48("2487"), 'בחירת אפשרותG'), // Hebrew with option prefix
      stryMutAct_9fa48("2488") ? "" : (stryCov_9fa48("2488"), 'בחירת אפשרותH'), // Hebrew with option prefix
      stryMutAct_9fa48("2489") ? "" : (stryCov_9fa48("2489"), 'בחירת אפשרותI'), // Hebrew with option prefix
      stryMutAct_9fa48("2490") ? "" : (stryCov_9fa48("2490"), 'בחירת אפשרותJ'), // Hebrew with option prefix
      stryMutAct_9fa48("2491") ? "" : (stryCov_9fa48("2491"), 'בחירת אפשרותK'), // Hebrew with option prefix
      stryMutAct_9fa48("2492") ? "" : (stryCov_9fa48("2492"), 'בחירת אפשרותL'), // Hebrew with option prefix
      stryMutAct_9fa48("2493") ? "" : (stryCov_9fa48("2493"), 'בחירת אפשרותM'), // Hebrew with option prefix
      stryMutAct_9fa48("2494") ? "" : (stryCov_9fa48("2494"), 'בחירת אפשרותN'), // Hebrew with option prefix
      stryMutAct_9fa48("2495") ? "" : (stryCov_9fa48("2495"), 'בחירת אפשרותO'), // Hebrew with option prefix
      stryMutAct_9fa48("2496") ? "" : (stryCov_9fa48("2496"), 'בחירת אפשרותP'), // Hebrew with option prefix
      stryMutAct_9fa48("2497") ? "" : (stryCov_9fa48("2497"), 'בחירת אפשרותQ'), // Hebrew with option prefix
      stryMutAct_9fa48("2498") ? "" : (stryCov_9fa48("2498"), 'בחירת אפשרותR'), // Hebrew with option prefix
      stryMutAct_9fa48("2499") ? "" : (stryCov_9fa48("2499"), 'בחירת אפשרותS'), // Hebrew with option prefix
      stryMutAct_9fa48("2500") ? "" : (stryCov_9fa48("2500"), 'בחירת אפשרותT'), // Hebrew with option prefix
      stryMutAct_9fa48("2501") ? "" : (stryCov_9fa48("2501"), 'בחירת אפשרותU'), // Hebrew with option prefix
      stryMutAct_9fa48("2502") ? "" : (stryCov_9fa48("2502"), 'בחירת אפשרותV'), // Hebrew with option prefix
      stryMutAct_9fa48("2503") ? "" : (stryCov_9fa48("2503"), 'בחירת אפשרותW'), // Hebrew with option prefix
      stryMutAct_9fa48("2504") ? "" : (stryCov_9fa48("2504"), 'בחירת אפשרותX'), // Hebrew with option prefix
      stryMutAct_9fa48("2505") ? "" : (stryCov_9fa48("2505"), 'בחירת אפשרותY'), // Hebrew with option prefix
      stryMutAct_9fa48("2506") ? "" : (stryCov_9fa48("2506"), 'בחירת אפשרותZ'), // Hebrew with option prefix
      stryMutAct_9fa48("2507") ? "" : (stryCov_9fa48("2507"), 'בחירת אפשרות0'), // Hebrew with option prefix
      stryMutAct_9fa48("2508") ? "" : (stryCov_9fa48("2508"), 'בחירת אפשרות1'), // Hebrew with option prefix
      stryMutAct_9fa48("2509") ? "" : (stryCov_9fa48("2509"), 'בחירת אפשרות2'), // Hebrew with option prefix
      stryMutAct_9fa48("2510") ? "" : (stryCov_9fa48("2510"), 'בחירת אפשרות3'), // Hebrew with option prefix
      stryMutAct_9fa48("2511") ? "" : (stryCov_9fa48("2511"), 'בחירת אפשרות4'), // Hebrew with option prefix
      stryMutAct_9fa48("2512") ? "" : (stryCov_9fa48("2512"), 'בחירת אפשרות5'), // Hebrew with option prefix
      stryMutAct_9fa48("2513") ? "" : (stryCov_9fa48("2513"), 'בחירת אפשרות6'), // Hebrew with option prefix
      stryMutAct_9fa48("2514") ? "" : (stryCov_9fa48("2514"), 'בחירת אפשרות7'), // Hebrew with option prefix
      stryMutAct_9fa48("2515") ? "" : (stryCov_9fa48("2515"), 'בחירת אפשרות8'), // Hebrew with option prefix
      stryMutAct_9fa48("2516") ? "" : (stryCov_9fa48("2516"), 'בחירת אפשרות9'), // Hebrew with option prefix
      stryMutAct_9fa48("2517") ? "" : (stryCov_9fa48("2517"), 'בחירת אפשרותא'), // Hebrew with option prefix
      stryMutAct_9fa48("2518") ? "" : (stryCov_9fa48("2518"), 'בחירת אפשרותב'), // Hebrew with option prefix
      stryMutAct_9fa48("2519") ? "" : (stryCov_9fa48("2519"), 'בחירת אפשרותג'), // Hebrew with option prefix
      stryMutAct_9fa48("2520") ? "" : (stryCov_9fa48("2520"), 'בחירת אפשרותד'), // Hebrew with option prefix
      stryMutAct_9fa48("2521") ? "" : (stryCov_9fa48("2521"), 'בחירת אפשרותה'), // Hebrew with option prefix
      stryMutAct_9fa48("2522") ? "" : (stryCov_9fa48("2522"), 'בחירת אפשרותו'), // Hebrew with option prefix
      stryMutAct_9fa48("2523") ? "" : (stryCov_9fa48("2523"), 'בחירת אפשרותז'), // Hebrew with option prefix
      stryMutAct_9fa48("2524") ? "" : (stryCov_9fa48("2524"), 'בחירת אפשרותח'), // Hebrew with option prefix
      stryMutAct_9fa48("2525") ? "" : (stryCov_9fa48("2525"), 'בחירת אפשרותט'), // Hebrew with option prefix
      stryMutAct_9fa48("2526") ? "" : (stryCov_9fa48("2526"), 'בחירת אפשרותי'), // Hebrew with option prefix
      stryMutAct_9fa48("2527") ? "" : (stryCov_9fa48("2527"), 'בחירת אפשרותכ'), // Hebrew with option prefix
      stryMutAct_9fa48("2528") ? "" : (stryCov_9fa48("2528"), 'בחירת אפשרותל'), // Hebrew with option prefix
      stryMutAct_9fa48("2529") ? "" : (stryCov_9fa48("2529"), 'בחירת אפשרותמ'), // Hebrew with option prefix
      stryMutAct_9fa48("2530") ? "" : (stryCov_9fa48("2530"), 'בחירת אפשרותנ'), // Hebrew with option prefix
      stryMutAct_9fa48("2531") ? "" : (stryCov_9fa48("2531"), 'בחירת אפשרותס'), // Hebrew with option prefix
      stryMutAct_9fa48("2532") ? "" : (stryCov_9fa48("2532"), 'בחירת אפשרותע'), // Hebrew with option prefix
      stryMutAct_9fa48("2533") ? "" : (stryCov_9fa48("2533"), 'בחירת אפשרותפ'), // Hebrew with option prefix
      stryMutAct_9fa48("2534") ? "" : (stryCov_9fa48("2534"), 'בחירת אפשרותצ'), // Hebrew with option prefix
      stryMutAct_9fa48("2535") ? "" : (stryCov_9fa48("2535"), 'בחירת אפשרותק'), // Hebrew with option prefix
      stryMutAct_9fa48("2536") ? "" : (stryCov_9fa48("2536"), 'בחירת אפשרותר'), // Hebrew with option prefix
      stryMutAct_9fa48("2537") ? "" : (stryCov_9fa48("2537"), 'בחירת אפשרותש'), // Hebrew with option prefix
      stryMutAct_9fa48("2538") ? "" : (stryCov_9fa48("2538"), 'בחירת אפשרותת'), // Hebrew with option prefix
      stryMutAct_9fa48("2539") ? "" : (stryCov_9fa48("2539"), 'בחירת אפשרותא'), // Hebrew with option prefix
      stryMutAct_9fa48("2540") ? "" : (stryCov_9fa48("2540"), 'בחירת אפשרותב'), // Hebrew with option prefix
      stryMutAct_9fa48("2541") ? "" : (stryCov_9fa48("2541"), 'בחירת אפשרותג'), // Hebrew with option prefix
      stryMutAct_9fa48("2542") ? "" : (stryCov_9fa48("2542"), 'בחירת אפשרותד'), // Hebrew with option prefix
      stryMutAct_9fa48("2543") ? "" : (stryCov_9fa48("2543"), 'בחירת אפשרותה'), // Hebrew with option prefix
      stryMutAct_9fa48("2544") ? "" : (stryCov_9fa48("2544"), 'בחירת אפשרותו'), // Hebrew with option prefix
      stryMutAct_9fa48("2545") ? "" : (stryCov_9fa48("2545"), 'בחירת אפשרותז'), // Hebrew with option prefix
      stryMutAct_9fa48("2546") ? "" : (stryCov_9fa48("2546"), 'בחירת אפשרותח'), // Hebrew with option prefix
      stryMutAct_9fa48("2547") ? "" : (stryCov_9fa48("2547"), 'בחירת אפשרותט'), // Hebrew with option prefix
      stryMutAct_9fa48("2548") ? "" : (stryCov_9fa48("2548"), 'בחירת אפשרותי'), // Hebrew with option prefix
      stryMutAct_9fa48("2549") ? "" : (stryCov_9fa48("2549"), 'בחירת אפשרותכ'), // Hebrew with option prefix
      stryMutAct_9fa48("2550") ? "" : (stryCov_9fa48("2550"), 'בחירת אפשרותל'), // Hebrew with option prefix
      stryMutAct_9fa48("2551") ? "" : (stryCov_9fa48("2551"), 'בחירת אפשרותמ'), // Hebrew with option prefix
      stryMutAct_9fa48("2552") ? "" : (stryCov_9fa48("2552"), 'בחירת אפשרותנ'), // Hebrew with option prefix
      stryMutAct_9fa48("2553") ? "" : (stryCov_9fa48("2553"), 'בחירת אפשרותס'), // Hebrew with option prefix
      stryMutAct_9fa48("2554") ? "" : (stryCov_9fa48("2554"), 'בחירת אפשרותע'), // Hebrew with option prefix
      stryMutAct_9fa48("2555") ? "" : (stryCov_9fa48("2555"), 'בחירת אפשרותפ'), // Hebrew with option prefix
      stryMutAct_9fa48("2556") ? "" : (stryCov_9fa48("2556"), 'בחירת אפשרותצ'), // Hebrew with option prefix
      stryMutAct_9fa48("2557") ? "" : (stryCov_9fa48("2557"), 'בחירת אפשרותק'), // Hebrew with option prefix
      stryMutAct_9fa48("2558") ? "" : (stryCov_9fa48("2558"), 'בחירת אפשרותר'), // Hebrew with option prefix
      stryMutAct_9fa48("2559") ? "" : (stryCov_9fa48("2559"), 'בחירת אפשרותש'), // Hebrew with option prefix
      stryMutAct_9fa48("2560") ? "" : (stryCov_9fa48("2560"), 'בחירת אפשרותת') // Hebrew with option prefix
      ]);
      const isPlaceholder = stryMutAct_9fa48("2561") ? placeholders.every(placeholder => text.toLowerCase().includes(placeholder.toLowerCase())) : (stryCov_9fa48("2561"), placeholders.some(stryMutAct_9fa48("2562") ? () => undefined : (stryCov_9fa48("2562"), placeholder => stryMutAct_9fa48("2563") ? text.toUpperCase().includes(placeholder.toLowerCase()) : (stryCov_9fa48("2563"), text.toLowerCase().includes(stryMutAct_9fa48("2564") ? placeholder.toUpperCase() : (stryCov_9fa48("2564"), placeholder.toLowerCase()))))));
      if (stryMutAct_9fa48("2566") ? false : stryMutAct_9fa48("2565") ? true : (stryCov_9fa48("2565", "2566"), isPlaceholder)) {
        if (stryMutAct_9fa48("2567")) {
          {}
        } else {
          stryCov_9fa48("2567");
          debug(stryMutAct_9fa48("2568") ? "" : (stryCov_9fa48("2568"), '🔍 DEBUG: Detected placeholder text:'), text);
        }
      }
      return isPlaceholder;
    }
  }

  /**
   * Normalize product variations
   */
  static normalizeVariations(variations: RawVariation[]): ProductVariation[] {
    if (stryMutAct_9fa48("2569")) {
      {}
    } else {
      stryCov_9fa48("2569");
      return stryMutAct_9fa48("2570") ? variations.map(variation => ({
        sku: this.cleanSku(variation.sku!),
        regularPrice: this.cleanText(variation.regularPrice || ''),
        taxClass: this.cleanText(variation.taxClass || ''),
        stockStatus: this.normalizeStockStatus(variation.stockStatus),
        images: this.normalizeImages(variation.images || []),
        attributeAssignments: this.cleanAttributeAssignments(variation.attributeAssignments || {})
      })) : (stryCov_9fa48("2570"), variations.filter(stryMutAct_9fa48("2571") ? () => undefined : (stryCov_9fa48("2571"), variation => stryMutAct_9fa48("2574") ? variation || variation.sku : stryMutAct_9fa48("2573") ? false : stryMutAct_9fa48("2572") ? true : (stryCov_9fa48("2572", "2573", "2574"), variation && variation.sku))).map(stryMutAct_9fa48("2575") ? () => undefined : (stryCov_9fa48("2575"), variation => stryMutAct_9fa48("2576") ? {} : (stryCov_9fa48("2576"), {
        sku: this.cleanSku(variation.sku!),
        regularPrice: this.cleanText(stryMutAct_9fa48("2579") ? variation.regularPrice && '' : stryMutAct_9fa48("2578") ? false : stryMutAct_9fa48("2577") ? true : (stryCov_9fa48("2577", "2578", "2579"), variation.regularPrice || (stryMutAct_9fa48("2580") ? "Stryker was here!" : (stryCov_9fa48("2580"), '')))),
        taxClass: this.cleanText(stryMutAct_9fa48("2583") ? variation.taxClass && '' : stryMutAct_9fa48("2582") ? false : stryMutAct_9fa48("2581") ? true : (stryCov_9fa48("2581", "2582", "2583"), variation.taxClass || (stryMutAct_9fa48("2584") ? "Stryker was here!" : (stryCov_9fa48("2584"), '')))),
        stockStatus: this.normalizeStockStatus(variation.stockStatus),
        images: this.normalizeImages(stryMutAct_9fa48("2587") ? variation.images && [] : stryMutAct_9fa48("2586") ? false : stryMutAct_9fa48("2585") ? true : (stryCov_9fa48("2585", "2586", "2587"), variation.images || (stryMutAct_9fa48("2588") ? ["Stryker was here"] : (stryCov_9fa48("2588"), [])))),
        attributeAssignments: this.cleanAttributeAssignments(stryMutAct_9fa48("2591") ? variation.attributeAssignments && {} : stryMutAct_9fa48("2590") ? false : stryMutAct_9fa48("2589") ? true : (stryCov_9fa48("2589", "2590", "2591"), variation.attributeAssignments || {}))
      }))));
    }
  }

  /**
   * Clean attribute assignments
   */
  static cleanAttributeAssignments(assignments: Record<string, string>): Record<string, string> {
    if (stryMutAct_9fa48("2592")) {
      {}
    } else {
      stryCov_9fa48("2592");
      const cleaned: Record<string, string> = {};
      for (const [key, value] of Object.entries(assignments)) {
        if (stryMutAct_9fa48("2593")) {
          {}
        } else {
          stryCov_9fa48("2593");
          const cleanKey = this.cleanAttributeName(key);
          const cleanValue = this.cleanText(value);
          if (stryMutAct_9fa48("2596") ? cleanValue || !this.isPlaceholder(cleanValue) : stryMutAct_9fa48("2595") ? false : stryMutAct_9fa48("2594") ? true : (stryCov_9fa48("2594", "2595", "2596"), cleanValue && (stryMutAct_9fa48("2597") ? this.isPlaceholder(cleanValue) : (stryCov_9fa48("2597"), !this.isPlaceholder(cleanValue))))) {
            if (stryMutAct_9fa48("2598")) {
              {}
            } else {
              stryCov_9fa48("2598");
              cleaned[cleanKey] = cleanValue;
            }
          }
        }
      }
      return cleaned;
    }
  }

  /**
   * Parse dimensions from text
   */
  static parseDimensions(text: string): {
    width?: number;
    height?: number;
    depth?: number;
  } {
    if (stryMutAct_9fa48("2599")) {
      {}
    } else {
      stryCov_9fa48("2599");
      if (stryMutAct_9fa48("2602") ? false : stryMutAct_9fa48("2601") ? true : stryMutAct_9fa48("2600") ? text : (stryCov_9fa48("2600", "2601", "2602"), !text)) return {};
      const cleaned = this.cleanText(text);

      // Pattern: "140140" -> "140*140"
      const dimensionPattern = stryMutAct_9fa48("2606") ? /(\d{2,4})(\D{2,4})/g : stryMutAct_9fa48("2605") ? /(\d{2,4})(\d)/g : stryMutAct_9fa48("2604") ? /(\D{2,4})(\d{2,4})/g : stryMutAct_9fa48("2603") ? /(\d)(\d{2,4})/g : (stryCov_9fa48("2603", "2604", "2605", "2606"), /(\d{2,4})(\d{2,4})/g);
      const match = dimensionPattern.exec(cleaned);
      if (stryMutAct_9fa48("2608") ? false : stryMutAct_9fa48("2607") ? true : (stryCov_9fa48("2607", "2608"), match)) {
        if (stryMutAct_9fa48("2609")) {
          {}
        } else {
          stryCov_9fa48("2609");
          return stryMutAct_9fa48("2610") ? {} : (stryCov_9fa48("2610"), {
            width: parseInt(stryMutAct_9fa48("2613") ? match[1] && '0' : stryMutAct_9fa48("2612") ? false : stryMutAct_9fa48("2611") ? true : (stryCov_9fa48("2611", "2612", "2613"), match[1] || (stryMutAct_9fa48("2614") ? "" : (stryCov_9fa48("2614"), '0')))),
            height: parseInt(stryMutAct_9fa48("2617") ? match[2] && '0' : stryMutAct_9fa48("2616") ? false : stryMutAct_9fa48("2615") ? true : (stryCov_9fa48("2615", "2616", "2617"), match[2] || (stryMutAct_9fa48("2618") ? "" : (stryCov_9fa48("2618"), '0'))))
          });
        }
      }

      // Pattern: "140 x 140" or "140*140"
      const xPattern = stryMutAct_9fa48("2627") ? /(\d+)\s*[xX*]\s*(\D+)/ : stryMutAct_9fa48("2626") ? /(\d+)\s*[xX*]\s*(\d)/ : stryMutAct_9fa48("2625") ? /(\d+)\s*[xX*]\S*(\d+)/ : stryMutAct_9fa48("2624") ? /(\d+)\s*[xX*]\s(\d+)/ : stryMutAct_9fa48("2623") ? /(\d+)\s*[^xX*]\s*(\d+)/ : stryMutAct_9fa48("2622") ? /(\d+)\S*[xX*]\s*(\d+)/ : stryMutAct_9fa48("2621") ? /(\d+)\s[xX*]\s*(\d+)/ : stryMutAct_9fa48("2620") ? /(\D+)\s*[xX*]\s*(\d+)/ : stryMutAct_9fa48("2619") ? /(\d)\s*[xX*]\s*(\d+)/ : (stryCov_9fa48("2619", "2620", "2621", "2622", "2623", "2624", "2625", "2626", "2627"), /(\d+)\s*[xX*]\s*(\d+)/);
      const xMatch = cleaned.match(xPattern);
      if (stryMutAct_9fa48("2629") ? false : stryMutAct_9fa48("2628") ? true : (stryCov_9fa48("2628", "2629"), xMatch)) {
        if (stryMutAct_9fa48("2630")) {
          {}
        } else {
          stryCov_9fa48("2630");
          return stryMutAct_9fa48("2631") ? {} : (stryCov_9fa48("2631"), {
            width: parseInt(stryMutAct_9fa48("2634") ? xMatch[1] && '0' : stryMutAct_9fa48("2633") ? false : stryMutAct_9fa48("2632") ? true : (stryCov_9fa48("2632", "2633", "2634"), xMatch[1] || (stryMutAct_9fa48("2635") ? "" : (stryCov_9fa48("2635"), '0')))),
            height: parseInt(stryMutAct_9fa48("2638") ? xMatch[2] && '0' : stryMutAct_9fa48("2637") ? false : stryMutAct_9fa48("2636") ? true : (stryCov_9fa48("2636", "2637", "2638"), xMatch[2] || (stryMutAct_9fa48("2639") ? "" : (stryCov_9fa48("2639"), '0'))))
          });
        }
      }
      return {};
    }
  }
}