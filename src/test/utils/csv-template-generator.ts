/**
 * CSV Template Generator Utility
 *
 * Task 4.2: Add template-based testing using generateCsvTemplate utility
 *
 * This utility provides functions to generate CSV templates for testing purposes,
 * ensuring that all required WooCommerce columns are present even with minimal data.
 */

import { CsvGenerator } from '../../lib/csv-generator';
import { NormalizedProduct } from '../../types';
import { factories } from './factories';

export interface CsvTemplateOptions {
  includeAttributes?: boolean;
  includeVariations?: boolean;
  productType?: 'simple' | 'variable' | 'both';
  attributeNames?: string[];
  variationCount?: number;
}

export interface CsvTemplateResult {
  parentCsv: string;
  variationCsv?: string;
  templateProducts: NormalizedProduct[];
  metadata: {
    productCount: number;
    variationCount: number;
    attributeCount: number;
    hasAttributes: boolean;
    hasVariations: boolean;
  };
}

/**
 * Generate a CSV template with all required WooCommerce columns
 * This creates minimal products that ensure all necessary columns are present
 */
export async function generateCsvTemplate(options: CsvTemplateOptions = {}): Promise<CsvTemplateResult> {
  const {
    includeAttributes = true,
    includeVariations = false,
    productType = 'both',
    attributeNames = ['Color', 'Size', 'Material'],
    variationCount = 2,
  } = options;

  const csvGenerator = new CsvGenerator();
  const templateProducts: NormalizedProduct[] = [];

  // Generate simple product template
  if (productType === 'simple' || productType === 'both') {
    const simpleProduct = createTemplateSimpleProduct(includeAttributes, attributeNames);
    templateProducts.push(simpleProduct);
  }

  // Generate variable product template
  if (productType === 'variable' || productType === 'both') {
    const variableProduct = createTemplateVariableProduct(
      includeAttributes,
      includeVariations,
      attributeNames,
      variationCount,
    );
    templateProducts.push(variableProduct);
  }

  // Generate CSVs
  const parentCsv = await csvGenerator.generateParentCsv(templateProducts);
  const variableProducts = templateProducts.filter(p => p.productType === 'variable');
  const variationCsv = variableProducts.length > 0
    ? await csvGenerator.generateVariationCsv(variableProducts)
    : undefined;

  // Calculate metadata
  const totalVariationCount = templateProducts
    .filter(p => p.productType === 'variable')
    .reduce((sum, p) => sum + p.variations.length, 0);

  const totalAttributeCount = templateProducts
    .reduce((sum, p) => sum + Object.keys(p.attributes).length, 0);

  return {
    parentCsv,
    variationCsv,
    templateProducts,
    metadata: {
      productCount: templateProducts.length,
      variationCount: totalVariationCount,
      attributeCount: totalAttributeCount,
      hasAttributes: includeAttributes,
      hasVariations: includeVariations && variableProducts.length > 0,
    },
  };
}

/**
 * Generate a minimal CSV template with only required columns
 * Useful for testing basic CSV structure without attributes or variations
 */
export async function generateMinimalCsvTemplate(): Promise<CsvTemplateResult> {
  return generateCsvTemplate({
    includeAttributes: false,
    includeVariations: false,
    productType: 'simple',
  });
}

/**
 * Generate a comprehensive CSV template with all features
 * Useful for testing complete WooCommerce CSV functionality
 */
export async function generateComprehensiveCsvTemplate(): Promise<CsvTemplateResult> {
  return generateCsvTemplate({
    includeAttributes: true,
    includeVariations: true,
    productType: 'both',
    attributeNames: ['Color', 'Size', 'Material', 'Pattern', 'Warranty'],
    variationCount: 3,
  });
}

/**
 * Generate a CSV template for specific product types
 */
export async function generateProductTypeTemplate(
  productType: 'simple' | 'variable',
  options: Omit<CsvTemplateOptions, 'productType'> = {},
): Promise<CsvTemplateResult> {
  return generateCsvTemplate({
    ...options,
    productType,
  });
}

/**
 * Generate a CSV template with specific attributes
 */
export async function generateAttributeTemplate(
  attributeNames: string[],
  options: Omit<CsvTemplateOptions, 'attributeNames'> = {},
): Promise<CsvTemplateResult> {
  return generateCsvTemplate({
    ...options,
    attributeNames,
  });
}

/**
 * Create a template simple product with optional attributes
 */
function createTemplateSimpleProduct(
  includeAttributes: boolean,
  attributeNames: string[],
): NormalizedProduct {
  const attributes: Record<string, string[]> = {};

  if (includeAttributes) {
    attributeNames.forEach(attr => {
      attributes[attr.toLowerCase()] = [`${attr} Option 1`, `${attr} Option 2`];
    });
  }

  return factories.normalizedProduct({
    id: 'template-simple-001',
    title: 'Template Simple Product',
    sku: 'TEMPLATE-SIMPLE-001',
    productType: 'simple',
    regularPrice: '0',
    salePrice: '',
    description: 'Template simple product for CSV structure testing',
    shortDescription: 'Template simple product',
    category: 'Template',
    stockStatus: 'instock',
    attributes,
  });
}

