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
      toHaveWooCommerceParentColumns(): R;
      toHaveWooCommerceVariationColumns(): R;
      toHaveAttributeColumnPairs(expectedAttributes: string[]): R;
      toHaveMetaAttributeColumns(expectedAttributes: string[]): R;
      toHaveValidAttributeDataFlags(attributeName: string): R;
      toHaveMatchingVariationAttributes(variationCsv: string): R;
      toHaveWooCommerceProductType(
        expectedType: 'simple' | 'variable' | 'product_variation',
      ): R;
      toHaveValidStockStatus(): R;
      toHaveValidPriceFormat(): R;
      toHaveValidParentSkuReferences(variationCsv: string): R;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

export {};
