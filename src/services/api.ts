import axios from 'axios';

export const AUTH_UNAUTHORIZED_EVENT = 'coopers:auth-unauthorized';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  headers: { 'Content-Type': 'application/json' },
});

/* Injeta Bearer token em todas as requisições autenticadas */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const hasStoredToken = typeof window !== 'undefined' && Boolean(window.localStorage.getItem('token'));

    if (error.response?.status === 401 && hasStoredToken) {
      window.localStorage.removeItem('token');
      window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
    }

    return Promise.reject(error);
  },
);
