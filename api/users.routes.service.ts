// src/api/users.service.ts
import { apiDelete, apiGet, apiPost, apiPut } from './http';
import { ROUTES } from './routes';


// ===== 공통 타입 =====
export type ApiEnvelope<T> = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
};

export type OpeningHours = Record<string, string>

// Routes 타입
export type SavedRoutes = {
  savedRoutes: Route[];
};

export type Route = {
  savedRouteId: number;
  routeId: number;
  title: string;
  description: string;
  imageUrl: string;
  totalDurationMinutes: number;
  preferredStartDate: string;
  preferredStartTime: string;
  isPastDate: boolean;
  daysUntilTrip: number;
  savedAt: string; // 저장된 날짜 (ISO 8601)
}

export type SavedUserRoute = {
  userRouteId: number;
  status: string; // "NOT_STARTED", "ON_GOING", "COMPLETED"
}

// ===== 엔드포인트 =====
// 유저가 저장한 Routes 조회
export async function getUserRoutes(
  status?: string
): Promise<ApiEnvelope<SavedRoutes>> {
  const query = status ? `?status=${encodeURIComponent(status)}` : '?status=ALL';
  return apiGet<ApiEnvelope<SavedRoutes>>(
    ROUTES.users.routes + query,
    'getUserRoutes'
  );
}

export async function editUserRoutes(
  id: number,
  preferredStartDate: Date,
  preferredStartTime: string
): Promise<ApiEnvelope<null>> {
  return apiPut<ApiEnvelope<null>>(
    `${ROUTES.users.routes}/${id}`,
    {
      preferredStartDate: preferredStartDate.toISOString().split('T')[0], // "YYYY-MM-DD"
      preferredStartTime,
    },
    'editUserRoutes'
  );
}

export async function deleteUserRoutes(
  id: number
): Promise<ApiEnvelope<null>> {
  return apiDelete<ApiEnvelope<null>>(
    `${ROUTES.users.routes}/${id}`,
    'deleteUserRoutes'
  );
}

export async function saveUserRoutes(
  routeId: number,
  preferredStartDate: Date,
  preferredStartTime: string
): Promise<ApiEnvelope<{ savedRouteId: number }>> {
  return apiPost<ApiEnvelope<{ savedRouteId: number }>>(
    ROUTES.users.routes,
    {
      routeId,
      preferredStartDate: preferredStartDate.toISOString().split('T')[0], // "YYYY-MM-DD"
      preferredStartTime,
    },
    'saveUserRoutes'
  );
}


export async function changeUserRouteStatus(
  id: number,
  status: 'NOT_STARTED' | 'ON_GOING' | 'COMPLETED'
): Promise<ApiEnvelope<null>> {
  return apiPut<ApiEnvelope<null>>(
    `${ROUTES.users.routes}/${id}/${status}`,
    undefined,
    'changeUserRouteStatus'
  );
}

export async function getUserRoutesIdByRouteId(
  routeId: number
): Promise<ApiEnvelope<SavedUserRoute>> {
  return apiGet<ApiEnvelope<SavedUserRoute>>(
    `${ROUTES.users.routes}/${routeId}`,
    'getUserRoutesIdByRouteId'
  );
}