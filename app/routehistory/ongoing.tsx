import Header from '@/components/common/Header';
import RouteListPage from '@/components/common/RouteListPage';
import { useUserRoutes } from '@/hooks/useUserRoutes';
import { StyleSheet, View } from 'react-native';

export default function OngoingRoutesPage() {
  const { data, remove, loading } = useUserRoutes("ON_GOING");
  const ongoingRoutes = data?.savedRoutes ?? [];

  return (
    <View style={styles.container}>
      <Header title="진행중인 루트" />
      <RouteListPage title="진행중인 루트" routes={ongoingRoutes} onDelete={handleDelete} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // 필요 시 배경색 추가
  },
});