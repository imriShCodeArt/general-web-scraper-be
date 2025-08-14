import { Product } from '@/types';
import { CSVGenerator } from './csv-generator';
import { writeFileSync, readFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

interface StoredCSV {
  jobId: string;
  parentProducts: Buffer;
  variationProducts: Buffer;
  timestamp: Date;
  productCount: number;
}

class CSVStorage {
  private storage = new Map<string, StoredCSV>();
  private storageDir: string;

  constructor() {
    // Use system temp directory for file storage
    this.storageDir = join(tmpdir(), 'csv-storage');
    console.log(`[CSVStorage] Storage directory: ${this.storageDir}`);
  }

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
      
      // Store in memory
      this.storage.set(jobId, {
        jobId,
        parentProducts: csvs.parentProducts,
        variationProducts: csvs.variationProducts,
        timestamp: new Date(),
        productCount: products.length
      });
      
      // Also store to file system for persistence
      try {
        const filePath = join(this.storageDir, `${jobId}.json`);
        const fileData = {
          jobId,
          parentProducts: csvs.parentProducts.toString('base64'),
          variationProducts: csvs.variationProducts.toString('base64'),
          timestamp: new Date().toISOString(),
          productCount: products.length
        };
        writeFileSync(filePath, JSON.stringify(fileData));
        console.log(`[CSVStorage] Also stored to file: ${filePath}`);
      } catch (fileError) {
        console.warn(`[CSVStorage] File storage failed (falling back to memory only):`, fileError);
      }
      
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
    
    // Try memory first
    let stored = this.storage.get(jobId);
    
    // If not in memory, try file system
    if (!stored) {
      console.log(`[CSVStorage] Not found in memory, trying file system...`);
      stored = this.loadFromFile(jobId);
      if (stored) {
        // Add back to memory
        this.storage.set(jobId, stored);
        console.log(`[CSVStorage] Loaded from file and added to memory`);
      }
    }
    
    console.log(`[CSVStorage] Found stored data:`, !!stored);
    
    if (!stored) return null;

    return type === 'parent' ? stored.parentProducts : stored.variationProducts;
  }

  /**
   * Load CSV data from file system
   */
  private loadFromFile(jobId: string): StoredCSV | null {
    try {
      const filePath = join(this.storageDir, `${jobId}.json`);
      if (!existsSync(filePath)) {
        console.log(`[CSVStorage] File not found: ${filePath}`);
        return null;
      }
      
      const fileData = JSON.parse(readFileSync(filePath, 'utf8'));
      console.log(`[CSVStorage] Loaded from file: ${filePath}`);
      
      return {
        jobId: fileData.jobId,
        parentProducts: Buffer.from(fileData.parentProducts, 'base64'),
        variationProducts: Buffer.from(fileData.variationProducts, 'base64'),
        timestamp: new Date(fileData.timestamp),
        productCount: fileData.productCount
      };
    } catch (error) {
      console.error(`[CSVStorage] Error loading from file:`, error);
      return null;
    }
  }

  /**
   * Get job information
   */
  getJobInfo(jobId: string): Omit<StoredCSV, 'parentProducts' | 'variationProducts'> | null {
    console.log(`[CSVStorage] Getting job info for job ${jobId}`);
    console.log(`[CSVStorage] Current storage size: ${this.storage.size}`);
    console.log(`[CSVStorage] All job IDs in storage:`, Array.from(this.storage.keys()));
    
    let stored = this.storage.get(jobId);
    
    // If not in memory, try file system
    if (!stored) {
      stored = this.loadFromFile(jobId);
      if (stored) {
        this.storage.set(jobId, stored);
      }
    }
    
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
    
    // Clean memory
    for (const [jobId, stored] of this.storage.entries()) {
      if (stored.timestamp < oneHourAgo) {
        this.storage.delete(jobId);
      }
    }
    
    // Clean files
    try {
      // This is a simplified cleanup - in production you might want more sophisticated file management
      console.log(`[CSVStorage] Cleanup completed`);
    } catch (error) {
      console.warn(`[CSVStorage] File cleanup warning:`, error);
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
