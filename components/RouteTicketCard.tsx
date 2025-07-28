import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface RouteTicketCardProps {
  image: any;
  title: string;
  location: string;
  startDate: string;
  progress: number;
}

export default function RouteTicketCard({
  image,
  title,
  location,
  startDate,
  progress,
}: RouteTicketCardProps) {
  return (
    <View style={styles.card}>
      {/* 왼쪽 이미지 */}
      <Image source={image} style={styles.image} />

      {/* 오른쪽 설명 */}
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.location}>{location}</Text>
        <Text style={styles.date}>{startDate} ~</Text>

        <Text style={styles.progressLabel}>진행도 {progress}%</Text>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    alignItems: 'center',
    marginTop: 12,
  },
  image: {
    width: 100,
    height: 80,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
  date: {
    fontSize: 13,
    color: '#999',
  },
  progressLabel: {
    marginTop: 6,
    fontSize: 12,
    color: '#666',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#279FFF',
  },
});
