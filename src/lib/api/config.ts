/**
 * Backend API base URL.
 *
 * Production builds must get it from NEXT_PUBLIC_API_BASE_URL (inlined at
 * build time). The localhost fallback exists for local development only and
 * is never used in a production build: a missing value fails loudly instead
 * of silently pointing users at localhost.
 */
const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

function resolveApiBaseUrl(): string {
  if (configuredBaseUrl) return configuredBaseUrl.replace(/\/+$/, "");
  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set for the production build.");
  }
  return "http://localhost:8080/api/v1";
}

export const API_BASE_URL = resolveApiBaseUrl();
