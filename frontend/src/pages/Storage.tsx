import { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { storageApi } from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  HardDrive, 
  Trash2, 
  Download, 
  AlertTriangle, 
  CheckCircle,
  Database,
  FileText,
  BarChart3,
  RefreshCw,
  Calendar,
  Clock,
  Globe
} from 'lucide-react';
import { cn, formatFileSize, formatDate } from '../utils';

interface StorageStats {
  totalJobs: number;
  totalStorage: number;
  activeJobs: number;
  completedJobs: number;
  failedJobs: number;
}

export default function Storage() {
  const { jobs } = useAppStore();
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    loadStorageStats();
  }, []);

  const loadStorageStats = async () => {
    try {
      setLoading(true);
      const storageStats = await storageApi.getStats();
      setStats(storageStats);
    } catch (error) {
      console.error('Failed to load storage stats:', error);
      toast.error('Failed to load storage statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadStorageStats();
      toast.success('Storage statistics refreshed');
    } catch (error) {
      console.error('Failed to refresh storage stats:', error);
      toast.error('Failed to refresh storage statistics');
    } finally {
      setRefreshing(false);
    }
  };

  const handleClearStorage = async () => {
    try {
      await storageApi.clear();
      setStats(null);
      setShowClearConfirm(false);
      toast.success('All storage cleared successfully');
    } catch (error) {
      console.error('Failed to clear storage:', error);
      toast.error('Failed to clear storage');
    }
  };

  const getStorageUsagePercentage = () => {
    if (!stats) return 0;
    // This is a mock calculation - in reality you'd have actual storage limits
    const maxStorage = 1024 * 1024 * 1024; // 1GB
    return Math.min((stats.totalStorage / maxStorage) * 100, 100);
  };

  const getStorageColor = (percentage: number) => {
    if (percentage < 50) return 'text-success-600 bg-success-100';
    if (percentage < 80) return 'text-warning-600 bg-warning-100';
    return 'text-error-600 bg-error-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading storage statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Storage</h1>
          <p className="text-gray-600 mt-2">
            Monitor storage usage and manage your data
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="btn-danger flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Storage Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Database className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Storage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatFileSize(stats.totalStorage)}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Usage</span>
                <span className="font-medium">{getStorageUsagePercentage().toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    getStorageUsagePercentage() < 50 ? "bg-success-500" :
                    getStorageUsagePercentage() < 80 ? "bg-warning-500" : "bg-error-500"
                  )}
                  style={{ width: `${getStorageUsagePercentage()}%` }}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-success-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedJobs}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-warning-100 rounded-lg">
                <Clock className="w-6 h-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-error-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-error-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.failedJobs}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Storage Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Jobs</h3>
          {jobs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No jobs yet</p>
              <p className="text-sm text-gray-400">Start scraping to see job data here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.slice(0, 5).map((job) => (
                <div
                  key={job.id || `storage-job-${Math.random()}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      (job.status || '') === 'completed' ? "bg-success-500" :
                      (job.status || '') === 'running' ? "bg-primary-500" :
                      (job.status || '') === 'failed' ? "bg-error-500" : "bg-gray-400"
                    )} />
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {job.siteUrl || 'No URL'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {job.recipe || 'No Recipe'} • {formatDate(job.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn("badge", getStorageColor(job.progress || 0))}>
                      {job.status || 'Unknown'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Storage Information */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Information</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">CSV Files</span>
              </div>
              <span className="text-sm text-gray-600">
                {stats?.completedJobs || 0} files
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Database className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Data Size</span>
              </div>
              <span className="text-sm text-gray-600">
                {stats ? formatFileSize(stats.totalStorage) : '0 B'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Last Updated</span>
              </div>
              <span className="text-sm text-gray-600">
                {stats ? formatDate(new Date()) : 'Never'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Storage Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <RefreshCw className={cn("w-5 h-5 text-primary-600", refreshing && "animate-spin")} />
            <span className="font-medium">Refresh Stats</span>
          </button>
          
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:border-error-300 hover:bg-error-50 transition-colors"
          >
            <Trash2 className="w-5 h-5 text-error-600" />
            <span className="font-medium">Clear All Data</span>
          </button>
          
          <button
            onClick={() => window.location.href = '/jobs'}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <BarChart3 className="w-5 h-5 text-primary-600" />
            <span className="font-medium">View All Jobs</span>
          </button>
        </div>
      </div>

      {/* Clear Storage Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setShowClearConfirm(false)} />
            <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-error-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-error-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Clear All Storage</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                This will permanently delete all stored data, including CSV files and job results. 
                Are you sure you want to continue?
              </p>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearStorage}
                  className="btn-danger"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
