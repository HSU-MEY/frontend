import { useIsFocused } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, Text } from 'react-native';
import styled from 'styled-components/native';

import { apiPut, type ApiEnvelope } from '@/api/http';
import { ROUTES } from '@/api/routes';
import { getMyProfile, type UserProfile } from '@/api/user';
import Header from '@/components/common/Header';
import GradientText from '@/components/GradientText';
import { useAuthSession } from '@/hooks/useAuthSession';

export default function EditProfileScreen() {
  const { ensureValidAccessToken, logout } = useAuthSession();

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [originalEmail, setOriginalEmail] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isFocused = useIsFocused();

  const ensureRef = useRef(ensureValidAccessToken);
  useEffect(() => { ensureRef.current = ensureValidAccessToken; }, [ensureValidAccessToken]);

  const fetchingRef = useRef(false);

  useEffect(() => {
    if (!isFocused) return;
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        await ensureRef.current();
        const me: UserProfile = await getMyProfile();
        if (!mounted) return;
        setOriginalEmail(me.email ?? '');
        setEmail(me.email ?? '');
      } catch (e: any) {
        if (mounted) Alert.alert('프로필 불러오기 실패', e?.message ?? '잠시 후 다시 시도해주세요.');
      } finally {
        if (mounted) setLoading(false);
        fetchingRef.current = false;
      }
    })();

    return () => { mounted = false; };
  }, [isFocused]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('갤러리 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) setProfileImage(result.assets[0].uri);
  };

  const handleSave = async () => {
    const trimmedEmail = email.trim();
    const trimmedPwd = newPassword.trim();
    const emailChanged = trimmedEmail !== originalEmail;
    const pwdChanged = trimmedPwd.length > 0;

    // 변경 없음
    if (!emailChanged && !pwdChanged) {
      Alert.alert('변경할 항목이 없습니다.');
      return;
    }

    // 이메일 형식
    if (emailChanged && !trimmedEmail.includes('@')) {
      Alert.alert('유효한 이메일 주소를 입력해주세요.');
      return;
    }

    // 이메일만 변경은 비번 필수(정책 가드)
    if (emailChanged && !pwdChanged) {
      Alert.alert('안내', '이메일을 변경하려면 새 비밀번호도 함께 입력해주세요.');
      return;
    }

    // 비번 유효성
    if (pwdChanged) {
      if (trimmedPwd.length < 6) {
        Alert.alert('비밀번호는 6자 이상이어야 합니다.');
        return;
      }
      if (trimmedPwd !== confirmPassword.trim()) {
        Alert.alert('비밀번호 확인이 일치하지 않습니다.');
        return;
      }
    }

    try {
      setSaving(true);
      await ensureValidAccessToken(); // 갱신/확보

      const payload: { email: string; password?: string } = {
        email: emailChanged ? trimmedEmail : originalEmail,
      };
      if (pwdChanged) payload.password = trimmedPwd;

      const resp = await apiPut<ApiEnvelope<unknown>>(
        ROUTES.users.profile,
        payload,
        'PUT /users/profiles'
      );

      if (!resp?.isSuccess) {
        throw new Error(resp?.message || '업데이트 실패');
      }

      // 성공 → 즉시 로그아웃(자동갱신 레이스 방지)
      await logout();

      const shownEmail = emailChanged ? trimmedEmail : originalEmail;
      Alert.alert(
        '프로필 저장 완료',
        `변경된 계정 정보로 다시 로그인해주세요.\n이메일: ${shownEmail}`,
        [{ text: '확인', onPress: () => router.replace('/account/login') }]
      );

      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      Alert.alert('저장 실패', e?.message ?? '잠시 후 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Center>
        <CenterText>불러오는 중…</CenterText>
      </Center>
    );
  }

  return (
    <Container>
      <Header title="프로필 수정" />
      <HeaderImage
        source={require('../../assets/images/header.png')}
        resizeMode="cover"
      />
      <ContentContainer>
      <GradientText
        colors={['#0080FF', '#53BDFF']}
        style={{ fontSize: 24, textAlign: 'center', marginBottom: 20, fontFamily: 'Pretendard-Bold' }}
      >
        프로필 수정
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
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <InputLabel>새 비밀번호 (선택)</InputLabel>
      <Input
        placeholder="새 비밀번호 (선택)"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      <InputLabel>새 비밀번호 확인</InputLabel>
      <Input
        placeholder="새 비밀번호 확인"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <CustomButton onPress={handleSave} disabled={saving}>
        <Text style={{ color: 'white', fontSize: 16, fontFamily: 'Pretendard-SemiBold' }}>
          {saving ? '저장 중…' : '저장'}
        </Text>
      </CustomButton>
      </ContentContainer>
    </Container>
  );
}

/* ===== styled ===== */
const Container = styled.ScrollView`
  flex: 1;
  background-color: white;
`;

const ContentContainer = styled.View`
  padding: 20px;
  flex: 1;
`;
const Title = styled.Text`
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 700;
`;

const InputLabel = styled.Text`
  font-size: 16px;
  margin-bottom: 8px;
  color: #0080ff;
  font-family: 'Pretendard-SemiBold';
`;
const Input = styled.TextInput`
  height: 44px;
  border: 1px solid #cfcfcf;
  margin-bottom: 12px;
  padding: 0 12px;
  border-radius: 8px;
  font-size: 15px;
`;

const HeaderImage = styled.Image`
  width: 100%;
  height: 120px;
  margin-bottom: 20px;
`;

const ProfileImageContainer = styled.View`
  align-items: center;
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
const Center = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: white;
`;
const CenterText = styled.Text`
  font-size: 16px;
  color: #333;
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