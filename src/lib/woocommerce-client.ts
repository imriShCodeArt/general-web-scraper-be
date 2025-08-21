import { WooCommerceCredentials, WooCommerceProduct, Product } from '@/types';

export class WooCommerceClient {
  private credentials: WooCommerceCredentials;
  private baseUrl: string;
  private auth: string;

  constructor(credentials: WooCommerceCredentials) {
    this.credentials = credentials;
    this.baseUrl = credentials.siteUrl.replace(/\/$/, '');
    this.auth = Buffer.from(`${credentials.consumerKey}:${credentials.consumerSecret}`).toString('base64');
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any): Promise<any> {
    const url = `${this.baseUrl}/wp-json/wc/v3/${endpoint}`;
    
    const headers: Record<string, string> = {
      'Authorization': `Basic ${this.auth}`,
      'Content-Type': 'application/json',
    };

    if (!this.credentials.verifySSL) {
      // Note: In production, you should always verify SSL
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`WooCommerce API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`WooCommerce API request failed: ${error.message}`);
      }
      throw new Error('WooCommerce API request failed');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('products?per_page=1');
      return true;
    } catch (error) {
      return false;
    }
  }

  async getProducts(page: number = 1, perPage: number = 100): Promise<WooCommerceProduct[]> {
    return this.makeRequest(`products?page=${page}&per_page=${perPage}`);
  }

  async searchProductsBySku(sku: string): Promise<WooCommerceProduct[]> {
    return this.makeRequest(`products?sku=${encodeURIComponent(sku)}`);
  }

  async searchProductsBySlug(slug: string): Promise<WooCommerceProduct[]> {
    return this.makeRequest(`products?slug=${encodeURIComponent(slug)}`);
  }

  async createProduct(product: WooCommerceProduct): Promise<WooCommerceProduct> {
    return this.makeRequest('products', 'POST', product);
  }

  async updateProduct(id: number, product: Partial<WooCommerceProduct>): Promise<WooCommerceProduct> {
    return this.makeRequest(`products/${id}`, 'PUT', product);
  }

  async deleteProduct(id: number): Promise<void> {
    await this.makeRequest(`products/${id}`, 'DELETE');
  }

  async getCategories(): Promise<Array<{ id: number; name: string; slug: string }>> {
    return this.makeRequest('products/categories?per_page=100');
  }

  async createCategory(name: string, slug?: string): Promise<{ id: number; name: string; slug: string }> {
    const data: any = { name };
    if (slug) data.slug = slug;
    return this.makeRequest('products/categories', 'POST', data);
  }

  async getAttributes(): Promise<Array<{ id: number; name: string; slug: string }>> {
    return this.makeRequest('products/attributes?per_page=100');
  }

  async createAttribute(name: string, slug?: string): Promise<{ id: number; name: string; slug: string }> {
    const data: any = { name };
    if (slug) data.slug = slug;
    return this.makeRequest('products/attributes', 'POST', data);
  }

  // Convert scraped Product to WooCommerce format
  convertToWooCommerce(scrapedProduct: Product): WooCommerceProduct {
    const wcProduct: WooCommerceProduct = {
      name: scrapedProduct.title,
      slug: scrapedProduct.slug,
      type: scrapedProduct.variations.length > 0 ? 'variable' : 'simple',
      status: 'draft', // Start as draft for safety
      featured: false,
      catalog_visibility: 'visible',
      description: scrapedProduct.description,
      short_description: scrapedProduct.shortDescription,
      sku: scrapedProduct.sku,
      regular_price: scrapedProduct.regularPrice || '0',
      sale_price: scrapedProduct.salePrice || undefined,
      on_sale: false,
      purchasable: true,
      total_sales: 0,
      virtual: false,
      downloadable: false,
      tax_status: 'taxable',
      tax_class: '',
      manage_stock: false,
      stock_status: scrapedProduct.stock_status,
      backorders: 'no',
      backorders_allowed: false,
      backordered: false,
      sold_individually: false,
      weight: '',
      dimensions: {
        length: '',
        width: '',
        height: '',
      },
      shipping_required: true,
      shipping_taxable: true,
      shipping_class: '',
      shipping_class_id: 0,
      reviews_allowed: true,
      average_rating: '0',
      rating_count: 0,
      related_ids: [],
      upsell_ids: [],
      cross_sell_ids: [],
      parent_id: 0,
      categories: scrapedProduct.category ? [{ id: 0, name: scrapedProduct.category, slug: scrapedProduct.category.toLowerCase().replace(/\s+/g, '-') }] : [],
      tags: [],
      images: scrapedProduct.images.map((url, index) => ({
        id: 0,
        src: url,
        name: `${scrapedProduct.title} - Image ${index + 1}`,
        alt: scrapedProduct.title,
      })),
      attributes: Object.entries(scrapedProduct.attributes).map(([name, values]) => ({
        id: 0,
        name,
        position: 0,
        visible: true,
        variation: scrapedProduct.variations.length > 0,
        options: Array.isArray(values) ? values.filter(v => v !== undefined) : [values].filter(v => v !== undefined),
      })),
      variations: [],
      menu_order: 0,
      meta_data: [
        { key: '_scraped_url', value: scrapedProduct.url },
        { key: '_scraped_post_name', value: scrapedProduct.postName },
      ],
      date_created: new Date().toISOString(),
      date_created_gmt: new Date().toISOString(),
      date_modified: new Date().toISOString(),
      date_modified_gmt: new Date().toISOString(),
    };

    return wcProduct;
  }

  // Find existing products by SKU or slug
  async findExistingProducts(products: Product[]): Promise<Map<string, WooCommerceProduct>> {
    const existingProducts = new Map<string, WooCommerceProduct>();
    
    for (const product of products) {
      try {
        // Try to find by SKU first
        if (product.sku) {
          const skuResults = await this.searchProductsBySku(product.sku);
          if (skuResults.length > 0) {
            existingProducts.set(product.sku, skuResults[0]);
            continue;
          }
        }

        // Try to find by slug
        if (product.slug) {
          const slugResults = await this.searchProductsBySlug(product.slug);
          if (slugResults.length > 0) {
            existingProducts.set(product.slug, slugResults[0]);
            continue;
          }
        }
      } catch (error) {
        console.warn(`Failed to search for existing product ${product.sku || product.slug}:`, error);
      }
    }

    return existingProducts;
  }
}
