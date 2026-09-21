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
