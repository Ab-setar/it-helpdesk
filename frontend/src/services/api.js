import axios from 'axios';

// Use Vite's import.meta.env instead of process.env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  deleteAccount: () => api.delete('/auth/me'),
};

// Ticket API
export const ticketAPI = {
  create: (data) => api.post('/tickets', data),
  getAll: () => api.get('/tickets'),
  getOne: (id) => api.get(`/tickets/${id}`),
  update: (id, data) => api.put(`/tickets/${id}`, data),
  delete: (id) => api.delete(`/tickets/${id}`),
  addComment: (id, data) => api.post(`/tickets/${id}/comments`, data),
};

// Admin API
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getSeniorOfficers: () => api.get('/admin/senior-officers'),
  registerSeniorOfficer: (data) => api.post('/admin/senior-officers', data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getTeams: () => api.get('/admin/teams'),
  getAvailableTeams: () => api.get('/admin/teams/available'),
  createTeam: (data) => api.post('/admin/teams', data),
  updateIssueMapping: (issueType, teamId) => api.put(`/admin/issue-mapping/${issueType}`, { teamId }),
};

export default api;
