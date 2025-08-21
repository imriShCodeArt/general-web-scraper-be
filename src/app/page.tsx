'use client';

import { ScrapingForm } from '@/components/ScrapingForm';
import { ScrapingResults } from '@/components/ScrapingResults';
import { AttributeEditorModal } from '@/components/AttributeEditorModal';
import { EnhancedProgressTracker } from '@/components/EnhancedProgressTracker';
import { WooCommerceImport } from '@/components/WooCommerceImport';
import { useState } from 'react';
import { ScrapingJob, Product, AttributeEditProgress, ProductValidationReport } from '@/types';
import { AttributeManager } from '@/lib/attribute-manager';
import { AttributeData } from '@/components/AttributeEditorModal';

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentJob, setCurrentJob] = useState<ScrapingJob | null>(null);
  const [showHowTo, setShowHowTo] = useState<boolean>(false);
  const [scrapedProducts, setScrapedProducts] = useState<Product[]>([]);
  const [validationReport, setValidationReport] = useState<ProductValidationReport | undefined>();
  const [showAttributeEditor, setShowAttributeEditor] = useState(false);
  const [isAttributeEditing, setIsAttributeEditing] = useState(false);
  const [attributeEditProgress, setAttributeEditProgress] = useState<AttributeEditProgress | undefined>();
  const [showWooCommerceImport, setShowWooCommerceImport] = useState(false);

  const handleScrapingStart = () => {
    setIsProcessing(true);
    setCurrentJob(null);
    setValidationReport(undefined);
  };

  const handleScrapingComplete = (job: ScrapingJob, products: Product[], validation?: ProductValidationReport) => {
    setIsProcessing(false);
    setCurrentJob(job);
    setScrapedProducts(products);
    setValidationReport(validation);
    
    const hasAttributes = products.some(product => 
      Object.keys(product.attributes).length > 0
    );
    
    if (hasAttributes) {
      setShowAttributeEditor(true);
    }
  };

  const handleAttributeSave = (editedAttributes: AttributeData[]) => {
    setIsAttributeEditing(true);
    // Apply edited attributes to products (frontend state)
    const updatedProducts = AttributeManager.applyEditedAttributes(scrapedProducts, editedAttributes);
    setScrapedProducts(updatedProducts);

    // Persist changes by regenerating CSVs on the server for the same requestId
    (async () => {
      try {
        if (!currentJob?.id) {
          console.warn('Missing current job id; cannot persist CSV updates');
        } else {
          const res = await fetch('/api/scrape/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId: currentJob.id, products: updatedProducts })
          });
          const json = await res.json();
          if (!json?.success) {
            console.error('Failed to update CSVs', json);
            alert('Failed to apply attribute edits to CSVs. Please try again.');
          }
        }
      } catch (e) {
        console.error('Error updating CSVs', e);
        alert('Network or server error while applying attribute edits.');
      } finally {
        setShowAttributeEditor(false);
        setIsAttributeEditing(false);
      }
    })();
  };

  const handleAttributeProgressUpdate = (progress: AttributeEditProgress) => {
    setAttributeEditProgress(progress);
  };

  const handleWooCommerceImport = () => {
    setShowWooCommerceImport(true);
  };

  const handleWooCommerceImportClose = () => {
    setShowWooCommerceImport(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Product Archive Scraper
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Extract product data from e-commerce archive pages, category pages, and shop listings. 
            Automatically handles pagination to scrape all products from each archive.
          </p>
        </div>

        

        {/* How-To (Collapsible) */}
        <div className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowHowTo(!showHowTo)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <svg
                className={`w-4 h-4 text-gray-600 transform transition-transform ${showHowTo ? 'rotate-90' : ''}`}
                viewBox="0 0 20 20" fill="currentColor"
              >
                <path fillRule="evenodd" d="M6 6L14 10L6 14V6Z" clipRule="evenodd" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900">How to use</h2>
            </div>
            <span className="text-sm text-gray-500">{showHowTo ? 'Hide' : 'Show'}</span>
          </button>
          {showHowTo && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary-600 font-bold text-lg">1</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Enter Archive URLs</h3>
                  <p className="text-sm text-gray-600">
                    Provide URLs of product archive pages, category pages, or shop listings
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary-600 font-bold text-lg">2</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Automatic Scraping</h3>
                  <p className="text-sm text-gray-600">
                    The scraper detects pagination and extracts all products from each archive
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary-600 font-bold text-lg">3</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Edit Attributes</h3>
                  <p className="text-sm text-gray-600">
                    Review and edit product attributes before CSV generation
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary-600 font-bold text-lg">4</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Import or Download</h3>
                  <p className="text-sm text-gray-600">
                    Import directly to WooCommerce or download CSV files
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">WooCommerce</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Category pages</li>
                    <li>• Shop pages</li>
                    <li>• Product archives</li>
                    <li>• Custom taxonomies</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Other E-commerce</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Generic product listings</li>
                    <li>• Archive pages</li>
                    <li>• Category pages</li>
                    <li>• Shop directories</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <ScrapingForm
          onScrapingStart={handleScrapingStart}
          onScrapingComplete={handleScrapingComplete}
          isProcessing={isProcessing}
        />

        {/* Enhanced Progress Tracker for Attribute Editing */}
        {!isProcessing && attributeEditProgress && (
          <div className="mt-6">
            <EnhancedProgressTracker
              detailedProgress={undefined}
              attributeEditProgress={attributeEditProgress}
              isVisible={true}
            />
          </div>
        )}

        {/* Attribute Editor Modal */}
        {showAttributeEditor && (
          <AttributeEditorModal
            isOpen={showAttributeEditor}
            onClose={() => setShowAttributeEditor(false)}
            onSave={handleAttributeSave}
            initialAttributes={AttributeManager.collectAttributes(scrapedProducts)}
            onProgressUpdate={handleAttributeProgressUpdate}
          />
        )}

        {currentJob && (
          <div className="mt-8">
            <ScrapingResults 
              job={currentJob} 
              products={scrapedProducts}
              isAttributeEditing={isAttributeEditing}
              validation={validationReport}
              onWooCommerceImport={handleWooCommerceImport}
            />
          </div>
        )}

        {/* WooCommerce Import Modal */}
        {showWooCommerceImport && (
          <WooCommerceImport
            products={scrapedProducts}
            onClose={handleWooCommerceImportClose}
          />
        )}
      </div>
    </div>
  );
}
