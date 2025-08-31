// @/api/auth.service.ts
import { apiPost, type ApiEnvelope } from '@/api/http';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  tokenType: string; // "Bearer"
};

export type Me = {
  id: string;
  email: string;
  nickname: string;
};

// 공백 정리 헬퍼
const trim = (s: string) => s.trim();

export async function loginApi(params: {
  email: string;
  password: string;
}): Promise<ApiEnvelope<AuthTokens>> {
  return apiPost<ApiEnvelope<AuthTokens>>(
    '/auth/login',
    { email: trim(params.email), password: trim(params.password) },
    'POST /auth/login'
  );
}

export async function refreshTokenApi(
  refreshToken: string
): Promise<ApiEnvelope<AuthTokens>> {
  return apiPost<ApiEnvelope<AuthTokens>>(
    '/auth/refresh',
    { refreshToken },
    'POST /auth/refresh'
  );
}

export async function signupApi(params: {
  email: string;
  password: string;
  nickname: string;
}): Promise<ApiEnvelope<{ userId: string }>> {
  return apiPost<ApiEnvelope<{ userId: string }>>(
    '/auth/signup',
    {
      email: trim(params.email),
      password: trim(params.password),
      nickname: trim(params.nickname),
    },
    'POST /auth/signup'
  );
}
