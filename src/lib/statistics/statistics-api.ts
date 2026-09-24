import { apiClient } from "@/lib/api/client";
import type { PageResponse } from "@/types/api";
import type { CityStatistics, ExamStatistics, StatisticsOverview, WeeklyStatistics } from "@/types/statistics";

/**
 * Typed wrappers over the public Phase 16A statistics endpoints (base URL
 * already contains /api/v1). They are aggregate-only and public on the
 * backend, so no bearer token is attached (`skipAuth`). City ordering and
 * paging (0-based `page`, `size` <= 100) are entirely backend-defined.
 */
export const MAX_STATISTICS_PAGE_SIZE = 100;

export const statisticsApi = {
  /** GET /statistics/overview */
  getOverview: (signal?: AbortSignal) =>
    apiClient.get<StatisticsOverview>("/statistics/overview", { signal, skipAuth: true }),

  /** GET /statistics/cities - one backend-ordered page of city buckets. */
  getCities: (page: number, size: number, signal?: AbortSignal) => {
    const safePage = Math.max(0, Math.floor(page));
    const safeSize = Math.min(MAX_STATISTICS_PAGE_SIZE, Math.max(1, Math.floor(size)));
    return apiClient.get<PageResponse<CityStatistics>>(`/statistics/cities?page=${safePage}&size=${safeSize}`, {
      signal,
      skipAuth: true,
    });
  },

  /** GET /statistics/weekly */
  getWeekly: (signal?: AbortSignal) =>
    apiClient.get<WeeklyStatistics>("/statistics/weekly", { signal, skipAuth: true }),

  /** GET /statistics/exams/{examId} - 404 for any exam that is not publicly visible. */
  getExam: (examId: string, signal?: AbortSignal) =>
    apiClient.get<ExamStatistics>(`/statistics/exams/${encodeURIComponent(examId)}`, { signal, skipAuth: true }),
};
