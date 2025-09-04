/**
 * WooCommerce Validation Schemas
 * 
 * Task 4.1: Enhanced validation schemas for WooCommerce CSV testing
 * 
 * This utility provides comprehensive validation schemas and rules
 * for testing WooCommerce CSV generation and ensuring compliance.
 */

import { parseCsvRows } from './csv-parsing';

export interface ValidationRule {
  name: string;
  description: string;
  validate: (csvContent: string, variationCsv?: string) => ValidationResult;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  isValid: boolean;
  message: string;
  details?: string[];
}

export interface ValidationSchema {
  name: string;
  description: string;
  rules: ValidationRule[];
}

/**
 * WooCommerce Parent CSV Validation Schema
 */
export const WOOCOMMERCE_PARENT_SCHEMA: ValidationSchema = {
  name: 'WooCommerce Parent CSV Schema',
  description: 'Validation schema for WooCommerce parent product CSV files',
  rules: [
    {
      name: 'required_columns',
      description: 'All required WooCommerce parent columns must be present',
      severity: 'error',
      validate: (csvContent: string) => {
        const requiredColumns = [
          'ID', 'post_title', 'post_name', 'post_status', 'post_content',
          'post_excerpt', 'post_parent', 'post_type', 'menu_order', 'sku',
          'stock_status', 'images', 'tax:product_type', 'tax:product_cat',
          'description', 'regular_price', 'sale_price'
        ];
        
        const { headers } = parseCsvRows(csvContent);
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        
        return {
          isValid: missingColumns.length === 0,
          message: missingColumns.length === 0 
            ? 'All required columns are present'
            : `Missing required columns: ${missingColumns.join(', ')}`,
          details: missingColumns,
        };
      },
    },
    {
      name: 'post_type_validation',
      description: 'post_type must be "product" for all parent products',
      severity: 'error',
      validate: (csvContent: string) => {
        const { rows } = parseCsvRows(csvContent);
        const invalidRows = rows.filter(row => row.post_type !== 'product');
        
        return {
          isValid: invalidRows.length === 0,
          message: invalidRows.length === 0 
            ? 'All products have correct post_type'
            : `${invalidRows.length} products have invalid post_type`,
          details: invalidRows.map((row, index) => `Row ${index + 1}: post_type = "${row.post_type}"`),
        };
      },
    },
    {
      name: 'sku_validation',
      description: 'SKU must be unique and non-empty',
      severity: 'error',
      validate: (csvContent: string) => {
        const { rows } = parseCsvRows(csvContent);
        const skus = rows.map(row => row.sku);
        const emptySkus = skus.filter(sku => !sku || sku.trim() === '');
        const duplicateSkus = skus.filter((sku, index) => skus.indexOf(sku) !== index);
        
        const issues = [];
        if (emptySkus.length > 0) {
          issues.push(`${emptySkus.length} products have empty SKUs`);
        }
        if (duplicateSkus.length > 0) {
          issues.push(`${duplicateSkus.length} duplicate SKUs found`);
        }
        
        return {
          isValid: issues.length === 0,
          message: issues.length === 0 
            ? 'All SKUs are valid and unique'
            : issues.join('; '),
          details: issues,
        };
      },
    },
    {
      name: 'price_format_validation',
      description: 'Prices must be in valid format (numeric with up to 2 decimal places)',
      severity: 'error',
      validate: (csvContent: string) => {
        const { rows } = parseCsvRows(csvContent);
        const priceRegex = /^\d+(\.\d{2})?$/;
        const invalidPrices: string[] = [];
        
        rows.forEach((row, index) => {
          if (row.regular_price && !priceRegex.test(row.regular_price)) {
            invalidPrices.push(`Row ${index + 1}: regular_price = "${row.regular_price}"`);
          }
          if (row.sale_price && row.sale_price !== '' && !priceRegex.test(row.sale_price)) {
            invalidPrices.push(`Row ${index + 1}: sale_price = "${row.sale_price}"`);
          }
        });
        
        return {
          isValid: invalidPrices.length === 0,
          message: invalidPrices.length === 0 
            ? 'All prices are in valid format'
            : `${invalidPrices.length} products have invalid price format`,
          details: invalidPrices,
        };
      },
    },
    {
      name: 'stock_status_validation',
      description: 'Stock status must be one of: instock, outofstock, onbackorder',
      severity: 'error',
      validate: (csvContent: string) => {
        const { rows } = parseCsvRows(csvContent);
        const validStatuses = ['instock', 'outofstock', 'onbackorder'];
        const invalidStatuses = rows.filter(row => !validStatuses.includes(row.stock_status));
        
        return {
          isValid: invalidStatuses.length === 0,
          message: invalidStatuses.length === 0 
            ? 'All stock statuses are valid'
            : `${invalidStatuses.length} products have invalid stock status`,
          details: invalidStatuses.map((row, index) => `Row ${index + 1}: stock_status = "${row.stock_status}"`),
        };
      },
    },
    {
      name: 'product_type_validation',
      description: 'Product type must be simple or variable',
      severity: 'error',
      validate: (csvContent: string) => {
        const { rows } = parseCsvRows(csvContent);
        const validTypes = ['simple', 'variable'];
        const invalidTypes = rows.filter(row => !validTypes.includes(row['tax:product_type']));
        
        return {
          isValid: invalidTypes.length === 0,
          message: invalidTypes.length === 0 
            ? 'All product types are valid'
            : `${invalidTypes.length} products have invalid product type`,
          details: invalidTypes.map((row, index) => `Row ${index + 1}: product_type = "${row['tax:product_type']}"`),
        };
      },
    },
    {
      name: 'attribute_column_pairs',
      description: 'Attribute columns must have corresponding data columns',
      severity: 'warning',
      validate: (csvContent: string) => {
        const { headers } = parseCsvRows(csvContent);
        const attributeColumns = headers.filter(h => h.startsWith('attribute:') && !h.includes('_data:'));
        const attributeDataColumns = headers.filter(h => h.startsWith('attribute_data:'));
        
        const missingDataColumns = attributeColumns.filter(attr => {
          const dataCol = attr.replace('attribute:', 'attribute_data:');
          return !attributeDataColumns.includes(dataCol);
        });
        
        return {
          isValid: missingDataColumns.length === 0,
          message: missingDataColumns.length === 0 
            ? 'All attribute columns have corresponding data columns'
            : `${missingDataColumns.length} attribute columns missing data columns`,
          details: missingDataColumns,
        };
      },
    },
  ],
};

