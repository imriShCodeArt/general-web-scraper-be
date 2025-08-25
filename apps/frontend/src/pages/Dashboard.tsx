import { useAppStore } from '../store';
import { scrapingApi } from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  Play, 
  BookOpen, 
  Clock, 
  HardDrive, 
  TrendingUp,   AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { cn, formatDate, getStatusColor, getStatusIcon } from '../utils';
import NewJobModal from '../components/NewJobModal';
import { useState } from 'react';

export default function Dashboard() {
  const { 
    recipes, 
    jobs, 
    getActiveJobs, 
    getCompletedJobs, 
    getFailedJobs,
    addJob 
  } = useAppStore();
  
  const [showNewJobModal, setShowNewJobModal] = useState(false);

  const activeJobs = getActiveJobs();
  const completedJobs = getCompletedJobs();
  const failedJobs = getFailedJobs();

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

  const stats = [
    {
      name: 'Total Recipes',
      value: recipes.length,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Active Jobs',
      value: activeJobs.length,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      name: 'Completed Jobs',
      value: completedJobs.length,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Failed Jobs',
      value: failedJobs.length,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  const recentJobs = jobs.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Monitor your web scraping operations and manage recipes
          </p>
        </div>
        <button
          onClick={() => setShowNewJobModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Play className="w-4 h-4" />
          <span>Start New Job</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={cn("p-3 rounded-lg", stat.bgColor)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => setShowNewJobModal(true)}
              className="w-full flex items-center justify-between p-3 text-left rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Play className="w-5 h-5 text-primary-600" />
                <span className="font-medium">Start New Scraping Job</span>
              </div>
              <span className="text-sm text-gray-500">→</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/recipes'}
              className="w-full flex items-center justify-between p-3 text-left rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-primary-600" />
                <span className="font-medium">Manage Recipes</span>
              </div>
              <span className="text-sm text-gray-500">→</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/storage'}
              className="w-full flex items-center justify-between p-3 text-left rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <HardDrive className="w-5 h-5 text-primary-600" />
                <span className="font-medium">View Storage</span>
              </div>
              <span className="text-sm text-gray-500">→</span>
            </button>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Jobs</h3>
            <button
              onClick={() => window.location.href = '/jobs'}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View All →
            </button>
          </div>
          
          {recentJobs.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No jobs yet</p>
              <p className="text-sm text-gray-400">Start your first scraping job to see it here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div
                  key={job.id || `dashboard-job-${Math.random()}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                  onClick={() => window.location.href = `/jobs/${job.id || 'unknown'}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={cn("text-lg", getStatusColor(job.status || 'unknown'))}>
                      {getStatusIcon(job.status || 'unknown')}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 truncate max-w-xs">
                        {job.siteUrl || 'No URL'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {job.recipe || 'No Recipe'} • {formatDate(job.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn("badge", getStatusColor(job.status || 'unknown'))}>
                      {job.status || 'Unknown'}
                    </span>
                    {(job.progress || 0) > 0 && (
                      <div className="mt-1 text-xs text-gray-500">
                        {job.progress || 0}% complete
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Backend API</span>
            <span className="text-sm font-medium text-green-600">Online</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Recipe System</span>
            <span className="text-sm font-medium text-green-600">Active</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Storage</span>
            <span className="text-sm font-medium text-green-600">Ready</span>
          </div>
        </div>
      </div>

      {/* New Job Modal */}
      <NewJobModal
        isOpen={showNewJobModal}
        onClose={() => setShowNewJobModal(false)}
        onSubmit={handleStartJob}
        recipes={recipes}
      />
    </div>
  );
}
