// hooks/useWeather.ts
import { fetchWeather } from "@/api/weather.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// 기본 1시간
const DEFAULT_TTL_MS = 60 * 60 * 1000;

type CacheEntry = { ts: number; data: any };
const memCache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<any>>();

type Options = {
  ttlMs?: number;
  precision?: number;
  skip?: boolean;
};

const STORAGE_PREFIX = "weather:";
const keyOf = (lat: number, lon: number, precision = 4) => {
  const f = (n: number) => Number(n.toFixed(precision));
  return `${f(lat)},${f(lon)}`;
};

async function loadFromStorage(key: string): Promise<CacheEntry | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function saveToStorage(key: string, entry: CacheEntry) {
  try {
    await AsyncStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // 무시
  }
}

export function useWeather(
  lat?: number,
  lon?: number,
  opts: Options = {}
) {
  const { ttlMs = DEFAULT_TTL_MS, precision = 4, skip = false } = opts;

  const key = useMemo(() => {
    if (lat == null || lon == null) return null;
    return keyOf(lat, lon, precision);
  }, [lat, lon, precision]);

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(!!key && !skip);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const readCache = useCallback(async (k: string): Promise<any | null> => {
    
    const m = memCache.get(k);
    const now = Date.now();
    if (m && now - m.ts < ttlMs) return m.data;

    
    const s = await loadFromStorage(k);
    if (s && now - s.ts < ttlMs) {
    
      memCache.set(k, s);
      return s.data;
    }
    return null;
  }, [ttlMs]);

  const writeCache = useCallback(async (k: string, payload: any) => {
    const entry: CacheEntry = { ts: Date.now(), data: payload };
    memCache.set(k, entry);
    await saveToStorage(k, entry);
  }, []);

  const refresh = useCallback(async () => {
    if (!key || lat == null || lon == null) return;
    setLoading(true);
    setError(null);

    try {
    
      let p = inFlight.get(key);
      if (!p) {
        p = fetchWeather(lat, lon);
        inFlight.set(key, p);
      }
      const res = await p;
      if (!mountedRef.current) return;
      await writeCache(key, res);
      setData(res);
    } catch (e: any) {
      if (mountedRef.current) setError(e?.message ?? "weather fetch failed");
    } finally {
      if (mountedRef.current) setLoading(false);
      inFlight.delete(key!);
    }
  }, [key, lat, lon, writeCache]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    (async () => {
      if (!key || skip) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      
      const cached = await readCache(key);
      if (cached) {
        if (!mountedRef.current) return;
        setData(cached);
        setLoading(false);
        return;
      }
      
      await refresh();
    })();
  }, [key, skip, readCache, refresh]);

  return { data, loading, error, refresh };
}
