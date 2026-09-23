/** Mirrors az.sagird.modules.attempt.entity.AttemptStatus. */
export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "EXPIRED" | "CANCELLED";

/**
 * Mirrors az.sagird.modules.attempt.dto.ExamAttemptResponse. `submittedAt`
 * is null until the attempt is SUBMITTED. `serverTime` is the server's own
 * clock at the moment of the response - use it (not the browser clock) as
 * the reference point for any remaining-time calculation.
 *
 * `score`/`maxScore`/`percentage`/`passed` (Phase 10A) are the official,
 * server-computed result - see `ScoringService` on the backend. All four
 * are `null` until the attempt is SUBMITTED. `passed` stays `null` even
 * after submission whenever no pass/fail threshold exists in the domain
 * yet; render that as a neutral/pending state, never as pass or fail, and
 * never derive it from `percentage` on the client.
 */
export interface ExamAttemptResponse {
  attemptId: string;
  examId: string;
  status: AttemptStatus;
  startedAt: string;
  expiresAt: string;
  submittedAt: string | null;
  serverTime: string;
  score: number | null;
  maxScore: number | null;
  percentage: number | null;
  passed: boolean | null;
}
