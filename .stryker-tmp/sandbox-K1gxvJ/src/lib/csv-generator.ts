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
import { NormalizedProduct } from '../types';
import { debug } from './logger';
import { writeToBuffer } from 'fast-csv';

/**
 * Interface for CSV writing operations
 */
export interface CsvWriter {
  writeToBuffer(data: any[], options?: any): Promise<Buffer>;
}

/**
 * Default implementation using fast-csv
 */
export class FastCsvWriter implements CsvWriter {
  async writeToBuffer(data: any[], options?: any): Promise<Buffer> {
    if (stryMutAct_9fa48("0")) {
      {}
    } else {
      stryCov_9fa48("0");
      return writeToBuffer(data, options);
    }
  }
}
export class CsvGenerator {
  constructor(private csvWriter: CsvWriter = new FastCsvWriter()) {}

  /**
   * Generate Parent CSV for WooCommerce import
   */
  async generateParentCsv(products: NormalizedProduct[]): Promise<string> {
    if (stryMutAct_9fa48("1")) {
      {}
    } else {
      stryCov_9fa48("1");
      debug(stryMutAct_9fa48("2") ? "" : (stryCov_9fa48("2"), 'generateParentCsv called with products'), stryMutAct_9fa48("3") ? {} : (stryCov_9fa48("3"), {
        count: products.length
      }));

      // Deduplicate products by SKU to prevent CSV duplicates
      const uniqueProducts = this.deduplicateProducts(products);
      debug(stryMutAct_9fa48("4") ? "" : (stryCov_9fa48("4"), 'Deduplicated products'), stryMutAct_9fa48("5") ? {} : (stryCov_9fa48("5"), {
        original: products.length,
        deduplicated: uniqueProducts.length
      }));
      const csvData = uniqueProducts.map((product, index) => {
        if (stryMutAct_9fa48("6")) {
          {}
        } else {
          stryCov_9fa48("6");
          // Build attributes from product.attributes plus union of variation attributeAssignments
          const aggregatedAttributes: Record<string, string[]> = {};
          // Seed from normalized product.attributes
          for (const [key, vals] of Object.entries(stryMutAct_9fa48("9") ? product.attributes && {} : stryMutAct_9fa48("8") ? false : stryMutAct_9fa48("7") ? true : (stryCov_9fa48("7", "8", "9"), product.attributes || {}))) {
            if (stryMutAct_9fa48("10")) {
              {}
            } else {
              stryCov_9fa48("10");
              const values = Array.from(new Set(stryMutAct_9fa48("11") ? vals || [] : (stryCov_9fa48("11"), (stryMutAct_9fa48("14") ? vals && [] : stryMutAct_9fa48("13") ? false : stryMutAct_9fa48("12") ? true : (stryCov_9fa48("12", "13", "14"), vals || (stryMutAct_9fa48("15") ? ["Stryker was here"] : (stryCov_9fa48("15"), [])))).filter(Boolean))));
              aggregatedAttributes[key] = values;
            }
          }
          // Merge from variations
          for (const v of stryMutAct_9fa48("18") ? product.variations && [] : stryMutAct_9fa48("17") ? false : stryMutAct_9fa48("16") ? true : (stryCov_9fa48("16", "17", "18"), product.variations || (stryMutAct_9fa48("19") ? ["Stryker was here"] : (stryCov_9fa48("19"), [])))) {
            if (stryMutAct_9fa48("20")) {
              {}
            } else {
              stryCov_9fa48("20");
              for (const [key, val] of Object.entries(stryMutAct_9fa48("23") ? v.attributeAssignments && {} : stryMutAct_9fa48("22") ? false : stryMutAct_9fa48("21") ? true : (stryCov_9fa48("21", "22", "23"), v.attributeAssignments || {}))) {
                if (stryMutAct_9fa48("24")) {
                  {}
                } else {
                  stryCov_9fa48("24");
                  const existing = stryMutAct_9fa48("27") ? aggregatedAttributes[key] && [] : stryMutAct_9fa48("26") ? false : stryMutAct_9fa48("25") ? true : (stryCov_9fa48("25", "26", "27"), aggregatedAttributes[key] || (stryMutAct_9fa48("28") ? ["Stryker was here"] : (stryCov_9fa48("28"), [])));
                  if (stryMutAct_9fa48("31") ? val || !existing.includes(val) : stryMutAct_9fa48("30") ? false : stryMutAct_9fa48("29") ? true : (stryCov_9fa48("29", "30", "31"), val && (stryMutAct_9fa48("32") ? existing.includes(val) : (stryCov_9fa48("32"), !existing.includes(val))))) existing.push(val);
                  aggregatedAttributes[key] = existing;
                }
              }
            }
          }
          const row: Record<string, string> = stryMutAct_9fa48("33") ? {} : (stryCov_9fa48("33"), {
            ID: stryMutAct_9fa48("34") ? "Stryker was here!" : (stryCov_9fa48("34"), ''),
            // Will be auto-generated by WooCommerce
            post_title: product.title,
            post_name: (stryMutAct_9fa48("37") ? product.slug || product.slug.trim() !== '' : stryMutAct_9fa48("36") ? false : stryMutAct_9fa48("35") ? true : (stryCov_9fa48("35", "36", "37"), product.slug && (stryMutAct_9fa48("39") ? product.slug.trim() === '' : stryMutAct_9fa48("38") ? true : (stryCov_9fa48("38", "39"), (stryMutAct_9fa48("40") ? product.slug : (stryCov_9fa48("40"), product.slug.trim())) !== (stryMutAct_9fa48("41") ? "Stryker was here!" : (stryCov_9fa48("41"), '')))))) ? product.slug : product.sku ? stryMutAct_9fa48("42") ? product.sku.toUpperCase() : (stryCov_9fa48("42"), product.sku.toLowerCase()) : stryMutAct_9fa48("43") ? `` : (stryCov_9fa48("43"), `product-${stryMutAct_9fa48("44") ? index - 1 : (stryCov_9fa48("44"), index + 1)}`),
            post_status: stryMutAct_9fa48("45") ? "" : (stryCov_9fa48("45"), 'publish'),
            post_content: stryMutAct_9fa48("48") ? product.description && '' : stryMutAct_9fa48("47") ? false : stryMutAct_9fa48("46") ? true : (stryCov_9fa48("46", "47", "48"), product.description || (stryMutAct_9fa48("49") ? "Stryker was here!" : (stryCov_9fa48("49"), ''))),
            post_excerpt: stryMutAct_9fa48("52") ? product.shortDescription && '' : stryMutAct_9fa48("51") ? false : stryMutAct_9fa48("50") ? true : (stryCov_9fa48("50", "51", "52"), product.shortDescription || (stryMutAct_9fa48("53") ? "Stryker was here!" : (stryCov_9fa48("53"), ''))),
            post_parent: stryMutAct_9fa48("54") ? "Stryker was here!" : (stryCov_9fa48("54"), ''),
            // Empty for parent products
            post_type: stryMutAct_9fa48("55") ? "" : (stryCov_9fa48("55"), 'product'),
            menu_order: stryMutAct_9fa48("56") ? "" : (stryCov_9fa48("56"), '0'),
            sku: product.sku,
            stock_status: product.stockStatus,
            images: product.images.join(stryMutAct_9fa48("57") ? "" : (stryCov_9fa48("57"), '|')),
            'tax:product_type': product.productType,
            'tax:product_cat': product.category,
            description: stryMutAct_9fa48("60") ? product.description && '' : stryMutAct_9fa48("59") ? false : stryMutAct_9fa48("58") ? true : (stryCov_9fa48("58", "59", "60"), product.description || (stryMutAct_9fa48("61") ? "Stryker was here!" : (stryCov_9fa48("61"), ''))),
            regular_price: stryMutAct_9fa48("64") ? product.regularPrice && '0' : stryMutAct_9fa48("63") ? false : stryMutAct_9fa48("62") ? true : (stryCov_9fa48("62", "63", "64"), product.regularPrice || (stryMutAct_9fa48("65") ? "" : (stryCov_9fa48("65"), '0'))),
            sale_price: stryMutAct_9fa48("68") ? product.salePrice && '' : stryMutAct_9fa48("67") ? false : stryMutAct_9fa48("66") ? true : (stryCov_9fa48("66", "67", "68"), product.salePrice || (stryMutAct_9fa48("69") ? "Stryker was here!" : (stryCov_9fa48("69"), '')))
          });

          // Add attributes per Woo CSV Import Suite rules
          // attribute:<Name> = pipe-separated values
          // attribute_default:<Name> = default value (variable products)
          // attribute_data:<Name> = position|visible|variation (variation flag only for variable products)
          const isVariable = stryMutAct_9fa48("72") ? product.productType !== 'variable' : stryMutAct_9fa48("71") ? false : stryMutAct_9fa48("70") ? true : (stryCov_9fa48("70", "71", "72"), product.productType === (stryMutAct_9fa48("73") ? "" : (stryCov_9fa48("73"), 'variable')));
          let position = 0;
          const firstVariation = (stryMutAct_9fa48("76") ? product.variations && [] : stryMutAct_9fa48("75") ? false : stryMutAct_9fa48("74") ? true : (stryCov_9fa48("74", "75", "76"), product.variations || (stryMutAct_9fa48("77") ? ["Stryker was here"] : (stryCov_9fa48("77"), []))))[0];
          for (const [rawName, values] of Object.entries(aggregatedAttributes)) {
            if (stryMutAct_9fa48("78")) {
              {}
            } else {
              stryCov_9fa48("78");
              const displayName = this.attributeDisplayName(rawName);
              const headerName = displayName; // use local attribute naming like in examples (e.g., Color, Size)

              row[stryMutAct_9fa48("79") ? `` : (stryCov_9fa48("79"), `attribute:${headerName}`)] = (stryMutAct_9fa48("82") ? values && [] : stryMutAct_9fa48("81") ? false : stryMutAct_9fa48("80") ? true : (stryCov_9fa48("80", "81", "82"), values || (stryMutAct_9fa48("83") ? ["Stryker was here"] : (stryCov_9fa48("83"), [])))).join(stryMutAct_9fa48("84") ? "" : (stryCov_9fa48("84"), ' | '));
              const visible = 1;
              const isTaxonomy = (stryMutAct_9fa48("85") ? /pa_/i : (stryCov_9fa48("85"), /^pa_/i)).test(rawName) ? 1 : 0;
              const inVariations = isVariable ? 1 : 0;
              // position|visible|is_taxonomy|in_variations
              row[stryMutAct_9fa48("86") ? `` : (stryCov_9fa48("86"), `attribute_data:${headerName}`)] = stryMutAct_9fa48("87") ? `` : (stryCov_9fa48("87"), `${position}|${visible}|${isTaxonomy}|${inVariations}`);

              // Default attribute per first variation when variable
              if (stryMutAct_9fa48("90") ? isVariable && firstVariation || firstVariation.attributeAssignments : stryMutAct_9fa48("89") ? false : stryMutAct_9fa48("88") ? true : (stryCov_9fa48("88", "89", "90"), (stryMutAct_9fa48("92") ? isVariable || firstVariation : stryMutAct_9fa48("91") ? true : (stryCov_9fa48("91", "92"), isVariable && firstVariation)) && firstVariation.attributeAssignments)) {
                if (stryMutAct_9fa48("93")) {
                  {}
                } else {
                  stryCov_9fa48("93");
                  const fv = stryMutAct_9fa48("96") ? (firstVariation.attributeAssignments[rawName] || firstVariation.attributeAssignments[this.cleanAttributeName(rawName)] || firstVariation.attributeAssignments[`pa_${this.cleanAttributeName(rawName)}`]) && '' : stryMutAct_9fa48("95") ? false : stryMutAct_9fa48("94") ? true : (stryCov_9fa48("94", "95", "96"), (stryMutAct_9fa48("98") ? (firstVariation.attributeAssignments[rawName] || firstVariation.attributeAssignments[this.cleanAttributeName(rawName)]) && firstVariation.attributeAssignments[`pa_${this.cleanAttributeName(rawName)}`] : stryMutAct_9fa48("97") ? false : (stryCov_9fa48("97", "98"), (stryMutAct_9fa48("100") ? firstVariation.attributeAssignments[rawName] && firstVariation.attributeAssignments[this.cleanAttributeName(rawName)] : stryMutAct_9fa48("99") ? false : (stryCov_9fa48("99", "100"), firstVariation.attributeAssignments[rawName] || firstVariation.attributeAssignments[this.cleanAttributeName(rawName)])) || firstVariation.attributeAssignments[stryMutAct_9fa48("101") ? `` : (stryCov_9fa48("101"), `pa_${this.cleanAttributeName(rawName)}`)])) || (stryMutAct_9fa48("102") ? "Stryker was here!" : (stryCov_9fa48("102"), '')));
                  if (stryMutAct_9fa48("104") ? false : stryMutAct_9fa48("103") ? true : (stryCov_9fa48("103", "104"), fv)) {
                    if (stryMutAct_9fa48("105")) {
                      {}
                    } else {
                      stryCov_9fa48("105");
                      row[stryMutAct_9fa48("106") ? `` : (stryCov_9fa48("106"), `attribute_default:${headerName}`)] = fv;
                    }
                  }
                }
              }
              stryMutAct_9fa48("107") ? position-- : (stryCov_9fa48("107"), position++);
            }
          }
          return row;
        }
      });
      debug(stryMutAct_9fa48("108") ? "" : (stryCov_9fa48("108"), 'generateParentCsv completed'), stryMutAct_9fa48("109") ? {} : (stryCov_9fa48("109"), {
        rows: csvData.length
      }));
      try {
        if (stryMutAct_9fa48("110")) {
          {}
        } else {
          stryCov_9fa48("110");
          const buffer = await this.csvWriter.writeToBuffer(csvData, stryMutAct_9fa48("111") ? {} : (stryCov_9fa48("111"), {
            headers: stryMutAct_9fa48("112") ? false : (stryCov_9fa48("112"), true)
          }));
          return buffer.toString();
        }
      } catch (error) {
        if (stryMutAct_9fa48("113")) {
          {}
        } else {
          stryCov_9fa48("113");
          debug(stryMutAct_9fa48("114") ? "" : (stryCov_9fa48("114"), 'Error in generateParentCsv'), stryMutAct_9fa48("115") ? {} : (stryCov_9fa48("115"), {
            error
          }));
          throw error;
        }
      }
    }
  }

