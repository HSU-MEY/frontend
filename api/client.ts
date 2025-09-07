import { clearTokens, getAccess, getRefresh, setTokens } from '@/utils/storage';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

import { ROUTES } from './routes';

const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  timeout: 15000,
});

client.interceptors.request.use(async (config) => {
  const token = await getAccess();   // getAccessToken → getAccess
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<[(v?: unknown) => void, (r?: unknown) => void]> = [];

const flushQueue = (error: unknown, token: string | null) => {
  pendingQueue.forEach(([resolve, reject]) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
};

client.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push([
            (token) => {
              if (!original.headers) original.headers = {};
              if (token) original.headers.Authorization = `Bearer ${token}`;
              resolve(client(original));
            },
            reject,
          ]);
        });
      }

      try {
        isRefreshing = true;
        const refreshToken = await getRefresh();  // getRefreshToken → getRefresh
        if (!refreshToken) {
          await clearTokens();
          return Promise.reject(error);
        }

        const resp = await axios.post(
          `${process.env.EXPO_PUBLIC_API_BASE_URL}${ROUTES.auth.refresh}`,
          { refreshToken }
        );

        const { accessToken: newAccess, refreshToken: newRefresh } = resp.data?.result ?? resp.data;
        await setTokens(newAccess, newRefresh); // saveTokens → setTokens

        flushQueue(null, newAccess);

        if (!original.headers) original.headers = {};
        original.headers.Authorization = `Bearer ${newAccess}`;
        return client(original);
      } catch (e) {
        flushQueue(e, null);
        await clearTokens();
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default client;
