import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView } from 'react-native';
import styled from 'styled-components/native';

export default function RouteStepScreen() {
  return (
    <ScrollView>
      <MapImage source={{ uri: 'https://placehold.co/600x400' }} />

      <Section>
        <PlaceName>케이팝 스퀘어 홍대</PlaceName>
        <InfoButton onPress={() => router.push("/place-detail")}>
          <InfoText>이 플레이스에 대한 정보</InfoText>
          <Ionicons name="chevron-forward" size={16} color="white" />
        </InfoButton>

        <StatsRow>
          <Stat>
            <StatLabel>총 거리</StatLabel>
            <StatValue>6.1km</StatValue>
          </Stat>
          <Stat>
            <StatLabel>예상 시간</StatLabel>
            <StatValue>24분</StatValue>
          </Stat>
          <Stat>
            <StatLabel>예상 비용</StatLabel>
            <StatValue>1,550원</StatValue>
          </Stat>
        </StatsRow>
      </Section>

      <RouteLine />

      <StepsContainer>
        <Step>
          <StepIcon>
            <Ionicons name="walk-outline" size={20} color="#666" />
          </StepIcon>
          <StepText>
            용산역 이동{"\n"}<SubText>3분 · 141m</SubText>
          </StepText>
        </Step>

        <Step>
          <StepIcon>
            <MaterialIcons name="train" size={20} color="#2680eb" />
          </StepIcon>
          <StepText>
            용산역 <Highlight>경의중앙선</Highlight> 승차{"\n"}<SubText>2역 이동 · 9분</SubText>
          </StepText>
        </Step>

        <Step>
          <StepIcon>
            <Ionicons name="exit-outline" size={20} color="#666" />
          </StepIcon>
          <StepText>홍대입구역 하차</StepText>
        </Step>

        <Step>
          <StepIcon>
            <Ionicons name="walk-outline" size={20} color="#666" />
          </StepIcon>
          <StepText>
            케이팝 스퀘어 홍대 이동{"\n"}<SubText>11분 · 671m</SubText>
          </StepText>
        </Step>

        <Step>
          <StepIcon>
            <Ionicons name="location-sharp" size={20} color="#2680eb" />
          </StepIcon>
          <StepText><Highlight>케이팝 스퀘어 홍대 도착</Highlight></StepText>
        </Step>
      </StepsContainer>

      <BottomButtons>
        <InactiveButton>
          <InactiveText>이전 플레이스</InactiveText>
        </InactiveButton>
        <ActiveButton>
          <ActiveText>다음 플레이스</ActiveText>
        </ActiveButton>
      </BottomButtons>
    </ScrollView>
  );
}

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