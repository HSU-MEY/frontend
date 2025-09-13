import { getRecommendRouteApi, type Routes } from "@/api/routes.service";
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import ThemeRouteCard from './ThemeRouteCard';

export type ThemeCategory = 'K-Pop' | 'K-Drama' | 'K-Beauty' | 'K-Fashion' | 'K-Food';

interface ThemeRouteCardsProps {
  category: ThemeCategory;
  limit?: number;
}

type ApiTheme = 'KPOP' | 'KDRAMA' | 'KBEAUTY' | 'KFASHION' | 'KFOOD';

const UI_TO_API_THEME_MAP: Partial<Record<ThemeCategory, ApiTheme>> = {
  'K-Pop': 'KPOP',
  'K-Drama': 'KDRAMA',
  'K-Beauty': 'KBEAUTY',
  'K-Fashion': 'KFASHION',
  'K-Food': 'KFOOD',
}

export default function ThemeRouteCards({ category, limit = Infinity }: ThemeRouteCardsProps) {
  const [routes, setRoutes] = React.useState<Routes[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiTheme = useMemo(() => UI_TO_API_THEME_MAP[category], [category]);


  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const themesParam = apiTheme ? [apiTheme] : undefined;
        const res = await getRecommendRouteApi(
          themesParam,
          undefined,
          Number.isFinite(limit) ? limit : 3,
          0
        );
        if (!res.isSuccess) throw new Error(res.message);

        const list = res.result.routes ?? [];

        // 중복 routeId 제거 + routeId 없는 항목도 키 만들 수 있게 준비
        const seen = new Set<string | number>();
        const uniq: Routes[] = [];
        for (const r of list) {
          const k = r.routeId ?? `${r.title}|${r.imageUrl}`; // fallback 키
          if (seen.has(k)) continue;
          seen.add(k);
          uniq.push(r);
        }

        if (mounted) {
          const sliced = Number.isFinite(limit) ? uniq.slice(0, limit) : uniq;
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
  if (error) return <Text style={{ color: 'red' }}>에러: {error}</Text>;
  if (!routes.length) return <Text style={{ opacity: 0.6 }}>해당 테마의 추천 루트가 없습니다.</Text>;

  return (
    <View>
      {routes.map((route, index) => (
        <ThemeRouteCard
          key={`${category}-${route.routeId ?? index}`}  // ← 카테고리 prefix + 없으면 index
          id={route.routeId}
          image={route.imageUrl ? { uri: route.imageUrl } : undefined}
          title={route.title}
          location={route.regionNameKo || ''}
          description={route.description}
        />
      ))}
    </View>
  );
}
