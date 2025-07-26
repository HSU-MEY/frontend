// components/ProgressBar.tsx

import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function ProgressBar({ progress }: { progress: number }) {
  return (
    <View style={styles.barBackground}>
      <View style={[styles.barFill, { width: `${progress}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  barBackground: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginTop: 4,
  },
  barFill: {
    height: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
});
