// src/api/users.service.ts
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// ===== 공통 타입 =====
export type ApiEnvelope<T> = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
};

export type OpeningHours = Record<string, string>

// Routes 타입
export type SavedRoutes = {
  savedRoutes: Route[];
};

export type Route = {
  savedRouteId: number;
  routeId: number;
  title: string;
  description: string;
  totalDurationMinutes: number;
  preferredStartDate: string;
  preferredStartTime: string;
  isPastDate: boolean;
  daysUntilTrip: number;
  savedAt: string; // 저장된 날짜 (ISO 8601)
}

// ===== 내부 유틸 =====
const jsonHeaders = (token?: string): HeadersInit => {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
};

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, init);
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // JSON이 아니면 그대로 던짐
  }

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error || data.msg)) ||
      `HTTP ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return data as T;
}
  
// ===== 엔드포인트 =====
// 유저가 저장한 Routes 조회
export async function getUserRoutes(
  status?: string
): Promise<ApiEnvelope<SavedRoutes>> {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return fetchJson<ApiEnvelope<SavedRoutes>>(`/users/my-routes${query}`);
}

