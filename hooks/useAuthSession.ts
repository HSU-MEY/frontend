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

  return { accessToken, setAccessToken, logout };
};
