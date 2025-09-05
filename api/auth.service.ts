// @/api/auth.service.ts
import { apiPost, type ApiEnvelope } from '@/api/http';
import { ROUTES } from './routes';

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
    ROUTES.auth.login,
    { email: trim(params.email), password: trim(params.password) },
    'POST /auth/login'
  );
}

export async function refreshTokenApi(
  refreshToken: string
): Promise<ApiEnvelope<AuthTokens>> {
  return apiPost<ApiEnvelope<AuthTokens>>(
    ROUTES.auth.refresh + `?refreshToken=${encodeURIComponent(refreshToken)}`,
    'POST /auth/refresh'
  );
}

export async function signupApi(params: {
  email: string;
  password: string;
  nickname: string;
}): Promise<ApiEnvelope<{ userId: string }>> {
  return apiPost<ApiEnvelope<{ userId: string }>>(
    ROUTES.auth.signup,
    {
      email: trim(params.email),
      password: trim(params.password),
      nickname: trim(params.nickname),
    },
    'POST /auth/signup'
  );
}