  /**
   * Generate Variation CSV for WooCommerce import
   */
  async generateVariationCsv(products: NormalizedProduct[]): Promise<string> {
    if (stryMutAct_9fa48("116")) {
      {}
    } else {
      stryCov_9fa48("116");
      const variationRows: Record<string, string>[] = stryMutAct_9fa48("117") ? ["Stryker was here"] : (stryCov_9fa48("117"), []);
      const attributeHeadersSet = new Set<string>();

      // DEBUG: Log what we're processing
      debug(stryMutAct_9fa48("118") ? "" : (stryCov_9fa48("118"), 'generateVariationCsv called with products'), stryMutAct_9fa48("119") ? {} : (stryCov_9fa48("119"), {
        count: products.length
      }));
      for (const product of products) {
        if (stryMutAct_9fa48("120")) {
          {}
        } else {
          stryCov_9fa48("120");
          debug(stryMutAct_9fa48("121") ? "" : (stryCov_9fa48("121"), 'Processing product for variations'), stryMutAct_9fa48("122") ? {} : (stryCov_9fa48("122"), {
            title: stryMutAct_9fa48("123") ? product.title : (stryCov_9fa48("123"), product.title.substring(0, 50)),
            productType: product.productType,
            variationsCount: product.variations.length,
            attributesCount: Object.keys(product.attributes).length,
            attributes: product.attributes
          }));
          if (stryMutAct_9fa48("126") ? product.productType === 'variable' || product.variations.length > 0 : stryMutAct_9fa48("125") ? false : stryMutAct_9fa48("124") ? true : (stryCov_9fa48("124", "125", "126"), (stryMutAct_9fa48("128") ? product.productType !== 'variable' : stryMutAct_9fa48("127") ? true : (stryCov_9fa48("127", "128"), product.productType === (stryMutAct_9fa48("129") ? "" : (stryCov_9fa48("129"), 'variable')))) && (stryMutAct_9fa48("132") ? product.variations.length <= 0 : stryMutAct_9fa48("131") ? product.variations.length >= 0 : stryMutAct_9fa48("130") ? true : (stryCov_9fa48("130", "131", "132"), product.variations.length > 0)))) {
            if (stryMutAct_9fa48("133")) {
              {}
            } else {
              stryCov_9fa48("133");
              // Collect attribute header names from product + variations
              const aggregatedAttributes: Record<string, string[]> = {};
              for (const [key, vals] of Object.entries(stryMutAct_9fa48("136") ? product.attributes && {} : stryMutAct_9fa48("135") ? false : stryMutAct_9fa48("134") ? true : (stryCov_9fa48("134", "135", "136"), product.attributes || {}))) {
                if (stryMutAct_9fa48("137")) {
                  {}
                } else {
                  stryCov_9fa48("137");
                  aggregatedAttributes[key] = Array.from(new Set(stryMutAct_9fa48("138") ? vals || [] : (stryCov_9fa48("138"), (stryMutAct_9fa48("141") ? vals && [] : stryMutAct_9fa48("140") ? false : stryMutAct_9fa48("139") ? true : (stryCov_9fa48("139", "140", "141"), vals || (stryMutAct_9fa48("142") ? ["Stryker was here"] : (stryCov_9fa48("142"), [])))).filter(Boolean))));
                }
              }
              for (const v of stryMutAct_9fa48("145") ? product.variations && [] : stryMutAct_9fa48("144") ? false : stryMutAct_9fa48("143") ? true : (stryCov_9fa48("143", "144", "145"), product.variations || (stryMutAct_9fa48("146") ? ["Stryker was here"] : (stryCov_9fa48("146"), [])))) {
                if (stryMutAct_9fa48("147")) {
                  {}
                } else {
                  stryCov_9fa48("147");
                  for (const k of Object.keys(stryMutAct_9fa48("150") ? v.attributeAssignments && {} : stryMutAct_9fa48("149") ? false : stryMutAct_9fa48("148") ? true : (stryCov_9fa48("148", "149", "150"), v.attributeAssignments || {}))) {
                    if (stryMutAct_9fa48("151")) {
                      {}
                    } else {
                      stryCov_9fa48("151");
                      const list = stryMutAct_9fa48("154") ? aggregatedAttributes[k] && [] : stryMutAct_9fa48("153") ? false : stryMutAct_9fa48("152") ? true : (stryCov_9fa48("152", "153", "154"), aggregatedAttributes[k] || (stryMutAct_9fa48("155") ? ["Stryker was here"] : (stryCov_9fa48("155"), [])));
                      aggregatedAttributes[k] = list;
                    }
                  }
                }
              }
              for (const rawName of Object.keys(aggregatedAttributes)) {
                if (stryMutAct_9fa48("156")) {
                  {}
                } else {
                  stryCov_9fa48("156");
                  const displayName = this.attributeDisplayName(rawName);
                  attributeHeadersSet.add(stryMutAct_9fa48("157") ? `` : (stryCov_9fa48("157"), `meta:attribute_${displayName}`));
                }
              }
              debug(stryMutAct_9fa48("158") ? "" : (stryCov_9fa48("158"), 'Product is variable, processing variations'));
              for (const variation of product.variations) {
                if (stryMutAct_9fa48("159")) {
                  {}
                } else {
                  stryCov_9fa48("159");
                  const row: Record<string, string> = stryMutAct_9fa48("160") ? {} : (stryCov_9fa48("160"), {
                    ID: stryMutAct_9fa48("161") ? "Stryker was here!" : (stryCov_9fa48("161"), ''),
                    // Will be auto-generated by WooCommerce
                    post_type: stryMutAct_9fa48("162") ? "" : (stryCov_9fa48("162"), 'product_variation'),
                    post_status: stryMutAct_9fa48("163") ? "" : (stryCov_9fa48("163"), 'publish'),
                    parent_sku: product.sku,
                    post_title: stryMutAct_9fa48("164") ? `` : (stryCov_9fa48("164"), `${product.title} - ${Object.values(stryMutAct_9fa48("167") ? variation.attributeAssignments && {} : stryMutAct_9fa48("166") ? false : stryMutAct_9fa48("165") ? true : (stryCov_9fa48("165", "166", "167"), variation.attributeAssignments || {})).join(stryMutAct_9fa48("168") ? "" : (stryCov_9fa48("168"), ', '))}`),
                    post_name: stryMutAct_9fa48("169") ? `${product.slug || product.sku}-${variation.sku}`.toUpperCase() : (stryCov_9fa48("169"), (stryMutAct_9fa48("170") ? `` : (stryCov_9fa48("170"), `${stryMutAct_9fa48("173") ? product.slug && product.sku : stryMutAct_9fa48("172") ? false : stryMutAct_9fa48("171") ? true : (stryCov_9fa48("171", "172", "173"), product.slug || product.sku)}-${variation.sku}`)).toLowerCase()),
                    post_content: stryMutAct_9fa48("176") ? product.description && '' : stryMutAct_9fa48("175") ? false : stryMutAct_9fa48("174") ? true : (stryCov_9fa48("174", "175", "176"), product.description || (stryMutAct_9fa48("177") ? "Stryker was here!" : (stryCov_9fa48("177"), ''))),
                    post_excerpt: stryMutAct_9fa48("180") ? product.shortDescription && '' : stryMutAct_9fa48("179") ? false : stryMutAct_9fa48("178") ? true : (stryCov_9fa48("178", "179", "180"), product.shortDescription || (stryMutAct_9fa48("181") ? "Stryker was here!" : (stryCov_9fa48("181"), ''))),
                    menu_order: stryMutAct_9fa48("182") ? "" : (stryCov_9fa48("182"), '0'),
                    sku: variation.sku,
                    stock_status: variation.stockStatus,
                    regular_price: variation.regularPrice,
                    sale_price: stryMutAct_9fa48("185") ? variation.salePrice && '' : stryMutAct_9fa48("184") ? false : stryMutAct_9fa48("183") ? true : (stryCov_9fa48("183", "184", "185"), variation.salePrice || (stryMutAct_9fa48("186") ? "Stryker was here!" : (stryCov_9fa48("186"), ''))),
                    tax_class: stryMutAct_9fa48("189") ? variation.taxClass && 'parent' : stryMutAct_9fa48("188") ? false : stryMutAct_9fa48("187") ? true : (stryCov_9fa48("187", "188", "189"), variation.taxClass || (stryMutAct_9fa48("190") ? "" : (stryCov_9fa48("190"), 'parent'))),
                    images: ((variation.images[0] || product.images[0] || '') as string).toString()
                  });

                  // Add attribute values per variation using meta:attribute_Name columns as in examples
                  const assignments = stryMutAct_9fa48("193") ? variation.attributeAssignments && {} : stryMutAct_9fa48("192") ? false : stryMutAct_9fa48("191") ? true : (stryCov_9fa48("191", "192", "193"), variation.attributeAssignments || {});
                  // Ensure all known attribute headers exist on this row (fill missing as empty)
                  for (const header of attributeHeadersSet) {
                    if (stryMutAct_9fa48("194")) {
                      {}
                    } else {
                      stryCov_9fa48("194");
                      row[header] = stryMutAct_9fa48("197") ? row[header] && '' : stryMutAct_9fa48("196") ? false : stryMutAct_9fa48("195") ? true : (stryCov_9fa48("195", "196", "197"), row[header] || (stryMutAct_9fa48("198") ? "Stryker was here!" : (stryCov_9fa48("198"), '')));
                    }
                  }
                  for (const [rawName, attrValue] of Object.entries(assignments)) {
                    if (stryMutAct_9fa48("199")) {
                      {}
                    } else {
                      stryCov_9fa48("199");
                      const displayName = this.attributeDisplayName(rawName);
                      const header = stryMutAct_9fa48("200") ? `` : (stryCov_9fa48("200"), `meta:attribute_${displayName}`);
                      row[header] = attrValue;
                    }
                  }
                  variationRows.push(row);
                }
              }
            }
          } else {
            if (stryMutAct_9fa48("201")) {
              {}
            } else {
              stryCov_9fa48("201");
              debug(stryMutAct_9fa48("202") ? "" : (stryCov_9fa48("202"), 'Product is NOT variable or has no variations'), stryMutAct_9fa48("203") ? {} : (stryCov_9fa48("203"), {
                productType: product.productType,
                variationsCount: product.variations.length
              }));
            }
          }
        }
      }
      debug(stryMutAct_9fa48("204") ? "" : (stryCov_9fa48("204"), 'Final variation rows count'), stryMutAct_9fa48("205") ? {} : (stryCov_9fa48("205"), {
        count: variationRows.length
      }));
      if (stryMutAct_9fa48("208") ? variationRows.length !== 0 : stryMutAct_9fa48("207") ? false : stryMutAct_9fa48("206") ? true : (stryCov_9fa48("206", "207", "208"), variationRows.length === 0)) {
        if (stryMutAct_9fa48("209")) {
          {}
        } else {
          stryCov_9fa48("209");
          return stryMutAct_9fa48("210") ? "Stryker was here!" : (stryCov_9fa48("210"), '');
        }
      }

      // Build stable headers: base columns + any dynamic meta:attribute_* columns discovered across products
      const baseHeaders = stryMutAct_9fa48("211") ? [] : (stryCov_9fa48("211"), [stryMutAct_9fa48("212") ? "" : (stryCov_9fa48("212"), 'ID'), stryMutAct_9fa48("213") ? "" : (stryCov_9fa48("213"), 'post_type'), stryMutAct_9fa48("214") ? "" : (stryCov_9fa48("214"), 'post_status'), stryMutAct_9fa48("215") ? "" : (stryCov_9fa48("215"), 'parent_sku'), stryMutAct_9fa48("216") ? "" : (stryCov_9fa48("216"), 'post_title'), stryMutAct_9fa48("217") ? "" : (stryCov_9fa48("217"), 'post_name'), stryMutAct_9fa48("218") ? "" : (stryCov_9fa48("218"), 'post_content'), stryMutAct_9fa48("219") ? "" : (stryCov_9fa48("219"), 'post_excerpt'), stryMutAct_9fa48("220") ? "" : (stryCov_9fa48("220"), 'menu_order'), stryMutAct_9fa48("221") ? "" : (stryCov_9fa48("221"), 'sku'), stryMutAct_9fa48("222") ? "" : (stryCov_9fa48("222"), 'stock_status'), stryMutAct_9fa48("223") ? "" : (stryCov_9fa48("223"), 'regular_price'), stryMutAct_9fa48("224") ? "" : (stryCov_9fa48("224"), 'sale_price'), stryMutAct_9fa48("225") ? "" : (stryCov_9fa48("225"), 'tax_class'), stryMutAct_9fa48("226") ? "" : (stryCov_9fa48("226"), 'images')]);
      const dynamicHeaders = stryMutAct_9fa48("227") ? Array.from(attributeHeadersSet) : (stryCov_9fa48("227"), Array.from(attributeHeadersSet).sort());
      const headers = stryMutAct_9fa48("228") ? [] : (stryCov_9fa48("228"), [...baseHeaders, ...dynamicHeaders]);
      debug(stryMutAct_9fa48("229") ? "" : (stryCov_9fa48("229"), 'generateVariationCsv completed'), stryMutAct_9fa48("230") ? {} : (stryCov_9fa48("230"), {
        rows: variationRows.length,
        headers
      }));
      try {
        if (stryMutAct_9fa48("231")) {
          {}
        } else {
          stryCov_9fa48("231");
          const buffer = await this.csvWriter.writeToBuffer(variationRows, stryMutAct_9fa48("232") ? {} : (stryCov_9fa48("232"), {
            headers
          }));
          return buffer.toString();
        }
      } catch (error) {
        if (stryMutAct_9fa48("233")) {
          {}
        } else {
          stryCov_9fa48("233");
          debug(stryMutAct_9fa48("234") ? "" : (stryCov_9fa48("234"), 'Error in generateVariationCsv'), stryMutAct_9fa48("235") ? {} : (stryCov_9fa48("235"), {
            error
          }));
          throw error;
        }
      }
    }
  }

