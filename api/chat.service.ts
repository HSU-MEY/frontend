import { ApiEnvelope, apiPost } from "./http";

// 컨텍스트 타입
export interface ChatContext {
  theme?: string;
  region?: string;
  budget?: number;
  preferences?: string;
  durationMinutes?: number;
  days?: number;
  conversationState?: string;
  lastBotQuestion?: string;
  sessionId?: string;
  conversationStartTime?: number;
  userLanguage?: 'ko' | 'en' | 'ja' | 'zh';
}

// 챗 쿼리 요청 타입
export interface ChatQueryRequest {
  query: string;
  context: ChatContext;
  language: 'ko' | 'en' | 'ja' | 'zh';
}

// 루트 추천 타입
export interface RouteRecommendation {
  routeId: number;
  endpoint: string;
  title: string;
  description: string;
  estimatedCost: number;
  durationMinutes: number;
}

// 기존 루트 타입
export interface ExistingRoute {
  routeId: number;
  title: string;
  description: string;
  estimatedCost: number;
  durationMinutes: number;
  themes: string[];
}

// 장소 정보 타입
export interface PlaceInfo {
  placeId: number;
  name: string;
  description: string;
  address: string;
  themes: string[];
  costInfo: string;
}

// 챗 쿼리 응답 결과 타입
export interface ChatQueryResult {
  responseType: 'QUESTION' | 'ROUTE_RECOMMENDATION' | 'EXISTING_ROUTES' | 'PLACES_INFO';
  message: string;
  routeRecommendation?: RouteRecommendation;
  existingRoutes?: ExistingRoute[];
  places?: PlaceInfo[];
  context: ChatContext;
}

// ===== API 함수 =====

/**
 * 챗봇에게 쿼리를 보냅니다.
 * @param request ChatQueryRequest
 * @returns ApiEnvelope<ChatQueryResult>
 */
export async function postChatQuery(
  request: ChatQueryRequest
): Promise<ApiEnvelope<ChatQueryResult>> {
  return apiPost<ApiEnvelope<ChatQueryResult>>('/chat/query', request, 'postChatQuery');
}
