import { fetchPopularPlaces, PopularPlaceDTO, SearchPlaceDTO, searchPlaces } from '@/api/places.service';
import { useSelectedRoute } from '@/contexts/SelectedRouteContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import KakaoMapWebView, { KakaoMapHandle } from '@/components/KakaoMapWebView';
import { KAKAO_JS_API_KEY } from '@/src/env';
import { useTranslation } from 'react-i18next';

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

type UiPlace = {
    id: number;
    name: string;
    address: string;
    time: string;
    tag: string;
    image: any;
    isRecommended: boolean;
    raw: PopularPlaceDTO; // 옵셔널 lat/lng
};

const PLACEHOLDER = require('@/assets/images/placeholder-place.png');

// 요일 한글 맵
// const KR_DAYS: Record<string, string> = {
//     monday: '월', tuesday: '화', wednesday: '수',
//     thursday: '목', friday: '금', saturday: '토', sunday: '일',
// };

function formatOpeningHours(hours: any, daysShort: Record<string, string>, t: (k: string, o?: any) => string): string {
    if (!hours) return t('aiGuide.hoursUnknown');
    if (typeof hours === 'string') return hours;
    if (Array.isArray(hours)) return hours.filter(Boolean).join(', ');

    if (typeof hours === 'object') {
        const mapLabel = (dayKey: string) => {
            const k = dayKey.toLowerCase();
            // monday/tuesday.. or mon/tue.. 모두 처리
            if (k.startsWith('mon')) return daysShort.mon;
            if (k.startsWith('tue')) return daysShort.tue;
            if (k.startsWith('wed')) return daysShort.wed;
            if (k.startsWith('thu')) return daysShort.thu;
            if (k.startsWith('fri')) return daysShort.fri;
            if (k.startsWith('sat')) return daysShort.sat;
            if (k.startsWith('sun')) return daysShort.sun;
            return dayKey;
        };

        const parts = Object.entries(hours)
            .map(([day, val]) => {
                const d = mapLabel(day);
                if (typeof val === 'string') return `${d} ${val}`;
                if (val && typeof val === 'object') {
                    const open = (val as any).open ?? (val as any).start ?? '';
                    const close = (val as any).close ?? (val as any).end ?? '';
                    if (open && close) return `${d} ${open}~${close}`;
                    if (open || close) return `${d} ${open || close}`;
                    return `${d}`;
                }
                return `${d}`;
            })
            .filter(Boolean);

        if (parts.length === 0) return t('aiGuide.hoursUnknown');
        return parts.length <= 2 ? parts.join(' · ') : `${parts.slice(0, 2).join(' · ')} …`;
    }

    return String(hours);
}

function formatThemes(themes: any, t: (k: string) => string): string {
    if (!themes) return t('aiGuide.placeLabelDefault');
    if (typeof themes === 'string') return themes;
    if (Array.isArray(themes)) return themes.filter(Boolean).join(', ');
    if (typeof themes === 'object') {
        const vals = Object.values(themes).filter((v) => typeof v === 'string' && v.trim().length > 0) as string[];
        if (vals.length) return vals.join(', ');
        return Object.keys(themes).join(', ');
    }
    return String(themes);
}

