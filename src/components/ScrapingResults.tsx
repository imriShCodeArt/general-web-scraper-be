'use client';

import { ScrapingJob } from '@/types';

interface ScrapingResultsProps {
  job: ScrapingJob;
}

export function ScrapingResults({ job }: ScrapingResultsProps) {
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
      a.download = `${type === 'parent' ? 'PARENT_PRODUCTS' : 'VARIATION_PRODUCTS'}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Scraping Results</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Job Details</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Job ID:</span> {job.id}</p>
              <p><span className="font-medium">Status:</span> <span className="capitalize">{job.status}</span></p>
              <p><span className="font-medium">Archive URLs:</span> {job.archive_urls.length}</p>
              <p><span className="font-medium">Max Products Per Archive:</span> {job.max_products_per_archive}</p>
              <p><span className="font-medium">Total Products:</span> {job.total_products}</p>
              <p><span className="font-medium">Processed Products:</span> {job.processed_products}</p>
              <p><span className="font-medium">Created:</span> {job.created_at.toLocaleString()}</p>
              {job.completed_at && (
                <p><span className="font-medium">Completed:</span> {job.completed_at.toLocaleString()}</p>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Archive URLs</h3>
            <div className="space-y-2">
              {job.archive_urls.map((url, index) => (
                <div key={index} className="text-sm">
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-800 break-all"
                  >
                    {url}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {job.csv_downloads && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900 mb-3">Download CSV Files</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => downloadCSV('parent')}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download Parent Products CSV
              </button>
              <button
                onClick={() => downloadCSV('variation')}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Download Variation Products CSV
              </button>
            </div>
            <p className="text-sm text-green-700 mt-2">
              These CSV files are compatible with WooCommerce Product CSV Import Suite.
            </p>
          </div>
        )}
        
        {job.error && (
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-medium text-red-900 mb-2">Error</h3>
            <p className="text-red-700">{job.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
