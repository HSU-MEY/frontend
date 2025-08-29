// // app/account/login.tsx
// import { useAuthSession } from '@/hooks/useAuthSession';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useRouter } from 'expo-router';
// import { useEffect, useState } from 'react';
// import { Alert, Button, Text } from 'react-native';
// import styled from 'styled-components/native';


// export default function LoginScreen() {
//   const router = useRouter();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const { login } = useAuthSession();

//   useEffect(() => {
//     const checkLoginStatus = async () => {
//       const accessToken = await AsyncStorage.getItem('accessToken');
//       if (accessToken) {
//         router.push('/');
//         Alert.alert('이미 로그인되어 있습니다.', '메인 화면으로 이동합니다.');
//       }
//     };

//     checkLoginStatus();
//   }, []);

//   const handleLogin = async () => {
//     if (!email || !password) {
//       console.error('이름과 비밀번호를 입력해주세요.');
//       return;
//     }

//     console.log('로그인 시도:', email, password);
//     const isValid = await login(email, password);
//     await saveProfile();

//     if (!isValid) {
//       Alert.alert('로그인 실패', '이름 또는 비밀번호가 올바르지 않습니다.');
//       return;
//     } else {  
//       Alert.alert('로그인 성공', '환영합니다!');
//       router.push('/');
//     }
//   };

//   const saveProfile = async () => {
//     await AsyncStorage.setItem('email', email);
//     const nickname = await getNickname();
//     if (nickname) {
//       await AsyncStorage.setItem('nickname', nickname);
//     }
//   };

//   const getNickname = async () => {
//     try {
//       const response = await fetch('http://13.209.188.74:8080/api/users/profiles', {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${await AsyncStorage.getItem('accessToken')}`,
//         }
//       });
//       const data = await response.json();
//       return data.result.nickname;

//     } catch (error) {

//     }
//   }

//   return (
//     <Container>
//       <Title>로그인</Title>

//       <Input
//         placeholder="이메일"
//         value={email}
//         onChangeText={setEmail}
//       />

//       <Input
//         placeholder="비밀번호"
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//       />

//     <Text onPress={() => router.push('/account/reset-password')} style={{ color: 'grey' }}>비밀번호를 잊으셨나요?</Text>

//       <Button title="로그인" onPress={handleLogin} />

//       <Text style={{ textAlign: 'center', marginBottom: 20 }}>
//         계정이 없으신가요? <Text onPress={() => router.push('/account/register')} style={{ color: 'blue' }}>회원가입</Text>
//       </Text>
//     </Container>
//   );
// }


// const Container = styled.View`
//   flex: 1;
//   justify-content: center;
//   padding: 0 20px;
// `;

// const Title = styled.Text`
//   font-size: 24px;
//   margin-bottom: 20px;
//   text-align: center;
// `;

// const Input = styled.TextInput`
//   height: 40px;
//   border: 1px solid gray;
//   margin-bottom: 12px;
//   padding: 0 8px;
//   border-radius: 4px;
// `;

// app/account/login.tsx
import { useAuthSession } from '@/hooks/useAuthSession';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Button, Text } from 'react-native';
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
      const ok = await login(email, password); // 훅 내부에서 accessToken 저장하는 구조 권장
      if (!ok) {
        Alert.alert('로그인 실패', '이메일 또는 비밀번호가 올바르지 않습니다.');
        return;
      }

      // (선택) 여기서 프로필을 읽어 환영 메시지에 사용하고 싶다면:
      // const me = await getMyProfile();
      // Alert.alert('로그인 성공', `${me.nickname}님 환영합니다!`);

      Alert.alert('로그인 성공', '환영합니다!');
      router.replace('/(tabs)/myroute');
    } catch (e: any) {
      Alert.alert('로그인 실패', e?.message ?? '잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <Container>
        <Title>로그인</Title>
        <Text style={{ textAlign: 'center', color: '#666' }}>로그인 상태 확인 중…</Text>
      </Container>
    );
  }

  return (
    <Container>
      <Title>로그인</Title>

      <Input
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Input
        placeholder="비밀번호"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text onPress={() => router.push('/account/reset-password')} style={{ color: 'grey', marginBottom: 8 }}>
        비밀번호를 잊으셨나요?
      </Text>

      <Button title={submitting ? '로그인 중…' : '로그인'} onPress={handleLogin} disabled={submitting} />

      <Text style={{ textAlign: 'center', marginTop: 16 }}>
        계정이 없으신가요?{' '}
        <Text onPress={() => router.push('/account/register')} style={{ color: 'blue' }}>
          회원가입
        </Text>
      </Text>
    </Container>
  );
}

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