export default function AiGuideTab() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { t, i18n } = useTranslation();

    const [search, setSearch] = useState('');
    const [selectedPlaces, setLocalSelectedPlaces] = useState<Place[]>([]);
    const { setSelectedPlaces: setGlobalSelectedPlaces } = useSelectedRoute();

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
            // 필수 보장: 없으면 빈 문자열로 채워 타입 충족
            latitude: p.raw?.latitude ?? '',
            longitude: p.raw?.longitude ?? '',
        },
    });

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [apiPlaces, setApiPlaces] = useState<PopularPlaceDTO[]>([]);
    const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);

    const [searchResults, setSearchResults] = useState<SearchPlaceDTO[]>([]);
    const [searching, setSearching] = useState(false);        // 검색 API 로딩 상태
    const [searchError, setSearchError] = useState<string | null>(null);

    const mapRef = useRef<KakaoMapHandle>(null);
    const JS_KEY = KAKAO_JS_API_KEY;
    const DEFAULT_CENTER = { lat: 37.5665, lng: 126.9780 }; // 서울시청

    const load = async () => {
        try {
            setError(null);
            const data = await fetchPopularPlaces();
            setApiPlaces(data);
        } catch (e) {
            setError(t('aiGuide.fetchPopularFailed'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    // 언어별 요일 약어 맵 ★
    const DAYS_SHORT = useMemo(() => t('daysShort', { returnObjects: true }) as Record<string, string>, [i18n.language, t]);

    useEffect(() => {
        const q = search.trim();
        setSearchError(null);
        setSearching(false);
        setSearchResults([]);

        if (q.length < 2) return;

        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                setSearching(true);
                const data = await searchPlaces(q, undefined, controller.signal);
                setSearchResults(data);
            } catch (e: any) {
                if (e?.code !== 'ERR_CANCELED') setSearchError(t('aiGuide.searchFailed')); // ★
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => {
            controller.abort();
            clearTimeout(timer);
        };
    }, [search, t]);

    const onRefresh = async () => {
        setRefreshing(true);
        await load();
    };

    const uiPopular: UiPlace[] = useMemo(() => {
        return apiPlaces.map((p) => {
            const name = p.nameKo || p.nameEn || `#${p.id}`;
            const address = typeof p.address === 'string'
                ? p.address
                : (p.regionId ? `Region ${p.regionId}` : t('aiGuide.addressUnknown')); // ★
            const time = formatOpeningHours(p.openingHours, DAYS_SHORT, t); // ★
            const tag = formatThemes(p.themes, t); // ★
            const image = p.imageUrl ? { uri: p.imageUrl } : PLACEHOLDER;
            return { id: p.id, name, address, time, tag, image, isRecommended: true, raw: p };
        });
    }, [apiPlaces, DAYS_SHORT, t]);

    const uiSearched: UiPlace[] = useMemo(() => {
        return searchResults.map((s) => {
            const name = s.nameKo || s.nameEn || `#${s.id}`;
            const address = s.regionId ? `Region ${s.regionId}` : t('aiGuide.addressUnknown'); // ★
            const time = t('aiGuide.hoursUnknown'); // ★
            const tag = t('aiGuide.searchTag'); // ★
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
    }, [searchResults, t]);

    const showingSearch = search.trim().length >= 2;
    const filteredPlaces = useMemo(() => {
        if (showingSearch) return uiSearched;
        return uiPopular.filter((p) => p.isRecommended);
    }, [showingSearch, uiSearched, uiPopular]);

    const handleAddPlace = (place: UiPlace) => {
        setLocalSelectedPlaces(prev => {
            if (prev.some(p => p.id === place.id)) return prev;
            return [...prev, toPlace(place)];
        });
    };

    const handleRemovePlace = (id: number) => {
        setLocalSelectedPlaces(prev => prev.filter(p => p.id !== id));
    };

    const inKR = (lat: number, lng: number) => lat >= 33 && lat <= 39 && lng >= 124 && lng <= 132;

    const normalizeCoord = (lat: number, lng: number) => {
        if (inKR(lat, lng)) return [lat, lng] as const;
        if (inKR(lng, lat)) return [lng, lat] as const;
        return [lat, lng] as const;
    };

    const handleSelectOnMap = (place: UiPlace) => {
        let { latitude, longitude } = place.raw;
        const lat = Number(latitude);
        const lng = Number(longitude);
        if (Number.isNaN(lat) || Number.isNaN(lng)) {
            Alert.alert(t('aiGuide.notice'), t('aiGuide.noCoords'));
            return;
        }
        const [finalLat, finalLng] = normalizeCoord(lat, lng);
        setSelectedPlaceId(place.id);
        mapRef.current?.focusTo(finalLat, finalLng, 4);
    };

    if (loading) {
        return (
            <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
                <ActivityIndicator />
                <Text style={{ marginTop: 8 }}>{t('aiGuide.loading')}</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { alignItems: 'center', justifyContent: 'center', padding: 16 }]}>
                <Text style={{ marginBottom: 12 }}>{error}</Text>
                <TouchableOpacity style={styles.button} onPress={load}>
                    <Text style={styles.buttonText}>{t('aiGuide.retry')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* 지도 */}
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
                        placeholder={t('aiGuide.searchPlaceholder')}
                        value={search}
                        onChangeText={setSearch}
                        style={styles.searchInput}
                        placeholderTextColor="#666"
                    />
                    <Image source={require('@/assets/images/icons/search.png')} style={styles.searchIcon} />
                </View>
            </View>

            {/* 리스트 */}
            <ScrollView
                contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
                style={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <Text style={styles.sectionTitle}>
                    {showingSearch
                        ? (searching
                            ? t('aiGuide.searching')
                            : (searchError
                                ? t('aiGuide.searchFailed')
                                : (filteredPlaces.length === 0
                                    ? t('aiGuide.noResults')
                                    : t('aiGuide.resultsCount', { count: filteredPlaces.length }))))
                        : t('aiGuide.recommendedByKRoute')}
                </Text>

                {filteredPlaces.map((place) => {
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
                            <TouchableOpacity style={styles.plusButton} onPress={() => handleAddPlace(place)}>
                                <Image source={require('@/assets/images/icons/plus.png')} style={styles.plusIcon} />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {selectedPlaces.length > 0 && (
                <View style={styles.selectedBar}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {selectedPlaces.map((place) => (
                            <View key={place.id} style={styles.selectedItem}>
                                <Image source={place.image} style={styles.selectedImage} />
                                <TouchableOpacity style={styles.removeButton} onPress={() => handleRemovePlace(place.id)}>
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
            <View style={styles.fixedButtonContainer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        if (selectedPlaces.length === 0) {
                            Alert.alert(t('aiGuide.notice'), t('aiGuide.selectAtLeastOne'));
                            return;
                        }
                        setGlobalSelectedPlaces(selectedPlaces); // 이제 Place[]라 에러 없음
                        router.push('/route/edit');
                    }}
                >
                    <Text style={styles.buttonText}>{t('route.createRoute')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    mapContainer: { position: 'relative', width: '100%', height: 280 },
    map: { width: '100%', height: '100%', resizeMode: 'cover' },
    searchBox: {
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
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
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Pretendard-Medium',
        color: '#000',
    },
    searchIcon: { width: 28, height: 28, marginLeft: 8 },
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
        paddingVertical: 20,
        marginBottom: 0,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#d9d9d9'
    },
    placeImage: {
        width: 80,
        height: 80,
        borderRadius: 5,
        resizeMode: 'cover',
        marginRight: 20,
        backgroundColor: 'black'
    },
    info: { flex: 1 },
    title: {
        fontSize: 14,
        fontFamily: 'Pretendard-Bold',
        color: '#000',
        marginBottom: 0,
    },
    subtitle: {
        fontSize: 12,
        fontFamily: 'Pretendard-Medium',
        color: '#555',
    },
    time: {
        fontSize: 12,
        fontFamily: 'Pretendard-Medium',
        color: '#555',
    },
    tag: {
        fontSize: 10,
        fontFamily: 'Pretendard-Bold',
        color: '#1C5BD8',
        marginTop: 10,
        backgroundColor: '#ebf1ffff',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    plusButton: {
        width: 36,
        height: 36,
        borderRadius: 1000,
        backgroundColor: '#DFEAFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 0,
    },
    plusIcon: {
        width: 14,
        height: 14
    },
    fixedButtonContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    button: {
        backgroundColor: '#1C5BD8',
        paddingVertical: 14,
        borderRadius: 5,
        alignItems: 'center',
        height: 50,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Pretendard-Bold',
    },
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

    cardSelected: { backgroundColor: '#E7F1FF' },
});
