// @ts-nocheck
import { parseCsvRows, createCsvValidator } from './csv-parsing';
// Local validation result type for tests
export type WooCommerceValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

/**
 * WooCommerce-specific test matchers and assertions
 * Provides specialized matchers for testing WooCommerce CSV generation
 */

export interface WooCommerceCsvMatchers {
  /**
   * Check if CSV has all required WooCommerce parent columns
   */
  toHaveWooCommerceParentColumns: (csvContent: string) => {
    pass: boolean;
    message: () => string;
  };

  /**
   * Check if CSV has all required WooCommerce variation columns
   */
  toHaveWooCommerceVariationColumns: (csvContent: string) => {
    pass: boolean;
    message: () => string;
  };

  /**
   * Check if parent CSV has proper attribute column pairs
   */
  toHaveAttributeColumnPairs: (
    csvContent: string,
    expectedAttributes: string[],
  ) => {
    pass: boolean;
    message: () => string;
  };

  /**
   * Check if variation CSV has proper meta attribute columns
   */
  toHaveMetaAttributeColumns: (
    csvContent: string,
    expectedAttributes: string[],
  ) => {
    pass: boolean;
    message: () => string;
  };

  /**
   * Check if attribute data flags are properly formatted
   */
  toHaveValidAttributeDataFlags: (
    csvContent: string,
    attributeName: string,
  ) => {
    pass: boolean;
    message: () => string;
  };

  /**
   * Check if variation attribute values match parent options
   */
  toHaveMatchingVariationAttributes: (
    parentCsv: string,
    variationCsv: string,
  ) => {
    pass: boolean;
    message: () => string;
  };

  /**
   * Check if CSV has proper WooCommerce product type
   */
  toHaveWooCommerceProductType: (
    csvContent: string,
    expectedType: 'simple' | 'variable' | 'product_variation',
  ) => {
    pass: boolean;
    message: () => string;
  };

  /**
   * Check if CSV has proper stock status values
   */
  toHaveValidStockStatus: (csvContent: string) => {
    pass: boolean;
    message: () => string;
  };

  /**
   * Check if CSV has proper price format
   */
  toHaveValidPriceFormat: (csvContent: string) => {
    pass: boolean;
    message: () => string;
  };

  /**
   * Check if parent SKU references are valid in variations
   */
  toHaveValidParentSkuReferences: (
    parentCsv: string,
    variationCsv: string,
  ) => {
    pass: boolean;
    message: () => string;
  };
}

/**
 * Required WooCommerce parent CSV columns
 */
const REQUIRED_PARENT_COLUMNS = [
  'ID',
  'post_title',
  'post_name',
  'post_status',
  'post_content',
  'post_excerpt',
  'post_parent',
  'post_type',
  'menu_order',
  'sku',
  'stock_status',
  'images',
  'tax:product_type',
  'tax:product_cat',
  'description',
  'regular_price',
  'sale_price',
];

/**
 * Required WooCommerce variation CSV columns
 */
const REQUIRED_VARIATION_COLUMNS = [
  'ID',
  'post_type',
  'post_status',
  'parent_sku',
  'post_title',
  'post_name',
  'post_content',
  'post_excerpt',
  'menu_order',
  'sku',
  'stock_status',
  'regular_price',
  'sale_price',
  'tax_class',
  'images',
];

/**
 * Valid stock status values
 */
const VALID_STOCK_STATUSES = ['instock', 'outofstock', 'onbackorder'];

// Valid product types are defined inline where needed

/**
 * Price format regex
 */
const PRICE_FORMAT_REGEX = /^\d+(\.\d{2})?$/;

/**
 * Attribute data flags format regex
 */
const ATTRIBUTE_DATA_FLAGS_REGEX = /^\d+\|\d+\|\d+\|\d+$/;

/**
 * Create WooCommerce-specific test matchers
 */
