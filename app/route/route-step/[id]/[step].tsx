import { searchPlaces } from '@/api/places.service';
import { changeUserRouteStatus } from '@/api/users.routes.service';
import Header from '@/components/common/Header';
import KakaoMapWebView, { KakaoMapHandle } from '@/components/KakaoMapWebView';
import { useUserRoutes } from '@/hooks/useUserRoutes';
import { KAKAO_JS_API_KEY } from '@/src/env';
import { useRouteRunStore } from '@/store/useRouteRunStore';
import {
  formatCurrencyKRW,
  formatDistanceMeters,
  formatMeters,
  formatMinutes,
  localizeInstruction
} from '@/utils/navI18n';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';

export default function RouteStepScreen() {
  const { i18n, t } = useTranslation();
  const { id: idString, step = "1" } = useLocalSearchParams<{ id: string; step: string }>();
  const id = Number(idString);
  const mapRef = useRef<KakaoMapHandle>(null);
  const JS_KEY = KAKAO_JS_API_KEY;

  const { data: onGoingData } = useUserRoutes('ON_GOING');

  const stepNum = useMemo(() => {
    const num = Number(step);
    return Number.isFinite(num) && num > 0 ? num : 1;
  }, [step]);

  const getSegment = useRouteRunStore((s) => s.getSegment);
  const goToNextSegment = useRouteRunStore((s) => s.goToNextSegment);
  const routeRun = useRouteRunStore((s) => s.routes[String(id)]);

  const segment = getSegment(String(id), stepNum - 1);
  const segmentCount = useRouteRunStore((s) => s.routes[id]?.segments.length ?? 0);


  if (!segment) {
    router.replace(`/route/route-step/${id}`);
    return null;
  }

  const goNext = () => {
    goToNextSegment(String(id)); // Update currentSegmentIndex in store
    router.replace(`/route/route-step/${id}/${stepNum + 1}`);
  };
  const goPrev = () => router.replace(`/route/route-step/${id}/${Math.max(1, stepNum - 1)}`);

  const handlePanTo = (lat: number, lng: number) => {
    mapRef.current?.panTo(lat, lng);
  }

  const handlePlaceButtonPress = async () => {
    try {
      const places = await searchPlaces(segment.toName, 1);
      const placeId = places?.[0]?.id;

      if (!placeId) {
        Alert.alert(t('common.info'), t('routeStep.alerts.placeNotFound'));
        return;
      }

      router.push({
        pathname: '/place/place-detail/[id]',
        params: { id: String(placeId) },
      });
    } catch (e) {
      Alert.alert(t('common.error'), t('routeStep.alerts.placeLoadFailed'));
    }
  };

  const handleEndRoute = async () => {
    if (!onGoingData?.savedRoutes) {
      Alert.alert(t('common.error'), t('routeStep.alerts.ongoingMissing'));
      return;
    }

    const currentRoute = onGoingData.savedRoutes.find(r => r.routeId === id);

    if (!currentRoute) {
      Alert.alert(t('common.error'), t('routeStep.alerts.currentRouteNotFound'));
      return;
    }

    try {
      await changeUserRouteStatus(currentRoute.savedRouteId, 'COMPLETED');
      Alert.alert(t('common.success'), t('routeStep.alerts.completeSuccess'), [
        { text: t('common.ok'), onPress: () => router.replace("/(tabs)") }
      ]);
    } catch (error) {
      console.error("Failed to change route status:", error);
      Alert.alert("오류", "경로 완료 처리에 실패했습니다.");
    }
  }

  return (
    <Container>
      <Header title={t('route.title')} />
      <View style={{ width: '100%', height: 300, backgroundColor: 'lightgrey' }}>
        <KakaoMapWebView
          ref={mapRef}
          jsKey={JS_KEY}
          center={{ lat: segment.fromLat, lng: segment.fromLng }}
          level={4}
          segments={[segment]}
        //onPress={(lat, lng) => console.log('Map pressed at:', lat, lng)}
        ></KakaoMapWebView>
      </View>
      <ScrollView>
        <Section>
          <Text style={{ textAlign: 'center', color: '#666', marginBottom: 8 }}>
            {t('routeStep.guiding', { step: stepNum, total: segmentCount })}
          </Text>
          <PlaceName>{segment.toName}</PlaceName>
          <InfoButton onPress={handlePlaceButtonPress}>
            <LinearGradient
              colors={['#69E8D9', '#0080FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styleSheet.startButton}
            >
              <InfoText>{t('routeStep.placeDetail')}</InfoText>
              <Ionicons name="chevron-forward" size={16} color="white" />
            </LinearGradient>
          </InfoButton>

          <StatsRow>
            <Stat>
              <StatLabel>{t('routeStep.stats.totalDistance')}</StatLabel>
              <StatValue>{formatDistanceMeters(segment.distanceMeters, i18n.language)}</StatValue>
            </Stat>
            <Stat>
              <StatLabel>{t('routeStep.stats.estimatedTime')}</StatLabel>
              <StatValue>{formatMinutes(segment.durationSeconds / 60, i18n.language)}</StatValue>
            </Stat>
            <Stat>
              <StatLabel>{t('routeStep.stats.estimatedCost')}</StatLabel>
              <StatValue>{formatCurrencyKRW(segment.fare, i18n.language)}</StatValue>
            </Stat>
          </StatsRow>
        </Section>

        <RouteLine />

        <StepsContainer>
          {segment.steps.map((s, i) => (
            <TouchableOpacity key={i} onPress={() => s.polyline && s.polyline.length > 0 && handlePanTo(s.polyline[0].lat, s.polyline[0].lng)}>
              <Step>
                <StepIcon>
                  {s.mode === 'WALK' && <Ionicons name="walk-outline" size={20} color="#666" />}
                  {s.mode === 'BUS' && <Ionicons name="bus-outline" size={20} color="#2680eb" />}
                  {s.mode === 'SUBWAY' && <Ionicons name="subway-outline" size={20} color="#2680eb" />}
                  {/* s.mode === 'ARRIVE' && <Ionicons name="location-sharp" size={20} color="#2680eb" /> */}
                  {s.mode === 'RAIL' && <Ionicons name="train-outline" size={20} color="#2680eb" />}
                </StepIcon>
                <StepText>
                  {localizeInstruction(s.instruction, i18n.language)}{'\n'}
                  <SubText>
                    {formatMeters(Math.round(s.distanceMeters), i18n.language)} · {formatMinutes(s.durationSeconds / 60, i18n.language)}
                  </SubText>
                </StepText>
              </Step>
            </TouchableOpacity>
          ))}
        </StepsContainer>

        <BottomButtons>
          {stepNum <= 1 ? (
            <InactiveButton>
              <InactiveText>{t('routeStep.prevPlace')}</InactiveText>
            </InactiveButton>
          ) : (
            <ActiveButton onPress={() => goPrev()} >
              <ActiveText>{t('routeStep.prevPlace')}</ActiveText>
            </ActiveButton>
          )
          }
          {stepNum >= segmentCount ? (
            <EndButton onPress={handleEndRoute}>
              <EndText>{t('routeStep.endRoute')}</EndText>
            </EndButton>
          ) : (
            <ActiveButton onPress={() => goNext()} >
              <ActiveText>{t('routeStep.nextPlace')}</ActiveText>
            </ActiveButton>
          )
          }
        </BottomButtons>
      </ScrollView>
    </Container>
  );
}

const styleSheet = StyleSheet.create(
  {
    startButton: {
      borderRadius: 100,
      paddingVertical: 14,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      flexDirection: 'row',
    },
  }
)

const Container = styled.View`
  flex: 1;
  background-color: white;
`;

const MapImage = styled.Image`
  width: 100%;
  height: 200px;
`;

const Section = styled.View`
  padding: 16px;
`;

const PlaceName = styled.Text`
  font-size: 20px;
  font-family: 'Pretendard-Bold';
  text-align: center;
  color: #0080FF;
`;

//background: linear-gradient(90deg, #53d5ff, #4481ff);
const InfoButton = styled.TouchableOpacity`
  flex-direction: row;
  padding: 12px;
  border-radius: 999px;
  margin-bottom: 16px;
`;

const InfoText = styled.Text`
  color: white;
  font-weight: bold;
  margin-right: 6px;
`;

const StatsRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  background-color: #faf8ff;
  padding: 12px;
  border-radius: 8px;
`;

const Stat = styled.View`
  align-items: center;
  flex: 1;
`;

const StatLabel = styled.Text`
  font-size: 13px;
  color: #999;
`;

const StatValue = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #2680eb;
`;

const RouteLine = styled.View`
  height: 1px;
  background-color: #ddd;
  margin: 12px 0;
`;

const StepsContainer = styled.View`
  padding: 0 16px;
`;

const Step = styled.View`
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 20px;
`;

const StepIcon = styled.View`
  width: 28px;
  margin-top: 3px;
`;

const StepText = styled.Text`
  flex: 1;
  font-size: 14px;
  line-height: 20px;
  color: #333;
`;

const SubText = styled.Text`
  font-size: 12px;
  color: #777;
`;

const Highlight = styled.Text`
  color: #2680eb;
  font-weight: bold;
`;

const BottomButtons = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: 16px;
`;

const InactiveButton = styled.View`
  flex: 1;
  padding: 12px;
  background-color: #eee;
  border-radius: 8px;
  align-items: center;
  margin-right: 8px;
`;

const InactiveText = styled.Text`
  color: #888;
  font-family: 'Pretendard-SemiBold';
`;

const ActiveButton = styled.TouchableOpacity`
  flex: 1;
  padding: 12px;
  background-color: #FFFFFF;
  border: 1px solid #2680eb;
  border-radius: 8px;
  align-items: center;
  margin-left: 8px;
`;

const ActiveText = styled.Text`
  color: #2680eb;
  font-family: 'Pretendard-SemiBold';
`;

const EndButton = styled.TouchableOpacity`
  flex: 1;
  padding: 12px;
  background-color: #2680eb;
  border-radius: 8px;
  align-items: center;
  margin-left: 8px;
`;

const EndText = styled.Text`
  color: #fff;
  font-family: 'Pretendard-SemiBold';
`;