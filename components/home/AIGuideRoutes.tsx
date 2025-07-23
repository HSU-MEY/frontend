import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const dummyData = [
  {
    id: '1',
    title: 'K-POP 루트: idol',
    location: '서울시 홍대',
    description: '아이돌 본사 방문하고 성지순례하기',
    image: require('../../assets/images/sample-stage.png'),
  },
  {
    id: '2',
    title: 'K-Beauty 루트: Skincare',
    location: '서울시 강남',
    description: '피부과 케어 받고 화장품 쇼핑하기',
    image: require('../../assets/images/sample-beauty.png'),
  },
  {
    id: '3',
    title: 'K-Beauty 루트: Makeup',
    location: '서울시 강남',
    description: 'K-아이돌 메이크업 받기',
    image: require('../../assets/images/sample-beauty2.png'),
  },
  {
    id: '4',
    title: 'K-Drama 루트: 촬영지',
    location: '서울시 마포',
    description: '드라마 명장면 따라가기',
    image: require('../../assets/images/sample-stage2.png'),
  },
  {
    id: '5',
    title: 'K-Fashion 루트',
    location: '서울 성수동',
    description: '국내 로컬 디자이너 브랜드 체험',
    image: require('../../assets/images/sample-beauty.png'),
  },
];

export default function AIGuideRoutes() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* 섹션 제목 */}
      <View style={styles.headerRow}>
        <Image
          source={require('../../assets/images/icons/robot.png')}
          style={styles.icon}
        />
        <Text style={styles.title}>AI 가이드가 추천하는 루트를 만나보세요</Text>
      </View>

      {/* 가로 스크롤 카드 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
        {dummyData.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.cardContainer}
            // onPress={() => router.push(`/route/${item.id}`)} // ← 클릭 시 이동
          >

            <ImageBackground
              source={item.image}
              style={styles.cardImage}
              imageStyle={styles.imageStyle}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']}
                locations={[0.1, 0.5, 0.9]}
                style={styles.overlay}
              >
                <View style={styles.topTextContainer}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardLocation}>{item.location}</Text>
                </View>

                <View style={styles.bottomTextContainer}>
                  <Text style={styles.cardDescription}>{item.description}</Text>
                </View>
              </LinearGradient>
            </ImageBackground>

          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#000',
  },
  cardContainer: {
    marginRight: 12,
  },
  cardImage: {
    width: 147,
    height: 98,
    borderRadius: 5,
    overflow: 'hidden',
    position: 'relative',
  },

  imageStyle: {
    borderRadius: 5,
  },

  overlay: {
    flex: 1,
    padding: 8,
    justifyContent: 'space-between',
    borderRadius: 5,
  },

  topTextContainer: {
    // 자동 정렬
    marginTop: 5
  },

  bottomTextContainer: {
    // 자동 정렬
    marginBottom: 5
  },

  cardTitle: {
    fontSize: 13,
    fontFamily: 'Pretendard-SemiBold',
    color: '#fff',
  },

  cardLocation: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Pretendard-Medium',
    marginTop: 0,
  },

  cardDescription: {
    fontSize: 11,
    color: '#fff',
    fontFamily: 'Pretendard-SemiBold',
  },
});
