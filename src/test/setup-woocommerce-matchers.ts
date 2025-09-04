/**
 * Jest setup file for WooCommerce CSV matchers
 * This file should be imported in jest.config.js or test setup files
 */

import { woocommerceMatchers } from './utils/woocommerce-matchers';

// Extend Jest matchers with WooCommerce-specific matchers
expect.extend(woocommerceMatchers);

// Declare the new matchers for TypeScript
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveWooCommerceParentColumns(csvContent: string): R;
      toHaveWooCommerceVariationColumns(csvContent: string): R;
      toHaveAttributeColumnPairs(csvContent: string, expectedAttributes: string[]): R;
      toHaveMetaAttributeColumns(csvContent: string, expectedAttributes: string[]): R;
      toHaveValidAttributeDataFlags(csvContent: string, attributeName: string): R;
      toHaveMatchingVariationAttributes(parentCsv: string, variationCsv: string): R;
      toHaveWooCommerceProductType(
        csvContent: string,
        expectedType: 'simple' | 'variable' | 'product_variation',
      ): R;
      toHaveValidStockStatus(csvContent: string): R;
      toHaveValidPriceFormat(csvContent: string): R;
      toHaveValidParentSkuReferences(parentCsv: string, variationCsv: string): R;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

export {};
