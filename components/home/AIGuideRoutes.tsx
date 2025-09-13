import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { getRecommendRouteApi, Routes } from '@/api/routes.service';
import { useTranslation } from 'react-i18next';

// 언어코드 → 필드 접미사
function langSuffix(langCode?: string): 'Ko' | 'En' | 'Jp' | 'Ch' {
  const l = (langCode || 'ko').toLowerCase();
  if (l.startsWith('ko')) return 'Ko';
  if (l.startsWith('en')) return 'En';
  if (l.startsWith('ja')) return 'Jp';
  if (l.startsWith('zh')) return 'Ch';
  return 'Ko';
}
function pickLocalizedField<T extends Record<string, any>>(
  p: T | null | undefined,
  base: string,
  langCode?: string
): string {
  if (!p) return '';
  const suf = langSuffix(langCode);
  const tryKeys = [
    `${base}${suf}`,
    `${base}En`,
    `${base}Ko`,
    `${base}Jp`,
    `${base}Ch`,
    base, // 단일 필드 fallback
  ];
  for (const k of tryKeys) {
    const v = (p as any)[k];
    if (typeof v === 'string' && v.trim()) return v;
  }
  return '';
}

export default function AIGuideRoutes() {
  const router = useRouter();
  const [routes, setRoutes] = useState<Routes[]>([]);
  const [loading, setLoading] = useState(true);
  const { i18n, t } = useTranslation();

  useEffect(() => {
    (async () => {
      try {
        const res = await getRecommendRouteApi(undefined, undefined, 3, 0);
        if (res?.isSuccess) {
          setRoutes(dedupByRouteIdKeepUnknown(res.result.routes ?? []));
        } else {
          setRoutes([]);
        }
      } catch {
        setRoutes([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const renderItem = ({ item }: { item: Routes }) => {
    const title = pickLocalizedField(item, 'title', i18n.language) || item.title || '';
    const regionName =
      pickLocalizedField(item, 'regionName', i18n.language) ||
      // 백엔드가 regionNameKo만 줄 때 대비
      (item as any).regionNameKo ||
      (item as any).regionName ||
      '';
    const description =
      pickLocalizedField(item, 'description', i18n.language) || item.description || '';

    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() => router.push(`/route/route-overview/${item.routeId ?? 1}`)}
      >
        <ImageBackground
          source={item.imageUrl ? { uri: item.imageUrl } : require('@/assets/images/placeholder-place.png')}
          style={styles.cardImage}
          imageStyle={styles.imageStyle}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']}
            locations={[0.1, 0.5, 0.9]}
            style={styles.overlay}
          >
            <View style={styles.topTextContainer}>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.cardLocation}>{regionName}</Text>
            </View>
            <View style={styles.bottomTextContainer}>
              <Text style={styles.cardDescription}>{description}</Text>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* 섹션 제목 (다국어) */}
      <View style={styles.headerRow}>
        <Image source={require('../../assets/images/icons/robot.png')} style={styles.icon} />
        <Text style={styles.title}>{t('aiGuideRoutes.title')}</Text>
      </View>

      <FlatList
        data={routes}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) =>
          item?.routeId != null
            ? `r-${item.routeId}`
            : `tmp-${item?.title ?? 'no-title'}-${index}`
        }
        renderItem={renderItem}
        style={{ marginTop: 12 }}
        contentContainerStyle={{ paddingRight: 12 }}
        ListEmptyComponent={
          !loading ? null : (
            <View style={{ width: 147, height: 98, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#999' }}>{t('aiGuide.loading')}</Text>
            </View>
          )
        }
      />
    </View>
  );
}

function dedupByRouteIdKeepUnknown(arr: Routes[]): Routes[] {
  const seen = new Set<number>();
  const withId: Routes[] = [];
  const withoutId: Routes[] = [];

  for (const r of arr ?? []) {
    if (r?.routeId != null) {
      if (!seen.has(r.routeId)) {
        seen.add(r.routeId);
        withId.push(r);
      }
    } else {
      withoutId.push(r);
    }
  }
  return [...withId, ...withoutId];
}

const styles = StyleSheet.create({
  container: { marginTop: 20, marginBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 20, height: 20, marginRight: 8, resizeMode: 'contain' },
  title: { fontSize: 16, fontFamily: 'Pretendard-Bold', color: '#000' },

  cardContainer: { marginRight: 12 },
  cardImage: {
    width: 147,
    height: 98,
    borderRadius: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  imageStyle: { borderRadius: 5 },
  overlay: { flex: 1, padding: 8, justifyContent: 'space-between', borderRadius: 5 },
  topTextContainer: { marginTop: 5 },
  bottomTextContainer: { marginBottom: 5 },
  cardTitle: { fontSize: 13, fontFamily: 'Pretendard-Bold', color: '#fff' },
  cardLocation: { fontSize: 12, color: '#fff', fontFamily: 'Pretendard-SemiBold', marginTop: 0 },
  cardDescription: { fontSize: 11, color: '#fff', fontFamily: 'Pretendard-Medium' },
});
