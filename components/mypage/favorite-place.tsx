import { Place } from '@/types/Place';
import styled from 'styled-components/native';

const FavoritePlace = ({title, address}: Place) => {
  return (
    <FavoritePlaceContainer>
      <Title>{ title }</Title>
      <Address>{ address }</Address>
    </FavoritePlaceContainer>
  );
}

const FavoritePlaceContainer = styled.View`
  flex: 1;
  padding: 16px;
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

