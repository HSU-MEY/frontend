import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function AIGuideRoutes() {
  return (
    <View style={styles.container}>
      <Text>AI 가이드 추천 루트</Text>
      {/* 실제 티켓 컴포넌트 등은 여기 추가 */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
});
