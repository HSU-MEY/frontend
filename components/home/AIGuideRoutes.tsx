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

export default function AIGuideRoutes() {
  const router = useRouter();
  const [routes, setRoutes] = useState<Routes[]>([]);
  const [loading, setLoading] = useState(true);

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

  const renderItem = ({ item }: { item: Routes }) => (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => router.push(`/route/route-overview/${item.routeId ?? 1}`)} // routeId 없으면 1로 fallback
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
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardLocation}>{item.regionNameKo}</Text>
          </View>
          <View style={styles.bottomTextContainer}>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 섹션 제목 */}
      <View style={styles.headerRow}>
        <Image source={require('../../assets/images/icons/robot.png')} style={styles.icon} />
        <Text style={styles.title}>AI 가이드가 추천하는 루트를 만나보세요</Text>
      </View>

      {/* routes가 비어도 뼈대는 보이게 유지하고 싶으면 그대로 렌더링 */}
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
              <Text style={{ color: '#999' }}>불러오는 중…</Text>
            </View>
          )
        }
      />
    </View>
  );
}

/** routeId가 있는 것만 중복 제거, 없는 항목은 그대로 유지 */
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
