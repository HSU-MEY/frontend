// app/account/register.tsx
import { signupApi } from '@/api/auth.service';
import Header from '@/components/common/Header';
import LanguagePicker from '@/components/common/LanguagePicker';
import GradientText from '@/components/GradientText';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Platform, Switch, Text, View } from 'react-native';
import styled from 'styled-components/native';

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();

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
      Alert.alert(t('register.imagePermTitle'), t('register.imagePermBody'));
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
      Alert.alert(t('register.agreeNeededTitle'), t('register.agreeNeededBody'));
      return;
    }

    const nicknameTrim = nickname.trim();
    const emailNorm = email.trim().toLowerCase();
    const pwdTrim = password.trim();
    const confirmTrim = confirmPassword.trim();

    if (!emailNorm || !nicknameTrim || !pwdTrim) {
      Alert.alert(t('register.inputErrorTitle'), t('register.inputAllRequired'));
      return;
    }
    if (!emailNorm.includes('@')) {
      Alert.alert(t('register.inputErrorTitle'), t('register.emailInvalid'));
      return;
    }
    if (pwdTrim.length < 6) {
      Alert.alert(t('register.inputErrorTitle'), t('register.passwordTooShort'));
      return;
    }
    if (pwdTrim !== confirmTrim) {
      Alert.alert(t('register.inputErrorTitle'), t('register.passwordMismatch'));
      return;
    }
    if (nicknameTrim.length < 2) {
      Alert.alert(t('register.inputErrorTitle'), t('register.nicknameTooShort'));
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
        throw new Error(resp?.message || t('register.signupFailFallback'));
      }
      Alert.alert(t('register.signupSuccessTitle'), t('register.signupSuccessBody'));
      router.replace('/account/login');
    } catch (error: any) {
      console.error('회원가입 에러:', error);
      Alert.alert(t('register.signupFailTitle'), error?.message ?? t('register.signupFailFallback'));
    } finally {
      setSubmitting(false);
    }
  };

  const renderContent = () => (
    <>
      <Header title={t('register.title')} />
      <HeaderImage
        source={require('../../assets/images/header.png')}
        resizeMode="cover"
      />
      <ContentContainer>
        <View style={{ marginBottom: 12, alignItems: 'center', justifyContent: 'center' }}>
          <GradientText
            colors={['#0080FF', '#53BDFF']}
            style={{ fontSize: 24, fontFamily: 'Pretendard-Bold', textAlign: 'center' }}
          >
            {t('register.title')}
          </GradientText>

          <View style={{ position: 'absolute', right: 0, top: 0 }}>
            <LanguagePicker
              variant="link"
              color="#0080FF"
              textStyle={{ fontFamily: 'Pretendard-SemiBold', fontSize: 18 }}
            />
          </View>
        </View>

        {/* <ProfileImageContainer>
          <Pressable onPress={pickImage}>
            {profileImage ? (
              <ProfileImage source={{ uri: profileImage }} />
            ) : (
              <Placeholder>
                <PlaceholderText>이미지 선택</PlaceholderText>
              </Placeholder>
            )}
          </Pressable>
        </ProfileImageContainer> */}

        <InputLabel> {t('register.nickname')}</InputLabel>
        <Input
          placeholder={t('register.nicknamePlaceholder')}
          value={nickname}
          onChangeText={setNickname}
        />

        <InputLabel> {t('register.email')}</InputLabel>
        <Input
          placeholder={t('register.emailPlaceholder')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <InputLabel>{t('register.password')}</InputLabel>
        <Input
          placeholder={t('register.passwordPlaceholder')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <InputLabel>{t('register.confirmPassword')}</InputLabel>
        <Input
          placeholder={t('register.confirmPasswordPlaceholder')}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
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
              {t('register.privacyPolicy')}
            </Text>
            {t('register.agreeSuffix')}
          </AgreementText>
        </AgreementContainer>

        <CustomButton
          title={submitting ? t('register.signupInProgress') : t('register.signup')}
          onPress={handleRegister}
          disabled={submitting}
        >
          <Text style={{ color: 'white', fontSize: 16, fontFamily: 'Pretendard-SemiBold' }}>
            {submitting ? t('register.signupInProgress') : t('register.signup')}
          </Text>
        </CustomButton>

        <Text style={{ textAlign: 'center', marginTop: 16, fontFamily: 'Pretendard-Regular' }}>
          {t('register.alreadyHaveAccountQ')}{' '}
          <Text onPress={() => router.push('/account/login')} style={{ color: '#0080FF', fontFamily: 'Pretendard-SemiBold' }}>
            {t('register.loginLink')}
          </Text>
        </Text>
      </ContentContainer>
    </>
  );

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
