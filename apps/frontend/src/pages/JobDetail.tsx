import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { scrapingApi, storageApi } from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft,
  Play,
  Pause,
  Trash2,
  Download,
  RefreshCw,
  Clock,
  Globe,
  BookOpen,
  AlertCircle,
  CheckCircle,
  XCircle,
  Hourglass,
  FileText,
  Database,
  BarChart3,
  Settings,
  Eye,
  Copy,
  ExternalLink,
  FileDown
} from 'lucide-react';
import { cn, formatDate, formatRelativeTime, getStatusColor, getStatusIcon, formatFileSize } from '../utils';
import { ScrapingJob } from '../types';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jobs, updateJob } = useAppStore();
  
  const [job, setJob] = useState<ScrapingJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [storageData, setStorageData] = useState<any>(null);

  // Find job in store or fetch from API
  useEffect(() => {
    if (id) {
      const foundJob = jobs.find(j => j.id === id);
      if (foundJob) {
        setJob(foundJob);
        setLoading(false);
      } else {
        // Job not in store, fetch from API
        fetchJobDetails();
      }
    }
  }, [id, jobs]);

  // Set up real-time updates for active jobs
  useEffect(() => {
    if (job && (job.status === 'running' || job.status === 'pending')) {
      const interval = setInterval(() => {
        fetchJobDetails();
      }, 2000); // Update every 2 seconds for active jobs

      return () => clearInterval(interval);
    }
  }, [job?.status]);

  // Close download menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDownloadMenu && !(event.target as Element).closest('.download-menu-container')) {
        setShowDownloadMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDownloadMenu]);

  // Helper functions to check data availability
  const hasVariations = useMemo(() => {
    const result = storageData?.variationCsv && storageData.variationCsv.trim() !== '';
    console.log('🔍 DEBUG: hasVariations calculation:', {
      storageDataExists: !!storageData,
      variationCsvExists: !!storageData?.variationCsv,
      variationCsvLength: storageData?.variationCsv?.length || 0,
      variationCsvTrimmed: storageData?.variationCsv?.trim() || 'N/A',
      hasVariations: result
    });
    return result;
  }, [storageData]);

  const hasParentCsv = useMemo(() => {
    const result = storageData?.parentCsv && storageData.parentCsv.trim() !== '';
    console.log('🔍 DEBUG: hasParentCsv calculation:', {
      storageDataExists: !!storageData,
      parentCsvExists: !!storageData?.parentCsv,
      parentCsvLength: storageData?.parentCsv?.length || 0,
      parentCsvTrimmed: storageData?.parentCsv?.trim() || 'N/A',
      hasParentCsv: result
    });
    return result;
  }, [storageData]);

  const fetchJobDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const jobData = await scrapingApi.getStatus(id);
      setJob(jobData);
      
      // Update store
      updateJob(id, jobData);
      
             // If job is completed, fetch storage data
       if (jobData.status === 'completed') {
         try {
           console.log('🔍 DEBUG: Fetching storage data for completed job');
           const storage = await storageApi.getJobResult(id);
           console.log('🔍 DEBUG: Storage data received:', {
             storageExists: !!storage,
             storageKeys: storage ? Object.keys(storage) : 'N/A',
             variationCsvExists: !!storage?.variationCsv,
             variationCsvLength: storage?.variationCsv?.length || 0,
             parentCsvExists: !!storage?.parentCsv,
             parentCsvLength: storage?.parentCsv?.length || 0,
             metadata: storage?.metadata
           });
           setStorageData(storage);
         } catch (error) {
           console.warn('❌ DEBUG: Failed to fetch storage data:', error);
         }
       }
    } catch (error) {
      console.error('Failed to fetch job details:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchJobDetails();
    setRefreshing(false);
    toast.success('Job details refreshed');
  };

  const handleCancelJob = async () => {
    if (!job) return;
    
    try {
      await scrapingApi.cancel(job.id);
      toast.success('Job cancelled successfully');
      await fetchJobDetails(); // Refresh to get updated status
    } catch (error) {
      console.error('Failed to cancel job:', error);
      toast.error('Failed to cancel job');
    }
  };

  const handleDeleteJob = async () => {
    if (!job) return;
    
    try {
      // Note: Backend doesn't have delete endpoint yet
      toast.error('Job deletion not implemented yet');
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete job:', error);
      toast.error('Failed to delete job');
    }
  };

  const handleDownloadCsv = async (type: 'parent' | 'variation') => {
    if (!job) return;
    
    try {
      // DEBUG: Log storage data to understand what's available
      console.log('🔍 DEBUG: Storage data for CSV download:', {
        type,
        storageData,
        hasVariations,
        hasParentCsv,
        variationCsvLength: storageData?.variationCsv?.length || 0,
        parentCsvLength: storageData?.parentCsv?.length || 0,
        variationCsvPreview: storageData?.variationCsv?.substring(0, 200) || 'N/A',
        parentCsvPreview: storageData?.parentCsv?.substring(0, 200) || 'N/A'
      });

      // Check if CSV data exists before attempting download
      if (type === 'variation' && !hasVariations) {
        console.log('❌ DEBUG: Variation CSV requested but hasVariations is false');
        toast.error('No variation data available for this job');
        return;
      }
      
      if (type === 'parent' && !hasParentCsv) {
        console.log('❌ DEBUG: Parent CSV requested but hasParentCsv is false');
        toast.error('No parent data available for this job');
        return;
      }

      console.log('✅ DEBUG: Proceeding with CSV download for type:', type);
      await scrapingApi.downloadCsv(job.id, type);
      toast.success(`${type} CSV downloaded successfully`);
    } catch (error) {
      console.error('❌ DEBUG: CSV download failed:', {
        type,
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStatus: (error as any)?.response?.status,
        errorData: (error as any)?.response?.data
      });
      
      if (type === 'variation') {
        toast.error('Variation CSV not available for this job');
      } else {
        toast.error('Failed to download CSV');
      }
    }
  };

  const copyJobId = () => {
    if (job?.id) {
      navigator.clipboard.writeText(job.id);
      toast.success('Job ID copied to clipboard');
    }
  };

  const downloadJobDetails = (format: 'json' | 'csv' | 'report') => {
    if (!job) return;

    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      switch (format) {
        case 'json':
          content = JSON.stringify(job, null, 2);
          filename = `job-${job.id}-details.json`;
          mimeType = 'application/json';
          break;
        
        case 'csv':
          content = generateJobCsv(job);
          filename = `job-${job.id}-details.csv`;
          mimeType = 'text/csv';
          break;
        
        case 'report':
          content = generateJobReport(job);
          filename = `job-${job.id}-report.txt`;
          mimeType = 'text/plain';
          break;
        
        default:
          return;
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Job details downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Failed to download job details:', error);
      toast.error('Failed to download job details');
    }
  };

  const generateJobCsv = (job: ScrapingJob): string => {
    const headers = [
      'Field',
      'Value'
    ];

    const rows = [
      ['Job ID', job.id || ''],
      ['Site URL', job.siteUrl || ''],
      ['Recipe', job.recipe || ''],
      ['Status', job.status || ''],
      ['Progress', `${job.progress || 0}%`],
      ['Total Products', job.totalProducts?.toString() || ''],
      ['Processed Products', job.processedProducts?.toString() || ''],
      ['Created', formatDate(job.createdAt)],
      ['Updated', formatDate(job.updatedAt)],
      ['Started', job.startedAt ? formatDate(job.startedAt) : ''],
      ['Completed', job.completedAt ? formatDate(job.completedAt) : ''],
      ['Error', job.error || ''],
    ];

    // Add options if they exist
    if (job.options) {
      Object.entries(job.options).forEach(([key, value]) => {
        rows.push([`Option: ${key}`, String(value)]);
      });
    }

    // Add metadata if it exists
    if (job.metadata) {
      Object.entries(job.metadata).forEach(([key, value]) => {
        rows.push([`Metadata: ${key}`, String(value)]);
      });
    }

    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  };

  const generateJobReport = (job: ScrapingJob): string => {
    const report = [
      `JOB DETAILS REPORT`,
      `Generated: ${formatDate(new Date())}`,
      `Job ID: ${job.id}`,
      '',
      `BASIC INFORMATION`,
      `===============`,
      `Site URL: ${job.siteUrl || 'N/A'}`,
      `Recipe: ${job.recipe || 'N/A'}`,
      `Status: ${job.status || 'Unknown'}`,
      `Progress: ${job.progress || 0}%`,
      '',
      `PRODUCT INFORMATION`,
      `==================`,
      `Total Products: ${job.totalProducts || 'Unknown'}`,
      `Processed Products: ${job.processedProducts || 'Unknown'}`,
      '',
      `TIMELINE`,
      `========`,
      `Created: ${formatDate(job.createdAt)}`,
      `Updated: ${formatDate(job.updatedAt)}`,
      `Started: ${job.startedAt ? formatDate(job.startedAt) : 'Not started'}`,
      `Completed: ${job.completedAt ? formatDate(job.completedAt) : 'Not completed'}`,
      '',
    ];

    if (job.options && Object.keys(job.options).length > 0) {
      report.push(
        `CONFIGURATION OPTIONS`,
        `====================`,
        ...Object.entries(job.options).map(([key, value]) => `${key}: ${value}`),
        ''
      );
    }

    if (job.metadata && Object.keys(job.metadata).length > 0) {
      report.push(
        `JOB METADATA`,
        `============`,
        ...Object.entries(job.metadata).map(([key, value]) => `${key}: ${value}`),
        ''
      );
    }

    if (job.error) {
      report.push(
        `ERROR INFORMATION`,
        `================`,
        job.error,
        ''
      );
    }

    if (storageData) {
      report.push(
        `STORAGE INFORMATION`,
        `==================`,
        `Total Products: ${storageData.metadata?.totalProducts || 0}`,
        `Total Variations: ${storageData.metadata?.totalVariations || 0}`,
        `File Size: ${formatFileSize(storageData.metadata?.totalStorage || 0)}`,
        ''
      );
    }

    report.push(
      `REPORT END`,
      `==========`
    );

    return report.join('\n');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Job Not Found</h3>
        <p className="text-gray-500 mb-6">The job you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/jobs')}
          className="btn-primary"
        >
          Back to Jobs
        </button>
      </div>
    );
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-success-500';
    if (progress >= 50) return 'bg-warning-500';
    return 'bg-primary-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/jobs')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Details</h1>
            <p className="text-gray-600 mt-2">
              Monitor and manage scraping job {job.id}
            </p>
          </div>
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
           
           {/* DEBUG: Manual storage data check */}
           {job.status === 'completed' && (
             <button
               onClick={() => {
                 console.log('🔍 DEBUG: Manual storage data check triggered');
                 console.log('Current storageData:', storageData);
                 console.log('hasVariations:', hasVariations);
                 console.log('hasParentCsv:', hasParentCsv);
                 if (storageData) {
                   console.log('Storage data details:', {
                     keys: Object.keys(storageData),
                     variationCsv: storageData.variationCsv,
                     parentCsv: storageData.parentCsv,
                     metadata: storageData.metadata
                   });
                 }
                 toast('Check console for debug info');
               }}
               className="btn-warning flex items-center space-x-2"
               title="Debug: Check storage data in console"
             >
               <Eye className="w-4 h-4" />
               <span>Debug Data</span>
             </button>
           )}
          
          <div className="relative group download-menu-container">
            <button
              className="btn-secondary flex items-center space-x-2"
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
            >
              <FileDown className="w-4 h-4" />
              <span>Download Details</span>
            </button>
            
            {/* Download Menu Dropdown */}
            {showDownloadMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      downloadJobDetails('json');
                      setShowDownloadMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>JSON Format</span>
                  </button>
                  <button
                    onClick={() => {
                      downloadJobDetails('csv');
                      setShowDownloadMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>CSV Format</span>
                  </button>
                  <button
                    onClick={() => {
                      downloadJobDetails('report');
                      setShowDownloadMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Text Report</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {job.status === 'running' && (
            <button
              onClick={handleCancelJob}
              className="btn-warning flex items-center space-x-2"
            >
              <Pause className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          )}
          
          {job.status === 'completed' && (
            <div className="flex items-center space-x-2">
              {hasParentCsv && (
                <button
                  onClick={() => handleDownloadCsv('parent')}
                  className="btn-success flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Parent CSV</span>
                </button>
              )}
              {hasVariations && (
                <button
                  onClick={() => handleDownloadCsv('variation')}
                  className="btn-success flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Variation CSV</span>
                </button>
              )}
            </div>
          )}
          
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn-danger flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Job Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Status */}
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-gray-100 rounded-lg">
              {getStatusIcon(job.status || 'unknown')}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Status</p>
              <p className={cn("text-lg font-semibold", getStatusColor(job.status || 'unknown'))}>
                {job.status || 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Progress</p>
              <p className="text-lg font-semibold text-gray-900">
                {job.progress || 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-success-100 rounded-lg">
              <Database className="w-6 h-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Products</p>
              <p className="text-lg font-semibold text-gray-900">
                {job.processedProducts || 0} / {job.totalProducts || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Created */}
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-warning-100 rounded-lg">
              <Clock className="w-6 h-6 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Created</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(job.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {job.progress !== undefined && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
            <span className="text-sm text-gray-600">{job.progress || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={cn("h-3 rounded-full transition-all duration-500", getProgressColor(job.progress || 0))}
              style={{ width: `${job.progress || 0}%` }}
            />
          </div>
          {job.processedProducts !== undefined && job.totalProducts !== undefined && (
            <div className="mt-2 text-sm text-gray-600">
              Processed {job.processedProducts} of {job.totalProducts} products
            </div>
          )}
        </div>
      )}

      {/* Job Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Job ID</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-900 font-mono">{job.id || 'Unknown'}</span>
                <button
                  onClick={copyJobId}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                  title="Copy Job ID"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Site URL</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-900 truncate max-w-xs">
                  {job.siteUrl || 'No URL'}
                </span>
                {job.siteUrl && (
                  <a
                    href={job.siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Recipe</span>
              <span className="text-sm text-gray-900">{job.recipe || 'No Recipe'}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Created</span>
              <span className="text-sm text-gray-900">{formatDate(job.createdAt)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Updated</span>
              <span className="text-sm text-gray-900">{formatDate(job.updatedAt)}</span>
            </div>
            
            {job.startedAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Started</span>
                <span className="text-sm text-gray-900">{formatDate(job.startedAt)}</span>
              </div>
            )}
            
            {job.completedAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Completed</span>
                <span className="text-sm text-gray-900">{formatDate(job.completedAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Job Options & Metadata */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration & Options</h3>
          <div className="space-y-4">
            {job.options && Object.keys(job.options).length > 0 ? (
              Object.entries(job.options).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-sm text-gray-900">{String(value)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No custom options configured</p>
            )}
            
            {job.metadata && (
              <>
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Job Metadata</h4>
                  <div className="space-y-2">
                    {Object.entries(job.metadata).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm text-gray-900">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Download Job Details */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Download Job Details</h3>
        <p className="text-gray-600 mb-4">
          Download comprehensive information about this job in various formats for reporting, analysis, or backup purposes.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => downloadJobDetails('json')}
            className="flex items-center justify-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
          >
            <FileText className="w-8 h-8 text-primary-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">JSON Format</div>
              <div className="text-sm text-gray-500">Machine-readable data</div>
            </div>
          </button>
          
          <button
            onClick={() => downloadJobDetails('csv')}
            className="flex items-center justify-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-success-300 hover:bg-success-50 transition-colors"
          >
            <FileText className="w-8 h-8 text-success-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">CSV Format</div>
              <div className="text-sm text-gray-500">Spreadsheet compatible</div>
            </div>
          </button>
          
          <button
            onClick={() => downloadJobDetails('report')}
            className="flex items-center justify-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-warning-300 hover:bg-warning-50 transition-colors"
          >
            <FileText className="w-8 h-8 text-warning-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Text Report</div>
              <div className="text-sm text-gray-500">Human-readable format</div>
            </div>
          </button>
        </div>
      </div>

      {/* Results & Storage */}
      {job.status === 'completed' && storageData && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Results & Storage</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-700">CSV Files</h4>
              <div className="space-y-3">
                {hasParentCsv ? (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-primary-600" />
                      <span className="text-sm font-medium text-gray-700">Parent Products</span>
                    </div>
                    <button
                      onClick={() => handleDownloadCsv('parent')}
                      className="btn-secondary text-sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Parent Products</span>
                    </div>
                    <span className="text-sm text-gray-500 px-3 py-1 bg-gray-200 rounded-full">
                      No data available
                    </span>
                  </div>
                )}
                
                {hasVariations ? (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-success-600" />
                      <span className="text-sm font-medium text-gray-700">Variation Products</span>
                    </div>
                    <button
                      onClick={() => handleDownloadCsv('variation')}
                      className="btn-secondary text-sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-500">Variation Products</span>
                    </div>
                    <span className="text-sm text-gray-500 px-3 py-1 bg-gray-200 rounded-full">
                      No variations available
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-700">Statistics</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Products</span>
                  <span className="text-sm text-gray-900">{storageData.metadata?.totalProducts || 0}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Variations</span>
                  <span className="text-sm text-gray-900">
                    {hasVariations 
                      ? (storageData.metadata?.totalVariations || 0)
                      : '0 (No variations)'
                    }
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">File Size</span>
                  <span className="text-sm text-gray-900">
                    {formatFileSize(storageData.metadata?.totalStorage || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Information */}
      {job.error && (
        <div className="card border-error-200 bg-error-50">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-error-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-error-900 mb-2">Error Details</h3>
              <p className="text-error-700 whitespace-pre-wrap">{job.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setShowDeleteConfirm(false)} />
            <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-error-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-error-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Job</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this job? This will remove all job data and results permanently.
              </p>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteJob}
                  className="btn-danger"
                >
                  Delete Job
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
