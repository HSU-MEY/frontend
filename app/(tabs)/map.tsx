import type { ThemeCategory } from '@/components/theme/ThemeRouteCards';
import ThemeTabs from '@/components/theme/ThemeTabs';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components/native';

import KakaoMapWebView from '@/components/KakaoMapWebView';
import { places as dummyPlaces } from '@/data/dummyPlaces';
import { KAKAO_JS_API_KEY } from '@/src/env';
import { ActivityIndicator, ImageSourcePropType, NativeScrollEvent, NativeSyntheticEvent, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { fetchThemePlaces, PopularPlaceDTO } from '@/api/places.service';

type UIPlace = {
  id: number;
  title: string;
  type: string;
  distance: string;
  time?: string;
  address: string;
  thumbnail: ImageSourcePropType;
  category: ThemeCategory;
};

// 테마 키워드 매핑: 탭 문자열 -> API keyword
const THEME_TO_KEYWORD: Record<ThemeCategory, string> = {
  'K-Pop': 'K_pop',
  'K-Drama': 'K_drama',
  'K-Beauty': 'K_beauty',
  'K-Fashion': 'K_fashion',
  'K-Food': 'K_food',
};

const PAGE_SIZE = 10;

// 카테고리별 상태를 캐시 (무한스크롤/재방문시 유지)
type ThemeState = {
  items: UIPlace[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
};

export default function MapScreen() {
  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory>('K-Pop');
  const ref = useRef<WebView>(null);
  const JS_KEY = KAKAO_JS_API_KEY;

  // 카테고리별 상태 캐시
  const [byTheme, setByTheme] = useState<Record<ThemeCategory, ThemeState>>({
    'K-Pop': { items: [], loading: false, error: null, hasMore: true },
    'K-Drama': { items: [], loading: false, error: null, hasMore: true },
    'K-Beauty': { items: [], loading: false, error: null, hasMore: true },
    'K-Fashion': { items: [], loading: false, error: null, hasMore: true },
    'K-Food': { items: [], loading: false, error: null, hasMore: true },
  });

  // 현재 카테고리의 상태
  const themeState = byTheme[selectedCategory];

  // 더미에서 해당 카테고리 기본 템플릿들 추출 (부족한 필드 채우기에 사용)
  const dummyForCategory = useMemo(
    () => dummyPlaces.filter(p => p.category === selectedCategory),
    [selectedCategory]
  );

  // 백엔드 DTO -> UIPlace로 변환 (부족한 필드 더미로 보충)
  const mapBackendToUI = (b: PopularPlaceDTO, idx: number): UIPlace => {
    const title = b.nameKo || b.nameEn || `장소 #${b.id}`;
    const base = dummyForCategory[idx % Math.max(1, dummyForCategory.length)]; // 순환 매칭
    return {
      id: b.id,
      title,
      type: base?.type ?? 'Place',
      distance: base?.distance ?? '—',
      time: base?.time ?? undefined,
      address: base?.address ?? '주소 정보 없음',
      thumbnail:
        (base?.thumbnail as ImageSourcePropType) ??
        require('@/assets/images/placeholder-place.png'),
      category: selectedCategory,
    };
  };

  // 최초/탭 변경 시 자동 로드
  useEffect(() => {
    if (themeState.items.length === 0 && !themeState.loading) {
      loadMore(); // 첫 페이지
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const setThemeState = (cat: ThemeCategory, patch: Partial<ThemeState>) => {
    setByTheme(prev => ({
      ...prev,
      [cat]: { ...prev[cat], ...patch },
    }));
  };

  // 무한 스크롤: limit만 제공되므로 현재 개수 + PAGE_SIZE로 재요청 → 중복 제거
  const loadMore = async () => {
    const keyword = THEME_TO_KEYWORD[selectedCategory];
    if (!keyword) return;
    if (themeState.loading || !themeState.hasMore) return;

    try {
      setThemeState(selectedCategory, { loading: true, error: null });

      const nextLimit = themeState.items.length + PAGE_SIZE;
      const backend = await fetchThemePlaces(keyword, nextLimit);

      const ui = backend.map((b, i) => mapBackendToUI(b, i));

      // 중복 제거(같은 id 존재 시 최신으로 교체)
      const dedup = deduplicateById([...ui]);

      // hasMore: 리스트 길이가 증가했으면 true
      const had = themeState.items.length;
      const got = dedup.length;
      const hasMore = got > had;

      setThemeState(selectedCategory, {
        items: dedup,
        hasMore,
      });
    } catch (e: any) {
      setThemeState(selectedCategory, { error: '데이터를 불러오지 못했어요.' });
      // 실패해도 더미가 렌더되도록 상태는 유지
    } finally {
      setThemeState(selectedCategory, { loading: false });
    }
  };

  // ScrollView 끝 감지
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const paddingToBottom = 120;
    const reachedEnd = contentOffset.y + layoutMeasurement.height + paddingToBottom >= contentSize.height;
    if (reachedEnd) loadMore();
  };

  // 현재 화면에 그릴 리스트: 백엔드 items가 있으면 그것을 우선, 없으면 기존 더미
  const listForRender = useMemo<UIPlace[]>(() => {
    if (themeState.items.length > 0) return themeState.items;
    // 백엔드 미로딩/실패면 기존 더미 유지
    return dummyForCategory.map<UIPlace>((d) => ({
      id: d.id,
      title: d.title ?? `장소 #${d.id}`,
      type: d.type ?? 'Place',
      distance: d.distance ?? '—',
      time: d.time ?? undefined,
      address: d.address ?? '주소 정보 없음',
      thumbnail:
        (d.thumbnail as ImageSourcePropType) ??
        require('@/assets/images/placeholder-place.png'),
      category: selectedCategory,
    }));
  }, [themeState.items, dummyForCategory, selectedCategory]);

  return (
    <Container>
      <View style={{ width: '100%', height: 300, backgroundColor: 'lightgrey' }}>
        <KakaoMapWebView
          //@ts-ignore - ref
          ref={ref}
          jsKey={JS_KEY}
          center={{ lat: 37.5665, lng: 126.9780 }} // 서울시청 좌표
          level={4}
          onReady={() => console.log('Map is ready')}
          onPress={(lat, lng) => console.log('Map pressed at:', lat, lng)}
        />
      </View>

      <View style={{marginTop: 20}}>
        <ThemeTabs
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </View>

      {/* 기존 스타일 유지, props만 추가 */}
      <ListContainer
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <PlaceList>
          {listForRender
            .filter(place => place.category === selectedCategory)
            .map((place) => (
              <PlaceItem key={`${selectedCategory}-${place.id}`}
                onPress={() =>
                  router.push({
                    pathname: '/place/place-detail',
                    params: { id: String(place.id) },
                  })
                }>
                <PlaceInfo>
                  <PlaceHeader>
                    <PlaceNumber>{place.id}</PlaceNumber>
                    <PlaceTitle>{place.title}</PlaceTitle>
                  </PlaceHeader>
                  <PlaceSub>{place.type}, {place.distance}</PlaceSub>
                  {place.time
                    ? <PlaceTime>{place.time}</PlaceTime>
                    : <NoTime> </NoTime>
                  }
                  <PlaceAddress>{place.address}</PlaceAddress>
                </PlaceInfo>
                <PlaceThumb source={place.thumbnail} />
              </PlaceItem>
            ))}

          {/* 하단 로더 */}
          {themeState.loading && (
            <View style={{ padding: 14, alignItems: 'center' }}>
              <ActivityIndicator />
            </View>
          )}
        </PlaceList>
      </ListContainer>
    </Container>
  );
}

/** id 기준 중복 제거 (뒤에 온 항목으로 교체) */
function deduplicateById(arr: UIPlace[]) {
  const map = new Map<number, UIPlace>();
  for (const it of arr) map.set(it.id, it);
  return Array.from(map.values());
}

const Container = styled.View`
  flex: 1;
  background-color: white;
`;

const ListContainer = styled.ScrollView`
  padding: 6px 0;
`;

const TabRow = styled.View`
  flex-direction: row;
  justify-content: space-around;
  margin-vertical: 12px;
`;

const PlaceList = styled.View`
  padding: 0 16px 16px 16px;
`;

const PlaceItem = styled.TouchableOpacity`
  flex-direction: row;
  border: 1px solid #dceeff;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  align-items: center;
  background-color: #f9fbff;
`;

const PlaceNumber = styled.Text`
  width: 24px;
  height: 24px;
  background-color: #2680eb;
  color: white;
  text-align: center;
  border-radius: 12px;
  margin-right: 10px;
  font-weight: bold;
  line-height: 24px;
`;

const PlaceInfo = styled.View`
  flex: 1;
`;

const PlaceHeader = styled.View`
  flex-direction: row;
  margin-bottom: 4px;
`;

const PlaceTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #0080FF;
`;

const PlaceSub = styled.Text`
  font-size: 13px;
  color: #9d9d9d;
  margin-bottom: 2px;
`;

const PlaceTime = styled.Text`
  font-size: 12px;
  background-color: #f0f8ff;
  color: #0296e9;
  padding: 2px 6px;
  width: 50%;
  border-radius: 4px;
`;

const NoTime = styled.Text`
  font-size: 12px;
  background-color: transparent;
  padding: 2px 6px;
`;

const PlaceAddress = styled.Text`
  font-size: 12px;
  color: #333;
  margin-top: 4px;
`;

const PlaceThumb = styled.Image`
  height: 80px;
  width: 80px;
  border-radius: 8px;
  margin-left: 10px;
`;
