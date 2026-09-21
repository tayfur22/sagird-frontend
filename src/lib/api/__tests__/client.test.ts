import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../client";
import { ApiError } from "../errors";

describe("apiClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("unwraps the { data } envelope on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: { id: "1" } }),
      })
    );

    const result = await apiClient.get<{ id: string }>("/example");
    expect(result).toEqual({ id: "1" });
  });

  it("throws an ApiError with the backend's error shape on failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({
          timestamp: "2026-01-01T00:00:00Z",
          status: 404,
          code: "RESOURCE_NOT_FOUND",
          message: "Not found",
          path: "/example",
          errors: [],
        }),
      })
    );

    await expect(apiClient.get("/example")).rejects.toBeInstanceOf(ApiError);
  });
});
