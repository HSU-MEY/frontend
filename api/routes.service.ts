// src/api/routes.service.ts
import { getAccess } from "@/utils/storage";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// ===== 공통 타입 =====
export type ApiEnvelope<T> = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
};

export type OpeningHours = Record<string, string>

// 장소 타입
export type Place = {
  placeId: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  imageUrls: string[];
  openingHours: OpeningHours;
}

export type RoutePlace = {
  sequenceOrder: number;
  place: Place;
  recommendedDurationMinutes: number;
  estimatedArrivalTime: string;
  estimatedDepartureTime: string;
  notes: string;
}

// 1개 루트 조회 결과 타입
export type Routes = {
  routeId: number;
  title: string;
  description: string;
  theme: string;
  totalDistanceKm: number;
  totalDurationMinutes: number;
  estimatedCost: number;
  imageUrl: string;
  popularityScore?: number;
  suggestedStartTimes: string[];
  routePlaces: RoutePlace[];
  regionNameKo?: string;
  regionNameEn?: string;
};

export type RecommendedRoutes = {
  routes: Routes[];
}

// 루트 생성 요청 타입
export type CreateRouteRequest = {
  regionId: number;
  titleKo: string;
  titleEn: string;
  descriptionKo: string;
  descriptionEn: string;
  imageUrl: string;
  cost: number;
  totalDurationMinutes: number;
  totalDistance: number;
  themes: string[];
  routeType: string;
};

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
// 특정 Route 조회
export async function getRouteApi(
  routeId: number
): Promise<ApiEnvelope<Routes>> {
  return fetchJson<ApiEnvelope<Routes>>(
    `/routes/${routeId}`, {
    method: "GET",
    headers: jsonHeaders(await getAccess() || undefined),
  });
}

// 추천 Route 조회
export async function getRecommendRouteApi(
  themes?: string[],  //KPOP, KDRAMA, KFASHION, KFOOD
  region?: string,
  limit: number = 10,
  offset: number = 0
): Promise<ApiEnvelope<RecommendedRoutes>> {
  const params = new URLSearchParams();
  if (themes && themes.length > 0) params.append("themes", themes.join(","));
  if (region) params.append("region", region);
  params.append("limit", String(limit));
  params.append("offset", String(offset));

  return fetchJson<ApiEnvelope<RecommendedRoutes>>(
    `/routes/recommend` + `?${params.toString()}`,
    {
    method: "GET",
    headers: jsonHeaders(await getAccess() || undefined),
  });
}

// Route 생성(TEST ONLY)
export async function createRouteApi(
  routeData: CreateRouteRequest
): Promise<ApiEnvelope<Routes>> {
  return fetchJson<ApiEnvelope<Routes>>(`/routes`, {
    method: "POST",
    headers: jsonHeaders(await getAccess() || undefined),
    body: JSON.stringify(routeData),
  });
}