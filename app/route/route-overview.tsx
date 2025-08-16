// app/route/route
import Header from '@/components/common/Header';
import { router } from 'expo-router';
import { ImageBackground, StyleSheet } from 'react-native';
import styled from 'styled-components/native';

export default function RouteOverviewScreen() {
  return (
    <Container>
      <Header title="여행 개요" />

      <ImageBackground
        source={{ uri: 'https://placehold.co/600x400' }}
        style={ styleSheet.HeaderSection }
      >
        <Title>K-POP 루트: Idol</Title>
        <Subtitle>서울 홍대</Subtitle>
        <Description>
          아이들의 데뷔를 준비하고 그들을 배출한 유명 회사의 비공개 연습실, 아트테인먼트 전시, JYP HYBE 관련 건축 기념사 및 팬문화 탐방, 샵과 성지 순례가 포함된 장소들을 따라가며 K-POP의 성지를 감성으로 느껴보는 루트 코스입니다.
        </Description>
      </ImageBackground>

      <RouteInfoContainer>
        <Row>
          <InfoBox>
            <InfoTitle>이 여정은...</InfoTitle>
            <InfoHighlight>총 <Highlight>13.6km</Highlight>를 여행해요</InfoHighlight>
            <InfoImage source={{ uri: 'https://placehold.co/300x300' }} />
          </InfoBox>
        </Row>

        <Row style={{ flex: 1 }}>
          <Column style={{ flex: 1 }}>
            <InfoBox style={{ flex: 2 }}>
              <InfoTitle>우리가 둘러볼 곳은...</InfoTitle>
              <InfoHighlight><Highlight>12개</Highlight>의 장소를 둘러볼 예정이에요</InfoHighlight>
              <InfoSubtext>케이팝 스폿의 핫한 10곳 장소 포함</InfoSubtext>
              <InfoImage source={{ uri: 'https://placehold.co/300x300' }} />

              <InfoHighlight>예상 총 이동 시간은 <Highlight>2시간 12분</Highlight>이에요</InfoHighlight>
              <InfoImage source={{ uri: 'https://placehold.co/300x300' }} />
            </InfoBox>
          </Column>
          <Column style={{ flex: 1 }}>
            <InfoBox style={{ flex: 1}}>
              <InfoTitle>예상 비용</InfoTitle>
              <InfoHighlight>교통비로 약 <Highlight>8,950원</Highlight>을 소모할 것 같아요</InfoHighlight>
              <InfoImage source={{ uri: 'https://placehold.co/300x300' }} />
            </InfoBox>

            <InfoBox style={{ flex: 1 }}>
              <InfoTitle>날씨</InfoTitle>
              <InfoHighlight>오늘의 온도는 30도에요 </InfoHighlight>
            </InfoBox>
          </Column>
        </Row>


      </RouteInfoContainer>

      <ButtonRow>
        <ButtonOutline>
          <ButtonText>다음에 할래요</ButtonText>
        </ButtonOutline>
        <ButtonPrimary onPress={() => router.push("/route/route-step")}>
          <ButtonTextPrimary>여행을 시작하지</ButtonTextPrimary>
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
