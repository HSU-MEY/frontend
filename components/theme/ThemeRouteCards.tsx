import React from 'react';
import { View } from 'react-native';
import ThemeRouteCard from './ThemeRouteCard';

export type ThemeCategory = 'K-Pop' | 'K-Drama' | 'K-Beauty' | 'K-Fashion' | 'K-Food';


interface ThemeRouteCardsProps {
  category: ThemeCategory;
  limit?: number;
}

const ROUTE_DATA: Record<'K-Pop' | 'K-Drama' | 'K-Beauty' | 'K-Fashion' | 'K-Food', {
  image: any;
  title: string;
  location: string;
  description: string;
}[]> = {
  'K-Pop': [
    {
      image: require('../../assets/images/sample-stage.png'),
      title: 'K-POP 루트: Idol',
      location: '서울 홍대',
      description: '아이돌의 데뷔를 준비한 그 건물, 팬들이 줄을 서며 기다린 바로 그 골목. 이 루트에서는 SM, JYP, HYBE 같은 대형 기획사 본사를 직접 방문하고, 팬들 사이에서 ‘성지’라 불리는 장소들을 따라가며 K-POP의 중심을 온몸으로 느낄 수 있습니다.',
    },
    {
      image: require('../../assets/images/sample-stage2.png'),
      title: 'K-POP 루트: Stage',
      location: '서울 강남',
      description: '화려한 무대 위 아이돌을 직접 만나고 싶은 당신을 위한 루트. 음악방송 방청에 도전하고, 홍대나 강남 거리에서 펼쳐지는 아이돌 라이브 공연과 버스킹 무대를 함께 즐기며 K-POP 무대의 열기를 가까이서 체험할 수 있습니다.',
    },
  ],
  'K-Drama': [{
    image: require('../../assets/images/sample-beauty.png'),
    title: 'K-DRAMA 루트: Makeup',
    location: '서울 홍대',
    description: '드라마를 좋아한다면 여기로',
  },
  {
    image: require('../../assets/images/sample-beauty2.png'),
    title: 'K-DRAMA 루트: Stage',
    location: '서울 강남',
    description: '서울에서 찍은 드라마 장소들',
  },],
  'K-Beauty': [],
  'K-Fashion': [],
  'K-Food': [],
};


export default function ThemeRouteCards({ category, limit = Infinity }: ThemeRouteCardsProps) {
  const routes = ROUTE_DATA[category]?.slice(0, limit) || [];

  return (
    <View>
      {routes.map((route, index) => (
        <ThemeRouteCard
          key={index}
          image={route.image}
          title={route.title}
          location={route.location}
          description={route.description}
        />
      ))}
    </View>
  );
}
