// src/api/http.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const RAW_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://13.209.188.74:8080/api';
const API_BASE = RAW_BASE.replace(/\/+$/, '');

const joinUrl = (base: string, path: string) => {
  const b = base.replace(/\/+$/, '');
  const p = path.replace(/^\/+/, '');
  return `${b}/${p}`;
};

export type ApiEnvelope<T> = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
};

const isFormDataBody = (init?: RequestInit) =>
  typeof FormData !== 'undefined' && !!init?.body && init.body instanceof FormData;

async function withAuth(init: RequestInit = {}): Promise<RequestInit> {
  const token = await AsyncStorage.getItem('accessToken');

  // 기존 헤더 복사
  const headers: Record<string, string> = { ...(init.headers as any) };

  // ★ FormData면 Content-Type을 설정하지 않는다(브라우저/네이티브가 boundary 포함해서 자동 세팅)
  if (isFormDataBody(init)) {
    delete headers['Content-Type'];
  } else if (!headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) headers.Authorization = `Bearer ${token}`;
  return { ...init, headers };
}

export async function apiFetch<T = any>(
  path: string,
  init?: RequestInit,
  tag?: string
): Promise<T> {
  const url = joinUrl(API_BASE, path);
  const req = await withAuth(init);

  const res = await fetch(url, req);
  const raw = await res.text().catch(() => '');

  if (__DEV__) {
    console.log(`[${tag ?? path}] ${res.status} ${res.statusText}`);
    if (raw) console.log(`[${tag ?? path}] raw:`, raw.slice(0, 800));
  }

  let data: any = null;
  try { data = raw ? JSON.parse(raw) : null; } catch {}

  if (!res.ok) {
    const msg = data?.message || data?.error || raw || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return (data as T) ?? ({} as T);
}

// JSON 전송용
export const apiGet   = <T = any>(path: string, tag?: string) =>
  apiFetch<T>(path, { method: 'GET' }, tag);

export const apiPost  = <T = any>(path: string, body?: any, tag?: string) =>
  apiFetch<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }, tag);

export const apiPut   = <T = any>(path: string, body?: any, tag?: string) =>
  apiFetch<T>(path, { method: 'PUT',  body: body ? JSON.stringify(body) : undefined }, tag);

export const apiDelete = <T = any>(path: string, tag?: string) =>
  apiFetch<T>(path, { method: 'DELETE' }, tag);

// ★ multipart 전송용(새로 추가)
export const apiPostMultipart = <T = any>(path: string, form: FormData, tag?: string) =>
  apiFetch<T>(path, { method: 'POST', body: form }, tag);

export const apiPutMultipart  = <T = any>(path: string, form: FormData, tag?: string) =>
  apiFetch<T>(path, { method: 'PUT',  body: form }, tag);
