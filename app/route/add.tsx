// app/route/add.tsx
import { fetchPopularPlaces, PopularPlaceDTO, SearchPlaceDTO, searchPlaces } from '@/api/places.service';
import Header from '@/components/common/Header';
import { useSelectedRoute } from '@/contexts/SelectedRouteContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import KakaoMapWebView, { KakaoMapHandle } from '@/components/KakaoMapWebView';
import { KAKAO_JS_API_KEY } from '@/src/env';

type UiPlace = {
  id: number;
  name: string;
  address: string;
  time: string;
  tag: string;
  image: any;                 // local require OR { uri: string }
  isRecommended: boolean;
  raw: PopularPlaceDTO;       // 상세/좌표 등 원본
};

type Place = {
  id: number;
  name: string;
  address: string;
  time: string;
  tag: string;
  image: any;
  isRecommended: boolean;
  raw: {
    latitude: number | string;
    longitude: number | string;
    [key: string]: any;
  };
};

const toPlace = (p: UiPlace): Place => ({
  id: p.id,
  name: p.name,
  address: p.address,
  time: p.time,
  tag: p.tag,
  image: p.image,
  isRecommended: p.isRecommended,
  raw: {
    ...p.raw,
    latitude: p.raw?.latitude ?? '',   // 필수 보장
    longitude: p.raw?.longitude ?? '', // 필수 보장
  },
});

const PLACEHOLDER = require('@/assets/images/placeholder-place.png');

// 요일 한글 맵
const KR_DAYS: Record<string, string> = {
  monday: '월', tuesday: '화', wednesday: '수',
  thursday: '목', friday: '금', saturday: '토', sunday: '일',
};

function formatOpeningHours(hours: any): string {
  if (!hours) return '운영시간 정보 없음';
  if (typeof hours === 'string') return hours;
  if (Array.isArray(hours)) return hours.filter(Boolean).join(', ');

  if (typeof hours === 'object') {
    const parts = Object.entries(hours)
      .map(([day, val]) => {
        const d = KR_DAYS[day.toLowerCase()] ?? day;
        if (typeof val === 'string') return `${d} ${val}`;
        if (val && typeof val === 'object') {
          const open = (val as any).open ?? (val as any).start ?? '';
          const close = (val as any).close ?? (val as any).end ?? '';
          if (open && close) return `${d} ${open}~${close}`;
          if (open || close) return `${d} ${open || close}`;
          return `${d} 영업`;
        }
        return `${d}`;
      })
      .filter(Boolean);
    return parts.length ? (parts.length <= 2 ? parts.join(' · ') : `${parts.slice(0, 2).join(' · ')} 외`) : '운영시간 정보 없음';
  }

  return String(hours);
}

function formatThemes(themes: any): string {
  if (!themes) return '명소';
  if (typeof themes === 'string') return themes;
  if (Array.isArray(themes)) return themes.filter(Boolean).join(', ');
  if (typeof themes === 'object') {
    const vals = Object.values(themes).filter((v) => typeof v === 'string' && v.trim().length > 0) as string[];
    if (vals.length) return vals.join(', ');
    return Object.keys(themes).join(', ');
  }
  return String(themes);
}

