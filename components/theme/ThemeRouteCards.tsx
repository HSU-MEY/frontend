import { getRecommendRouteApi, type Routes } from "@/api/routes.service";
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import ThemeRouteCard from './ThemeRouteCard';

export type ThemeCategory = 'K-Pop' | 'K-Drama' | 'K-Beauty' | 'K-Fashion' | 'K-Food';

interface ThemeRouteCardsProps {
  category: ThemeCategory;
  limit?: number;
}

type ApiTheme = 'KPOP' | 'KDRAMA' | 'KFASHION' | 'KFOOD';

const UI_TO_API_THEME_MAP: Partial<Record<ThemeCategory, ApiTheme>> = {
  'K-Pop': 'KPOP',
  'K-Drama': 'KDRAMA',
  'K-Beauty': 'KFASHION', // TODO: Need to check with backend
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
        const res = await getRecommendRouteApi(themesParam, undefined, Number.isFinite(limit) ? limit : 3, 0);
        if (!res.isSuccess) throw new Error(res.message);
        
        const list = res.result.routes ?? [];
        if (mounted) setRoutes(Number.isFinite(limit) ? list.slice(0, limit) : list);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "로드 실패");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [apiTheme, limit]);

  if (loading) return <ActivityIndicator style={{ marginVertical: 16 }} />;
  if (error)   return <Text style={{ color: 'red' }}>에러: {error}</Text>;
  if (!routes.length) return <Text style={{ opacity: 0.6 }}>해당 테마의 추천 루트가 없습니다.</Text>;

  return (
    <View>
      {routes.map((route, index) => (
        <ThemeRouteCard
          key={route.routeId}
          id={route.routeId}
          image={{uri: route.imageUrl}}
          title={route.title}
          location={route.regionNameKo || ''}
          description={route.description}
        />
      ))}
    </View>
  );
}
