import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAppStore } from './store';
import { recipeApi, scrapingApi } from './services/api';
import { toast } from 'react-hot-toast';

// Components
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Recipes from './pages/Recipes';
import Jobs from './pages/Jobs';
import Storage from './pages/Storage';
import RecipeDetail from './pages/RecipeDetail';
import JobDetail from './pages/JobDetail';

function App() {
  const { 
    setRecipes, 
    setJobs, 
    setRecipesLoading, 
    setJobsLoading,
    addJob,
    updateJob 
  } = useAppStore();

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load recipes
        setRecipesLoading(true);
        const recipes = await recipeApi.list();
        console.log('Loaded recipes:', recipes); // Debug log
        setRecipes(recipes);
      } catch (error) {
        console.error('Failed to load recipes:', error);
        toast.error('Failed to load recipes');
      } finally {
        setRecipesLoading(false);
      }

      try {
        // Load jobs
        setJobsLoading(true);
        const jobs = await scrapingApi.getAllJobs();
        setJobs(jobs);
      } catch (error) {
        console.error('Failed to load jobs:', error);
        toast.error('Failed to load jobs');
      } finally {
        setJobsLoading(false);
      }
    };

    loadInitialData();
  }, [setRecipes, setJobs, setRecipesLoading, setJobsLoading]);

  // Set up real-time job updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const jobs = await scrapingApi.getAllJobs();
        setJobs(jobs);
        
        // Update individual jobs if they're running
        jobs.forEach(job => {
          if (job.status === 'running' || job.status === 'pending') {
            scrapingApi.getStatus(job.id)
              .then(updatedJob => {
                updateJob(job.id, updatedJob);
              })
              .catch(console.error);
          }
        });
      } catch (error) {
        console.error('Failed to update jobs:', error);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [setJobs, updateJob]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/recipes/:name" element={<RecipeDetail />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/storage" element={<Storage />} />
      </Routes>
    </Layout>
  );
}

export default App;
