import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PopularPlaces() {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Image
          source={require('../../assets/images/icons/like.png')}
          style={styles.icon}
        />
        <Text style={styles.title}>K-Route에서 다들 만족하는 장소예요</Text>
      </View>

      {/* 카드 리스트 */}
      <View style={styles.cardList}>
        <PopularPlaceCard
          image={require('../../assets/images/sample-beauty3.png')}
          title="설화수 플래그십 스토어"
          location="서울 강남구 도산대로 45길 18, 11:00 ~ 20:00"
          description="한국 전통 미와 현대 뷰티를 결합한 고급 브랜드 설화수의 대표 매장. 제품 체험은 물론, 맞춤형 스킨케어와 스파 프로그램도 가능. 외국인 관광객 대상 영문 서비스 지원."
        />
        <PopularPlaceCard
          image={require('../../assets/images/sample-beauty3.png')}
          title="ADER Error 성수 쇼룸"
          location="서울 성동구 연무장길 18, 12:00 ~ 20:00"
          description="글로벌하게 주목받고 있는 국내 디자이너 브랜드 ADER Error의 쇼룸 겸 매장. 실험적인 디자인과 감각적인 인테리어가 어우러진 트렌디 스팟."
        />
      </View>
    </View>
  );
}

function PopularPlaceCard({
  image,
  title,
  location,
  description,
}: {
  image: any;
  title: string;
  location: string;
  description: string;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => router.push('place/place-detail')}>
      <Image source={image} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardLocation}>{location}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
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
    fontFamily: 'Pretendard-Bold',
    color: '#000',
  },

  cardList: {
    marginTop: 14,
    gap: 16,
  },
  card: {
    width: '100%',
    height: 231,
    borderRadius: 5,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 118,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
    marginBottom: 0,
  },
  cardLocation: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: '#666',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: '#666',
  },
});
