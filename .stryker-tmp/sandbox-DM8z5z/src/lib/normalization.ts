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
    if (stryMutAct_9fa48("3930")) {
      {}
    } else {
      stryCov_9fa48("3930");
      debug(stryMutAct_9fa48("3931") ? "" : (stryCov_9fa48("3931"), '🔍 DEBUG: normalizeProduct called with:'), stryMutAct_9fa48("3932") ? {} : (stryCov_9fa48("3932"), {
        url,
        rawTitle: raw.title,
        rawSku: raw.sku,
        rawDescription: raw.description,
        rawAttributes: raw.attributes,
        rawVariations: raw.variations
      }));
      const result: NormalizedProduct = stryMutAct_9fa48("3933") ? {} : (stryCov_9fa48("3933"), {
        id: stryMutAct_9fa48("3936") ? raw.id && this.generateSku(url) : stryMutAct_9fa48("3935") ? false : stryMutAct_9fa48("3934") ? true : (stryCov_9fa48("3934", "3935", "3936"), raw.id || this.generateSku(url)),
        title: this.cleanText(stryMutAct_9fa48("3939") ? raw.title && '' : stryMutAct_9fa48("3938") ? false : stryMutAct_9fa48("3937") ? true : (stryCov_9fa48("3937", "3938", "3939"), raw.title || (stryMutAct_9fa48("3940") ? "Stryker was here!" : (stryCov_9fa48("3940"), '')))),
        slug: this.generateSlug(stryMutAct_9fa48("3943") ? raw.title && url : stryMutAct_9fa48("3942") ? false : stryMutAct_9fa48("3941") ? true : (stryCov_9fa48("3941", "3942", "3943"), raw.title || url)),
        description: this.cleanText(stryMutAct_9fa48("3946") ? raw.description && '' : stryMutAct_9fa48("3945") ? false : stryMutAct_9fa48("3944") ? true : (stryCov_9fa48("3944", "3945", "3946"), raw.description || (stryMutAct_9fa48("3947") ? "Stryker was here!" : (stryCov_9fa48("3947"), '')))),
        shortDescription: this.cleanText(stryMutAct_9fa48("3950") ? raw.shortDescription && '' : stryMutAct_9fa48("3949") ? false : stryMutAct_9fa48("3948") ? true : (stryCov_9fa48("3948", "3949", "3950"), raw.shortDescription || (stryMutAct_9fa48("3951") ? "Stryker was here!" : (stryCov_9fa48("3951"), '')))),
        sku: this.cleanSku(stryMutAct_9fa48("3954") ? raw.sku && this.generateSku(url) : stryMutAct_9fa48("3953") ? false : stryMutAct_9fa48("3952") ? true : (stryCov_9fa48("3952", "3953", "3954"), raw.sku || this.generateSku(url))),
        stockStatus: this.normalizeStockStatus(raw.stockStatus),
        images: this.normalizeImages(stryMutAct_9fa48("3955") ? raw.images || [] : (stryCov_9fa48("3955"), (stryMutAct_9fa48("3958") ? raw.images && [] : stryMutAct_9fa48("3957") ? false : stryMutAct_9fa48("3956") ? true : (stryCov_9fa48("3956", "3957", "3958"), raw.images || (stryMutAct_9fa48("3959") ? ["Stryker was here"] : (stryCov_9fa48("3959"), [])))).filter(stryMutAct_9fa48("3960") ? () => undefined : (stryCov_9fa48("3960"), (img): img is string => stryMutAct_9fa48("3963") ? img === undefined : stryMutAct_9fa48("3962") ? false : stryMutAct_9fa48("3961") ? true : (stryCov_9fa48("3961", "3962", "3963"), img !== undefined))))),
        category: this.cleanText(stryMutAct_9fa48("3966") ? raw.category && 'Uncategorized' : stryMutAct_9fa48("3965") ? false : stryMutAct_9fa48("3964") ? true : (stryCov_9fa48("3964", "3965", "3966"), raw.category || (stryMutAct_9fa48("3967") ? "" : (stryCov_9fa48("3967"), 'Uncategorized')))),
        productType: this.detectProductType(raw),
        attributes: this.normalizeAttributes(stryMutAct_9fa48("3970") ? raw.attributes && {} as Record<string, (string | undefined)[]> : stryMutAct_9fa48("3969") ? false : stryMutAct_9fa48("3968") ? true : (stryCov_9fa48("3968", "3969", "3970"), raw.attributes || {} as Record<string, (string | undefined)[]>)),
        variations: this.normalizeVariations(stryMutAct_9fa48("3973") ? raw.variations && [] : stryMutAct_9fa48("3972") ? false : stryMutAct_9fa48("3971") ? true : (stryCov_9fa48("3971", "3972", "3973"), raw.variations || (stryMutAct_9fa48("3974") ? ["Stryker was here"] : (stryCov_9fa48("3974"), [])))),
        regularPrice: this.cleanText(stryMutAct_9fa48("3977") ? raw.price && '' : stryMutAct_9fa48("3976") ? false : stryMutAct_9fa48("3975") ? true : (stryCov_9fa48("3975", "3976", "3977"), raw.price || (stryMutAct_9fa48("3978") ? "Stryker was here!" : (stryCov_9fa48("3978"), '')))),
        salePrice: this.cleanText(stryMutAct_9fa48("3981") ? raw.salePrice && '' : stryMutAct_9fa48("3980") ? false : stryMutAct_9fa48("3979") ? true : (stryCov_9fa48("3979", "3980", "3981"), raw.salePrice || (stryMutAct_9fa48("3982") ? "Stryker was here!" : (stryCov_9fa48("3982"), '')))),
        normalizedAt: new Date(),
        sourceUrl: url,
        confidence: 0.8 // Default confidence score
      });

      // Ensure parent SKU is unique and not equal to any variation SKU
      if (stryMutAct_9fa48("3985") ? result.productType === 'variable' || result.variations.length > 0 : stryMutAct_9fa48("3984") ? false : stryMutAct_9fa48("3983") ? true : (stryCov_9fa48("3983", "3984", "3985"), (stryMutAct_9fa48("3987") ? result.productType !== 'variable' : stryMutAct_9fa48("3986") ? true : (stryCov_9fa48("3986", "3987"), result.productType === (stryMutAct_9fa48("3988") ? "" : (stryCov_9fa48("3988"), 'variable')))) && (stryMutAct_9fa48("3991") ? result.variations.length <= 0 : stryMutAct_9fa48("3990") ? result.variations.length >= 0 : stryMutAct_9fa48("3989") ? true : (stryCov_9fa48("3989", "3990", "3991"), result.variations.length > 0)))) {
        if (stryMutAct_9fa48("3992")) {
          {}
        } else {
          stryCov_9fa48("3992");
          const variationSkus = new Set(result.variations.map(stryMutAct_9fa48("3993") ? () => undefined : (stryCov_9fa48("3993"), v => v.sku)));
          if (stryMutAct_9fa48("3995") ? false : stryMutAct_9fa48("3994") ? true : (stryCov_9fa48("3994", "3995"), variationSkus.has(result.sku))) {
            if (stryMutAct_9fa48("3996")) {
              {}
            } else {
              stryCov_9fa48("3996");
              const base = stryMutAct_9fa48("3999") ? result.sku && this.generateSku(url) : stryMutAct_9fa48("3998") ? false : stryMutAct_9fa48("3997") ? true : (stryCov_9fa48("3997", "3998", "3999"), result.sku || this.generateSku(url));
              // Append a suffix to make the parent SKU distinct
              result.sku = this.cleanSku(stryMutAct_9fa48("4000") ? `` : (stryCov_9fa48("4000"), `${base}-PARENT`));
            }
          }
        }
      }
      debug(stryMutAct_9fa48("4001") ? "" : (stryCov_9fa48("4001"), '🔍 DEBUG: normalizeProduct result:'), stryMutAct_9fa48("4002") ? {} : (stryCov_9fa48("4002"), {
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
    if (stryMutAct_9fa48("4003")) {
      {}
    } else {
      stryCov_9fa48("4003");
      if (stryMutAct_9fa48("4006") ? false : stryMutAct_9fa48("4005") ? true : stryMutAct_9fa48("4004") ? text : (stryCov_9fa48("4004", "4005", "4006"), !text)) return stryMutAct_9fa48("4007") ? "Stryker was here!" : (stryCov_9fa48("4007"), '');
      return stryMutAct_9fa48("4009") ? text

      // Decode percent encoding
      .replace(/%20/g, ' ').replace(/%2B/g, '+').replace(/%2F/g, '/').replace(/%3F/g, '?').replace(/%3D/g, '=').replace(/%26/g, '&')
      // Decode HTML entities
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, '\'').replace(/&nbsp;/g, ' ')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove placeholder text
      .replace(/(בחר אפשרות|בחירת אפשרות|Select option|Choose option)/gi, '').trim() : stryMutAct_9fa48("4008") ? text.trim()
      // Decode percent encoding
      .replace(/%20/g, ' ').replace(/%2B/g, '+').replace(/%2F/g, '/').replace(/%3F/g, '?').replace(/%3D/g, '=').replace(/%26/g, '&')
      // Decode HTML entities
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, '\'').replace(/&nbsp;/g, ' ')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove placeholder text
      .replace(/(בחר אפשרות|בחירת אפשרות|Select option|Choose option)/gi, '') : (stryCov_9fa48("4008", "4009"), text.trim()
      // Decode percent encoding
      .replace(/%20/g, stryMutAct_9fa48("4010") ? "" : (stryCov_9fa48("4010"), ' ')).replace(/%2B/g, stryMutAct_9fa48("4011") ? "" : (stryCov_9fa48("4011"), '+')).replace(/%2F/g, stryMutAct_9fa48("4012") ? "" : (stryCov_9fa48("4012"), '/')).replace(/%3F/g, stryMutAct_9fa48("4013") ? "" : (stryCov_9fa48("4013"), '?')).replace(/%3D/g, stryMutAct_9fa48("4014") ? "" : (stryCov_9fa48("4014"), '=')).replace(/%26/g, stryMutAct_9fa48("4015") ? "" : (stryCov_9fa48("4015"), '&'))
      // Decode HTML entities
      .replace(/&amp;/g, stryMutAct_9fa48("4016") ? "" : (stryCov_9fa48("4016"), '&')).replace(/&lt;/g, stryMutAct_9fa48("4017") ? "" : (stryCov_9fa48("4017"), '<')).replace(/&gt;/g, stryMutAct_9fa48("4018") ? "" : (stryCov_9fa48("4018"), '>')).replace(/&quot;/g, stryMutAct_9fa48("4019") ? "" : (stryCov_9fa48("4019"), '"')).replace(/&#39;/g, stryMutAct_9fa48("4020") ? "" : (stryCov_9fa48("4020"), '\'')).replace(/&nbsp;/g, stryMutAct_9fa48("4021") ? "" : (stryCov_9fa48("4021"), ' '))
      // Remove extra whitespace
      .replace(stryMutAct_9fa48("4023") ? /\S+/g : stryMutAct_9fa48("4022") ? /\s/g : (stryCov_9fa48("4022", "4023"), /\s+/g), stryMutAct_9fa48("4024") ? "" : (stryCov_9fa48("4024"), ' '))
      // Remove placeholder text
      .replace(/(בחר אפשרות|בחירת אפשרות|Select option|Choose option)/gi, stryMutAct_9fa48("4025") ? "Stryker was here!" : (stryCov_9fa48("4025"), '')).trim());
    }
  }

  /**
   * Generate a clean SKU
   */
  static cleanSku(sku: string): string {
    if (stryMutAct_9fa48("4026")) {
      {}
    } else {
      stryCov_9fa48("4026");
      if (stryMutAct_9fa48("4029") ? false : stryMutAct_9fa48("4028") ? true : stryMutAct_9fa48("4027") ? sku : (stryCov_9fa48("4027", "4028", "4029"), !sku)) return stryMutAct_9fa48("4030") ? "Stryker was here!" : (stryCov_9fa48("4030"), '');
      return stryMutAct_9fa48("4032") ? sku.replace(/[^a-zA-Z0-9\-_]/g, '').toUpperCase() : stryMutAct_9fa48("4031") ? sku.trim().replace(/[^a-zA-Z0-9\-_]/g, '').toLowerCase() : (stryCov_9fa48("4031", "4032"), sku.trim().replace(stryMutAct_9fa48("4033") ? /[a-zA-Z0-9\-_]/g : (stryCov_9fa48("4033"), /[^a-zA-Z0-9\-_]/g), stryMutAct_9fa48("4034") ? "Stryker was here!" : (stryCov_9fa48("4034"), '')).toUpperCase());
    }
  }

  /**
   * Generate SKU from URL if none provided
   */
  static generateSku(url: string): string {
    if (stryMutAct_9fa48("4035")) {
      {}
    } else {
      stryCov_9fa48("4035");
      const urlParts = url.split(stryMutAct_9fa48("4036") ? "" : (stryCov_9fa48("4036"), '/'));
      const lastPart = urlParts[stryMutAct_9fa48("4037") ? urlParts.length + 1 : (stryCov_9fa48("4037"), urlParts.length - 1)];
      return stryMutAct_9fa48("4040") ? lastPart?.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() && 'PRODUCT' : stryMutAct_9fa48("4039") ? false : stryMutAct_9fa48("4038") ? true : (stryCov_9fa48("4038", "4039", "4040"), (stryMutAct_9fa48("4042") ? lastPart.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : stryMutAct_9fa48("4041") ? lastPart?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : (stryCov_9fa48("4041", "4042"), lastPart?.replace(stryMutAct_9fa48("4043") ? /[a-zA-Z0-9]/g : (stryCov_9fa48("4043"), /[^a-zA-Z0-9]/g), stryMutAct_9fa48("4044") ? "Stryker was here!" : (stryCov_9fa48("4044"), '')).toUpperCase())) || (stryMutAct_9fa48("4045") ? "" : (stryCov_9fa48("4045"), 'PRODUCT')));
    }
  }

  /**
   * Generate slug from title
   */
  static generateSlug(title: string): string {
    if (stryMutAct_9fa48("4046")) {
      {}
    } else {
      stryCov_9fa48("4046");
      // Preserve Unicode letters/numbers (incl. Hebrew), strip punctuation, collapse spaces -> dashes
      const unicodeSlug = stryMutAct_9fa48("4048") ? title.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}\s-]+/gu, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') : stryMutAct_9fa48("4047") ? title.trim().toUpperCase().normalize('NFKC').replace(/[^\p{L}\p{N}\s-]+/gu, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') : (stryCov_9fa48("4047", "4048"), title.trim().toLowerCase().normalize(stryMutAct_9fa48("4049") ? "" : (stryCov_9fa48("4049"), 'NFKC')).replace(stryMutAct_9fa48("4054") ? /[^\p{L}\p{N}\S-]+/gu : stryMutAct_9fa48("4053") ? /[^\p{L}\P{N}\s-]+/gu : stryMutAct_9fa48("4052") ? /[^\P{L}\p{N}\s-]+/gu : stryMutAct_9fa48("4051") ? /[\p{L}\p{N}\s-]+/gu : stryMutAct_9fa48("4050") ? /[^\p{L}\p{N}\s-]/gu : (stryCov_9fa48("4050", "4051", "4052", "4053", "4054"), /[^\p{L}\p{N}\s-]+/gu), stryMutAct_9fa48("4055") ? "Stryker was here!" : (stryCov_9fa48("4055"), '')).replace(stryMutAct_9fa48("4057") ? /\S+/g : stryMutAct_9fa48("4056") ? /\s/g : (stryCov_9fa48("4056", "4057"), /\s+/g), stryMutAct_9fa48("4058") ? "" : (stryCov_9fa48("4058"), '-')).replace(stryMutAct_9fa48("4059") ? /-/g : (stryCov_9fa48("4059"), /-+/g), stryMutAct_9fa48("4060") ? "" : (stryCov_9fa48("4060"), '-')).replace(stryMutAct_9fa48("4062") ? /^-|-/g : stryMutAct_9fa48("4061") ? /-|-$/g : (stryCov_9fa48("4061", "4062"), /^-|-$/g), stryMutAct_9fa48("4063") ? "Stryker was here!" : (stryCov_9fa48("4063"), '')));
      return unicodeSlug;
    }
  }

  /**
   * Normalize stock status
   */
  static normalizeStockStatus(status?: string): 'instock' | 'outofstock' {
    if (stryMutAct_9fa48("4064")) {
      {}
    } else {
      stryCov_9fa48("4064");
      if (stryMutAct_9fa48("4067") ? false : stryMutAct_9fa48("4066") ? true : stryMutAct_9fa48("4065") ? status : (stryCov_9fa48("4065", "4066", "4067"), !status)) return stryMutAct_9fa48("4068") ? "" : (stryCov_9fa48("4068"), 'instock');
      const normalized = stryMutAct_9fa48("4070") ? status.toUpperCase().trim() : stryMutAct_9fa48("4069") ? status.toLowerCase() : (stryCov_9fa48("4069", "4070"), status.toLowerCase().trim());
      if (stryMutAct_9fa48("4073") ? (normalized.includes('out') || normalized.includes('unavailable')) && normalized.includes('0') : stryMutAct_9fa48("4072") ? false : stryMutAct_9fa48("4071") ? true : (stryCov_9fa48("4071", "4072", "4073"), (stryMutAct_9fa48("4075") ? normalized.includes('out') && normalized.includes('unavailable') : stryMutAct_9fa48("4074") ? false : (stryCov_9fa48("4074", "4075"), normalized.includes(stryMutAct_9fa48("4076") ? "" : (stryCov_9fa48("4076"), 'out')) || normalized.includes(stryMutAct_9fa48("4077") ? "" : (stryCov_9fa48("4077"), 'unavailable')))) || normalized.includes(stryMutAct_9fa48("4078") ? "" : (stryCov_9fa48("4078"), '0')))) {
        if (stryMutAct_9fa48("4079")) {
          {}
        } else {
          stryCov_9fa48("4079");
          return stryMutAct_9fa48("4080") ? "" : (stryCov_9fa48("4080"), 'outofstock');
        }
      }
      return stryMutAct_9fa48("4081") ? "" : (stryCov_9fa48("4081"), 'instock');
    }
  }

  /**
   * Normalize image URLs to absolute URLs
   */
  static normalizeImages(images: string[], baseUrl?: string): string[] {
    if (stryMutAct_9fa48("4082")) {
      {}
    } else {
      stryCov_9fa48("4082");
      if (stryMutAct_9fa48("4085") ? !images && images.length === 0 : stryMutAct_9fa48("4084") ? false : stryMutAct_9fa48("4083") ? true : (stryCov_9fa48("4083", "4084", "4085"), (stryMutAct_9fa48("4086") ? images : (stryCov_9fa48("4086"), !images)) || (stryMutAct_9fa48("4088") ? images.length !== 0 : stryMutAct_9fa48("4087") ? false : (stryCov_9fa48("4087", "4088"), images.length === 0)))) return stryMutAct_9fa48("4089") ? ["Stryker was here"] : (stryCov_9fa48("4089"), []);
      return stryMutAct_9fa48("4091") ? images.map(img => {
        if (img.startsWith('http')) return img;
        if (baseUrl && img.startsWith('/')) {
          const url = new URL(baseUrl);
          return `${url.protocol}//${url.host}${img}`;
        }
        return img;
      }).filter(img => img.startsWith('http')) : stryMutAct_9fa48("4090") ? images.filter(img => img && img.trim()).map(img => {
        if (img.startsWith('http')) return img;
        if (baseUrl && img.startsWith('/')) {
          const url = new URL(baseUrl);
          return `${url.protocol}//${url.host}${img}`;
        }
        return img;
      }) : (stryCov_9fa48("4090", "4091"), images.filter(stryMutAct_9fa48("4092") ? () => undefined : (stryCov_9fa48("4092"), img => stryMutAct_9fa48("4095") ? img || img.trim() : stryMutAct_9fa48("4094") ? false : stryMutAct_9fa48("4093") ? true : (stryCov_9fa48("4093", "4094", "4095"), img && (stryMutAct_9fa48("4096") ? img : (stryCov_9fa48("4096"), img.trim()))))).map(img => {
        if (stryMutAct_9fa48("4097")) {
          {}
        } else {
          stryCov_9fa48("4097");
          if (stryMutAct_9fa48("4100") ? img.endsWith('http') : stryMutAct_9fa48("4099") ? false : stryMutAct_9fa48("4098") ? true : (stryCov_9fa48("4098", "4099", "4100"), img.startsWith(stryMutAct_9fa48("4101") ? "" : (stryCov_9fa48("4101"), 'http')))) return img;
          if (stryMutAct_9fa48("4104") ? baseUrl || img.startsWith('/') : stryMutAct_9fa48("4103") ? false : stryMutAct_9fa48("4102") ? true : (stryCov_9fa48("4102", "4103", "4104"), baseUrl && (stryMutAct_9fa48("4105") ? img.endsWith('/') : (stryCov_9fa48("4105"), img.startsWith(stryMutAct_9fa48("4106") ? "" : (stryCov_9fa48("4106"), '/')))))) {
            if (stryMutAct_9fa48("4107")) {
              {}
            } else {
              stryCov_9fa48("4107");
              const url = new URL(baseUrl);
              return stryMutAct_9fa48("4108") ? `` : (stryCov_9fa48("4108"), `${url.protocol}//${url.host}${img}`);
            }
          }
          return img;
        }
      }).filter(stryMutAct_9fa48("4109") ? () => undefined : (stryCov_9fa48("4109"), img => stryMutAct_9fa48("4110") ? img.endsWith('http') : (stryCov_9fa48("4110"), img.startsWith(stryMutAct_9fa48("4111") ? "" : (stryCov_9fa48("4111"), 'http'))))));
    }
  }

  /**
   * Detect product type (simple vs variable) with proper generic constraints
   */
  static detectProductType<T extends NormalizableProductData>(raw: T): 'simple' | 'variable' {
    if (stryMutAct_9fa48("4112")) {
      {}
    } else {
      stryCov_9fa48("4112");
      debug(stryMutAct_9fa48("4113") ? "" : (stryCov_9fa48("4113"), '🔍 DEBUG: detectProductType called with raw product:'), stryMutAct_9fa48("4114") ? {} : (stryCov_9fa48("4114"), {
        hasVariations: stryMutAct_9fa48("4115") ? !raw.variations : (stryCov_9fa48("4115"), !(stryMutAct_9fa48("4116") ? raw.variations : (stryCov_9fa48("4116"), !raw.variations))),
        variationsLength: stryMutAct_9fa48("4119") ? raw.variations?.length && 0 : stryMutAct_9fa48("4118") ? false : stryMutAct_9fa48("4117") ? true : (stryCov_9fa48("4117", "4118", "4119"), (stryMutAct_9fa48("4120") ? raw.variations.length : (stryCov_9fa48("4120"), raw.variations?.length)) || 0),
        hasAttributes: stryMutAct_9fa48("4121") ? !raw.attributes : (stryCov_9fa48("4121"), !(stryMutAct_9fa48("4122") ? raw.attributes : (stryCov_9fa48("4122"), !raw.attributes))),
        attributesKeys: raw.attributes ? Object.keys(raw.attributes) : stryMutAct_9fa48("4123") ? ["Stryker was here"] : (stryCov_9fa48("4123"), []),
        attributesValues: raw.attributes ? Object.values(raw.attributes) : stryMutAct_9fa48("4124") ? ["Stryker was here"] : (stryCov_9fa48("4124"), [])
      }));

      // If we already have parsed variations (e.g., from WooCommerce JSON), treat as variable
      if (stryMutAct_9fa48("4127") ? raw.variations || raw.variations.length > 0 : stryMutAct_9fa48("4126") ? false : stryMutAct_9fa48("4125") ? true : (stryCov_9fa48("4125", "4126", "4127"), raw.variations && (stryMutAct_9fa48("4130") ? raw.variations.length <= 0 : stryMutAct_9fa48("4129") ? raw.variations.length >= 0 : stryMutAct_9fa48("4128") ? true : (stryCov_9fa48("4128", "4129", "4130"), raw.variations.length > 0)))) {
        if (stryMutAct_9fa48("4131")) {
          {}
        } else {
          stryCov_9fa48("4131");
          debug(stryMutAct_9fa48("4132") ? "" : (stryCov_9fa48("4132"), '✅ DEBUG: Product type = variable (has parsed variations)'));
          return stryMutAct_9fa48("4133") ? "" : (stryCov_9fa48("4133"), 'variable');
        }
      }

      // Don't mark as variable just because of multiple attribute values
      if (stryMutAct_9fa48("4136") ? raw.attributes || Object.keys(raw.attributes).length > 0 : stryMutAct_9fa48("4135") ? false : stryMutAct_9fa48("4134") ? true : (stryCov_9fa48("4134", "4135", "4136"), raw.attributes && (stryMutAct_9fa48("4139") ? Object.keys(raw.attributes).length <= 0 : stryMutAct_9fa48("4138") ? Object.keys(raw.attributes).length >= 0 : stryMutAct_9fa48("4137") ? true : (stryCov_9fa48("4137", "4138", "4139"), Object.keys(raw.attributes).length > 0)))) {
        if (stryMutAct_9fa48("4140")) {
          {}
        } else {
          stryCov_9fa48("4140");
          debug(stryMutAct_9fa48("4141") ? "" : (stryCov_9fa48("4141"), 'ℹ️ DEBUG: Product has attributes but no variations - treating as simple'));
          return stryMutAct_9fa48("4142") ? "" : (stryCov_9fa48("4142"), 'simple');
        }
      }
      debug(stryMutAct_9fa48("4143") ? "" : (stryCov_9fa48("4143"), '❌ DEBUG: Product type = simple (no variations or attributes)'));
      return stryMutAct_9fa48("4144") ? "" : (stryCov_9fa48("4144"), 'simple');
    }
  }

  /**
   * Normalize product attributes
   */
  static normalizeAttributes(attributes: Record<string, (string | undefined)[]>): Record<string, string[]> {
    if (stryMutAct_9fa48("4145")) {
      {}
    } else {
      stryCov_9fa48("4145");
      debug(stryMutAct_9fa48("4146") ? "" : (stryCov_9fa48("4146"), '🔍 DEBUG: normalizeAttributes called with:'), attributes);
      const normalized: Record<string, string[]> = {};
      for (const [key, values] of Object.entries(attributes)) {
        if (stryMutAct_9fa48("4147")) {
          {}
        } else {
          stryCov_9fa48("4147");
          debug(stryMutAct_9fa48("4148") ? "" : (stryCov_9fa48("4148"), '🔍 DEBUG: Processing attribute:'), key, stryMutAct_9fa48("4149") ? "" : (stryCov_9fa48("4149"), 'values:'), values);
          if (stryMutAct_9fa48("4152") ? !values && values.length === 0 : stryMutAct_9fa48("4151") ? false : stryMutAct_9fa48("4150") ? true : (stryCov_9fa48("4150", "4151", "4152"), (stryMutAct_9fa48("4153") ? values : (stryCov_9fa48("4153"), !values)) || (stryMutAct_9fa48("4155") ? values.length !== 0 : stryMutAct_9fa48("4154") ? false : (stryCov_9fa48("4154", "4155"), values.length === 0)))) {
            if (stryMutAct_9fa48("4156")) {
              {}
            } else {
              stryCov_9fa48("4156");
              debug(stryMutAct_9fa48("4157") ? "" : (stryCov_9fa48("4157"), '❌ DEBUG: Skipping empty attribute:'), key);
              continue;
            }
          }
          const cleanKey = this.cleanAttributeName(key);
          const cleanValues = stryMutAct_9fa48("4159") ? values.map(value => this.cleanText(value)).filter(value => value && !this.isPlaceholder(value)) : stryMutAct_9fa48("4158") ? values.filter((value): value is string => value !== undefined).map(value => this.cleanText(value)) : (stryCov_9fa48("4158", "4159"), values.filter(stryMutAct_9fa48("4160") ? () => undefined : (stryCov_9fa48("4160"), (value): value is string => stryMutAct_9fa48("4163") ? value === undefined : stryMutAct_9fa48("4162") ? false : stryMutAct_9fa48("4161") ? true : (stryCov_9fa48("4161", "4162", "4163"), value !== undefined))).map(stryMutAct_9fa48("4164") ? () => undefined : (stryCov_9fa48("4164"), value => this.cleanText(value))).filter(stryMutAct_9fa48("4165") ? () => undefined : (stryCov_9fa48("4165"), value => stryMutAct_9fa48("4168") ? value || !this.isPlaceholder(value) : stryMutAct_9fa48("4167") ? false : stryMutAct_9fa48("4166") ? true : (stryCov_9fa48("4166", "4167", "4168"), value && (stryMutAct_9fa48("4169") ? this.isPlaceholder(value) : (stryCov_9fa48("4169"), !this.isPlaceholder(value)))))));
          debug(stryMutAct_9fa48("4170") ? "" : (stryCov_9fa48("4170"), '🔍 DEBUG: Cleaned attribute:'), cleanKey, stryMutAct_9fa48("4171") ? "" : (stryCov_9fa48("4171"), 'cleanValues:'), cleanValues);
          if (stryMutAct_9fa48("4175") ? cleanValues.length <= 0 : stryMutAct_9fa48("4174") ? cleanValues.length >= 0 : stryMutAct_9fa48("4173") ? false : stryMutAct_9fa48("4172") ? true : (stryCov_9fa48("4172", "4173", "4174", "4175"), cleanValues.length > 0)) {
            if (stryMutAct_9fa48("4176")) {
              {}
            } else {
              stryCov_9fa48("4176");
              normalized[cleanKey] = cleanValues;
              debug(stryMutAct_9fa48("4177") ? "" : (stryCov_9fa48("4177"), '✅ DEBUG: Added normalized attribute:'), cleanKey, stryMutAct_9fa48("4178") ? "" : (stryCov_9fa48("4178"), '='), cleanValues);
            }
          } else {
            if (stryMutAct_9fa48("4179")) {
              {}
            } else {
              stryCov_9fa48("4179");
              debug(stryMutAct_9fa48("4180") ? "" : (stryCov_9fa48("4180"), '❌ DEBUG: No clean values for attribute:'), cleanKey);
            }
          }
        }
      }
      debug(stryMutAct_9fa48("4181") ? "" : (stryCov_9fa48("4181"), '🔍 DEBUG: Final normalized attributes:'), normalized);
      return normalized;
    }
  }

  /**
   * Clean attribute names
   */
  static cleanAttributeName(name: string): string {
    if (stryMutAct_9fa48("4182")) {
      {}
    } else {
      stryCov_9fa48("4182");
      return stryMutAct_9fa48("4184") ? name

      // Remove WooCommerce prefixes
      .replace(/^(pa_|attribute_)/, '')
      // Decode percent encoding
      .replace(/%20/g, ' ').replace(/%2B/g, '+')
      // Capitalize first letter (preserve Hebrew)
      .replace(/^([a-z])/, match => match.toUpperCase()).trim() : stryMutAct_9fa48("4183") ? name.trim()
      // Remove WooCommerce prefixes
      .replace(/^(pa_|attribute_)/, '')
      // Decode percent encoding
      .replace(/%20/g, ' ').replace(/%2B/g, '+')
      // Capitalize first letter (preserve Hebrew)
      .replace(/^([a-z])/, match => match.toUpperCase()) : (stryCov_9fa48("4183", "4184"), name.trim()
      // Remove WooCommerce prefixes
      .replace(stryMutAct_9fa48("4185") ? /(pa_|attribute_)/ : (stryCov_9fa48("4185"), /^(pa_|attribute_)/), stryMutAct_9fa48("4186") ? "Stryker was here!" : (stryCov_9fa48("4186"), ''))
      // Decode percent encoding
      .replace(/%20/g, stryMutAct_9fa48("4187") ? "" : (stryCov_9fa48("4187"), ' ')).replace(/%2B/g, stryMutAct_9fa48("4188") ? "" : (stryCov_9fa48("4188"), '+'))
      // Capitalize first letter (preserve Hebrew)
      .replace(stryMutAct_9fa48("4190") ? /^([^a-z])/ : stryMutAct_9fa48("4189") ? /([a-z])/ : (stryCov_9fa48("4189", "4190"), /^([a-z])/), stryMutAct_9fa48("4191") ? () => undefined : (stryCov_9fa48("4191"), match => stryMutAct_9fa48("4192") ? match.toLowerCase() : (stryCov_9fa48("4192"), match.toUpperCase()))).trim());
    }
  }

  /**
   * Check if text is a placeholder
   */
  static isPlaceholder(text: string): boolean {
    if (stryMutAct_9fa48("4193")) {
      {}
    } else {
      stryCov_9fa48("4193");
      debug(stryMutAct_9fa48("4194") ? "" : (stryCov_9fa48("4194"), '🔍 DEBUG: Checking if text is placeholder:'), text);
      const placeholders = stryMutAct_9fa48("4195") ? [] : (stryCov_9fa48("4195"), [stryMutAct_9fa48("4196") ? "" : (stryCov_9fa48("4196"), 'בחר אפשרות'), stryMutAct_9fa48("4197") ? "" : (stryCov_9fa48("4197"), 'בחירת אפשרות'), stryMutAct_9fa48("4198") ? "" : (stryCov_9fa48("4198"), 'Select option'), stryMutAct_9fa48("4199") ? "" : (stryCov_9fa48("4199"), 'Choose option'), stryMutAct_9fa48("4200") ? "" : (stryCov_9fa48("4200"), 'בחר גודל'), stryMutAct_9fa48("4201") ? "" : (stryCov_9fa48("4201"), 'בחר צבע'), stryMutAct_9fa48("4202") ? "" : (stryCov_9fa48("4202"), 'בחר מודל'), stryMutAct_9fa48("4203") ? "" : (stryCov_9fa48("4203"), 'Select size'), stryMutAct_9fa48("4204") ? "" : (stryCov_9fa48("4204"), 'Select color'), stryMutAct_9fa48("4205") ? "" : (stryCov_9fa48("4205"), 'Select model'), stryMutAct_9fa48("4206") ? "" : (stryCov_9fa48("4206"), 'General'), // Common in WooCommerce
      stryMutAct_9fa48("4207") ? "" : (stryCov_9fa48("4207"), 'בחירת אפשרות'), // Hebrew "Choose option"
      stryMutAct_9fa48("4208") ? "" : (stryCov_9fa48("4208"), 'בחירת אפשרותA - רינבוקורן Lets Go'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4209") ? "" : (stryCov_9fa48("4209"), 'בחירת אפשרותB - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4210") ? "" : (stryCov_9fa48("4210"), 'בחירת אפשרותC - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4211") ? "" : (stryCov_9fa48("4211"), 'בחירת אפשרותD - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4212") ? "" : (stryCov_9fa48("4212"), 'בחירת אפשרותE - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4213") ? "" : (stryCov_9fa48("4213"), 'בחירת אפשרותF - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4214") ? "" : (stryCov_9fa48("4214"), 'בחירת אפשרותG - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4215") ? "" : (stryCov_9fa48("4215"), 'בחירת אפשרותH - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4216") ? "" : (stryCov_9fa48("4216"), 'בחירת אפשרותI - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4217") ? "" : (stryCov_9fa48("4217"), 'בחירת אפשרותJ - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4218") ? "" : (stryCov_9fa48("4218"), 'בחירת אפשרותK - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4219") ? "" : (stryCov_9fa48("4219"), 'בחירת אפשרותL - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4220") ? "" : (stryCov_9fa48("4220"), 'בחירת אפשרותM - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4221") ? "" : (stryCov_9fa48("4221"), 'בחירת אפשרותN - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4222") ? "" : (stryCov_9fa48("4222"), 'בחירת אפשרותO - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4223") ? "" : (stryCov_9fa48("4223"), 'בחירת אפשרותP - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4224") ? "" : (stryCov_9fa48("4224"), 'בחירת אפשרותQ - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4225") ? "" : (stryCov_9fa48("4225"), 'בחירת אפשרותR - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4226") ? "" : (stryCov_9fa48("4226"), 'בחירת אפשרותS - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4227") ? "" : (stryCov_9fa48("4227"), 'בחירת אפשרותT - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4228") ? "" : (stryCov_9fa48("4228"), 'בחירת אפשרותU - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4229") ? "" : (stryCov_9fa48("4229"), 'בחירת אפשרותV - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4230") ? "" : (stryCov_9fa48("4230"), 'בחירת אפשרותW - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4231") ? "" : (stryCov_9fa48("4231"), 'בחירת אפשרותX - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4232") ? "" : (stryCov_9fa48("4232"), 'בחירת אפשרותY - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4233") ? "" : (stryCov_9fa48("4233"), 'בחירת אפשרותZ - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4234") ? "" : (stryCov_9fa48("4234"), 'בחירת אפשרות0 - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4235") ? "" : (stryCov_9fa48("4235"), 'בחירת אפשרות1 - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4236") ? "" : (stryCov_9fa48("4236"), 'בחירת אפשרות2 - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4237") ? "" : (stryCov_9fa48("4237"), 'בחירת אפשרות3 - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4238") ? "" : (stryCov_9fa48("4238"), 'בחירת אפשרות4 - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4239") ? "" : (stryCov_9fa48("4239"), 'בחירת אפשרות5 - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4240") ? "" : (stryCov_9fa48("4240"), 'בחירת אפשרות6 - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4241") ? "" : (stryCov_9fa48("4241"), 'בחירת אפשרות7 - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4242") ? "" : (stryCov_9fa48("4242"), 'בחירת אפשרות8 - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4243") ? "" : (stryCov_9fa48("4243"), 'בחירת אפשרות9 - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4244") ? "" : (stryCov_9fa48("4244"), 'בחירת אפשרותא - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4245") ? "" : (stryCov_9fa48("4245"), 'בחירת אפשרותב - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4246") ? "" : (stryCov_9fa48("4246"), 'בחירת אפשרותג - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4247") ? "" : (stryCov_9fa48("4247"), 'בחירת אפשרותד - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4248") ? "" : (stryCov_9fa48("4248"), 'בחירת אפשרותה - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4249") ? "" : (stryCov_9fa48("4249"), 'בחירת אפשרותו - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4250") ? "" : (stryCov_9fa48("4250"), 'בחירת אפשרותז - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4251") ? "" : (stryCov_9fa48("4251"), 'בחירת אפשרותח - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4252") ? "" : (stryCov_9fa48("4252"), 'בחירת אפשרותט - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4253") ? "" : (stryCov_9fa48("4253"), 'בחירת אפשרותי - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4254") ? "" : (stryCov_9fa48("4254"), 'בחירת אפשרותכ - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4255") ? "" : (stryCov_9fa48("4255"), 'בחירת אפשרותל - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4256") ? "" : (stryCov_9fa48("4256"), 'בחירת אפשרותמ - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4257") ? "" : (stryCov_9fa48("4257"), 'בחירת אפשרותנ - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4258") ? "" : (stryCov_9fa48("4258"), 'בחירת אפשרותס - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4259") ? "" : (stryCov_9fa48("4259"), 'בחירת אפשרותע - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4260") ? "" : (stryCov_9fa48("4260"), 'בחירת אפשרותפ - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4261") ? "" : (stryCov_9fa48("4261"), 'בחירת אפשרותצ - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4262") ? "" : (stryCov_9fa48("4262"), 'בחירת אפשרותק - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4263") ? "" : (stryCov_9fa48("4263"), 'בחירת אפשרותר - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4264") ? "" : (stryCov_9fa48("4264"), 'בחירת אפשרותש - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4265") ? "" : (stryCov_9fa48("4265"), 'בחירת אפשרותת - ריינבוקורן דמויות כחול'), // Specific from modanbags.co.il
      stryMutAct_9fa48("4266") ? "" : (stryCov_9fa48("4266"), 'בחירת אפשרותא'), // Hebrew with option prefix
      stryMutAct_9fa48("4267") ? "" : (stryCov_9fa48("4267"), 'בחירת אפשרותB'), // Hebrew with option prefix
      stryMutAct_9fa48("4268") ? "" : (stryCov_9fa48("4268"), 'בחירת אפשרותC'), // Hebrew with option prefix
      stryMutAct_9fa48("4269") ? "" : (stryCov_9fa48("4269"), 'בחירת אפשרותD'), // Hebrew with option prefix
      stryMutAct_9fa48("4270") ? "" : (stryCov_9fa48("4270"), 'בחירת אפשרותE'), // Hebrew with option prefix
      stryMutAct_9fa48("4271") ? "" : (stryCov_9fa48("4271"), 'בחירת אפשרותF'), // Hebrew with option prefix
      stryMutAct_9fa48("4272") ? "" : (stryCov_9fa48("4272"), 'בחירת אפשרותG'), // Hebrew with option prefix
      stryMutAct_9fa48("4273") ? "" : (stryCov_9fa48("4273"), 'בחירת אפשרותH'), // Hebrew with option prefix
      stryMutAct_9fa48("4274") ? "" : (stryCov_9fa48("4274"), 'בחירת אפשרותI'), // Hebrew with option prefix
      stryMutAct_9fa48("4275") ? "" : (stryCov_9fa48("4275"), 'בחירת אפשרותJ'), // Hebrew with option prefix
      stryMutAct_9fa48("4276") ? "" : (stryCov_9fa48("4276"), 'בחירת אפשרותK'), // Hebrew with option prefix
      stryMutAct_9fa48("4277") ? "" : (stryCov_9fa48("4277"), 'בחירת אפשרותL'), // Hebrew with option prefix
      stryMutAct_9fa48("4278") ? "" : (stryCov_9fa48("4278"), 'בחירת אפשרותM'), // Hebrew with option prefix
      stryMutAct_9fa48("4279") ? "" : (stryCov_9fa48("4279"), 'בחירת אפשרותN'), // Hebrew with option prefix
      stryMutAct_9fa48("4280") ? "" : (stryCov_9fa48("4280"), 'בחירת אפשרותO'), // Hebrew with option prefix
      stryMutAct_9fa48("4281") ? "" : (stryCov_9fa48("4281"), 'בחירת אפשרותP'), // Hebrew with option prefix
      stryMutAct_9fa48("4282") ? "" : (stryCov_9fa48("4282"), 'בחירת אפשרותQ'), // Hebrew with option prefix
      stryMutAct_9fa48("4283") ? "" : (stryCov_9fa48("4283"), 'בחירת אפשרותR'), // Hebrew with option prefix
      stryMutAct_9fa48("4284") ? "" : (stryCov_9fa48("4284"), 'בחירת אפשרותS'), // Hebrew with option prefix
      stryMutAct_9fa48("4285") ? "" : (stryCov_9fa48("4285"), 'בחירת אפשרותT'), // Hebrew with option prefix
      stryMutAct_9fa48("4286") ? "" : (stryCov_9fa48("4286"), 'בחירת אפשרותU'), // Hebrew with option prefix
      stryMutAct_9fa48("4287") ? "" : (stryCov_9fa48("4287"), 'בחירת אפשרותV'), // Hebrew with option prefix
      stryMutAct_9fa48("4288") ? "" : (stryCov_9fa48("4288"), 'בחירת אפשרותW'), // Hebrew with option prefix
      stryMutAct_9fa48("4289") ? "" : (stryCov_9fa48("4289"), 'בחירת אפשרותX'), // Hebrew with option prefix
      stryMutAct_9fa48("4290") ? "" : (stryCov_9fa48("4290"), 'בחירת אפשרותY'), // Hebrew with option prefix
      stryMutAct_9fa48("4291") ? "" : (stryCov_9fa48("4291"), 'בחירת אפשרותZ'), // Hebrew with option prefix
      stryMutAct_9fa48("4292") ? "" : (stryCov_9fa48("4292"), 'בחירת אפשרות0'), // Hebrew with option prefix
      stryMutAct_9fa48("4293") ? "" : (stryCov_9fa48("4293"), 'בחירת אפשרות1'), // Hebrew with option prefix
      stryMutAct_9fa48("4294") ? "" : (stryCov_9fa48("4294"), 'בחירת אפשרות2'), // Hebrew with option prefix
      stryMutAct_9fa48("4295") ? "" : (stryCov_9fa48("4295"), 'בחירת אפשרות3'), // Hebrew with option prefix
      stryMutAct_9fa48("4296") ? "" : (stryCov_9fa48("4296"), 'בחירת אפשרות4'), // Hebrew with option prefix
      stryMutAct_9fa48("4297") ? "" : (stryCov_9fa48("4297"), 'בחירת אפשרות5'), // Hebrew with option prefix
      stryMutAct_9fa48("4298") ? "" : (stryCov_9fa48("4298"), 'בחירת אפשרות6'), // Hebrew with option prefix
      stryMutAct_9fa48("4299") ? "" : (stryCov_9fa48("4299"), 'בחירת אפשרות7'), // Hebrew with option prefix
      stryMutAct_9fa48("4300") ? "" : (stryCov_9fa48("4300"), 'בחירת אפשרות8'), // Hebrew with option prefix
      stryMutAct_9fa48("4301") ? "" : (stryCov_9fa48("4301"), 'בחירת אפשרות9'), // Hebrew with option prefix
      stryMutAct_9fa48("4302") ? "" : (stryCov_9fa48("4302"), 'בחירת אפשרותא'), // Hebrew with option prefix
      stryMutAct_9fa48("4303") ? "" : (stryCov_9fa48("4303"), 'בחירת אפשרותב'), // Hebrew with option prefix
      stryMutAct_9fa48("4304") ? "" : (stryCov_9fa48("4304"), 'בחירת אפשרותג'), // Hebrew with option prefix
      stryMutAct_9fa48("4305") ? "" : (stryCov_9fa48("4305"), 'בחירת אפשרותד'), // Hebrew with option prefix
      stryMutAct_9fa48("4306") ? "" : (stryCov_9fa48("4306"), 'בחירת אפשרותה'), // Hebrew with option prefix
      stryMutAct_9fa48("4307") ? "" : (stryCov_9fa48("4307"), 'בחירת אפשרותו'), // Hebrew with option prefix
      stryMutAct_9fa48("4308") ? "" : (stryCov_9fa48("4308"), 'בחירת אפשרותז'), // Hebrew with option prefix
      stryMutAct_9fa48("4309") ? "" : (stryCov_9fa48("4309"), 'בחירת אפשרותח'), // Hebrew with option prefix
      stryMutAct_9fa48("4310") ? "" : (stryCov_9fa48("4310"), 'בחירת אפשרותט'), // Hebrew with option prefix
      stryMutAct_9fa48("4311") ? "" : (stryCov_9fa48("4311"), 'בחירת אפשרותי'), // Hebrew with option prefix
      stryMutAct_9fa48("4312") ? "" : (stryCov_9fa48("4312"), 'בחירת אפשרותכ'), // Hebrew with option prefix
      stryMutAct_9fa48("4313") ? "" : (stryCov_9fa48("4313"), 'בחירת אפשרותל'), // Hebrew with option prefix
      stryMutAct_9fa48("4314") ? "" : (stryCov_9fa48("4314"), 'בחירת אפשרותמ'), // Hebrew with option prefix
      stryMutAct_9fa48("4315") ? "" : (stryCov_9fa48("4315"), 'בחירת אפשרותנ'), // Hebrew with option prefix
      stryMutAct_9fa48("4316") ? "" : (stryCov_9fa48("4316"), 'בחירת אפשרותס'), // Hebrew with option prefix
      stryMutAct_9fa48("4317") ? "" : (stryCov_9fa48("4317"), 'בחירת אפשרותע'), // Hebrew with option prefix
      stryMutAct_9fa48("4318") ? "" : (stryCov_9fa48("4318"), 'בחירת אפשרותפ'), // Hebrew with option prefix
      stryMutAct_9fa48("4319") ? "" : (stryCov_9fa48("4319"), 'בחירת אפשרותצ'), // Hebrew with option prefix
      stryMutAct_9fa48("4320") ? "" : (stryCov_9fa48("4320"), 'בחירת אפשרותק'), // Hebrew with option prefix
      stryMutAct_9fa48("4321") ? "" : (stryCov_9fa48("4321"), 'בחירת אפשרותר'), // Hebrew with option prefix
      stryMutAct_9fa48("4322") ? "" : (stryCov_9fa48("4322"), 'בחירת אפשרותש'), // Hebrew with option prefix
      stryMutAct_9fa48("4323") ? "" : (stryCov_9fa48("4323"), 'בחירת אפשרותת'), // Hebrew with option prefix
      stryMutAct_9fa48("4324") ? "" : (stryCov_9fa48("4324"), 'בחירת אפשרותא'), // Hebrew with option prefix
      stryMutAct_9fa48("4325") ? "" : (stryCov_9fa48("4325"), 'בחירת אפשרותב'), // Hebrew with option prefix
      stryMutAct_9fa48("4326") ? "" : (stryCov_9fa48("4326"), 'בחירת אפשרותג'), // Hebrew with option prefix
      stryMutAct_9fa48("4327") ? "" : (stryCov_9fa48("4327"), 'בחירת אפשרותד'), // Hebrew with option prefix
      stryMutAct_9fa48("4328") ? "" : (stryCov_9fa48("4328"), 'בחירת אפשרותה'), // Hebrew with option prefix
      stryMutAct_9fa48("4329") ? "" : (stryCov_9fa48("4329"), 'בחירת אפשרותו'), // Hebrew with option prefix
      stryMutAct_9fa48("4330") ? "" : (stryCov_9fa48("4330"), 'בחירת אפשרותז'), // Hebrew with option prefix
      stryMutAct_9fa48("4331") ? "" : (stryCov_9fa48("4331"), 'בחירת אפשרותח'), // Hebrew with option prefix
      stryMutAct_9fa48("4332") ? "" : (stryCov_9fa48("4332"), 'בחירת אפשרותט'), // Hebrew with option prefix
      stryMutAct_9fa48("4333") ? "" : (stryCov_9fa48("4333"), 'בחירת אפשרותי'), // Hebrew with option prefix
      stryMutAct_9fa48("4334") ? "" : (stryCov_9fa48("4334"), 'בחירת אפשרותכ'), // Hebrew with option prefix
      stryMutAct_9fa48("4335") ? "" : (stryCov_9fa48("4335"), 'בחירת אפשרותל'), // Hebrew with option prefix
      stryMutAct_9fa48("4336") ? "" : (stryCov_9fa48("4336"), 'בחירת אפשרותמ'), // Hebrew with option prefix
      stryMutAct_9fa48("4337") ? "" : (stryCov_9fa48("4337"), 'בחירת אפשרותנ'), // Hebrew with option prefix
      stryMutAct_9fa48("4338") ? "" : (stryCov_9fa48("4338"), 'בחירת אפשרותס'), // Hebrew with option prefix
      stryMutAct_9fa48("4339") ? "" : (stryCov_9fa48("4339"), 'בחירת אפשרותע'), // Hebrew with option prefix
      stryMutAct_9fa48("4340") ? "" : (stryCov_9fa48("4340"), 'בחירת אפשרותפ'), // Hebrew with option prefix
      stryMutAct_9fa48("4341") ? "" : (stryCov_9fa48("4341"), 'בחירת אפשרותצ'), // Hebrew with option prefix
      stryMutAct_9fa48("4342") ? "" : (stryCov_9fa48("4342"), 'בחירת אפשרותק'), // Hebrew with option prefix
      stryMutAct_9fa48("4343") ? "" : (stryCov_9fa48("4343"), 'בחירת אפשרותר'), // Hebrew with option prefix
      stryMutAct_9fa48("4344") ? "" : (stryCov_9fa48("4344"), 'בחירת אפשרותש'), // Hebrew with option prefix
      stryMutAct_9fa48("4345") ? "" : (stryCov_9fa48("4345"), 'בחירת אפשרותת') // Hebrew with option prefix
      ]);
      const isPlaceholder = stryMutAct_9fa48("4346") ? placeholders.every(placeholder => text.toLowerCase().includes(placeholder.toLowerCase())) : (stryCov_9fa48("4346"), placeholders.some(stryMutAct_9fa48("4347") ? () => undefined : (stryCov_9fa48("4347"), placeholder => stryMutAct_9fa48("4348") ? text.toUpperCase().includes(placeholder.toLowerCase()) : (stryCov_9fa48("4348"), text.toLowerCase().includes(stryMutAct_9fa48("4349") ? placeholder.toUpperCase() : (stryCov_9fa48("4349"), placeholder.toLowerCase()))))));
      if (stryMutAct_9fa48("4351") ? false : stryMutAct_9fa48("4350") ? true : (stryCov_9fa48("4350", "4351"), isPlaceholder)) {
        if (stryMutAct_9fa48("4352")) {
          {}
        } else {
          stryCov_9fa48("4352");
          debug(stryMutAct_9fa48("4353") ? "" : (stryCov_9fa48("4353"), '🔍 DEBUG: Detected placeholder text:'), text);
        }
      }
      return isPlaceholder;
    }
  }

  /**
   * Normalize product variations
   */
  static normalizeVariations(variations: RawVariation[]): ProductVariation[] {
    if (stryMutAct_9fa48("4354")) {
      {}
    } else {
      stryCov_9fa48("4354");
      return stryMutAct_9fa48("4355") ? variations.map(variation => ({
        sku: this.cleanSku(variation.sku!),
        regularPrice: this.cleanText(variation.regularPrice || ''),
        taxClass: this.cleanText(variation.taxClass || ''),
        stockStatus: this.normalizeStockStatus(variation.stockStatus),
        images: this.normalizeImages(variation.images || []),
        attributeAssignments: this.cleanAttributeAssignments(variation.attributeAssignments || {})
      })) : (stryCov_9fa48("4355"), variations.filter(stryMutAct_9fa48("4356") ? () => undefined : (stryCov_9fa48("4356"), variation => stryMutAct_9fa48("4359") ? variation || variation.sku : stryMutAct_9fa48("4358") ? false : stryMutAct_9fa48("4357") ? true : (stryCov_9fa48("4357", "4358", "4359"), variation && variation.sku))).map(stryMutAct_9fa48("4360") ? () => undefined : (stryCov_9fa48("4360"), variation => stryMutAct_9fa48("4361") ? {} : (stryCov_9fa48("4361"), {
        sku: this.cleanSku(variation.sku!),
        regularPrice: this.cleanText(stryMutAct_9fa48("4364") ? variation.regularPrice && '' : stryMutAct_9fa48("4363") ? false : stryMutAct_9fa48("4362") ? true : (stryCov_9fa48("4362", "4363", "4364"), variation.regularPrice || (stryMutAct_9fa48("4365") ? "Stryker was here!" : (stryCov_9fa48("4365"), '')))),
        taxClass: this.cleanText(stryMutAct_9fa48("4368") ? variation.taxClass && '' : stryMutAct_9fa48("4367") ? false : stryMutAct_9fa48("4366") ? true : (stryCov_9fa48("4366", "4367", "4368"), variation.taxClass || (stryMutAct_9fa48("4369") ? "Stryker was here!" : (stryCov_9fa48("4369"), '')))),
        stockStatus: this.normalizeStockStatus(variation.stockStatus),
        images: this.normalizeImages(stryMutAct_9fa48("4372") ? variation.images && [] : stryMutAct_9fa48("4371") ? false : stryMutAct_9fa48("4370") ? true : (stryCov_9fa48("4370", "4371", "4372"), variation.images || (stryMutAct_9fa48("4373") ? ["Stryker was here"] : (stryCov_9fa48("4373"), [])))),
        attributeAssignments: this.cleanAttributeAssignments(stryMutAct_9fa48("4376") ? variation.attributeAssignments && {} : stryMutAct_9fa48("4375") ? false : stryMutAct_9fa48("4374") ? true : (stryCov_9fa48("4374", "4375", "4376"), variation.attributeAssignments || {}))
      }))));
    }
  }

  /**
   * Clean attribute assignments
   */
  static cleanAttributeAssignments(assignments: Record<string, string>): Record<string, string> {
    if (stryMutAct_9fa48("4377")) {
      {}
    } else {
      stryCov_9fa48("4377");
      const cleaned: Record<string, string> = {};
      for (const [key, value] of Object.entries(assignments)) {
        if (stryMutAct_9fa48("4378")) {
          {}
        } else {
          stryCov_9fa48("4378");
          const cleanKey = this.cleanAttributeName(key);
          const cleanValue = this.cleanText(value);
          if (stryMutAct_9fa48("4381") ? cleanValue || !this.isPlaceholder(cleanValue) : stryMutAct_9fa48("4380") ? false : stryMutAct_9fa48("4379") ? true : (stryCov_9fa48("4379", "4380", "4381"), cleanValue && (stryMutAct_9fa48("4382") ? this.isPlaceholder(cleanValue) : (stryCov_9fa48("4382"), !this.isPlaceholder(cleanValue))))) {
            if (stryMutAct_9fa48("4383")) {
              {}
            } else {
              stryCov_9fa48("4383");
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
    if (stryMutAct_9fa48("4384")) {
      {}
    } else {
      stryCov_9fa48("4384");
      if (stryMutAct_9fa48("4387") ? false : stryMutAct_9fa48("4386") ? true : stryMutAct_9fa48("4385") ? text : (stryCov_9fa48("4385", "4386", "4387"), !text)) return {};
      const cleaned = this.cleanText(text);

      // Pattern: "140140" -> "140*140"
      const dimensionPattern = stryMutAct_9fa48("4391") ? /(\d{2,4})(\D{2,4})/g : stryMutAct_9fa48("4390") ? /(\d{2,4})(\d)/g : stryMutAct_9fa48("4389") ? /(\D{2,4})(\d{2,4})/g : stryMutAct_9fa48("4388") ? /(\d)(\d{2,4})/g : (stryCov_9fa48("4388", "4389", "4390", "4391"), /(\d{2,4})(\d{2,4})/g);
      const match = dimensionPattern.exec(cleaned);
      if (stryMutAct_9fa48("4393") ? false : stryMutAct_9fa48("4392") ? true : (stryCov_9fa48("4392", "4393"), match)) {
        if (stryMutAct_9fa48("4394")) {
          {}
        } else {
          stryCov_9fa48("4394");
          return stryMutAct_9fa48("4395") ? {} : (stryCov_9fa48("4395"), {
            width: parseInt(stryMutAct_9fa48("4398") ? match[1] && '0' : stryMutAct_9fa48("4397") ? false : stryMutAct_9fa48("4396") ? true : (stryCov_9fa48("4396", "4397", "4398"), match[1] || (stryMutAct_9fa48("4399") ? "" : (stryCov_9fa48("4399"), '0')))),
            height: parseInt(stryMutAct_9fa48("4402") ? match[2] && '0' : stryMutAct_9fa48("4401") ? false : stryMutAct_9fa48("4400") ? true : (stryCov_9fa48("4400", "4401", "4402"), match[2] || (stryMutAct_9fa48("4403") ? "" : (stryCov_9fa48("4403"), '0'))))
          });
        }
      }

      // Pattern: "140 x 140" or "140*140"
      const xPattern = stryMutAct_9fa48("4412") ? /(\d+)\s*[xX*]\s*(\D+)/ : stryMutAct_9fa48("4411") ? /(\d+)\s*[xX*]\s*(\d)/ : stryMutAct_9fa48("4410") ? /(\d+)\s*[xX*]\S*(\d+)/ : stryMutAct_9fa48("4409") ? /(\d+)\s*[xX*]\s(\d+)/ : stryMutAct_9fa48("4408") ? /(\d+)\s*[^xX*]\s*(\d+)/ : stryMutAct_9fa48("4407") ? /(\d+)\S*[xX*]\s*(\d+)/ : stryMutAct_9fa48("4406") ? /(\d+)\s[xX*]\s*(\d+)/ : stryMutAct_9fa48("4405") ? /(\D+)\s*[xX*]\s*(\d+)/ : stryMutAct_9fa48("4404") ? /(\d)\s*[xX*]\s*(\d+)/ : (stryCov_9fa48("4404", "4405", "4406", "4407", "4408", "4409", "4410", "4411", "4412"), /(\d+)\s*[xX*]\s*(\d+)/);
      const xMatch = cleaned.match(xPattern);
      if (stryMutAct_9fa48("4414") ? false : stryMutAct_9fa48("4413") ? true : (stryCov_9fa48("4413", "4414"), xMatch)) {
        if (stryMutAct_9fa48("4415")) {
          {}
        } else {
          stryCov_9fa48("4415");
          return stryMutAct_9fa48("4416") ? {} : (stryCov_9fa48("4416"), {
            width: parseInt(stryMutAct_9fa48("4419") ? xMatch[1] && '0' : stryMutAct_9fa48("4418") ? false : stryMutAct_9fa48("4417") ? true : (stryCov_9fa48("4417", "4418", "4419"), xMatch[1] || (stryMutAct_9fa48("4420") ? "" : (stryCov_9fa48("4420"), '0')))),
            height: parseInt(stryMutAct_9fa48("4423") ? xMatch[2] && '0' : stryMutAct_9fa48("4422") ? false : stryMutAct_9fa48("4421") ? true : (stryCov_9fa48("4421", "4422", "4423"), xMatch[2] || (stryMutAct_9fa48("4424") ? "" : (stryCov_9fa48("4424"), '0'))))
          });
        }
      }
      return {};
    }
  }
}