// hooks/useAuthSession.ts
import { loginApi, refreshTokenApi } from '@/api/auth.service';
import { getExp, isExpSoon } from '@/utils/jwt';
import { clearTokens, getAccess, getRefresh, setTokens } from '@/utils/storage';
import { useCallback, useRef, useState } from 'react';

// 만료 몇 초 전에 미리 갱신(버퍼)
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

  const scheduleRefresh = useCallback((access: string) => {
    clearTimers();
    const exp = getExp(access); // exp(초) 반환 가정
    if (!exp) return;

    const nowSec = Math.floor(Date.now() / 1000);
    const delayMs = Math.max((exp - nowSec - REFRESH_SKEW_SEC) * 1000, 0);

    refreshTimer.current = setTimeout(async () => {
      try {
        const refresh = await getRefresh();
        if (!refresh) throw new Error('no refresh token');

        const res = await refreshTokenApi(refresh);
        const data: any = res; // auth.service가 반환하는 값을 일괄 수용
        const ok = data?.isSuccess ?? true; // 래핑 없으면 true로 간주
        const payload = data?.result ?? data;

        if (!ok) throw new Error(data?.message || 'refresh failed');

        const newAccess = payload?.accessToken;
        const newRefresh = payload?.refreshToken;

        if (!newAccess) throw new Error('no accessToken in refresh response');

        await setTokens(newAccess, newRefresh);
        setAccessToken(newAccess);
        scheduleRefresh(newAccess); // 다음 갱신 예약
      } catch (err) {
        console.error('토큰 자동갱신 실패:', err);
        await clearTokens();
        setAccessToken(null);
        clearTimers();
      }
    }, delayMs);
  }, []);

  /** boolean 리턴으로 단순화 (UI 입장 편의) */
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      // 안전하게 정규화 (상위에서 했더라도 이중 방어)
      const payload = { email: email.trim().toLowerCase(), password };

      const res = await loginApi(payload); // auth.service가 axios 호출
      const data: any = res;
      const ok = data?.isSuccess ?? true;
      const body = data?.result ?? data;

      if (!ok) throw new Error(data?.message || 'login failed');

      const access = body?.accessToken;
      const refresh = body?.refreshToken;

      if (!access) throw new Error('로그인 응답에 accessToken 없음');

      await setTokens(access, refresh);
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
      await clearTokens();
      setAccessToken(null);
      console.log('로그아웃 성공');
    } catch {
      await clearTokens();
      setAccessToken(null);
    }
  }, []);

  /** 진입 시 토큰 유효화 (임박 시 선제 갱신) */
  const ensureValidAccessToken = useCallback(async (): Promise<string | null> => {
    let token = await getAccess();
    if (!token) {
      setAccessToken(null);
      return null;
    }

    const exp = getExp(token);
    if (isExpSoon(exp, REFRESH_SKEW_SEC)) {
      const refresh = await getRefresh();
      if (!refresh) {
        await clearTokens();
        setAccessToken(null);
        return null;
      }
      try {
        const res = await refreshTokenApi(refresh);
        const data: any = res;
        const ok = data?.isSuccess ?? true;
        const body = data?.result ?? data;

        if (!ok) throw new Error(data?.message || 'refresh failed');

        const newAccess = body?.accessToken;
        const newRefresh = body?.refreshToken;

        if (!newAccess) throw new Error('refresh 응답에 accessToken 없음');

        await setTokens(newAccess, newRefresh);
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
      // 여유가 있으면 스케줄 보장
      setAccessToken(token);
      scheduleRefresh(token);
    }

    return token;
  }, [scheduleRefresh]);

  return { accessToken, setAccessToken, login, logout, ensureValidAccessToken };
};
