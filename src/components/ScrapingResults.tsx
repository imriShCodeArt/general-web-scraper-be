'use client';

import { ScrapingJob } from '@/types';

interface ScrapingResultsProps {
  job: ScrapingJob;
}

export function ScrapingResults({ job }: ScrapingResultsProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const downloadCSV = async (type: 'parent' | 'variation') => {
    try {
      const response = await fetch(`/api/scrape/download/${job.id}/${type}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Download failed');
      }
      
      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `products_${type}.csv`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
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
    <div className="space-y-6">
      {/* Job Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-green-800">Scraping Completed Successfully!</h3>
        </div>
        <p className="text-green-700 mt-1">
          Job ID: {job.id}
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{job.total_products}</div>
          <div className="text-sm text-gray-600">Total Products</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{job.processed_products}</div>
          <div className="text-sm text-gray-600">Processed URLs</div>
        </div>
      </div>

      {/* Job Details */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Job Details</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="capitalize">{job.status}</span>
          </div>
          <div className="flex justify-between">
            <span>Started:</span>
            <span>{formatDate(job.created_at)}</span>
          </div>
          {job.completed_at && (
            <div className="flex justify-between">
              <span>Completed:</span>
              <span>{formatDate(job.completed_at)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Input URLs:</span>
            <span>{job.urls.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Max Products Per URL:</span>
            <span>{job.max_products_per_url}</span>
          </div>
        </div>
      </div>

      {/* Input URLs */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Input URLs</h4>
        <div className="space-y-2">
          {job.urls.map((url, index) => (
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

      {/* Download Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-3">Download CSV Files</h4>
        <p className="text-blue-700 text-sm mb-4">
          Your WooCommerce-compatible CSV files are ready for download. 
          These files can be imported directly into WooCommerce using the Product CSV Import Suite.
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-blue-900">Parent Products CSV</div>
              <div className="text-sm text-blue-700">Contains main product information and attributes</div>
            </div>
            <button
              onClick={() => downloadCSV('parent')}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!job.csv_downloads}
            >
              {job.csv_downloads ? 'Download' : 'Generating...'}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-blue-900">Variation Products CSV</div>
              <div className="text-sm text-blue-700">Contains product variations and pricing</div>
            </div>
            <button
              onClick={() => downloadCSV('variation')}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!job.csv_downloads}
            >
              {job.csv_downloads ? 'Download' : 'Generating...'}
            </button>
          </div>
        </div>
        
        {!job.csv_downloads && (
          <div className="mt-3 text-sm text-blue-600">
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              CSV files are being generated...
            </div>
          </div>
        )}
      </div>

      {/* Next Steps */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-3">Next Steps</h4>
        <div className="text-yellow-800 text-sm space-y-2">
          <p>1. Download both CSV files</p>
          <p>2. Import the Parent Products CSV first</p>
          <p>3. Then import the Variation Products CSV</p>
          <p>4. Review and adjust product data in WooCommerce as needed</p>
        </div>
      </div>
    </div>
  );
}
