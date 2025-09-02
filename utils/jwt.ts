// utils/jwt.ts
import { decode as atob } from 'base-64';

const decodeB64Url = (b64url: string) => {
  // URL-safe → 표준 base64
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  // 패딩 (=) 보정
  while (b64.length % 4 !== 0) b64 += '=';
  const raw = atob(b64);
  // 유니코드 안전 디코딩
  try {
    return decodeURIComponent(
      raw.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
  } catch {
    return raw; // ASCII만 있을 때
  }
};

export const parseJwt = <T = any>(token: string): T =>
  JSON.parse(decodeB64Url(token.split('.')[1]));

export const getExp = (token?: string): number | null => {
  if (!token) return null;
  try {
    const { exp } = parseJwt<{ exp?: number }>(token);
    return exp ?? null;
  } catch {
    return null;
  }
};

export const isExpSoon = (exp?: number | null, skewSec = 90) => {
  if (exp == null) return false;
  const now = Math.floor(Date.now() / 1000);
  return exp - now <= skewSec;
};
