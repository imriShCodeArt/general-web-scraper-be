'use client';

import { useState } from 'react';
import { ScrapingJob } from '@/types';

interface ScrapingFormProps {
  onScrapingStart: () => void;
  onScrapingComplete: (job: ScrapingJob) => void;
  isProcessing: boolean;
}

export function ScrapingForm({ onScrapingStart, onScrapingComplete, isProcessing }: ScrapingFormProps) {
  const [urls, setUrls] = useState<string[]>(['']);
  const [maxProductsPerUrl, setMaxProductsPerUrl] = useState<number>(100);
  const [errors, setErrors] = useState<string[]>([]);

  const addUrlField = () => {
    setUrls([...urls, '']);
  };

  const removeUrlField = (index: number) => {
    if (urls.length > 1) {
      const newUrls = urls.filter((_, i) => i !== index);
      setUrls(newUrls);
    }
  };

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const validateUrls = (): boolean => {
    const newErrors: string[] = [];
    
    urls.forEach((url, index) => {
      if (!url.trim()) {
        newErrors[index] = 'URL is required';
      } else if (!isValidUrl(url.trim())) {
        newErrors[index] = 'Please enter a valid URL';
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const hasValidUrls = (): boolean => {
    return urls.some(url => url.trim() && isValidUrl(url.trim()));
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUrls()) {
      return;
    }

    const validUrls = urls.filter(url => url.trim());
    
          if (validUrls.length === 0) {
        setErrors(['At least one URL is required']);
        return;
      }

    onScrapingStart();

    try {
      const response = await fetch('/api/scrape/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          urls: validUrls,
          maxProductsPerUrl: maxProductsPerUrl
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Create a ScrapingJob object from the response
        const job: ScrapingJob = {
          id: result.requestId,
          status: 'completed',
          urls: validUrls,
          max_products_per_url: maxProductsPerUrl,
          total_products: result.data.total_products,
          processed_products: result.data.processed_urls,
          created_at: new Date(),
          completed_at: new Date(),
          csv_downloads: result.data.download_links,
        };

        onScrapingComplete(job);
             } else {
         console.error('Scraping failed:', result.error);
         // Show error to user with more details
         const errorMessage = `Scraping failed: ${result.error}\n\nThis usually means:\n- No HTML tables found on the page\n- Table structure is different than expected\n- Page requires JavaScript to render content\n\nCheck the browser console for detailed logs.`;
         alert(errorMessage);
       }
         } catch (error) {
       console.error('API call failed:', error);
       // Show error to user
       alert(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
     }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Table URLs
        </label>
                 <p className="text-sm text-gray-500 mb-4">
           Enter URLs of HTML pages containing tables with product information, or XML sitemaps. 
           The scraper will automatically detect the format and extract product URLs accordingly.
           <br />
           <span className="text-green-600 font-medium">✓ Supported: HTML tables, XML sitemaps (.xml files)</span>
         </p>
        
        {urls.map((url, index) => (
          <div key={index} className="flex gap-2 mb-3">
            <input
              type="url"
              value={url}
              onChange={(e) => updateUrl(index, e.target.value)}
              placeholder="https://example.com/products-table"
              className={`flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors[index] ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isProcessing}
            />
            {urls.length > 1 && (
              <button
                type="button"
                onClick={() => removeUrlField(index)}
                className="px-3 py-2 text-red-600 hover:text-red-800 disabled:opacity-50"
                disabled={isProcessing}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        ))}
        
        {errors.some(error => error) && (
          <div className="text-red-600 text-sm">
            {errors.map((error, index) => error && (
              <p key={index} className="mb-1">• {error}</p>
            ))}
          </div>
        )}
      </div>

      {/* Max Products Per URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Max Products Per URL
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Limit the number of products scraped from each table page. This helps control processing time and resource usage.
        </p>
        <input
          type="number"
          min="1"
          max="1000"
          value={maxProductsPerUrl}
          onChange={(e) => setMaxProductsPerUrl(parseInt(e.target.value) || 100)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          disabled={isProcessing}
        />
        <p className="text-xs text-gray-500 mt-1">
          Range: 1-1000 products per URL
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={addUrlField}
          className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-md hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
          disabled={isProcessing}
        >
          Add Another URL
        </button>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isProcessing || !hasValidUrls()}
          className="w-full px-4 py-3 text-white bg-primary-600 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : 'Start Scraping'}
        </button>
        {!hasValidUrls() && urls.some(url => url.trim()) && (
          <p className="text-sm text-amber-600 mt-2 text-center">
            Please enter valid URLs to enable scraping
          </p>
        )}
      </div>

      {isProcessing && (
        <div className="text-center text-sm text-gray-600">
          <p>This may take several minutes depending on the number of products.</p>
          <p className="mt-1">Please don't close this page.</p>
        </div>
      )}
    </form>
  );
}
