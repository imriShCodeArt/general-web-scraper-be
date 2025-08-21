'use client';

import { DetailedProgress, AttributeEditProgress } from '@/types';
import { useState, useEffect } from 'react';

interface EnhancedProgressTrackerProps {
  detailedProgress?: DetailedProgress;
  attributeEditProgress?: AttributeEditProgress;
  isVisible: boolean;
}

export function EnhancedProgressTracker({ 
  detailedProgress, 
  attributeEditProgress, 
  isVisible 
}: EnhancedProgressTrackerProps) {
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  useEffect(() => {
    if (isVisible && !startTime) {
      setStartTime(Date.now());
    }
  }, [isVisible, startTime]);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, startTime]);

  if (!isVisible) return null;

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getStageColor = (stage: string): string => {
    switch (stage) {
      case 'initializing': return 'bg-blue-500';
      case 'fetching_archives': return 'bg-yellow-500';
      case 'scraping_products': return 'bg-green-500';
      case 'generating_csv': return 'bg-purple-500';
      case 'complete': return 'bg-green-600';
      default: return 'bg-gray-500';
    }
  };

  const getStageLabel = (stage: string): string => {
    switch (stage) {
      case 'initializing': return 'Initializing';
      case 'fetching_archives': return 'Fetching Archives';
      case 'scraping_products': return 'Scraping Products';
      case 'generating_csv': return 'Generating CSV';
      case 'complete': return 'Complete';
      default: return stage;
    }
  };

  return (
    <div className="bg-white border rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Scraping Progress</h3>
      
      {/* Overall Progress */}
      {detailedProgress && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm text-gray-500">{detailedProgress.overall}%</span>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden stage-indicator">
              <div
                className={`h-4 ${getStageColor(detailedProgress.stage)} transition-all duration-500 ease-out progress-smooth progress-glow`}
                style={{ width: `${detailedProgress.overall}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>{getStageLabel(detailedProgress.stage)}</span>
              <span>{detailedProgress.message}</span>
            </div>
          </div>

          {/* Archive Progress */}
          {detailedProgress.archives && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Archive Pages</span>
                <span className="text-sm text-gray-500">
                  {detailedProgress.archives.processed}/{detailedProgress.archives.total}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-3 archive-progress transition-all duration-300 progress-smooth"
                  style={{ 
                    width: `${detailedProgress.archives.total > 0 ? (detailedProgress.archives.processed / detailedProgress.archives.total) * 100 : 0}%` 
                  }}
                />
              </div>
              {detailedProgress.currentArchive && (
                <div className="mt-2 text-xs text-gray-600">
                  Current: {new URL(detailedProgress.currentArchive.url).hostname} 
                  (Page {detailedProgress.currentArchive.index + 1})
                </div>
              )}
            </div>
          )}

          {/* Product Progress */}
          {detailedProgress.products && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Products</span>
                <span className="text-sm text-gray-500">
                  {detailedProgress.products.processed}/{detailedProgress.products.total}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-3 product-progress transition-all duration-300 progress-smooth"
                  style={{ 
                    width: `${detailedProgress.products.total > 0 ? (detailedProgress.products.processed / detailedProgress.products.total) * 100 : 0}%` 
                  }}
                />
              </div>
              {detailedProgress.currentProduct && (
                <div className="mt-2 text-xs text-gray-600">
                  Current: {detailedProgress.currentProduct.title || 'Processing...'} 
                  ({detailedProgress.currentProduct.index + 1}/{detailedProgress.currentProduct.total})
                </div>
              )}
            </div>
          )}

          {/* Time Estimates */}
          {detailedProgress.timeEstimate && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Time Estimates</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="time-estimate-card p-3 rounded-lg">
                  <div className="text-lg font-semibold text-blue-600">
                    {formatTime(detailedProgress.timeEstimate.elapsed)}
                  </div>
                  <div className="text-xs text-gray-500">Elapsed</div>
                </div>
                <div className="time-estimate-card p-3 rounded-lg">
                  <div className="text-lg font-semibold text-orange-600">
                    {detailedProgress.timeEstimate.remaining > 0 ? formatTime(detailedProgress.timeEstimate.remaining) : '--'}
                  </div>
                  <div className="text-xs text-gray-500">Remaining</div>
                </div>
                <div className="time-estimate-card p-3 rounded-lg">
                  <div className="text-lg font-semibold text-green-600">
                    {detailedProgress.timeEstimate.rate.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">Items/sec</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Attribute Editing Progress */}
      {attributeEditProgress && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Attribute Editing</span>
              <span className="text-sm text-gray-500">
                {attributeEditProgress.processedProducts}/{attributeEditProgress.totalProducts}
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-3 attribute-progress transition-all duration-300 progress-smooth"
                style={{ 
                  width: `${attributeEditProgress.totalProducts > 0 ? (attributeEditProgress.processedProducts / attributeEditProgress.totalProducts) * 100 : 0}%` 
                }}
              />
            </div>
            {attributeEditProgress.currentProduct && (
              <div className="mt-2 text-xs text-gray-600">
                Current: {attributeEditProgress.currentProduct.title} 
                ({attributeEditProgress.currentProduct.index + 1}/{attributeEditProgress.totalProducts})
                <br />
                Attributes: {attributeEditProgress.currentProduct.attributesCount}
              </div>
            )}
            <div className="mt-2 text-xs text-gray-500">
              {attributeEditProgress.message}
            </div>
          </div>
        </div>
      )}

      {/* Elapsed Time */}
      <div className="text-center text-sm text-gray-500">
        Total time: {formatTime(elapsedTime / 1000)}
      </div>
    </div>
  );
}
