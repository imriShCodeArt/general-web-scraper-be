import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { recipeApi } from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle,
  AlertCircle,
  Globe,
  Code,
  Settings
} from 'lucide-react';
import { cn, formatDate, parseSelectors, formatSelector } from '../utils';
import { RecipeConfig } from '../types';

export default function Recipes() {
  const navigate = useNavigate();
  const { recipes, recipesLoading, setRecipes } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeConfig | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  console.log('Recipes in component:', recipes); // Debug log
  console.log('Search term:', searchTerm); // Debug log
  
  const filteredRecipes = recipes.filter(recipe => {
    console.log('Filtering recipe:', recipe); // Debug log
    return (recipe.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
           (recipe.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
           (recipe.siteUrl?.toLowerCase() || '').includes(searchTerm.toLowerCase());
  });

  const handleViewRecipe = (recipe: RecipeConfig) => {
    navigate(`/recipes/${encodeURIComponent(recipe.name)}`);
  };

  const handleValidateRecipe = async (recipe: RecipeConfig) => {
    try {
      const isValid = await recipeApi.validate(recipe.name);
      if (isValid) {
        toast.success(`${recipe.name} is valid!`);
      } else {
        toast.error(`${recipe.name} has validation issues`);
      }
    } catch (error) {
      console.error('Failed to validate recipe:', error);
      toast.error('Failed to validate recipe');
    }
  };

  const handleDeleteRecipe = async () => {
    if (!selectedRecipe) return;
    
    try {
      // Note: Backend doesn't have delete endpoint yet, this is a placeholder
      toast.error('Recipe deletion not implemented yet');
      setShowDeleteModal(false);
      setSelectedRecipe(null);
    } catch (error) {
      console.error('Failed to delete recipe:', error);
      toast.error('Failed to delete recipe');
    }
  };

  const getRecipeStats = (recipe: RecipeConfig) => {
    const selectors = recipe.selectors ? Object.keys(recipe.selectors).length : 0;
    const transforms = recipe.transforms ? Object.keys(recipe.transforms).length : 0;
    const fallbacks = recipe.fallbacks ? Object.keys(recipe.fallbacks).length : 0;
    
    return { selectors, transforms, fallbacks };
  };

  if (recipesLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recipes</h1>
          <p className="text-gray-600 mt-2">
            Manage your web scraping recipes and configurations
          </p>
        </div>
        <button
          onClick={() => navigate('/recipes/new')}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Recipe</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {filteredRecipes.length} of {recipes.length} recipes
        </div>
      </div>

      {/* Recipes Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first recipe'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => navigate('/recipes/new')}
              className="btn-primary"
            >
              Create Recipe
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => {
            const stats = getRecipeStats(recipe);
            return (
              <div key={recipe.name || `recipe-${Math.random()}`} className="card hover:shadow-md transition-shadow">
                {/* Recipe Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {recipe.name || 'Unnamed Recipe'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {recipe.description || 'No description'}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Globe className="w-4 h-4" />
                      <span className="truncate">{recipe.siteUrl || 'No URL'}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleViewRecipe(recipe)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="View Recipe"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleValidateRecipe(recipe)}
                      className="p-2 text-gray-400 hover:text-success-600 hover:bg-success-50 rounded-lg transition-colors"
                      title="Validate Recipe"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/recipes/${encodeURIComponent(recipe.name)}/edit`)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Edit Recipe"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRecipe(recipe);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                      title="Delete Recipe"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Recipe Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-primary-600">{stats.selectors}</div>
                    <div className="text-xs text-gray-500">Selectors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-warning-600">{stats.transforms}</div>
                    <div className="text-xs text-gray-500">Transforms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-success-600">{stats.fallbacks}</div>
                    <div className="text-xs text-gray-500">Fallbacks</div>
                  </div>
                </div>

                {/* Recipe Details */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Version:</span>
                    <span className="font-medium">{recipe.version || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Created:</span>
                    <span className="font-medium">{formatDate(new Date())}</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => navigate(`/recipes/${encodeURIComponent(recipe.name)}`)}
                    className="w-full btn-secondary text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedRecipe && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setShowDeleteModal(false)} />
            <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-error-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-error-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Recipe</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <span className="font-semibold">{selectedRecipe.name}</span>? 
                This will remove all configuration data for this recipe.
              </p>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteRecipe}
                  className="btn-danger"
                >
                  Delete Recipe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