  /**
   * Generate both CSVs in parallel
   */
  async generateBothCsvs(products: NormalizedProduct[]): Promise<{
    parentCsv: string;
    variationCsv: string;
    productCount: number;
    variationCount: number;
  }> {
    if (stryMutAct_9fa48("236")) {
      {}
    } else {
      stryCov_9fa48("236");
      debug(stryMutAct_9fa48("237") ? "" : (stryCov_9fa48("237"), 'generateBothCsvs called with products'), stryMutAct_9fa48("238") ? {} : (stryCov_9fa48("238"), {
        count: products.length
      }));
      const [parentCsv, variationCsv] = await Promise.all(stryMutAct_9fa48("239") ? [] : (stryCov_9fa48("239"), [this.generateParentCsv(products), this.generateVariationCsv(products)]));
      const variationCount = stryMutAct_9fa48("240") ? products.reduce((sum, p) => sum + p.variations.length, 0) : (stryCov_9fa48("240"), products.filter(stryMutAct_9fa48("241") ? () => undefined : (stryCov_9fa48("241"), p => stryMutAct_9fa48("244") ? p.productType !== 'variable' : stryMutAct_9fa48("243") ? false : stryMutAct_9fa48("242") ? true : (stryCov_9fa48("242", "243", "244"), p.productType === (stryMutAct_9fa48("245") ? "" : (stryCov_9fa48("245"), 'variable'))))).reduce(stryMutAct_9fa48("246") ? () => undefined : (stryCov_9fa48("246"), (sum, p) => stryMutAct_9fa48("247") ? sum - p.variations.length : (stryCov_9fa48("247"), sum + p.variations.length)), 0));
      debug(stryMutAct_9fa48("248") ? "" : (stryCov_9fa48("248"), 'generateBothCsvs results'), stryMutAct_9fa48("249") ? {} : (stryCov_9fa48("249"), {
        productCount: products.length,
        variationCount,
        parentCsvLength: parentCsv.length,
        variationCsvLength: variationCsv.length,
        productsWithVariations: stryMutAct_9fa48("250") ? products.length : (stryCov_9fa48("250"), products.filter(stryMutAct_9fa48("251") ? () => undefined : (stryCov_9fa48("251"), p => stryMutAct_9fa48("254") ? p.productType !== 'variable' : stryMutAct_9fa48("253") ? false : stryMutAct_9fa48("252") ? true : (stryCov_9fa48("252", "253", "254"), p.productType === (stryMutAct_9fa48("255") ? "" : (stryCov_9fa48("255"), 'variable'))))).length),
        productTypes: products.map(stryMutAct_9fa48("256") ? () => undefined : (stryCov_9fa48("256"), p => p.productType))
      }));
      return stryMutAct_9fa48("257") ? {} : (stryCov_9fa48("257"), {
        parentCsv,
        variationCsv,
        productCount: products.length,
        variationCount
      });
    }
  }

