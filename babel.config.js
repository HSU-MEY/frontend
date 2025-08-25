// module.exports = function (api) {
//   api.cache(true);
//   return {
//     presets: ['babel-preset-expo'],
//     plugins: [
//       '@babel/plugin-proposal-optional-chaining',
//       '@babel/plugin-proposal-nullish-coalescing-operator',
//       '@babel/plugin-transform-template-literals',
//       [
//         "module:react-native-dotenv",
//         {
//           moduleName: "@env",
//           path: ".env",
//           safe: false,
//           allowUndefined: true,
//         }
//       ],
//       //'react-native-reanimated/plugin', // 마지막 줄!
//     ],
//   };
// };

// process.env.EXPO_ROUTER_APP_ROOT = "../../app"; 

// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],   // 이 preset이 expo-router까지 포함합니다.
    plugins: [
      // 'react-native-reanimated/plugin', // 쓰는 경우에만, 항상 맨 마지막
    ],
  };
};
