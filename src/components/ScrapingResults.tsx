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
            <h3 className="font-medium text-gray-900 mb-2">Product Summary</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Total Products:</span> {products.length}</p>
              <p><span className="font-medium">Products with Attributes:</span> {products.filter(p => Object.keys(p.attributes).length > 0).length}</p>
              <p><span className="font-medium">Products with Variations:</span> {products.filter(p => p.variations && p.variations.length > 0).length}</p>
              <p><span className="font-medium">Products with Images:</span> {products.filter(p => p.images && p.images.length > 0).length}</p>
            </div>
          </div>
        </div>

        {/* Validation Report */}
        {validation && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="font-medium text-yellow-900 mb-2">Validation Report</h3>
            <div className="space-y-2 text-sm text-yellow-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
        )}

        {/* Success Message */}
        {job.status === 'completed' && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 className="font-medium text-green-900">Scraping Completed Successfully!</h3>
                <p className="text-sm text-green-700 mt-1">
                  {products.length} products have been scraped and are ready for download or import.
                  Use the buttons in the bottom bar to download CSV files or import to WooCommerce.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Paused Message */}
        {job.status === 'paused' && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-medium text-yellow-900">Scraping Paused</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  The scraping process has been paused. You can resume it using the Resume button in the bottom bar.
                  {products.length > 0 && ` Currently ${products.length} products have been scraped.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stopped Message */}
        {job.status === 'stopped' && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <div>
                <h3 className="font-medium text-red-900">Scraping Stopped</h3>
                <p className="text-sm text-red-700 mt-1">
                  The scraping process has been stopped. 
                  {products.length > 0 
                    ? ` ${products.length} products were scraped before stopping and are available for download.`
                    : ' No products were scraped before stopping.'
                  }
                  You can start a new scraping job if needed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Processing Message */}
        {job.status === 'processing' && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <div>
                <h3 className="font-medium text-blue-900">Scraping in Progress</h3>
                <p className="text-sm text-blue-700 mt-1">
                  The scraping process is currently running. You can pause or stop it using the control buttons in the bottom bar.
                  {products.length > 0 && ` Currently ${products.length} products have been scraped.`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
