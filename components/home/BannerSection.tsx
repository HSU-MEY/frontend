import React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function BannerSection() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/default-banner.png')} // ← 배너 이미지 경로로 수정하세요
        style={styles.bannerImage}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
