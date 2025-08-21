'use client';

import { useState } from 'react';
import { EnhancedProgressTracker } from './EnhancedProgressTracker';
import { DetailedProgress, AttributeEditProgress } from '@/types';

export function ProgressDemo() {
  const [showDemo, setShowDemo] = useState(false);
  const [demoProgress, setDemoProgress] = useState<DetailedProgress>({
    overall: 0,
    stage: 'initializing',
    message: 'Starting demo...',
    archives: { total: 3, processed: 0, current: 0 },
    products: { total: 0, processed: 0, current: 0 }
  });

  const [demoAttributeProgress, setDemoAttributeProgress] = useState<AttributeEditProgress>({
    totalProducts: 0,
    processedProducts: 0,
    message: 'Ready for demo'
  });

  const startDemo = () => {
    setShowDemo(true);
    setDemoProgress({
      overall: 0,
      stage: 'initializing',
      message: 'Initializing scraping process...',
      archives: { total: 3, processed: 0, current: 0 },
      products: { total: 0, processed: 0, current: 0 }
    });

    // Simulate archive processing
    setTimeout(() => {
      setDemoProgress(prev => ({
        ...prev,
        stage: 'fetching_archives',
        overall: 5,
        message: 'Fetching archive pages...',
        archives: { total: 3, processed: 0, current: 1 }
      }));
    }, 1000);

    setTimeout(() => {
      setDemoProgress(prev => ({
        ...prev,
        overall: 10,
        message: 'Found 25 product URLs',
        archives: { total: 3, processed: 3, current: 3 },
        products: { total: 25, processed: 0, current: 0 }
      }));
    }, 2000);

    setTimeout(() => {
      setDemoProgress(prev => ({
        ...prev,
        stage: 'scraping_products',
        overall: 15,
        message: 'Starting product scraping...',
        products: { total: 25, processed: 0, current: 0 }
      }));
    }, 3000);

    // Simulate product scraping
    let productCount = 0;
    const productInterval = setInterval(() => {
      productCount += 2;
      if (productCount >= 25) {
        clearInterval(productInterval);
        setDemoProgress(prev => ({
          ...prev,
          overall: 90,
          message: 'Scraped 25 products',
          products: { total: 25, processed: 25, current: 25 }
        }));

        setTimeout(() => {
          setDemoProgress(prev => ({
            ...prev,
            stage: 'generating_csv',
            overall: 95,
            message: 'Generating CSV files...'
          }));
        }, 1000);

        setTimeout(() => {
          setDemoProgress(prev => ({
            ...prev,
            overall: 100,
            stage: 'complete',
            message: 'Scraping completed successfully'
          }));
        }, 2000);
      } else {
        setDemoProgress(prev => ({
          ...prev,
          overall: Math.min(85, Math.round((productCount / 25) * 80) + 15),
          message: `Scraped ${productCount} products...`,
          products: { total: 25, processed: productCount, current: productCount },
          currentProduct: {
            url: `https://example.com/product-${productCount}`,
            index: productCount - 1,
            total: 25,
            title: `Product ${productCount}`
          }
        }));
      }
    }, 500);

    // Simulate attribute editing
    setTimeout(() => {
      setDemoAttributeProgress({
        totalProducts: 8,
        processedProducts: 0,
        message: 'Starting attribute processing...'
      });

      let attrCount = 0;
      const attrInterval = setInterval(() => {
        attrCount += 1;
        if (attrCount >= 8) {
          clearInterval(attrInterval);
          setDemoAttributeProgress(prev => ({
            ...prev,
            processedProducts: 8,
            message: 'Attributes processed successfully'
          }));
        } else {
          setDemoAttributeProgress(prev => ({
            ...prev,
            processedProducts: attrCount,
            message: `Processing attribute ${attrCount}...`,
            currentProduct: {
              title: `Attribute ${attrCount}`,
              index: attrCount - 1,
              attributesCount: Math.floor(Math.random() * 5) + 1
            }
          }));
        }
      }, 300);
    }, 8000);
  };

  const resetDemo = () => {
    setShowDemo(false);
    setDemoProgress({
      overall: 0,
      stage: 'initializing',
      message: 'Starting demo...',
      archives: { total: 3, processed: 0, current: 0 },
      products: { total: 0, processed: 0, current: 0 }
    });
    setDemoAttributeProgress({
      totalProducts: 0,
      processedProducts: 0,
      message: 'Ready for demo'
    });
  };

  return (
    <div className="bg-white border rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Indicators Demo</h3>
      
      {!showDemo ? (
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Click the button below to see the enhanced progress indicators in action.
          </p>
          <button
            onClick={startDemo}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Start Demo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Demo in progress...</span>
            <button
              onClick={resetDemo}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Reset Demo
            </button>
          </div>
          
          <EnhancedProgressTracker
            detailedProgress={demoProgress}
            attributeEditProgress={demoAttributeProgress}
            isVisible={true}
          />
        </div>
      )}
    </div>
  );
}
