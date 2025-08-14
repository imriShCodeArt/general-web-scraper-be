'use client';

import { useState } from 'react';
import { ScrapingForm } from '@/components/ScrapingForm';
import { ScrapingResults } from '@/components/ScrapingResults';
import { ScrapingJob } from '@/types';

export default function Home() {
  const [currentJob, setCurrentJob] = useState<ScrapingJob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScrapingComplete = (job: ScrapingJob) => {
    setCurrentJob(job);
    setIsProcessing(false);
  };

  const handleScrapingStart = () => {
    setIsProcessing(true);
    setCurrentJob(null);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Product Table Scraper
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Extract product data from HTML tables and generate WooCommerce-compatible CSV files for easy import. 
            Control the number of products scraped per URL to manage processing time and resources.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scraping Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Start Scraping
            </h2>
            <ScrapingForm 
              onScrapingStart={handleScrapingStart}
              onScrapingComplete={handleScrapingComplete}
              isProcessing={isProcessing}
            />
          </div>

          {/* Results Display */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Results
            </h2>
            {isProcessing ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Processing your URLs...</p>
                <p className="text-sm text-gray-500 mt-2">
                  This may take a few minutes depending on the number of products.
                </p>
              </div>
            ) : currentJob ? (
              <ScrapingResults job={currentJob} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Start a scraping job to see results here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Table Parsing</h3>
              <p className="text-gray-600">Automatically extract product URLs from HTML tables with columns for URL, Images, and Last Modified.</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Product Extraction</h3>
              <p className="text-gray-600">Scrape product details including titles, descriptions, images, attributes, and variations.</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">WooCommerce Ready</h3>
              <p className="text-gray-600">Generate CSV files compatible with WooCommerce Product CSV Import Suite for easy product import.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