  /**
   * Clean attribute names for CSV headers
   */
  private cleanAttributeName(name: string): string {
    if (stryMutAct_9fa48("258")) {
      {}
    } else {
      stryCov_9fa48("258");
      return stryMutAct_9fa48("260") ? name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').toLowerCase() : stryMutAct_9fa48("259") ? name.trim().replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').toUpperCase() : (stryCov_9fa48("259", "260"), name.trim().replace(stryMutAct_9fa48("262") ? /[^a-zA-Z0-9\S]/g : stryMutAct_9fa48("261") ? /[a-zA-Z0-9\s]/g : (stryCov_9fa48("261", "262"), /[^a-zA-Z0-9\s]/g), stryMutAct_9fa48("263") ? "Stryker was here!" : (stryCov_9fa48("263"), '')).replace(stryMutAct_9fa48("265") ? /\S+/g : stryMutAct_9fa48("264") ? /\s/g : (stryCov_9fa48("264", "265"), /\s+/g), stryMutAct_9fa48("266") ? "" : (stryCov_9fa48("266"), '_')).toLowerCase());
    }
  }

  /**
   * Turn raw attribute keys into display names like in examples (Color, Size)
   */
  private attributeDisplayName(rawName: string): string {
    if (stryMutAct_9fa48("267")) {
      {}
    } else {
      stryCov_9fa48("267");
      const withoutPrefix = rawName.replace(stryMutAct_9fa48("268") ? /pa_/i : (stryCov_9fa48("268"), /^pa_/i), stryMutAct_9fa48("269") ? "Stryker was here!" : (stryCov_9fa48("269"), ''));
      const cleaned = stryMutAct_9fa48("271") ? withoutPrefix.replace(/[_-]+/g, ' ').toLowerCase() : stryMutAct_9fa48("270") ? withoutPrefix.replace(/[_-]+/g, ' ').trim().toUpperCase() : (stryCov_9fa48("270", "271"), withoutPrefix.replace(stryMutAct_9fa48("273") ? /[^_-]+/g : stryMutAct_9fa48("272") ? /[_-]/g : (stryCov_9fa48("272", "273"), /[_-]+/g), stryMutAct_9fa48("274") ? "" : (stryCov_9fa48("274"), ' ')).trim().toLowerCase());
      return cleaned.replace(stryMutAct_9fa48("275") ? /\b\W/g : (stryCov_9fa48("275"), /\b\w/g), stryMutAct_9fa48("276") ? () => undefined : (stryCov_9fa48("276"), c => stryMutAct_9fa48("277") ? c.toLowerCase() : (stryCov_9fa48("277"), c.toUpperCase())));
    }
  }

  /**
   * Deduplicate products based on SKU and title
   */
  private deduplicateProducts(products: NormalizedProduct[]): NormalizedProduct[] {
    if (stryMutAct_9fa48("278")) {
      {}
    } else {
      stryCov_9fa48("278");
      const seen = new Map<string, NormalizedProduct>();
      const uniqueProducts: NormalizedProduct[] = stryMutAct_9fa48("279") ? ["Stryker was here"] : (stryCov_9fa48("279"), []);
      for (const product of products) {
        if (stryMutAct_9fa48("280")) {
          {}
        } else {
          stryCov_9fa48("280");
          if (stryMutAct_9fa48("283") ? !product.sku && !product.title : stryMutAct_9fa48("282") ? false : stryMutAct_9fa48("281") ? true : (stryCov_9fa48("281", "282", "283"), (stryMutAct_9fa48("284") ? product.sku : (stryCov_9fa48("284"), !product.sku)) || (stryMutAct_9fa48("285") ? product.title : (stryCov_9fa48("285"), !product.title)))) {
            if (stryMutAct_9fa48("286")) {
              {}
            } else {
              stryCov_9fa48("286");
              // Skip products without SKU or title silently
              continue;
            }
          }
          const key = stryMutAct_9fa48("287") ? `` : (stryCov_9fa48("287"), `${product.sku}-${product.title}`);
          if (stryMutAct_9fa48("290") ? false : stryMutAct_9fa48("289") ? true : stryMutAct_9fa48("288") ? seen.has(key) : (stryCov_9fa48("288", "289", "290"), !seen.has(key))) {
            if (stryMutAct_9fa48("291")) {
              {}
            } else {
              stryCov_9fa48("291");
              seen.set(key, product);
              uniqueProducts.push(product);
            }
          }
          // Skip duplicate products silently
        }
      }
      return uniqueProducts;
    }
  }

  /**
   * Generate smart filename based on products
   */
  generateFilename(products: NormalizedProduct[], jobId: string): string {
    if (stryMutAct_9fa48("292")) {
      {}
    } else {
      stryCov_9fa48("292");
      if (stryMutAct_9fa48("295") ? products.length !== 0 : stryMutAct_9fa48("294") ? false : stryMutAct_9fa48("293") ? true : (stryCov_9fa48("293", "294", "295"), products.length === 0)) {
        if (stryMutAct_9fa48("296")) {
          {}
        } else {
          stryCov_9fa48("296");
          return stryMutAct_9fa48("297") ? `` : (stryCov_9fa48("297"), `scraped-products-${jobId}.csv`);
        }
      }

      // Try to extract category from products
      const categories = stryMutAct_9fa48("299") ? products.map(p => p.category).slice(0, 3) : stryMutAct_9fa48("298") ? products.map(p => p.category).filter(cat => cat && cat !== 'Uncategorized') : (stryCov_9fa48("298", "299"), products.map(stryMutAct_9fa48("300") ? () => undefined : (stryCov_9fa48("300"), p => p.category)).filter(stryMutAct_9fa48("301") ? () => undefined : (stryCov_9fa48("301"), cat => stryMutAct_9fa48("304") ? cat || cat !== 'Uncategorized' : stryMutAct_9fa48("303") ? false : stryMutAct_9fa48("302") ? true : (stryCov_9fa48("302", "303", "304"), cat && (stryMutAct_9fa48("306") ? cat === 'Uncategorized' : stryMutAct_9fa48("305") ? true : (stryCov_9fa48("305", "306"), cat !== (stryMutAct_9fa48("307") ? "" : (stryCov_9fa48("307"), 'Uncategorized'))))))).slice(0, 3)); // Take first 3 categories

      if (stryMutAct_9fa48("311") ? categories.length <= 0 : stryMutAct_9fa48("310") ? categories.length >= 0 : stryMutAct_9fa48("309") ? false : stryMutAct_9fa48("308") ? true : (stryCov_9fa48("308", "309", "310", "311"), categories.length > 0)) {
        if (stryMutAct_9fa48("312")) {
          {}
        } else {
          stryCov_9fa48("312");
          const categoryPart = stryMutAct_9fa48("313") ? categories.join('-').toUpperCase() : (stryCov_9fa48("313"), categories.join(stryMutAct_9fa48("314") ? "" : (stryCov_9fa48("314"), '-')).toLowerCase());
          return stryMutAct_9fa48("315") ? `` : (stryCov_9fa48("315"), `${categoryPart}-${jobId}.csv`);
        }
      }

      // Fallback to product count
      return stryMutAct_9fa48("316") ? `` : (stryCov_9fa48("316"), `products-${products.length}-${jobId}.csv`);
    }
  }

  /**
   * Validate CSV data before generation
   */
  validateProducts(products: NormalizedProduct[]): {
    valid: boolean;
    errors: string[];
  } {
    if (stryMutAct_9fa48("317")) {
      {}
    } else {
      stryCov_9fa48("317");
      const errors: string[] = stryMutAct_9fa48("318") ? ["Stryker was here"] : (stryCov_9fa48("318"), []);
      for (let i = 0; stryMutAct_9fa48("321") ? i >= products.length : stryMutAct_9fa48("320") ? i <= products.length : stryMutAct_9fa48("319") ? false : (stryCov_9fa48("319", "320", "321"), i < products.length); stryMutAct_9fa48("322") ? i-- : (stryCov_9fa48("322"), i++)) {
        if (stryMutAct_9fa48("323")) {
          {}
        } else {
          stryCov_9fa48("323");
          const product = products[i];
          if (stryMutAct_9fa48("326") ? false : stryMutAct_9fa48("325") ? true : stryMutAct_9fa48("324") ? product?.sku : (stryCov_9fa48("324", "325", "326"), !(stryMutAct_9fa48("327") ? product.sku : (stryCov_9fa48("327"), product?.sku)))) {
            if (stryMutAct_9fa48("328")) {
              {}
            } else {
              stryCov_9fa48("328");
              errors.push(stryMutAct_9fa48("329") ? `` : (stryCov_9fa48("329"), `Product ${stryMutAct_9fa48("330") ? i - 1 : (stryCov_9fa48("330"), i + 1)}: Missing SKU`));
            }
          }
          if (stryMutAct_9fa48("333") ? false : stryMutAct_9fa48("332") ? true : stryMutAct_9fa48("331") ? product?.title : (stryCov_9fa48("331", "332", "333"), !(stryMutAct_9fa48("334") ? product.title : (stryCov_9fa48("334"), product?.title)))) {
            if (stryMutAct_9fa48("335")) {
              {}
            } else {
              stryCov_9fa48("335");
              errors.push(stryMutAct_9fa48("336") ? `` : (stryCov_9fa48("336"), `Product ${stryMutAct_9fa48("337") ? i - 1 : (stryCov_9fa48("337"), i + 1)}: Missing title`));
            }
          }
          if (stryMutAct_9fa48("340") ? product?.productType !== 'variable' : stryMutAct_9fa48("339") ? false : stryMutAct_9fa48("338") ? true : (stryCov_9fa48("338", "339", "340"), (stryMutAct_9fa48("341") ? product.productType : (stryCov_9fa48("341"), product?.productType)) === (stryMutAct_9fa48("342") ? "" : (stryCov_9fa48("342"), 'variable')))) {
            if (stryMutAct_9fa48("343")) {
              {}
            } else {
              stryCov_9fa48("343");
              for (let j = 0; stryMutAct_9fa48("346") ? j >= (product?.variations?.length || 0) : stryMutAct_9fa48("345") ? j <= (product?.variations?.length || 0) : stryMutAct_9fa48("344") ? false : (stryCov_9fa48("344", "345", "346"), j < (stryMutAct_9fa48("349") ? product?.variations?.length && 0 : stryMutAct_9fa48("348") ? false : stryMutAct_9fa48("347") ? true : (stryCov_9fa48("347", "348", "349"), (stryMutAct_9fa48("351") ? product.variations?.length : stryMutAct_9fa48("350") ? product?.variations.length : (stryCov_9fa48("350", "351"), product?.variations?.length)) || 0))); stryMutAct_9fa48("352") ? j-- : (stryCov_9fa48("352"), j++)) {
                if (stryMutAct_9fa48("353")) {
                  {}
                } else {
                  stryCov_9fa48("353");
                  const variation = stryMutAct_9fa48("355") ? product.variations?.[j] : stryMutAct_9fa48("354") ? product?.variations[j] : (stryCov_9fa48("354", "355"), product?.variations?.[j]);
                  if (stryMutAct_9fa48("358") ? false : stryMutAct_9fa48("357") ? true : stryMutAct_9fa48("356") ? variation?.sku : (stryCov_9fa48("356", "357", "358"), !(stryMutAct_9fa48("359") ? variation.sku : (stryCov_9fa48("359"), variation?.sku)))) {
                    if (stryMutAct_9fa48("360")) {
                      {}
                    } else {
                      stryCov_9fa48("360");
                      errors.push(stryMutAct_9fa48("361") ? `` : (stryCov_9fa48("361"), `Product ${stryMutAct_9fa48("362") ? i - 1 : (stryCov_9fa48("362"), i + 1)}, Variation ${stryMutAct_9fa48("363") ? j - 1 : (stryCov_9fa48("363"), j + 1)}: Missing SKU`));
                    }
                  }
                }
              }
            }
          }
        }
      }
      return stryMutAct_9fa48("364") ? {} : (stryCov_9fa48("364"), {
        valid: stryMutAct_9fa48("367") ? errors.length !== 0 : stryMutAct_9fa48("366") ? false : stryMutAct_9fa48("365") ? true : (stryCov_9fa48("365", "366", "367"), errors.length === 0),
        errors
      });
    }
  }

  // Static methods for backward compatibility (deprecated)
  /**
   * @deprecated Use instance method instead
   */
  static async generateParentCsv(products: NormalizedProduct[]): Promise<string> {
    if (stryMutAct_9fa48("368")) {
      {}
    } else {
      stryCov_9fa48("368");
      const generator = new CsvGenerator();
      return generator.generateParentCsv(products);
    }
  }

  /**
   * @deprecated Use instance method instead
   */
  static async generateVariationCsv(products: NormalizedProduct[]): Promise<string> {
    if (stryMutAct_9fa48("369")) {
      {}
    } else {
      stryCov_9fa48("369");
      const generator = new CsvGenerator();
      return generator.generateVariationCsv(products);
    }
  }

  /**
   * @deprecated Use instance method instead
   */
  static async generateBothCsvs(products: NormalizedProduct[]): Promise<{
    parentCsv: string;
    variationCsv: string;
    productCount: number;
    variationCount: number;
  }> {
    if (stryMutAct_9fa48("370")) {
      {}
    } else {
      stryCov_9fa48("370");
      const generator = new CsvGenerator();
      return generator.generateBothCsvs(products);
    }
  }

  /**
   * @deprecated Use instance method instead
   */
  static generateFilename(products: NormalizedProduct[], jobId: string): string {
    if (stryMutAct_9fa48("371")) {
      {}
    } else {
      stryCov_9fa48("371");
      const generator = new CsvGenerator();
      return generator.generateFilename(products, jobId);
    }
  }

  /**
   * @deprecated Use instance method instead
   */
  static validateProducts(products: NormalizedProduct[]): {
    valid: boolean;
    errors: string[];
  } {
    if (stryMutAct_9fa48("372")) {
      {}
    } else {
      stryCov_9fa48("372");
      const generator = new CsvGenerator();
      return generator.validateProducts(products);
    }
  }
}