/**
 * WooCommerce Variation CSV Validation Schema
 */
export const WOOCOMMERCE_VARIATION_SCHEMA: ValidationSchema = {
  name: 'WooCommerce Variation CSV Schema',
  description: 'Validation schema for WooCommerce product variation CSV files',
  rules: [
    {
      name: 'required_columns',
      description: 'All required WooCommerce variation columns must be present',
      severity: 'error',
      validate: (csvContent: string) => {
        const requiredColumns = [
          'ID', 'post_type', 'post_status', 'parent_sku', 'post_title',
          'post_name', 'post_content', 'post_excerpt', 'menu_order', 'sku',
          'stock_status', 'regular_price', 'sale_price', 'tax_class', 'images'
        ];
        
        const { headers } = parseCsvRows(csvContent);
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        
        return {
          isValid: missingColumns.length === 0,
          message: missingColumns.length === 0 
            ? 'All required variation columns are present'
            : `Missing required variation columns: ${missingColumns.join(', ')}`,
          details: missingColumns,
        };
      },
    },
    {
      name: 'post_type_validation',
      description: 'post_type must be "product_variation" for all variations',
      severity: 'error',
      validate: (csvContent: string) => {
        const { rows } = parseCsvRows(csvContent);
        const invalidRows = rows.filter(row => row.post_type !== 'product_variation');
        
        return {
          isValid: invalidRows.length === 0,
          message: invalidRows.length === 0 
            ? 'All variations have correct post_type'
            : `${invalidRows.length} variations have invalid post_type`,
          details: invalidRows.map((row, index) => `Row ${index + 1}: post_type = "${row.post_type}"`),
        };
      },
    },
    {
      name: 'parent_sku_validation',
      description: 'parent_sku must be non-empty and reference valid parent product',
      severity: 'error',
      validate: (csvContent: string) => {
        const { rows } = parseCsvRows(csvContent);
        const emptyParentSkus = rows.filter(row => !row.parent_sku || row.parent_sku.trim() === '');
        
        return {
          isValid: emptyParentSkus.length === 0,
          message: emptyParentSkus.length === 0 
            ? 'All variations have valid parent_sku'
            : `${emptyParentSkus.length} variations have empty parent_sku`,
          details: emptyParentSkus.map((row, index) => `Row ${index + 1}: parent_sku = "${row.parent_sku}"`),
        };
      },
    },
    {
      name: 'variation_sku_validation',
      description: 'Variation SKU must be unique and non-empty',
      severity: 'error',
      validate: (csvContent: string) => {
        const { rows } = parseCsvRows(csvContent);
        const skus = rows.map(row => row.sku);
        const emptySkus = skus.filter(sku => !sku || sku.trim() === '');
        const duplicateSkus = skus.filter((sku, index) => skus.indexOf(sku) !== index);
        
        const issues = [];
        if (emptySkus.length > 0) {
          issues.push(`${emptySkus.length} variations have empty SKUs`);
        }
        if (duplicateSkus.length > 0) {
          issues.push(`${duplicateSkus.length} duplicate variation SKUs found`);
        }
        
        return {
          isValid: issues.length === 0,
          message: issues.length === 0 
            ? 'All variation SKUs are valid and unique'
            : issues.join('; '),
          details: issues,
        };
      },
    },
    {
      name: 'price_format_validation',
      description: 'Variation prices must be in valid format',
      severity: 'error',
      validate: (csvContent: string) => {
        const { rows } = parseCsvRows(csvContent);
        const priceRegex = /^\d+(\.\d{2})?$/;
        const invalidPrices: string[] = [];
        
        rows.forEach((row, index) => {
          if (row.regular_price && !priceRegex.test(row.regular_price)) {
            invalidPrices.push(`Row ${index + 1}: regular_price = "${row.regular_price}"`);
          }
          if (row.sale_price && row.sale_price !== '' && !priceRegex.test(row.sale_price)) {
            invalidPrices.push(`Row ${index + 1}: sale_price = "${row.sale_price}"`);
          }
        });
        
        return {
          isValid: invalidPrices.length === 0,
          message: invalidPrices.length === 0 
            ? 'All variation prices are in valid format'
            : `${invalidPrices.length} variations have invalid price format`,
          details: invalidPrices,
        };
      },
    },
    {
      name: 'stock_status_validation',
      description: 'Variation stock status must be valid',
      severity: 'error',
      validate: (csvContent: string) => {
        const { rows } = parseCsvRows(csvContent);
        const validStatuses = ['instock', 'outofstock', 'onbackorder'];
        const invalidStatuses = rows.filter(row => !validStatuses.includes(row.stock_status));
        
        return {
          isValid: invalidStatuses.length === 0,
          message: invalidStatuses.length === 0 
            ? 'All variation stock statuses are valid'
            : `${invalidStatuses.length} variations have invalid stock status`,
          details: invalidStatuses.map((row, index) => `Row ${index + 1}: stock_status = "${row.stock_status}"`),
        };
      },
    },
  ],
};

