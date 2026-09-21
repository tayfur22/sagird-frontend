export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  path: string;
  errors: ApiFieldError[];
}

/**
 * Thrown by the API client for any non-2xx response. Mirrors the backend's
 * uniform ApiErrorResponse shape (see GlobalExceptionHandler).
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: ApiFieldError[];

  constructor(body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiError";
    this.status = body.status;
    this.code = body.code;
    this.fieldErrors = body.errors ?? [];
  }

  /** True for network failures rather than a structured API error. */
  static isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }
}

export class NetworkError extends Error {
  constructor(cause?: unknown) {
    super("Could not reach the server. Please check your connection.");
    this.name = "NetworkError";
    this.cause = cause;
  }
}
