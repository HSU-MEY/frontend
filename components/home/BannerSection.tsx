import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function BannerSection() {
  return (
    <View style={styles.container}>
      <Text>배너 섹션 루트</Text>
      {/* 실제 티켓 컴포넌트 등은 여기 추가 */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
});
