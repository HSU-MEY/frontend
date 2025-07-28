import type { ThemeCategory } from '@/components/theme/ThemeRouteCards';
import ThemeTabs from '@/components/theme/ThemeTabs';
import { router } from 'expo-router';
import { useState } from 'react';
import styled from 'styled-components/native';

import { places } from '@/data/dummyPlaces';


export default function MapScreen() {
  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory>('K-Pop');

  return (
    <Container>
      <MapImage source={ require('@/assets/images/sample-map.png') } />

      <ThemeTabs 
        selected={selectedCategory} 
        onSelect={setSelectedCategory} 
      />

      <PlaceList>
        {places
        .filter((place => place.category === selectedCategory))
        .map((place) => (
          <PlaceItem key={place.id} onPress={() => router.push('/place/place-detail')}>
            <PlaceInfo>
              <PlaceHeader>
                <PlaceNumber>{place.id}</PlaceNumber>
                <PlaceTitle>{place.title}</PlaceTitle>
              </PlaceHeader>
              <PlaceSub>{place.type}, {place.distance}</PlaceSub>
              <PlaceTime>{place.time}</PlaceTime>
              <PlaceAddress>{place.address}</PlaceAddress>
            </PlaceInfo>
            <PlaceThumb source={ place.thumbnail } />
          </PlaceItem>
        ))}
      </PlaceList>
    </Container>
  );
}

const Container = styled.ScrollView`
  flex: 1;
  background-color: white;
`;


const MapImage = styled.Image`
  width: 100%;
  height: 220px;
`;

const TabRow = styled.View`
  flex-direction: row;
  justify-content: space-around;
  margin-vertical: 12px;
`;

const PlaceList = styled.View`
  padding: 0 16px 16px 16px;
`;

const PlaceItem = styled.TouchableOpacity`
  flex-direction: row;
  border: 1px solid #dceeff;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  align-items: center;
  background-color: #f9fbff;
`;

const PlaceNumber = styled.Text`
  width: 24px;
  height: 24px;
  background-color: #2680eb;
  color: white;
  text-align: center;
  border-radius: 12px;
  margin-right: 10px;
  font-weight: bold;
  line-height: 24px;
`;

const PlaceInfo = styled.View`
  flex: 1;
`;

const PlaceHeader = styled.View`
  flex-direction: row;
  margin-bottom: 4px;
`;

const PlaceTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #0080FF;
`;

const PlaceSub = styled.Text`
  font-size: 13px;
  color: #9d9d9d;
  margin-bottom: 2px;
`;

const PlaceTime = styled.Text`
  font-size: 12px;
  background-color: #f0f8ff;
  color: #0296e9;
  padding: 2px 6px;
  width: 50%;
  border-radius: 4px;
`;

const PlaceAddress = styled.Text`
  font-size: 12px;
  color: #333;
  margin-top: 4px;
`;

const PlaceThumb = styled.Image`
  height: 80px;
  width: 80px;
  border-radius: 8px;
  margin-left: 10px;
`;