/**
 * Create a template variable product with optional attributes and variations
 */
function createTemplateVariableProduct(
  includeAttributes: boolean,
  includeVariations: boolean,
  attributeNames: string[],
  variationCount: number,
): NormalizedProduct {
  const attributes: Record<string, string[]> = {};

  if (includeAttributes) {
    attributeNames.forEach(attr => {
      attributes[attr.toLowerCase()] = [`${attr} Option 1`, `${attr} Option 2`, `${attr} Option 3`];
    });
  }

  const variations = includeVariations ? generateTemplateVariations(
    attributeNames,
    variationCount,
  ) : [];

  return factories.variableProduct({
    id: 'template-variable-001',
    title: 'Template Variable Product',
    sku: 'TEMPLATE-VAR-001',
    productType: 'variable',
    regularPrice: '0',
    salePrice: '',
    description: 'Template variable product for CSV structure testing',
    shortDescription: 'Template variable product',
    category: 'Template',
    stockStatus: 'instock',
    attributes,
    variations,
  });
}

/**
 * Generate template variations for variable products
 */
function generateTemplateVariations(
  attributeNames: string[],
  count: number,
): NormalizedProduct['variations'] {
  const variations: NormalizedProduct['variations'] = [];

  for (let i = 0; i < count; i++) {
    const attributeAssignments: Record<string, string> = {};

    // Assign values to attributes
    attributeNames.forEach((attr) => {
      const options = [`${attr} Option 1`, `${attr} Option 2`, `${attr} Option 3`];
      attributeAssignments[attr.toLowerCase()] = options[i % options.length];
    });

    variations.push({
      sku: `TEMPLATE-VAR-001-V${i + 1}`,
      regularPrice: '0',
      salePrice: '',
      taxClass: 'standard',
      stockStatus: 'instock',
      images: [],
      attributeAssignments,
    });
  }

  return variations;
}

/**
 * Validate that a CSV template contains all required columns
 */
export function validateCsvTemplate(
  csvContent: string,
  expectedColumns: string[],
): { isValid: boolean; missingColumns: string[]; extraColumns: string[] } {
  const lines = csvContent.split('\n');
  if (lines.length === 0) {
    return { isValid: false, missingColumns: expectedColumns, extraColumns: [] };
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const missingColumns = expectedColumns.filter(col => !headers.includes(col));
  const extraColumns = headers.filter(col => !expectedColumns.includes(col));

  return {
    isValid: missingColumns.length === 0,
    missingColumns,
    extraColumns,
  };
}

/**
 * Get all required WooCommerce parent CSV columns
 */
export function getRequiredParentColumns(): string[] {
  return [
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
}

/**
 * Get all required WooCommerce variation CSV columns
 */
export function getRequiredVariationColumns(): string[] {
  return [
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
}

/**
 * Generate a CSV template with specific edge cases for testing
 */
export async function generateEdgeCaseTemplate(): Promise<CsvTemplateResult> {
  const edgeCaseProducts: NormalizedProduct[] = [
    // Product with empty strings
    factories.normalizedProduct({
      id: 'edge-empty-001',
      title: 'Empty Fields Product',
      sku: 'EDGE-EMPTY-001',
      productType: 'simple',
      regularPrice: '0',
      salePrice: '',
      description: '',
      shortDescription: '',
      category: 'Edge Cases',
      stockStatus: 'onbackorder',
      attributes: {},
    }),

    // Product with special characters
    factories.normalizedProduct({
      id: 'edge-special-001',
      title: 'Product with Special Characters & Symbols',
      sku: 'EDGE-SPECIAL-001',
      productType: 'simple',
      regularPrice: '29.99',
      salePrice: '',
      description: 'A product with special characters: é, ñ, ü, €, £, ¥',
      shortDescription: 'Special chars: é, ñ, ü, €, £, ¥',
      category: 'Special Products',
      stockStatus: 'instock',
      attributes: {
        'special-attribute': ['Value with "quotes"', 'Value with, commas'],
        'unicode-attribute': ['Café', 'Niño', 'Müller'],
      },
    }),

    // Product with very long content
    factories.normalizedProduct({
      id: 'edge-long-001',
      title: 'Product with Very Long Title That Exceeds Normal Limits',
      sku: 'EDGE-LONG-001',
      productType: 'simple',
      regularPrice: '999999.99',
      salePrice: '999999.99',
      description: 'A'.repeat(1000), // Long description
      shortDescription: 'B'.repeat(100), // Long short description
      category: 'Long Content Products',
      stockStatus: 'instock',
      attributes: {
        'very-long-attribute-name': ['Very Long Attribute Value'],
      },
    }),
  ];

  const csvGenerator = new CsvGenerator();
  const parentCsv = await csvGenerator.generateParentCsv(edgeCaseProducts);

  return {
    parentCsv,
    templateProducts: edgeCaseProducts,
    metadata: {
      productCount: edgeCaseProducts.length,
      variationCount: 0,
      attributeCount: edgeCaseProducts.reduce((sum, p) => sum + Object.keys(p.attributes).length, 0),
      hasAttributes: true,
      hasVariations: false,
    },
  };
}
