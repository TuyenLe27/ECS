import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

// Gắn token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ecs_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Xử lý lỗi 401 (token hết hạn) — chỉ redirect khi server thực sự trả 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Chỉ xử lý 401 khi có response thật từ server (không phải network error)
    if (error.response?.status === 401) {
      // Không redirect nếu đang ở trang login rồi
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('ecs_token');
        localStorage.removeItem('ecs_user');
        window.location.href = '/login';
      }
    }
    // Network error (ECONNREFUSED, timeout, etc.) — KHÔNG redirect, chỉ reject
    return Promise.reject(error);
  }
);

export default api;
