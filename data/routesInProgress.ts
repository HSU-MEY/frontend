import { RouteInProgressData } from "@/types/RouteInProgress";

export const inProgressRoutes: RouteInProgressData[] = [
  {
    id: 1,
    thumbnail: require('@/assets/images/sample-route-bts.png'),
    title: 'K-Pop 투어: BTS',
    date: '25.07.05 ~',
    progress: '50%',
  },
  {
    id: 2,
    thumbnail: require('@/assets/images/sample-route-beautyinseoul.png'),
    title: 'K-Beauty in Seoul: 뷰티와 패션의 중심지 탐방',
    date: '25.07.10 ~',
    progress: '10%',
  },
];

export const upcomingRoutes: RouteInProgressData[] = [
  {
    id: 3,
    thumbnail: require('@/assets/images/sample-route-drama.png'),
    title: '한국 드라마 팬을 위한 가이드',
    date: '25.07.20 (예정)',
  },
];

export const completedRoutes: RouteInProgressData[] = [
  {
    id: 4,
    thumbnail: require('@/assets/images/sample-route-busan1.png'),
    title: 'Delicious in Busan',
    date: '25.01.23 ~ 25.01.24',
    progress: '100%',
  },
  {
    id: 5,
    thumbnail: require('@/assets/images/sample-route-busan2.png'),
    title: '문화와 패션 in 부산',
    date: '25.01.23 ~ 25.01.24',
    progress: '100%',
  },
];
