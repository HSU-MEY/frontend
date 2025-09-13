// app/route/route
import { getRouteApi, Routes, startRouteApi } from '@/api/routes.service';
import { changeUserRouteStatus } from '@/api/users.routes.service';
import Header from '@/components/common/Header';
import { useUserRoutes } from '@/hooks/useUserRoutes';
import { useWeather } from '@/hooks/useWeathers';
import { useRouteRunStore } from '@/store/useRouteRunStore';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from "expo-location";
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

function langSuffix(langCode?: string): 'Ko' | 'En' | 'Jp' | 'Ch' {
  const l = (langCode || 'ko').toLowerCase();
  if (l.startsWith('ko')) return 'Ko';
  if (l.startsWith('en')) return 'En';
  if (l.startsWith('ja')) return 'Jp';
  if (l.startsWith('zh')) return 'Ch';
  return 'Ko';
}

function pickLocalizedField<T extends Record<string, any>>(
  p: T | null | undefined,
  base: string,
  langCode?: string
): string {
  if (!p) return '';
  const suf = langSuffix(langCode);
  const tryKeys = [
    `${base}${suf}`,
    `${base}En`,
    `${base}Ko`,
    `${base}Jp`,
    `${base}Ch`,
    base, // 단일 필드(title, description 등) 지원
  ];
  for (const k of tryKeys) {
    const v = (p as any)[k];
    if (typeof v === 'string' && v.trim()) return v;
  }
  return '';
}

