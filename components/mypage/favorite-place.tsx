import { Place } from '@/types/Place';
import styled from 'styled-components/native';

export const FavoritePlace = ({title, address, thumbnail}: Place) => {
  const shortAddress = address.split(' ').slice(0, 2).join(' ');
  return (
    <FavoritePlaceContainer>
      <PlaceThumb source={ thumbnail } />
      <PlaceInfo>
        <Title numberOfLines={1} ellipsizeMode="tail">{title}</Title>
        <Address>{shortAddress}</Address>
      </PlaceInfo>
    </FavoritePlaceContainer>
  );
}

const PlaceThumb = styled.Image`
  width: 100%;
  height: 70px;
  border-radius: 8px;
  margin-bottom: 8px;
`;

const PlaceInfo = styled.View`
  width: 100px;
`;

const FavoritePlaceContainer = styled.View`
`;

const Title = styled.Text`
  font-size: 12px;
  font-weight: bold;

`;

const Address = styled.Text`
  font-size: 9px;
  color: gray;
`;