/**
 * Cross-CSV Validation Schema (Parent + Variation)
 */
export const WOOCOMMERCE_CROSS_VALIDATION_SCHEMA: ValidationSchema = {
  name: 'WooCommerce Cross-CSV Validation Schema',
  description: 'Validation schema for relationships between parent and variation CSVs',
  rules: [
    {
      name: 'parent_sku_references',
      description: 'All variation parent_sku values must reference existing parent products',
      severity: 'error',
      validate: (parentCsv: string, variationCsv?: string) => {
        if (!variationCsv) {
          return {
            isValid: true,
            message: 'No variation CSV provided for cross-validation',
          };
        }
        const parentData = parseCsvRows(parentCsv);
        const variationData = parseCsvRows(variationCsv);
        const parentSkus = new Set(parentData.rows.map(row => row.sku));
        const invalidReferences = variationData.rows.filter(row => !parentSkus.has(row.parent_sku));
        
        return {
          isValid: invalidReferences.length === 0,
          message: invalidReferences.length === 0 
            ? 'All variation parent_sku references are valid'
            : `${invalidReferences.length} variations reference non-existent parent SKUs`,
          details: invalidReferences.map((row, index) => `Row ${index + 1}: parent_sku = "${row.parent_sku}"`),
        };
      },
    },
    {
      name: 'variation_attribute_consistency',
      description: 'Variation attribute values must match parent attribute options',
      severity: 'warning',
      validate: (parentCsv: string, variationCsv?: string) => {
        if (!variationCsv) {
          return {
            isValid: true,
            message: 'No variation CSV provided for cross-validation',
          };
        }
        const parentData = parseCsvRows(parentCsv);
        const variationData = parseCsvRows(variationCsv);
        
        // Create a map of parent SKUs to their attribute options
        const parentAttributeOptions = new Map<string, Record<string, string[]>>();
        
        for (const parentRow of parentData.rows) {
          const sku = parentRow.sku;
          const options: Record<string, string[]> = {};
          
          for (const [key, value] of Object.entries(parentRow)) {
            if (key.startsWith('attribute:') && !key.includes('_data:')) {
              const attrName = key.replace('attribute:', '');
              if (value) {
                options[attrName] = value.split('|').map(opt => opt.trim());
              }
            }
          }
          
          parentAttributeOptions.set(sku, options);
        }
        
        // Validate each variation
        const invalidVariations = [];
        for (let i = 0; i < variationData.rows.length; i++) {
          const variation = variationData.rows[i];
          const parentSku = variation.parent_sku;
          const parentOptions = parentAttributeOptions.get(parentSku);
          
          if (!parentOptions) continue;
          
          for (const [key, value] of Object.entries(variation)) {
            if (key.startsWith('meta:attribute_')) {
              const attrName = key.replace('meta:attribute_', '');
              const variationValue = value?.trim();
              const parentOptionsForAttr = parentOptions[attrName] || [];
              
              if (variationValue && !parentOptionsForAttr.includes(variationValue)) {
                invalidVariations.push(
                  `Row ${i + 1}: Attribute value '${variationValue}' for '${attrName}' is not in parent options`
                );
              }
            }
          }
        }
        
        return {
          isValid: invalidVariations.length === 0,
          message: invalidVariations.length === 0 
            ? 'All variation attributes are consistent with parent options'
            : `${invalidVariations.length} variation attributes are inconsistent`,
          details: invalidVariations,
        };
      },
    },
  ],
};

