import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) { logout }
    return Promise.reject(err);
  }
);
// Build full URL for uploaded images (relative /uploads/... → http://localhost:5000/uploads/...)
export const imageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;        // already absolute
  if (path.startsWith('data:')) return path;       // legacy base64
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
  return `${base}${path}`;
};

export default api;