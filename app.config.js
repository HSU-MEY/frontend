// // app.config.js
// import { KAKAO_NATIVE_API_KEY } from 'react-native-dotenv';

// export default ({ config }) => ({
//   ...config,
//   name: "kroute-app",
//   slug: "kroute-app",
//   version: "1.0.0",
//   orientation: "portrait",
//   icon: "./assets/images/icon.png",
//   scheme: "krouteapp",
//   userInterfaceStyle: "automatic",
//   newArchEnabled: true,
//   ios: {
//     supportsTablet: true,
//     bundleIdentifier: "com.mey.kroute", // iOS bundleId
//   },
//   android: {
//     adaptiveIcon: {
//       foregroundImage: "./assets/images/adaptive-icon.png",
//       backgroundColor: "#ffffff",
//     },
//     edgeToEdgeEnabled: true,
//     package: "com.mey.kroute", // Android packageName
//   },
//   web: {
//     bundler: "metro",
//     output: "static",
//     favicon: "./assets/images/favicon.png",
//   },
//   plugins: [
//     "expo-router",
//     [
//       "expo-splash-screen",
//       {
//         image: "./assets/images/splash-icon.png",
//         imageWidth: 200,
//         resizeMode: "contain",
//         backgroundColor: "#ffffff",
//       },
//     ],
//     "expo-font",
//     [
//       "expo-build-properties",
//       {
//         android: {
//           extraMavenRepos: [
//             "https://devrepo.kakao.com/nexus/content/groups/public/",
//           ],
//         },
//       },
//     ],
//     [
//       "@react-native-kakao/core",
//       {
//         nativeAppKey: {KAKAO_NATIVE_API_KEY},
//         android: {
//           packageName: "com.mey.kroute",
//         },
//         ios: {
//           bundleId: "com.mey.kroute",
//         },
//       },
//     ],
//   ],
//   experiments: {
//     typedRoutes: true,
//   },
// });

// app.config.js
require('dotenv').config();

export default ({ config }) => ({
  ...config,
  name: "kroute-app",
  slug: "kroute-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "krouteapp",
  splash: "./assets/images/splash.png",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,

  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.mey.kroute",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    package: "com.mey.kroute",
    versionCode: 1,
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },

  // .env 값들을 런타임에 쓸 수 있게 넘겨줌
  extra: {
    API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
    KAKAO_JS_API_KEY: process.env.EXPO_PUBLIC_KAKAO_JS_API_KEY,
    KAKAO_NATIVE_API_KEY: process.env.EXPO_PUBLIC_KAKAO_NATIVE_API_KEY,
    OPEN_WEATHER_API_KEY: process.env.EXPO_PUBLIC_OPEN_WEATHER_API_KEY,
  },

  expo: {
    name: "kroute-app",
    slug: "kroute-app",
    android: {
      package: "com.mey.kroute",
      versionCode: 1,
    },
    extra: {
      eas: {
        projectId: "5a3a223f-02ea-472c-aad3-a581a5aa4e07"
      }
    }
  },

  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
    "expo-font",
  ],

  experiments: {
    typedRoutes: true,
  },
});
