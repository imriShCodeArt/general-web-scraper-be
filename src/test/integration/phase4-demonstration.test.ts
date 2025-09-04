/**
 * Phase 4 Demonstration Test
 * 
 * This test demonstrates all Phase 4 functionality:
 * - Task 4.1: WooCommerce validation schemas
 * - Task 4.2: Template-based testing
 * - Task 4.3: End-to-end validation
 * 
 * This serves as a comprehensive demonstration of the complete Phase 4 implementation.
 */

import { CsvGenerator } from '../../lib/csv-generator';
import { factories } from '../utils/factories';
import { 
  generateCsvTemplate, 
  generateMinimalCsvTemplate, 
  generateComprehensiveCsvTemplate,
  generateEdgeCaseTemplate,
  validateCsvTemplate,
  getRequiredParentColumns,
  getRequiredVariationColumns,
} from '../utils/csv-template-generator';
import { 
  validateWooCommerceCsvs,
  WOOCOMMERCE_PARENT_SCHEMA,
  WOOCOMMERCE_VARIATION_SCHEMA,
  WOOCOMMERCE_CROSS_VALIDATION_SCHEMA,
} from '../utils/woocommerce-validation-schemas';
import { parseCsvRows } from '../utils/csv-parsing';

// Import WooCommerce matchers
import '../setup-woocommerce-matchers';

