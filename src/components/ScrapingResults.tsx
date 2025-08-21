'use client';

import { ScrapingJob, Product, ProductValidationReport } from '@/types';

interface ScrapingResultsProps {
  job: ScrapingJob;
  products: Product[];
  isAttributeEditing: boolean;
  validation?: ProductValidationReport;
  onWooCommerceImport: () => void;
}

export function ScrapingResults({ job, products, isAttributeEditing, validation, onWooCommerceImport }: ScrapingResultsProps) {
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
        
        {/* Data Validation Summary */}
        {validation && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-medium text-yellow-900 mb-3">Data Validation</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded p-3 border">
                <div className="text-gray-700 font-medium mb-1">Quality Scores</div>
                <div className="text-gray-600">Average Score: <span className="font-semibold">{validation.totals.averageScore}</span></div>
                <div className="text-green-600">High: {validation.totals.highQuality}</div>
                <div className="text-orange-600">Medium: {validation.totals.mediumQuality}</div>
                <div className="text-red-600">Low: {validation.totals.lowQuality}</div>
              </div>
              <div className="bg-white rounded p-3 border">
                <div className="text-gray-700 font-medium mb-1">Missing Data</div>
                {Object.keys(validation.missingCounts).length === 0 ? (
                  <div className="text-gray-500">No missing fields detected</div>
                ) : (
                  <ul className="list-disc list-inside text-gray-600">
                    {Object.entries(validation.missingCounts).slice(0, 6).map(([field, count]) => (
                      <li key={field}><span className="font-medium">{field}</span>: {count}</li>
                    ))}
                    {Object.entries(validation.missingCounts).length > 6 && (
                      <li className="text-xs text-gray-500">+{Object.entries(validation.missingCounts).length - 6} more…</li>
                    )}
                  </ul>
                )}
              </div>
              <div className="bg-white rounded p-3 border">
                <div className="text-gray-700 font-medium mb-1">Duplicates</div>
                {validation.duplicates.length === 0 ? (
                  <div className="text-gray-500">No duplicates detected</div>
                ) : (
                  <ul className="list-disc list-inside text-gray-600">
                    {validation.duplicates.slice(0, 5).map((d, i) => (
                      <li key={i}><span className="font-medium uppercase">{d.type}</span>: {d.value} ({d.count})</li>
                    ))}
                    {validation.duplicates.length > 5 && (
                      <li className="text-xs text-gray-500">+{validation.duplicates.length - 5} more…</li>
                    )}
                  </ul>
                )}
              </div>
            </div>
            
            {/* Worst products list */}
            <div className="mt-4">
              <div className="text-gray-700 font-medium mb-2">Lowest Quality Products</div>
              <div className="bg-white border rounded">
                <div className="divide-y">
                  {validation.perProduct
                    .slice()
                    .sort((a, b) => a.score - b.score)
                    .slice(0, 5)
                    .map((p, i) => (
                      <div key={i} className="p-3 text-sm flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800 break-all">{p.title || p.url}</div>
                          <div className="text-xs text-gray-500">SKU: {p.sku || '—'}</div>
                          {p.missingFields.length > 0 && (
                            <div className="text-xs text-red-600 mt-1">Missing: {p.missingFields.join(', ')}</div>
                          )}
                          {p.warnings.length > 0 && (
                            <div className="text-xs text-orange-600">Warnings: {p.warnings.join(', ')}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-semibold ${p.score >= 85 ? 'text-green-600' : p.score >= 70 ? 'text-orange-600' : 'text-red-600'}`}>{p.score}</div>
                        </div>
                      </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Attribute Editing Status */}
        {products.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-3">Product Attributes</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isAttributeEditing ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                <span className="text-sm text-blue-700">
                  {isAttributeEditing 
                    ? 'Attributes have been edited and applied to products'
                    : 'Attributes are ready for editing'
                  }
                </span>
              </div>
              
              <div className="text-sm text-blue-700">
                <p><strong>Total Products:</strong> {products.length}</p>
                <p><strong>Products with Attributes:</strong> {products.filter(p => Object.keys(p.attributes).length > 0).length}</p>
                {products.some(p => Object.keys(p.attributes).length > 0) && (
                  <p><strong>Attribute Types Found:</strong> {Array.from(new Set(products.flatMap(p => Object.keys(p.attributes)))).join(', ')}</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {job.csv_downloads && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900 mb-3">Export Options</h3>
            
            {/* WooCommerce Direct Import */}
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">WooCommerce Direct Import</h4>
              <p className="text-sm text-blue-700 mb-3">
                Import products directly to your WooCommerce store without downloading CSV files.
              </p>
              <button
                onClick={onWooCommerceImport}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Import to WooCommerce
              </button>
            </div>
            
            {/* CSV Downloads */}
            <div>
              <h4 className="font-medium text-green-900 mb-2">Download CSV Files</h4>
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
