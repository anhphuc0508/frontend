// src/lib/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backend-c9mb.onrender.com',
  withCredentials: false,
});

// GỬI TOKEN TRONG MỌI REQUEST
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
    console.log('Gửi token:', token.substring(0, 20) + '...'); // DEBUG
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;