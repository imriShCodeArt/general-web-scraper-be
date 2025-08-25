import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Play, Settings } from 'lucide-react';
import { RecipeConfig, NewScrapingJobForm } from '../types';
import { cn, isValidUrl } from '../utils';

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewScrapingJobForm) => void;
  recipes: RecipeConfig[];
}

export default function NewJobModal({ isOpen, onClose, onSubmit, recipes }: NewJobModalProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<NewScrapingJobForm>({
    defaultValues: {
      siteUrl: '',
      recipe: '',
      options: {
        maxProducts: 100,
        delay: 1000,
        timeout: 30000,
      },
    },
  });

  const selectedRecipe = watch('recipe');
  const recipe = recipes.find(r => r.name === selectedRecipe);

  const handleFormSubmit = (data: NewScrapingJobForm) => {
    onSubmit(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Play className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Start New Scraping Job</h3>
                <p className="text-sm text-gray-500">Configure and start a new web scraping operation</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
            {/* Basic Configuration */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Basic Configuration</h4>
              
              {/* Site URL */}
              <div>
                <label htmlFor="siteUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Site URL *
                </label>
                <input
                  {...register('siteUrl', {
                    required: 'Site URL is required',
                    validate: (value) => isValidUrl(value) || 'Please enter a valid URL',
                  })}
                  type="url"
                  id="siteUrl"
                  placeholder="https://example.com"
                  className={cn(
                    "input",
                    errors.siteUrl ? "border-error-500 focus:ring-error-500" : ""
                  )}
                />
                {errors.siteUrl && (
                  <p className="mt-1 text-sm text-error-600">{errors.siteUrl.message}</p>
                )}
              </div>

              {/* Recipe Selection */}
              <div>
                <label htmlFor="recipe" className="block text-sm font-medium text-gray-700 mb-2">
                  Recipe *
                </label>
                <select
                  {...register('recipe', { required: 'Recipe is required' })}
                  id="recipe"
                  className={cn(
                    "input",
                    errors.recipe ? "border-error-500 focus:ring-error-500" : ""
                  )}
                >
                  <option value="">Select a recipe...</option>
                  {recipes.map((recipe) => (
                    <option key={recipe.name} value={recipe.name}>
                      {recipe.name}
                    </option>
                  ))}
                </select>
                {errors.recipe && (
                  <p className="mt-1 text-sm text-error-600">{errors.recipe.message}</p>
                )}
                
                {/* Recipe Info */}
                {recipe && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Description:</span> {recipe.description || 'No description'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Version:</span> {recipe.version}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Advanced Options */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Advanced Options</span>
                <span className={cn(
                  "ml-auto transition-transform",
                  showAdvanced ? "rotate-180" : ""
                )}>
                  ▼
                </span>
              </button>

              {showAdvanced && (
                <div className="pl-4 space-y-4 border-l-2 border-gray-200">
                  {/* Max Products */}
                  <div>
                    <label htmlFor="maxProducts" className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Products
                    </label>
                    <input
                      {...register('options.maxProducts', {
                        min: { value: 1, message: 'Must be at least 1' },
                        max: { value: 10000, message: 'Must be at most 10,000' },
                      })}
                      type="number"
                      id="maxProducts"
                      min="1"
                      max="10000"
                      className="input"
                    />
                    {errors.options?.maxProducts && (
                      <p className="mt-1 text-sm text-error-600">
                        {errors.options.maxProducts.message}
                      </p>
                    )}
                  </div>

                  {/* Delay */}
                  <div>
                    <label htmlFor="delay" className="block text-sm font-medium text-gray-700 mb-2">
                      Delay Between Requests (ms)
                    </label>
                    <input
                      {...register('options.delay', {
                        min: { value: 0, message: 'Must be at least 0' },
                        max: { value: 10000, message: 'Must be at most 10,000' },
                      })}
                      type="number"
                      id="delay"
                      min="0"
                      max="10000"
                      step="100"
                      className="input"
                    />
                    {errors.options?.delay && (
                      <p className="mt-1 text-sm text-error-600">
                        {errors.options.delay.message}
                      </p>
                    )}
                  </div>

                  {/* Timeout */}
                  <div>
                    <label htmlFor="timeout" className="block text-sm font-medium text-gray-700 mb-2">
                      Request Timeout (ms)
                    </label>
                    <input
                      {...register('options.timeout', {
                        min: { value: 5000, message: 'Must be at least 5,000' },
                        max: { value: 120000, message: 'Must be at most 120,000' },
                      })}
                      type="number"
                      id="timeout"
                      min="5000"
                      max="120000"
                      step="1000"
                      className="input"
                    />
                    {errors.options?.timeout && (
                      <p className="mt-1 text-sm text-error-600">
                        {errors.options.timeout.message}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Starting...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Play className="w-4 h-4" />
                    <span>Start Job</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
