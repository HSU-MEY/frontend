// app/account/register.tsx
import { signupApi } from '@/api/auth.service';
import Header from '@/components/common/Header';
import GradientText from '@/components/GradientText';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, Switch, Text } from 'react-native';
import styled from 'styled-components/native';

export default function RegisterScreen() {
  const router = useRouter();

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToPrivacyPolicy, setAgreedToPrivacyPolicy] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('권한 필요', '프로필 이미지를 설정하려면 갤러리 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    if (submitting) return;

    if (!agreedToPrivacyPolicy) {
      Alert.alert('동의 필요', '개인정보처리방침에 동의해주세요.');
      return;
    }

    const nicknameTrim = nickname.trim();
    const emailNorm = email.trim().toLowerCase();
    const pwdTrim = password.trim();
    const confirmTrim = confirmPassword.trim();

    if (!emailNorm || !nicknameTrim || !pwdTrim) {
      Alert.alert('입력 오류', '모든 필수 항목을 입력해주세요.');
      return;
    }
    if (!emailNorm.includes('@')) {
      Alert.alert('입력 오류', '유효한 이메일 주소를 입력해주세요.');
      return;
    }
    if (pwdTrim.length < 6) {
      Alert.alert('입력 오류', '비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (pwdTrim !== confirmTrim) {
      Alert.alert('입력 오류', '비밀번호가 일치하지 않습니다.');
      return;
    }
    if (nicknameTrim.length < 2) {
      Alert.alert('입력 오류', '닉네임은 2자 이상이어야 합니다.');
      return;
    }

    try {
      setSubmitting(true);
      // TODO: signupApi needs to be updated to handle image upload (FormData)
      const resp = await signupApi({
        email: emailNorm,
        password: pwdTrim,
        nickname: nicknameTrim,
        // profileImage: profileImage, // This needs API modification
      });
      if (!resp?.isSuccess) {
        throw new Error(resp?.message || '회원가입에 실패했습니다.');
      }
      Alert.alert('회원가입 완료', '회원가입이 성공적으로 완료되었습니다. 로그인해주세요.');
      router.replace('/account/login');
    } catch (error: any) {
      console.error('회원가입 에러:', error);
      Alert.alert('회원가입 실패', error?.message ?? '알 수 없는 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderContent = () => (
    <>
      <Header title="회원가입" />
      <HeaderImage
        source={require('../../assets/images/header.png')}
        resizeMode="cover"
      />
      <ContentContainer>
        <GradientText
          colors={['#0080FF', '#53BDFF']}
          style={{ fontSize: 24, textAlign: 'center', marginBottom: 20, fontFamily: 'Pretendard-Bold' }}
        >
          회원가입
        </GradientText>

        <ProfileImageContainer>
          <Pressable onPress={pickImage}>
            {profileImage ? (
              <ProfileImage source={{ uri: profileImage }} />
            ) : (
              <Placeholder>
                <PlaceholderText>이미지 선택</PlaceholderText>
              </Placeholder>
            )}
          </Pressable>
        </ProfileImageContainer>

        <InputLabel>이메일</InputLabel>
        <Input
          placeholder="이메일 주소"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <InputLabel>비밀번호</InputLabel>
        <Input
          placeholder="비밀번호 (6자 이상)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <InputLabel>비밀번호 확인</InputLabel>
        <Input
          placeholder="비밀번호 다시 입력"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <InputLabel>닉네임</InputLabel>
        <Input
          placeholder="사용하실 닉네임"
          value={nickname}
          onChangeText={setNickname}
        />

        <AgreementContainer>
          <Switch
            value={agreedToPrivacyPolicy}
            onValueChange={setAgreedToPrivacyPolicy}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={agreedToPrivacyPolicy ? "#0080FF" : "#f4f3f4"}
          />
          <AgreementText>
            <Text onPress={() => router.push('/account/privacy-policy')} style={{ color: '#0080FF', textDecorationLine: 'underline' }}>
              개인정보처리방침
            </Text>
            에 동의합니다.
          </AgreementText>
        </AgreementContainer>

        <CustomButton title={submitting ? '가입 중…' : '회원가입'} onPress={handleRegister} disabled={submitting}>
          <Text style={{ color: 'white', fontSize: 16, fontFamily: 'Pretendard-SemiBold' }}>
            {submitting ? '가입 중…' : '회원가입'}
          </Text>
        </CustomButton>

        <Text style={{ textAlign: 'center', marginTop: 16, fontFamily: 'Pretendard-Regular' }}>
          이미 계정이 있으신가요?{' '}
          <Text onPress={() => router.push('/account/login')} style={{ color: '#0080FF', fontFamily: 'Pretendard-SemiBold' }}>
            로그인
          </Text>
        </Text>
      </ContentContainer>
    </>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <Container contentContainerStyle={{ flexGrow: 1 }}>
        {renderContent()}
      </Container>
    </KeyboardAvoidingView>
  );
}

// Styles from login.tsx
const Container = styled.ScrollView`
  background-color: white;
`;

const ContentContainer = styled.View`
  padding: 0 20px;
  flex: 1;
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

const CustomButton = styled.TouchableOpacity`
  background-color: #0080FF;
  padding: 12px;
  border-radius: 100px;
  align-items: center;
  margin: 20px auto 0 auto;
  color: white;
  width: 70%;
`;

// Styles specific to register/edit-profile
const ProfileImageContainer = styled.View`
  align-items: center;
  margin-bottom: 20px;
`;

const HeaderImage = styled.Image`
  width: 100%;
  height: 120px;
  margin-bottom: 20px;
`;

const ProfileImage = styled.Image`
  width: 100px;
  height: 100px;
  border-radius: 50px;
`;

const Placeholder = styled.View`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  background-color: #ddd;
  justify-content: center;
  align-items: center;
`;

const PlaceholderText = styled.Text`
  color: gray;
`;

const AgreementContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 20px;
  justify-content: center;
`;

const AgreementText = styled.Text`
  margin-left: 10px;
  font-size: 14px;
  font-family: 'Pretendard-Regular';
`;
