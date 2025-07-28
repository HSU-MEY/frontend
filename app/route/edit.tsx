import Header from '@/components/common/Header';
import { useSelectedRoute } from '@/contexts/SelectedRouteContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
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

    const handleDelete = (id: number) => {
        const updated = selectedPlaces.filter((place) => place.id !== id);
        setSelectedPlaces(updated);
    };

    const renderItem = ({ item, index }: any) => (
        <View style={styles.cardWrap}>
            {index !== 0 && <View style={styles.verticalLine} />}

            <View style={styles.card}>
                {/* X 삭제 버튼 */}
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

                        {/* 순서 이동 버튼 */}
                        <View style={styles.orderButtons}>
                            <TouchableOpacity onPress={() => moveItem(index, index - 1)}>
                                <Ionicons name="arrow-up" size={18} color="#1C5BD8" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => moveItem(index, index + 1)}>
                                <Ionicons
                                    name="arrow-down"
                                    size={18}
                                    color="#1C5BD8"
                                    style={{ marginTop: 4 }}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* 상세 보기 화살표 */}
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
        </View>
    );

    const moveItem = (fromIndex: number, toIndex: number) => {
        if (toIndex < 0 || toIndex >= selectedPlaces.length) return;

        const updated = [...selectedPlaces];
        const [movedItem] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, movedItem);
        setSelectedPlaces(updated);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <Header title="루트 편집" />

            <Image
                source={require('@/assets/images/sample-route.png')}
                style={styles.mapimage}
                resizeMode="cover"
            />

            <View style={styles.routeInfo}>
                <Text style={styles.routeTitle}>K-Beauty 추천 루트: Skincare</Text>
                <Text style={styles.routeSub}>
                    서울시 홍대{'\n'}예상 시간: 5시간 30분  |  예상 비용: 54,000원
                </Text>
                <Text style={styles.tip}>장소를 삭제할 수 있어요!</Text>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => router.push('/route/add')}
                >
                    <Text style={styles.addButtonText}>장소 추가하기</Text>
                </TouchableOpacity>
            </View>

            {selectedPlaces.length === 0 ? (
                <Text style={styles.empty}>선택된 장소가 없습니다.</Text>
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
                                        <View style={styles.orderButtons}>
                                            <TouchableOpacity onPress={() => moveItem(index, index - 1)}>
                                                <Ionicons name="arrow-up" size={18} color="#1C5BD8" />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => moveItem(index, index + 1)}>
                                                <Ionicons name="arrow-down" size={18} color="#1C5BD8" style={{ marginTop: 4 }} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.iconBackground}>
                                    <Ionicons name="chevron-forward" size={24} color="#1C5BD8" />
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            <View style={styles.bottomButtonWrapper}>
                <TouchableOpacity
                 onPress={() => router.push('/route/route-overview')}
                >
                    <LinearGradient
                        colors={['#69E8D9', '#0080FF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.startButton}
                    >
                        <Text style={styles.startButtonText}>루트 시작하기</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    mapimage: {
        width: '100%',
        height: 220,
        //aspectRatio: 1.5,
        //height: 220
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
        paddingVertical: 12,
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
    orderButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginLeft: 8,
    },
    scrollContent: {
        paddingBottom: 80,
    },
    iconBackground: {
        width: 32,
        height: 32,
        borderRadius: 18, // 반지름 = 지름 / 2
        backgroundColor: '#DFEAFF',
        justifyContent: 'center',
        alignItems: 'center',
    }

});