export function createWooCommerceMatchers(): WooCommerceCsvMatchers {
  return {
    toHaveWooCommerceParentColumns: (csvContent: string) => {
      const validator = createCsvValidator(csvContent);
      const result = validator.hasColumns(REQUIRED_PARENT_COLUMNS);

      return {
        pass: result.pass,
        message: () =>
          `Expected CSV to have all required WooCommerce parent columns. ${result.message()}`,
      };
    },

    toHaveWooCommerceVariationColumns: (csvContent: string) => {
      const validator = createCsvValidator(csvContent);
      const result = validator.hasColumns(REQUIRED_VARIATION_COLUMNS);

      return {
        pass: result.pass,
        message: () =>
          `Expected CSV to have all required WooCommerce variation columns. ${result.message()}`,
      };
    },

    toHaveAttributeColumnPairs: (csvContent: string, expectedAttributes: string[]) => {
      const { headers } = parseCsvRows(csvContent);
      const missingPairs: string[] = [];

      for (const attr of expectedAttributes) {
        const attrCol = `attribute:${attr}`;
        const dataCol = `attribute_data:${attr}`;

        if (!headers.includes(attrCol)) {
          missingPairs.push(`Missing attribute column: ${attrCol}`);
        }
        if (!headers.includes(dataCol)) {
          missingPairs.push(`Missing attribute data column: ${dataCol}`);
        }
      }

      return {
        pass: missingPairs.length === 0,
        message: () => `Expected CSV to have attribute column pairs. ${missingPairs.join(', ')}`,
      };
    },

    toHaveMetaAttributeColumns: (csvContent: string, expectedAttributes: string[]) => {
      const { headers } = parseCsvRows(csvContent);
      const missingColumns: string[] = [];

      for (const attr of expectedAttributes) {
        const metaCol = `meta:attribute_${attr}`;
        if (!headers.includes(metaCol)) {
          missingColumns.push(metaCol);
        }
      }

      return {
        pass: missingColumns.length === 0,
        message: () =>
          `Expected CSV to have meta attribute columns. Missing: ${missingColumns.join(', ')}`,
      };
    },

    toHaveValidAttributeDataFlags: (csvContent: string, attributeName: string) => {
      const { rows } = parseCsvRows(csvContent);
      const dataCol = `attribute_data:${attributeName}`;
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const flags = row[dataCol];

        if (!flags) {
          errors.push(`Row ${i + 1}: Missing attribute data flags for ${attributeName}`);
          continue;
        }

        if (!ATTRIBUTE_DATA_FLAGS_REGEX.test(flags)) {
          errors.push(`Row ${i + 1}: Invalid attribute data flags format: ${flags}`);
          continue;
        }

        const [position, visible, isTaxonomy, inVariations] = flags.split('|').map(Number);

        if (!Number.isInteger(position) || position < 0) {
          errors.push(`Row ${i + 1}: Invalid position value: ${position}`);
        }
        if (visible !== 0 && visible !== 1) {
          errors.push(`Row ${i + 1}: Invalid visible value: ${visible}. Must be 0 or 1`);
        }
        if (isTaxonomy !== 0 && isTaxonomy !== 1) {
          errors.push(`Row ${i + 1}: Invalid is_taxonomy value: ${isTaxonomy}. Must be 0 or 1`);
        }
        if (inVariations !== 0 && inVariations !== 1) {
          errors.push(`Row ${i + 1}: Invalid in_variations value: ${inVariations}. Must be 0 or 1`);
        }
      }

      return {
        pass: errors.length === 0,
        message: () => `Expected CSV to have valid attribute data flags. ${errors.join(', ')}`,
      };
    },

    toHaveMatchingVariationAttributes: (parentCsv: string, variationCsv: string) => {
      const parentData = parseCsvRows(parentCsv);
      const variationData = parseCsvRows(variationCsv);
      const errors: string[] = [];

      // Create a map of parent SKUs to their attribute options
      const parentAttributeOptions = new Map<string, Record<string, string[]>>();

      for (const parentRow of parentData.rows) {
        const sku = parentRow.sku;
        const options: Record<string, string[]> = {};

        for (const [key, value] of Object.entries(parentRow)) {
          if (key.startsWith('attribute:') && !key.includes('_data:')) {
            const attrName = key.replace('attribute:', '');
            if (value) {
              options[attrName] = value.split('|').map((opt) => opt.trim());
            }
          }
        }

        parentAttributeOptions.set(sku, options);
      }

      // Validate each variation
      for (let i = 0; i < variationData.rows.length; i++) {
        const variation = variationData.rows[i];
        const parentSku = variation.parent_sku;
        const parentOptions = parentAttributeOptions.get(parentSku);

        if (!parentOptions) {
          errors.push(`Variation row ${i + 1}: No parent found with SKU '${parentSku}'`);
          continue;
        }

        for (const [key, value] of Object.entries(variation)) {
          if (key.startsWith('meta:attribute_')) {
            const attrName = key.replace('meta:attribute_', '');
            const variationValue = value?.trim();
            const parentOptionsForAttr = parentOptions[attrName] || [];

            if (variationValue && !parentOptionsForAttr.includes(variationValue)) {
              errors.push(
                `Variation row ${i + 1}: Attribute value '${variationValue}' for '${attrName}' is not in parent options: ${parentOptionsForAttr.join(', ')}`,
              );
            }
          }
        }
      }

      return {
        pass: errors.length === 0,
        message: () =>
          `Expected variation attributes to match parent options. ${errors.join(', ')}`,
      };
    },

    toHaveWooCommerceProductType: (
      csvContent: string,
      expectedType: 'simple' | 'variable' | 'product_variation',
    ) => {
      const { rows } = parseCsvRows(csvContent);
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const productType = row['tax:product_type'] || row['post_type'];

        if (productType !== expectedType) {
          errors.push(
            `Row ${i + 1}: Expected product type '${expectedType}', but found '${productType}'`,
          );
        }
      }

      return {
        pass: errors.length === 0,
        message: () => `Expected CSV to have product type '${expectedType}'. ${errors.join(', ')}`,
      };
    },

    toHaveValidStockStatus: (csvContent: string) => {
      const { rows } = parseCsvRows(csvContent);
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const stockStatus = row.stock_status;

        if (!VALID_STOCK_STATUSES.includes(stockStatus)) {
          errors.push(
            `Row ${i + 1}: Invalid stock status '${stockStatus}'. Must be one of: ${VALID_STOCK_STATUSES.join(', ')}`,
          );
        }
      }

      return {
        pass: errors.length === 0,
        message: () => `Expected CSV to have valid stock status values. ${errors.join(', ')}`,
      };
    },

    toHaveValidPriceFormat: (csvContent: string) => {
      const { rows } = parseCsvRows(csvContent);
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        // Check regular_price
        if (row.regular_price && !PRICE_FORMAT_REGEX.test(row.regular_price)) {
          errors.push(
            `Row ${i + 1}: Invalid regular_price format '${row.regular_price}'. Must be in format: 123.45`,
          );
        }

        // Check sale_price (can be empty)
        if (row.sale_price && row.sale_price !== '' && !PRICE_FORMAT_REGEX.test(row.sale_price)) {
          errors.push(
            `Row ${i + 1}: Invalid sale_price format '${row.sale_price}'. Must be in format: 123.45 or empty`,
          );
        }
      }

      return {
        pass: errors.length === 0,
        message: () => `Expected CSV to have valid price format. ${errors.join(', ')}`,
      };
    },

    toHaveValidParentSkuReferences: (parentCsv: string, variationCsv: string) => {
      const parentData = parseCsvRows(parentCsv);
      const variationData = parseCsvRows(variationCsv);
      const parentSkus = new Set(parentData.rows.map((row) => row.sku));
      const errors: string[] = [];

      for (let i = 0; i < variationData.rows.length; i++) {
        const variation = variationData.rows[i];
        const parentSku = variation.parent_sku;

        if (!parentSkus.has(parentSku)) {
          errors.push(
            `Variation row ${i + 1}: parent_sku '${parentSku}' does not exist in parent CSV`,
          );
        }
      }

      return {
        pass: errors.length === 0,
        message: () =>
          `Expected all variation parent_sku references to be valid. ${errors.join(', ')}`,
      };
    },
  };
}

