import { Product } from '@/types';
import { CSVGenerator } from './csv-generator';

interface StoredCSV {
  jobId: string;
  parentProducts: Buffer;
  variationProducts: Buffer;
  timestamp: Date;
  productCount: number;
}

class CSVStorage {
  private storage = new Map<string, StoredCSV>();

  /**
   * Store CSV data for a scraping job
   */
  async storeCSVData(jobId: string, products: Product[]): Promise<void> {
    console.log(`[CSVStorage] Storing data for job ${jobId} with ${products.length} products`);
    console.log(`[CSVStorage] Current storage size before: ${this.storage.size}`);
    console.log(`[CSVStorage] All job IDs in storage before:`, Array.from(this.storage.keys()));
    
    try {
      const csvs = await CSVGenerator.generateWooCommerceCSVs(products);
      console.log(`[CSVStorage] Generated CSV buffers - parent: ${csvs.parentProducts.length} bytes, variation: ${csvs.variationProducts.length} bytes`);
      
      this.storage.set(jobId, {
        jobId,
        parentProducts: csvs.parentProducts,
        variationProducts: csvs.variationProducts,
        timestamp: new Date(),
        productCount: products.length
      });
      
      console.log(`[CSVStorage] Stored data for job ${jobId}`);
      console.log(`[CSVStorage] Current storage size after: ${this.storage.size}`);
      console.log(`[CSVStorage] All job IDs in storage after:`, Array.from(this.storage.keys()));
      
      // Immediate verification
      const stored = this.storage.get(jobId);
      console.log(`[CSVStorage] Immediate verification - found:`, !!stored, 'size:', stored?.parentProducts.length || 0);
      
    } catch (error) {
      console.error(`[CSVStorage] Error storing data for job ${jobId}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve CSV data for a specific job and type
   */
  getCSVData(jobId: string, type: 'parent' | 'variation'): Buffer | null {
    console.log(`[CSVStorage] Getting CSV data for job ${jobId}, type ${type}`);
    console.log(`[CSVStorage] Current storage size: ${this.storage.size}`);
    console.log(`[CSVStorage] All job IDs in storage:`, Array.from(this.storage.keys()));
    
    const stored = this.storage.get(jobId);
    console.log(`[CSVStorage] Found stored data:`, !!stored);
    
    if (!stored) return null;

    return type === 'parent' ? stored.parentProducts : stored.variationProducts;
  }

  /**
   * Get job information
   */
  getJobInfo(jobId: string): Omit<StoredCSV, 'parentProducts' | 'variationProducts'> | null {
    console.log(`[CSVStorage] Getting job info for job ${jobId}`);
    console.log(`[CSVStorage] Current storage size: ${this.storage.size}`);
    console.log(`[CSVStorage] All job IDs in storage:`, Array.from(this.storage.keys()));
    
    const stored = this.storage.get(jobId);
    console.log(`[CSVStorage] Found stored job info:`, !!stored);
    
    if (!stored) return null;

    return {
      jobId: stored.jobId,
      timestamp: stored.timestamp,
      productCount: stored.productCount
    };
  }

  /**
   * Clean up old entries (older than 1 hour)
   */
  cleanup(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    for (const [jobId, stored] of this.storage.entries()) {
      if (stored.timestamp < oneHourAgo) {
        this.storage.delete(jobId);
      }
    }
  }

  /**
   * Debug: List all stored jobs
   */
  listAllJobs(): Array<{ jobId: string; timestamp: Date; productCount: number }> {
    console.log(`[CSVStorage] Listing all jobs. Current storage size: ${this.storage.size}`);
    console.log(`[CSVStorage] All job IDs in storage:`, Array.from(this.storage.keys()));
    
    const jobs = Array.from(this.storage.entries()).map(([jobId, stored]) => ({
      jobId,
      timestamp: stored.timestamp,
      productCount: stored.productCount
    }));
    
    console.log(`[CSVStorage] Returning ${jobs.length} jobs:`, jobs);
    return jobs;
  }
}

// Export singleton instance
export const csvStorage = new CSVStorage();
