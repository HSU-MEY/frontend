// app/(tabs)/myroute.tsx
import RouteCard from '@/components/mypage/route-card';
import { places } from '@/data/dummyPlaces';
import { Place } from '@/types/Place';
import { router } from 'expo-router';
import styled from 'styled-components/native';

import { Route } from '@/api/users.routes.service';
import LanguageSheet from '@/components/common/LanguageSheet';

import { favoritePlaceList } from '@/data/favoritePlace';
//import { completedRoutes, inProgressRoutes, upcomingRoutes } from '@/data/routesInProgress';
import { useUserRoutes } from "@/hooks/useUserRoutes";

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';

import { getMyProfile, type UserProfile } from '@/api/user';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useIsFocused } from '@react-navigation/native';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet } from 'react-native';

const favoritePlaces = places.filter((place: Place) => favoritePlaceList.includes(place.id));

export default function MyPage() {
  const { logout, ensureValidAccessToken } = useAuthSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);

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

  const upcomingRoutes = upcomingData?.savedRoutes ?? [];
  const inProgressRoutes = inProgressData?.savedRoutes ?? [];
  const completedRoutes = completedData?.savedRoutes ?? [];


  const loadingAll = upcomingLoading || inProgressLoading || completedLoading;
  const errorAll = upcomingError || inProgressError || completedError;
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
            t('auth.reauthTitle'),
            t('auth.reauthBody'),
            [
              {
                text: t('common.ok'),
                onPress: async () => {
                  await logout();
                  router.replace('/account/login');
                }
              }
            ]
          );
          return; // 더 진행하지 않음
        }
        if (mounted) setError(msg || t('common.loadFail'));
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
    Alert.alert(
      t('auth.logoutTitle'),
      t('auth.logoutConfirm'),
      [
        { text: t('common.cancel'), style: "cancel" },
        {
          text: t('auth.logout'), style: "destructive", onPress: async () => {
            await logout();
            router.replace('/');
            Alert.alert(t('auth.logoutDone'));
          }
        }
      ]);
  };


  if (loading) {
    return (
      <LoadingContainer>
        <LoadingText>{t('common.loading')}</LoadingText>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <ErrorText>{error}</ErrorText>
        <RetryButton onPress={() => router.replace('/(tabs)/myroute')}>
          <RetryButtonText>{t('common.retry')}</RetryButtonText>
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
              <EditText>{t('profile.editProfile')}</EditText>
            </EditButton>
          )}
        </AvatarWrapper>
      </Header>

      {profile ?
        (
          <>
            {inProgressRoutes.length > 0 &&
              <Section>
                <SectionHeader
                  onPress={() => router.push('/routehistory/ongoing')}
                >
                  <SectionIcon
                    source={require('@/assets/images/icons/route.png')}
                  />
                  <SectionTitle>{t('routes.ongoing')}</SectionTitle>
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
            {upcomingRoutes.length > 0 &&
              <Section>
                <SectionHeader
                  onPress={() => router.push('/routehistory/pending')}
                >
                  <SectionIcon
                    source={require('@/assets/images/icons/route.png')}
                  />
                  <SectionTitle>{t('routes.notStarted')}</SectionTitle>
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
            {completedRoutes.length > 0 &&
              <Section>
                <SectionHeader
                  onPress={() => router.push('/routehistory/completed')}
                >
                  <SectionIcon
                    source={require('@/assets/images/icons/route.png')}
                  />
                  <SectionTitle>{t('routes.completed')}</SectionTitle>
                  <SectionIcon
                    source={require('@/assets/images/icons/arrow_forward.png')}
                    style={{ marginLeft: 'auto' }}
                  />
                </SectionHeader>
                <Row>
                  {completedRoutes.map((route: Route, index: number) => (
                    <RouteCard
                      key={index}
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
            {/* 좋아하는 장소 섹션 
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
            */}
          </>
        ) : (
          <Section>
            <LoginButton onPress={() => router.push('/account/login')}>
              <SectionTitle>
                <LoginButtonText>{t('auth.login')}</LoginButtonText>
              </SectionTitle>
            </LoginButton>
          </Section>
        )}
      <Section>
        <SectionHeader>
          <SectionIcon source={require('@/assets/images/icons/settings.png')} />
          <SectionTitle>{t('settings.title')}</SectionTitle>
        </SectionHeader>

        <SettingItem onPress={() => setLangOpen(true)}>
          <SettingText>{t('settings.language')}</SettingText>
        </SettingItem>

        {profile && (
          <>
            <SettingItem onPress={handleLogout}>
              <SettingText>{t('auth.logout')}</SettingText>
            </SettingItem>
            {/*
            <SettingItem>
              <SettingText>회원 탈퇴</SettingText>
            </SettingItem>
            */}
          </>
        )}
      </Section>

      <LanguageSheet visible={langOpen} onClose={() => setLangOpen(false)} />
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
