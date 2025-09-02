// api/user.ts
import { apiGet, type ApiEnvelope } from '@/api/http';
import { ROUTES } from './routes';

export type UserProfile = {
  id: number;
  nickname: string;
  email: string;
  role: 'USER' | 'ADMIN' | string;
};

/**
 * 프로필 조회
 * - 토큰/URL은 공통 http 유틸이 처리합니다.
 * - 호출 전 화면/훅에서 반드시 ensureValidAccessToken()을 한 번 await 해주세요.
 */
export async function getMyProfile(): Promise<UserProfile> {
  const data = await apiGet<ApiEnvelope<UserProfile>>(
    ROUTES.users.profile,
    'GET /users/profiles'
  );

  if (!data?.isSuccess || !data?.result) {
    throw new Error(data?.message || '프로필 조회 실패');
  }
  return data.result;
}

/**
 * (옵션) 토큰을 외부에서 보장해 주입하고 싶다면 이 버전도 쓸 수 있어요.
 * 공통 http 유틸을 그대로 쓰는 구조를 권장하지만, 필요 시 주석 해제해서 사용하세요.
 */
// export async function getMyProfileWithToken(token: string): Promise<UserProfile> {
//   const data = await apiGet<ApiEnvelope<UserProfile>>('/users/profiles', 'GET /users/profiles');
//   if (!data?.isSuccess || !data?.result) throw new Error(data?.message || '프로필 조회 실패');
//   return data.result;
// }
