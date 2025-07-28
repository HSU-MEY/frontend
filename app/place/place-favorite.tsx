import Header from '@/components/common/Header';
import { places } from '@/data/dummyPlaces';
import { favoritePlaceList } from '@/data/favoritePlace';
import { Place } from '@/types/Place';
import { router } from 'expo-router';
import { FlatList } from 'react-native';
import styled from 'styled-components/native';

export default function FavoritePlacePage() {
  const favoritePlaces = places.filter((place) =>
    favoritePlaceList.includes(place.id)
  );

  const renderItem = ({ item }: { item: Place }) => {
    const shortAddress = item.address
      ? item.address.split(' ').slice(0, 2).join(' ')
      : '';

    return (
      <PlaceItem
        onPress={() => router.push(`/place/place-detail`)}
      >
        <PlaceThumbnail source={item.thumbnail} resizeMode="cover" />
        <PlaceTitle numberOfLines={1} ellipsizeMode="tail">
          {item.title}
        </PlaceTitle>
        <PlaceAddress numberOfLines={1} ellipsizeMode="tail">
          {shortAddress}
        </PlaceAddress>
      </PlaceItem>
    );
  };

  return (
    <Container>
      <Header title="즐겨찾기" />
      {favoritePlaces.length === 0 ? (
        <EmptyContent>
          <EmptyText>좋아요 표시한 장소가 없습니다.</EmptyText>
        </EmptyContent>
      ) : (
        <FlatList
          data={favoritePlaces}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={{ padding: 16, gap: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Container>
  );
}


const Container = styled.View`
  flex: 1;
  background-color: #fff;
`;

const EmptyContent = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const EmptyText = styled.Text`
  font-size: 16px;
  color: #666;
`;

const PlaceItem = styled.TouchableOpacity`
  flex: 0.48; /* 2열일 때 적당한 비율 */
  margin-bottom: 16px;
`;

const PlaceThumbnail = styled.Image`
  width: 100%;
  height: 120px;
  border-radius: 8px;
`;

const PlaceTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  margin-top: 8px;
  overflow: hidden;
`;

const PlaceAddress = styled.Text`
  font-size: 13px;
  color: #666;
  margin-top: 4px;
  overflow: hidden;
`;
