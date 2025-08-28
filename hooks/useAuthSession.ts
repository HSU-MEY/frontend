import { loginApi, refreshTokenApi } from '@/api/auth.service';
import { getExp, isExpSoon } from '@/utils/jwt';
import { clearTokens } from '@/utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useRef, useState } from 'react';

const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

export const useAuthSession = () => {
  const [accessToken, setAccessToken] = useState<string|null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (refreshTimer.current) { clearTimeout(refreshTimer.current); refreshTimer.current = null; }
  };

  const saveTokens = async (access: string, refresh: string) => {
    await AsyncStorage.setItem(ACCESS_KEY, access);
    await AsyncStorage.setItem(REFRESH_KEY, refresh);
  };    

  const login = async (email: string, password: string) => {
    try {
      const res = await loginApi({ email, password }); // ApiEnvelope<AuthTokens>

      if (!res.isSuccess) throw new Error(res.message);
      const { accessToken, refreshToken } = res.result;

      await saveTokens(accessToken, refreshToken);

      //const exp = getExp(accessToken);

      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? "로그인 실패" };
    }
  };

  const logout = useCallback(async () => {
    try {
      const refresh = await AsyncStorage.getItem('refreshToken');

      clearTimers();
      await clearTokens();
      setAccessToken(null);

      console.log("로그아웃 성공");
      
    } catch (e) {
      await clearTokens();
      setAccessToken(null);
      //router.replace('/auth/login');
    }
  }, []);

  const ensureValidAccessToken = async (): Promise<string | null> => {
    let token = await AsyncStorage.getItem(ACCESS_KEY);
    if (!token) return null;

    if (isExpSoon(getExp(token))) {
      const refresh = await AsyncStorage.getItem(REFRESH_KEY);
      if (!refresh) return null;

      try {
        const res = await refreshTokenApi(refresh);
        if (!res.isSuccess) return null;

        const { accessToken, refreshToken } = res.result;

        await AsyncStorage.setItem(ACCESS_KEY, accessToken);
        await AsyncStorage.setItem(REFRESH_KEY, refreshToken);

        token = accessToken;
      } catch (e) {
        console.error("토큰 갱신 실패:", e);
        return null;
      }
    }

    return token;
  };

  return { accessToken, setAccessToken, login, logout, ensureValidAccessToken };
};
