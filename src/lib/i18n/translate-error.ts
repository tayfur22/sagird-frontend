import { ApiError, NetworkError } from "@/lib/api/errors";
import { t } from "./t";

const validationMessages = t.validation as Record<string, string>;
const errorMessages = t.errors as Record<string, string>;

/** Translates a backend/client validation code (e.g. "PASSWORD_TOO_SHORT"). */
export function validationMessage(code: string): string {
  return validationMessages[code] ?? t.validation.INVALID;
}

/** User-facing (Azerbaijani) message for any error thrown by the API layer. */
export function apiErrorMessage(error: unknown): string {
  if (error instanceof NetworkError) {
    return t.errors.NETWORK;
  }
  if (ApiError.isApiError(error)) {
    return errorMessages[error.code] ?? t.errors.GENERIC;
  }
  return t.errors.GENERIC;
}

/** First translated message per field from a backend VALIDATION_ERROR. */
export function fieldErrorsFrom(error: unknown): Record<string, string> {
  const result: Record<string, string> = {};
  if (ApiError.isApiError(error)) {
    for (const fieldError of error.fieldErrors) {
      if (!(fieldError.field in result)) {
        result[fieldError.field] = validationMessage(fieldError.message);
      }
    }
  }
  return result;
}
