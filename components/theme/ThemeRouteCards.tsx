import { getRecommendRouteApi, type Routes } from "@/api/routes.service";
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import ThemeRouteCard from './ThemeRouteCard';
//interface ThemeRouteCardsProps { category: ThemeCategory; limit?: number; }
import { useTranslation } from 'react-i18next';

export type ThemeCategory = 'K-Pop' | 'K-Drama' | 'K-Beauty' | 'K-Fashion' | 'K-Food';
type ApiTheme = 'K_POP' | 'K_DRAMA' | 'K_BEAUTY' | 'K_FASHION' | 'K_FOOD';

const UI_TO_API_THEME_MAP: Record<ThemeCategory, ApiTheme> = {
  'K-Pop': 'K_POP',
  'K-Drama': 'K_DRAMA',
  'K-Beauty': 'K_BEAUTY',
  'K-Fashion': 'K_FASHION',
  'K-Food': 'K_FOOD',
};

// 서버/클라 혼용 대비: 대시→언더스코어, 대문자화, 유효성 체크
function normalizeTheme(v?: string | null): ApiTheme | null {
  if (!v) return null;
  const s = v.replace(/-/g, '_').toUpperCase();
  const ok = ['K_POP', 'K_DRAMA', 'K_BEAUTY', 'K_FASHION', 'K_FOOD'] as const;
  return (ok as readonly string[]).includes(s as any) ? (s as ApiTheme) : null;
}

function getRouteThemes(r: Routes): ApiTheme[] {
  const raw: unknown[] = ((r as any).themes ?? ((r as any).theme ? [(r as any).theme] : [])) as unknown[];
  return raw
    .map(v => normalizeTheme(typeof v === 'string' ? v : String(v)))
    .filter((x): x is ApiTheme => x !== null);
}

export default function ThemeRouteCards({ category, limit = Infinity }: { category: ThemeCategory; limit?: number }) {
  const { t } = useTranslation();
  const [routes, setRoutes] = useState<Routes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiTheme = useMemo(() => UI_TO_API_THEME_MAP[category], [category]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // 1) 서버에 올바른 테마 전달
        const res = await getRecommendRouteApi([apiTheme], undefined, Number.isFinite(limit) ? limit : 3, 0);
        if (!res.isSuccess) throw new Error(res.message);
        const list = res.result.routes ?? [];

        // 2) 중복 제거
        const seen = new Set<string | number>();
        const uniq: Routes[] = [];
        for (const r of list) {
          const k = r.routeId ?? `${r.title}|${r.imageUrl}`;
          if (seen.has(k)) continue;
          seen.add(k);
          uniq.push(r);
        }

        // 3) 클라 사이드에서도 한 번 더 필터(안전망)
        const filtered = uniq.filter(r => getRouteThemes(r).includes(apiTheme));

        if (mounted) {
          const sliced = Number.isFinite(limit) ? filtered.slice(0, limit) : filtered;
          setRoutes(sliced);
        }
      } catch (e: any) {
        if (mounted) setError(e?.message ?? '로드 실패');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [apiTheme, limit]);

  if (loading) return <ActivityIndicator style={{ marginVertical: 16 }} />;
  if (error) return <Text style={{ color: 'red' }}>error: {error}</Text>;
  if (!routes.length) return <Text style={{ opacity: 0.6 }}>{t('themeRoutes.emptyByTheme')}</Text>;

  return (
    <View>
      {routes.map((route, index) => (
        <ThemeRouteCard
          key={`${category}-${route.routeId ?? index}`}
          route={route}
          imageOverride={route.imageUrl
            ? { uri: route.imageUrl }
            : require('@/assets/images/placeholder-place.png')}
        />
      ))}
    </View>
  );
}
