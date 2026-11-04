import axios from 'axios';

import { useAuthStore } from '@/store/auth.store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error(
    'API_BASE_URL is not defined. Please set the EXPO_PUBLIC_API_BASE_URL environment variable.'
  );
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Token vencido ou inválido: o AuthGuard do backend responde 403 (e 401 em alguns casos).
// Encerra a sessão para o usuário voltar ao login em vez de ficar preso em telas de erro.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthRoute = String(error.config?.url ?? '').startsWith('/auth/');
    const { token, logout } = useAuthStore.getState();

    if ((status === 401 || status === 403) && !isAuthRoute && token) {
      logout();
    }
    return Promise.reject(error);
  }
);

export default api;
