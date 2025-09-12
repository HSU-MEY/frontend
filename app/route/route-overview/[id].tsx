// app/route/route
import { getRouteApi, Routes, startRouteApi } from '@/api/routes.service';
import { changeUserRouteStatus } from '@/api/users.routes.service';
import Header from '@/components/common/Header';
import { useUserRoutes } from '@/hooks/useUserRoutes';
import { useWeather } from '@/hooks/useWeathers';
import { useRouteRunStore } from '@/store/useRouteRunStore';
import * as Location from "expo-location";
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ImageBackground, StyleSheet } from 'react-native';
import styled from 'styled-components/native';


export default function RouteOverviewScreen() {
  const id = Number(useLocalSearchParams().id);
  const [route, setRoute] = useState<Routes | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [distance, setDistance] = React.useState<string>("");
  const [estimatedTime, setEstimatedTime] = React.useState<string>("");
  const [estimatedCost, setEstimatedCost] = React.useState<string>("");
  const [savedRouteId, setSavedRouteId ] = useState<number | null>(null);
  const upsertRoute = useRouteRunStore((s) => s.upsertRoute);
  const setCurrent = useRouteRunStore((s) => s.setCurrent);
  
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
          response_f.totalDistanceKm.toString()
          ? (response_f.totalDistanceKm / 1000).toFixed(1) + "km"
          : "0"
        );
        const hours = Math.floor(response_f.totalDurationMinutes / 60);
        const minutes = response_f.totalDurationMinutes % 60;
        setEstimatedTime(
          `${hours}시간 ${minutes}분`
        );
        setEstimatedCost(
          response_f.estimatedCost.toString() + "원"
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
    if(status !== "granted") {
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

      if(route) {
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

      if(savedRouteId !== null && savedRouteId >= 0) {
        changeUserRouteStatus(savedRouteId, 'ON_GOING').catch((error) => {
        console.error("Failed to change route status:", error);
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
    if(routeStatus !== 'NOT_SAVED') {
      saveUserRoute(id, new Date(), "09:00").catch((error) => {
        console.error("Failed to save route:", error);
      });
    }
    
    router.back();
  }

  return (
    <Container>
      <Header title="여행 개요" />

      <ImageBackground
        source={{ uri: 'https://placehold.co/300x300' }}
        style={ styleSheet.HeaderSection }
      >
        <Title>{ route?.title }</Title>
        <Subtitle>{ route?.theme }</Subtitle>
        <Description>
          { route?.description }
        </Description>
      </ImageBackground>

      <RouteInfoContainer>
        <Row>
          <InfoBox>
            <InfoTitle>이 여정은...</InfoTitle>
            <InfoHighlight>총 <Highlight>{ distance }</Highlight>를 여행해요</InfoHighlight>
            <InfoImage source={{ uri: 'https://placehold.co/300x300' }} />
          </InfoBox>
        </Row>

        <Row style={{ flex: 1 }}>
          <Column style={{ flex: 1 }}>
            <InfoBox style={{ flex: 2 }}>
              <InfoTitle>우리가 둘러볼 곳은...</InfoTitle>
              <InfoHighlight><Highlight>{ route?.routePlaces.length }개</Highlight>의 장소를 둘러볼 예정이에요</InfoHighlight>
              <InfoSubtext>{ route?.routePlaces[0].place.name }에서 {"\n"} { route?.routePlaces[route?.routePlaces.length - 1].place.name }까지</InfoSubtext>
              <InfoImage source={{ uri: 'https://placehold.co/300x300' }} />

              <InfoHighlight>예상 총 이동 시간은 <Highlight>{ estimatedTime }</Highlight>이에요</InfoHighlight>
              <InfoImage source={{ uri: 'https://placehold.co/300x300' }} />
            </InfoBox>
          </Column>
          <Column style={{ flex: 1 }}>
            <InfoBox style={{ flex: 1}}>
              <InfoTitle>예상 비용</InfoTitle>
              <InfoHighlight>교통비로 약 <Highlight>{ estimatedCost }</Highlight>을 소모할 것 같아요</InfoHighlight>
              <InfoImage source={{ uri: 'https://placehold.co/300x300' }} />
            </InfoBox>

            <InfoBox style={{ flex: 1 }}>
              <InfoTitle>날씨</InfoTitle>
              <InfoHighlight>오늘의 날씨는 <Highlight>{ weatherDescription }, { temperature }</Highlight>입니다. </InfoHighlight>
            </InfoBox>
          </Column>
        </Row>


      </RouteInfoContainer>

      <ButtonRow>
        <ButtonOutline onPress={handleLaterButton} disabled={isLoading}>
          <ButtonText>다음에 할래요</ButtonText>
        </ButtonOutline>
        <ButtonPrimary onPress={handleStartRoute} disabled={isLoading || routeStatus === 'LOADING'} style={{ opacity: (isLoading || routeStatus === 'LOADING') ? 0.7 : 1 }}>
          {(isLoading || routeStatus === 'LOADING') ? <ActivityIndicator color="white" /> : (
            <ButtonTextPrimary>
              {routeStatus === 'ON_GOING'
                ? '여행 이어하기'
                : routeStatus === 'COMPLETED'
                ? '여행 다시하기'
                : '여행 시작하기'}
            </ButtonTextPrimary>
          )}
        </ButtonPrimary>
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
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 6px;
  color: #2680eb;
`;

const InfoHighlight = styled.Text`
  font-size: 15px;
  margin-bottom: 6px;
`;

const Highlight = styled.Text`
  color: #2680eb;
  font-weight: bold;
`;

const InfoSubtext = styled.Text`
  font-size: 12px;
  color: #666;
`;

const InfoImage = styled.Image`
  width: 36px;
  height: 36px;
  margin-top: 8px;
`;

const ButtonRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: 16px;
`;

const ButtonOutline = styled.TouchableOpacity`
  flex: 1;
  margin-right: 8px;
  padding: 12px;
  border: 1px solid #2680eb;
  border-radius: 8px;
  align-items: center;
`;

const ButtonPrimary = styled.TouchableOpacity`
  flex: 1;
  margin-left: 8px;
  padding: 12px;
  background-color: #2680eb;
  border-radius: 8px;
  align-items: center;
`;

const ButtonText = styled.Text`
  color: #2680eb;
  font-weight: bold;
`;

const ButtonTextPrimary = styled.Text`
  color: white;
  font-weight: bold;
`;
