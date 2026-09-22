export interface ApiEnvelope<T> {
  data: T;
}

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

/** Mirrors az.sagird.common.api.PageResponse<T>. Used by paginated endpoints (e.g. payment history). */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}