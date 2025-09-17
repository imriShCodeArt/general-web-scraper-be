import { CsvGenerator } from '../core/services/csv-generator';
import { NormalizedProduct, ProductVariation } from '../domain/types';
// import { readFileSync } from 'fs';
// import { join } from 'path';

// No mocking needed for this test

describe('CSV Golden File Regression Tests', () => {
  let csvGenerator: CsvGenerator;

  beforeEach(() => {
    csvGenerator = new CsvGenerator();
  });

  describe('Simple Products', () => {
    it('should generate CSV for simple products', async () => {
      const products: NormalizedProduct[] = [
        {
          id: '1',
          title: 'Simple Product 1',
          slug: 'simple-product-1',
          description: 'A simple product description',
          sku: 'SP001',
          sourceUrl: 'https://example.com/product1',
          normalizedAt: new Date('2023-01-01T00:00:00Z'),
          confidence: 1,
          shortDescription: 'Short description',
          stockStatus: 'instock',
          images: ['https://example.com/image1.jpg'],
          productType: 'simple',
          variations: [],
          category: 'Electronics',
          attributes: {
            color: ['Red'],
            size: ['Medium'],
          },
        },
        {
          id: '2',
          title: 'Simple Product 2',
          slug: 'simple-product-2',
          description: 'Another simple product',
          sku: 'SP002',
          sourceUrl: 'https://example.com/product2',
          normalizedAt: new Date('2023-01-02T00:00:00Z'),
          confidence: 0.9,
          shortDescription: 'Another short description',
          stockStatus: 'outofstock',
          images: ['https://example.com/image2.jpg'],
          productType: 'simple',
          variations: [],
          category: 'Clothing',
          attributes: {
            material: ['Cotton'],
          },
        },
      ];

      const csvContent = await csvGenerator.generateParentCsv(products);

      // Check basic CSV structure
      expect(csvContent).toContain('ID,post_title,post_name,post_status,post_content,post_excerpt,post_parent,post_type,menu_order,sku,stock_status,images,tax:product_type,tax:product_cat,description,regular_price,sale_price');
      expect(csvContent).toContain('Simple Product 1,simple-product-1,publish,A simple product description,Short description,,product,0,SP001,instock,https://example.com/image1.jpg,simple,Electronics,A simple product description,0,,');
      expect(csvContent).toContain('Simple Product 2,simple-product-2,publish,Another simple product,Another short description,,product,0,SP002,outofstock,https://example.com/image2.jpg,simple,Clothing,Another simple product,0,,');
    });
  });

  describe('Variable Products with Variations', () => {
    it('should generate CSV for variable products with variations', async () => {
      const products: NormalizedProduct[] = [
        {
          id: '3',
          title: 'Variable Product',
          slug: 'variable-product',
          description: 'A product with variations',
          sku: 'VP001',
          sourceUrl: 'https://example.com/variable',
          normalizedAt: new Date('2023-01-03T00:00:00Z'),
          confidence: 1,
          shortDescription: 'Variable product',
          stockStatus: 'instock',
          images: ['https://example.com/variable.jpg'],
          productType: 'variable',
          variations: [
            {
              sku: 'VP001-RED-S',
              regularPrice: '29.99',
              taxClass: 'taxable',
              stockStatus: 'instock' as const,
              images: [],
              attributeAssignments: { color: 'Red', size: 'Small' },
            } as ProductVariation,
            {
              sku: 'VP001-BLUE-M',
              regularPrice: '34.99',
              taxClass: 'taxable',
              stockStatus: 'instock' as const,
              images: [],
              attributeAssignments: { color: 'Blue', size: 'Medium' },
            } as ProductVariation,
          ],
          category: 'Apparel',
          attributes: {
            color: ['Red', 'Blue'],
            size: ['Small', 'Medium'],
          },
        },
      ];

      const csvContent = await csvGenerator.generateParentCsv(products);

      expect(csvContent).toContain('Variable Product,variable-product,publish,A product with variations,Variable product,,product,0,VP001,instock,https://example.com/variable.jpg,variable,Apparel,A product with variations,0,,');
    });
  });

  describe('Mixed Product Types', () => {
    it('should handle mixed simple and variable products', async () => {
      const products: NormalizedProduct[] = [
        {
          id: '4',
          title: 'Mixed Simple',
          slug: 'mixed-simple',
          description: 'A simple product in mixed set',
          sku: 'MS001',
          sourceUrl: 'https://example.com/mixed-simple',
          normalizedAt: new Date('2023-01-04T00:00:00Z'),
          confidence: 1,
          shortDescription: 'Mixed simple',
          stockStatus: 'instock',
          images: [],
          productType: 'simple',
          variations: [],
          category: 'Accessories',
          attributes: {},
        },
        {
          id: '5',
          title: 'Mixed Variable',
          slug: 'mixed-variable',
          description: 'A variable product in mixed set',
          sku: 'MV001',
          sourceUrl: 'https://example.com/mixed-variable',
          normalizedAt: new Date('2023-01-05T00:00:00Z'),
          confidence: 1,
          shortDescription: 'Mixed variable',
          stockStatus: 'instock',
          images: [],
          productType: 'variable',
          variations: [
            {
              sku: 'MV001-A',
              regularPrice: '25.00',
              taxClass: 'taxable',
              stockStatus: 'instock' as const,
              images: [],
              attributeAssignments: { variant: 'A' },
            } as ProductVariation,
          ],
          category: 'Tools',
          attributes: {
            variant: ['A'],
          },
        },
      ];

      const csvContent = await csvGenerator.generateParentCsv(products);

      expect(csvContent).toContain('Mixed Simple,mixed-simple,publish,A simple product in mixed set,Mixed simple,,product,0,MS001,instock,,simple,Accessories,A simple product in mixed set,0,,');
      expect(csvContent).toContain('Mixed Variable,mixed-variable,publish,A variable product in mixed set,Mixed variable,,product,0,MV001,instock,,variable,Tools,A variable product in mixed set,0,,');
    });
  });

  describe('Special Characters and Encoding', () => {
    it('should handle special characters in product data', async () => {
      const products: NormalizedProduct[] = [
        {
          id: '6',
          title: 'Product with "quotes" and \'apostrophes\'',
          slug: 'special-chars-product',
          description: 'Description with "quotes", \'apostrophes\', and commas, semicolons; and newlines.\nSecond line.',
          sku: 'SC001',
          sourceUrl: 'https://example.com/special-chars',
          normalizedAt: new Date('2023-01-06T00:00:00Z'),
          confidence: 1,
          shortDescription: 'Short with "quotes"',
          stockStatus: 'instock',
          images: ['https://example.com/image"with"quotes.jpg'],
          productType: 'simple',
          variations: [],
          category: 'Special & Unique',
          attributes: {
            'special-attr': ['Value with "quotes"', 'Another with \'apostrophes\''],
          },
        },
      ];

      const csvContent = await csvGenerator.generateParentCsv(products);

      // Check that quotes are properly escaped
      expect(csvContent).toContain('"Product with ""quotes"" and \'apostrophes\'"');
      expect(csvContent).toContain('"Description with ""quotes"", \'apostrophes\', and commas, semicolons; and newlines.\nSecond line."');
      expect(csvContent).toContain('"Short with ""quotes"""');
      expect(csvContent).toContain('"https://example.com/image""with""quotes.jpg"');
      expect(csvContent).toContain('Special & Unique');
      expect(csvContent).toContain('Value with ""quotes"" | Another with \'apostrophes\'');
    });
  });

  describe('Unicode and RTL Text', () => {
    it('should handle Unicode and RTL text correctly', async () => {
      const products: NormalizedProduct[] = [
        {
          id: '7',
          title: 'منتج باللغة العربية',
          slug: 'arabic-product',
          description: 'وصف المنتج باللغة العربية مع رموز يونيكود: 🚀⭐️',
          sku: 'AR001',
          sourceUrl: 'https://example.com/arabic',
          normalizedAt: new Date('2023-01-07T00:00:00Z'),
          confidence: 1,
          shortDescription: 'وصف قصير',
          stockStatus: 'instock',
          images: ['https://example.com/arabic-image.jpg'],
          productType: 'simple',
          variations: [],
          category: 'منتجات عربية',
          attributes: {
            'اللون': ['أحمر', 'أزرق'],
            'الحجم': ['صغير', 'كبير'],
          },
        },
      ];

      const csvContent = await csvGenerator.generateParentCsv(products);

      expect(csvContent).toContain('منتج باللغة العربية');
      expect(csvContent).toContain('وصف المنتج باللغة العربية مع رموز يونيكود: 🚀⭐️');
      expect(csvContent).toContain('منتجات عربية');
      expect(csvContent).toContain('أحمر | أزرق');
      expect(csvContent).toContain('صغير | كبير');
    });
  });

  describe('Empty and Null Values', () => {
    it('should handle empty and null values gracefully', async () => {
      const products: NormalizedProduct[] = [
        {
          id: '8',
          title: '',
          slug: 'empty-product',
          description: '',
          sku: '',
          sourceUrl: 'https://example.com/empty',
          normalizedAt: new Date('2023-01-08T00:00:00Z'),
          confidence: 0,
          shortDescription: '',
          stockStatus: '',
          images: [],
          productType: '',
          variations: [],
          category: '',
          attributes: {},
        },
      ];

      const csvContent = await csvGenerator.generateParentCsv(products);

      expect(csvContent).toBe('');
    });
  });

  describe('Large Product Sets', () => {
    it('should handle large numbers of products efficiently', async () => {
      const products: NormalizedProduct[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `product-${i}`,
        title: `Product ${i}`,
        slug: `product-${i}`,
        description: `Description for product ${i}`,
        sku: `SKU${i.toString().padStart(4, '0')}`,
        sourceUrl: `https://example.com/product${i}`,
        normalizedAt: new Date('2023-01-01T00:00:00Z'),
        confidence: 1,
        shortDescription: `Short ${i}`,
        stockStatus: 'instock',
        images: [`https://example.com/image${i}.jpg`],
        productType: 'simple',
        variations: [],
        category: 'Test Category',
        attributes: {
          index: [i.toString()],
        },
      }));

      const startTime = Date.now();
      const csvContent = await csvGenerator.generateParentCsv(products);
      const endTime = Date.now();

      expect(csvContent).toContain('ID,post_title,post_name,post_status,post_content,post_excerpt,post_parent,post_type,menu_order,sku,stock_status,images,tax:product_type,tax:product_cat,description,regular_price,sale_price');
      expect(csvContent).toContain('Product 0,product-0,publish,Description for product 0,Short 0,,product,0,SKU0000,instock,https://example.com/image0.jpg,simple,Test Category,Description for product 0,0,,');
      expect(csvContent).toContain('Product 999,product-999,publish,Description for product 999,Short 999,,product,0,SKU0999,instock,https://example.com/image999.jpg,simple,Test Category,Description for product 999,0,,');

      // Should complete within reasonable time (less than 5 seconds)
      expect(endTime - startTime).toBeLessThan(5000);
    });
  });

  describe('CSV Format Compliance', () => {
    it('should generate valid CSV format', async () => {
      const products: NormalizedProduct[] = [
        {
          id: '9',
          title: 'CSV Test Product',
          slug: 'csv-test',
          description: 'Test product for CSV format validation',
          sku: 'CSV001',
          sourceUrl: 'https://example.com/csv-test',
          normalizedAt: new Date('2023-01-09T00:00:00Z'),
          confidence: 1,
          shortDescription: 'CSV test',
          stockStatus: 'instock',
          images: ['https://example.com/csv-image.jpg'],
          productType: 'simple',
          variations: [],
          category: 'Test',
          attributes: {
            test: ['value1', 'value2'],
          },
        },
      ];

      const csvContent = await csvGenerator.generateParentCsv(products);

      // Split into lines and validate
      const lines = csvContent.split('\n');
      expect(lines.length).toBeGreaterThan(1);

      // Check header
      const header = lines[0];
      expect(header).toContain('ID,post_title,post_name,post_status,post_content,post_excerpt,post_parent,post_type,menu_order,sku,stock_status,images,tax:product_type,tax:product_cat,description,regular_price,sale_price');

      // Check data row
      const dataRow = lines[1];
      expect(dataRow).toContain('CSV Test Product,csv-test,publish,Test product for CSV format validation,CSV test,,product,0,CSV001,instock,https://example.com/csv-image.jpg,simple,Test,Test product for CSV format validation,0,,');

      // Validate CSV structure (basic checks)
      expect(dataRow.split(',').length).toBeGreaterThanOrEqual(12);
    });
  });
});
