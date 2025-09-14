// app/account/login.tsx
import Header from '@/components/common/Header';
import GradientText from '@/components/GradientText';
import { useAuthSession } from '@/hooks/useAuthSession';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import styled from 'styled-components/native';
// (선택) 프로필 읽어 환영 문구 등에 쓰고 싶다면:
// import { getMyProfile } from '@/api/user';
import LanguagePicker from '@/components/common/LanguagePicker';
import { useTranslation } from 'react-i18next';

export default function LoginScreen() {
  const router = useRouter();
  const { login, ensureValidAccessToken } = useAuthSession();
  const { t } = useTranslation();

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
        Alert.alert(t('auth.alreadyLoggedInTitle'), t('auth.alreadyLoggedInBody'));
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
      Alert.alert(t('auth.inputErrorTitle'), t('auth.inputErrorBody'));
      return;
    }
    setSubmitting(true);
    try {
      const normalizedEmail = email.trim().toLowerCase(); // ★ 중요
      const ok = await login(normalizedEmail, password);   // 훅으로 위임
      if (!ok) {
        Alert.alert(t('auth.loginFailTitle'), t('auth.loginFailBody'));
        return;
      }
      Alert.alert(t('auth.loginSuccessTitle'), t('auth.loginSuccessBody'));
      router.replace('/(tabs)/myroute');
    } catch (e: any) {
      Alert.alert(t('auth.loginFailTitle'), e?.message ?? t('auth.loginFailBodyFallback'));
    } finally {
      setSubmitting(false);
    }
  };

  const renderContent = () => {
    if (checking) {
      return (
        <>
          <Header title={t('auth.login')} />
          <HeaderImage
            source={require('../../assets/images/header-l.png')}
            resizeMode="cover"
          />
          <Title>{t('auth.login')}</Title>
          <Text style={{ textAlign: 'center', color: '#666' }}>{t('auth.checkingLogin')}</Text>
        </>
      );
    }

    return (
      <>
        <Header title={t('auth.login')} />
        <HeaderImage
          source={require('../../assets/images/header-l.png')}
          resizeMode="cover"
        />
        <ContentContainer>
          <View style={{ marginBottom: 12, alignItems: 'center', justifyContent: 'center' }}>
            <GradientText
              colors={['#0080FF', '#53BDFF']}
              style={{ fontSize: 24, fontFamily: 'Pretendard-Bold', textAlign: 'center' }}
            >
              {t('auth.welcomeTitle')}
            </GradientText>

            <View style={{ position: 'absolute', right: 0, top: 0 }}>
              <LanguagePicker
                variant="link"
                color="#0080FF"
                textStyle={{ fontFamily: 'Pretendard-SemiBold', fontSize: 18 }}
              />
            </View>
          </View>
          <InputLabel>{t('auth.email')}</InputLabel>
          <Input
            placeholder=""
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <InputLabel>{t('auth.password')}</InputLabel>
          <Input
            placeholder=""
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text onPress={() => router.push('/account/reset-password')} style={{ color: 'grey', marginBottom: 8, textAlign: 'center', fontFamily: 'Pretendard-Regular' }}>
            {t('auth.forgotPassword')}
          </Text>

          <CustomButton title={submitting ? t('auth.loggingIn') : t('auth.login')} onPress={handleLogin} disabled={submitting}>
            <Text style={{ color: 'white', fontSize: 16, fontFamily: 'Pretendard-SemiBold' }}>
              {submitting ? t('auth.loggingIn') : t('auth.login')}
            </Text>
          </CustomButton>

          <Text style={{ textAlign: 'center', marginTop: 16, fontFamily: 'Pretendard-Regular' }}>
            {t('auth.noAccountQ')}{' '}
            <Text onPress={() => router.push('/account/register')} style={{ color: '#0080FF', fontFamily: 'Pretendard-SemiBold' }}>
              {t('auth.signup')}
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
