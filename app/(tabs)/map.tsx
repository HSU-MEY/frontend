import { fetchThemePlaces, PopularPlaceDTO } from '@/api/places.service';
import KakaoMapWebView, { KakaoMapHandle } from '@/components/KakaoMapWebView';
import type { ThemeCategory } from '@/components/theme/ThemeRouteCards';
import ThemeTabs from '@/components/theme/ThemeTabs';
import { places as dummyPlaces } from '@/data/dummyPlaces';
import { KAKAO_JS_API_KEY } from '@/src/env';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from 'react-native';
import styled from 'styled-components/native';

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

const THEME_TO_KEYWORD: Record<ThemeCategory, string> = {
  'K-Pop': 'K_pop',
  'K-Drama': 'K_drama',
  'K-Beauty': 'K_beauty',
  'K-Fashion': 'K_fashion',
  'K-Food': 'K_food',
};

const PAGE_SIZE = 10;

type ThemeState = {
  items: UIPlace[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
};

export default function MapScreen() {
  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory>('K-Pop');
  const mapRef = useRef<KakaoMapHandle>(null);
  const isInitialMapLoad = useRef(true);
  const JS_KEY = KAKAO_JS_API_KEY;

  const [currentLocation, setCurrentLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);


  const [byTheme, setByTheme] = useState<Record<ThemeCategory, ThemeState>>({
    'K-Pop': { items: [], loading: false, error: null, hasMore: true },
    'K-Drama': { items: [], loading: false, error: null, hasMore: true },
    'K-Beauty': { items: [], loading: false, error: null, hasMore: true },
    'K-Fashion': { items: [], loading: false, error: null, hasMore: true },
    'K-Food': { items: [], loading: false, error: null, hasMore: true },
  });

  const themeState = byTheme[selectedCategory];

  const dummyForCategory = useMemo(
    () => dummyPlaces.filter(p => p.category === selectedCategory),
    [selectedCategory]
  );

  // ===== Location Tracking Effect =====
  useEffect(() => {
    let watcher: Location.LocationSubscription | undefined;

    const startWatching = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      watcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // 5 seconds
          distanceInterval: 10, // 10 meters
        },
        (location) => {
          setCurrentLocation(location.coords);
        }
      );
    };

    startWatching();

    return () => {
      watcher?.remove();
    };
  }, []);

  // ===== Map Update Effect =====
  useEffect(() => {
    if (currentLocation && mapRef.current && isMapReady) {
      const { latitude, longitude } = currentLocation;
      mapRef.current.setCurrentLocationMarker(latitude, longitude, 'https://firebasestorage.googleapis.com/v0/b/apporium-d7aef.firebasestorage.app/o/temp%2Fcurrent-location.png?alt=media&token=e6b6469f-ee4a-4274-beb3-2b6fa0802aa7');
      
      if (isInitialMapLoad.current) {
        mapRef.current.setCenter(latitude, longitude, 4);
        isInitialMapLoad.current = false;
      } else {
        mapRef.current.setCenter(latitude, longitude); // Update center without full reload
      }
    }
  }, [currentLocation, isMapReady]);
  


  const mapBackendToUI = (b: PopularPlaceDTO, idx: number): UIPlace => {
    const title = b.nameKo || b.nameEn || `장소 #${b.id}`;
    const base = dummyForCategory[idx % Math.max(1, dummyForCategory.length)];
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

  useEffect(() => {
    if (themeState.items.length === 0 && !themeState.loading) {
      loadMore();
    }
  }, [selectedCategory]);

  const setThemeState = (cat: ThemeCategory, patch: Partial<ThemeState>) => {
    setByTheme(prev => ({
      ...prev,
      [cat]: { ...prev[cat], ...patch },
    }));
  };

  const loadMore = async () => {
    const keyword = THEME_TO_KEYWORD[selectedCategory];
    if (!keyword || themeState.loading || !themeState.hasMore) return;

    try {
      setThemeState(selectedCategory, { loading: true, error: null });
      const nextLimit = themeState.items.length + PAGE_SIZE;
      const backend = await fetchThemePlaces(keyword, nextLimit);
      const ui = backend.map((b, i) => mapBackendToUI(b, i));
      const dedup = deduplicateById([...ui]);
      const hasMore = dedup.length > themeState.items.length;
      setThemeState(selectedCategory, { items: dedup, hasMore });
    } catch (e: any) {
      setThemeState(selectedCategory, { error: '데이터를 불러오지 못했어요.' });
    } finally {
      setThemeState(selectedCategory, { loading: false });
    }
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const paddingToBottom = 120;
    const reachedEnd = contentOffset.y + layoutMeasurement.height + paddingToBottom >= contentSize.height;
    if (reachedEnd) loadMore();
  };

  const listForRender = useMemo<UIPlace[]>(() => {
    if (themeState.items.length > 0) return themeState.items;
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
          ref={mapRef}
          jsKey={JS_KEY}
          center={ undefined }
          level={4}
          onReady={() => setIsMapReady(true)}
        />
      </View>


      <ThemeTabs
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

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
