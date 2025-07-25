import { RouteInProgressData } from "@/types/RouteInProgress";

export const inProgressRoutes: RouteInProgressData[] = [
  {
    id: 1,
    thumbnail: 'https://placehold.co/160x120?text=Drama',
    title: '드라마 촬영지 투어: 사랑의 불시착',
    date: '25.07.05 ~',
    progress: '50%',
  },
  {
    id: 2,
    thumbnail: 'https://placehold.co/160x120?text=KPop',
    title: 'K-POP 스타의 거리 투어',
    date: '25.07.10 ~',
    progress: '10%',
  },
];

export const upcomingRoutes: RouteInProgressData[] = [
  {
    id: 3,
    thumbnail: 'https://placehold.co/160x100?text=Food',
    title: '서울의 맛집 탐방',
    date: '25.07.20 (예정)',
  },
];

export const completedRoutes: RouteInProgressData[] = [
  {
    id: 4,
    thumbnail: 'https://placehold.co/160x100?text=Busan1',
    title: '부산의 숨겨진 명소들',
    date: '25.01.23 ~ 25.01.24',
    progress: '100%',
  },
  {
    id: 5,
    thumbnail: 'https://placehold.co/160x100?text=Busan2',
    title: '문화와 패션 in 부산',
    date: '25.01.23 ~ 25.01.24',
    progress: '100%',
  },
];
