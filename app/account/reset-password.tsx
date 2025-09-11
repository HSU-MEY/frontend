// app/account/reset-password.tsx
import { useRouter } from 'expo-router';
import { useState } from 'react';
import styled from 'styled-components/native';


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
      <Title>비밀번호 재설정</Title>

    </Container>
  );
}


const Container = styled.View`
  flex: 1;
  justify-content: center;
  padding: 0 20px;
  background-color: white;
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
