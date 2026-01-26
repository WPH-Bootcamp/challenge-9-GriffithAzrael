// src/services/api/axios.ts
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL) {
  console.warn(
    'VITE_API_BASE_URL is not defined. Please set it in your .env file.',
  );
}

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject Authorization header dari localStorage (dinamis)
// dan JANGAN kirim untuk endpoint /auth/login & /auth/register
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');

    const url = config.url ?? '';
    const isAuthEndpoint =
      url.startsWith('/auth/login') || url.startsWith('/auth/register');

    if (token && config.headers && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default api;