/**
 * Run validation against a schema
 */
export function validateAgainstSchema(
  csvContent: string,
  schema: ValidationSchema,
  variationCsv?: string
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const info: string[] = [];
  
  for (const rule of schema.rules) {
    try {
      const result = rule.validate(csvContent, variationCsv);
      
      if (!result.isValid) {
        let message = `${rule.name}: ${result.message}`;
        if (result.details) {
          message += ` (${result.details.join(', ')})`;
        }
        
        switch (rule.severity) {
          case 'error':
            errors.push(message);
            break;
          case 'warning':
            warnings.push(message);
            break;
          case 'info':
            info.push(message);
            break;
        }
      }
    } catch (error) {
      errors.push(`${rule.name}: Validation failed with error - ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    info,
  };
}

/**
 * Run comprehensive validation on both parent and variation CSVs
 */
export function validateWooCommerceCsvs(
  parentCsv: string,
  variationCsv?: string
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
  parentValidation: ReturnType<typeof validateAgainstSchema>;
  variationValidation?: ReturnType<typeof validateAgainstSchema>;
  crossValidation?: ReturnType<typeof validateAgainstSchema>;
} {
  const parentValidation = validateAgainstSchema(parentCsv, WOOCOMMERCE_PARENT_SCHEMA);
  const variationValidation = variationCsv 
    ? validateAgainstSchema(variationCsv, WOOCOMMERCE_VARIATION_SCHEMA)
    : undefined;
  const crossValidation = variationCsv
    ? validateAgainstSchema(parentCsv, WOOCOMMERCE_CROSS_VALIDATION_SCHEMA, variationCsv)
    : undefined;
  
  const allErrors = [
    ...parentValidation.errors,
    ...(variationValidation?.errors || []),
    ...(crossValidation?.errors || []),
  ];
  
  const allWarnings = [
    ...parentValidation.warnings,
    ...(variationValidation?.warnings || []),
    ...(crossValidation?.warnings || []),
  ];
  
  const allInfo = [
    ...parentValidation.info,
    ...(variationValidation?.info || []),
    ...(crossValidation?.info || []),
  ];
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    info: allInfo,
    parentValidation,
    variationValidation,
    crossValidation,
  };
}
