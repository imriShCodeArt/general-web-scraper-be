'use client';

import { ScrapingJob, Product } from '@/types';

interface StickyBottomBarProps {
  job: ScrapingJob | null;
  products: Product[];
  onWooCommerceImport: () => void;
  isVisible: boolean;
  isProcessing?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
}

export function StickyBottomBar({ 
  job, 
  products, 
  onWooCommerceImport, 
  isVisible, 
  isProcessing = false,
  onPause,
  onResume,
  onStop
}: StickyBottomBarProps) {
  if (!isVisible || !job) return null;

  const downloadCSV = async (type: 'parent' | 'variation') => {
    try {
      const response = await fetch(`/api/scrape/download/${job.id}/${type}`);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const disposition = response.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="?([^";]+)"?/i);
      const serverFilename = match ? match[1] : '';
      a.download = serverFilename || `${type === 'parent' ? 'PARENT_PRODUCTS' : 'VARIATION_PRODUCTS'}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleJobControl = async (action: 'pause' | 'resume' | 'stop') => {
    try {
      const response = await fetch('/api/scrape/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id, action })
      });

      if (!response.ok) {
        throw new Error(`Control action failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Call the appropriate callback
        switch (action) {
          case 'pause':
            onPause?.();
            break;
          case 'resume':
            onResume?.();
            break;
          case 'stop':
            onStop?.();
            break;
        }
      } else {
        throw new Error(result.error || 'Control action failed');
      }
    } catch (error) {
      console.error('Job control failed:', error);
      alert(`Job control failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const showControlButtons = isProcessing && job.status === 'processing';
  const showResumeButton = isProcessing && job.status === 'paused';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left side - Job info */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="font-medium">Job ID:</span>
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{job.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Products:</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                {job.total_products}
              </span>
            </div>
            {isProcessing && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  job.status === 'processing' ? 'bg-green-100 text-green-800' :
                  job.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {job.status === 'processing' ? '🔄 Processing' :
                   job.status === 'paused' ? '⏸️ Paused' :
                   job.status}
                </span>
              </div>
            )}
          </div>

          {/* Center - Control buttons */}
          {(showControlButtons || showResumeButton) && (
            <div className="flex items-center gap-2">
              {showControlButtons && (
                <>
                  <button
                    onClick={() => handleJobControl('pause')}
                    className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors"
                  >
                    ⏸️ Pause
                  </button>
                  <button
                    onClick={() => handleJobControl('stop')}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                  >
                    🛑 Stop
                  </button>
                </>
              )}
              {showResumeButton && (
                <button
                  onClick={() => handleJobControl('resume')}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                >
                  ▶️ Resume
                </button>
              )}
            </div>
          )}

          {/* Right side - Action buttons */}
          <div className="flex items-center gap-3">
            {/* CSV Download Buttons */}
            {job.csv_downloads && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadCSV('parent')}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                >
                  📥 Parent Products CSV
                </button>
                <button
                  onClick={() => downloadCSV('variation')}
                  className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
                >
                  📥 Variations CSV
                </button>
              </div>
            )}

            {/* WooCommerce Import Button */}
            <button
              onClick={onWooCommerceImport}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              🚀 Import to WooCommerce
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
