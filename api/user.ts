// api/user.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserProfile = {
  id: number;
  nickname: string;
  email: string;
  role: 'USER' | 'ADMIN' | string;
};

type ApiEnvelope<T> = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
};

const BASE_URL = 'http://13.209.188.74:8080';

export async function getMyProfile(): Promise<UserProfile> {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) {
    throw new Error('토큰이 없습니다. 로그인해주세요.');
  }

  const res = await fetch(`${BASE_URL}/api/users/profiles`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // 반드시 Bearer 토큰 첨부
      'Authorization': `Bearer ${token}`,
    },
  });

  // 네트워크 레벨 에러
  if (!res.ok) {
    // 보통 401이면 토큰 만료(상위에서 ensureValidAccessToken로 갱신 시도 후 다시 호출)
    const text = await res.text().catch(() => '');
    throw new Error(text || `프로필 조회 실패 (HTTP ${res.status})`);
  }

  const data = (await res.json()) as ApiEnvelope<UserProfile>;

  if (!data.isSuccess || !data.result) {
    throw new Error(data.message || '프로필 조회 실패');
  }

  return data.result;
}
