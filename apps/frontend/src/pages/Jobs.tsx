import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { scrapingApi } from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  Clock, 
  Search, 
  Filter, 
  Play, 
  Pause, 
  Trash2, 
  Download,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Hourglass
} from 'lucide-react';
import { cn, formatDate, formatRelativeTime, getStatusColor, getStatusIcon } from '../utils';
import { ScrapingJob } from '../types';
import NewJobModal from '../components/NewJobModal';

type JobStatus = 'all' | 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export default function Jobs() {
  const navigate = useNavigate();
  const { jobs, jobsLoading, addJob } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus>('all');
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  console.log('Jobs in component:', jobs); // Debug log
  console.log('Search term:', searchTerm); // Debug log
  
  const filteredJobs = jobs.filter(job => {
    console.log('Filtering job:', job); // Debug log
    const matchesSearch = 
      (job.siteUrl?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (job.recipe?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (job.id?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || (job.status || '') === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const updatedJobs = await scrapingApi.getAllJobs();
      // Update store with fresh data
      // Note: This would typically update the store
      toast.success('Jobs refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh jobs:', error);
      toast.error('Failed to refresh jobs');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancelJob = async (job: ScrapingJob) => {
    try {
      await scrapingApi.cancel(job.id);
      toast.success(`Job ${job.id} cancelled successfully`);
    } catch (error) {
      console.error('Failed to cancel job:', error);
      toast.error('Failed to cancel job');
    }
  };

  const handleDownloadCsv = async (job: ScrapingJob, type: 'parent' | 'variation') => {
    try {
      await scrapingApi.downloadCsv(job.id, type);
      toast.success(`${type} CSV downloaded successfully`);
    } catch (error) {
      console.error('Failed to download CSV:', error);
      toast.error('Failed to download CSV');
    }
  };

  const handleStartJob = async (jobData: any) => {
    try {
      const newJob = await scrapingApi.init(jobData);
      addJob(newJob);
      setShowNewJobModal(false);
      toast.success('Scraping job started successfully!');
    } catch (error) {
      console.error('Failed to start job:', error);
      toast.error('Failed to start scraping job');
    }
  };

  const getStatusCount = (status: JobStatus) => {
    if (status === 'all') return jobs.length;
    return jobs.filter(job => (job.status || '') === status).length;
  };

  const statusOptions: { value: JobStatus; label: string; color: string }[] = [
    { value: 'all', label: 'All Jobs', color: 'text-gray-600' },
    { value: 'pending', label: 'Pending', color: 'text-warning-600' },
    { value: 'running', label: 'Running', color: 'text-primary-600' },
    { value: 'completed', label: 'Completed', color: 'text-success-600' },
    { value: 'failed', label: 'Failed', color: 'text-error-600' },
    { value: 'cancelled', label: 'Cancelled', color: 'text-gray-600' },
  ];

  if (jobsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage your web scraping jobs
          </p>
        </div>
        <button
          onClick={() => setShowNewJobModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Play className="w-4 h-4" />
          <span>New Job</span>
        </button>
      </div>

      {/* Stats and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {statusOptions.map((status) => (
          <div
            key={status.value}
            className={cn(
              "card cursor-pointer transition-all hover:shadow-md",
              statusFilter === status.value && "ring-2 ring-primary-500"
            )}
            onClick={() => setStatusFilter(status.value)}
          >
            <div className="text-center">
              <div className={cn("text-2xl font-bold", status.color)}>
                {getStatusCount(status.value)}
              </div>
              <div className="text-sm text-gray-600">{status.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between space-x-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
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
        </div>
      </div>

      {/* Jobs Table */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Get started by creating your first scraping job'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={() => setShowNewJobModal(true)}
              className="btn-primary"
            >
              Start First Job
            </button>
          )}
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Site URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJobs.map((job) => (
                  <tr key={job.id || `job-${Math.random()}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={cn("text-lg", getStatusColor(job.status || 'unknown'))}>
                          {getStatusIcon(job.status || 'unknown')}
                        </span>
                        <span className={cn("badge", getStatusColor(job.status || 'unknown'))}>
                          {job.status || 'unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {job.siteUrl || 'No URL'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {job.id || 'Unknown ID'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{job.recipe || 'No Recipe'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${job.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{job.progress || 0}%</span>
                      </div>
                      {job.processedProducts !== undefined && job.totalProducts !== undefined && (
                        <div className="text-xs text-gray-500 mt-1">
                          {job.processedProducts} / {job.totalProducts} products
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(job.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatRelativeTime(job.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/jobs/${job.id || 'unknown'}`)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {(job.status || '') === 'running' && (
                          <button
                            onClick={() => handleCancelJob(job)}
                            className="p-2 text-gray-400 hover:text-warning-600 hover:bg-warning-50 rounded-lg transition-colors"
                            title="Cancel Job"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        )}
                        
                        {(job.status || '') === 'completed' && (
                          <>
                            <button
                              onClick={() => handleDownloadCsv(job, 'parent')}
                              className="p-2 text-gray-400 hover:text-success-600 hover:bg-success-50 rounded-lg transition-colors"
                              title="Download Parent CSV"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadCsv(job, 'variation')}
                              className="p-2 text-gray-400 hover:text-success-600 hover:bg-success-50 rounded-lg transition-colors"
                              title="Download Variation CSV"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        {(job.status || '') === 'failed' && (
                          <button
                            onClick={() => handleCancelJob(job)}
                            className="p-2 text-gray-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                            title="Remove Job"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Job Modal */}
      <NewJobModal
        isOpen={showNewJobModal}
        onClose={() => setShowNewJobModal(false)}
        onSubmit={handleStartJob}
        recipes={[]} // This would be passed from the store
      />
    </div>
  );
}
