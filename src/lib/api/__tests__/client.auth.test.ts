import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient, setAuthHandler } from "../client";
import { ApiError } from "../errors";

function ok(data: unknown) {
  return { ok: true, status: 200, json: async () => ({ data }) };
}

function unauthorized() {
  return {
    ok: false,
    status: 401,
    json: async () => ({
      timestamp: "2026-01-01T00:00:00Z",
      status: 401,
      code: "UNAUTHORIZED",
      message: "Authentication is required",
      path: "/x",
      errors: [],
    }),
  };
}

function authHeader(fetchMock: ReturnType<typeof vi.fn>, call: number): string | undefined {
  const init = fetchMock.mock.calls[call]?.[1] as RequestInit;
  return (init.headers as Record<string, string>)["Authorization"];
}

describe("apiClient auth integration", () => {
  let token: string | null;
  const refreshAccessToken = vi.fn<() => Promise<string | null>>();

  beforeEach(() => {
    token = "old-token";
    refreshAccessToken.mockReset();
    setAuthHandler({ getAccessToken: () => token, refreshAccessToken });
  });

  afterEach(() => {
    setAuthHandler(null);
    vi.unstubAllGlobals();
  });

  it("attaches the bearer token and sends credentials", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ id: 1 }));
    vi.stubGlobal("fetch", fetchMock);

    await apiClient.get("/auth/me");

    expect(authHeader(fetchMock, 0)).toBe("Bearer old-token");
    expect((fetchMock.mock.calls[0]?.[1] as RequestInit).credentials).toBe("include");
  });

  it("does not attach the token when skipAuth is set", async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({}));
    vi.stubGlobal("fetch", fetchMock);

    await apiClient.post("/auth/login", { email: "a" }, { skipAuth: true });

    expect(authHeader(fetchMock, 0)).toBeUndefined();
  });

  it("refreshes once on 401 and retries with the new token", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(unauthorized()).mockResolvedValueOnce(ok({ id: 1 }));
    vi.stubGlobal("fetch", fetchMock);
    refreshAccessToken.mockImplementation(async () => {
      token = "new-token";
      return token;
    });

    const result = await apiClient.get<{ id: number }>("/students/me");

    expect(result).toEqual({ id: 1 });
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(authHeader(fetchMock, 1)).toBe("Bearer new-token");
  });

  it("surfaces the 401 when refresh fails, without retrying", async () => {
    const fetchMock = vi.fn().mockResolvedValue(unauthorized());
    vi.stubGlobal("fetch", fetchMock);
    refreshAccessToken.mockResolvedValue(null);

    await expect(apiClient.get("/students/me")).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not loop if the retry is also 401", async () => {
    const fetchMock = vi.fn().mockResolvedValue(unauthorized());
    vi.stubGlobal("fetch", fetchMock);
    refreshAccessToken.mockResolvedValue("new-token");

    await expect(apiClient.get("/students/me")).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
  });

  it("never tries to refresh for skipAuth endpoints (e.g. wrong login password)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(unauthorized());
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiClient.post("/auth/login", {}, { skipAuth: true })).rejects.toBeInstanceOf(ApiError);
    expect(refreshAccessToken).not.toHaveBeenCalled();
  });
});
