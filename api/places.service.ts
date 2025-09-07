// /api/places.service.ts
import client from './client';
import { ROUTES } from './routes';

export type PopularPlaceDTO = {
  id: number;
  regionId: number;
  nameKo: string;
  nameEn: string;
  descriptionKo: string | null;
  descriptionEn: string | null;
  longitude: number;
  latitude: number;
  imageUrl: string | null;
  address: string | null;
  contactInfo: string | null;
  websiteUrl: string | null;
  kakaoPlaceId: string | null;
  tourApiPlaceId: string | null;
  openingHours: string | null;
  themes: string | null;
  costInfo: string | null;
};

export const fetchPopularPlaces = async (): Promise<PopularPlaceDTO[]> => {
  const { data } = await client.get<PopularPlaceDTO[]>(ROUTES.places.popular);
  return data;
};
