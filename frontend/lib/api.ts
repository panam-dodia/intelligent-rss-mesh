import axios from 'axios';

// This will work in both dev and production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

console.log('API Base URL:', API_BASE_URL); // DEBUG - see what URL is being used

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage on EVERY request
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Request interceptor: Adding token to request'); // DEBUG
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { email: string; username: string; password: string; full_name?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const feedsAPI = {
  getAll: () => api.get('/feeds/'),
  add: (feed: { url: string; title: string; category: string }) => api.post('/feeds/', feed),
  fetch: (feedId: number) => api.post(`/feeds/${feedId}/fetch`),
};

export const articlesAPI = {
  getAll: (skip = 0, limit = 20) => api.get('/articles/', { params: { skip, limit } }),
  getById: (id: number) => api.get(`/articles/${id}`),
  getSimilar: (id: number) => api.get(`/articles/${id}/similar`),
  search: (query: string) => api.post('/articles/search', null, { params: { query } }),
};

export const processingAPI = {
  processAll: () => api.post('/processing/process-all'),
  getStats: () => api.get('/processing/stats'),
};

export const analysisAPI = {
  getCascades: (hours = 48) => api.get('/analysis/cascades', { params: { hours } }),
  getTrending: (hours = 24) => api.get('/analysis/trending', { params: { hours } }),
  getEntityTimeline: (entity: string, days = 30) => 
    api.get(`/analysis/entity/${encodeURIComponent(entity)}/timeline`, { params: { days } }),
  getSourceStats: () => api.get('/analysis/sources'),
};

export const synthesisAPI = {
  getDailyBriefing: () => api.get('/synthesis/daily-briefing'),
  getTopCascades: (limit = 3) => api.get('/synthesis/top-cascades', { params: { limit } }),
  getCascadeSynthesis: (entity: string, hours = 48) => 
    api.get(`/synthesis/cascade/${encodeURIComponent(entity)}`, { params: { hours } }),
};

export const graphAPI = {
  getKnowledgeGraph: (hours = 48, minSimilarity = 0.75) => 
    api.get('/graph/knowledge-graph', { params: { hours, min_similarity: minSimilarity } }),
};

export const usersAPI = {
  getPreferences: () => api.get('/users/preferences'),
  updatePreferences: (prefs: any) => api.put('/users/preferences', prefs),
  getAvailableFeeds: () => api.get('/users/feeds/available'),
  getSubscribedFeeds: () => api.get('/users/feeds/subscribed'),
  subscribeToFeed: (feedId: number) => api.post(`/users/feeds/${feedId}/subscribe`),
  unsubscribeFromFeed: (feedId: number) => api.post(`/users/feeds/${feedId}/unsubscribe`),
};