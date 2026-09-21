import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, NetworkError } from "@/lib/api/errors";

vi.mock("../auth-api", () => ({ authApi: { refresh: vi.fn() } }));

import { authApi } from "../auth-api";
import { clearSession, onSessionExpired, refreshSession } from "../session";
import { hasSessionHint, tokenStore } from "../token-store";

const session = {
  accessToken: "access-1",
  tokenType: "Bearer",
  expiresIn: 900,
  user: {
    id: "u1",
    email: "ali@example.com",
    firstName: "Ali",
    lastName: "Aliyev",
    role: "STUDENT" as const,
    phone: null,
    grade: null,
    school: null,
    city: null,
    createdAt: "2026-01-01T00:00:00Z",
  },
};

const refresh = vi.mocked(authApi.refresh);

function apiError(status: number) {
  return new ApiError({
    timestamp: "2026-01-01T00:00:00Z",
    status,
    code: "INVALID_REFRESH_TOKEN",
    message: "x",
    path: "/auth/refresh",
    errors: [],
  });
}

describe("refreshSession", () => {
  beforeEach(() => {
    refresh.mockReset();
    clearSession();
  });

  afterEach(() => {
    onSessionExpired(null);
  });

  it("stores the new access token in memory and remembers the session", async () => {
    refresh.mockResolvedValue(session);

    const result = await refreshSession();

    expect(result).toEqual(session);
    expect(tokenStore.get()).toBe("access-1");
    expect(hasSessionHint()).toBe(true);
  });

  it("is single-flight: concurrent callers share one request", async () => {
    refresh.mockResolvedValue(session);

    await Promise.all([refreshSession(), refreshSession(), refreshSession()]);

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("clears the session and notifies on a definitive 401", async () => {
    const expired = vi.fn();
    onSessionExpired(expired);
    tokenStore.set("stale");
    refresh.mockRejectedValue(apiError(401));

    expect(await refreshSession()).toBeNull();
    expect(tokenStore.get()).toBeNull();
    expect(hasSessionHint()).toBe(false);
    expect(expired).toHaveBeenCalledTimes(1);
  });

  it("keeps local state on network failures", async () => {
    const expired = vi.fn();
    onSessionExpired(expired);
    refresh.mockResolvedValueOnce(session);
    await refreshSession();
    refresh.mockRejectedValue(new NetworkError());

    expect(await refreshSession()).toBeNull();
    expect(hasSessionHint()).toBe(true);
    expect(expired).not.toHaveBeenCalled();
  });
});
