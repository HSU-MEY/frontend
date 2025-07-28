import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, View } from 'react-native';

// 컴포넌트 import
import ThemeTitle from '@/components/home/ThemeTitle';
import AIGuideRoutes from '../../components/home/AIGuideRoutes';
import BannerSection from '../../components/home/BannerSection';
import OngoingRoute from '../../components/home/OngoingRoute';
import PopularPlaces from '../../components/home/PopularPlaces';
import type { ThemeCategory } from '../../components/theme/ThemeRouteCards';
import ThemeRouteCards from '../../components/theme/ThemeRouteCards';
import ThemeTabs from '../../components/theme/ThemeTabs';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory>('K-Pop');
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* 배경 파란색 영역 */}
        <View style={styles.headerBackground}>
          {/* 헤더 이미지 */}
          <Image
            source={require('../../assets/images/header.png')} // ← 업로드한 이미지를 이 경로에 넣어주세요
            style={styles.headerImage}
            resizeMode="contain"
          />
        </View>

        {/* 흰색 둥근 네모 컨테이너 */}
        <View style={styles.whiteContainer}>
          <View style={{ padding: 20 }}>
            <OngoingRoute />
            <BannerSection />
            <AIGuideRoutes />
            <ThemeTitle />
            <ThemeTabs selected={selectedCategory} onSelect={setSelectedCategory} />
            <ThemeRouteCards category={selectedCategory} limit={2} />
            <PopularPlaces />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#279FFF',
  },
  headerBackground: {
    backgroundColor: '#279FFF',
    alignItems: 'center',
    paddingTop: 4,
    // paddingBottom: 0,
    marginBottom: -5
  },
  headerImage: {
    width: '100%',
    height: 120,
  },
  whiteContainer: {
    //flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,

    //아래 파란색 배경 안나오게
    marginBottom: -20,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#279FFF', // 파란 배경이 scrollView 전체에 적용되도록
  },
});
