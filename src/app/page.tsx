'use client';

import { ScrapingForm } from '@/components/ScrapingForm';
import { ScrapingResults } from '@/components/ScrapingResults';
import { useState } from 'react';
import { ScrapingJob } from '@/types';

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentJob, setCurrentJob] = useState<ScrapingJob | null>(null);

  const handleScrapingStart = () => {
    setIsProcessing(true);
    setCurrentJob(null);
  };

  const handleScrapingComplete = (job: ScrapingJob) => {
    setIsProcessing(false);
    setCurrentJob(job);
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

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <h3 className="font-medium text-gray-900 mb-2">Download CSVs</h3>
              <p className="text-sm text-gray-600">
                Get WooCommerce-compatible CSV files ready for import
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Supported Platforms</h2>
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

        <ScrapingForm
          onScrapingStart={handleScrapingStart}
          onScrapingComplete={handleScrapingComplete}
          isProcessing={isProcessing}
        />

        {currentJob && (
          <div className="mt-8">
            <ScrapingResults job={currentJob} />
          </div>
        )}
      </div>
    </div>
  );
}
