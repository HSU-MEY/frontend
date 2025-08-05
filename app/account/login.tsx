// app/account/login.tsx
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, Text } from 'react-native';
import styled from 'styled-components/native';

LoginScreen.options = {
  name: "로그인"
}

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      console.error('이름과 비밀번호를 입력해주세요.');
      return;
    }

    console.log('로그인 시도:', username, password);
    const isValid = await login(username, password);

    if (!isValid) {
      Alert.alert('로그인 실패', '이름 또는 비밀번호가 올바르지 않습니다.');
      return;
    } else {  
      Alert.alert('로그인 성공', '환영합니다!');
      router.push('/');
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('http://13.209.188.74:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: username, 
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('로그인 실패:', errorData.message);
        return false;
      }

      console.log('로그인 성공:', username);
      return true;
    } catch (error) {
      console.error('로그인 실패:', error);
      return false;
    }
  }

  return (
    <Container>
      <Title>로그인</Title>

      <Input
        placeholder="이름"
        value={username}
        onChangeText={setUsername}
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
