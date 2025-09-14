import { createRouteByAiGuideApi } from '@/api/routes.service';
import KakaoMapWebView, { KakaoMapHandle } from '@/components/KakaoMapWebView';
import Header from '@/components/common/Header';
import { useSelectedRoute } from '@/contexts/SelectedRouteContext';
import { KAKAO_JS_API_KEY } from '@/src/env';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function EditRouteScreen() {
    const { selectedPlaces, setSelectedPlaces } = useSelectedRoute();
    const router = useRouter();
    const mapRef = useRef<KakaoMapHandle>(null);
    const JS_KEY = KAKAO_JS_API_KEY;
    const [isMapReady, setMapReady] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        if (isMapReady && mapRef.current && selectedPlaces.length > 0) {
            const coords = selectedPlaces
                .map(p => ({
                    lat: Number(p.raw.latitude),
                    lng: Number(p.raw.longitude),
                }))
                .filter(c => !Number.isNaN(c.lat) && !Number.isNaN(c.lng));

            if (coords.length > 0) {
                mapRef.current.addMarkers(coords);
            }
        }
    }, [selectedPlaces, isMapReady]);

    const handleDelete = (id: number) => {
        const updated = selectedPlaces.filter((place) => place.id !== id);
        setSelectedPlaces(updated);
    };

    const handleCreate = async () => {
        const selectedPlaceId = selectedPlaces.map((place) => place.id);
        const res = await createRouteByAiGuideApi(selectedPlaceId);

        const createdRouteId = res.result.routeId;

        router.replace(`/route/route-overview/${createdRouteId}`);
    };

    // const renderItem = ({ item, index }: any) => (
    //     <View style={styles.cardWrap}>
    //         {index !== 0 && <View style={styles.verticalLine} />}

    //         <View style={styles.card}>
    //             {/* X 삭제 버튼 */}
    //             <TouchableOpacity
    //                 style={styles.closeCircle}
    //                 onPress={() => handleDelete(item.id)}
    //             >
    //                 <Text style={styles.closeX}>×</Text>
    //             </TouchableOpacity>

    //             <Image source={item.image} style={styles.image} />

    //             <View style={styles.info}>
    //                 <Text style={styles.name}>{item.name}</Text>
    //                 <Text style={styles.address}>{item.address}</Text>
    //                 <Text style={styles.time}>{item.time}</Text>
    //                 <View style={styles.bottomRow}>
    //                     <Text style={styles.tag}>{item.tag}</Text>

    //                     {/* 순서 이동 버튼 */}
    //                     <View style={styles.orderButtons}>
    //                         <TouchableOpacity onPress={() => moveItem(index, index - 1)}>
    //                             <Ionicons name="arrow-up" size={18} color="#1C5BD8" />
    //                         </TouchableOpacity>
    //                         <TouchableOpacity onPress={() => moveItem(index, index + 1)}>
    //                             <Ionicons
    //                                 name="arrow-down"
    //                                 size={18}
    //                                 color="#1C5BD8"
    //                                 style={{ marginTop: 4 }}
    //                             />
    //                         </TouchableOpacity>
    //                     </View>
    //                 </View>
    //             </View>

    //             {/* 상세 보기 화살표 */}
    //             <Ionicons name="chevron-forward" size={20} color="#ccc" />
    //         </View>
    //     </View>
    // );

    const moveItem = (fromIndex: number, toIndex: number) => {
        if (toIndex < 0 || toIndex >= selectedPlaces.length) return;

        const updated = [...selectedPlaces];
        const [movedItem] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, movedItem);
        setSelectedPlaces(updated);
    };

    return (
        <View style={styles.container}>
            <Header title={t('routeEdit.title')} />
            <View style={styles.mapContainer}>
                <KakaoMapWebView
                    ref={mapRef}
                    jsKey={JS_KEY}
                    style={styles.map}
                    onReady={() => setMapReady(true)}
                />
            </View>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>

                <View style={styles.routeInfo}>
                    <Text style={styles.routeTitle}>{t('routeEdit.createCustom')}</Text>
                    <Text style={styles.routeSub}>
                        {t('routeEdit.selectedCount', { count: selectedPlaces.length })}
                    </Text>
                    <Text style={styles.tip}>{t('routeEdit.tip')}</Text>

                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => router.push('/route/add')}
                    >
                        <Text style={styles.addButtonText}>{t('routeEdit.addPlace')}</Text>
                    </TouchableOpacity>
                </View>

                {selectedPlaces.length === 0 ? (
                    <Text style={styles.empty}>{t('routeEdit.empty')}</Text>
                ) : (
                    <View style={styles.listContainer}>
                        {selectedPlaces.map((item, index) => (
                            <View key={item.id} style={styles.cardWrap}>
                                {index !== 0 && <View style={styles.verticalLine} />}
                                <View style={styles.card}>
                                    <TouchableOpacity
                                        style={styles.closeCircle}
                                        onPress={() => handleDelete(item.id)}
                                    >
                                        <Text style={styles.closeX}>×</Text>
                                    </TouchableOpacity>

                                    <Image source={item.image} style={styles.image} />

                                    <View style={styles.info}>
                                        <Text style={styles.name}>{item.name}</Text>
                                        <Text style={styles.address}>{item.address}</Text>
                                        <Text style={styles.time}>{item.time}</Text>

                                        <View style={styles.bottomRow}>
                                            <Text style={styles.tag}>{item.tag}</Text>
                                            {/* <View style={styles.orderButtons}>
                                                <TouchableOpacity onPress={() => moveItem(index, index - 1)}>
                                                    <Ionicons name="arrow-up" size={18} color="#1C5BD8" />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => moveItem(index, index + 1)}>
                                                    <Ionicons name="arrow-down" size={18} color="#1C5BD8" style={{ marginTop: 4 }} />
                                                </TouchableOpacity>
                                            </View> */}
                                        </View>
                                    </View>

                                    {/* <View style={styles.iconBackground}>
                                        <TouchableOpacity
                                            onPress={() =>
                                                router.push({
                                                    pathname: '/place/place-detail/[id]',
                                                    params: { id: String(item.raw?.id ?? item.id) },
                                                })
                                            }
                                        >
                                            <Ionicons name="chevron-forward" size={24} color="#1C5BD8" />
                                        </TouchableOpacity>
                                    </View> */}

                                    <View style={styles.rightControls}>
                                        <TouchableOpacity
                                            disabled={index === 0}
                                            onPress={() => moveItem(index, index - 1)}
                                            style={[styles.iconCircleSmall, index === 0 && styles.iconDisabled]}
                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        >
                                            <Ionicons name="arrow-up" size={18} color="#1C5BD8" />
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() =>
                                                router.push({
                                                    pathname: '/place/place-detail/[id]',
                                                    params: { id: String(item.raw?.id ?? item.id) },
                                                })
                                            }
                                            style={styles.iconCircleSmall}
                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        >
                                            <Ionicons name="chevron-forward" size={18} color="#1C5BD8" />
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            disabled={index === selectedPlaces.length - 1}
                                            onPress={() => moveItem(index, index + 1)}
                                            style={[
                                                styles.iconCircleSmall,
                                                index === selectedPlaces.length - 1 && styles.iconDisabled
                                            ]}
                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        >
                                            <Ionicons name="arrow-down" size={18} color="#1C5BD8" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                <View style={styles.bottomButtonWrapper}>
                    <TouchableOpacity
                        onPress={handleCreate}
                    >
                        <LinearGradient
                            colors={['#69E8D9', '#0080FF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.startButton}
                        >
                            <Text style={styles.startButtonText}>{t('routeEdit.start')}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    mapContainer: {
        width: '100%',
        height: 220,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    routeInfo: {
        paddingHorizontal: 16,
        paddingVertical: 20,
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0, // Android용 그림자
    },
    routeTitle: {
        fontSize: 16,
        fontFamily: 'Pretendard-Bold',
        marginBottom: 0,
    },
    routeSub: {
        fontSize: 13,
        color: '#333',
        fontFamily: 'Pretendard-Medium',
        marginBottom: 12,
    },
    tip: {
        fontSize: 13,
        color: '#333',
        fontFamily: 'Pretendard-Medium',
        marginBottom: 12,
    },
    addButton: {
        backgroundColor: '#1C5BD8',
        paddingVertical: 16,
        borderRadius: 5,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 0,
        paddingVertical: 20
    },
    cardWrap: {
        alignItems: 'center',
    },
    verticalLine: {
        width: 2,
        height: 20,
        backgroundColor: '#1C5BD8',
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        //marginTop: 12,
        alignItems: 'center',
        width: screenWidth - 32,
        paddingVertical: 20,
        paddingHorizontal: 12
    },
    closeBtn: {
        position: 'absolute',
        top: 6,
        left: 6,
        zIndex: 10,
        padding: 6,
    },
    closeText: {
        fontSize: 18,
        color: '#aaa',
    },
    image: {
        width: 100,
        height: 70,
        borderRadius: 5,
        marginRight: 12,
    },
    info: {
        flex: 1,
        marginRight: 10,
        // backgroundColor: 'black'
    },
    name: {
        fontSize: 14,
        fontFamily: 'Pretendard-Bold'
    },
    address: {
        fontSize: 12,
        color: '#565656',
        fontFamily: 'Pretendard-Medium'
    },
    time: {
        fontSize: 12,
        color: '#565656',
        fontFamily: 'Pretendard-Medium'
    },
    tag: {
        fontSize: 12,
        color: '#1C5BD8',
        marginTop: 4,
        fontFamily: 'Pretendard-Medium'
    },
    empty: {
        textAlign: 'center',
        color: '#888',
        marginTop: 40,
    },
    startButton: {
        borderRadius: 5,
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: 'center',
        height: 50
    },
    startButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    // fixedButtonContainer: {
    //     position: 'absolute',
    //     left: 0,
    //     right: 0,
    //     bottom: 0,
    //     paddingHorizontal: 16,
    //     paddingTop: 12,
    //     paddingBottom: 12,
    //     backgroundColor: '#fff',
    //     borderTopWidth: 1,
    //     borderTopColor: '#eee',
    // },
    bottomButtonWrapper: {
        marginTop: 24,
        paddingHorizontal: 16,
        paddingBottom: 40, // 여유 있게 아래 여백
    },
    closeCircle: {
        position: 'absolute',
        top: -10,
        left: -5,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#DFF1FF',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    closeX: {
        color: '#1C5BD8',
        fontSize: 16,
        fontWeight: 'bold',
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    scrollContent: {
        paddingBottom: 80,
    },

    rightControls: {
        alignSelf: 'stretch',          // 카드 높이를 따라 세로로 꽉 차게
        justifyContent: 'space-between', // 위/가운데/아래 배치
        alignItems: 'center',
        marginLeft: 8,
        paddingVertical: 2
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#DFEAFF',
        justifyContent: 'center',
        alignItems: 'center'
    },
    iconCircleSmall: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#DFEAFF',
        justifyContent: 'center',
        alignItems: 'center'
    },
    iconDisabled: {
        opacity: 0.35
    },
});
