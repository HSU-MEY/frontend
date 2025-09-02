// app/account/register.tsx
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Button, Text } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import styled from 'styled-components/native';

import { signupApi } from '@/api/auth.service';

export default function RegisterScreen() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  type Language = { label: string; value: string };
  const languages: Language[] = [
    { label: '한국어', value: 'ko' },
    { label: '영어', value: 'en' },
    { label: '일본어', value: 'ja' },
    { label: '중국어', value: 'zh' },
  ];

  const handleRegister = useCallback(async () => {
    if (submitting) return; // 중복 제출 가드

    const nicknameTrim = nickname.trim();
    const emailNorm = email.trim().toLowerCase();
    const pwdTrim = password.trim();
    const confirmTrim = confirmPassword.trim();

    // 프론트 유효성
    if (!emailNorm || !nicknameTrim || !pwdTrim || !selectedLanguage) {
      Alert.alert('모든 필드를 입력해주세요.');
      return;
    }
    if (!emailNorm.includes('@')) {
      Alert.alert('유효한 이메일 주소를 입력해주세요.');
      return;
    }
    if (pwdTrim.length < 6) {
      Alert.alert('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (pwdTrim !== confirmTrim) {
      Alert.alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (nicknameTrim.length < 2) {
      Alert.alert('이름은 2자 이상이어야 합니다.');
      return;
    }

    try {
      setSubmitting(true);

      const resp = await signupApi({
        email: emailNorm,
        password: pwdTrim,
        nickname: nicknameTrim,
      });

      if (!resp?.isSuccess) {
        throw new Error(resp?.message || '회원가입 실패');
      }

      // selectedLanguage는 현재 서버 전송 X (필요 시 별도 API에 저장)
      Alert.alert('회원가입 완료!', '이제 로그인해주세요.');
      router.replace('/account/login');
    } catch (error: any) {
      console.error('회원가입 에러:', error);
      Alert.alert('회원가입 실패', error?.message ?? '다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  }, [submitting, nickname, email, password, confirmPassword, selectedLanguage, router]);

  return (
    <Container>
      <Title>회원가입</Title>

      <Input
        placeholder="이름"
        value={nickname}
        onChangeText={setNickname}
        autoCapitalize="none"
      />

      <Input
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Input
        placeholder="비밀번호 (6자 이상)"
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
        data={languages}
        labelField="label"
        valueField="value"
        placeholder="선호 언어 선택"
        value={selectedLanguage}
        onChange={(item: Language) => setSelectedLanguage(item.value)}
      />

      <Button
        title={submitting ? '가입 중…' : '회원가입'}
        onPress={handleRegister}
        disabled={submitting}
      />

      <Text style={{ textAlign: 'center', marginBottom: 20 }}>
        이미 계정이 있나요?{' '}
        <Text onPress={() => router.push('/account/login')} style={{ color: 'blue' }}>
          로그인
        </Text>
      </Text>
    </Container>
  );
}

/* 스타일 */
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
