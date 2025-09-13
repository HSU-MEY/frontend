// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { SelectedRouteProvider } from '@/contexts/SelectedRouteContext';
import { useColorScheme } from '@/hooks/useColorScheme';

import { KAKAO_NATIVE_API_KEY } from '@/src/env';
//import { initializeKakaoSDK } from '@react-native-kakao/core';
import Constants from 'expo-constants';

// i18n 추가
import i18n, { initI18n } from '@/i18n';
import { I18nextProvider } from 'react-i18next';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Pretendard-Black': require('../assets/fonts/Pretendard-Black.ttf'),
    'Pretendard-Bold': require('../assets/fonts/Pretendard-Bold.ttf'),
    'Pretendard-ExtraBold': require('../assets/fonts/Pretendard-ExtraBold.ttf'),
    'Pretendard-ExtraLight': require('../assets/fonts/Pretendard-ExtraLight.ttf'),
    'Pretendard-Light': require('../assets/fonts/Pretendard-Light.ttf'),
    'Pretendard-Medium': require('../assets/fonts/Pretendard-Medium.ttf'),
    'Pretendard-Regular': require('../assets/fonts/Pretendard-Regular.ttf'),
    'Pretendard-SemiBold': require('../assets/fonts/Pretendard-SemiBold.ttf'),
    'Pretendard-Thin': require('../assets/fonts/Pretendard-Thin.ttf'),
  });

  // i18n 준비 여부
  const [i18nReady, setI18nReady] = useState(false);

  // Kakao SDK는 최초 1회만 초기화
  // useEffect(() => {
  //   initializeKakaoSDK(KAKAO_NATIVE_API_KEY);
  // }, []);
  useEffect(() => {
    const isExpoGo = Constants.appOwnership === 'expo';

    if (isExpoGo) {
      // Expo Go에서는 네이티브 모듈 사용 불가 → 지도(JS SDK)는 그대로 사용 가능
      return;
    }

    (async () => {
      try {
        const { initializeKakaoSDK } = await import('@react-native-kakao/core'); // 동적 import
        await initializeKakaoSDK(KAKAO_NATIVE_API_KEY);
      } catch (e) {
        console.warn('Kakao native init skipped:', e);
      }
    })();
  }, []);

  // i18n 비동기 초기화
  useEffect(() => {
    initI18n().then(() => setI18nReady(true));
  }, []);

  // 폰트/i18n 준비 전에는 렌더링 지연 (스플래시 대체 가능)
  if (!fontsLoaded || !i18nReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
              <SelectedRouteProvider>
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="route/route" options={{ headerShown: false }} />
                  <Stack.Screen name="route/start" options={{ headerShown: false }} />
                  <Stack.Screen name="route/edit" options={{ headerShown: false }} />
                  <Stack.Screen name="route/add" options={{ headerShown: false }} />
                  <Stack.Screen name="route/route-overview/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="route/route-step/[id]/[step]" options={{ headerShown: false }} />
                  <Stack.Screen name="routehistory/ongoing" options={{ headerShown: false }} />
                  <Stack.Screen name="routehistory/pending" options={{ headerShown: false }} />
                  <Stack.Screen name="routehistory/completed" options={{ headerShown: false }} />
                  {/* <Stack.Screen name="place/place-detail" options={{ headerShown: false }} /> */}
                  <Stack.Screen name="place/place-detail/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="place/place-favorite" options={{ headerShown: false }} />
                  <Stack.Screen name="account/edit-profile" options={{ headerShown: false }} />
                  <Stack.Screen name="account/privacy-policy" options={{ headerShown: false }} />
                  <Stack.Screen name="account/register" options={{ headerShown: false }} />
                  <Stack.Screen name="account/login" options={{ headerShown: false }} />
                  <Stack.Screen name="account/reset-password" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
              </SelectedRouteProvider>
              <StatusBar style="auto" />
            </SafeAreaView>
          </SafeAreaProvider>
        </ThemeProvider>
      </I18nextProvider>
    </GestureHandlerRootView>
  );
}
