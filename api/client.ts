// /api/client.ts
import { clearTokens, getAccess, getRefresh, setTokens } from '@/utils/storage';
import axios, { AxiosError, AxiosHeaders, AxiosRequestConfig } from 'axios';
import { ROUTES } from './routes';

const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  timeout: 15000,
});

const isAuthPath = (url?: string) =>
  !!url &&
  (url.includes(ROUTES.auth.login) ||
    url.includes(ROUTES.auth.signup) ||
    url.includes(ROUTES.auth.refresh));

/** headers를 AxiosHeaders 형태로 보장하고 key/value를 설정 */
function ensureHeaders(config: any) {
  if (!config.headers) {
    config.headers = new AxiosHeaders();
  } else if (!(config.headers instanceof AxiosHeaders)) {
    // 기존 객체를 AxiosHeaders로 감싸기
    config.headers = AxiosHeaders.from(config.headers);
  }
  return config.headers as AxiosHeaders;
}

client.interceptors.request.use(async (config) => {
  const headers = ensureHeaders(config);
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');

  // ★ auth 경로는 토큰 미첨부
  if (!isAuthPath(config.url)) {
    const token = await getAccess();
    if (token) headers.set('Authorization', `Bearer ${token}`);
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
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

    // config 없음 또는 auth 경로에 대한 에러 → 그대로 리턴 (refresh 금지)
    if (!original || isAuthPath(original.url)) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push([
            (newAccess) => {
              const hdrs = ensureHeaders(original);
              if (newAccess) hdrs.set('Authorization', `Bearer ${newAccess}`);
              resolve(client(original));
            },
            reject,
          ]);
        });
      }

      try {
        isRefreshing = true;
        const refreshToken = await getRefresh();
        if (!refreshToken) {
          await clearTokens();
          return Promise.reject(error);
        }

        // refresh는 기본 axios로 (인터셉터 영향 최소화)
        const resp = await axios.post(
          `${process.env.EXPO_PUBLIC_API_BASE_URL}${ROUTES.auth.refresh}`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json', Accept: 'application/json' } }
        );

        const data: any = resp.data;
        const newAccess = data?.accessToken ?? data?.result?.accessToken;
        const newRefresh = data?.refreshToken ?? data?.result?.refreshToken;

        if (!newAccess) {
          await clearTokens();
          flushQueue(new Error('Failed to refresh access token'), null);
          return Promise.reject(error);
        }

        await setTokens(newAccess, newRefresh);
        flushQueue(null, newAccess);

        const hdrs = ensureHeaders(original);
        hdrs.set('Authorization', `Bearer ${newAccess}`);
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
