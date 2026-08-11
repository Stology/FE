import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';

import { useAuthStore } from '../stores/useAuthStore';
import type { ApiResponse } from './types';

interface AuthRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

interface ReissueResult {
  accessToken: string;
}

let reissuePromise: Promise<string> | null = null;

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

httpClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config as (InternalAxiosRequestConfig & AuthRequestConfig) | undefined;

    if (
      error.response?.status !== 401 ||
      !request ||
      request._retry ||
      isReissueRequest(request.url)
    ) {
      return Promise.reject(error);
    }

    request._retry = true;

    try {
      const accessToken = await getReissuedAccessToken();
      useAuthStore.setState({ accessToken, isAuthenticated: true, isInitialized: true });
      request.headers.Authorization = `Bearer ${accessToken}`;
      return httpClient(request);
    } catch (reissueError) {
      useAuthStore.setState({ accessToken: null, isAuthenticated: false, isInitialized: true });
      return Promise.reject(reissueError);
    }
  },
);

function isReissueRequest(url?: string) {
  return url?.includes('/api/auth/reissue') === true;
}

function getReissuedAccessToken() {
  if (!reissuePromise) {
    reissuePromise = requestNewAccessToken().finally(() => {
      reissuePromise = null;
    });
  }

  return reissuePromise;
}

async function requestNewAccessToken() {
  const config: AuthRequestConfig = { _retry: true };
  const response = await httpClient.post<ApiResponse<ReissueResult>>(
    '/api/auth/reissue',
    undefined,
    config,
  );
  return response.data.result.accessToken;
}
