import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
  changePassword: (currentPassword, newPassword) => api.post('/auth/change-password', { currentPassword, newPassword }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Ticket API
export const ticketAPI = {
  create: (data) => api.post('/tickets', data),
  getAll: (params) => api.get('/tickets', { params }),
  getById: (id) => api.get(`/tickets/${id}`),
  update: (id, data) => api.put(`/tickets/${id}`, data),
  delete: (id) => api.delete(`/tickets/${id}`),
  addComment: (id, commentText) => api.post(`/tickets/${id}/comments`, { commentText }),
};

// User API
export const userAPI = {
  getAll: () => api.get('/users'),
  getSeniorOfficers: () => api.get('/users/senior-officers'),
  createSeniorOfficer: (data) => api.post('/users/senior-officer', data),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getNotifications: () => api.get('/dashboard/notifications'),
  markNotificationRead: (id) => api.put(`/dashboard/notifications/${id}/read`),
};

// Upload API
export const uploadAPI = {
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadAttachments: (ticketId, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('attachments', file));
    return api.post(`/upload/ticket/${ticketId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;