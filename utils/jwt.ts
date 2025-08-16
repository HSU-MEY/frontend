export const parseJwt = <T = any>(token: string): T => {
  const payload = token.split('.')[1];
  const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(
    atob(b64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
  );
  return JSON.parse(json);
};

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
  if (!exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return exp - now <= skewSec;
};
