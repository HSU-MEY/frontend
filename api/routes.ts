// /api/routes.ts
// 모든 API 엔드포인트 경로를 한 곳에서 관리

export const ROUTES = {
    auth: {
        login: '/auth/login',
        signup: '/auth/signup',
        refresh: '/auth/refresh',
    },
    users: {
        profile: '/users/profiles',
        routes: '/users/routes',
    },
    places: {
        popular: '/places/popular',
        search: '/places/search',
        byId: '/places',
        theme: '/places/theme',
    },
} as const;
