import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

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