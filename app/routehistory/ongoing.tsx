import Header from '@/components/common/Header';
import RouteListPage from '@/components/common/RouteListPage';
import { useUserRoutes } from '@/hooks/useUserRoutes';
import { Alert, StyleSheet, View } from 'react-native';

export default function OngoingRoutesPage() {
  const { data, remove, loading } = useUserRoutes("ON_GOING");
  const ongoingRoutes = data?.savedRoutes ?? [];

  const handleDelete = (id: string) => {
    Alert.alert(
      "루트 삭제",
      "정말로 이 루트를 삭제하시겠습니까?",
      [
        {
          text: "취소",
          style: "cancel"
        },
        {
          text: "삭제",
          onPress: async () => {
            try {
              await remove(Number(id));
            } catch (e) {
              Alert.alert("오류", "루트 삭제에 실패했습니다.");
            }
          },
          style: "destructive"
        }
      ]
    );
  }
  
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