import { RouteRun, Segment } from '@/api/routes.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type RouteState = {
  currentRouteId?: string;
  routes: Record<string, RouteRun>;
  setCurrent: (id: string) => void;
  upsertRoute: (route: RouteRun) => void;
  getSegment: (routeId: string, index: number) => Segment | undefined;
  clearRoute: (routeId: string) => void;
};

export const useRouteRunStore = create<RouteState>()(
  persist(
    (set, get) => ({
      currentRouteId: undefined,
      routes: {},
      setCurrent: (id) => set({ currentRouteId: id }),
      upsertRoute: (route) =>
        set((s) => ({ routes: { ...s.routes, [route.id]: route } })),
      getSegment: (routeId, index) => get().routes[routeId]?.segments?.[index],
      clearRoute: (routeId) =>
        set((s) => {
          const next = { ...s.routes };
          delete next[routeId];
          return { routes: next, currentRouteId: s.currentRouteId === routeId ? undefined : s.currentRouteId };
        }),
    }),
    {
      name: 'route-run-v1',
      storage: createJSONStorage(() => AsyncStorage),
      
      partialize: (s) => ({ currentRouteId: s.currentRouteId, routes: s.routes }),
    }
  )
);