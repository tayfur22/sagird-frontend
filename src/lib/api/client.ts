import { API_BASE_URL } from "./config";
import { ApiError, NetworkError, type ApiErrorBody } from "./errors";

export interface ApiEnvelope<T> {
  data: T;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  /** Explicit bearer token; bypasses the registered auth handler. */
  authToken?: string;
  /**
   * Public/credential endpoints (login, register, refresh, logout): never
   * attach the access token and never try to refresh on 401.
   */
  skipAuth?: boolean;
}

/**
 * Hooks the auth module registers so this client stays free of auth state:
 * it supplies the in-memory access token and can renew it once when the
 * server answers 401 for an expired token.
 */
export interface AuthHandler {
  getAccessToken: () => string | null;
  /** Resolves with a fresh access token, or null if the session is gone. */
  refreshAccessToken: () => Promise<string | null>;
}

let authHandler: AuthHandler | null = null;

export function setAuthHandler(handler: AuthHandler | null): void {
  authHandler = handler;
}

/**
 * Centralized fetch wrapper. All components/services must go through this
 * instead of calling fetch/axios directly, so base URL, headers, JSON
 * handling and error normalization stay in one place.
 */
async function request<T>(path: string, options: RequestOptions = {}, isRetry = false): Promise<T> {
  const { method = "GET", body, signal, authToken: explicitToken, skipAuth } = options;
  const authToken = skipAuth ? undefined : (explicitToken ?? authHandler?.getAccessToken() ?? undefined);

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
      // Needed so the HttpOnly refresh cookie is sent to / accepted from the API origin.
      credentials: "include",
    });
  } catch (cause) {
    throw new NetworkError(cause);
  }

  if (response.status === 401 && !skipAuth && !explicitToken && !isRetry && authHandler) {
    const freshToken = await authHandler.refreshAccessToken();
    if (freshToken) {
      return request<T>(path, options, true);
    }
  }

  if (!response.ok) {
    let errorBody: ApiErrorBody | null = null;
    try {
      errorBody = (await response.json()) as ApiErrorBody;
    } catch {
      // Response had no JSON body (e.g. gateway-level failure).
    }
    if (errorBody) {
      throw new ApiError(errorBody);
    }
    throw new ApiError({
      timestamp: new Date().toISOString(),
      status: response.status,
      code: "UNKNOWN_ERROR",
      message: response.statusText || "Request failed",
      path,
      errors: [],
    });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const envelope = (await response.json()) as ApiEnvelope<T>;
  return envelope.data;
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
