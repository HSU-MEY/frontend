// app/account/login.tsx
import Header from '@/components/common/Header';
import GradientText from '@/components/GradientText';
import { useAuthSession } from '@/hooks/useAuthSession';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text } from 'react-native';
import styled from 'styled-components/native';
// (선택) 프로필 읽어 환영 문구 등에 쓰고 싶다면:
// import { getMyProfile } from '@/api/user';

export default function LoginScreen() {
  const router = useRouter();
  const { login, ensureValidAccessToken } = useAuthSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 이미 로그인 상태인지 확인하되, 반드시 토큰 유효성 먼저 점검
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) return;
        await ensureValidAccessToken(); // 만료 시 내부에서 갱신/정리
        if (!mounted) return;
        // 유효하면 홈으로
        router.replace('/(tabs)/myroute');
        Alert.alert('이미 로그인되어 있습니다.', '메인 화면으로 이동합니다.');
      } catch {
        // 유효하지 않으면 조용히 로그인 화면 유지
      } finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => { mounted = false; };
  }, [ensureValidAccessToken, router]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const normalizedEmail = email.trim().toLowerCase(); // ★ 중요
      const ok = await login(normalizedEmail, password);   // 훅으로 위임
      if (!ok) {
        Alert.alert('로그인 실패', '이메일 또는 비밀번호가 올바르지 않습니다.');
        return;
      }
     Alert.alert('로그인 성공', '환영합니다!');
      router.replace('/(tabs)/myroute');
    } catch (e: any) {
      Alert.alert('로그인 실패', e?.message ?? '잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderContent = () => {
    if (checking) {
      return (
        <>
          <Header title="로그인" />
          <HeaderImage
            source={require('../../assets/images/header-l.png')} 
            resizeMode="cover"
          />
          <Title>로그인</Title>
          <Text style={{ textAlign: 'center', color: '#666' }}>로그인 상태 확인 중…</Text>
        </>
      );
    }

    return (
      <>
        <Header title="로그인" />
        <HeaderImage
          source={require('../../assets/images/header-l.png')} 
          resizeMode="cover"
        />
        <ContentContainer>
        <GradientText
          colors={['#0080FF', '#53BDFF']}
          style={{ fontSize: 24, textAlign: 'center', marginBottom: 20, fontFamily: 'Pretendard-Bold' }}
        >
          환영합니다!
        </GradientText>
        <InputLabel>이메일</InputLabel>
        <Input
          placeholder=""
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <InputLabel>비밀번호</InputLabel>
        <Input
          placeholder=""
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text onPress={() => router.push('/account/reset-password')} style={{ color: 'grey', marginBottom: 8, textAlign: 'center', fontFamily: 'Pretendard-Regular' }}>
          비밀번호를 잊으셨나요?
        </Text>

        <CustomButton title={submitting ? '로그인 중…' : '로그인'} onPress={handleLogin} disabled={submitting}>
          <Text style={{ color: 'white', fontSize: 16, fontFamily: 'Pretendard-SemiBold' }}>
            {submitting ? '로그인 중…' : '로그인'}
          </Text>
        </CustomButton>

        <Text style={{ textAlign: 'center', marginTop: 16, fontFamily: 'Pretendard-Regular' }}>
          계정이 없으신가요?{' '}
          <Text onPress={() => router.push('/account/register')} style={{ color: '#0080FF', fontFamily: 'Pretendard-SemiBold' }}>
            회원가입
          </Text>
        </Text>
        </ContentContainer>
      </>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 30}
    >
      <Container contentContainerStyle={{ flexGrow: 1 }}>
        {renderContent()}
      </Container>
    </KeyboardAvoidingView>
  );
}

const Container = styled.ScrollView`
  background-color: white;
`;

const ContentContainer = styled.View`
  padding: 0 20px;
  flex: 1; /* 남은 공간을 모두 차지하도록 설정 */
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

const InputLabel = styled.Text`
  font-size: 16px;
  margin-bottom: 8px;
  color: #0080FF;
  font-family: 'Pretendard-SemiBold';
`;

const ForgotPassword = styled.TouchableOpacity`
  color: grey;
`;

const HeaderImage = styled.Image`
  width: 100%;
  height: 320px;
  margin-bottom: 20px;
`;

const CustomButton = styled.TouchableOpacity`
  background-color: #0080FF;
  padding: 12px;
  border-radius: 100px;
  align-items: center;
  margin: 20px auto 0 auto;
  color: white;
  width: 70%;

`;