export default function AddRouteScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { selectedPlaces, setSelectedPlaces } = useSelectedRoute(); // 전역에 이미 담긴 선택 목록

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiPopular, setApiPopular] = useState<PopularPlaceDTO[]>([]);

  // 검색
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchPlaceDTO[]>([]);

  // 이번 화면에서 임시로 추가해놓은 선택 목록(확정 전)
  const [tempSelected, setTempSelected] = useState<UiPlace[]>([]);

  const mapRef = useRef<KakaoMapHandle>(null);
  const JS_KEY = KAKAO_JS_API_KEY;
  const DEFAULT_CENTER = { lat: 37.5665, lng: 126.9780 }; // 서울시청
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);

  const loadPopular = async () => {
    try {
      setError(null);
      const data = await fetchPopularPlaces();
      setApiPopular(data);
    } catch (e) {
      setError('인기 장소를 불러오지 못했어요.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadPopular(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPopular();
  };

  useEffect(() => {
    const q = search.trim();
    setSearchError(null);
    setSearching(false);
    setSearchResults([]);

    if (q.length < 2) return;

    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        setSearching(true);
        const data = await searchPlaces(q, undefined, controller.signal);
        setSearchResults(data);
      } catch (e: any) {
        if (e?.code !== 'ERR_CANCELED') setSearchError('검색에 실패했어요.');
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [search]);

  // 인기 → UI 매핑
  const uiPopular: UiPlace[] = useMemo(() => {
    return apiPopular.map((p) => {
      const name = p.nameKo || p.nameEn || `장소 #${p.id}`;
      const address = typeof p.address === 'string' ? p.address : (p.regionId ? `Region ${p.regionId}` : '주소 정보 없음');
      const time = formatOpeningHours(p.openingHours);
      const tag = formatThemes(p.themes);
      const image = p.imageUrl ? { uri: p.imageUrl } : PLACEHOLDER;
      return { id: p.id, name, address, time, tag, image, isRecommended: true, raw: p };
    });
  }, [apiPopular]);

  // 검색 결과 → UI 매핑 (간소화된 필드)
  const uiSearched: UiPlace[] = useMemo(() => {
    return searchResults.map((s) => {
      const name = s.nameKo || s.nameEn || `장소 #${s.id}`;
      const address = s.regionId ? `Region ${s.regionId}` : '주소 정보 없음';
      const time = '운영시간 정보 없음';
      const tag = '검색결과';
      const image = PLACEHOLDER;
      const raw: PopularPlaceDTO = {
        id: s.id,
        nameKo: s.nameKo,
        nameEn: s.nameEn,
        latitude: s.latitude,
        longitude: s.longitude,
        regionId: s.regionId,
      };
      return { id: s.id, name, address, time, tag, image, isRecommended: true, raw };
    });
  }, [searchResults]);

  const showingSearch = search.trim().length >= 2;
  const list: UiPlace[] = useMemo(() => {
    if (showingSearch) return uiSearched;
    return uiPopular.filter((p) => p.isRecommended);
  }, [showingSearch, uiSearched, uiPopular]);

  const isAlreadyPicked = (id: number) =>
    selectedPlaces.some((p) => p.id === id) || tempSelected.some((p) => p.id === id);

  const handleAdd = (place: UiPlace) => {
    if (isAlreadyPicked(place.id)) {
      Alert.alert('안내', '이미 선택하신 장소입니다.');
      return;
    }
    setTempSelected((prev) => [...prev, place]);
  };

  const handleRemove = (id: number) => {
    setTempSelected((prev) => prev.filter((p) => p.id !== id));
  };

  const handleConfirm = () => {
    if (tempSelected.length === 0) {
      Alert.alert('장소를 선택해주세요!'); 
      return;
    }
    const merged: Place[] = [...selectedPlaces]; // 컨텍스트의 Place[]
    tempSelected.forEach((p) => {
      const pl = toPlace(p); // 여기서 변환
      if (!merged.some((mp) => mp.id === pl.id)) merged.push(pl);
    });
    setSelectedPlaces(merged);
    router.back();
  };

  // 🇰🇷 좌표 정규화 (AiGuideTab과 동일)
  const inKR = (lat: number, lng: number) =>
    lat >= 33 && lat <= 39 && lng >= 124 && lng <= 132;

  const normalizeCoord = (lat: number, lng: number) => {
    if (inKR(lat, lng)) return [lat, lng] as const;
    if (inKR(lng, lat)) return [lng, lat] as const; // 뒤바뀐 경우 스왑
    return [lat, lng] as const;
  };

  // 카드 터치 시 지도 포커스 + 선택 하이라이트
  const handleSelectOnMap = (place: UiPlace) => {
    let { latitude, longitude } = place.raw;
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      Alert.alert('안내', '이 장소에는 좌표 정보가 없어요.');
      return;
    }
    const [finalLat, finalLng] = normalizeCoord(lat, lng);
    setSelectedPlaceId(place.id);
    // AiGuideTab과 동일하게 지도 이동 (KakaoMapWebView 내부에서 핀 처리)
    mapRef.current?.focusTo(finalLat, finalLng, 4);
  };

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text>불러오는 중…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center', padding: 16 }]}>
        <Text style={{ marginBottom: 12 }}>{error}</Text>
        <TouchableOpacity style={styles.confirmButton} onPress={loadPopular}>
          <Text style={styles.confirmText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="장소 추가" />

      <View style={styles.mapContainer}>
        <KakaoMapWebView
          ref={mapRef}
          jsKey={JS_KEY}
          center={DEFAULT_CENTER}
          level={4}
        />
        {/* 검색창 */}
        <View style={styles.searchBox}>
          <TextInput
            placeholder="가고싶은 장소를 검색해보세요!"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            placeholderTextColor="#666"
          />
          <Image source={require('@/assets/images/icons/search.png')} style={styles.searchIcon} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        style={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.sectionTitle}>
          {showingSearch
            ? (searching
              ? '검색 중…'
              : (searchError
                ? '검색 실패'
                : (list.length === 0 ? '검색 결과가 없습니다.' : `검색 결과 (${list.length}개)`)))
            : 'K-Route가 추천해주는 장소'}
        </Text>

        {list.map((place) => {
          const picked = isAlreadyPicked(place.id);
          const isSelected = selectedPlaceId === place.id;

          return (
            <TouchableOpacity
              key={place.id}
              style={[styles.card, isSelected && styles.cardSelected]}
              activeOpacity={0.85}
              onPress={() => handleSelectOnMap(place)}
            >
              <Image source={place.image} style={styles.placeImage} />
              <View style={styles.info}>
                <Text style={styles.title}>{place.name}</Text>
                <Text style={styles.subtitle}>{place.address}</Text>
                <Text style={styles.time}>{place.time}</Text>
                <Text style={styles.tag}>{place.tag}</Text>
              </View>

              <TouchableOpacity
                style={[styles.plusButton, picked && { backgroundColor: '#E5EAF3' }]}
                onPress={() => (picked ? Alert.alert('안내', '이미 선택하신 장소입니다.') : handleAdd(place))}
                disabled={picked}
              >
                <Image
                  source={require('@/assets/images/icons/plus.png')}
                  style={[styles.plusIcon, picked && { opacity: 0.35 }]}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* {tempSelected.length > 0 && (
        <View style={styles.selectedBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tempSelected.map((place) => (
              <View key={place.id} style={styles.selectedItem}>
                <Image source={place.image} style={styles.selectedImage} />
                <TouchableOpacity style={styles.removeButton} onPress={() => handleRemove(place.id)}>
                  <Text style={styles.removeText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )} */}

      {tempSelected.length > 0 && (
        <View style={styles.selectedBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tempSelected.map((place) => (
              <View key={place.id} style={styles.selectedItem}>
                <Image source={place.image} style={styles.selectedImage} />
                <TouchableOpacity style={styles.removeButton} onPress={() => handleRemove(place.id)}>
                  <Text style={styles.removeText}>×</Text>
                </TouchableOpacity>
                <Text style={styles.selectedLabel} numberOfLines={1}>
                  {place.name}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 하단 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
          <Text style={styles.confirmText}>추가하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  mapContainer: { position: 'relative', width: '100%', height: 280 },
  searchBox: {
    position: 'absolute',
    top: 16, left: 16, right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Pretendard-Medium', color: '#000' },
  searchIcon: { width: 28, height: 28, marginLeft: 8 },

  // 리스트
  scrollContent: { paddingHorizontal: 0, backgroundColor: '#fff' },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#000',
    paddingHorizontal: 16
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 24,
    marginBottom: 0,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#d9d9d9'
  },
  cardSelected: { backgroundColor: '#E7F1FF' },

  placeImage: {
    width: 120, height: 70, borderRadius: 5, resizeMode: 'cover', marginRight: 12,
  },
  info: { flex: 1 },
  title: { fontSize: 14, fontFamily: 'Pretendard-Bold', color: '#000', marginBottom: 0 },
  subtitle: { fontSize: 12, fontFamily: 'Pretendard-Medium', color: '#555' },
  time: { fontSize: 12, fontFamily: 'Pretendard-Medium', color: '#555' },
  tag: { fontSize: 12, fontFamily: 'Pretendard-Medium', color: '#1C5BD8', marginTop: 4 },

  plusButton: {
    width: 36, height: 36, borderRadius: 1000, backgroundColor: '#DFEAFF',
    alignItems: 'center', justifyContent: 'center', marginLeft: 0,
  },
  plusIcon: { width: 14, height: 14 },

  selectedBar: {
    position: 'absolute',
    bottom: 74, // 루트 만들기 버튼 위
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  selectedItem: {
    marginRight: 0,
    width: 100,
    alignItems: 'center',
    position: 'relative',
    justifyContent: "center"
  },
  selectedImage: {
    width: 78,
    height: 50,
    borderRadius: 5,
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#fff',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    elevation: 3,
  },
  removeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C5BD8',
  },

  selectedLabel: {
    color: '#fff',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'Pretendard-Medium',
    width: 100,
  },

  footer: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee',
  },
  confirmButton: {
    backgroundColor: '#1C5BD8',
    paddingVertical: 14,
    borderRadius: 5,
    alignItems: 'center',
    height: 50,
  },
  confirmText: { color: '#fff', fontSize: 16, fontFamily: 'Pretendard-Bold' },
});
