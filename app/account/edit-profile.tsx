// app/account/edit-profile.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Pressable } from 'react-native';
import styled from 'styled-components/native';

import { getMyProfile, type UserProfile } from '@/api/user';
import { useAuthSession } from '@/hooks/useAuthSession';

export default function EditProfileScreen() {
  const { ensureValidAccessToken, logout } = useAuthSession(); //  logout도 사용

  // 화면 표시용 상태
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // 원래 이메일 따로 보관
  const [originalEmail, setOriginalEmail] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isFocused = useIsFocused();

  const ensureRef = useRef(ensureValidAccessToken);
  useEffect(() => {
    ensureRef.current = ensureValidAccessToken;
  }, [ensureValidAccessToken]);

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
        // 원래 이메일과 현재 입력값 모두 세팅
        setOriginalEmail(me.email ?? '');
        setEmail(me.email ?? '');
      } catch (e: any) {
        if (mounted) {
          Alert.alert('프로필 불러오기 실패', e?.message ?? '잠시 후 다시 시도해주세요.');
        }
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
    const emailChanged = trimmedEmail !== originalEmail;   // 진짜 변경 여부
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

    // 비번 검증 (이메일 바뀌면 비번 필수)
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
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        Alert.alert('로그인이 필요합니다.');
        return;
      }

      // 서버 호환: 항상 email은 포함
      // - 이메일만 변경: 새 이메일 + 새 비번(필수)
      // - 비번만 변경: 원래 이메일 + 새 비번
      // - 둘 다: 새 이메일 + 새 비번
      const payload: Record<string, string> = {
        email: emailChanged ? trimmedEmail : originalEmail,
      };
      if (pwdChanged) payload.password = trimmedPwd;

      const res = await fetch('http://13.209.188.74:8080/api/users/profiles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const raw = await res.text();
      console.log('PUT /profiles status:', res.status, 'raw:', raw);
      let data: any = {};
      try { data = JSON.parse(raw); } catch { }
      if (!res.ok || !data?.isSuccess) {
        throw new Error((data?.message || raw || `업데이트 실패`) + ` (HTTP ${res.status})`);
      }

      // 민감 정보 변경 시 재로그인 권장 (이메일/비번 둘 중 하나라도 바뀌면)
      if (emailChanged || pwdChanged) {
        const shownEmail = emailChanged ? trimmedEmail : originalEmail;
        Alert.alert(
          '프로필 저장 완료',
          `변경된 계정 정보로 다시 로그인해주세요.\n이메일: ${shownEmail}`,
          [
            {
              text: '확인',
              onPress: async () => {
                await logout(); // 토큰/타이머 정리
                router.replace('/account/login');
              }
            }
          ]
        );
      } else {
        Alert.alert('프로필이 저장되었습니다!');
        setNewPassword('');
        setConfirmPassword('');
      }
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
      <Title>프로필 수정</Title>

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

      {/* 이메일 */}
      <Input
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {/* 새 비밀번호 (선택) */}
      <Input
        placeholder="새 비밀번호 (선택)"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />

      {/* 비밀번호 확인 (선택) */}
      <Input
        placeholder="새 비밀번호 확인"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <Button title={saving ? '저장 중…' : '저장'} onPress={handleSave} disabled={saving} />
    </Container>
  );
}

/* ===== styled ===== */
// ... (스타일 동일)


/* ===== styled ===== */
const Container = styled.ScrollView`
  flex: 1;
  padding: 24px 20px 40px;
  background-color: white;
`;

const Title = styled.Text`
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 700;
`;

const Input = styled.TextInput`
  height: 44px;
  border: 1px solid #cfcfcf;
  margin-bottom: 12px;
  padding: 0 12px;
  border-radius: 8px;
  font-size: 15px;
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
