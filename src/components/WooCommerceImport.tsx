'use client';

import { useState } from 'react';
import { Product, WooCommerceCredentials, ImportPreview, ImportProgress, ImportResult } from '@/types';
import { WooCommerceCredentialsForm } from './WooCommerceCredentialsForm';
import { ImportPreview as ImportPreviewComponent } from './ImportPreview';
import { EnhancedProgressTracker } from './EnhancedProgressTracker';

interface WooCommerceImportProps {
  products: Product[];
  onClose: () => void;
}

type ImportStage = 'credentials' | 'preview' | 'importing' | 'complete';

export function WooCommerceImport({ products, onClose }: WooCommerceImportProps) {
  const [stage, setStage] = useState<ImportStage>('credentials');
  const [credentials, setCredentials] = useState<WooCommerceCredentials | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCredentialsSubmit = async (creds: WooCommerceCredentials) => {
    setCredentials(creds);
    setIsProcessing(true);
    
    try {
      // Test connection and generate preview
      const { ImportService } = await import('@/lib/import-service');
      const importService = new ImportService(creds, setImportProgress);
      
      const testResult = await importService.testConnection();
      if (!testResult) {
        throw new Error('Failed to connect to WooCommerce API');
      }
      
      const previewData = await importService.generatePreview(products);
      setPreview(previewData);
      setStage('preview');
    } catch (error) {
      console.error('Failed to generate preview:', error);
      alert(`Failed to generate preview: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestConnection = async (creds: WooCommerceCredentials): Promise<boolean> => {
    try {
      const { ImportService } = await import('@/lib/import-service');
      const importService = new ImportService(creds);
      return await importService.testConnection();
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  };

  const handleImport = async (options: {
    updateExisting: boolean;
    publishImmediately: boolean;
    skipDuplicates: boolean;
  }) => {
    if (!credentials || !preview) return;
    
    setIsProcessing(true);
    setStage('importing');
    
    try {
      const { ImportService } = await import('@/lib/import-service');
      const importService = new ImportService(credentials, setImportProgress);
      
      const result = await importService.executeImport(products, options);
      setImportResult(result);
      setStage('complete');
    } catch (error) {
      console.error('Import failed:', error);
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStage('preview');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    if (stage === 'preview') {
      setStage('credentials');
      setPreview(null);
    } else if (stage === 'importing') {
      setStage('preview');
      setImportProgress(null);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const renderStage = () => {
    switch (stage) {
      case 'credentials':
        return (
          <WooCommerceCredentialsForm
            onCredentialsSubmit={handleCredentialsSubmit}
            onTestConnection={handleTestConnection}
            isProcessing={isProcessing}
          />
        );
      
      case 'preview':
        return preview ? (
          <ImportPreviewComponent
            preview={preview}
            onImport={handleImport}
            onBack={handleBack}
            isProcessing={isProcessing}
          />
        ) : null;
      
      case 'importing':
        return (
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Importing Products</h3>
            
            {importProgress && (
              <EnhancedProgressTracker
                detailedProgress={undefined}
                attributeEditProgress={undefined}
                isVisible={true}
              />
            )}
            
            <div className="mt-4 text-center">
              <button
                onClick={handleBack}
                disabled={isProcessing}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Back to Preview
              </button>
            </div>
          </div>
        );
      
      case 'complete':
        return importResult ? (
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Complete</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{importResult.imported}</div>
                <div className="text-sm text-green-700">Created</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">{importResult.updated}</div>
                <div className="text-sm text-yellow-700">Updated</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-600">{importResult.skipped}</div>
                <div className="text-sm text-gray-700">Skipped</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">{importResult.errors.length}</div>
                <div className="text-sm text-red-700">Errors</div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
              <p className="text-gray-700">{importResult.summary}</p>
            </div>
            
            {importResult.errors.length > 0 && (
              <div className="bg-red-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-red-900 mb-2">Errors</h4>
                <div className="space-y-2">
                  {importResult.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-700">
                      <strong>{error.product}:</strong> {error.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-50 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-gray-50 border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              WooCommerce Direct Import
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
              disabled={isProcessing}
            >
              ×
            </button>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex items-center gap-4 mt-3">
            <div className={`flex items-center gap-2 ${stage === 'credentials' ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                stage === 'credentials' ? 'bg-primary-600 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="text-sm">Credentials</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-200"></div>
            <div className={`flex items-center gap-2 ${stage === 'preview' ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                stage === 'preview' ? 'bg-primary-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="text-sm">Preview</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-200"></div>
            <div className={`flex items-center gap-2 ${stage === 'importing' ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                stage === 'importing' ? 'bg-primary-600 text-white' : 'bg-gray-200'
              }`}>
                3
              </div>
              <span className="text-sm">Import</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-200"></div>
            <div className={`flex items-center gap-2 ${stage === 'complete' ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                stage === 'complete' ? 'bg-primary-600 text-white' : 'bg-gray-200'
              }`}>
                4
              </div>
              <span className="text-sm">Complete</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {renderStage()}
        </div>
      </div>
    </div>
  );
}
