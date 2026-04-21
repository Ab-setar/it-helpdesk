import axios from 'axios';

// Use Vite's import.meta.env instead of process.env
const API_URL = import.meta.env.VITE_API_URL || '/api';

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
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
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
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
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
  getAll: (params = {}) => api.get('/tickets', { params }),
  getOne: (id) => api.get(`/tickets/${id}`),
  update: (id, data) => api.put(`/tickets/${id}`, data),
  delete: (id) => api.delete(`/tickets/${id}`),
  addComment: (id, data) => api.post(`/tickets/${id}/comments`, data),
};

// Admin API
export const adminAPI = {
  // Users
  getUsers: () => api.get('/users'),
  deleteUser: (id) => api.delete(`/users/${id}`),

  // Senior Officers
  getSeniorOfficers: () => api.get('/users/senior-officers'),
  registerSeniorOfficer: (data) => api.post('/users/senior-officer', data),

  // Teams
  getTeams: () => api.get('/users/teams'),
  createTeam: (data) => api.post('/users/teams', data),
  getOfficersByTeam: (teamId) => api.get(`/users/teams/${teamId}/officers`),
};

export default api;
