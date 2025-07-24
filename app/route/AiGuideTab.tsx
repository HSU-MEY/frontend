import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// (더미 이미지로 대체하거나 지도 API 쓸 경우 위쪽에서 import)

export default function AiGuideTab() {
    const insets = useSafeAreaInsets();
    const [search, setSearch] = useState('');

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
                        placeholderTextColor="#999"
                    />
                    <Image
                        source={require('@/assets/images/icons/search.png')}
                        style={styles.searchIcon}
                    />
                </View>
            </View>

            {/* 장소 리스트 */}
            <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }} style={styles.scrollContent}>
                <Text style={styles.sectionTitle}>🔥 K-Route가 추천해주는 장소</Text>

                {/* 추천 카드 반복 */}
                {[1, 2, 3, 4, 5].map((_, idx) => (
                    <View key={idx} style={styles.card}>
                        <Image
                            source={require('@/assets/images/sample-beauty.png')}
                            style={styles.placeImage}
                        />
                        <View style={styles.info}>
                            <Text style={styles.title}>설화수 플래그십 스토어</Text>
                            <Text style={styles.subtitle}>서울시 강남구 도산대로</Text>
                            <Text style={styles.time}>11:00 ~ 20:00</Text>
                            <Text style={styles.tag}>스토어</Text>
                        </View>
                        <TouchableOpacity style={styles.plusButton}>
                            <Text style={{ fontSize: 24, color: '#1C5BD8' }}>＋</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>

            {/* 하단 고정 버튼 */}
            <View style={styles.fixedButtonContainer}>
                <TouchableOpacity style={styles.button}
                // onPress={() => router.push('./start')}
                >
                    <Text style={styles.buttonText}>루트 만들기</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    mapContainer: {
        position: 'relative',
        width: '100%',
        height: 250, // 지도 높이
    },
    map: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    searchBox: {
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Pretendard-Medium',
        color: '#000',
    },
    searchIcon: {
        width: 18,
        height: 18,
        tintColor: '#999',
        marginLeft: 8,
    },
    scrollContent: {
        paddingHorizontal: 16,
        backgroundColor: '#fff',
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Pretendard-Bold',
        marginTop: 20,
        marginBottom: 12,
        color: '#000',
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#F3F7FF',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',
    },
    placeImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        resizeMode: 'cover',
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontFamily: 'Pretendard-Bold',
        color: '#000',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 12,
        fontFamily: 'Pretendard-Regular',
        color: '#555',
    },
    time: {
        fontSize: 12,
        fontFamily: 'Pretendard-Regular',
        color: '#555',
    },
    tag: {
        fontSize: 12,
        fontFamily: 'Pretendard-Medium',
        color: '#1C5BD8',
        marginTop: 4,
    },
    plusButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#EDF3FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    bottomButton: {
        position: 'absolute',
        left: 16,
        right: 16,
        backgroundColor: '#1C5BD8',
        paddingVertical: 14,
        borderRadius: 6,
        alignItems: 'center',
    },
    bottomButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Pretendard-Bold',
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
});
