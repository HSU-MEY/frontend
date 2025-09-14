import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');

const bannerImages: { [key: string]: any } = {
  en: require('../../assets/images/banner-temp-en.png'),
  ja: require('../../assets/images/banner-temp-ja.png'),
  zh: require('../../assets/images/banner-temp-zh.png'),
  ko: require('../../assets/images/banner-temp.png'),
};
// Photo by Brady Bellini on Unsplash

export default function BannerSection() {
  const { i18n } = useTranslation();
  const bannerSource = bannerImages[i18n.language] || bannerImages.ko;

  return (
    <View style={styles.container}>
      <Image
        source={bannerSource}
        style={styles.bannerImage}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center', // 가운데 정렬
  },
  bannerImage: {
    //width: 361,
    width: width * 0.9,
    //height: 168,
    height: (width * 0.9) * (168 / 361), // 비율 유지
    borderRadius: 12, // 둥글게 처리 (선택)
  },
});