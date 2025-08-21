'use client';

import { useState } from 'react';
import { ImportPreview as ImportPreviewType, WooCommerceProduct } from '@/types';

interface ImportPreviewProps {
  preview: ImportPreviewType;
  onImport: (options: ImportOptions) => void;
  onBack: () => void;
  isProcessing?: boolean;
}

interface ImportOptions {
  updateExisting: boolean;
  publishImmediately: boolean;
  skipDuplicates: boolean;
}

export function ImportPreview({ preview, onImport, onBack, isProcessing = false }: ImportPreviewProps) {
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    updateExisting: true,
    publishImmediately: false,
    skipDuplicates: true
  });

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    new: true,
    existing: false,
    skipped: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleImport = () => {
    onImport(importOptions);
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Import Preview</h3>
        <button
          onClick={onBack}
          disabled={isProcessing}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Back to Credentials
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{preview.summary.total}</div>
          <div className="text-sm text-blue-700">Total Products</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{preview.summary.new}</div>
          <div className="text-sm text-green-700">New Products</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600">{preview.summary.updates}</div>
          <div className="text-sm text-yellow-700">Updates</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600">{preview.summary.skipped}</div>
          <div className="text-sm text-red-700">Skipped</div>
        </div>
      </div>

      {/* Import Options */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Import Options</h4>
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="updateExisting"
              checked={importOptions.updateExisting}
              onChange={(e) => setImportOptions(prev => ({ ...prev, updateExisting: e.target.checked }))}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              disabled={isProcessing}
            />
            <label htmlFor="updateExisting" className="ml-2 text-sm text-gray-700">
              Update existing products
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="publishImmediately"
              checked={importOptions.publishImmediately}
              onChange={(e) => setImportOptions(prev => ({ ...prev, publishImmediately: e.target.checked }))}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              disabled={isProcessing}
            />
            <label htmlFor="publishImmediately" className="ml-2 text-sm text-gray-700">
              Publish products immediately (default: draft)
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="skipDuplicates"
              checked={importOptions.skipDuplicates}
              onChange={(e) => setImportOptions(prev => ({ ...prev, skipDuplicates: e.target.checked }))}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              disabled={isProcessing}
            />
            <label htmlFor="skipDuplicates" className="ml-2 text-sm text-gray-700">
              Skip duplicate products
            </label>
          </div>
        </div>
      </div>

      {/* New Products Section */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('new')}
          className="flex items-center justify-between w-full p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg className={`w-5 h-5 text-green-600 transform transition-transform ${expandedSections.new ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 6L14 10L6 14V6Z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-green-900">New Products ({preview.newProducts.length})</span>
          </div>
          <span className="text-sm text-green-600">Click to expand</span>
        </button>
        
        {expandedSections.new && (
          <div className="mt-3 space-y-3">
            {preview.newProducts.map((product, index) => (
              <div key={index} className="bg-white border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{product.name}</h5>
                    <div className="text-sm text-gray-600 mt-1">
                      <p><strong>SKU:</strong> {product.sku}</p>
                      <p><strong>Type:</strong> {product.type}</p>
                      <p><strong>Price:</strong> {product.regular_price}</p>
                      <p><strong>Category:</strong> {product.categories.map(c => c.name).join(', ') || '—'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      New
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Existing Products Section */}
      {preview.existingProducts.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => toggleSection('existing')}
            className="flex items-center justify-between w-full p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg className={`w-5 h-5 text-yellow-600 transform transition-transform ${expandedSections.existing ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 6L14 10L6 14V6Z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-yellow-900">Existing Products ({preview.existingProducts.length})</span>
            </div>
            <span className="text-sm text-yellow-600">Click to expand</span>
          </button>
          
          {expandedSections.existing && (
            <div className="mt-3 space-y-3">
              {preview.existingProducts.map((item, index) => (
                <div key={index} className="bg-white border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{item.existing.name}</h5>
                      <div className="text-sm text-gray-600 mt-1">
                        <p><strong>WooCommerce ID:</strong> {item.existing.id}</p>
                        <p><strong>Current SKU:</strong> {item.existing.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Update
                      </span>
                    </div>
                  </div>
                  
                  {/* Changes Preview */}
                  <div className="bg-gray-50 p-3 rounded">
                    <h6 className="text-sm font-medium text-gray-700 mb-2">Changes to be applied:</h6>
                    <div className="space-y-2">
                      {item.changes.map((change, changeIndex) => (
                        <div key={changeIndex} className="text-sm">
                          <span className="font-medium text-gray-700">{change.field}:</span>
                          <div className="ml-4 text-gray-600">
                            <div className="line-through text-red-600">Old: {formatValue(change.oldValue)}</div>
                            <div className="text-green-600">New: {formatValue(change.newValue)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Skipped Products Section */}
      {preview.skippedProducts.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => toggleSection('skipped')}
            className="flex items-center justify-between w-full p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg className={`w-5 h-5 text-red-600 transform transition-transform ${expandedSections.skipped ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 6L14 10L6 14V6Z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-red-900">Skipped Products ({preview.skippedProducts.length})</span>
            </div>
            <span className="text-sm text-red-600">Click to expand</span>
          </button>
          
          {expandedSections.skipped && (
            <div className="mt-3 space-y-3">
              {preview.skippedProducts.map((item, index) => (
                <div key={index} className="bg-white border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{item.product.title || 'Untitled Product'}</h5>
                      <div className="text-sm text-gray-600 mt-1">
                        <p><strong>Reason:</strong> {item.reason}</p>
                        <p><strong>URL:</strong> {item.product.url}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Skipped
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Import Button */}
      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={handleImport}
          disabled={isProcessing || preview.summary.total === 0}
          className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Importing...
            </>
          ) : (
            `Start Import (${preview.summary.new + preview.summary.updates} products)`
          )}
        </button>
      </div>
    </div>
  );
}
