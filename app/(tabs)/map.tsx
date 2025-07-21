import { ScrollView } from 'react-native';
import styled from 'styled-components/native';

type TabProps = {
  active: boolean;
};

export default function MapScreen() {
  return (
    <ScrollView>

      <MapImage source={{ uri: 'https://placehold.co/600x400' }} />

      <TabRow>
        <Tab active={true}>K-Pop</Tab>
        <Tab active={false}>K-Drama</Tab>
        <Tab active={false}>K-Beauty</Tab>
      </TabRow>

      <PlaceList>
        <PlaceItem>
          <PlaceNumber>1</PlaceNumber>
          <PlaceInfo>
            <PlaceTitle>케이팝 프렌즈</PlaceTitle>
            <PlaceSub>음반/레코드샵, 192m</PlaceSub>
            <PlaceTime>09:30 ~ 23:00</PlaceTime>
            <PlaceAddress>서울 중구 명동8가길 17 2층</PlaceAddress>
          </PlaceInfo>
          <PlaceThumb source={{ uri: 'https://placehold.co/300x300' }} />
        </PlaceItem>

        <PlaceItem>
          <PlaceNumber>2</PlaceNumber>
          <PlaceInfo>
            <PlaceTitle>Lucky Ducky 럭키덕키</PlaceTitle>
            <PlaceSub>카페, 287m</PlaceSub>
            <PlaceTime>09:00 ~ 21:00</PlaceTime>
            <PlaceAddress>서울 중구 명동5길 16 1층</PlaceAddress>
          </PlaceInfo>
          <PlaceThumb source={{ uri: 'https://placehold.co/300x300' }} />
        </PlaceItem>

        <PlaceItem>
          <PlaceNumber>3</PlaceNumber>
          <PlaceInfo>
            <PlaceTitle>케이메카 명동본점</PlaceTitle>
            <PlaceSub>음반/레코드샵, 301m</PlaceSub>
            <PlaceTime>10:00 ~ 23:00</PlaceTime>
            <PlaceAddress>서울 중구 명동8나길 5 1~4층</PlaceAddress>
          </PlaceInfo>
          <PlaceThumb source={{ uri: 'https://placehold.co/300x300' }} />
        </PlaceItem>
      </PlaceList>
    </ScrollView>
  );
}

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 16px;
  background-color: #f8f8f8;
`;

const BackButton = styled.TouchableOpacity`
  margin-right: 12px;
`;

const HeaderTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
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

const Tab = styled.Text<TabProps>`
  padding: 8px 16px;
  border-bottom-width: 2px;
  border-color: ${(props: TabProps) => (props.active ? '#2680eb' : 'transparent')};
  color: ${(props: TabProps) => (props.active ? '#2680eb' : '#999')};
  font-weight: ${(props: TabProps) => (props.active ? 'bold' : 'normal')};
`;

/*
const Tab = styled.Text`
  padding: 8px 16px;
  border-bottom-width: 2px;
  border-color: ${(props) => (props.active ? '#2680eb' : 'transparent')};
  color: ${(props) => (props.active ? '#2680eb' : '#999')};
  font-weight: ${(props) => (props.active ? 'bold' : 'normal')};
`;
*/

const PlaceList = styled.View`
  padding: 0 16px 16px 16px;
`;

const PlaceItem = styled.View`
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
`;

const PlaceInfo = styled.View`
  flex: 1;
`;

const PlaceTitle = styled.Text`
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 2px;
`;

const PlaceSub = styled.Text`
  font-size: 13px;
  color: #666;
  margin-bottom: 2px;
`;

const PlaceTime = styled.Text`
  font-size: 12px;
  color: #666;
`;

const PlaceAddress = styled.Text`
  font-size: 12px;
  color: #999;
  margin-top: 4px;
`;

const PlaceThumb = styled.Image`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  margin-left: 10px;
`;
