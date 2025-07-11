// app/index.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>홈 화면입니다</Text>
      <Button
        title="챗봇 화면으로 이동"
        onPress={() => router.push('/chatbot')}
      />
    </View>
  );
}
