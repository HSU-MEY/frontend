// // src/lib/http.ts
// import { API_BASE_URL } from '@/src/env';
// import { getExp, isExpSoon } from '@/utils/jwt';
// import { clearTokens, getAccess, getRefresh, setTokens } from '@/utils/storage';
// import axios, {
//   AxiosError,
//   AxiosRequestConfig,
//   AxiosResponse,
//   InternalAxiosRequestConfig,
// } from 'axios';

// console.log('API_BASE_URL:', API_BASE_URL); // http://13.209.188.74:8080/api

// export const http = axios.create({
//   baseURL: API_BASE_URL, // ex) http://13.209.188.74:8080/api
//   withCredentials: false,
// });

// // 요청: 액세스 토큰 자동 첨부 (선제 리프레시 옵션 포함)
// let refreshingPromise: Promise<string | null> | null = null;

// http.interceptors.request.use(async (config) => {
//   let at = await getAccess();

//   // (옵션) 만료 임박이면 선제 리프레시
//   const exp = getExp(at ?? undefined);
//   if (!refreshingPromise && isExpSoon(exp, 60)) {
//     refreshingPromise = reissueAccessToken().finally(() => { refreshingPromise = null; });
//     const newAT = await refreshingPromise;
//     if (newAT) at = newAT;
//   }

//   if (at) {
//     config.headers = config.headers ?? {};
//     (config.headers as any).Authorization = `Bearer ${at}`;
//   }
//   return config;
// });

// let isRefreshing = false;
// let waiters: Array<(t: string | null) => void> = [];
// const notify = (t: string | null) => { waiters.forEach(w => w(t)); waiters = []; };

// // 응답: 401이면 한 번만 리프레시 후 재시도
// http.interceptors.response.use(
//   (res) => res,
//   async (error: AxiosError) => {
//     const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

//     if (error.response?.status === 401 && original && !original._retry) {
//       original._retry = true;

//       if (isRefreshing) {
//         const newAT = await new Promise<string | null>(resolve => waiters.push(resolve));
//         if (newAT) {
//           original.headers = original.headers ?? {};
//           (original.headers as any).Authorization = `Bearer ${newAT}`;
//           return http(original);
//         }
//         throw error;
//       }

//       isRefreshing = true;
//       try {
//         const newAT = await reissueAccessToken();
//         notify(newAT);
//         if (newAT) {
//           original.headers = original.headers ?? {};
//           (original.headers as any).Authorization = `Bearer ${newAT}`;
//           return http(original);
//         }
//         throw error;
//       } catch (e) {
//         notify(null);
//         await clearTokens();
//         throw e;
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     throw error;
//   }
// );

// // ⬇️ 서버 스펙에 맞게 경로/응답 필드명 수정
// async function reissueAccessToken(): Promise<string | null> {
//   const rt = await getRefresh();
//   if (!rt) return null;

//   // 예시: POST /auth/refresh { refreshToken }
//   const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken: rt });
//   const newAT: string | undefined = res.data?.result?.accessToken || res.data?.accessToken;
//   const newRT: string | undefined = res.data?.result?.refreshToken || res.data?.refreshToken;
//   if (newAT) await setTokens(newAT, newRT);
//   return newAT ?? null;
// }

// src/lib/http.ts
import { API_BASE_URL } from '@/src/env';
import { getExp, isExpSoon } from '@/utils/jwt';
import { clearTokens, getAccess, getRefresh, setTokens } from '@/utils/storage';
import axios, {
    AxiosError,
    AxiosRequestConfig,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios';

console.log('API_BASE_URL:', API_BASE_URL); // 예: http://13.209.188.74:8080/api

export const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

// ===== 요청 인터셉터: 액세스 토큰 자동 첨부 (+선제 리프레시)
let refreshingPromise: Promise<string | null> | null = null;

http.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let at = await getAccess();

    // 만료 임박이면 선제 리프레시(옵션)
    const exp = getExp(at ?? undefined);
    if (!refreshingPromise && isExpSoon(exp, 60)) {
      refreshingPromise = reissueAccessToken().finally(() => {
        refreshingPromise = null;
      });
      const newAT = await refreshingPromise;
      if (newAT) at = newAT;
    }

    if (at) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${at}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ===== 응답 인터셉터: 401이면 1회만 리프레시 후 재시도
let isRefreshing = false;
let waiters: Array<(t: string | null) => void> = [];
const notify = (t: string | null) => {
  waiters.forEach((w) => w(t));
  waiters = [];
};

http.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;

      // 이미 다른 요청이 갱신 중이면 대기
      if (isRefreshing) {
        const newAT = await new Promise<string | null>((resolve) => waiters.push(resolve));
        if (newAT) {
          original.headers = original.headers ?? {};
          (original.headers as any).Authorization = `Bearer ${newAT}`;
          return http(original as AxiosRequestConfig); // 재시도
        }
        throw error;
      }

      isRefreshing = true;
      try {
        const newAT = await reissueAccessToken();
        notify(newAT);
        if (newAT) {
          original.headers = original.headers ?? {};
          (original.headers as any).Authorization = `Bearer ${newAT}`;
          return http(original as AxiosRequestConfig);
        }
        throw error; // 갱신 실패
      } catch (e) {
        notify(null);
        await clearTokens();
        throw e;
      } finally {
        isRefreshing = false;
      }
    }

    throw error;
  }
);

// ===== 리프레시 토큰으로 재발급 (백엔드 스펙에 맞게 경로/필드만 확인)
type RefreshResponse = {
  result?: { accessToken?: string; refreshToken?: string };
  accessToken?: string;
  refreshToken?: string;
};

async function reissueAccessToken(): Promise<string | null> {
  const rt = await getRefresh();
  if (!rt) return null;

  // 예: POST /auth/refresh { refreshToken }
  const res: AxiosResponse<RefreshResponse> = await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    { refreshToken: rt }
  );

  const newAT = res.data.result?.accessToken ?? res.data.accessToken;
  const newRT = res.data.result?.refreshToken ?? res.data.refreshToken;
  if (newAT) await setTokens(newAT, newRT);
  return newAT ?? null;
}
