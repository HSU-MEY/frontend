import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { SelectedRouteProvider } from '@/contexts/SelectedRouteContext';
import { useColorScheme } from '@/hooks/useColorScheme';

import { initializeKakaoSDK } from '@react-native-kakao/core';

import { KAKAO_NATIVE_API_KEY } from '@/src/env';

export default function RootLayout() {
  initializeKakaoSDK(KAKAO_NATIVE_API_KEY);

  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
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

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
                <Stack.Screen name="place/place-detail" options={{ headerShown: false }} />
                <Stack.Screen name="place/place-detail/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="place/place-favorite" options={{ headerShown: false }} />
                <Stack.Screen name="account/edit-profile" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
            </SelectedRouteProvider>
            <StatusBar style="auto" />
          </SafeAreaView>
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
