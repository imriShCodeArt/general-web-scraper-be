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
      
      expect(csvContent).toContain('post_title,post_name,post_status,sku,stock_status,images,tax:product_type,tax:product_cat');
      expect(csvContent).toContain('Basic T-Shirt,basic-t-shirt,publish,TSHIRT-BASIC,instock');
      expect(csvContent).toContain('simple,Clothing');
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
      
      expect(csvContent).toContain('Basic T-Shirt,basic-t-shirt,publish,TSHIRT-BASIC,instock');
      expect(csvContent).not.toContain('attribute:Color');
    });
  });

  describe('generateVariationProductsCSV', () => {
    it('should generate correct variation CSV format', async () => {
      const csvBuffer = await CSVGenerator.generateVariationProductsCSV([mockVariableProduct]);
      const csvContent = csvBuffer.toString();
      
      expect(csvContent).toContain('parent_sku,sku,stock_status,regular_price,tax_class,images');
      expect(csvContent).toContain('TSHIRT-PREMIUM,TSHIRT-PREMIUM-RED-S,instock,19.99,parent');
      expect(csvContent).toContain('TSHIRT-PREMIUM,TSHIRT-PREMIUM-RED-M,instock,29.99,parent');
    });

    it('should include attribute meta data', async () => {
      const csvBuffer = await CSVGenerator.generateVariationProductsCSV([mockVariableProduct]);
      const csvContent = csvBuffer.toString();
      
      expect(csvContent).toContain('meta:attribute_Color,meta:attribute_Size');
      expect(csvContent).toContain('Red,S');
      expect(csvContent).toContain('Red,M');
    });

    it('should handle products without variations', async () => {
      const csvBuffer = await CSVGenerator.generateVariationProductsCSV([mockSimpleProduct]);
      const csvContent = csvBuffer.toString();
      
      // Should only contain headers for products without variations
      expect(csvContent.split('\n').length).toBeLessThanOrEqual(2);
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
      
      // Should only contain simple products
      expect(csvContent).toContain('TSHIRT-BASIC');
      expect(csvContent).not.toContain('TSHIRT-PREMIUM');
    });
  });

  describe('Hebrew Text Encoding', () => {
    it('should encode Hebrew text in product titles', async () => {
      const hebrewProduct = {
        ...mockSimpleProduct,
        title: 'פופ סט למטבח 3 חלקים – אפור',
        postName: 'פופ-סט-למטבח-3-חלקים-אפור',
        category: 'הלבשת השולחן'
      };

      const csvBuffer = await CSVGenerator.generateParentProductsCSV([hebrewProduct]);
      const csvContent = csvBuffer.toString();
      
      // Hebrew text should be URL-encoded
      expect(csvContent).toContain('%D7%A4%D7%95%D7%A4%20%D7%A1%D7%98%20%D7%9C%D7%9E%D7%98%D7%91%D7%97%203%20%D7%97%D7%9C%D7%A7%D7%99%D7%9D%20%E2%80%93%20%D7%90%D7%A4%D7%95%D7%A8');
      expect(csvContent).toContain('%D7%A4%D7%95%D7%A4-%D7%A1%D7%98-%D7%9C%D7%9E%D7%98%D7%91%D7%97-3-%D7%97%D7%9C%D7%A7%D7%99%D7%9D-%D7%90%D7%A4%D7%95%D7%A8');
      expect(csvContent).toContain('%D7%94%D7%9C%D7%91%D7%A9%D7%AA%20%D7%94%D7%A9%D7%95%D7%9C%D7%97%D7%9F');
      
      // Raw Hebrew should NOT be present
      expect(csvContent).not.toContain('פופ סט למטבח');
      expect(csvContent).not.toContain('הלבשת השולחן');
    });

    it('should encode Hebrew text in attributes', async () => {
      const hebrewAttributesProduct = {
        ...mockSimpleProduct,
        attributes: {
          Color: ['אדום', 'כחול', 'ירוק'],
          Size: ['קטן', 'בינוני', 'גדול']
        }
      };

      const csvBuffer = await CSVGenerator.generateParentProductsCSV([hebrewAttributesProduct]);
      const csvContent = csvBuffer.toString();
      
      // Hebrew attributes should be URL-encoded
      expect(csvContent).toContain('%D7%90%D7%93%D7%95%D7%9D%20%7C%20%D7%9B%D7%97%D7%95%D7%9C%20%7C%20%D7%99%D7%A8%D7%95%D7%A7');
      expect(csvContent).toContain('%D7%A7%D7%98%D7%9F%20%7C%20%D7%91%D7%99%D7%A0%D7%95%D7%A0%D7%99%20%7C%20%D7%92%D7%93%D7%95%D7%9C');
      
      // Raw Hebrew should NOT be present
      expect(csvContent).not.toContain('אדום');
      expect(csvContent).not.toContain('כחול');
    });

    it('should not encode non-Hebrew text', async () => {
      const englishProduct = {
        ...mockSimpleProduct,
        title: 'Basic T-Shirt',
        category: 'Clothing'
      };

      const csvBuffer = await CSVGenerator.generateParentProductsCSV([englishProduct]);
      const csvContent = csvBuffer.toString();
      
      // English text should remain unchanged
      expect(csvContent).toContain('Basic T-Shirt');
      expect(csvContent).toContain('Clothing');
      
      // Should not contain URL encoding
      expect(csvContent).not.toContain('%');
    });

    it('should encode Hebrew text in variations', async () => {
      const hebrewVariationProduct = {
        ...mockVariableProduct,
        variations: [
          {
            ...mockVariableProduct.variations[0],
            meta: {
              attribute_Color: 'אדום',
              attribute_Size: 'בינוני'
            }
          }
        ]
      };

      const csvBuffer = await CSVGenerator.generateVariationProductsCSV([hebrewVariationProduct]);
      const csvContent = csvBuffer.toString();
      
      // Hebrew variation attributes should be URL-encoded
      expect(csvContent).toContain('%D7%90%D7%93%D7%95%D7%9D');
      expect(csvContent).toContain('%D7%91%D7%99%D7%A0%D7%95%D7%A0%D7%99');
      
      // Raw Hebrew should NOT be present
      expect(csvContent).not.toContain('אדום');
      expect(csvContent).not.toContain('בינוני');
    });
  });
});
