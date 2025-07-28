import Header from '@/components/common/Header';
import RouteListPage from '@/components/common/RouteListPage';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { dummyRoutes } from '../data/dummyRoutes';

export default function PendingRoutesPage() {
  const [routes, setRoutes] = useState(dummyRoutes.filter(r => r.progress === 0));

  const handleDelete = (id: string) => {
    setRoutes(prev => prev.filter(route => route.id !== id));
  };

  return (
      <View style={styles.container}>
        <Header title="미진행 루트" />
        <RouteListPage title="미진행 루트" routes={routes} onDelete={handleDelete} />
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // 필요 시 배경색 추가
  },
});