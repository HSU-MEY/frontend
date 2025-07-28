import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';
import styled from 'styled-components/native';

type Props = {
  thumbnail: string;
  title: string;
  date: string;
  progress?: string; // ex: 88%
};

const RouteCard = ({ thumbnail, title, date, progress }: Props) => {
  return (
    <CardContainer>
      <ImageBackground
        source={ thumbnail ? thumbnail : require('@/assets/images/sample-route-default.jpg') }
        style={styleSheet.cardContainer}
        imageStyle={styleSheet.imageStyle}
        >
        <LinearGradient
          colors={['#000', 'transparent']}
          start={[0, 1]}
          end={[0, 0]}
        >
            <TextContainer>
                <Title numberOfLines={1}>{title}</Title>
                <DateText>{date}</DateText>
                {progress && <ProgressText>{progress}</ProgressText>}
            </TextContainer>
        </LinearGradient>
      </ImageBackground>
    </CardContainer>
  );
};

export default RouteCard;

const styleSheet = StyleSheet.create({
  cardContainer: {
    flex: 1,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderRadius: 8,
  },
});

const CardContainer = styled.TouchableOpacity`
  flex: 1;
  max-width: 48%;
`;

const TextContainer = styled.View`
  padding: 8px;
  bottom: 0;
  left: 0;
  right: 0;
`;

const Title = styled.Text`
  font-size: 13px;
  font-weight: bold;
  color: white;
`;

const DateText = styled.Text`
  font-size: 12px;
  color: white;
`;

const ProgressText = styled.Text`
  font-size: 12px;
  color: #2680eb;
  margin-top: 2px;
`;
