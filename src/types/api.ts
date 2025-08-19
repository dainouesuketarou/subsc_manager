// API関連の型定義

export interface ApiRequest<T = unknown> {
  data?: T;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
}

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

export interface ApiInterceptor {
  request?: (config: ApiRequest) => ApiRequest;
  response?: (response: unknown) => unknown;
  error?: (error: ApiError) => ApiError;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiEndpoint {
  method: HttpMethod;
  path: string;
  requiresAuth?: boolean;
  timeout?: number;
}
