import { apiClient } from "@/lib/api/client";
import type { PageResponse } from "@/types/api";
import type { LeaderboardEntry } from "@/types/leaderboard";

/**
 * Typed wrappers over the Phase 15A leaderboard endpoints (base URL
 * already contains /api/v1). Mirrors exam-api.ts/attempt-api.ts's shape.
 * The student id never appears here - `/me` always uses the authenticated
 * principal on the backend, never a request parameter (IDOR prevention).
 */
export const leaderboardApi = {
  /** GET /exams/{examId}/leaderboard - the public, paginated ranking for one exam. */
  getExamLeaderboard: (examId: string, page: number, size: number, signal?: AbortSignal) =>
    apiClient.get<PageResponse<LeaderboardEntry>>(
      `/exams/${examId}/leaderboard?page=${page}&size=${size}`,
      { signal }
    ),

  /**
   * GET /exams/{examId}/leaderboard/me - the authenticated student's own
   * position for one exam. Rejects with LEADERBOARD_POSITION_NOT_AVAILABLE
   * (404) if the student has no qualifying submitted attempt - callers
   * must treat that as a "not ranked yet" state, not a generic error.
   */
  getMyExamPosition: (examId: string, signal?: AbortSignal) =>
    apiClient.get<LeaderboardEntry>(`/exams/${examId}/leaderboard/me`, { signal }),

  /** GET /leaderboard/weekly - the currently active WEEKLY-exam ranking. No personal-position endpoint exists for this one. */
  getWeekly: (page: number, size: number, signal?: AbortSignal) =>
    apiClient.get<PageResponse<LeaderboardEntry>>(`/leaderboard/weekly?page=${page}&size=${size}`, { signal }),
};
