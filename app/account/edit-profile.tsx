import { useIsFocused } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, Text } from 'react-native';
import styled from 'styled-components/native';

import { apiPutMultipart, type ApiEnvelope } from '@/api/http';
import { ROUTES } from '@/api/routes';
import { getMyProfile, type UserProfile } from '@/api/user';
import Header from '@/components/common/Header';
import GradientText from '@/components/GradientText';
import { useAuthSession } from '@/hooks/useAuthSession';

export default function EditProfileScreen() {
  const { ensureValidAccessToken, logout } = useAuthSession();

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [originalProfileImageUrl, setOriginalProfileImageUrl] = useState<string | null>(null); // ★ 추가

  const [originalEmail, setOriginalEmail] = useState('');
  const [email, setEmail] = useState('');

  const [originalNickname, setOriginalNickname] = useState(''); // ★ 추가
  const [nickname, setNickname] = useState(''); // ★ 추가

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isFocused = useIsFocused();

  const ensureRef = useRef(ensureValidAccessToken);
  useEffect(() => { ensureRef.current = ensureValidAccessToken; }, [ensureValidAccessToken]);

  const fetchingRef = useRef(false);

  const CACHE_DIR =
    (((FileSystem as any).cacheDirectory as string | null) ??
      ((FileSystem as any).documentDirectory as string | null) ??
      '') as string;

  // 파일 URI를 RN multipart용 파트로 변환
  const toFormFile = (uri: string) => {
    // 확장자/타입 간단 추정
    const ext = (uri.split('?')[0].split('.').pop() || '').toLowerCase();
    const mime =
      ext === 'png' ? 'image/png' :
        ext === 'webp' ? 'image/webp' :
          ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
            'image/jpeg';
    const name = `profile.${ext || 'jpg'}`;
    return { uri, name, type: mime } as any; // RN fetch가 요구
  };

  const ensureLocalFile = async (maybeUri: string) => {
    if (!maybeUri) return null;
    if (/^https?:\/\//i.test(maybeUri)) {
      const fileName = `profile_${Date.now()}.jpg`;
      const dest = `${CACHE_DIR}${fileName}`;
      const { uri } = await FileSystem.downloadAsync(maybeUri, dest);
      return uri;
    }
    return maybeUri; // 이미 로컬
  };

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

        setOriginalNickname(me.nickname ?? '');  // ★ 닉네임
        setNickname(me.nickname ?? '');          // ★ 닉네임

        setOriginalProfileImageUrl(me.profileImageUrl ?? null); // ★ 프사
        setProfileImage(me.profileImageUrl ?? null);            // ★ 프사(미리보기)
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
      quality: 0.8,
    });
    if (!result.canceled) setProfileImage(result.assets[0].uri);
  };

  const isRemoteUrl = (uri?: string | null) => !!uri && /^https?:\/\//i.test(uri);

  const handleSave = async () => {
    const trimmedEmail = email.trim();
    const trimmedPwd = newPassword.trim();
    const trimmedNickname = nickname.trim();

    const emailChanged = trimmedEmail !== originalEmail;
    const pwdChanged = trimmedPwd.length > 0;
    const nicknameChanged = trimmedNickname !== originalNickname;
    const avatarChanged = profileImage != null && profileImage !== originalProfileImageUrl;

    if (!emailChanged && !pwdChanged && !nicknameChanged && !avatarChanged) {
      Alert.alert('변경할 항목이 없습니다.');
      return;
    }
    if (emailChanged && !trimmedEmail.includes('@')) {
      Alert.alert('유효한 이메일 주소를 입력해주세요.');
      return;
    }
    if (emailChanged && !pwdChanged) {
      Alert.alert('안내', '이메일을 변경하려면 새 비밀번호도 함께 입력해주세요.');
      return;
    }
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
      await ensureValidAccessToken();

      // 1) JSON 파트(payload) 구성 — 변경된 것만 담기
      const payload: Record<string, any> = {};
      if (emailChanged) payload.email = trimmedEmail;
      if (pwdChanged) payload.password = trimmedPwd;
      if (nicknameChanged) payload.nickname = trimmedNickname;

      // 2) 이미지 파트 준비 (스웨거에서 profileImage가 required)
      //    - 새로 고르지 않았어도 서버가 "항상 파일"을 요구하면 기존 URL을 다운로드해서 재전송
      //    - 아무 것도 없으면 저장 막기
      let fileUriToSend: string | null = null;
      if (profileImage) {
        fileUriToSend = await ensureLocalFile(profileImage);
      } else if (originalProfileImageUrl) {
        fileUriToSend = await ensureLocalFile(originalProfileImageUrl);
      }

      if (!fileUriToSend) {
        Alert.alert('프로필 이미지가 필요합니다.', '이미지를 선택해 주세요.');
        setSaving(false);
        return;
      }

      // 3) FormData 생성
      const form = new FormData();

      // request 파트 (백엔드가 @RequestPart("request")로 JSON 받는 경우)
      try {
        // Blob 지원되면 타입을 명확히
        const jsonBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        form.append('request', jsonBlob as any);
      } catch {
        // 일부 환경에서 Blob 이슈가 있다면 문자열로도 대부분(Spring) 파싱 가능
        form.append('request', JSON.stringify(payload) as any);
      }

      // profileImage 파트
      form.append('profileImage', toFormFile(fileUriToSend));

      // 4) 멀티파트 PUT 호출
      const resp = await apiPutMultipart<ApiEnvelope<unknown>>(
        ROUTES.users.profile,
        form,
        'PUT /users/profiles (multipart)'
      );

      if (!resp?.isSuccess) {
        throw new Error(resp?.message || '업데이트 실패');
      }

      // 성공 → 즉시 로그아웃(토큰 레이스 방지)
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

        {/* 프로필 이미지 */}
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

        {/* 닉네임 */}
        <InputLabel>닉네임</InputLabel>
        <Input
          placeholder="닉네임"
          value={nickname}
          onChangeText={setNickname}
        />

        {/* 이메일 */}
        <InputLabel>이메일</InputLabel>
        <Input
          placeholder="이메일"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {/* 비밀번호 */}
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
