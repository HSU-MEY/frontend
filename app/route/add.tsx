import Header from '@/components/common/Header';
import { useSelectedRoute } from '@/contexts/SelectedRouteContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Place = {
  id: number;
  name: string;
  address: string;
  time: string;
  tag: string;
  image: any;
  isRecommended: boolean;
};

const allPlaces: Place[] = [
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
];

export default function AddRouteScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { selectedPlaces, setSelectedPlaces } = useSelectedRoute();

  const [search, setSearch] = useState('');
  const [tempSelected, setTempSelected] = useState<Place[]>([]);

  const handleAdd = (place: Place) => {
    if (!tempSelected.some((p) => p.id === place.id) && !selectedPlaces.some((p) => p.id === place.id)) {
      setTempSelected([...tempSelected, place]);
    }
  };

  const handleRemove = (id: number) => {
    setTempSelected(tempSelected.filter((p) => p.id !== id));
  };

  const handleConfirm = () => {
    if (tempSelected.length === 0) {
      Alert.alert('장소를 선택해주세요!');
      return;
    }
    // 중복 없이 병합
    const merged = [...selectedPlaces];
    tempSelected.forEach((p) => {
      if (!merged.some((mp) => mp.id === p.id)) {
        merged.push(p);
      }
    });

    setSelectedPlaces(merged);
    router.back(); // edit.tsx로 되돌아가기
  };

  const filtered = search.trim() === ''
    ? allPlaces.filter((p) => p.isRecommended)
    : allPlaces.filter((p) =>
      p.name.includes(search) || p.address.includes(search) || p.tag.includes(search)
    );

  return (
    <View style={styles.container}>
      <Header title="장소 추가" />

      {/* 검색창 */}
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

      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
        }}
        style={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>
          {search.trim() === ''
            ? 'K-Route가 추천해주는 장소'
            : filtered.length === 0
              ? '검색 결과가 없습니다.'
              : `검색한 장소 (${filtered.length}개)`}
        </Text>

        {filtered.map((place) => (
          <View key={place.id} style={styles.card}>
            <Image source={place.image} style={styles.placeImage} />
            <View style={styles.info}>
              <Text style={styles.title}>{place.name}</Text>
              <Text style={styles.subtitle}>{place.address}</Text>
              <Text style={styles.time}>{place.time}</Text>
              <Text style={styles.tag}>{place.tag}</Text>
            </View>
            <TouchableOpacity style={styles.plusButton} onPress={() => handleAdd(place)}>
              <Image source={require('@/assets/images/icons/plus.png')}
                style={styles.plusIcon} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {tempSelected.length > 0 && (
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


  input: {
    flex: 1,
    height: 44,
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: '#999',
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
  image: {
    width: 80,
    height: 60,
    borderRadius: 6,
    marginRight: 12,
  },
  name: {
    fontSize: 14,
    fontFamily: 'Pretendard-Bold',
    color: '#000',
  },
  sub: {
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: '#555',
  },
  addBtn: {
    width: 32,
    height: 32,
    backgroundColor: '#DFEAFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBar: {
    position: 'absolute',
    bottom: 74,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  selectedItem: {
    width: 80,
    marginRight: 8,
    position: 'relative',
  },
  selectedImage: {
    width: 80,
    height: 50,
    borderRadius: 6,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    left: -6,
    backgroundColor: '#fff',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  removeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1C5BD8',
  },
  footer: {
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
  confirmButton: {
    backgroundColor: '#1C5BD8',
    paddingVertical: 14,
    borderRadius: 5,
    alignItems: 'center',
    height: 50,
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
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
});
