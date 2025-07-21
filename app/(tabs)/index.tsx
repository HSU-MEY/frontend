// app/index.tsx
import { useRouter } from 'expo-router';
import { Button, Text, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>홈 화면입니다</Text>
      <Button
        title="챗봇 화면으로 이동"
        onPress={() => router.push('/chatbot')}
      />
      <Button
        title="로그인 화면으로 이동"
        onPress={() => router.push('/account/login')}
      />
      <Button
        title="장소 디테일 화면으로 이동"
        onPress={() => router.push('/place-detail')}
      />
    </View>
  );
}
