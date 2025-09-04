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
    if (stryMutAct_9fa48("965")) {
      {}
    } else {
      stryCov_9fa48("965");
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
    if (stryMutAct_9fa48("966")) {
      {}
    } else {
      stryCov_9fa48("966");
      debug(stryMutAct_9fa48("967") ? "" : (stryCov_9fa48("967"), 'generateParentCsv called with products'), stryMutAct_9fa48("968") ? {} : (stryCov_9fa48("968"), {
        count: products.length
      }));

      // Deduplicate products by SKU to prevent CSV duplicates
      const uniqueProducts = this.deduplicateProducts(products);
      debug(stryMutAct_9fa48("969") ? "" : (stryCov_9fa48("969"), 'Deduplicated products'), stryMutAct_9fa48("970") ? {} : (stryCov_9fa48("970"), {
        original: products.length,
        deduplicated: uniqueProducts.length
      }));
      const csvData = uniqueProducts.map((product, index) => {
        if (stryMutAct_9fa48("971")) {
          {}
        } else {
          stryCov_9fa48("971");
          // Build attributes from product.attributes plus union of variation attributeAssignments
          const aggregatedAttributes: Record<string, string[]> = {};
          // Seed from normalized product.attributes
          for (const [key, vals] of Object.entries(stryMutAct_9fa48("974") ? product.attributes && {} : stryMutAct_9fa48("973") ? false : stryMutAct_9fa48("972") ? true : (stryCov_9fa48("972", "973", "974"), product.attributes || {}))) {
            if (stryMutAct_9fa48("975")) {
              {}
            } else {
              stryCov_9fa48("975");
              const values = Array.from(new Set(stryMutAct_9fa48("976") ? vals || [] : (stryCov_9fa48("976"), (stryMutAct_9fa48("979") ? vals && [] : stryMutAct_9fa48("978") ? false : stryMutAct_9fa48("977") ? true : (stryCov_9fa48("977", "978", "979"), vals || (stryMutAct_9fa48("980") ? ["Stryker was here"] : (stryCov_9fa48("980"), [])))).filter(Boolean))));
              aggregatedAttributes[key] = values;
            }
          }
          // Merge from variations
          for (const v of stryMutAct_9fa48("983") ? product.variations && [] : stryMutAct_9fa48("982") ? false : stryMutAct_9fa48("981") ? true : (stryCov_9fa48("981", "982", "983"), product.variations || (stryMutAct_9fa48("984") ? ["Stryker was here"] : (stryCov_9fa48("984"), [])))) {
            if (stryMutAct_9fa48("985")) {
              {}
            } else {
              stryCov_9fa48("985");
              for (const [key, val] of Object.entries(stryMutAct_9fa48("988") ? v.attributeAssignments && {} : stryMutAct_9fa48("987") ? false : stryMutAct_9fa48("986") ? true : (stryCov_9fa48("986", "987", "988"), v.attributeAssignments || {}))) {
                if (stryMutAct_9fa48("989")) {
                  {}
                } else {
                  stryCov_9fa48("989");
                  const existing = stryMutAct_9fa48("992") ? aggregatedAttributes[key] && [] : stryMutAct_9fa48("991") ? false : stryMutAct_9fa48("990") ? true : (stryCov_9fa48("990", "991", "992"), aggregatedAttributes[key] || (stryMutAct_9fa48("993") ? ["Stryker was here"] : (stryCov_9fa48("993"), [])));
                  if (stryMutAct_9fa48("996") ? val || !existing.includes(val) : stryMutAct_9fa48("995") ? false : stryMutAct_9fa48("994") ? true : (stryCov_9fa48("994", "995", "996"), val && (stryMutAct_9fa48("997") ? existing.includes(val) : (stryCov_9fa48("997"), !existing.includes(val))))) existing.push(val);
                  aggregatedAttributes[key] = existing;
                }
              }
            }
          }
          const row: Record<string, string> = stryMutAct_9fa48("998") ? {} : (stryCov_9fa48("998"), {
            ID: stryMutAct_9fa48("999") ? "Stryker was here!" : (stryCov_9fa48("999"), ''),
            // Will be auto-generated by WooCommerce
            post_title: product.title,
            post_name: (stryMutAct_9fa48("1002") ? product.slug || product.slug.trim() !== '' : stryMutAct_9fa48("1001") ? false : stryMutAct_9fa48("1000") ? true : (stryCov_9fa48("1000", "1001", "1002"), product.slug && (stryMutAct_9fa48("1004") ? product.slug.trim() === '' : stryMutAct_9fa48("1003") ? true : (stryCov_9fa48("1003", "1004"), (stryMutAct_9fa48("1005") ? product.slug : (stryCov_9fa48("1005"), product.slug.trim())) !== (stryMutAct_9fa48("1006") ? "Stryker was here!" : (stryCov_9fa48("1006"), '')))))) ? product.slug : product.sku ? stryMutAct_9fa48("1007") ? product.sku.toUpperCase() : (stryCov_9fa48("1007"), product.sku.toLowerCase()) : stryMutAct_9fa48("1008") ? `` : (stryCov_9fa48("1008"), `product-${stryMutAct_9fa48("1009") ? index - 1 : (stryCov_9fa48("1009"), index + 1)}`),
            post_status: stryMutAct_9fa48("1010") ? "" : (stryCov_9fa48("1010"), 'publish'),
            post_content: stryMutAct_9fa48("1013") ? product.description && '' : stryMutAct_9fa48("1012") ? false : stryMutAct_9fa48("1011") ? true : (stryCov_9fa48("1011", "1012", "1013"), product.description || (stryMutAct_9fa48("1014") ? "Stryker was here!" : (stryCov_9fa48("1014"), ''))),
            post_excerpt: stryMutAct_9fa48("1017") ? product.shortDescription && '' : stryMutAct_9fa48("1016") ? false : stryMutAct_9fa48("1015") ? true : (stryCov_9fa48("1015", "1016", "1017"), product.shortDescription || (stryMutAct_9fa48("1018") ? "Stryker was here!" : (stryCov_9fa48("1018"), ''))),
            post_parent: stryMutAct_9fa48("1019") ? "Stryker was here!" : (stryCov_9fa48("1019"), ''),
            // Empty for parent products
            post_type: stryMutAct_9fa48("1020") ? "" : (stryCov_9fa48("1020"), 'product'),
            menu_order: stryMutAct_9fa48("1021") ? "" : (stryCov_9fa48("1021"), '0'),
            sku: product.sku,
            stock_status: product.stockStatus,
            images: product.images.join(stryMutAct_9fa48("1022") ? "" : (stryCov_9fa48("1022"), '|')),
            'tax:product_type': product.productType,
            'tax:product_cat': product.category,
            description: stryMutAct_9fa48("1025") ? product.description && '' : stryMutAct_9fa48("1024") ? false : stryMutAct_9fa48("1023") ? true : (stryCov_9fa48("1023", "1024", "1025"), product.description || (stryMutAct_9fa48("1026") ? "Stryker was here!" : (stryCov_9fa48("1026"), ''))),
            regular_price: stryMutAct_9fa48("1029") ? product.regularPrice && '0' : stryMutAct_9fa48("1028") ? false : stryMutAct_9fa48("1027") ? true : (stryCov_9fa48("1027", "1028", "1029"), product.regularPrice || (stryMutAct_9fa48("1030") ? "" : (stryCov_9fa48("1030"), '0'))),
            sale_price: stryMutAct_9fa48("1033") ? product.salePrice && '' : stryMutAct_9fa48("1032") ? false : stryMutAct_9fa48("1031") ? true : (stryCov_9fa48("1031", "1032", "1033"), product.salePrice || (stryMutAct_9fa48("1034") ? "Stryker was here!" : (stryCov_9fa48("1034"), '')))
          });

          // Add attributes per Woo CSV Import Suite rules
          // attribute:<Name> = pipe-separated values
          // attribute_default:<Name> = default value (variable products)
          // attribute_data:<Name> = position|visible|variation (variation flag only for variable products)
          const isVariable = stryMutAct_9fa48("1037") ? product.productType !== 'variable' : stryMutAct_9fa48("1036") ? false : stryMutAct_9fa48("1035") ? true : (stryCov_9fa48("1035", "1036", "1037"), product.productType === (stryMutAct_9fa48("1038") ? "" : (stryCov_9fa48("1038"), 'variable')));
          let position = 0;
          const firstVariation = (stryMutAct_9fa48("1041") ? product.variations && [] : stryMutAct_9fa48("1040") ? false : stryMutAct_9fa48("1039") ? true : (stryCov_9fa48("1039", "1040", "1041"), product.variations || (stryMutAct_9fa48("1042") ? ["Stryker was here"] : (stryCov_9fa48("1042"), []))))[0];
          for (const [rawName, values] of Object.entries(aggregatedAttributes)) {
            if (stryMutAct_9fa48("1043")) {
              {}
            } else {
              stryCov_9fa48("1043");
              const displayName = this.attributeDisplayName(rawName);
              const headerName = displayName; // use local attribute naming like in examples (e.g., Color, Size)

              row[stryMutAct_9fa48("1044") ? `` : (stryCov_9fa48("1044"), `attribute:${headerName}`)] = (stryMutAct_9fa48("1047") ? values && [] : stryMutAct_9fa48("1046") ? false : stryMutAct_9fa48("1045") ? true : (stryCov_9fa48("1045", "1046", "1047"), values || (stryMutAct_9fa48("1048") ? ["Stryker was here"] : (stryCov_9fa48("1048"), [])))).join(stryMutAct_9fa48("1049") ? "" : (stryCov_9fa48("1049"), ' | '));
              const visible = 1;
              const isTaxonomy = (stryMutAct_9fa48("1050") ? /pa_/i : (stryCov_9fa48("1050"), /^pa_/i)).test(rawName) ? 1 : 0;
              const inVariations = isVariable ? 1 : 0;
              // position|visible|is_taxonomy|in_variations
              row[stryMutAct_9fa48("1051") ? `` : (stryCov_9fa48("1051"), `attribute_data:${headerName}`)] = stryMutAct_9fa48("1052") ? `` : (stryCov_9fa48("1052"), `${position}|${visible}|${isTaxonomy}|${inVariations}`);

              // Default attribute per first variation when variable
              if (stryMutAct_9fa48("1055") ? isVariable && firstVariation || firstVariation.attributeAssignments : stryMutAct_9fa48("1054") ? false : stryMutAct_9fa48("1053") ? true : (stryCov_9fa48("1053", "1054", "1055"), (stryMutAct_9fa48("1057") ? isVariable || firstVariation : stryMutAct_9fa48("1056") ? true : (stryCov_9fa48("1056", "1057"), isVariable && firstVariation)) && firstVariation.attributeAssignments)) {
                if (stryMutAct_9fa48("1058")) {
                  {}
                } else {
                  stryCov_9fa48("1058");
                  const fv = stryMutAct_9fa48("1061") ? (firstVariation.attributeAssignments[rawName] || firstVariation.attributeAssignments[this.cleanAttributeName(rawName)] || firstVariation.attributeAssignments[`pa_${this.cleanAttributeName(rawName)}`]) && '' : stryMutAct_9fa48("1060") ? false : stryMutAct_9fa48("1059") ? true : (stryCov_9fa48("1059", "1060", "1061"), (stryMutAct_9fa48("1063") ? (firstVariation.attributeAssignments[rawName] || firstVariation.attributeAssignments[this.cleanAttributeName(rawName)]) && firstVariation.attributeAssignments[`pa_${this.cleanAttributeName(rawName)}`] : stryMutAct_9fa48("1062") ? false : (stryCov_9fa48("1062", "1063"), (stryMutAct_9fa48("1065") ? firstVariation.attributeAssignments[rawName] && firstVariation.attributeAssignments[this.cleanAttributeName(rawName)] : stryMutAct_9fa48("1064") ? false : (stryCov_9fa48("1064", "1065"), firstVariation.attributeAssignments[rawName] || firstVariation.attributeAssignments[this.cleanAttributeName(rawName)])) || firstVariation.attributeAssignments[stryMutAct_9fa48("1066") ? `` : (stryCov_9fa48("1066"), `pa_${this.cleanAttributeName(rawName)}`)])) || (stryMutAct_9fa48("1067") ? "Stryker was here!" : (stryCov_9fa48("1067"), '')));
                  if (stryMutAct_9fa48("1069") ? false : stryMutAct_9fa48("1068") ? true : (stryCov_9fa48("1068", "1069"), fv)) {
                    if (stryMutAct_9fa48("1070")) {
                      {}
                    } else {
                      stryCov_9fa48("1070");
                      row[stryMutAct_9fa48("1071") ? `` : (stryCov_9fa48("1071"), `attribute_default:${headerName}`)] = fv;
                    }
                  }
                }
              }
              stryMutAct_9fa48("1072") ? position-- : (stryCov_9fa48("1072"), position++);
            }
          }
          return row;
        }
      });
      debug(stryMutAct_9fa48("1073") ? "" : (stryCov_9fa48("1073"), 'generateParentCsv completed'), stryMutAct_9fa48("1074") ? {} : (stryCov_9fa48("1074"), {
        rows: csvData.length
      }));
      try {
        if (stryMutAct_9fa48("1075")) {
          {}
        } else {
          stryCov_9fa48("1075");
          const buffer = await this.csvWriter.writeToBuffer(csvData, stryMutAct_9fa48("1076") ? {} : (stryCov_9fa48("1076"), {
            headers: stryMutAct_9fa48("1077") ? false : (stryCov_9fa48("1077"), true)
          }));
          return buffer.toString();
        }
      } catch (error) {
        if (stryMutAct_9fa48("1078")) {
          {}
        } else {
          stryCov_9fa48("1078");
          debug(stryMutAct_9fa48("1079") ? "" : (stryCov_9fa48("1079"), 'Error in generateParentCsv'), stryMutAct_9fa48("1080") ? {} : (stryCov_9fa48("1080"), {
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
    if (stryMutAct_9fa48("1081")) {
      {}
    } else {
      stryCov_9fa48("1081");
      const variationRows: Record<string, string>[] = stryMutAct_9fa48("1082") ? ["Stryker was here"] : (stryCov_9fa48("1082"), []);
      const attributeHeadersSet = new Set<string>();

      // DEBUG: Log what we're processing
      debug(stryMutAct_9fa48("1083") ? "" : (stryCov_9fa48("1083"), 'generateVariationCsv called with products'), stryMutAct_9fa48("1084") ? {} : (stryCov_9fa48("1084"), {
        count: products.length
      }));
      for (const product of products) {
        if (stryMutAct_9fa48("1085")) {
          {}
        } else {
          stryCov_9fa48("1085");
          debug(stryMutAct_9fa48("1086") ? "" : (stryCov_9fa48("1086"), 'Processing product for variations'), stryMutAct_9fa48("1087") ? {} : (stryCov_9fa48("1087"), {
            title: stryMutAct_9fa48("1088") ? product.title : (stryCov_9fa48("1088"), product.title.substring(0, 50)),
            productType: product.productType,
            variationsCount: product.variations.length,
            attributesCount: Object.keys(product.attributes).length,
            attributes: product.attributes
          }));
          if (stryMutAct_9fa48("1091") ? product.productType === 'variable' || product.variations.length > 0 : stryMutAct_9fa48("1090") ? false : stryMutAct_9fa48("1089") ? true : (stryCov_9fa48("1089", "1090", "1091"), (stryMutAct_9fa48("1093") ? product.productType !== 'variable' : stryMutAct_9fa48("1092") ? true : (stryCov_9fa48("1092", "1093"), product.productType === (stryMutAct_9fa48("1094") ? "" : (stryCov_9fa48("1094"), 'variable')))) && (stryMutAct_9fa48("1097") ? product.variations.length <= 0 : stryMutAct_9fa48("1096") ? product.variations.length >= 0 : stryMutAct_9fa48("1095") ? true : (stryCov_9fa48("1095", "1096", "1097"), product.variations.length > 0)))) {
            if (stryMutAct_9fa48("1098")) {
              {}
            } else {
              stryCov_9fa48("1098");
              // Collect attribute header names from product + variations
              const aggregatedAttributes: Record<string, string[]> = {};
              for (const [key, vals] of Object.entries(stryMutAct_9fa48("1101") ? product.attributes && {} : stryMutAct_9fa48("1100") ? false : stryMutAct_9fa48("1099") ? true : (stryCov_9fa48("1099", "1100", "1101"), product.attributes || {}))) {
                if (stryMutAct_9fa48("1102")) {
                  {}
                } else {
                  stryCov_9fa48("1102");
                  aggregatedAttributes[key] = Array.from(new Set(stryMutAct_9fa48("1103") ? vals || [] : (stryCov_9fa48("1103"), (stryMutAct_9fa48("1106") ? vals && [] : stryMutAct_9fa48("1105") ? false : stryMutAct_9fa48("1104") ? true : (stryCov_9fa48("1104", "1105", "1106"), vals || (stryMutAct_9fa48("1107") ? ["Stryker was here"] : (stryCov_9fa48("1107"), [])))).filter(Boolean))));
                }
              }
              for (const v of stryMutAct_9fa48("1110") ? product.variations && [] : stryMutAct_9fa48("1109") ? false : stryMutAct_9fa48("1108") ? true : (stryCov_9fa48("1108", "1109", "1110"), product.variations || (stryMutAct_9fa48("1111") ? ["Stryker was here"] : (stryCov_9fa48("1111"), [])))) {
                if (stryMutAct_9fa48("1112")) {
                  {}
                } else {
                  stryCov_9fa48("1112");
                  for (const k of Object.keys(stryMutAct_9fa48("1115") ? v.attributeAssignments && {} : stryMutAct_9fa48("1114") ? false : stryMutAct_9fa48("1113") ? true : (stryCov_9fa48("1113", "1114", "1115"), v.attributeAssignments || {}))) {
                    if (stryMutAct_9fa48("1116")) {
                      {}
                    } else {
                      stryCov_9fa48("1116");
                      const list = stryMutAct_9fa48("1119") ? aggregatedAttributes[k] && [] : stryMutAct_9fa48("1118") ? false : stryMutAct_9fa48("1117") ? true : (stryCov_9fa48("1117", "1118", "1119"), aggregatedAttributes[k] || (stryMutAct_9fa48("1120") ? ["Stryker was here"] : (stryCov_9fa48("1120"), [])));
                      aggregatedAttributes[k] = list;
                    }
                  }
                }
              }
              for (const rawName of Object.keys(aggregatedAttributes)) {
                if (stryMutAct_9fa48("1121")) {
                  {}
                } else {
                  stryCov_9fa48("1121");
                  const displayName = this.attributeDisplayName(rawName);
                  attributeHeadersSet.add(stryMutAct_9fa48("1122") ? `` : (stryCov_9fa48("1122"), `meta:attribute_${displayName}`));
                }
              }
              debug(stryMutAct_9fa48("1123") ? "" : (stryCov_9fa48("1123"), 'Product is variable, processing variations'));
              for (const variation of product.variations) {
                if (stryMutAct_9fa48("1124")) {
                  {}
                } else {
                  stryCov_9fa48("1124");
                  const row: Record<string, string> = stryMutAct_9fa48("1125") ? {} : (stryCov_9fa48("1125"), {
                    ID: stryMutAct_9fa48("1126") ? "Stryker was here!" : (stryCov_9fa48("1126"), ''),
                    // Will be auto-generated by WooCommerce
                    post_type: stryMutAct_9fa48("1127") ? "" : (stryCov_9fa48("1127"), 'product_variation'),
                    post_status: stryMutAct_9fa48("1128") ? "" : (stryCov_9fa48("1128"), 'publish'),
                    parent_sku: product.sku,
                    post_title: stryMutAct_9fa48("1129") ? `` : (stryCov_9fa48("1129"), `${product.title} - ${Object.values(stryMutAct_9fa48("1132") ? variation.attributeAssignments && {} : stryMutAct_9fa48("1131") ? false : stryMutAct_9fa48("1130") ? true : (stryCov_9fa48("1130", "1131", "1132"), variation.attributeAssignments || {})).join(stryMutAct_9fa48("1133") ? "" : (stryCov_9fa48("1133"), ', '))}`),
                    post_name: stryMutAct_9fa48("1134") ? `${product.slug || product.sku}-${variation.sku}`.toUpperCase() : (stryCov_9fa48("1134"), (stryMutAct_9fa48("1135") ? `` : (stryCov_9fa48("1135"), `${stryMutAct_9fa48("1138") ? product.slug && product.sku : stryMutAct_9fa48("1137") ? false : stryMutAct_9fa48("1136") ? true : (stryCov_9fa48("1136", "1137", "1138"), product.slug || product.sku)}-${variation.sku}`)).toLowerCase()),
                    post_content: stryMutAct_9fa48("1141") ? product.description && '' : stryMutAct_9fa48("1140") ? false : stryMutAct_9fa48("1139") ? true : (stryCov_9fa48("1139", "1140", "1141"), product.description || (stryMutAct_9fa48("1142") ? "Stryker was here!" : (stryCov_9fa48("1142"), ''))),
                    post_excerpt: stryMutAct_9fa48("1145") ? product.shortDescription && '' : stryMutAct_9fa48("1144") ? false : stryMutAct_9fa48("1143") ? true : (stryCov_9fa48("1143", "1144", "1145"), product.shortDescription || (stryMutAct_9fa48("1146") ? "Stryker was here!" : (stryCov_9fa48("1146"), ''))),
                    menu_order: stryMutAct_9fa48("1147") ? "" : (stryCov_9fa48("1147"), '0'),
                    sku: variation.sku,
                    stock_status: variation.stockStatus,
                    regular_price: variation.regularPrice,
                    sale_price: stryMutAct_9fa48("1150") ? variation.salePrice && '' : stryMutAct_9fa48("1149") ? false : stryMutAct_9fa48("1148") ? true : (stryCov_9fa48("1148", "1149", "1150"), variation.salePrice || (stryMutAct_9fa48("1151") ? "Stryker was here!" : (stryCov_9fa48("1151"), ''))),
                    tax_class: stryMutAct_9fa48("1154") ? variation.taxClass && 'parent' : stryMutAct_9fa48("1153") ? false : stryMutAct_9fa48("1152") ? true : (stryCov_9fa48("1152", "1153", "1154"), variation.taxClass || (stryMutAct_9fa48("1155") ? "" : (stryCov_9fa48("1155"), 'parent'))),
                    images: ((variation.images[0] || product.images[0] || '') as string).toString()
                  });

                  // Add attribute values per variation using meta:attribute_Name columns as in examples
                  const assignments = stryMutAct_9fa48("1158") ? variation.attributeAssignments && {} : stryMutAct_9fa48("1157") ? false : stryMutAct_9fa48("1156") ? true : (stryCov_9fa48("1156", "1157", "1158"), variation.attributeAssignments || {});
                  // Ensure all known attribute headers exist on this row (fill missing as empty)
                  for (const header of attributeHeadersSet) {
                    if (stryMutAct_9fa48("1159")) {
                      {}
                    } else {
                      stryCov_9fa48("1159");
                      row[header] = stryMutAct_9fa48("1162") ? row[header] && '' : stryMutAct_9fa48("1161") ? false : stryMutAct_9fa48("1160") ? true : (stryCov_9fa48("1160", "1161", "1162"), row[header] || (stryMutAct_9fa48("1163") ? "Stryker was here!" : (stryCov_9fa48("1163"), '')));
                    }
                  }
                  for (const [rawName, attrValue] of Object.entries(assignments)) {
                    if (stryMutAct_9fa48("1164")) {
                      {}
                    } else {
                      stryCov_9fa48("1164");
                      const displayName = this.attributeDisplayName(rawName);
                      const header = stryMutAct_9fa48("1165") ? `` : (stryCov_9fa48("1165"), `meta:attribute_${displayName}`);
                      row[header] = attrValue;
                    }
                  }
                  variationRows.push(row);
                }
              }
            }
          } else {
            if (stryMutAct_9fa48("1166")) {
              {}
            } else {
              stryCov_9fa48("1166");
              debug(stryMutAct_9fa48("1167") ? "" : (stryCov_9fa48("1167"), 'Product is NOT variable or has no variations'), stryMutAct_9fa48("1168") ? {} : (stryCov_9fa48("1168"), {
                productType: product.productType,
                variationsCount: product.variations.length
              }));
            }
          }
        }
      }
      debug(stryMutAct_9fa48("1169") ? "" : (stryCov_9fa48("1169"), 'Final variation rows count'), stryMutAct_9fa48("1170") ? {} : (stryCov_9fa48("1170"), {
        count: variationRows.length
      }));
      if (stryMutAct_9fa48("1173") ? variationRows.length !== 0 : stryMutAct_9fa48("1172") ? false : stryMutAct_9fa48("1171") ? true : (stryCov_9fa48("1171", "1172", "1173"), variationRows.length === 0)) {
        if (stryMutAct_9fa48("1174")) {
          {}
        } else {
          stryCov_9fa48("1174");
          return stryMutAct_9fa48("1175") ? "Stryker was here!" : (stryCov_9fa48("1175"), '');
        }
      }

      // Build stable headers: base columns + any dynamic meta:attribute_* columns discovered across products
      const baseHeaders = stryMutAct_9fa48("1176") ? [] : (stryCov_9fa48("1176"), [stryMutAct_9fa48("1177") ? "" : (stryCov_9fa48("1177"), 'ID'), stryMutAct_9fa48("1178") ? "" : (stryCov_9fa48("1178"), 'post_type'), stryMutAct_9fa48("1179") ? "" : (stryCov_9fa48("1179"), 'post_status'), stryMutAct_9fa48("1180") ? "" : (stryCov_9fa48("1180"), 'parent_sku'), stryMutAct_9fa48("1181") ? "" : (stryCov_9fa48("1181"), 'post_title'), stryMutAct_9fa48("1182") ? "" : (stryCov_9fa48("1182"), 'post_name'), stryMutAct_9fa48("1183") ? "" : (stryCov_9fa48("1183"), 'post_content'), stryMutAct_9fa48("1184") ? "" : (stryCov_9fa48("1184"), 'post_excerpt'), stryMutAct_9fa48("1185") ? "" : (stryCov_9fa48("1185"), 'menu_order'), stryMutAct_9fa48("1186") ? "" : (stryCov_9fa48("1186"), 'sku'), stryMutAct_9fa48("1187") ? "" : (stryCov_9fa48("1187"), 'stock_status'), stryMutAct_9fa48("1188") ? "" : (stryCov_9fa48("1188"), 'regular_price'), stryMutAct_9fa48("1189") ? "" : (stryCov_9fa48("1189"), 'sale_price'), stryMutAct_9fa48("1190") ? "" : (stryCov_9fa48("1190"), 'tax_class'), stryMutAct_9fa48("1191") ? "" : (stryCov_9fa48("1191"), 'images')]);
      const dynamicHeaders = stryMutAct_9fa48("1192") ? Array.from(attributeHeadersSet) : (stryCov_9fa48("1192"), Array.from(attributeHeadersSet).sort());
      const headers = stryMutAct_9fa48("1193") ? [] : (stryCov_9fa48("1193"), [...baseHeaders, ...dynamicHeaders]);
      debug(stryMutAct_9fa48("1194") ? "" : (stryCov_9fa48("1194"), 'generateVariationCsv completed'), stryMutAct_9fa48("1195") ? {} : (stryCov_9fa48("1195"), {
        rows: variationRows.length,
        headers
      }));
      try {
        if (stryMutAct_9fa48("1196")) {
          {}
        } else {
          stryCov_9fa48("1196");
          const buffer = await this.csvWriter.writeToBuffer(variationRows, stryMutAct_9fa48("1197") ? {} : (stryCov_9fa48("1197"), {
            headers
          }));
          return buffer.toString();
        }
      } catch (error) {
        if (stryMutAct_9fa48("1198")) {
          {}
        } else {
          stryCov_9fa48("1198");
          debug(stryMutAct_9fa48("1199") ? "" : (stryCov_9fa48("1199"), 'Error in generateVariationCsv'), stryMutAct_9fa48("1200") ? {} : (stryCov_9fa48("1200"), {
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
    if (stryMutAct_9fa48("1201")) {
      {}
    } else {
      stryCov_9fa48("1201");
      debug(stryMutAct_9fa48("1202") ? "" : (stryCov_9fa48("1202"), 'generateBothCsvs called with products'), stryMutAct_9fa48("1203") ? {} : (stryCov_9fa48("1203"), {
        count: products.length
      }));
      const [parentCsv, variationCsv] = await Promise.all(stryMutAct_9fa48("1204") ? [] : (stryCov_9fa48("1204"), [this.generateParentCsv(products), this.generateVariationCsv(products)]));
      const variationCount = stryMutAct_9fa48("1205") ? products.reduce((sum, p) => sum + p.variations.length, 0) : (stryCov_9fa48("1205"), products.filter(stryMutAct_9fa48("1206") ? () => undefined : (stryCov_9fa48("1206"), p => stryMutAct_9fa48("1209") ? p.productType !== 'variable' : stryMutAct_9fa48("1208") ? false : stryMutAct_9fa48("1207") ? true : (stryCov_9fa48("1207", "1208", "1209"), p.productType === (stryMutAct_9fa48("1210") ? "" : (stryCov_9fa48("1210"), 'variable'))))).reduce(stryMutAct_9fa48("1211") ? () => undefined : (stryCov_9fa48("1211"), (sum, p) => stryMutAct_9fa48("1212") ? sum - p.variations.length : (stryCov_9fa48("1212"), sum + p.variations.length)), 0));
      debug(stryMutAct_9fa48("1213") ? "" : (stryCov_9fa48("1213"), 'generateBothCsvs results'), stryMutAct_9fa48("1214") ? {} : (stryCov_9fa48("1214"), {
        productCount: products.length,
        variationCount,
        parentCsvLength: parentCsv.length,
        variationCsvLength: variationCsv.length,
        productsWithVariations: stryMutAct_9fa48("1215") ? products.length : (stryCov_9fa48("1215"), products.filter(stryMutAct_9fa48("1216") ? () => undefined : (stryCov_9fa48("1216"), p => stryMutAct_9fa48("1219") ? p.productType !== 'variable' : stryMutAct_9fa48("1218") ? false : stryMutAct_9fa48("1217") ? true : (stryCov_9fa48("1217", "1218", "1219"), p.productType === (stryMutAct_9fa48("1220") ? "" : (stryCov_9fa48("1220"), 'variable'))))).length),
        productTypes: products.map(stryMutAct_9fa48("1221") ? () => undefined : (stryCov_9fa48("1221"), p => p.productType))
      }));
      return stryMutAct_9fa48("1222") ? {} : (stryCov_9fa48("1222"), {
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
    if (stryMutAct_9fa48("1223")) {
      {}
    } else {
      stryCov_9fa48("1223");
      return stryMutAct_9fa48("1225") ? name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').toLowerCase() : stryMutAct_9fa48("1224") ? name.trim().replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').toUpperCase() : (stryCov_9fa48("1224", "1225"), name.trim().replace(stryMutAct_9fa48("1227") ? /[^a-zA-Z0-9\S]/g : stryMutAct_9fa48("1226") ? /[a-zA-Z0-9\s]/g : (stryCov_9fa48("1226", "1227"), /[^a-zA-Z0-9\s]/g), stryMutAct_9fa48("1228") ? "Stryker was here!" : (stryCov_9fa48("1228"), '')).replace(stryMutAct_9fa48("1230") ? /\S+/g : stryMutAct_9fa48("1229") ? /\s/g : (stryCov_9fa48("1229", "1230"), /\s+/g), stryMutAct_9fa48("1231") ? "" : (stryCov_9fa48("1231"), '_')).toLowerCase());
    }
  }

  /**
   * Turn raw attribute keys into display names like in examples (Color, Size)
   */
  private attributeDisplayName(rawName: string): string {
    if (stryMutAct_9fa48("1232")) {
      {}
    } else {
      stryCov_9fa48("1232");
      const withoutPrefix = rawName.replace(stryMutAct_9fa48("1233") ? /pa_/i : (stryCov_9fa48("1233"), /^pa_/i), stryMutAct_9fa48("1234") ? "Stryker was here!" : (stryCov_9fa48("1234"), ''));
      const cleaned = stryMutAct_9fa48("1236") ? withoutPrefix.replace(/[_-]+/g, ' ').toLowerCase() : stryMutAct_9fa48("1235") ? withoutPrefix.replace(/[_-]+/g, ' ').trim().toUpperCase() : (stryCov_9fa48("1235", "1236"), withoutPrefix.replace(stryMutAct_9fa48("1238") ? /[^_-]+/g : stryMutAct_9fa48("1237") ? /[_-]/g : (stryCov_9fa48("1237", "1238"), /[_-]+/g), stryMutAct_9fa48("1239") ? "" : (stryCov_9fa48("1239"), ' ')).trim().toLowerCase());
      return cleaned.replace(stryMutAct_9fa48("1240") ? /\b\W/g : (stryCov_9fa48("1240"), /\b\w/g), stryMutAct_9fa48("1241") ? () => undefined : (stryCov_9fa48("1241"), c => stryMutAct_9fa48("1242") ? c.toLowerCase() : (stryCov_9fa48("1242"), c.toUpperCase())));
    }
  }

  /**
   * Deduplicate products based on SKU and title
   */
  private deduplicateProducts(products: NormalizedProduct[]): NormalizedProduct[] {
    if (stryMutAct_9fa48("1243")) {
      {}
    } else {
      stryCov_9fa48("1243");
      const seen = new Map<string, NormalizedProduct>();
      const uniqueProducts: NormalizedProduct[] = stryMutAct_9fa48("1244") ? ["Stryker was here"] : (stryCov_9fa48("1244"), []);
      for (const product of products) {
        if (stryMutAct_9fa48("1245")) {
          {}
        } else {
          stryCov_9fa48("1245");
          if (stryMutAct_9fa48("1248") ? !product.sku && !product.title : stryMutAct_9fa48("1247") ? false : stryMutAct_9fa48("1246") ? true : (stryCov_9fa48("1246", "1247", "1248"), (stryMutAct_9fa48("1249") ? product.sku : (stryCov_9fa48("1249"), !product.sku)) || (stryMutAct_9fa48("1250") ? product.title : (stryCov_9fa48("1250"), !product.title)))) {
            if (stryMutAct_9fa48("1251")) {
              {}
            } else {
              stryCov_9fa48("1251");
              // Skip products without SKU or title silently
              continue;
            }
          }
          const key = stryMutAct_9fa48("1252") ? `` : (stryCov_9fa48("1252"), `${product.sku}-${product.title}`);
          if (stryMutAct_9fa48("1255") ? false : stryMutAct_9fa48("1254") ? true : stryMutAct_9fa48("1253") ? seen.has(key) : (stryCov_9fa48("1253", "1254", "1255"), !seen.has(key))) {
            if (stryMutAct_9fa48("1256")) {
              {}
            } else {
              stryCov_9fa48("1256");
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
    if (stryMutAct_9fa48("1257")) {
      {}
    } else {
      stryCov_9fa48("1257");
      if (stryMutAct_9fa48("1260") ? products.length !== 0 : stryMutAct_9fa48("1259") ? false : stryMutAct_9fa48("1258") ? true : (stryCov_9fa48("1258", "1259", "1260"), products.length === 0)) {
        if (stryMutAct_9fa48("1261")) {
          {}
        } else {
          stryCov_9fa48("1261");
          return stryMutAct_9fa48("1262") ? `` : (stryCov_9fa48("1262"), `scraped-products-${jobId}.csv`);
        }
      }

      // Try to extract category from products
      const categories = stryMutAct_9fa48("1264") ? products.map(p => p.category).slice(0, 3) : stryMutAct_9fa48("1263") ? products.map(p => p.category).filter(cat => cat && cat !== 'Uncategorized') : (stryCov_9fa48("1263", "1264"), products.map(stryMutAct_9fa48("1265") ? () => undefined : (stryCov_9fa48("1265"), p => p.category)).filter(stryMutAct_9fa48("1266") ? () => undefined : (stryCov_9fa48("1266"), cat => stryMutAct_9fa48("1269") ? cat || cat !== 'Uncategorized' : stryMutAct_9fa48("1268") ? false : stryMutAct_9fa48("1267") ? true : (stryCov_9fa48("1267", "1268", "1269"), cat && (stryMutAct_9fa48("1271") ? cat === 'Uncategorized' : stryMutAct_9fa48("1270") ? true : (stryCov_9fa48("1270", "1271"), cat !== (stryMutAct_9fa48("1272") ? "" : (stryCov_9fa48("1272"), 'Uncategorized'))))))).slice(0, 3)); // Take first 3 categories

      if (stryMutAct_9fa48("1276") ? categories.length <= 0 : stryMutAct_9fa48("1275") ? categories.length >= 0 : stryMutAct_9fa48("1274") ? false : stryMutAct_9fa48("1273") ? true : (stryCov_9fa48("1273", "1274", "1275", "1276"), categories.length > 0)) {
        if (stryMutAct_9fa48("1277")) {
          {}
        } else {
          stryCov_9fa48("1277");
          const categoryPart = stryMutAct_9fa48("1278") ? categories.join('-').toUpperCase() : (stryCov_9fa48("1278"), categories.join(stryMutAct_9fa48("1279") ? "" : (stryCov_9fa48("1279"), '-')).toLowerCase());
          return stryMutAct_9fa48("1280") ? `` : (stryCov_9fa48("1280"), `${categoryPart}-${jobId}.csv`);
        }
      }

      // Fallback to product count
      return stryMutAct_9fa48("1281") ? `` : (stryCov_9fa48("1281"), `products-${products.length}-${jobId}.csv`);
    }
  }

  /**
   * Validate CSV data before generation
   */
  validateProducts(products: NormalizedProduct[]): {
    valid: boolean;
    errors: string[];
  } {
    if (stryMutAct_9fa48("1282")) {
      {}
    } else {
      stryCov_9fa48("1282");
      const errors: string[] = stryMutAct_9fa48("1283") ? ["Stryker was here"] : (stryCov_9fa48("1283"), []);
      for (let i = 0; stryMutAct_9fa48("1286") ? i >= products.length : stryMutAct_9fa48("1285") ? i <= products.length : stryMutAct_9fa48("1284") ? false : (stryCov_9fa48("1284", "1285", "1286"), i < products.length); stryMutAct_9fa48("1287") ? i-- : (stryCov_9fa48("1287"), i++)) {
        if (stryMutAct_9fa48("1288")) {
          {}
        } else {
          stryCov_9fa48("1288");
          const product = products[i];
          if (stryMutAct_9fa48("1291") ? false : stryMutAct_9fa48("1290") ? true : stryMutAct_9fa48("1289") ? product?.sku : (stryCov_9fa48("1289", "1290", "1291"), !(stryMutAct_9fa48("1292") ? product.sku : (stryCov_9fa48("1292"), product?.sku)))) {
            if (stryMutAct_9fa48("1293")) {
              {}
            } else {
              stryCov_9fa48("1293");
              errors.push(stryMutAct_9fa48("1294") ? `` : (stryCov_9fa48("1294"), `Product ${stryMutAct_9fa48("1295") ? i - 1 : (stryCov_9fa48("1295"), i + 1)}: Missing SKU`));
            }
          }
          if (stryMutAct_9fa48("1298") ? false : stryMutAct_9fa48("1297") ? true : stryMutAct_9fa48("1296") ? product?.title : (stryCov_9fa48("1296", "1297", "1298"), !(stryMutAct_9fa48("1299") ? product.title : (stryCov_9fa48("1299"), product?.title)))) {
            if (stryMutAct_9fa48("1300")) {
              {}
            } else {
              stryCov_9fa48("1300");
              errors.push(stryMutAct_9fa48("1301") ? `` : (stryCov_9fa48("1301"), `Product ${stryMutAct_9fa48("1302") ? i - 1 : (stryCov_9fa48("1302"), i + 1)}: Missing title`));
            }
          }
          if (stryMutAct_9fa48("1305") ? product?.productType !== 'variable' : stryMutAct_9fa48("1304") ? false : stryMutAct_9fa48("1303") ? true : (stryCov_9fa48("1303", "1304", "1305"), (stryMutAct_9fa48("1306") ? product.productType : (stryCov_9fa48("1306"), product?.productType)) === (stryMutAct_9fa48("1307") ? "" : (stryCov_9fa48("1307"), 'variable')))) {
            if (stryMutAct_9fa48("1308")) {
              {}
            } else {
              stryCov_9fa48("1308");
              for (let j = 0; stryMutAct_9fa48("1311") ? j >= (product?.variations?.length || 0) : stryMutAct_9fa48("1310") ? j <= (product?.variations?.length || 0) : stryMutAct_9fa48("1309") ? false : (stryCov_9fa48("1309", "1310", "1311"), j < (stryMutAct_9fa48("1314") ? product?.variations?.length && 0 : stryMutAct_9fa48("1313") ? false : stryMutAct_9fa48("1312") ? true : (stryCov_9fa48("1312", "1313", "1314"), (stryMutAct_9fa48("1316") ? product.variations?.length : stryMutAct_9fa48("1315") ? product?.variations.length : (stryCov_9fa48("1315", "1316"), product?.variations?.length)) || 0))); stryMutAct_9fa48("1317") ? j-- : (stryCov_9fa48("1317"), j++)) {
                if (stryMutAct_9fa48("1318")) {
                  {}
                } else {
                  stryCov_9fa48("1318");
                  const variation = stryMutAct_9fa48("1320") ? product.variations?.[j] : stryMutAct_9fa48("1319") ? product?.variations[j] : (stryCov_9fa48("1319", "1320"), product?.variations?.[j]);
                  if (stryMutAct_9fa48("1323") ? false : stryMutAct_9fa48("1322") ? true : stryMutAct_9fa48("1321") ? variation?.sku : (stryCov_9fa48("1321", "1322", "1323"), !(stryMutAct_9fa48("1324") ? variation.sku : (stryCov_9fa48("1324"), variation?.sku)))) {
                    if (stryMutAct_9fa48("1325")) {
                      {}
                    } else {
                      stryCov_9fa48("1325");
                      errors.push(stryMutAct_9fa48("1326") ? `` : (stryCov_9fa48("1326"), `Product ${stryMutAct_9fa48("1327") ? i - 1 : (stryCov_9fa48("1327"), i + 1)}, Variation ${stryMutAct_9fa48("1328") ? j - 1 : (stryCov_9fa48("1328"), j + 1)}: Missing SKU`));
                    }
                  }
                }
              }
            }
          }
        }
      }
      return stryMutAct_9fa48("1329") ? {} : (stryCov_9fa48("1329"), {
        valid: stryMutAct_9fa48("1332") ? errors.length !== 0 : stryMutAct_9fa48("1331") ? false : stryMutAct_9fa48("1330") ? true : (stryCov_9fa48("1330", "1331", "1332"), errors.length === 0),
        errors
      });
    }
  }

  // Static methods for backward compatibility (deprecated)
  /**
   * @deprecated Use instance method instead
   */
  static async generateParentCsv(products: NormalizedProduct[]): Promise<string> {
    if (stryMutAct_9fa48("1333")) {
      {}
    } else {
      stryCov_9fa48("1333");
      const generator = new CsvGenerator();
      return generator.generateParentCsv(products);
    }
  }

  /**
   * @deprecated Use instance method instead
   */
  static async generateVariationCsv(products: NormalizedProduct[]): Promise<string> {
    if (stryMutAct_9fa48("1334")) {
      {}
    } else {
      stryCov_9fa48("1334");
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
    if (stryMutAct_9fa48("1335")) {
      {}
    } else {
      stryCov_9fa48("1335");
      const generator = new CsvGenerator();
      return generator.generateBothCsvs(products);
    }
  }

  /**
   * @deprecated Use instance method instead
   */
  static generateFilename(products: NormalizedProduct[], jobId: string): string {
    if (stryMutAct_9fa48("1336")) {
      {}
    } else {
      stryCov_9fa48("1336");
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
    if (stryMutAct_9fa48("1337")) {
      {}
    } else {
      stryCov_9fa48("1337");
      const generator = new CsvGenerator();
      return generator.validateProducts(products);
    }
  }
}