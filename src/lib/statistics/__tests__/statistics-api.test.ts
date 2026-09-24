import { afterEach, describe, expect, it, vi } from "vitest";
import { statisticsApi } from "../statistics-api";

function stubFetch() {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ data: {} }) });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("statisticsApi", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests cities with backend 0-based paging and never exceeds size 100", async () => {
    const fetchMock = stubFetch();
    await statisticsApi.getCities(2, 5000);
    expect(String(fetchMock.mock.calls[0][0])).toContain("/statistics/cities?page=2&size=100");
  });

  it("sends no Authorization header (public endpoints)", async () => {
    const fetchMock = stubFetch();
    await statisticsApi.getWeekly();
    const init = fetchMock.mock.calls[0][1] as { headers: Record<string, string> };
    expect(init.headers.Authorization).toBeUndefined();
  });

  it("encodes the exam id in the path", async () => {
    const fetchMock = stubFetch();
    await statisticsApi.getExam("abc/def");
    expect(String(fetchMock.mock.calls[0][0])).toContain("/statistics/exams/abc%2Fdef");
  });
});
