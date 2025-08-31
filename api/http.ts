// src/api/http.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const RAW_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://13.209.188.74:8080/api';

// .env에 /api가 이미 포함되어 있다는 전제 유지
// - 끝 슬래시 제거
const API_BASE = RAW_BASE.replace(/\/+$/, '');

// path와 깔끔히 합치기 (이중 /, /api/api 방지)
const joinUrl = (base: string, path: string) => {
  const b = base.replace(/\/+$/, '');
  const p = path.replace(/^\/+/, '');
  return `${b}/${p}`;
};

// 공통 fetch (Bearer 자동 첨부, ApiEnvelope 파싱)
export type ApiEnvelope<T> = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
};

async function withAuth(init: RequestInit = {}): Promise<RequestInit> {
  const token = await AsyncStorage.getItem('accessToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as any),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return { ...init, headers };
}

export async function apiFetch<T = any>(
  path: string,
  init?: RequestInit,
  tag?: string
): Promise<T> {
  const url = joinUrl(API_BASE, path); // path는 'users/profiles' 또는 '/users/profiles' 둘 다 OK
  const req = await withAuth(init);

  const res = await fetch(url, req);
  const raw = await res.text().catch(() => '');

  if (__DEV__) {
    console.log(`[${tag ?? path}] ${res.status} ${res.statusText}`);
    if (raw) console.log(`[${tag ?? path}] raw:`, raw.slice(0, 800));
  }

  let data: any = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { /* not json */ }

  if (!res.ok) {
    const msg = data?.message || data?.error || raw || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  // 서버가 ApiEnvelope 형태일 수도/아닐 수도 있으니 제네릭 그대로 반환
  return (data as T) ?? ({} as T);
}

export const apiGet  = <T = any>(path: string, tag?: string) =>
  apiFetch<T>(path, { method: 'GET' }, tag);

export const apiPost = <T = any>(path: string, body?: any, tag?: string) =>
  apiFetch<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }, tag);

export const apiPut  = <T = any>(path: string, body?: any, tag?: string) =>
  apiFetch<T>(path, { method: 'PUT',  body: body ? JSON.stringify(body) : undefined }, tag);

export const apiDelete = <T = any>(path: string, tag?: string) =>
  apiFetch<T>(path, { method: 'DELETE' }, tag);
