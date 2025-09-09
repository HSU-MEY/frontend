import Header from '@/components/common/Header';
import KakaoMapWebView from '@/components/KakaoMapWebView';
import { KAKAO_JS_API_KEY } from '@/src/env';
import { useRouteRunStore } from '@/store/useRouteRunStore';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef } from 'react';
import { ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import styled from 'styled-components/native';

export default function RouteStepScreen() {
  const { id, step = "1" } = useLocalSearchParams<{ id: string; step: string }>();
  const ref = useRef<WebView>(null);
  const JS_KEY = KAKAO_JS_API_KEY;

  const stepNum = useMemo(() => {
    const num = Number(step);
    return Number.isFinite(num) && num > 0 ? num : 1;
  }, [step]);

  const getSegment = useRouteRunStore((s) => s.getSegment);
  const segment = getSegment(String(id), stepNum - 1);
  const segmentCount = useRouteRunStore((s) => s.routes[id]?.segments.length ?? 0);

  if(!segment) {
    router.replace(`/route/route-overview/${id}`);
    return null;
  }

  const goNext = () => router.replace(`/route/route-step/${id}/${stepNum + 1}`);
  const goPrev = () => router.replace(`/route/route-step/${id}/${Math.max(1, stepNum - 1)}`);

  return (
    <Container>
    <Header title="루트" />
    <ScrollView>
      <KakaoMapWebView 
          //@ts-ignore - ref
          ref={ref}
          jsKey={JS_KEY}
          center={{ lat: 37.5665, lng: 126.9780 }}
          level={4}
          onPress={(lat, lng) => console.log('Map pressed at:', lat, lng)}
      ></KakaoMapWebView>

      <Section>
        <PlaceName>{segment.toName}</PlaceName>
        <InfoButton onPress={() => router.push("/place/place-detail")}>
          <InfoText>이 플레이스에 대한 정보</InfoText>
          <Ionicons name="chevron-forward" size={16} color="white" />
        </InfoButton>

        <StatsRow>
          <Stat>
            <StatLabel>총 거리</StatLabel>
            <StatValue>{(segment.distanceMeters / 1000).toFixed(1)}km</StatValue>
          </Stat>
          <Stat>
            <StatLabel>예상 시간</StatLabel>
            <StatValue>{(Math.round(segment.durationSeconds / 60))}분</StatValue>
          </Stat>
          <Stat>
            <StatLabel>예상 비용</StatLabel>
            <StatValue>{segment.fare.toLocaleString()}원</StatValue>
          </Stat>
        </StatsRow>
      </Section>

      <RouteLine />

      <StepsContainer>
        {segment.steps.map((s, i) => (
            <Step key={i}>
              <StepIcon>
                {s.mode === 'WALK' && <Ionicons name="walk-outline" size={20} color="#666" />}
                {s.mode === 'BUS' && <Ionicons name="bus-outline" size={20} color="#2680eb" />}
                {s.mode === 'SUBWAY' && <Ionicons name="subway-outline" size={20} color="#2680eb" />}
                {/* s.mode === 'ARRIVE' && <Ionicons name="location-sharp" size={20} color="#2680eb" /> */}
              </StepIcon>
              <StepText>
                {s.instruction}{'\n'}
                <SubText>
                  {Math.round(s.distanceMeters)}m · {Math.round(s.durationSeconds / 60)}분
                  {s.lineName}번, {s.numStops ? `${s.numStops}정거장` : ""}
                  {s.headsign ? `headsign · ${s.headsign}` : ""}
                </SubText>
              </StepText>
            </Step>
          ))}
      </StepsContainer>

      <BottomButtons>
        { stepNum <= 1 ? (
          <InactiveButton>
            <InactiveText>이전 플레이스</InactiveText>
          </InactiveButton>
        ) : (
          <ActiveButton onPress={() => goPrev() } >
            <ActiveText>이전 플레이스</ActiveText>
          </ActiveButton>
        )
        }
        { stepNum >= segmentCount ? (
          <ActiveButton onPress={() => router.replace("/")}>
            <ActiveText>루트 종료</ActiveText>
          </ActiveButton>
        ) : (
          <ActiveButton onPress={() => goNext() } >
            <ActiveText>다음 플레이스</ActiveText>
          </ActiveButton>
        )
        }
      </BottomButtons>
    </ScrollView>
    </Container>
  );
}
const Container = styled.View`
  flex: 1;
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
  font-weight: bold;
  margin-bottom: 12px;
  text-align: center;
  color: #333;
`;

//background: linear-gradient(90deg, #53d5ff, #4481ff);
const InfoButton = styled.TouchableOpacity`
  flex-direction: row;
  background-color: #4481ff;
  padding: 12px;
  border-radius: 999px;
  align-items: center;
  justify-content: center;
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
`;

const ActiveButton = styled.TouchableOpacity`
  flex: 1;
  padding: 12px;
  background-color: #2680eb;
  border-radius: 8px;
  align-items: center;
  margin-left: 8px;
`;

const ActiveText = styled.Text`
  color: white;
  font-weight: bold;
`;