/**
 * Jest matcher extensions for WooCommerce CSV testing
 * Usage: expect.extend(woocommerceMatchers)
 */
export const woocommerceMatchers = {
  toHaveWooCommerceParentColumns: (csvContent: string) => {
    const matchers = createWooCommerceMatchers();
    return matchers.toHaveWooCommerceParentColumns(csvContent);
  },

  toHaveWooCommerceVariationColumns: (csvContent: string) => {
    const matchers = createWooCommerceMatchers();
    return matchers.toHaveWooCommerceVariationColumns(csvContent);
  },

  toHaveAttributeColumnPairs: (csvContent: string, expectedAttributes: string[]) => {
    const matchers = createWooCommerceMatchers();
    return matchers.toHaveAttributeColumnPairs(csvContent, expectedAttributes);
  },

  toHaveMetaAttributeColumns: (csvContent: string, expectedAttributes: string[]) => {
    const matchers = createWooCommerceMatchers();
    return matchers.toHaveMetaAttributeColumns(csvContent, expectedAttributes);
  },

  toHaveValidAttributeDataFlags: (csvContent: string, attributeName: string) => {
    const matchers = createWooCommerceMatchers();
    return matchers.toHaveValidAttributeDataFlags(csvContent, attributeName);
  },

  toHaveMatchingVariationAttributes: (parentCsv: string, variationCsv: string) => {
    const matchers = createWooCommerceMatchers();
    return matchers.toHaveMatchingVariationAttributes(parentCsv, variationCsv);
  },

  toHaveWooCommerceProductType: (
    csvContent: string,
    expectedType: 'simple' | 'variable' | 'product_variation',
  ) => {
    const matchers = createWooCommerceMatchers();
    return matchers.toHaveWooCommerceProductType(csvContent, expectedType);
  },

  toHaveValidStockStatus: (csvContent: string) => {
    const matchers = createWooCommerceMatchers();
    return matchers.toHaveValidStockStatus(csvContent);
  },

  toHaveValidPriceFormat: (csvContent: string) => {
    const matchers = createWooCommerceMatchers();
    return matchers.toHaveValidPriceFormat(csvContent);
  },

  toHaveValidParentSkuReferences: (parentCsv: string, variationCsv: string) => {
    const matchers = createWooCommerceMatchers();
    return matchers.toHaveValidParentSkuReferences(parentCsv, variationCsv);
  },
};

