// app.config.js
import { KAKAO_NATIVE_API_KEY } from 'react-native-dotenv';

export default ({ config }) => ({
  ...config,
  name: "kroute-app",
  slug: "kroute-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "krouteapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.mey.kroute", // iOS bundleId
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    package: "com.mey.kroute", // Android packageName
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
    "expo-font",
    [
      "expo-build-properties",
      {
        android: {
          extraMavenRepos: [
            "https://devrepo.kakao.com/nexus/content/groups/public/",
          ],
        },
      },
    ],
    [
      "@react-native-kakao/core",
      {
        nativeAppKey: {KAKAO_NATIVE_API_KEY},
        android: {
          packageName: "com.mey.kroute",
        },
        ios: {
          bundleId: "com.mey.kroute",
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
});
