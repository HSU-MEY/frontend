import React from 'react';
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
      <Thumbnail source={{ uri: thumbnail }} />
      <Title numberOfLines={2}>{title}</Title>
      <DateText>{date}</DateText>
      {progress && <ProgressText>{progress}</ProgressText>}
    </CardContainer>
  );
};

export default RouteCard;

const CardContainer = styled.View`
  flex: 1;
  background: #f7f7f7;
  padding: 8px;
  border-radius: 8px;
  max-width: 48%;
`;

const Thumbnail = styled.Image`
  width: 100%;
  height: 80px;
  border-radius: 6px;
  margin-bottom: 6px;
`;

const Title = styled.Text`
  font-size: 13px;
  font-weight: bold;
`;

const DateText = styled.Text`
  font-size: 12px;
  color: #888;
`;

const ProgressText = styled.Text`
  font-size: 12px;
  color: #2680eb;
  margin-top: 2px;
`;
