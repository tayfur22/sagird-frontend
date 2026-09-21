/**
 * The access token lives only in memory (never localStorage/cookies), so an
 * XSS payload cannot read a long-lived credential. It is short-lived and is
 * restored after a page reload from the HttpOnly refresh cookie.
 *
 * `hasSessionHint` is just a non-secret "a session probably exists" flag used
 * to skip a pointless refresh request for anonymous visitors.
 */
const SESSION_HINT_KEY = "sagird.session";

let accessToken: string | null = null;

export const tokenStore = {
  get: (): string | null => accessToken,
  set: (token: string | null): void => {
    accessToken = token;
  },
};

export function hasSessionHint(): boolean {
  try {
    return window.localStorage.getItem(SESSION_HINT_KEY) === "1";
  } catch {
    return false;
  }
}

export function setSessionHint(value: boolean): void {
  try {
    if (value) {
      window.localStorage.setItem(SESSION_HINT_KEY, "1");
    } else {
      window.localStorage.removeItem(SESSION_HINT_KEY);
    }
  } catch {
    // Storage unavailable (private mode etc.) - the hint is optional.
  }
}
