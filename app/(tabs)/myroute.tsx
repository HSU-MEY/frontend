// app/(tabs)/myroute.tsx
import { FavoritePlace } from '@/components/mypage/favorite-place';
import RouteCard from '@/components/mypage/route-card';
import { places } from '@/data/dummyPlaces';
import { Place } from '@/types/Place';
import { router } from 'expo-router';
import styled from 'styled-components/native';

import { Route } from '@/api/users.routes.service';

import { favoritePlaceList } from '@/data/favoritePlace';
//import { completedRoutes, inProgressRoutes, upcomingRoutes } from '@/data/routesInProgress';
import { useUserRoutes } from "@/hooks/useUserRoutes";

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';

import { getMyProfile, type UserProfile } from '@/api/user';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useIsFocused } from '@react-navigation/native';
import { useEffect, useRef } from 'react';
import { Alert, StyleSheet } from 'react-native';

const favoritePlaces = places.filter((place: Place) => favoritePlaceList.includes(place.id));

export default function MyPage() {
  const { logout, ensureValidAccessToken } = useAuthSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    data: upcomingData,
    loading: upcomingLoading,
    error: upcomingError,
    refetch: refetchUpcoming,
  } = useUserRoutes("NOT_STARTED");
  
  const {
    data: inProgressData,
    loading: inProgressLoading,
    error: inProgressError,
    refetch: refetchInProgress,
  } = useUserRoutes("ON_GOING");
  
  const {
    data: completedData,
    loading: completedLoading,
    error: completedError,
    refetch: refetchCompleted,
  } = useUserRoutes("COMPLETED");
  
  const upcomingRoutes   = upcomingData?.savedRoutes   ?? [];
  const inProgressRoutes = inProgressData?.savedRoutes ?? [];
  const completedRoutes  = completedData?.savedRoutes  ?? [];


  const loadingAll = upcomingLoading || inProgressLoading || completedLoading;
  const errorAll   = upcomingError || inProgressError || completedError;
  const refetchAll = () => Promise.all([
    refetchUpcoming(), refetchInProgress(), refetchCompleted(),
  ]);

  // 화면 포커스 감지
  const isFocused = useIsFocused();

  // 중복 실행 방지 플래그
  const fetchingRef = useRef(false);

  // 함수 레퍼런스 안정화
  const ensureRef = useRef(ensureValidAccessToken);
  useEffect(() => {
    ensureRef.current = ensureValidAccessToken;
  }, [ensureValidAccessToken]);

  useEffect(() => {
    if (!isFocused) return;          // 화면이 보일 때만
    if (fetchingRef.current) return; // 이미 실행 중이면 무시
    let mounted = true;
    fetchingRef.current = true;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        await refetchAll();

        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          if (mounted) setProfile(null);
          return;
        }

        // 1) 토큰 검증/갱신 (ref 통해 안정적으로)
        await ensureRef.current();

        // 2) 프로필 조회
        const me = await getMyProfile();
        if (mounted) setProfile(me);
      } catch (e: any) {
        const msg = String(e?.message ?? '');
        // getMyProfile()에서 `(HTTP 403)` 같은 메시지 던지고 있을 가능성
        if (msg.includes('HTTP 403') || msg.includes('403')) {
          Alert.alert(
            '세션 재인증 필요',
            '이메일이 변경되어 다시 로그인해야 합니다.',
            [
              {
                text: '확인',
                onPress: async () => {
                  await logout();
                  router.replace('/account/login');
                }
              }
            ]
          );
          return; // 더 진행하지 않음
        }
        if (mounted) setError(msg || '불러오기 실패');
      } finally {
        if (mounted) setLoading(false);
        fetchingRef.current = false;
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [isFocused]); // 포커스 변화에만 반응

  const handleLogout = async () => {
    Alert.alert("로그아웃", "정말 로그아웃하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace('/');
          Alert.alert("로그아웃 완료");
        }
      }
    ]);
  };


  if (loading) {
    return (
      <LoadingContainer>
        <LoadingText>불러오는 중...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <ErrorText>{error}</ErrorText>
        <RetryButton onPress={() => router.replace('/(tabs)/myroute')}>
          <RetryButtonText>다시 시도</RetryButtonText>
        </RetryButton>
      </ErrorContainer>
    );
  }

  return (
    <Container>
      <Header>
        <BackgroundImage
          source={require('@/assets/images/header.png')}
          style={styles.headerImage}
          resizeMode="contain"
        />
        <AvatarWrapper>
          <Avatar source={require('@/assets/images/sample-profile.png')} />
          <UserName>{profile ? profile.nickname : 'Guest'}</UserName>
          <UserEmail>{profile ? profile.email : ''}</UserEmail>
          {profile && (
            <EditButton onPress={() => router.push('/account/edit-profile')}>
              <EditText>프로필 수정</EditText>
            </EditButton>
          )}
        </AvatarWrapper>
      </Header>

      {profile ?
        (
          <>
            { inProgressRoutes.length > 0 &&
            <Section>
              <SectionHeader
                onPress={() => router.push('/routehistory/ongoing')}
              >
                <SectionIcon
                  source={require('@/assets/images/icons/route.png')}
                />
                <SectionTitle>진행중인 루트</SectionTitle>
                <SectionIcon
                  source={require('@/assets/images/icons/arrow_forward.png')}
                  style={{ marginLeft: 'auto' }}
                />
              </SectionHeader>
              <Row>
                {
                inProgressRoutes.map((route: Route, index: number) => (
                  <RouteCard
                    key={index}
                    thumbnail=""
                    title={route.title}
                    date={route.preferredStartDate}
                    onPress={() => router.push(`/route/route-overview/${route.routeId}`)}
                    //progress={route.progress}
                  /*onPress={() => router.push(`/route/${route.id}`)}*/
                  />
                ))
                }
              </Row>
            </Section>
            }
            { upcomingRoutes.length > 0 &&
            <Section>
              <SectionHeader
                onPress={() => router.push('/routehistory/pending')}
              >
                <SectionIcon
                  source={require('@/assets/images/icons/route.png')}
                />
                <SectionTitle>미진행 루트</SectionTitle>
                <SectionIcon
                  source={require('@/assets/images/icons/arrow_forward.png')}
                  style={{ marginLeft: 'auto' }}
                />
              </SectionHeader>
              <Row>
                {upcomingRoutes.map((route: Route, index: number) => (
                  <RouteCard
                    key={index}
                    thumbnail=""
                    title={route.title}
                    date={route.preferredStartDate}
                    onPress={() => router.push(`/route/route-overview/${route.routeId}`)}
                    //progress={route.progress}
                  />
                ))}
              </Row>
            </Section>
            }
            { completedRoutes.length > 0 &&
            <Section>
              <SectionHeader
                onPress={() => router.push('/routehistory/completed')}
              >
                <SectionIcon
                  source={require('@/assets/images/icons/route.png')}
                />
                <SectionTitle>진행 완료 루트</SectionTitle>
                <SectionIcon
                  source={require('@/assets/images/icons/arrow_forward.png')}
                  style={{ marginLeft: 'auto' }}
                />
              </SectionHeader>
              <Row>
                {completedRoutes.map((route: Route, index: number) => (
                  <RouteCard
                    onPress={() => router.push(`/route/route-overview/${route.routeId}`)}
                    thumbnail=""
                    title={route.title}
                    date={route.preferredStartDate}
                    //progress={route.progress}
                  />
                ))}
              </Row>
            </Section>
            }
            <Section>
              <SectionHeader
                onPress={() => router.push('/place/place-favorite')}
              >
                <SectionIcon
                  source={require('@/assets/images/icons/like.png')}
                />
                <SectionTitle>좋아하는 장소</SectionTitle>
                <SectionIcon
                  source={require('@/assets/images/icons/arrow_forward.png')}
                  style={{ marginLeft: 'auto' }}
                />
              </SectionHeader>
              <Grid>
                {favoritePlaces.map((place) => (
                  <FavoritePlace
                    key={place.id}
                    id={place.id}
                    type={place.type}
                    category={place.category}
                    title={place.title}
                    thumbnail={place.thumbnail}
                    address={place.address}
                  />
                ))}
              </Grid>
            </Section>
          </>
        ) : (
          <Section>
            <LoginButton onPress={() => router.push('/account/login')}>
              <SectionTitle>
                <LoginButtonText>로그인</LoginButtonText>
              </SectionTitle>
            </LoginButton>
          </Section>
        )}
      <Section>
        <SectionHeader>
          <SectionIcon source={require('@/assets/images/icons/settings.png')} />
          <SectionTitle>설정</SectionTitle>
        </SectionHeader>

        <SettingItem>
          <SettingText>언어 설정</SettingText>
        </SettingItem>
        {profile && (
          <>
            <SettingItem onPress={handleLogout}>
              <SettingText>로그아웃</SettingText>
            </SettingItem>
            {/*
            <SettingItem>
              <SettingText>회원 탈퇴</SettingText>
            </SettingItem>
            */}
          </>
        )}
      </Section>
    </Container>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    width: '100%',
    height: 120,
  },
});


const LoadingContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: white;
`;

const LoadingText = styled.Text`
  font-size: 16px;
  color: #333;
`;

const ErrorContainer = styled(LoadingContainer)``;

const ErrorText = styled.Text`
  font-size: 14px;
  color: #d00;
  margin-bottom: 12px;
`;

const RetryButton = styled.TouchableOpacity`
  background-color: #007AFF;
  padding: 10px 16px;
  border-radius: 8px;
`;

const RetryButtonText = styled.Text`
  color: white;
  font-weight: 600;
`;

const LoginButton = styled.TouchableOpacity`
  background-color: #007AFF;
  padding: 12px;
  border-radius: 8px;
  align-items: center;
  color: white;
`;

const LoginButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: bold;
`;


const Container = styled.ScrollView`
  flex: 1;
  background-color: white;
`;

const Header = styled.View`
  align-items: center;
`;

const BackgroundImage = styled.Image`
  width: 100%;
  height: 120px;
`;

const AvatarWrapper = styled.View`
  margin-top: -40px;
  align-items: center;
`;

const Avatar = styled.Image`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  border: 3px solid white;
`;

const UserName = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-top: 8px;
`;

const UserEmail = styled.Text`
  color: gray;
  font-size: 13px;
`;

const EditButton = styled.TouchableOpacity`
  margin-top: 8px;
  padding: 6px 12px;
  border: 1px solid #aaa;
  border-radius: 16px;
`;

const EditText = styled.Text`
  font-size: 13px;
  color: #333;
`;

const Section = styled.View`
  margin-top: 24px;
  padding: 0 16px;
`;

const SectionHeader = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
  padding: 12px 0;
`;

const SectionIcon = styled.Image`
  width: 24px;
  height: 24px;

`;

const SectionTitle = styled.Text`
  font-weight: bold;
  font-size: 16px;
  margin-left: 8px;
`;

const Row = styled.View`
  flex-direction: row;
  gap: 12px;
`;

const Grid = styled.View`
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
`;

const SettingItem = styled.TouchableOpacity`
  padding: 12px 0;
  border-bottom-width: 0.5px;
  border-color: #eee;
`;

const SettingText = styled.Text`
  font-size: 15px;
  color: #333;
`;
