// app/(tabs)/myroute.tsx
import { FavoritePlace } from '@/components/mypage/favorite-place';
import RouteCard from '@/components/mypage/route-card';
import { Place } from '@/types/Place';
import { router } from 'expo-router';
import styled from 'styled-components/native';

import { completedRoutes, inProgressRoutes, upcomingRoutes } from '@/data/routesInProgress';

const favoritePlaces: Place[] = [
  { id: 1, category: '', title: '명동문화 홍대점', address: '서울특별시', thumbnail: 'https://placehold.co/100x100?text=명동문화 홍대점' },
  { id: 2, category: '', title: '케이메카 명동본점', address: '서울특별시', thumbnail: 'https://placehold.co/100x100?text=케이메카 명동본점' },
  { id: 3, category: '', title: '일상생활 부천점 시연관', address: '경기도 부천시', thumbnail: 'https://placehold.co/100x100?text=일상생활 부천점 시연관' },
  { id: 4, category: '', title: '선샤인 스튜디오', address: '서울특별시', thumbnail: 'https://placehold.co/100x100?text=선샤인 스튜디오' },
  { id: 5, category: '', title: '지노 카페', address: '서울특별시', thumbnail: 'https://placehold.co/100x100?text=지노 카페' },
  { id: 6, category: '', title: '올리브명 명동타운', address: '서울특별시', thumbnail: 'https://placehold.co/100x100?text=올리브명 명동타운' },
];

export default function MyPage() {
  return (
    <Container>
      <Header>
        <BackgroundImage source={{ uri: 'https://placehold.co/600x200?text=K-Route' }} />
        <AvatarWrapper>
          <Avatar source={{ uri: 'https://placehold.co/100x100?text=JD' }} />
          <UserName>John Doe</UserName>
          <UserEmail>johndoe@example.com</UserEmail>
          <EditButton onPress={() => router.push('/account/edit-profile')}>
            <EditText>프로필 수정</EditText>
          </EditButton>
        </AvatarWrapper>
      </Header>

      <Section>
        <SectionTitle>🔗 진행중인 루트</SectionTitle>
        <Row>
          { inProgressRoutes.map((route, index) => (
            <RouteCard
              key={index}
              thumbnail={route.thumbnail}
              title={route.title}
              date={route.date}
              progress={route.progress}
              /*onPress={() => router.push(`/route/${route.id}`)}*/
            />
          ))}
        </Row>
      </Section>

      <Section>
        <SectionTitle>⏳ 미진행 루트</SectionTitle>
        <Row>
        { upcomingRoutes.map((route, index) => (
            <RouteCard
              key={index}
              thumbnail={route.thumbnail}
              title={route.title}
              date={route.date}
              progress={route.progress}
              /*onPress={() => router.push(`/route/${route.id}`)}*/
            />
          ))}
        </Row>
      </Section>

      <Section>
        <SectionTitle>✅ 진행 완료 루트</SectionTitle>
        <Row>
        { completedRoutes.map((route, index) => (
            <RouteCard
              key={index}
              thumbnail={route.thumbnail}
              title={route.title}
              date={route.date}
              progress={route.progress}
              /*onPress={() => router.push(`/route/${route.id}`)}*/
            />
          ))}
        </Row>
      </Section>

      <Section>
        <SectionTitle>❤️ 좋아하는 장소</SectionTitle>
        <Grid>
          {favoritePlaces.map((place) => (
            <FavoritePlace
              key={place.id}
              id={place.id}
              category={place.category}
              title={place.title}
              thumbnail={place.thumbnail}
              address={place.address}
            />
          ))}
        </Grid>
      </Section>

      <Section>
        <SectionTitle>⚙️ 설정</SectionTitle>
        <SettingItem>언어 설정</SettingItem>
        <SettingItem>로그아웃</SettingItem>
        <SettingItem>회원 탈퇴</SettingItem>
      </Section>
    </Container>
  );
}

const Container = styled.ScrollView`
  flex: 1;
  background-color: white;
`;

const Header = styled.View`
  align-items: center;
`;

const BackgroundImage = styled.Image`
  width: 100%;
  height: 140px;
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

const SectionTitle = styled.Text`
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 12px;
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

const PlaceBox = styled.View`
  width: 30%;
  align-items: center;
`;

const PlaceImage = styled.Image`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
`;

const PlaceLabel = styled.Text`
  font-size: 12px;
  margin: 4px 0;
  text-align: center;
`;

const SettingItem = styled.Text`
  font-size: 15px;
  padding: 12px 0;
  border-bottom-width: 0.5px;
  border-color: #eee;
`;
