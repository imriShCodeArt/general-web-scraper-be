'use client';

import { useEffect, useRef, useState } from 'react';
import { ScrapingJob } from '@/types';

interface ScrapingFormProps {
  onScrapingStart: () => void;
  onScrapingComplete: (job: ScrapingJob) => void;
  isProcessing: boolean;
}

export function ScrapingForm({ onScrapingStart, onScrapingComplete, isProcessing }: ScrapingFormProps) {
  const [archiveUrls, setArchiveUrls] = useState<string[]>(['']);
  const [maxProductsPerArchive, setMaxProductsPerArchive] = useState<number>(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState<boolean>(false);
  const [logs, setLogs] = useState<Array<{ ts: number; level?: string; msg: string }>>([]);
  const [progress, setProgress] = useState<number>(0);
  const esRef = useRef<EventSource | null>(null);
  const logContainerRef = useRef<HTMLDivElement | null>(null);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);

  // Auto-scroll logs when new entries arrive
  useEffect(() => {
    if (!showLogs || !autoScroll) return;
    const el = logContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [logs, showLogs, autoScroll]);

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
      // pre-generate request id and subscribe BEFORE starting the scrape
      const rid = crypto.randomUUID();
      // reset UI state
      setLogs([]);
      setProgress(0);
      setShowLogs(true);
      // open SSE early
      if (esRef.current) {
        try { esRef.current.close(); } catch {}
        esRef.current = null;
      }
      const es = new EventSource(`/api/logs/${rid}`);
      esRef.current = es;
      es.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          if (data.type === 'log') {
            setLogs((prev) => [...prev, { ts: data.timestamp, level: data.level, msg: data.message }]);
          } else if (data.type === 'progress') {
            if (typeof data.percent === 'number') setProgress(data.percent);
            if (data.message) setLogs((prev) => [...prev, { ts: data.timestamp, msg: data.message }]);
          }
        } catch {}
      };
      es.onerror = () => {
        try { es.close(); } catch {}
      };
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
        // backfill any logs returned in response (in case scrape finished quickly)
        if (Array.isArray(result.logs)) {
          setLogs((prev) => {
            const merged = [...prev];
            for (const e of result.logs) {
              if (e?.type === 'log') merged.push({ ts: e.timestamp, level: e.level, msg: e.message });
              if (e?.type === 'progress') {
                if (typeof e.percent === 'number') setProgress(e.percent);
                if (e.message) merged.push({ ts: e.timestamp, msg: e.message });
              }
            }
            return merged;
          });
        }
        // Create a ScrapingJob object from the response
        const job: ScrapingJob = {
          id: result.requestId,
          status: 'completed',
          archive_urls: validArchiveUrls,
          max_products_per_archive: maxProductsPerArchive,
          total_products: result.data.total_products,
          processed_products: result.data.processed_archives,
          created_at: new Date(),
          completed_at: new Date(),
          csv_downloads: result.data.download_links,
        };

        onScrapingComplete(job);
      } else {
        console.error('Archive scraping failed:', result.error);
        // Show error to user with more details
        const errorMessage = `Archive scraping failed: ${result.error}\n\nThis usually means:\n- No product links found on the archive page\n- Archive page structure is different than expected\n- Page requires JavaScript to render content\n\nCheck the browser console for detailed logs.`;
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

      {/* Always-visible Progress Bar */}
      <div className="mt-4 bg-white border rounded-md p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-xs text-gray-500">{progress}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded overflow-hidden">
          <div
            className="h-3 bg-green-500 transition-all duration-300"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
      </div>

      {/* Logs Panel (collapsible body only) */}
      <div className="mt-4 border rounded-md bg-white">
        <div
          className="flex items-center justify-between px-3 py-2 cursor-pointer select-none"
          onClick={() => setShowLogs(!showLogs)}
        >
          <div className="flex items-center gap-2">
            <svg className={`w-4 h-4 text-gray-600 transform transition-transform ${showLogs ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 6L14 10L6 14V6Z" clipRule="evenodd"/></svg>
            <span className="text-sm font-medium text-gray-800">Logs</span>
            <span className="text-xs text-gray-500">({logs.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-xs text-gray-500">
              <input type="checkbox" className="rounded" checked={autoScroll} onChange={(e) => setAutoScroll(e.target.checked)} />
              Auto-scroll
            </label>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setLogs([]); }}
              className="text-xs text-gray-600 hover:text-gray-800"
            >
              Clear
            </button>
          </div>
        </div>
        {showLogs && (
          <div className="px-3 pb-3">
            <div ref={logContainerRef} className="mt-2 max-h-56 overflow-auto text-xs font-mono space-y-1 bg-gray-50 border rounded p-2">
              {logs.map((l, i) => (
                <div key={i} className="whitespace-pre-wrap">
                  <span className="text-gray-400">[{new Date(l.ts).toLocaleTimeString()}]</span>
                  {l.level ? ` (${l.level})` : ''} {l.msg}
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-gray-400">No logs yet…</div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {!hasValidArchiveUrls() && (
        <p className="text-sm text-gray-500 text-center">
          Enter at least one valid archive URL to start scraping
        </p>
      )}
    </form>
  );
}
