import { TableScraper, ProductScraper } from '../scraper';

describe('TableScraper', () => {
  describe('parseTablePage', () => {
    it('should extract URLs from HTML table', () => {
      const html = `
        <table>
          <tr>
            <td><a href="https://example.com/product1">Product 1</a></td>
            <td>Image 1</td>
            <td>2024-01-15</td>
          </tr>
          <tr>
            <td><a href="https://example.com/product2">Product 2</a></td>
            <td>Image 2</td>
            <td>2024-01-16</td>
          </tr>
        </table>
      `;
      
      const baseUrl = 'https://example.com';
      const urls = TableScraper.parseTablePage(html, baseUrl);
      
      expect(urls).toEqual([
        'https://example.com/product1',
        'https://example.com/product2'
      ]);
    });

    it('should handle relative URLs', () => {
      const html = `
        <table>
          <tr>
            <td><a href="/product1">Product 1</a></td>
          </tr>
        </table>
      `;
      
      const baseUrl = 'https://example.com';
      const urls = TableScraper.parseTablePage(html, baseUrl);
      
      expect(urls).toEqual(['https://example.com/product1']);
    });

    it('should return empty array for invalid HTML', () => {
      const html = '<div>No table here</div>';
      const baseUrl = 'https://example.com';
      const urls = TableScraper.parseTablePage(html, baseUrl);
      
      expect(urls).toEqual([]);
    });
  });

  describe('parseTableRows', () => {
    it('should extract table rows with additional data', () => {
      const html = `
        <table>
          <tr>
            <td><a href="https://example.com/product1">Product 1</a></td>
            <td><img src="image1.jpg" /></td>
            <td>2024-01-15</td>
          </tr>
        </table>
      `;
      
      const baseUrl = 'https://example.com';
      const rows = TableScraper.parseTableRows(html, baseUrl);
      
      expect(rows).toHaveLength(1);
      expect(rows[0]).toEqual({
        url: 'https://example.com/product1',
        images: 'image1.jpg',
        lastModified: '2024-01-15'
      });
    });
  });
});

describe('ProductScraper', () => {
  describe('scrapeProductPage', () => {
    it('should extract basic product information', async () => {
      const html = `
        <html>
          <head>
            <title>Test Product</title>
            <meta name="description" content="Test product description" />
          </head>
          <body>
            <h1 class="product_title entry-title">Test Product Title</h1>
            <div class="elementor-widget-woocommerce-product-content">
              <p>Detailed product description</p>
              <p>More product details</p>
            </div>
            <input name="gtmkit_product_data" value="{&quot;id&quot;:&quot;12345&quot;,&quot;item_name&quot;:&quot;Test Product&quot;,&quot;currency&quot;:&quot;ILS&quot;,&quot;price&quot;:99,&quot;item_category&quot;:&quot;Test Category&quot;}" />
            <div class="jet-woo-product-gallery">
              <div class="jet-woo-product-gallery__image">
                <img src="product1.jpg" alt="Product Image" class="wp-post-gallery" />
              </div>
              <div class="jet-woo-product-gallery__image">
                <img src="product2.jpg" alt="Product Image 2" class="wp-post-gallery" />
              </div>
            </div>
          </body>
        </html>
      `;
      
      const url = 'https://example.com/product1';
      const product = await ProductScraper.scrapeProductPage(url, html);
      
      expect(product.title).toBe('Test Product Title');
      expect(product.sku).toBe('12345');
      expect(product.description).toBe('Detailed product description\n\nMore product details');
      expect(product.regularPrice).toBe('99');
      expect(product.category).toBe('Test Category');
      expect(product.images).toContain('product1.jpg');
      expect(product.images).toContain('product2.jpg');
    });

    it('should generate SKU and slug when not present', async () => {
      const html = `
        <html>
          <head><title>New Product</title></head>
          <body>
            <h1 class="product_title">New Product</h1>
            <div class="elementor-widget-woocommerce-product-content">
              <p>New product description</p>
            </div>
          </body>
        </html>
      `;
      
      const url = 'https://example.com/new-product';
      const product = await ProductScraper.scrapeProductPage(url, html);
      
      expect(product.sku).toMatch(/^post_\d+_[a-z0-9]+$/);
      expect(product.postName).toBe('new-product');
    });

    it('should extract category from breadcrumbs', async () => {
      const html = `
        <html>
          <body>
            <nav aria-label="breadcrumb">
              <a href="/category">Category</a>
              <a href="/category/subcategory">Subcategory</a>
            </nav>
          </body>
        </html>
      `;
      
      const url = 'https://example.com/product';
      const product = await ProductScraper.scrapeProductPage(url, html);
      
      expect(product.category).toBe('Subcategory');
    });
  });
});
