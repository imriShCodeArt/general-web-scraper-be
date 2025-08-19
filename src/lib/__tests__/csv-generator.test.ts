import { CSVGenerator } from '../csv-generator';
import { Product, Variation } from '@/types';

describe('CSVGenerator', () => {
  const mockSimpleProduct: Product = {
    url: 'https://example.com/simple-product',
    title: 'Basic T-Shirt',
    slug: 'basic-t-shirt',
    sku: 'TSHIRT-BASIC',
    stock_status: 'instock',
    images: ['https://example.com/tshirt1.jpg', 'https://example.com/tshirt2.jpg'],
    description: 'A basic t-shirt',
    shortDescription: 'Basic t-shirt description',
    category: 'Clothing',
    attributes: {
      Color: ['Red', 'Blue', 'Green'],
      Size: ['S', 'M', 'L']
    },
    variations: [],
    postName: 'basic-t-shirt',
    regularPrice: '19.99',
    salePrice: '',
    meta: {
      product_type: 'simple',
      is_variable: false,
      variation_count: 0
    }
  };

  const mockVariableProduct: Product = {
    url: 'https://example.com/variable-product',
    title: 'Premium T-Shirt',
    slug: 'premium-t-shirt',
    sku: 'TSHIRT-PREMIUM',
    stock_status: 'instock',
    images: ['https://example.com/premium1.jpg'],
    description: 'A premium t-shirt with variations',
    shortDescription: 'Premium t-shirt with variations',
    category: 'Clothing',
    attributes: {
      Color: ['Red', 'Blue', 'Yellow'],
      Size: ['S', 'M', 'L']
    },
    variations: [
      {
        parent_sku: 'TSHIRT-PREMIUM',
        sku: 'TSHIRT-PREMIUM-RED-S',
        stock_status: 'instock',
        regular_price: '19.99',
        tax_class: 'parent',
        images: ['https://example.com/premium-red-s.jpg'],
        meta: {
          attribute_Color: 'Red',
          attribute_Size: 'S'
        }
      },
      {
        parent_sku: 'TSHIRT-PREMIUM',
        sku: 'TSHIRT-PREMIUM-RED-M',
        stock_status: 'instock',
        regular_price: '29.99',
        tax_class: 'parent',
        images: ['https://example.com/premium-red-m.jpg'],
        meta: {
          attribute_Color: 'Red',
          attribute_Size: 'M'
        }
      }
    ],
    postName: 'premium-t-shirt',
    regularPrice: '19.99',
    salePrice: '',
    meta: {
      product_type: 'variable',
      is_variable: true,
      variation_count: 2
    }
  };

  describe('generateParentProductsCSV', () => {
    it('should generate correct parent CSV format for simple products', async () => {
      const csvBuffer = await CSVGenerator.generateParentProductsCSV([mockSimpleProduct]);
      const csvContent = csvBuffer.toString();
      
      // Check for key fields in the CSV header (the actual CSV has many more fields)
      expect(csvContent).toContain('ID');
      expect(csvContent).toContain('post_title');
      expect(csvContent).toContain('post_name');
      expect(csvContent).toContain('post_status');
      expect(csvContent).toContain('sku');
      expect(csvContent).toContain('stock_status');
      expect(csvContent).toContain('images');
      expect(csvContent).toContain('tax:product_type');
      expect(csvContent).toContain('tax:product_cat');
      expect(csvContent).toContain('description');
      // Check for key data in the CSV content
      expect(csvContent).toContain('Basic T-Shirt');
      expect(csvContent).toContain('basic-t-shirt');
      expect(csvContent).toContain('publish');
      expect(csvContent).toContain('TSHIRT-BASIC');
      expect(csvContent).toContain('instock');
      expect(csvContent).toContain('simple');
      expect(csvContent).toContain('Clothing');
      expect(csvContent).toContain('attribute:Color,attribute_data:Color,attribute:Size,attribute_data:Size');
      expect(csvContent).toContain('"Red | Blue | Green","1 | 1 | 1","S | M | L","1 | 1 | 1"');
    });

    it('should generate correct parent CSV format for variable products', async () => {
      const csvBuffer = await CSVGenerator.generateParentProductsCSV([mockVariableProduct]);
      const csvContent = csvBuffer.toString();
      
      expect(csvContent).toContain('variable,Clothing');
      expect(csvContent).toContain('"Red | Blue | Yellow","1 | 1 | 1","S | M | L","1 | 1 | 1"');
    });

    it('should handle products without attributes', async () => {
      const productWithoutAttributes = { ...mockSimpleProduct, attributes: {} };
      const csvBuffer = await CSVGenerator.generateParentProductsCSV([productWithoutAttributes]);
      const csvContent = csvBuffer.toString();
      
      // Check for key data in the CSV content
      expect(csvContent).toContain('Basic T-Shirt');
      expect(csvContent).toContain('basic-t-shirt');
      expect(csvContent).toContain('publish');
      expect(csvContent).toContain('TSHIRT-BASIC');
      expect(csvContent).toContain('instock');
      expect(csvContent).not.toContain('attribute:Color');
    });
  });

  describe('generateVariationProductsCSV', () => {
    it('should generate correct variation CSV format', async () => {
      const csvBuffer = await CSVGenerator.generateVariationProductsCSV([mockVariableProduct]);
      const csvContent = csvBuffer.toString();
      
      // Check for key fields in the CSV header (the actual CSV has many more fields)
      expect(csvContent).toContain('ID');
      expect(csvContent).toContain('post_type');
      expect(csvContent).toContain('post_status');
      expect(csvContent).toContain('parent_sku');
      expect(csvContent).toContain('post_title');
      expect(csvContent).toContain('sku');
      expect(csvContent).toContain('stock_status');
      expect(csvContent).toContain('regular_price');
      expect(csvContent).toContain('tax_class');
      expect(csvContent).toContain('images');
      // Check for key data in the CSV content
      expect(csvContent).toContain('Premium T-Shirt');
      expect(csvContent).toContain('TSHIRT-PREMIUM-RED-S');
      expect(csvContent).toContain('instock');
      expect(csvContent).toContain('19.99');
      expect(csvContent).toContain('parent');
      expect(csvContent).toContain('TSHIRT-PREMIUM-RED-M');
      expect(csvContent).toContain('29.99');
    });

    it('should include attribute meta data', async () => {
      const csvBuffer = await CSVGenerator.generateVariationProductsCSV([mockVariableProduct]);
      const csvContent = csvBuffer.toString();
      
      // Check for key fields in the CSV header (the actual CSV has many more fields)
      expect(csvContent).toContain('ID');
      expect(csvContent).toContain('post_type');
      expect(csvContent).toContain('post_status');
      expect(csvContent).toContain('parent_sku');
      expect(csvContent).toContain('post_title');
      expect(csvContent).toContain('sku');
      expect(csvContent).toContain('stock_status');
      expect(csvContent).toContain('regular_price');
      expect(csvContent).toContain('tax_class');
      expect(csvContent).toContain('images');
      expect(csvContent).toContain('meta:attribute_Color');
      expect(csvContent).toContain('meta:attribute_Size');
      // Check for key data in the CSV content
      expect(csvContent).toContain('Premium T-Shirt');
      expect(csvContent).toContain('TSHIRT-PREMIUM-RED-S');
      expect(csvContent).toContain('instock');
      expect(csvContent).toContain('19.99');
      expect(csvContent).toContain('parent');
      expect(csvContent).toContain('TSHIRT-PREMIUM-RED-M');
      expect(csvContent).toContain('29.99');
      expect(csvContent).toContain('Red,S');
      expect(csvContent).toContain('Red,M');
    });

    it('should handle products without variations', async () => {
      const csvBuffer = await CSVGenerator.generateVariationProductsCSV([mockSimpleProduct]);
      const csvContent = csvBuffer.toString();
      
      // Should only contain headers for products without variations
      expect(csvContent.split('\n').length).toBeLessThanOrEqual(2);
      // When there are no variations, CSV should be empty or just headers
      if (csvContent.trim()) {
        expect(csvContent).toContain('ID');
        expect(csvContent).toContain('post_type');
        expect(csvContent).toContain('post_status');
        expect(csvContent).toContain('parent_sku');
        expect(csvContent).toContain('post_title');
        expect(csvContent).toContain('sku');
        expect(csvContent).toContain('stock_status');
        expect(csvContent).toContain('regular_price');
        expect(csvContent).toContain('tax_class');
        expect(csvContent).toContain('images');
      }
    });
  });

  describe('generateWooCommerceCSVs', () => {
    it('should generate both CSV files simultaneously', async () => {
      const result = await CSVGenerator.generateWooCommerceCSVs([mockSimpleProduct, mockVariableProduct]);
      
      expect(result.parentProducts).toBeDefined();
      expect(result.variationProducts).toBeDefined();
      expect(result.parentProducts.length).toBeGreaterThan(0);
      expect(result.variationProducts.length).toBeGreaterThan(0);
    });
  });

  describe('generateSimpleProductsCSV', () => {
    it('should generate CSV for simple products only', async () => {
      const csvBuffer = await CSVGenerator.generateSimpleProductsCSV([mockSimpleProduct, mockVariableProduct]);
      const csvContent = csvBuffer.toString();
      
      expect(csvContent).toContain('post_title,post_name,post_status,sku,stock_status,images,tax:product_type,tax:product_cat,description,short_description,regular_price,sale_price');
      expect(csvContent).toContain('Basic T-Shirt');
      expect(csvContent).toContain('basic-t-shirt');
      expect(csvContent).toContain('simple');
      expect(csvContent).toContain('Clothing');
      expect(csvContent).toContain('A basic t-shirt');
      expect(csvContent).toContain('Basic t-shirt description');
      expect(csvContent).toContain('19.99');
      expect(csvContent).toContain('');
    });
  });
});
