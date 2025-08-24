'use client';

import { useEffect, useState } from 'react';
import { ScrapingJob, Product, ProductValidationReport } from '@/types';

interface ScrapingFormProps {
  onScrapingStart: () => void;
  onScrapingComplete: (job: ScrapingJob, products: Product[], validation?: ProductValidationReport) => void;
  isProcessing: boolean;
}

export function ScrapingForm({ onScrapingStart, onScrapingComplete, isProcessing }: ScrapingFormProps) {
  const [archiveUrls, setArchiveUrls] = useState<string[]>(['']);
  const [maxProductsPerArchive, setMaxProductsPerArchive] = useState<number>(0);
  const [errors, setErrors] = useState<string[]>([]);
  
  const [progress, setProgress] = useState<number>(0);
  const [logs, setLogs] = useState<Array<{ id: string; timestamp: Date; message: string; type: 'info' | 'success' | 'warning' | 'error' }>>([]);
  const [showLogs, setShowLogs] = useState<boolean>(true);
  const [initialProductCount, setInitialProductCount] = useState<number | undefined>();

  // Logging functions
  const addLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const newLog = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      message,
      type
    };
    setLogs(prev => [...prev, newLog]);
  };

  // Progress simulation during scraping
  useEffect(() => {
    if (!isProcessing) return;
    
    let progressInterval: NodeJS.Timeout;
    let stageLogsAdded = new Set<string>();
    
    // Simulate progress based on typical scraping stages
    const simulateProgress = () => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 5; // Increment by 0-5% randomly
        
        // Add stage-specific logs
        if (newProgress >= 20 && !stageLogsAdded.has('archives')) {
          addLog('Starting to fetch archive pages...', 'info');
          stageLogsAdded.add('archives');
        }
        if (newProgress >= 22 && !stageLogsAdded.has('initial_count') && initialProductCount) {
          addLog(`Found ${initialProductCount} products on the archive page`, 'info');
          stageLogsAdded.add('initial_count');
        }
        if (newProgress >= 25 && !stageLogsAdded.has('25%')) {
          addLog('Archive pages fetched successfully', 'success');
          stageLogsAdded.add('25%');
        }
        if (newProgress >= 40 && !stageLogsAdded.has('urls')) {
          addLog('Extracting product URLs from archive pages...', 'info');
          stageLogsAdded.add('urls');
        }
        if (newProgress >= 60 && !stageLogsAdded.has('products')) {
          addLog('Scraping individual product pages...', 'info');
          stageLogsAdded.add('products');
        }
        if (newProgress >= 80 && !stageLogsAdded.has('csv')) {
          addLog('Generating CSV files...', 'info');
          stageLogsAdded.add('csv');
        }
        
        // Add periodic progress updates
        if (newProgress >= 50 && !stageLogsAdded.has('50%')) {
          addLog('Product URLs extracted successfully', 'success');
          stageLogsAdded.add('50%');
        }
        if (newProgress >= 75 && !stageLogsAdded.has('75%')) {
          addLog('Product pages scraped successfully', 'success');
          stageLogsAdded.add('75%');
        }
        
        if (newProgress >= 90) return prev; // Don't go to 100% until actually complete
        return newProgress;
      });
    };
    
    // Start progress simulation
    progressInterval = setInterval(simulateProgress, 1000);
    
    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isProcessing]);

  // Reset progress when starting new scrape
  useEffect(() => {
    if (isProcessing) {
      setProgress(0);
    }
  }, [isProcessing]);

  const addArchiveUrlField = () => {
    setArchiveUrls([...archiveUrls, '']);
  };

  const removeArchiveUrlField = (index: number) => {
    if (archiveUrls.length > 1) {
      const newArchiveUrls = archiveUrls.filter((_, i) => i !== index);
      setArchiveUrls(newArchiveUrls);
    }
  };

  const updateArchiveUrl = (index: number, value: string) => {
    const newArchiveUrls = [...archiveUrls];
    newArchiveUrls[index] = value;
    setArchiveUrls(newArchiveUrls);
  };

  const validateArchiveUrls = (): boolean => {
    const newErrors: string[] = [];
    
    archiveUrls.forEach((url, index) => {
      if (!url.trim()) {
        newErrors[index] = 'Archive URL is required';
      } else if (!isValidUrl(url.trim())) {
        newErrors[index] = 'Please enter a valid URL';
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const hasValidArchiveUrls = (): boolean => {
    return archiveUrls.some(url => url.trim() && isValidUrl(url.trim()));
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
    
    if (!validateArchiveUrls()) {
      return;
    }

    const validArchiveUrls = archiveUrls.filter(url => url.trim());
    
    if (validArchiveUrls.length === 0) {
      setErrors(['At least one archive URL is required']);
      return;
    }

    onScrapingStart();

    try {
      // pre-generate request id
      const rid = crypto.randomUUID();
      // reset UI state
      setProgress(0);
      setLogs([]);
      setInitialProductCount(undefined);
      addLog(`Starting scraping job: ${rid}`, 'info');
      addLog(`Processing ${validArchiveUrls.length} archive URL(s)`, 'info');
      addLog('Fetching archive page to count products...', 'info');

      // Early total count across all archive pages (fast estimate)
      if (validArchiveUrls.length > 0) {
        try {
          const countResp = await fetch('/api/scrape/count', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ archiveUrls: validArchiveUrls, maxProductsPerArchive, fast: true })
          });
          const countJson = await countResp.json();
          if (countResp.ok && countJson.success && typeof countJson.total_product_urls === 'number') {
            setInitialProductCount(countJson.total_product_urls);
            addLog(`Estimated ${countJson.total_product_urls} products across all archive pages`, 'info');
          }
        } catch (_) {
          // non-blocking
        }
      }

      const response = await fetch('/api/scrape/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          archiveUrls: validArchiveUrls,
          maxProductsPerArchive: maxProductsPerArchive,
          requestId: rid
        }),
      });

      const result = await response.json();

      if (result.success) {
        setProgress(100);
        
        // If backend provided initial count and we didn't compute already, log once
        if (result.data.initial_product_count && initialProductCount == null) {
          setInitialProductCount(result.data.initial_product_count);
          addLog(`Found ${result.data.initial_product_count} products across all archive pages`, 'info');
        }
        
        addLog(`Successfully scraped ${result.data.total_products} products`, 'success');
        addLog('CSV files generated and ready for download', 'success');
        // Update the existing job object with the results
        const updatedJob: ScrapingJob = {
          id: result.requestId,
          status: 'completed',
          archive_urls: validArchiveUrls,
          max_products_per_archive: maxProductsPerArchive,
          total_products: result.data.total_products,
          processed_products: result.data.processed_archives,
          created_at: new Date(),
          completed_at: new Date(),
          csv_downloads: result.data.download_links,
          // Control properties
          can_pause: false,
          can_resume: false,
          can_stop: false,
          is_paused: false,
        };

        // Extract products from the response for attribute editing
        const products = result.data.products || [];
        const validation: ProductValidationReport | undefined = result.data.validation;
        onScrapingComplete(updatedJob, products, validation);
      } else {
        console.error('Archive scraping failed:', result.error);
        addLog(`Scraping failed: ${result.error}`, 'error');
        // Show error to user with more details
        const errorMessage = `Archive scraping failed: ${result.error}\n\nThis usually means:\n- No product links found on the archive page\n- Archive page structure is different than expected\n- Page requires JavaScript to render content\n\nCheck the browser console for detailed logs.`;
        alert(errorMessage);
      }
    } catch (error) {
      console.error('API call failed:', error);
      addLog(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      // Show error to user
      alert(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-2">
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Archive URLs
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Enter URLs of product archive/category pages. The scraper will automatically detect pagination and extract all products from each archive.
          <br />
          <span className="text-green-600 font-medium">✓ Supported: WooCommerce category pages, product archives, shop pages with pagination</span>
        </p>
        
        {archiveUrls.map((url, index) => (
          <div key={index} className="flex gap-2 mb-3">
            <input
              type="url"
              value={url}
              onChange={(e) => updateArchiveUrl(index, e.target.value)}
              placeholder="https://example.com/shop/category-name/"
              className={`flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors[index] ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isProcessing}
            />
            {archiveUrls.length > 1 && (
              <button
                type="button"
                onClick={() => removeArchiveUrlField(index)}
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
        
        <button
          type="button"
          onClick={addArchiveUrlField}
          className="mt-2 px-4 py-2 text-sm text-primary-600 hover:text-primary-800 disabled:opacity-50"
          disabled={isProcessing}
        >
          + Add Another Archive URL
        </button>
        </div>

        {/* Max Products Per Archive */}
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Max Products Per Archive
        </label>
        <p className="text-sm text-gray-500 mb-4">
          0 = no limit. Any positive number limits the number of products scraped per archive. The scraper will auto-paginate to reach the limit.
        </p>
        <input
          type="number"
          min="0"
          value={maxProductsPerArchive}
          onChange={(e) => setMaxProductsPerArchive(Number.isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          disabled={isProcessing}
        />
        <p className="text-xs text-gray-500 mt-1">Enter 0 for unlimited</p>
        </div>

        <button
          type="submit"
          disabled={!hasValidArchiveUrls() || isProcessing}
          className={`w-full px-4 py-3 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
            hasValidArchiveUrls() && !isProcessing
              ? 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isProcessing ? 'Scraping Archives...' : 'Start Scraping Archives'}
        </button>

        {/* Progress Bar - Only show when processing */}
        {isProcessing && (
          <div className="mt-4 bg-white border rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Scraping Progress</span>
              <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded overflow-hidden">
              <div
                className="h-3 bg-green-500 transition-all duration-300 ease-out"
                style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
              {progress < 20 && 'Initializing scraping process...'}
              {progress >= 20 && progress < 40 && 'Fetching archive pages...'}
              {progress >= 40 && progress < 60 && 'Extracting product URLs...'}
              {progress >= 60 && progress < 80 && 'Scraping product pages...'}
              {progress >= 80 && progress < 100 && 'Generating CSV files...'}
              {progress >= 100 && 'Scraping completed!'}
            </div>
            
            {/* Initial Product Count Display */}
            {initialProductCount && (
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <div className="text-xs text-blue-800 font-medium text-center">
                  📊 Found {initialProductCount} products on the archive page
                </div>
              </div>
            )}
          </div>
        )}

        {!hasValidArchiveUrls() && (
          <p className="text-sm text-gray-500 text-center">
            Enter at least one valid archive URL to start scraping
          </p>
        )}
      </form>

      {/* Sidebar: Progress Details */}
      <aside className="lg:col-span-1">
        <div className="mt-0 lg:mt-0 lg:sticky lg:top-4 border rounded-md bg-white">
          <div
            className="flex items-center justify-between px-3 py-2 cursor-pointer select-none border-b"
            onClick={() => setShowLogs(!showLogs)}
          >
            <div className="flex items-center gap-2">
              <svg className={`w-4 h-4 text-gray-600 transform transition-transform ${showLogs ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 6L14 10L6 14V6Z" clipRule="evenodd"/>
              </svg>
              <span className="text-sm font-medium text-gray-800">Progress Details</span>
              <span className="text-xs text-gray-500">({logs.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setLogs([]); }}
                className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100"
                disabled={isProcessing}
              >
                Clear
              </button>
            </div>
          </div>
          {showLogs && (
            <div className="px-3 pb-3">
              {logs.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <div className="text-sm">No progress details yet</div>
                  <div className="text-xs text-gray-400 mt-1">Start a scraping job to see detailed progress</div>
                </div>
              )}
              {logs.length > 0 && (
                <div className="max-h-[70vh] overflow-auto space-y-2">
                  {logs.map((log) => (
                    <div key={log.id} className={`flex items-start gap-2 p-2 rounded text-sm ${
                      log.type === 'error' ? 'bg-red-50 border-l-2 border-red-400' :
                      log.type === 'warning' ? 'bg-yellow-50 border-l-2 border-yellow-400' :
                      log.type === 'success' ? 'bg-green-50 border-l-2 border-green-400' :
                      'bg-blue-50 border-l-2 border-blue-400'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        log.type === 'error' ? 'bg-red-400' :
                        log.type === 'warning' ? 'bg-yellow-400' :
                        log.type === 'success' ? 'bg-green-400' :
                        'bg-blue-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-800">{log.message}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {log.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
