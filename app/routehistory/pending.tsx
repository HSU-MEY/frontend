import Header from '@/components/common/Header';
import RouteListPage from '@/components/common/RouteListPage';
import { useUserRoutes } from '@/hooks/useUserRoutes';
import { StyleSheet, View } from 'react-native';

export default function PendingRoutesPage() {
  const { data, remove, loading } = useUserRoutes("NOT_STARTED");
  const pendingRoutes = data?.savedRoutes ?? [];

  return (
      <View style={styles.container}>
        <Header title="미진행 루트" />
        <RouteListPage title="미진행 루트" routes={pendingRoutes} onDelete={handleDelete} />
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // 필요 시 배경색 추가
  },
});