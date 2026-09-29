import { afterEach, describe, expect, it, vi } from "vitest";
import { attemptApi } from "../attempt-api";

describe("attemptApi.listMine", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests /exams/attempts/my with 0-based paging", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ data: { content: [] } }) });
    vi.stubGlobal("fetch", fetchMock);

    await attemptApi.listMine(2, 5);

    expect(String(fetchMock.mock.calls[0][0])).toContain("/exams/attempts/my?page=2&size=5");
  });
});
