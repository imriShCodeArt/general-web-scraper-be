'use client';

import { useState } from 'react';
import { WooCommerceCredentials } from '@/types';

interface WooCommerceCredentialsFormProps {
  onCredentialsSubmit: (credentials: WooCommerceCredentials) => void;
  onTestConnection: (credentials: WooCommerceCredentials) => Promise<boolean>;
  isProcessing?: boolean;
}

export function WooCommerceCredentialsForm({ 
  onCredentialsSubmit, 
  onTestConnection, 
  isProcessing = false 
}: WooCommerceCredentialsFormProps) {
  const [credentials, setCredentials] = useState<WooCommerceCredentials>({
    siteUrl: '',
    consumerKey: '',
    consumerSecret: '',
    verifySSL: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const validateCredentials = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!credentials.siteUrl.trim()) {
      newErrors.siteUrl = 'Site URL is required';
    } else if (!isValidUrl(credentials.siteUrl.trim())) {
      newErrors.siteUrl = 'Please enter a valid URL';
    }

    if (!credentials.consumerKey.trim()) {
      newErrors.consumerKey = 'Consumer Key is required';
    }

    if (!credentials.consumerSecret.trim()) {
      newErrors.consumerSecret = 'Consumer Secret is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleTestConnection = async () => {
    if (!validateCredentials()) return;

    setIsTesting(true);
    setTestResult(null);

    try {
      const success = await onTestConnection(credentials);
      setTestResult({
        success,
        message: success 
          ? 'Connection successful! WooCommerce API is accessible.' 
          : 'Connection failed. Please check your credentials and try again.'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCredentials()) return;

    onCredentialsSubmit(credentials);
  };

  const updateField = (field: keyof WooCommerceCredentials, value: string | boolean) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="bg-white border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">WooCommerce API Configuration</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Site URL
          </label>
          <input
            type="url"
            value={credentials.siteUrl}
            onChange={(e) => updateField('siteUrl', e.target.value)}
            placeholder="https://yourstore.com"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.siteUrl ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isProcessing}
          />
          {errors.siteUrl && (
            <p className="text-red-500 text-sm mt-1">{errors.siteUrl}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Your WooCommerce store URL (e.g., https://mystore.com)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Consumer Key
          </label>
          <input
            type="text"
            value={credentials.consumerKey}
            onChange={(e) => updateField('consumerKey', e.target.value)}
            placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.consumerKey ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isProcessing}
          />
          {errors.consumerKey && (
            <p className="text-red-500 text-sm mt-1">{errors.consumerKey}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Found in WooCommerce → Settings → Advanced → REST API
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Consumer Secret
          </label>
          <input
            type="password"
            value={credentials.consumerSecret}
            onChange={(e) => updateField('consumerSecret', e.target.value)}
            placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.consumerSecret ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isProcessing}
          />
          {errors.consumerSecret && (
            <p className="text-red-500 text-sm mt-1">{errors.consumerSecret}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Found in WooCommerce → Settings → Advanced → REST API
          </p>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="verifySSL"
            checked={credentials.verifySSL}
            onChange={(e) => updateField('verifySSL', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            disabled={isProcessing}
          />
          <label htmlFor="verifySSL" className="ml-2 block text-sm text-gray-700">
            Verify SSL certificates
          </label>
        </div>

        {/* Connection Test Result */}
        {testResult && (
          <div className={`p-3 rounded-md ${
            testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className={`text-sm ${
              testResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {testResult.message}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isProcessing || isTesting}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isTesting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Testing...
              </>
            ) : (
              'Test Connection'
            )}
          </button>

          <button
            type="submit"
            disabled={isProcessing || !testResult?.success}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Continue to Import'}
          </button>
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 p-4 rounded-md">
          <h4 className="text-sm font-medium text-blue-900 mb-2">How to get API credentials:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Go to your WordPress admin → WooCommerce → Settings</li>
            <li>Click on the "Advanced" tab</li>
            <li>Click on "REST API"</li>
            <li>Click "Add key"</li>
            <li>Set permissions to "Read/Write"</li>
            <li>Copy the Consumer Key and Consumer Secret</li>
          </ol>
        </div>
      </form>
    </div>
  );
}
