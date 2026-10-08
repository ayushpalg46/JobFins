import axios from 'axios';

// Base API URL for Spring Boot backend (Configurable via VITE_API_BASE_URL on Render/Vercel)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8080/api' : '/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT Bearer token if present (Experiment 6 & Milestone 7)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jobfins_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle expired/invalid JWT tokens gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const isAuthRoute = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthRoute && localStorage.getItem('jobfins_token')) {
        console.warn('Authentication token expired or unauthorized. Clearing stored session.');
        localStorage.removeItem('jobfins_token');
        localStorage.removeItem('jobfins_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/me'),
};

export const jobService = {
  getAllJobs: (keyword = '') => api.get(`/jobs${keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''}`),
  getJobById: (id) => api.get(`/jobs/${id}`),
  createJob: (jobData) => api.post('/jobs', jobData),
  updateJob: (id, jobData) => api.put(`/jobs/${id}`, jobData),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getMyJobs: () => api.get('/jobs/my-jobs'),
};

export const applicationService = {
  applyForJob: (jobId, applicationData) => api.post(`/applications/apply/${jobId}`, applicationData),
  getMyApplications: () => api.get('/applications/my-applications'),
  getApplicantsForJob: (jobId) => api.get(`/applications/job/${jobId}`),
  getAllApplicantsForRecruiter: () => api.get('/applications/recruiter/all'),
  updateStatus: (applicationId, status, offerDetails = null) => api.put(`/applications/${applicationId}/status`, { status, offerDetails }),
};

export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
};

export const portalService = {
  getDashboardStats: () => api.get('/dashboard/stats'),
  getSalaryGuide: () => api.get('/salary-guide'),
  getCompanies: () => api.get('/companies'),
};

export const labService = portalService;

export default api;