describe('Phase 4: Complete Integration Testing Demonstration', () => {
  let csvGenerator: CsvGenerator;

  beforeEach(() => {
    csvGenerator = new CsvGenerator();
  });

  describe('Task 4.1: WooCommerce Validation Schemas Demonstration', () => {
    it('should demonstrate comprehensive WooCommerce validation', async () => {
      // Create test products
      const testProducts = [
        factories.normalizedProduct({
          id: 'demo-simple-001',
          title: 'Demo Simple Product',
          sku: 'DEMO-SIMPLE-001',
          productType: 'simple',
          regularPrice: '29.99',
          salePrice: '24.99',
          description: 'A demonstration simple product for Phase 4 testing',
          shortDescription: 'Demo simple product',
          category: 'Demo',
          stockStatus: 'instock',
          attributes: {
            color: ['Red', 'Blue', 'Green'],
            size: ['S', 'M', 'L'],
            material: ['Cotton', 'Polyester'],
          },
        }),
        factories.variableProduct({
          id: 'demo-variable-001',
          title: 'Demo Variable Product',
          sku: 'DEMO-VAR-001',
          productType: 'variable',
          regularPrice: '49.99',
          salePrice: '39.99',
          description: 'A demonstration variable product for Phase 4 testing',
          shortDescription: 'Demo variable product',
          category: 'Demo',
          stockStatus: 'instock',
          attributes: {
            color: ['Red', 'Blue'],
            size: ['S', 'M', 'L'],
          },
          variations: [
            {
              sku: 'DEMO-VAR-001-RED-S',
              regularPrice: '49.99',
              salePrice: '39.99',
              taxClass: 'standard',
              stockStatus: 'instock',
              images: ['https://example.com/red-s.jpg'],
              attributeAssignments: {
                color: 'Red',
                size: 'S',
              },
            },
            {
              sku: 'DEMO-VAR-001-BLUE-M',
              regularPrice: '49.99',
              salePrice: '39.99',
              taxClass: 'standard',
              stockStatus: 'instock',
              images: ['https://example.com/blue-m.jpg'],
              attributeAssignments: {
                color: 'Blue',
                size: 'M',
              },
            },
          ],
        }),
      ];

      // Generate CSVs
      const parentCsv = await csvGenerator.generateParentCsv(testProducts);
      const variableProducts = testProducts.filter(p => p.productType === 'variable');
      const variationCsv = await csvGenerator.generateVariationCsv(variableProducts);

      // Demonstrate comprehensive validation
      const validation = validateWooCommerceCsvs(parentCsv, variationCsv);

      // Log validation results for demonstration
      console.log('=== Phase 4.1: WooCommerce Validation Results ===');
      console.log('Overall Valid:', validation.isValid);
      console.log('Errors:', validation.errors);
      console.log('Warnings:', validation.warnings);
      console.log('Info:', validation.info);

      // Assertions
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      // Demonstrate individual schema validation
      const parentValidation = validateCsvTemplate(parentCsv, getRequiredParentColumns());
      expect(parentValidation.isValid).toBe(true);

      if (variationCsv) {
        const variationValidation = validateCsvTemplate(variationCsv, getRequiredVariationColumns());
        expect(variationValidation.isValid).toBe(true);
      }
    });

    it('should demonstrate validation error handling', async () => {
      // Create products with validation issues
      const problematicProducts = [
        factories.normalizedProduct({
          id: 'problem-001',
          title: '', // Empty title
          sku: 'PROBLEM-001',
          productType: 'simple',
          regularPrice: 'invalid-price', // Invalid price
          stockStatus: 'invalid-status', // Invalid status
        }),
      ];

      const parentCsv = await csvGenerator.generateParentCsv(problematicProducts);
      const validation = validateWooCommerceCsvs(parentCsv);

      // Demonstrate error handling
      console.log('=== Phase 4.1: Validation Error Handling ===');
      console.log('Overall Valid:', validation.isValid);
      console.log('Errors:', validation.errors);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Task 4.2: Template-based Testing Demonstration', () => {
    it('should demonstrate minimal CSV template generation', async () => {
      const template = await generateMinimalCsvTemplate();

      console.log('=== Phase 4.2: Minimal Template Generation ===');
      console.log('Product Count:', template.metadata.productCount);
      console.log('Has Attributes:', template.metadata.hasAttributes);
      console.log('Has Variations:', template.metadata.hasVariations);

      // Validate template
      const parentValidation = validateCsvTemplate(template.parentCsv, getRequiredParentColumns());
      expect(parentValidation.isValid).toBe(true);
      expect(template.metadata.productCount).toBe(1);
      expect(template.metadata.hasAttributes).toBe(false);
      expect(template.metadata.hasVariations).toBe(false);
    });

    it('should demonstrate comprehensive CSV template generation', async () => {
      const template = await generateComprehensiveCsvTemplate();

      console.log('=== Phase 4.2: Comprehensive Template Generation ===');
      console.log('Product Count:', template.metadata.productCount);
      console.log('Variation Count:', template.metadata.variationCount);
      console.log('Attribute Count:', template.metadata.attributeCount);
      console.log('Has Attributes:', template.metadata.hasAttributes);
      console.log('Has Variations:', template.metadata.hasVariations);

      // Validate template
      const parentValidation = validateCsvTemplate(template.parentCsv, getRequiredParentColumns());
      expect(parentValidation.isValid).toBe(true);
      expect(template.metadata.productCount).toBe(2); // Simple + Variable
      expect(template.metadata.hasAttributes).toBe(true);
      expect(template.metadata.hasVariations).toBe(true);
      expect(template.metadata.attributeCount).toBeGreaterThan(0);
      expect(template.metadata.variationCount).toBeGreaterThan(0);
    });

    it('should demonstrate custom template generation', async () => {
      const template = await generateCsvTemplate({
        includeAttributes: true,
        includeVariations: true,
        productType: 'variable',
        attributeNames: ['Color', 'Size', 'Material', 'Pattern'],
        variationCount: 4,
      });

      console.log('=== Phase 4.2: Custom Template Generation ===');
      console.log('Product Count:', template.metadata.productCount);
      console.log('Variation Count:', template.metadata.variationCount);
      console.log('Attribute Count:', template.metadata.attributeCount);

      // Validate template
      const parentValidation = validateCsvTemplate(template.parentCsv, getRequiredParentColumns());
      expect(parentValidation.isValid).toBe(true);
      expect(template.metadata.productCount).toBe(1);
      expect(template.metadata.variationCount).toBe(4);
      expect(template.metadata.attributeCount).toBe(4);
    });

    it('should demonstrate edge case template generation', async () => {
      const template = await generateEdgeCaseTemplate();

      console.log('=== Phase 4.2: Edge Case Template Generation ===');
      console.log('Product Count:', template.metadata.productCount);
      console.log('Attribute Count:', template.metadata.attributeCount);

      // Validate template
      const parentValidation = validateCsvTemplate(template.parentCsv, getRequiredParentColumns());
      expect(parentValidation.isValid).toBe(true);
      expect(template.metadata.productCount).toBe(3);
      expect(template.metadata.attributeCount).toBeGreaterThan(0);
    });
  });

  describe('Task 4.3: End-to-End Validation Demonstration', () => {
    it('should demonstrate complete end-to-end validation pipeline', async () => {
      // Create comprehensive test data
      const testProducts = [
        factories.normalizedProduct({
          id: 'e2e-simple-001',
          title: 'End-to-End Simple Product',
          sku: 'E2E-SIMPLE-001',
          productType: 'simple',
          regularPrice: '99.99',
          salePrice: '79.99',
          description: 'A comprehensive simple product for end-to-end testing',
          shortDescription: 'E2E simple product',
          category: 'E2E Testing',
          stockStatus: 'instock',
          attributes: {
            color: ['Black', 'White', 'Silver'],
            material: ['Aluminum', 'Plastic', 'Steel'],
            warranty: ['1 Year', '2 Years', '3 Years'],
          },
        }),
        factories.variableProduct({
          id: 'e2e-variable-001',
          title: 'End-to-End Variable Product',
          sku: 'E2E-VAR-001',
          productType: 'variable',
          regularPrice: '199.99',
          salePrice: '149.99',
          description: 'A comprehensive variable product for end-to-end testing',
          shortDescription: 'E2E variable product',
          category: 'E2E Testing',
          stockStatus: 'instock',
          attributes: {
            color: ['Red', 'Blue', 'Green'],
            size: ['S', 'M', 'L', 'XL'],
            material: ['Cotton', 'Polyester', 'Wool'],
          },
          variations: [
            {
              sku: 'E2E-VAR-001-RED-S-COTTON',
              regularPrice: '199.99',
              salePrice: '149.99',
              taxClass: 'standard',
              stockStatus: 'instock',
              images: ['https://example.com/red-s-cotton.jpg'],
              attributeAssignments: {
                color: 'Red',
                size: 'S',
                material: 'Cotton',
              },
            },
            {
              sku: 'E2E-VAR-001-BLUE-M-POLYESTER',
              regularPrice: '199.99',
              salePrice: '149.99',
              taxClass: 'standard',
              stockStatus: 'instock',
              images: ['https://example.com/blue-m-polyester.jpg'],
              attributeAssignments: {
                color: 'Blue',
                size: 'M',
                material: 'Polyester',
              },
            },
            {
              sku: 'E2E-VAR-001-GREEN-L-WOOL',
              regularPrice: '199.99',
              salePrice: '149.99',
              taxClass: 'standard',
              stockStatus: 'outofstock',
              images: ['https://example.com/green-l-wool.jpg'],
              attributeAssignments: {
                color: 'Green',
                size: 'L',
                material: 'Wool',
              },
            },
          ],
        }),
      ];

      // Generate CSVs
      const parentCsv = await csvGenerator.generateParentCsv(testProducts);
      const variableProducts = testProducts.filter(p => p.productType === 'variable');
      const variationCsv = await csvGenerator.generateVariationCsv(variableProducts);

      console.log('=== Phase 4.3: End-to-End Validation Pipeline ===');
      console.log('Parent CSV Length:', parentCsv.length);
      console.log('Variation CSV Length:', variationCsv?.length || 0);

      // Step 1: Validate CSV structure
      expect(parentCsv).toHaveWooCommerceParentColumns();
      expect(parentCsv).toHaveValidStockStatus();
      expect(parentCsv).toHaveValidPriceFormat();

      if (variationCsv) {
        expect(variationCsv).toHaveWooCommerceVariationColumns();
        expect(variationCsv).toHaveWooCommerceProductType('product_variation');
        expect(variationCsv).toHaveValidStockStatus();
        expect(variationCsv).toHaveValidPriceFormat();
      }

      // Step 2: Validate data integrity
      const parentParsed = parseCsvRows(parentCsv);
      const variationParsed = variationCsv ? parseCsvRows(variationCsv) : { headers: [], rows: [] };

      expect(parentParsed.rows).toHaveLength(testProducts.length);
      expect(variationParsed.rows).toHaveLength(3); // 3 variations

      // Step 3: Validate relationships
      if (variationCsv) {
        expect(parentCsv).toHaveValidParentSkuReferences(variationCsv);
        expect(parentCsv).toHaveMatchingVariationAttributes(variationCsv);
      }

      // Step 4: Validate attribute handling
      const expectedAttributes = ['Color', 'Size', 'Material', 'Warranty'];
      expect(parentCsv).toHaveAttributeColumnPairs(expectedAttributes);

      if (variationCsv) {
        expect(variationCsv).toHaveMetaAttributeColumns(['Color', 'Size', 'Material']);
      }

      // Step 5: Comprehensive validation
      const validation = validateWooCommerceCsvs(parentCsv, variationCsv);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      console.log('Validation Results:');
      console.log('- Overall Valid:', validation.isValid);
      console.log('- Errors:', validation.errors.length);
      console.log('- Warnings:', validation.warnings.length);
      console.log('- Info:', validation.info.length);
    });

    it('should demonstrate data integrity validation', async () => {
      const testProducts = [
        factories.normalizedProduct({
          id: 'integrity-001',
          title: 'Data Integrity Test Product',
          sku: 'INTEGRITY-001',
          productType: 'simple',
          regularPrice: '49.99',
          salePrice: '39.99',
          description: 'A product for testing data integrity',
          shortDescription: 'Integrity test product',
          category: 'Integrity Testing',
          stockStatus: 'instock',
          attributes: {
            color: ['Red', 'Blue'],
            size: ['S', 'M', 'L'],
          },
        }),
      ];

      const parentCsv = await csvGenerator.generateParentCsv(testProducts);
      const parsed = parseCsvRows(parentCsv);
      const productRow = parsed.rows[0];

      console.log('=== Phase 4.3: Data Integrity Validation ===');
      console.log('Original Product:', testProducts[0]);
      console.log('CSV Row:', productRow);

      // Validate data integrity
      expect(productRow.post_title).toBe(testProducts[0].title);
      expect(productRow.sku).toBe(testProducts[0].sku);
      expect(productRow.regular_price).toBe(testProducts[0].regularPrice);
      expect(productRow.sale_price).toBe(testProducts[0].salePrice);
      expect(productRow.stock_status).toBe(testProducts[0].stockStatus);
      expect(productRow.post_type).toBe('product');
      expect(productRow.menu_order).toBe('0');
      expect(productRow.description).toBe(testProducts[0].description);
      expect(productRow.post_content).toBe(testProducts[0].description);
      expect(productRow.post_excerpt).toBe(testProducts[0].shortDescription);
    });
  });

  describe('Phase 4: Complete Integration Test Suite', () => {
    it('should demonstrate all Phase 4 functionality working together', async () => {
      console.log('=== Phase 4: Complete Integration Test Suite ===');

      // 1. Generate test data using factories
      const testProducts = [
        factories.normalizedProduct({
          id: 'phase4-simple-001',
          title: 'Phase 4 Simple Product',
          sku: 'PHASE4-SIMPLE-001',
          productType: 'simple',
          regularPrice: '29.99',
          salePrice: '24.99',
          description: 'A product demonstrating all Phase 4 functionality',
          shortDescription: 'Phase 4 simple product',
          category: 'Phase 4 Testing',
          stockStatus: 'instock',
          attributes: {
            color: ['Red', 'Blue', 'Green'],
            size: ['S', 'M', 'L'],
            material: ['Cotton', 'Polyester'],
          },
        }),
        factories.variableProduct({
          id: 'phase4-variable-001',
          title: 'Phase 4 Variable Product',
          sku: 'PHASE4-VAR-001',
          productType: 'variable',
          regularPrice: '59.99',
          salePrice: '49.99',
          description: 'A variable product demonstrating all Phase 4 functionality',
          shortDescription: 'Phase 4 variable product',
          category: 'Phase 4 Testing',
          stockStatus: 'instock',
          attributes: {
            color: ['Red', 'Blue'],
            size: ['S', 'M', 'L'],
          },
          variations: [
            {
              sku: 'PHASE4-VAR-001-RED-S',
              regularPrice: '59.99',
              salePrice: '49.99',
              taxClass: 'standard',
              stockStatus: 'instock',
              images: ['https://example.com/red-s.jpg'],
              attributeAssignments: {
                color: 'Red',
                size: 'S',
              },
            },
            {
              sku: 'PHASE4-VAR-001-BLUE-M',
              regularPrice: '59.99',
              salePrice: '49.99',
              taxClass: 'standard',
              stockStatus: 'instock',
              images: ['https://example.com/blue-m.jpg'],
              attributeAssignments: {
                color: 'Blue',
                size: 'M',
              },
            },
          ],
        }),
      ];

      // 2. Generate CSVs
      const parentCsv = await csvGenerator.generateParentCsv(testProducts);
      const variableProducts = testProducts.filter(p => p.productType === 'variable');
      const variationCsv = await csvGenerator.generateVariationCsv(variableProducts);

      console.log('Generated CSVs:');
      console.log('- Parent CSV length:', parentCsv.length);
      console.log('- Variation CSV length:', variationCsv?.length || 0);

      // 3. Run comprehensive validation
      const validation = validateWooCommerceCsvs(parentCsv, variationCsv);

      console.log('Validation Results:');
      console.log('- Overall Valid:', validation.isValid);
      console.log('- Errors:', validation.errors.length);
      console.log('- Warnings:', validation.warnings.length);
      console.log('- Info:', validation.info.length);

      // 4. Assert all validations pass
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      // 5. Test template generation
      const template = await generateCsvTemplate({
        includeAttributes: true,
        includeVariations: true,
        productType: 'both',
        attributeNames: ['Color', 'Size', 'Material'],
        variationCount: 2,
      });

      console.log('Template Generation:');
      console.log('- Product Count:', template.metadata.productCount);
      console.log('- Variation Count:', template.metadata.variationCount);
      console.log('- Attribute Count:', template.metadata.attributeCount);

      // 6. Validate template
      const templateValidation = validateCsvTemplate(template.parentCsv, getRequiredParentColumns());
      expect(templateValidation.isValid).toBe(true);

      // 7. Test edge cases
      const edgeCaseTemplate = await generateEdgeCaseTemplate();
      const edgeCaseValidation = validateCsvTemplate(edgeCaseTemplate.parentCsv, getRequiredParentColumns());
      expect(edgeCaseValidation.isValid).toBe(true);

      console.log('Edge Case Template:');
      console.log('- Product Count:', edgeCaseTemplate.metadata.productCount);
      console.log('- Attribute Count:', edgeCaseTemplate.metadata.attributeCount);

      console.log('=== Phase 4: All Tests Passed Successfully ===');
    });
  });
});