/**
 * Helper function to validate WooCommerce CSV structure
 */
export function validateWooCommerceCsvStructure(
  parentCsv: string,
  variationCsv: string,
  expectedAttributes: string[] = [],
): WooCommerceValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate parent CSV
  const parentMatchers = createWooCommerceMatchers();
  const parentColumnsResult = parentMatchers.toHaveWooCommerceParentColumns(parentCsv);
  if (!parentColumnsResult.pass) {
    errors.push(`Parent CSV: ${parentColumnsResult.message()}`);
  }

  const parentTypeResult = parentMatchers.toHaveWooCommerceProductType(parentCsv, 'variable');
  if (!parentTypeResult.pass) {
    errors.push(`Parent CSV: ${parentTypeResult.message()}`);
  }

  const parentStockResult = parentMatchers.toHaveValidStockStatus(parentCsv);
  if (!parentStockResult.pass) {
    errors.push(`Parent CSV: ${parentStockResult.message()}`);
  }

  const parentPriceResult = parentMatchers.toHaveValidPriceFormat(parentCsv);
  if (!parentPriceResult.pass) {
    errors.push(`Parent CSV: ${parentPriceResult.message()}`);
  }

  // Validate variation CSV
  if (variationCsv) {
    const variationColumnsResult = parentMatchers.toHaveWooCommerceVariationColumns(variationCsv);
    if (!variationColumnsResult.pass) {
      errors.push(`Variation CSV: ${variationColumnsResult.message()}`);
    }

    const variationTypeResult = parentMatchers.toHaveWooCommerceProductType(
      variationCsv,
      'product_variation',
    );
    if (!variationTypeResult.pass) {
      errors.push(`Variation CSV: ${variationTypeResult.message()}`);
    }

    const variationStockResult = parentMatchers.toHaveValidStockStatus(variationCsv);
    if (!variationStockResult.pass) {
      errors.push(`Variation CSV: ${variationStockResult.message()}`);
    }

    const variationPriceResult = parentMatchers.toHaveValidPriceFormat(variationCsv);
    if (!variationPriceResult.pass) {
      errors.push(`Variation CSV: ${variationPriceResult.message()}`);
    }

    const parentSkuResult = parentMatchers.toHaveValidParentSkuReferences(parentCsv, variationCsv);
    if (!parentSkuResult.pass) {
      errors.push(`Variation CSV: ${parentSkuResult.message()}`);
    }

    const matchingAttrsResult = parentMatchers.toHaveMatchingVariationAttributes(
      parentCsv,
      variationCsv,
    );
    if (!matchingAttrsResult.pass) {
      errors.push(`Variation CSV: ${matchingAttrsResult.message()}`);
    }
  }

  // Validate attributes
  if (expectedAttributes.length > 0) {
    const attrPairsResult = parentMatchers.toHaveAttributeColumnPairs(
      parentCsv,
      expectedAttributes,
    );
    if (!attrPairsResult.pass) {
      errors.push(`Parent CSV: ${attrPairsResult.message()}`);
    }

    if (variationCsv) {
      const metaAttrsResult = parentMatchers.toHaveMetaAttributeColumns(
        variationCsv,
        expectedAttributes,
      );
      if (!metaAttrsResult.pass) {
        errors.push(`Variation CSV: ${metaAttrsResult.message()}`);
      }
    }

    // Validate attribute data flags
    for (const attr of expectedAttributes) {
      const flagsResult = parentMatchers.toHaveValidAttributeDataFlags(parentCsv, attr);
      if (!flagsResult.pass) {
        errors.push(`Parent CSV: ${flagsResult.message()}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
