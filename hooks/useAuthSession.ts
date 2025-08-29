// import { loginApi, refreshTokenApi } from '@/api/auth.service';
// import { getExp, isExpSoon } from '@/utils/jwt';
// import { clearTokens } from '@/utils/storage';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useCallback, useRef, useState } from 'react';

// const ACCESS_KEY = 'accessToken';
// const REFRESH_KEY = 'refreshToken';

// export const useAuthSession = () => {
//   const [accessToken, setAccessToken] = useState<string|null>(null);
//   const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

//   const clearTimers = () => {
//     if (refreshTimer.current) { clearTimeout(refreshTimer.current); refreshTimer.current = null; }
//   };

//   const saveTokens = async (access: string, refresh: string) => {
//     await AsyncStorage.setItem(ACCESS_KEY, access);
//     await AsyncStorage.setItem(REFRESH_KEY, refresh);
//   };    

//   const login = async (email: string, password: string) => {
//     try {
//       const res = await loginApi({ email, password }); // ApiEnvelope<AuthTokens>

//       if (!res.isSuccess) throw new Error(res.message);
//       const { accessToken, refreshToken } = res.result;

//       await saveTokens(accessToken, refreshToken);

//       //const exp = getExp(accessToken);

//       return { ok: true };
//     } catch (e: any) {
//       return { ok: false, error: e?.message ?? "로그인 실패" };
//     }
//   };

//   const logout = useCallback(async () => {
//     try {
//       const refresh = await AsyncStorage.getItem('refreshToken');

//       clearTimers();
//       await clearTokens();
//       setAccessToken(null);

//       console.log("로그아웃 성공");

//     } catch (e) {
//       await clearTokens();
//       setAccessToken(null);
//       //router.replace('/auth/login');
//     }
//   }, []);

//   const ensureValidAccessToken = async (): Promise<string | null> => {
//     let token = await AsyncStorage.getItem("accessToken");
//     if (!token) return null;

//     if (isExpSoon(getExp(token))) {
//       const refresh = await AsyncStorage.getItem("refreshToken");
//       if (!refresh) return null;

//       try {
//         const res = await refreshTokenApi(refresh);
//         if (!res.isSuccess) return null;

//         const { accessToken, refreshToken } = res.result;

//         await AsyncStorage.setItem("accessToken", accessToken);
//         await AsyncStorage.setItem("refreshToken", refreshToken);

//         token = accessToken;
//       } catch (e) {
//         console.error("토큰 갱신 실패:", e);
//         return null;
//       }
//     }

//     return token;
//   };

//   return { accessToken, setAccessToken, login, logout, ensureValidAccessToken };
// };

// /hooks/useAuthSession.ts
import { loginApi, refreshTokenApi } from '@/api/auth.service';
import { getExp, isExpSoon } from '@/utils/jwt';
import { clearTokens } from '@/utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useRef, useState } from 'react';

const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

// 만료 몇 초 전에 미리 갱신할지(버퍼)
const REFRESH_SKEW_SEC = 30;

export const useAuthSession = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
    }
  };

  const saveTokens = async (access: string, refresh: string) => {
    // 순수 토큰 문자열만 저장 (Bearer 포함 X)
    await AsyncStorage.setItem(ACCESS_KEY, access);
    await AsyncStorage.setItem(REFRESH_KEY, refresh);
  };

  const scheduleRefresh = useCallback((access: string) => {
    clearTimers();
    const exp = getExp(access); // exp(초 단위 Unix epoch) 리턴한다고 가정
    if (!exp) return;

    const nowSec = Math.floor(Date.now() / 1000);
    const delayMs = Math.max((exp - nowSec - REFRESH_SKEW_SEC) * 1000, 0);

    refreshTimer.current = setTimeout(async () => {
      try {
        const refresh = await AsyncStorage.getItem(REFRESH_KEY);
        if (!refresh) throw new Error('no refresh token');

        const res = await refreshTokenApi(refresh);
        if (!res?.isSuccess) throw new Error(res?.message || 'refresh failed');

        const { accessToken: newAccess, refreshToken: newRefresh } = res.result;
        await saveTokens(newAccess, newRefresh);
        setAccessToken(newAccess);
        scheduleRefresh(newAccess); // 다음 갱신 예약
      } catch (err) {
        // 갱신 실패: 토큰 정리(앱 정책에 따라 바로 로그아웃해도 됨)
        console.error('토큰 자동갱신 실패:', err);
        await clearTokens();
        setAccessToken(null);
        clearTimers();
      }
    }, delayMs);
  }, []);

  // boolean 리턴으로 단순화 (UI 코드와 맞추기 쉬움)
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await loginApi({ email, password }); // ApiEnvelope<{accessToken, refreshToken}>
      if (!res.isSuccess) throw new Error(res.message);

      const { accessToken: access, refreshToken: refresh } = res.result;
      await saveTokens(access, refresh);
      setAccessToken(access);
      scheduleRefresh(access);
      return true;
    } catch (e) {
      console.error('로그인 실패:', e);
      await clearTokens();
      setAccessToken(null);
      clearTimers();
      return false;
    }
  }, [scheduleRefresh]);

  const logout = useCallback(async () => {
    try {
      clearTimers();
      await clearTokens(); // 내부에서 ACCESS_KEY/REFRESH_KEY 삭제한다고 가정
      setAccessToken(null);
      console.log('로그아웃 성공');
    } catch (e) {
      await clearTokens();
      setAccessToken(null);
    }
  }, []);

  // 화면 진입 시/호출 시 토큰 유효화 (만료 임박하면 갱신)
  const ensureValidAccessToken = useCallback(async (): Promise<string | null> => {
    let token = await AsyncStorage.getItem(ACCESS_KEY);
    if (!token) {
      setAccessToken(null);
      return null;
    }

    // exp 체크해서 임박 시 갱신
    if (isExpSoon(getExp(token), REFRESH_SKEW_SEC)) {
      const refresh = await AsyncStorage.getItem(REFRESH_KEY);
      if (!refresh) {
        await clearTokens();
        setAccessToken(null);
        return null;
      }
      try {
        const res = await refreshTokenApi(refresh);
        if (!res.isSuccess) throw new Error(res.message);

        const { accessToken: newAccess, refreshToken: newRefresh } = res.result;
        await saveTokens(newAccess, newRefresh);
        setAccessToken(newAccess);
        scheduleRefresh(newAccess);
        token = newAccess;
      } catch (e) {
        console.error('토큰 갱신 실패:', e);
        await clearTokens();
        setAccessToken(null);
        clearTimers();
        return null;
      }
    } else {
      // 아직 여유 있으면 스케줄은 존재하는지 보장
      setAccessToken(token);
      scheduleRefresh(token);
    }

    return token;
  }, [scheduleRefresh]);

  return { accessToken, setAccessToken, login, logout, ensureValidAccessToken };
};
