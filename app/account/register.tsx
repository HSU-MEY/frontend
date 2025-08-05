// app/account/register.tsx
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, Text } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import styled from 'styled-components/native';

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  type Language = { label: string; value: string };

  const langauges: Language[] = [
    { label: '한국어', value: 'ko' },
    { label: '영어', value: 'en' },
    { label: '일본어', value: 'ja' },
    { label: '중국어', value: 'zh' },
  ]

  const handleRegister = () => {
    if (password !== confirmPassword) {
      Alert.alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!email || !username || !password || !selectedLanguage) {
      Alert.alert('모든 필드를 입력해주세요.');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('유효한 이메일 주소를 입력해주세요.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    if (username.length < 2) {
      Alert.alert('이름은 2자 이상이어야 합니다.');
      return;
    }

    console.log('회원가입 시도:', email, password);
    
    signup(email, username, password)
      .then(() => {
        Alert.alert('회원가입 완료!', '이제 로그인해주세요.');
        router.replace('/account/login');
      })
      .catch((error) => {
        console.error('회원가입 에러:', error);
        Alert.alert('회원가입 실패', '다시 시도해주세요.');
      });

  };

  const signup = async (email: string, username: string, password: string) => {
    try {
      const response = await fetch('http://13.209.188.74:8080/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          username: username,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '회원가입 실패');
      }

      const data = await response.json();
      console.log('회원가입 성공:', data);

      return data;

    } catch (error: any) {
      console.error('회원가입 에러:', error);
      throw error;
    }
  }

  return (
    <Container>
      <Title>회원가입</Title>

      <Input
        placeholder="이름"
        value={username}
        onChangeText={setUsername}
      />

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

      <Input
        placeholder="비밀번호 확인"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <StyledDropdown
        placeholderStyle={{ color: 'gray' }}
        selectedTextStyle={{ color: 'black' }} 
        data = {langauges}
        labelField="label"
        valueField="value"
        placeholder="선호 언어 선택"
        value={selectedLanguage}
        onChange={(item: Language) => {
          setSelectedLanguage(item.value);
          console.log('선택된 언어:', item.label);
        }}
      />

      <Button title="회원가입" onPress={handleRegister} />

      <Text style={{ textAlign: 'center', marginBottom: 20 }}>
        이미 계정이 있나요? <Text onPress={() => router.push('/account/login')} style={{ color: 'blue' }}>로그인</Text>
      </Text>
    </Container>
  );
}

// 공통 스타일 컴포넌트
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

const StyledDropdown = styled(Dropdown)`
  height: 40px;
  border: 1px solid gray;
  margin-bottom: 12px;
  padding: 0 8px;
  border-radius: 4px;
`;