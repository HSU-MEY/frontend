import { refreshTokenApi } from '@/api/auth.service';
import { getExp, isExpSoon } from '@/utils/jwt';
import { clearTokens } from '@/utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePathname, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

export const useAuthSession = () => {
  const [accessToken, setAccessToken] = useState<string|null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const clearTimers = () => {
    if (refreshTimer.current) { clearTimeout(refreshTimer.current); refreshTimer.current = null; }
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
    let token = await AsyncStorage.getItem("accessToken");
    if (!token) return null;

    if (isExpSoon(getExp(token))) {
      const refresh = await AsyncStorage.getItem("refreshToken");
      if (!refresh) return null;

      try {
        const res = await refreshTokenApi(refresh);
        if (!res.isSuccess) return null;

        const { accessToken, refreshToken } = res.result;

        await AsyncStorage.setItem("accessToken", accessToken);
        await AsyncStorage.setItem("refreshToken", refreshToken);

        token = accessToken;
      } catch (e) {
        console.error("토큰 갱신 실패:", e);
        return null;
      }
    }

    return token;
  };

  return { accessToken, setAccessToken, logout, ensureValidAccessToken };
};
