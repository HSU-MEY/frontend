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
  address?: string | null;
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