export default function RouteOverviewScreen() {
  const id = Number(useLocalSearchParams().id);
  const [route, setRoute] = useState<Routes | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [distance, setDistance] = React.useState<string>("");
  const [estimatedTime, setEstimatedTime] = React.useState<string>("");
  const [estimatedCost, setEstimatedCost] = React.useState<string>("");
  const [savedRouteId, setSavedRouteId] = useState<number | null>(null);
  const upsertRoute = useRouteRunStore((s) => s.upsertRoute);
  const setCurrent = useRouteRunStore((s) => s.setCurrent);
  const { i18n, t } = useTranslation();

  // As per user instruction: call the hook for each status
  const { save: saveUserRoute } = useUserRoutes();
  const { data: notStartedRoutes, loading: notStartedLoading } = useUserRoutes('NOT_STARTED');
  const { data: onGoingRoutes, loading: onGoingLoading } = useUserRoutes('ON_GOING');
  const { data: completedRoutes, loading: completedLoading } = useUserRoutes('COMPLETED');

  const routeStatus = useMemo(() => {
    const isLoading = onGoingLoading || completedLoading || notStartedLoading;
    if (isLoading) return 'LOADING';

    if (onGoingRoutes?.savedRoutes && onGoingRoutes.savedRoutes.some((r: any) => r.routeId === id)) {
      setSavedRouteId(onGoingRoutes.savedRoutes.find((r: any) => r.routeId === id)?.savedRouteId ?? null);
      return 'ON_GOING';
    }
    if (notStartedRoutes?.savedRoutes && notStartedRoutes.savedRoutes.some((r: any) => r.routeId === id)) {
      setSavedRouteId(notStartedRoutes.savedRoutes.find((r: any) => r.routeId === id)?.savedRouteId ?? null);
      return 'NOT_STARTED';
    }
    if (completedRoutes?.savedRoutes && completedRoutes.savedRoutes.some((r: any) => r.routeId === id)) {
      setSavedRouteId(completedRoutes.savedRoutes.find((r: any) => r.routeId === id)?.savedRouteId ?? null);
      return 'COMPLETED';
    }
    return 'NOT_SAVED';
  }, [id, onGoingRoutes, completedRoutes, onGoingLoading, completedLoading]);


  useEffect(() => {
    async function fetchRoute() {
      if (!isNaN(id)) {
        const response = await getRouteApi(id);
        const response_f = Array.isArray(response.result) ? response.result[0] : response.result;
        setRoute(response_f);
        setDistance(
          Number.isFinite(response_f.totalDistanceKm)
            ? `${Number(response_f.totalDistanceKm).toFixed(1)}km`
            : "0km"
        );
        const hours = Math.floor(response_f.totalDurationMinutes / 60);
        const minutes = response_f.totalDurationMinutes % 60;
        setEstimatedTime(
          `${hours}h ${minutes}m`
        );
        setEstimatedCost(
          response_f.estimatedCost.toString() + "KRW"
        );
      }
    }

    fetchRoute();
  }, [id]);

  const lat = route?.routePlaces[0]?.place.latitude;
  const lon = route?.routePlaces[0]?.place.longitude;

  const {
    data: weatherData,
    loading: weatherLoading,
    error: weatherError,
    refresh: refreshWeather,
  } = useWeather(lat, lon, { precision: 4 });

  const weatherDescription =
    weatherData?.weather?.[0]?.description ?? (weatherLoading ? "..." : weatherError ? "정보 없음" : "");
  const temperature =
    weatherData?.main?.temp != null ? `${weatherData.main.temp.toFixed(1)}°C` : "";

  const startRoute = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      throw new Error("위치 권한이 거부되었습니다.");
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const lat = location.coords.latitude;
    const lon = location.coords.longitude;

    const res = await startRouteApi(id, lat, lon);
    return res;
  }

  const handleStartRoute = async () => {
    setIsLoading(true);
    try {
      const route = useRouteRunStore.getState().routes[String(id)];
      let segments;

      if (route) {
        segments = route.segments;
        console.log("Using existing segments for route:", id);
      } else {
        const res = await startRoute();
        segments = res.result.segments ?? [];

        upsertRoute({ id: String(id), segments, startedAt: Date.now() });
        setCurrent(String(id));

        saveUserRoute(id, new Date(), "09:00").catch((error) => {
          console.error("Failed to save route:", error);
        });
      }

      if (savedRouteId !== null && savedRouteId >= 0) {
        changeUserRouteStatus(savedRouteId, 'ON_GOING').catch((error) => {
          //console.error("Failed to change route status:", error);
        });
      }

      //페이지 이동
      router.replace(`/route/route-step/${id}/1`);
    } catch (error) {
      console.error("Failed to start route:", error);
      alert("경로 시작에 실패했습니다. 위치 권한을 확인해주세요.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleLaterButton = () => {
    if (routeStatus !== 'NOT_SAVED' && savedRouteId !== null) {
      saveUserRoute(savedRouteId, new Date(), "09:00").catch((error) => {
        //console.error("Failed to save route:", error);
      });
    }

    router.back();
  }

  return (
    <Container>
      <Header title={t('routeOverview.title')} />

      <ImageBackground
        source={{ uri: 'https://placehold.co/300x300' }}
        style={styleSheet.HeaderSection}
      >
        <Title>{pickLocalizedField(route, 'title', i18n.language) || route?.title || ''}</Title>
        <Subtitle>{pickLocalizedField(route, 'regionName', i18n.language) || route?.theme || ''}</Subtitle>
        <Description>{pickLocalizedField(route, 'description', i18n.language) || route?.description || ''}</Description>
      </ImageBackground>

      <RouteInfoContainer>
        <Row>
          <InfoBox>
            <InfoTitle>{t('routeOverview.thisJourney')}</InfoTitle>
            <InfoImage source={require('../../../assets/images/plane.png')} style={{ right: 0, width: 192 }} />
            <InfoHighlightA style={{ marginTop: 42 }}>{t('routeOverview.totalDistance', { distance })}</InfoHighlightA>
          </InfoBox>
        </Row>

        <Row style={{ flex: 1 }}>
          <Column style={{ flex: 1 }}>
            <InfoBox style={{ flex: 2 }}>
              <InfoTitle>{t('routeOverview.placesToVisit')}</InfoTitle>
              <InfoSubtext>
                {pickLocalizedField(route?.routePlaces?.[0]?.place, 'name', i18n.language)
                  || route?.routePlaces?.[0]?.place.name
                  || ''}
                {"\n"} ... {"\n"}
                {pickLocalizedField(
                  route?.routePlaces?.[(route?.routePlaces?.length ?? 1) - 1]?.place,
                  'name',
                  i18n.language
                ) || route?.routePlaces?.[(route?.routePlaces?.length ?? 1) - 1]?.place.name || ''}
              </InfoSubtext>
              <InfoImage source={require('../../../assets/images/city.png')} style={{ right: 0, top: 80, width: 124, height: 124 }} />
              <InfoHighlight style={{ marginTop: 102 }}>{t('routeOverview.placesCount', { count: route?.routePlaces.length ?? 0 })}</InfoHighlight>
              <InfoImage source={require('../../../assets/images/transport.png')} style={{ bottom: 40, width: 178 }} />
              <InfoHighlight style={{ marginTop: 86, textAlign: 'right' }}>{t('routeOverview.totalTime', { time: estimatedTime })}</InfoHighlight>
            </InfoBox>
          </Column>
          <Column style={{ flex: 1 }}>
            <InfoBox style={{ flex: 1 }}>
              <InfoTitle>{t('routeOverview.estimatedCostTitle')}</InfoTitle>
              <InfoImage source={require('../../../assets/images/money.png')} style={{ top: 20 }} />
              <InfoHighlight style={{ marginTop: 82, textAlign: 'right' }}>{t('routeOverview.estimatedCost', { cost: estimatedCost })}</InfoHighlight>
            </InfoBox>

            <InfoBox style={{ flex: 1 }}>
              <InfoTitle>{t('routeOverview.weatherTitle')}</InfoTitle>
              <InfoHighlight>{t('routeOverview.weatherSentence', { desc: weatherDescription, temp: temperature })}
              </InfoHighlight>
            </InfoBox>
          </Column>
        </Row>


      </RouteInfoContainer>

      <ButtonRow>
        <ButtonOutline onPress={handleLaterButton} disabled={isLoading}>
          <ButtonText>{t('routeOverview.doLater')}</ButtonText>
        </ButtonOutline>
        <TouchableOpacity
          onPress={handleStartRoute} disabled={isLoading || routeStatus === 'LOADING'} style={{ opacity: ((isLoading || routeStatus === 'LOADING') ? 0.7 : 1), width: '60%' }}
        >
          <LinearGradient
            colors={['#69E8D9', '#0080FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styleSheet.startButton}
          >
            {(isLoading || routeStatus === 'LOADING') ? <ActivityIndicator color="white" /> : (
              <ButtonTextPrimary>
                {routeStatus === 'ON_GOING'
                  ? t('routeOverview.resume')
                  : routeStatus === 'COMPLETED'
                    ? t('routeOverview.restart')
                    : t('routeOverview.start')}
              </ButtonTextPrimary>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ButtonRow>
    </Container>
  );
}


const styleSheet = StyleSheet.create(
  {
    HeaderSection: {
      padding: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderRadius: 12,
      marginBottom: 16,
      textAlign: 'center',
    },
    startButton: {
      borderRadius: 100,
      paddingVertical: 14,
      paddingHorizontal: 24,
      alignItems: 'center',
    },
  }
)

const Container = styled.ScrollView`
  flex: 1;
  background-color: white;
`;

const Title = styled.Text`
  font-size: 22px;
  font-weight: bold;
`;

const Subtitle = styled.Text`
  font-size: 16px;
  color: #666;
  margin-top: 4px;
`;

const Description = styled.Text`
  margin-top: 12px;
  line-height: 20px;
  color: #444;
`;

const RouteInfoContainer = styled.View`
  padding: 0 16px;
  margin-top: 16px;
  gap: 12px;
`;

const Row = styled.View`
  flex-direction: row;
  gap: 12px;
`;

const Column = styled.View`
  flex: 1;
  gap: 12px;
`;

const InfoBox = styled.View`
  flex: 1;
  background-color: #f1f6ff;
  padding: 16px;
  border-radius: 12px;
`;

const InfoTitle = styled.Text`
  font-size: 18px;
  margin-bottom: 6px;
  color: #1C5BD8;
  font-family: 'Pretendard-Bold';
`;

const InfoHighlight = styled.Text`
  font-size: 15px;
  
  font-family: 'Pretendard-SemiBold';
`;

const InfoHighlightA = styled.Text`
  font-size: 20px;
  margin-bottom: 6px;
  font-family: 'Pretendard-SemiBold';
`;

const HighlightA = styled.Text`  
  font-size: 24px;
  font-family: 'Pretendard-Bold';
  color: #0080FF;
`;

const Highlight = styled.Text`
  color: #0080FF;
  font-family: 'Pretendard-Bold';
`;

const InfoSubtext = styled.Text`
  font-size: 12px;
  color: #666;
`;

const InfoImage = styled.Image`
  position: absolute;
  width: 128px;
  height: 128px;
`;

const ButtonRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: 16px;
  margin-top: 12px;
`;

const ButtonOutline = styled.TouchableOpacity`
  flex: 1;
  background-color: #FAF8FF;
  margin-right: 8px;
  padding: 12px;
  border-radius: 100px;
  align-items: center;
`;

const ButtonText = styled.Text`
  color: #0080FF;
  font-family: 'Pretendard-SemiBold';
`;

const ButtonTextPrimary = styled.Text`
  color: white;
  font-family: 'Pretendard-Bold';
`;
