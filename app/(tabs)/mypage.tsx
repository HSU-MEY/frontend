// app/(tabs)/mypage.tsx
import { router } from 'expo-router';
import { Button, View } from 'react-native';
import styled from 'styled-components/native';

export default function ChatbotScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {/* Profile Image */}
      <ProfileImage source={'https://placehold.co/100'} />
      <ProfileUsername>John Doe</ProfileUsername>
      <Button title="프로필 수정" onPress={() => router.push('/account/edit-profile')} />
    </View>
  );
}

const ProfileImage = styled.Image`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  margin-bottom: 20px;
`;

const ProfileUsername = styled.Text`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
`;