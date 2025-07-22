import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, View } from 'react-native';

// 컴포넌트 import
import AIGuideRoutes from '../../components/home/AIGuideRoutes';
import BannerSection from '../../components/home/BannerSection';
import OngoingRoute from '../../components/home/OngoingRoute';
import PopularPlaces from '../../components/home/PopularPlaces';
import ThemeRouteCards from '../../components/home/ThemeRouteCards';
import ThemeTabs from '../../components/home/ThemeTabs';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  return (
    <View style={styles.container}>
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
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <OngoingRoute />
          <BannerSection />
          <AIGuideRoutes />
          <ThemeTabs />
          <ThemeRouteCards />
          <PopularPlaces />
        </ScrollView>
      </View>
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
    paddingTop: 35,
    // paddingBottom: 0,
    marginBottom: -5
  },
  headerImage: {
    width: '100%',
    height: 120,
  },
  whiteContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
});
