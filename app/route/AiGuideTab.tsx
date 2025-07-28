import { useSelectedRoute } from '@/contexts/SelectedRouteContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Place = {
    id: number;
    name: string;
    address: string;
    time: string;
    tag: string;
    image: any; // require로 불러온 이미지이므로 any로 처리
    isRecommended: boolean;
};

const allPlaces = [
    {
        id: 1,
        name: '설화수 플래그십 스토어',
        address: '서울시 강남구 도산대로',
        time: '11:00 ~ 20:00',
        tag: '스토어',
        image: require('@/assets/images/sample-beauty.png'),
        isRecommended: true,
    },
    {
        id: 2,
        name: '별다방 커피점',
        address: '서울시 마포구 양화로',
        time: '08:00 ~ 22:00',
        tag: '카페',
        image: require('@/assets/images/sample-beauty2.png'),
        isRecommended: true,
    },
    {
        id: 3,
        name: '한강공원 뚝섬지구',
        address: '서울시 성동구',
        time: '24시간',
        tag: '공원',
        image: require('@/assets/images/sample-beauty3.png'),
        isRecommended: false,
    },
    {
        id: 4,
        name: '이태원 앤틱 가구 거리',
        address: '서울시 용산구',
        time: '10:00 ~ 18:00',
        tag: '쇼핑',
        image: require('@/assets/images/sample-stage.png'),
        isRecommended: true,
    },
    {
        id: 5,
        name: 'DDP 디자인 플라자',
        address: '서울시 중구 을지로',
        time: '10:00 ~ 19:00',
        tag: '전시',
        image: require('@/assets/images/sample-stage2.png'),
        isRecommended: false,
    },
];

export default function AiGuideTab() {
    const insets = useSafeAreaInsets();
    const [search, setSearch] = useState('');
    const [input, setInput] = useState('');
    const router = useRouter();
    const [selectedPlaces, setLocalSelectedPlaces] = useState<Place[]>([]);
    const { setSelectedPlaces: setGlobalSelectedPlaces } = useSelectedRoute();

    const handleAddPlace = (place: Place) => {
        if (!selectedPlaces.some((p) => p.id === place.id)) {
            setLocalSelectedPlaces([...selectedPlaces, place]);
        }
    };

    const handleRemovePlace = (id: number) => {
        setLocalSelectedPlaces(selectedPlaces.filter((p) => p.id !== id));
    };

    const filteredPlaces =
        search.trim() === ''
            ? allPlaces.filter((place) => place.isRecommended)
            : allPlaces.filter((place) =>
                place.name.includes(search) ||
                place.address.includes(search) ||
                place.tag.includes(search)
            );

    return (
        <View style={styles.container}>
            {/* 지도 이미지 */}
            <View style={styles.mapContainer}>
                <Image
                    source={require('@/assets/images/sample-map.png')} // 지도 이미지
                    style={styles.map}
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
                    <Image
                        source={require('@/assets/images/icons/search.png')}
                        style={styles.searchIcon}
                    />
                </View>
            </View>


            {/* 장소 리스트 */}
            <ScrollView
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 100,
                }}
                style={styles.scrollContent}
            >
                <Text style={styles.sectionTitle}>
                    {search.trim() === ''
                        ? 'K-Route가 추천해주는 장소'
                        : filteredPlaces.length === 0
                            ? `검색 결과가 없습니다.`
                            : `검색한 장소 (${filteredPlaces.length}개)`}
                </Text>

                {filteredPlaces.map((place) => (
                    <View key={place.id} style={styles.card}>
                        <Image
                            source={place.image}
                            style={styles.placeImage}
                        />
                        <View style={styles.info}>
                            <Text style={styles.title}>{place.name}</Text>
                            <Text style={styles.subtitle}>{place.address}</Text>
                            <Text style={styles.time}>{place.time}</Text>
                            <Text style={styles.tag}>{place.tag}</Text>
                        </View>
                        <TouchableOpacity style={styles.plusButton} onPress={() => handleAddPlace(place)}>
                            <Image
                                source={require('@/assets/images/icons/plus.png')}
                                style={styles.plusIcon}
                            />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>

            {selectedPlaces.length > 0 && (
                <View style={styles.selectedBar}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {selectedPlaces.map((place) => (
                            <View key={place.id} style={styles.selectedItem}>
                                <Image source={place.image} style={styles.selectedImage} />
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => handleRemovePlace(place.id)}
                                >
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

                        // 장소 선택됨 → 전역 상태에 저장 후 페이지 이동
                        setGlobalSelectedPlaces(selectedPlaces)
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
        marginBottom: 0,
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

});
