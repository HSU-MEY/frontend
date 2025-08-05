// app/(tabs)/myroute.tsx
import { FavoritePlace } from '@/components/mypage/favorite-place';
import RouteCard from '@/components/mypage/route-card';
import { places } from '@/data/dummyPlaces';
import { Place } from '@/types/Place';
import { router } from 'expo-router';
import styled from 'styled-components/native';

import { favoritePlaceList } from '@/data/favoritePlace';
import { completedRoutes, inProgressRoutes, upcomingRoutes } from '@/data/routesInProgress';

const favoritePlaces = places.filter((place: Place) => favoritePlaceList.includes(place.id));

export default function MyPage() {
  return (
    <Container>
      <Header>
        <BackgroundImage source={ require('@/assets/images/header.png') } />
        <AvatarWrapper>
          <Avatar source={ require('@/assets/images/sample-profile.png') } />
          <UserName>John Doe</UserName>
          <UserEmail>johndoe@example.com</UserEmail>
          <EditButton onPress={() => router.push('/account/edit-profile')}>
            <EditText>프로필 수정</EditText>
          </EditButton>
        </AvatarWrapper>
      </Header>

      <Section>
        <SectionHeader
          onPress={() => router.push('/routehistory/ongoing')}
        >
          <SectionIcon 
            source={ require('@/assets/images/icons/route.png') }
          />
          <SectionTitle>진행중인 루트</SectionTitle>
          <SectionIcon
            source={ require('@/assets/images/icons/arrow_forward.png') }
            style={{ marginLeft: 'auto' }}
          />
        </SectionHeader>
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
        <SectionHeader
          onPress={() => router.push('/routehistory/pending')}
        >
          <SectionIcon 
            source={ require('@/assets/images/icons/route.png') }
          />
          <SectionTitle>미진행 루트</SectionTitle>
          <SectionIcon
            source={ require('@/assets/images/icons/arrow_forward.png') }
            style={{ marginLeft: 'auto' }}
          />
        </SectionHeader>
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
        <SectionHeader
          onPress={() => router.push('/routehistory/completed')}
        >
          <SectionIcon 
            source={ require('@/assets/images/icons/route.png') }
          />
          <SectionTitle>진행 완료 루트</SectionTitle>
          <SectionIcon
            source={ require('@/assets/images/icons/arrow_forward.png') }
            style={{ marginLeft: 'auto' }}
          />
        </SectionHeader>
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
        <SectionHeader
          onPress={() => router.push('/place/place-favorite')}
        >
          <SectionIcon 
            source={ require('@/assets/images/icons/like.png') }
          />
          <SectionTitle>좋아하는 장소</SectionTitle>
          <SectionIcon
            source={ require('@/assets/images/icons/arrow_forward.png') }
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

      <Section>
        <SectionHeader>
          <SectionIcon 
            source={ require('@/assets/images/icons/settings.png') }
          />
          <SectionTitle>설정</SectionTitle>
        </SectionHeader>
        <SettingItem onPress={() => router.push('/account/register')}>
          <SettingText>언어 설정</SettingText>
        </SettingItem>
        <SettingItem>
          <SettingText>로그아웃</SettingText>
        </SettingItem>
        <SettingItem>
          <SettingText>회원 탈퇴</SettingText>
        </SettingItem>
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
