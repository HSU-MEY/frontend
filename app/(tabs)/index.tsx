import { useAuthSession } from '@/hooks/useAuthSession';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 컴포넌트 import
import LanguagePicker from '@/components/common/LanguagePicker';
import ThemeTitle from '@/components/home/ThemeTitle';
import { useTranslation } from 'react-i18next';
import AIGuideRoutes from '../../components/home/AIGuideRoutes';
import BannerSection from '../../components/home/BannerSection';
import OngoingRoute from '../../components/home/OngoingRoute';
import PopularPlaces from '../../components/home/PopularPlaces';
import type { ThemeCategory } from '../../components/theme/ThemeRouteCards';
import ThemeRouteCards from '../../components/theme/ThemeRouteCards';
import ThemeTabs from '../../components/theme/ThemeTabs';

const { width } = Dimensions.get('window');

// 비로그인 시 보여줄 컴포넌트
const LoginPrompt = () => {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <View style={styles.promptContainer}>
      <Text style={styles.promptText}>{t('home.loginPrompt')}</Text>
      <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/account/login')}>
        <Text style={styles.loginButtonText}>{t('auth.loginOrSignup')}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory>('K-Pop');
  const router = useRouter();
  const isFocused = useIsFocused();

  const { accessToken, ensureValidAccessToken } = useAuthSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isFocused) {
      setIsLoading(true);
      ensureValidAccessToken().finally(() => setIsLoading(false));
    }
  }, [isFocused, ensureValidAccessToken]);

  // 로딩 중일 때 전체 화면 로딩 인디케이터 표시
  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: 'white' }]}>
        <ActivityIndicator size="large" color="#279FFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* 배경 파란색 영역 */}
        <View style={styles.headerBackground}>
          {/* 헤더 이미지 */}
          <Image
            source={require('../../assets/images/header.png')}
            style={styles.headerImage}
            resizeMode="contain"
          />
        </View>

        {/* 흰색 둥근 네모 컨테이너 */}
        <View style={styles.whiteContainer}>
          <View style={{ padding: 20 }}>
            <LanguagePicker />
            {accessToken ? (
              <>
                <OngoingRoute />
              </>
            ) : (
              <></>
            )}
            <BannerSection />
            {accessToken ? (
              <>
                <AIGuideRoutes />
              </>
            ) : (
              <LoginPrompt />
            )}

            <ThemeTitle />
            <ThemeTabs selected={selectedCategory} onSelect={setSelectedCategory} />

            {accessToken ? (
              <>
                <ThemeRouteCards category={selectedCategory} limit={2} />
                <PopularPlaces />
              </>
            ) : (
              <LoginPrompt />
            )}
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
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBackground: {
    backgroundColor: '#279FFF',
    alignItems: 'center',
    paddingTop: 4,
    marginBottom: -5,
  },
  headerImage: {
    width: '100%',
    height: 120,
  },
  whiteContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: -20,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#279FFF',
  },
  // 로그인 프롬프트 스타일
  promptContainer: {
    backgroundColor: '#f0f4ff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginVertical: 20,
  },
  promptText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#279FFF',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
