import { RouteRun as ApiRouteRun, Segment } from '@/api/routes.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Extend the RouteRun type to include progress tracking
export type RouteRun = ApiRouteRun & {
  currentSegmentIndex: number;
};

type RouteState = {
  currentRouteId?: string;
  routes: Record<string, RouteRun>;
  setCurrent: (id: string) => void;
  upsertRoute: (route: ApiRouteRun) => void; // Accepts ApiRouteRun
  getSegment: (routeId: string, index: number) => Segment | undefined;
  goToNextSegment: (routeId: string) => void;
  clearRoute: (routeId: string) => void;
};

export const useRouteRunStore = create<RouteState>()(
  persist(
    (set, get) => ({
      currentRouteId: undefined,
      routes: {},
      setCurrent: (id) => set({ currentRouteId: id }),
      upsertRoute: (apiRouteRun) =>
        set((s) => {
          const existingRoute = s.routes[apiRouteRun.id];
          const currentSegmentIndex = existingRoute?.currentSegmentIndex ?? 0;

          const route: RouteRun = {
            ...apiRouteRun,
            currentSegmentIndex,
          };
          return { routes: { ...s.routes, [route.id]: route } };
        }),
      getSegment: (routeId, index) => get().routes[routeId]?.segments?.[index],
      goToNextSegment: (routeId) =>
        set((s) => {
          const route = s.routes[routeId];
          if (!route) return s;

          const totalSegments = route.segments.length;
          const nextSegmentIndex = Math.min(route.currentSegmentIndex + 1, totalSegments);

          const updatedRoute: RouteRun = {
            ...route,
            currentSegmentIndex: nextSegmentIndex,
          };
          return { routes: { ...s.routes, [routeId]: updatedRoute } };
        }),
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