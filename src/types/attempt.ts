/** Mirrors az.sagird.modules.attempt.entity.AttemptStatus. */
export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "EXPIRED" | "CANCELLED";

/**
 * Mirrors az.sagird.modules.attempt.dto.ExamAttemptResponse. `submittedAt`
 * is null until the attempt is SUBMITTED. `serverTime` is the server's own
 * clock at the moment of the response - use it (not the browser clock) as
 * the reference point for any remaining-time calculation.
 */
export interface ExamAttemptResponse {
  attemptId: string;
  examId: string;
  status: AttemptStatus;
  startedAt: string;
  expiresAt: string;
  submittedAt: string | null;
  serverTime: string;
}
