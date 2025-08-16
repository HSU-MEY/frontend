// src/api/auth.service.ts

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://13.209.188.74:8080/api";

// ===== 공통 타입 =====
export type ApiEnvelope<T> = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
};

// 로그인/리프레시 공용 결과 타입
export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  tokenType: string; // Bearer
};

// 사용자 정보 타입
export type Me = {
  id: string;
  email: string;
  nickname: string;
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

// 로그인
export async function loginApi(params: {
  email: string;
  password: string;
}): Promise<ApiEnvelope<AuthTokens>> {
  return fetchJson<ApiEnvelope<AuthTokens>>("/auth/login", {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(params),
  });
}

// 리프레시
export async function refreshTokenApi(
  refreshToken: string
): Promise<ApiEnvelope<AuthTokens>> {
  return fetchJson<ApiEnvelope<AuthTokens>>("/auth/refresh", {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ refreshToken }),
  });
}

// 로그아웃
// export async function logoutApi(refreshToken: string): Promise<ApiEnvelope<null>> {
//   return fetchJson<ApiEnvelope<null>>("/auth/logout", {
//     method: "POST",
//     headers: jsonHeaders(),
//     body: JSON.stringify({ refreshToken }),
//   });
// }

// 현재 유저 조회
// export async function meApi(accessToken: string): Promise<ApiEnvelope<Me>> {
//   return fetchJson<ApiEnvelope<Me>>("/me", {
//     method: "GET",
//     headers: jsonHeaders(accessToken),
//   });
// }

// 회원가입
export async function signupApi(params: {
  email: string;
  password: string;
  nickname: string;
}): Promise<ApiEnvelope<{ userId: string }>> {
  return fetchJson<ApiEnvelope<{ userId: string }>>("/auth/signup", {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(params),
  });
}
