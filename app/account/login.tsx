// app/account/login.tsx
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Button, Text } from 'react-native';
import styled from 'styled-components/native';

LoginScreen.options = {
  name: "로그인"
}

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // TODO: 여기에 로그인 API 호출 로직 추가
    console.log('로그인 시도:', email, password);
    router.push('/');
  };

  return (
    <Container>
      <Title>로그인</Title>

      <Input
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
      />

      <Input
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
  
    <Text onPress={() => router.push('/account/reset-password')} style={{ color: 'grey' }}>비밀번호를 잊으셨나요?</Text>

      <Button title="로그인" onPress={handleLogin} />

      <Text style={{ textAlign: 'center', marginBottom: 20 }}>
        계정이 없으신가요? <Text onPress={() => router.push('/account/register')} style={{ color: 'blue' }}>회원가입</Text>
      </Text>
    </Container>
  );
}


const Container = styled.View`
  flex: 1;
  justify-content: center;
  padding: 0 20px;
`;

const Title = styled.Text`
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
`;

const Input = styled.TextInput`
  height: 40px;
  border: 1px solid gray;
  margin-bottom: 12px;
  padding: 0 8px;
  border-radius: 4px;
`;
