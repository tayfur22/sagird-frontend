import { ApiError } from "@/lib/api/errors";
import { setAuthHandler } from "@/lib/api/client";
import type { AuthSession } from "@/types/auth";
import { authApi } from "./auth-api";
import { setSessionHint, tokenStore } from "./token-store";

let inflight: Promise<AuthSession | null> | null = null;
let expiredListener: (() => void) | null = null;

/** Called when the server definitively rejects the refresh token. */
export function onSessionExpired(listener: (() => void) | null): void {
  expiredListener = listener;
}

export function storeSession(session: AuthSession): void {
  tokenStore.set(session.accessToken);
  setSessionHint(true);
}

export function clearSession(): void {
  tokenStore.set(null);
  setSessionHint(false);
}

/**
 * Exchanges the HttpOnly refresh cookie for a new access token.
 * Single-flight: concurrent callers (StrictMode double effects, several
 * requests failing with 401 at once) share one network call - important
 * because refresh tokens are single-use.
 * Resolves null when there is no valid session; only a definitive 401
 * clears local state, so a flaky network does not log the user out.
 */
export function refreshSession(): Promise<AuthSession | null> {
  if (!inflight) {
    inflight = authApi
      .refresh()
      .then((session) => {
        storeSession(session);
        return session;
      })
      .catch((error: unknown) => {
        if (ApiError.isApiError(error) && error.status === 401) {
          clearSession();
          expiredListener?.();
        }
        return null;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

setAuthHandler({
  getAccessToken: () => tokenStore.get(),
  refreshAccessToken: async () => (await refreshSession())?.accessToken ?? null,
});
