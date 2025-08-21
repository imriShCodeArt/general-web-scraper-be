import { Product, WooCommerceProduct, ImportPreview, ImportProgress, ImportResult, WooCommerceCredentials } from '@/types';
import { WooCommerceClient } from './woocommerce-client';

export class ImportService {
  private wcClient: WooCommerceClient;
  private onProgress?: (progress: ImportProgress) => void;

  constructor(credentials: WooCommerceCredentials, onProgress?: (progress: ImportProgress) => void) {
    this.wcClient = new WooCommerceClient(credentials);
    this.onProgress = onProgress;
  }

  private updateProgress(progress: ImportProgress) {
    this.onProgress?.(progress);
  }

  async generatePreview(products: Product[]): Promise<ImportPreview> {
    this.updateProgress({
      total: products.length,
      processed: 0,
      current: 0,
      stage: 'preparing',
      message: 'Analyzing products and checking for existing matches...'
    });

    const newProducts: WooCommerceProduct[] = [];
    const existingProducts: ImportPreview['existingProducts'] = [];
    const skippedProducts: ImportPreview['skippedProducts'] = [];
    
    // Find existing products
    const existingProductsMap = await this.wcClient.findExistingProducts(products);
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      this.updateProgress({
        total: products.length,
        processed: i,
        current: i + 1,
        stage: 'preparing',
        message: `Analyzing product: ${product.title}`,
        currentProduct: { name: product.title, action: 'analyzing' }
      });

      // Check if product should be skipped
      if (!product.title || !product.sku) {
        skippedProducts.push({
          product,
          reason: !product.title ? 'Missing title' : 'Missing SKU'
        });
        continue;
      }

      // Convert to WooCommerce format
      const wcProduct = this.wcClient.convertToWooCommerce(product);
      
      // Check if product already exists
      const existingBySku = existingProductsMap.get(product.sku);
      const existingBySlug = existingProductsMap.get(product.slug);
      const existing = existingBySku || existingBySlug;

      if (existing) {
        // Product exists - prepare update
        const updatedProduct = { ...wcProduct };
        const changes = this.detectChanges(existing, updatedProduct);
        
        existingProducts.push({
          existing,
          updated: updatedProduct,
          changes
        });
      } else {
        // New product
        newProducts.push(wcProduct);
      }
    }

    const summary = {
      total: products.length,
      new: newProducts.length,
      updates: existingProducts.length,
      skipped: skippedProducts.length
    };

    this.updateProgress({
      total: products.length,
      processed: products.length,
      current: products.length,
      stage: 'preparing',
      message: 'Preview generated successfully'
    });

    return {
      newProducts,
      existingProducts,
      skippedProducts,
      summary
    };
  }

  private detectChanges(existing: WooCommerceProduct, updated: WooCommerceProduct): Array<{ field: string; oldValue: any; newValue: any }> {
    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];
    
    const fieldsToCheck = [
      'name', 'description', 'short_description', 'regular_price', 'sale_price',
      'stock_status', 'categories', 'attributes', 'images'
    ];

    for (const field of fieldsToCheck) {
      const oldValue = existing[field as keyof WooCommerceProduct];
      const newValue = updated[field as keyof WooCommerceProduct];
      
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({ field, oldValue, newValue });
      }
    }

    return changes;
  }

  async executeImport(products: Product[], options: {
    updateExisting: boolean;
    publishImmediately: boolean;
    skipDuplicates: boolean;
  }): Promise<ImportResult> {
    const preview = await this.generatePreview(products);
    
    this.updateProgress({
      total: products.length,
      processed: 0,
      current: 0,
      stage: 'importing',
      message: 'Starting import process...'
    });

    let imported = 0;
    let updated = 0;
    let skipped = 0;
    const errors: Array<{ product: string; error: string }> = [];

    // Import new products
    for (let i = 0; i < preview.newProducts.length; i++) {
      const wcProduct = preview.newProducts[i];
      
      this.updateProgress({
        total: products.length,
        processed: i + preview.existingProducts.length,
        current: i + 1,
        stage: 'importing',
        message: `Creating product: ${wcProduct.name}`,
        currentProduct: { name: wcProduct.name, action: 'creating' }
      });

      try {
        if (options.publishImmediately) {
          wcProduct.status = 'publish';
        }
        
        await this.wcClient.createProduct(wcProduct);
        imported++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push({ product: wcProduct.name, error: errorMessage });
        console.error(`Failed to create product ${wcProduct.name}:`, error);
      }
    }

    // Update existing products
    if (options.updateExisting) {
      this.updateProgress({
        total: products.length,
        processed: preview.newProducts.length,
        current: preview.newProducts.length + 1,
        stage: 'updating',
        message: 'Updating existing products...'
      });

      for (let i = 0; i < preview.existingProducts.length; i++) {
        const { existing, updated: updatedProduct } = preview.existingProducts[i];
        
        this.updateProgress({
          total: products.length,
          processed: preview.newProducts.length + i,
          current: preview.newProducts.length + i + 1,
          stage: 'updating',
          message: `Updating product: ${existing.name}`,
          currentProduct: { name: existing.name, action: 'updating' }
        });

        try {
          if (options.publishImmediately) {
            updatedProduct.status = 'publish';
          }
          
          await this.wcClient.updateProduct(existing.id!, updatedProduct);
          updated++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push({ product: existing.name, error: errorMessage });
          console.error(`Failed to update product ${existing.name}:`, error);
        }
      }
    } else {
      skipped += preview.existingProducts.length;
    }

    // Add skipped products to skipped count
    skipped += preview.skippedProducts.length;

    this.updateProgress({
      total: products.length,
      processed: products.length,
      current: products.length,
      stage: 'complete',
      message: 'Import completed'
    });

    const summary = `Import completed: ${imported} created, ${updated} updated, ${skipped} skipped${errors.length > 0 ? `, ${errors.length} errors` : ''}`;

    return {
      success: errors.length === 0,
      imported,
      updated,
      skipped,
      errors,
      summary
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      return await this.wcClient.testConnection();
    } catch (error) {
      return false;
    }
  }
}
