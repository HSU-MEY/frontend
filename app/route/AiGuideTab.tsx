import { fetchPopularPlaces, PopularPlaceDTO } from '@/api/places.service';
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

type UiPlace = {
    id: number;
    name: string;
    address: string;
    time: string;
    tag: string;
    image: any;
    isRecommended: boolean;
    raw: PopularPlaceDTO;
};

const PLACEHOLDER = require('@/assets/images/placeholder-place.png');

export default function AiGuideTab() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [search, setSearch] = useState('');
    const [selectedPlaces, setLocalSelectedPlaces] = useState<UiPlace[]>([]);
    const { setSelectedPlaces: setGlobalSelectedPlaces } = useSelectedRoute();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [apiPlaces, setApiPlaces] = useState<PopularPlaceDTO[]>([]);
    const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);

    const mapRef = useRef<KakaoMapHandle>(null);
    const JS_KEY = KAKAO_JS_API_KEY;
    const DEFAULT_CENTER = { lat: 37.5665, lng: 126.9780 }; // 서울시청

    const load = async () => {
        try {
            setError(null);
            const data = await fetchPopularPlaces();
            setApiPlaces(data);
        } catch (e) {
            setError('인기 장소를 불러오지 못했어요.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await load();
    };

    const uiPlaces: UiPlace[] = useMemo(() => {
        return apiPlaces.map((p) => {
            const name = p.nameKo || p.nameEn || `장소 #${p.id}`;
            const address = p.address || (p.regionId ? `Region ${p.regionId}` : '주소 정보 없음');
            const time = p.openingHours || '운영시간 정보 없음';
            const tag = p.themes || '명소';
            const image = p.imageUrl ? { uri: p.imageUrl } : PLACEHOLDER;

            return {
                id: p.id,
                name,
                address,
                time,
                tag,
                image,
                isRecommended: true,
                raw: p,
            };
        });
    }, [apiPlaces]);

    const filteredPlaces = useMemo(() => {
        return (search.trim() === ''
            ? uiPlaces.filter((p) => p.isRecommended)
            : uiPlaces.filter(
                (p) =>
                    p.name.includes(search) ||
                    p.address.includes(search) ||
                    p.tag.includes(search)
            )
        );
    }, [uiPlaces, search]);

    const handleAddPlace = (place: UiPlace) => {
        if (!selectedPlaces.some((p) => p.id === place.id)) {
            setLocalSelectedPlaces((prev) => [...prev, place]);
        }
    };

    const handleRemovePlace = (id: number) => {
        setLocalSelectedPlaces((prev) => prev.filter((p) => p.id !== id));
    };

    const handleSelectOnMap = (place: UiPlace) => {
        const { latitude, longitude } = place.raw;
        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            Alert.alert('안내', '이 장소에는 좌표 정보가 없어요.');
            return;
        }
        setSelectedPlaceId(place.id);
        // 중심 이동 + 단일 마커
        mapRef.current?.focusTo(latitude, longitude, 4);
    };

    if (loading) {
        return (
            <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
                <ActivityIndicator />
                <Text style={{ marginTop: 8 }}>불러오는 중…</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { alignItems: 'center', justifyContent: 'center', padding: 16 }]}>
                <Text style={{ marginBottom: 12 }}>{error}</Text>
                <TouchableOpacity style={styles.button} onPress={load}>
                    <Text style={styles.buttonText}>다시 시도</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* 지도 영역: KakaoMapWebView 사용 */}
            <View style={styles.mapContainer}>
                <KakaoMapWebView
                    ref={mapRef}
                    jsKey={JS_KEY}
                    center={DEFAULT_CENTER}
                    level={4}
                    onReady={() => {
                        // 초기 포커스가 필요하면 여기에 추가
                        // if (uiPlaces[0]?.raw) handleSelectOnMap(uiPlaces[0]);
                    }}
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

            {/* 장소 리스트 */}
            <ScrollView
                contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
                style={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <Text style={styles.sectionTitle}>
                    {search.trim() === ''
                        ? 'K-Route가 추천해주는 장소'
                        : filteredPlaces.length === 0
                            ? '검색 결과가 없습니다.'
                            : `검색한 장소 (${filteredPlaces.length}개)`}
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

            {/* 하단 고정 버튼 */}
            <View style={styles.fixedButtonContainer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        if (selectedPlaces.length === 0) {
                            Alert.alert('안내', '장소를 한 개 이상 선택해주세요.');
                            return;
                        }
                        setGlobalSelectedPlaces(selectedPlaces);
                        router.push('/route/edit');
                    }}
                >
                    <Text style={styles.buttonText}>루트 만들기</Text>
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
        paddingVertical: 24,
        marginBottom: 0,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#d9d9d9'
    },
    placeImage: {
        width: 120,
        height: 70,
        borderRadius: 5,
        resizeMode: 'cover',
        marginRight: 12,
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
        fontSize: 12,
        fontFamily: 'Pretendard-Medium',
        color: '#1C5BD8',
        marginTop: 4,
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
