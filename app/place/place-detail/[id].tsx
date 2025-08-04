import { places } from '@/data/dummyPlaces';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import styled from 'styled-components/native';

import Header from '@/components/common/Header';


export default function PlaceDetailScreen() {
  const id = useLocalSearchParams().id;
  const place = places.find(p => p.id === Number(id));

  return (
    <Container>
      <Header title="플레이스" />
      <TopImage source={ place?.thumbnail } />

      <Section>
        <Title>{ place?.title }</Title>

        <InfoBox>
          <InfoItem>
            <Ionicons name="information-circle-outline" size={16} color="gray" />
            <InfoText>{ place?.time } </InfoText>
          </InfoItem>
          <InfoItem>
            <Ionicons name="location-outline" size={16} color="gray" />
            <InfoText>{ place?.address }</InfoText>
          </InfoItem>
          <InfoItem>
            <Ionicons name="pricetags-outline" size={16} color="gray" />
            <InfoText>{ place?.price }</InfoText>
          </InfoItem>
          <InfoItem>
            <Ionicons name="call-outline" size={16} color="gray" />
            <InfoText>{ place?.contact } </InfoText>
            {/*<InfoText onPress={() => Linking.openURL('tel:02-541-9270')}>02-541-9270</InfoText>*/}
          </InfoItem>
        </InfoBox>

        <Description>
          { place?.description }
        </Description>
      </Section>

      <Section>
        <Subtitle>주요 이벤트</Subtitle>
        <Card>
          <CardImage source={{ uri: 'https://placehold.co/300x300' }} />
          <CardText>
            설화수 피부 진단 & 맞춤 앰플 클래스{"\n"}매일 11:00 - 20:00
          </CardText>
        </Card>
        <Card>
          <CardImage source={{ uri: 'https://placehold.co/300x300' }} />
          <CardText>
            ‘색채, 결이 되다’ 복운경 작가 쿠레이지 이벤트{"\n"}매일 11:00 - 20:00
          </CardText>
        </Card>
      </Section>

      <Section>
        <Subtitle>관련 게시물</Subtitle>
        <Row>
          <RelatedCard>
            <RelatedImage source={{ uri: 'https://placehold.co/300x200' }} />
            <RelatedText>설화수 플래그십 스토어에서의 특별한 하루</RelatedText>
          </RelatedCard>
          <RelatedCard>
            <RelatedImage source={{ uri: 'https://placehold.co/300x200' }} />
            <RelatedText>설화수 피부 진단 & 맞춤 클래스 후기</RelatedText>
          </RelatedCard>
        </Row>
      </Section>

      <Section>
        <Subtitle>근처 명소</Subtitle>
        <Row>
          <NearbyCard>
            <NearbyImage source={{ uri: 'https://placehold.co/300x300' }} />
            <NearbyText>핑크로즈 CAFE{"\n"}도보 1.2km</NearbyText>
          </NearbyCard>
          <NearbyCard>
            <NearbyImage source={{ uri: 'https://placehold.co/300x300' }} />
            <NearbyText>진대감 벽제 본점{"\n"}도보 320m</NearbyText>
          </NearbyCard>
          <NearbyCard>
            <NearbyImage source={{ uri: 'https://placehold.co/300x300' }} />
            <NearbyText>스위트브레드 베이커리{"\n"}도보 140m</NearbyText>
          </NearbyCard>
        </Row>
      </Section>
    </Container>
  );
}

const Container = styled.ScrollView`
  flex: 1;
  background-color: #fff;
`;

const TopImage = styled.Image`
  width: 100%;
  height: 240px;
`;

const Section = styled.View`
  padding: 16px;
`;

const Title = styled.Text`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 16px;
`;

const Subtitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
`;

const InfoBox = styled.View`
  margin-bottom: 16px;
`;

const InfoItem = styled.View`
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const InfoText = styled.Text`
  margin-left: 8px;
  flex: 1;
  color: #333;
`;

const Description = styled.Text`
  line-height: 20px;
  color: #555;
`;

const Card = styled.View`
  flex-direction: row;
  margin-bottom: 12px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 12px;
`;

const CardImage = styled.Image`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  margin-right: 12px;
`;

const CardText = styled.Text`
  flex: 1;
  font-size: 14px;
  color: #333;
  line-height: 18px;
`;

const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const RelatedCard = styled.View`
  width: 48%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  border-radius: 8px;
`;

const RelatedImage = styled.Image`
  width: 100%;
  height: 100px;
  border-radius: 8px 8px 0 0;
  margin-bottom: 4px;
`;

const RelatedText = styled.Text`
  font-size: 13px;
  color: #333;
  padding: 8px;
`;

const NearbyCard = styled.View`
  width: 32%;
`;

const NearbyImage = styled.Image`
  width: 100%;
  height: 100px;
  border-radius: 8px;
  margin-bottom: 4px;
`;

const NearbyText = styled.Text`
  font-size: 12px;
  color: #333;
  padding: 4px;
`;