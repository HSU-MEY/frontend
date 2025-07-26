import { Place } from '@/types/Place';
import styled from 'styled-components/native';

export const FavoritePlace = ({title, address, thumbnail}: Place) => {
  return (
    <FavoritePlaceContainer>
      <PlaceThumb source={{ uri: thumbnail }} />
      <PlaceInfo>
        <Title>{title}</Title>
        <Address>{address}</Address>
      </PlaceInfo>
    </FavoritePlaceContainer>
  );
}

const PlaceThumb = styled.Image`
  width: 100px;
  height: 100px;
  border-radius: 8px;
`;

const PlaceInfo = styled.View`
  width: 100px;
`;

const FavoritePlaceContainer = styled.View`
`;

const Title = styled.Text`
  font-size: 16px;
  font-weight: bold;
`;

const Address = styled.Text`
  font-size: 14px;
  color: gray;
  margin-top: 4px;
`;

