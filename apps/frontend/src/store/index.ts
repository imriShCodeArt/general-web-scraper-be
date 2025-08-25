import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { RecipeConfig, ScrapingJob } from '../types';

interface AppState {
  // Recipes
  recipes: RecipeConfig[];
  selectedRecipe: RecipeConfig | null;
  recipesLoading: boolean;
  
  // Scraping jobs
  jobs: ScrapingJob[];
  selectedJob: ScrapingJob | null;
  jobsLoading: boolean;
  
  // UI state
  sidebarOpen: boolean;
  activeTab: 'dashboard' | 'recipes' | 'jobs' | 'storage';
  
  // Actions
  setRecipes: (recipes: RecipeConfig[]) => void;
  setSelectedRecipe: (recipe: RecipeConfig | null) => void;
  setRecipesLoading: (loading: boolean) => void;
  
  setJobs: (jobs: ScrapingJob[]) => void;
  setSelectedJob: (job: ScrapingJob | null) => void;
  setJobsLoading: (loading: boolean) => void;
  
  addJob: (job: ScrapingJob) => void;
  updateJob: (jobId: string, updates: Partial<ScrapingJob>) => void;
  
  setSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: 'dashboard' | 'recipes' | 'jobs' | 'storage') => void;
  
  // Computed values
  getActiveJobs: () => ScrapingJob[];
  getCompletedJobs: () => ScrapingJob[];
  getFailedJobs: () => ScrapingJob[];
  getJobById: (jobId: string) => ScrapingJob | undefined;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial state
      recipes: [],
      selectedRecipe: null,
      recipesLoading: false,
      
      jobs: [],
      selectedJob: null,
      jobsLoading: false,
      
      sidebarOpen: true,
      activeTab: 'dashboard',
      
      // Actions
      setRecipes: (recipes) => set({ recipes }),
      setSelectedRecipe: (recipe) => set({ selectedRecipe: recipe }),
      setRecipesLoading: (loading) => set({ recipesLoading: loading }),
      
      setJobs: (jobs) => set({ jobs }),
      setSelectedJob: (job) => set({ selectedJob: job }),
      setJobsLoading: (loading) => set({ jobsLoading: loading }),
      
      addJob: (job) => set((state) => ({ 
        jobs: [job, ...state.jobs] 
      })),
      
      updateJob: (jobId, updates) => set((state) => ({
        jobs: state.jobs.map((job) =>
          job.id === jobId ? { ...job, ...updates } : job
        ),
        selectedJob: state.selectedJob?.id === jobId 
          ? { ...state.selectedJob, ...updates }
          : state.selectedJob,
      })),
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      // Computed values
      getActiveJobs: () => get().jobs.filter(job => 
        ['pending', 'running'].includes(job.status)
      ),
      
      getCompletedJobs: () => get().jobs.filter(job => 
        job.status === 'completed'
      ),
      
      getFailedJobs: () => get().jobs.filter(job => 
        job.status === 'failed'
      ),
      
      getJobById: (jobId) => get().jobs.find(job => job.id === jobId),
    }),
    {
      name: 'web-scraper-store',
    }
  )
);
