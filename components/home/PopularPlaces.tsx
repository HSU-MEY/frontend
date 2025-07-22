import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function PopularPlaces() {
  return (
    <View style={styles.container}>
      <Text>인기있는 장소</Text>
      {/* 실제 티켓 컴포넌트 등은 여기 추가 */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
});
