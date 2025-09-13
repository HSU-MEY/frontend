// /api/places.service.ts
import client from './client';
import { ROUTES } from './routes';

export type PopularPlaceDTO = {
  id: number;
  regionId?: number;
  nameKo?: string;
  nameEn?: string;
  descriptionKo?: string;
  descriptionEn?: string;
  longitude?: number;
  latitude?: number;
  imageUrl?: string | null;
  address?: string | null; // (하위 호환)
  contactInfo?: string | null;
  websiteUrl?: string | null;
  kakaoPlaceId?: string | null;
  tourApiPlaceId?: string | null;
  openingHours?: any;
  themes?: any;
  costInfo?: string | null;
};

export type SearchPlaceDTO = {
  id: number;
  nameKo?: string;
  nameEn?: string;
  longitude: number;
  latitude: number;
  regionId?: number;
};

export type PlaceDetailDTO = {
  id: number;
  regionId?: number;

  // ---- 이름(4개 언어) ----
  nameKo?: string;
  nameEn?: string;
  nameJp?: string;
  nameCh?: string;

  // ---- 설명(4개 언어) ----
  descriptionKo?: string | null;
  descriptionEn?: string | null;
  descriptionJp?: string | null;
  descriptionCh?: string | null;

  // ---- 좌표/이미지 ----
  longitude?: number | null;
  latitude?: number | null;
  imageUrl?: string | null;

  // ---- 주소(4개 언어) + 하위 호환 ----
  addressKo?: string | null;
  addressEn?: string | null;
  addressJp?: string | null;
  addressCh?: string | null;
  address?: string | null;

  // ---- 기타 ----
  contactInfo?: string | null;
  websiteUrl?: string | null;
  kakaoPlaceId?: string | null;
  tourApiPlaceId?: string | null;
  openingHours?: any;
  themes?: any;
  costInfo?: string | null;
};

export type RelatedPlaceDTO = {
  title: string;
  address: string;
  tel?: string;
  firstImage?: string | null;
  contentTypeName: string; // 예: "음식점", "문화시설"
  distance: number;        // (m)
};

function normalizeApiLang(lang: string): 'ko' | 'en' | 'ja' | 'zh' {
  const l = (lang || 'ko').toLowerCase();
  if (l.startsWith('ko')) return 'ko';
  if (l.startsWith('en')) return 'en';
  if (l.startsWith('ja')) return 'ja';
  if (l.startsWith('zh')) return 'zh';
  return 'ko';
}

export async function fetchRelatedPlaces(
  placeId: number,
  language: 'ko' | 'en' | 'ja' | 'zh',   // ← 소문자 코드만 받음
  limit?: number,
  signal?: AbortSignal
) {
  const apiLang = normalizeApiLang(language); // ← en-US → en 같은 정규화
  const { data } = await client.get<RelatedPlaceDTO[]>(
    `${ROUTES.places.byId}/${placeId}/related/${apiLang}`, // ← /api/places/1/related/en 형태
    { params: limit ? { limit } : undefined, signal }
  );
  return data;
}

export async function fetchPopularPlaces(limit?: number) {
  const { data } = await client.get<PopularPlaceDTO[]>(
    ROUTES.places.popular,
    { params: limit ? { limit } : undefined }
  );
  return data;
}

export async function searchPlaces(keyword: string, limit?: number, signal?: AbortSignal) {
  const { data } = await client.get<SearchPlaceDTO[]>(
    ROUTES.places.search,
    { params: { keyword, ...(limit ? { limit } : {}) }, signal }
  );
  return data;
}

export async function fetchPlaceDetail(placeId: number) {
  const { data } = await client.get<PlaceDetailDTO>(`${ROUTES.places.byId}/${placeId}`);
  return data;
}

export async function fetchThemePlaces(keyword: string, limit?: number, signal?: AbortSignal) {
  const { data } = await client.get<PopularPlaceDTO[]>(
    ROUTES.places.theme,
    { params: { keyword, ...(limit ? { limit } : {}) }, signal }
  );
  return data;
}
