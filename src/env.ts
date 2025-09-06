// src/env.ts
import Constants from 'expo-constants';

type Extra = {
  API_BASE_URL?: string;
  KAKAO_JS_API_KEY?: string;
  KAKAO_NATIVE_API_KEY?: string;
  OPEN_WEATHER_API_KEY?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

export const API_BASE_URL = extra.API_BASE_URL ?? '';
export const KAKAO_JS_API_KEY = extra.KAKAO_JS_API_KEY ?? '';
export const KAKAO_NATIVE_API_KEY = extra.KAKAO_NATIVE_API_KEY ?? '';
export const OPEN_WEATHER_API_KEY = extra.OPEN_WEATHER_API_KEY ?? '';
