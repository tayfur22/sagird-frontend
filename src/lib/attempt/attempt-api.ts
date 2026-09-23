import { apiClient } from "@/lib/api/client";
import type { ExamAttemptResponse } from "@/types/attempt";
import type { AttemptAnswerResponse, SaveAnswerRequest, StudentQuestion } from "@/types/attempt-question";

/**
 * Typed wrappers over the Phase 7A student exam-attempt endpoints (base URL
 * already contains /api/v1). Mirrors exam-api.ts's shape. The student id
 * never appears here - the backend always derives it from the auth token.
 */
export const attemptApi = {
  /** POST /exams/{examId}/attempts - starts a new attempt. Rejects if one is already active. */
  start: (examId: string, signal?: AbortSignal) =>
    apiClient.post<ExamAttemptResponse>(`/exams/${examId}/attempts`, undefined, { signal }),

  /** GET /exams/{examId}/attempts/current - never creates an attempt. Resolves to null if none is active. */
  getCurrent: (examId: string, signal?: AbortSignal) =>
    apiClient.get<ExamAttemptResponse | null>(`/exams/${examId}/attempts/current`, { signal }),

  /** GET /exams/attempts/{attemptId} - the student's own attempt only (404 for any other student's). */
  getById: (attemptId: string, signal?: AbortSignal) =>
    apiClient.get<ExamAttemptResponse>(`/exams/attempts/${attemptId}`, { signal }),

  /** POST /exams/attempts/{attemptId}/submit - IN_PROGRESS -> SUBMITTED. Rejects if expired/already submitted. */
  submit: (attemptId: string, signal?: AbortSignal) =>
    apiClient.post<ExamAttemptResponse>(`/exams/attempts/${attemptId}/submit`, undefined, { signal }),

  /** GET /exams/attempts/{attemptId}/questions - Phase 8A. Exam's question order, with any saved answers already merged in. */
  getQuestions: (attemptId: string, signal?: AbortSignal) =>
    apiClient.get<StudentQuestion[]>(`/exams/attempts/${attemptId}/questions`, { signal }),

  /** PUT /exams/attempts/{attemptId}/answers/{questionId} - Phase 8A autosave. Requires IN_PROGRESS and not lapsed. */
  saveAnswer: (attemptId: string, questionId: string, request: SaveAnswerRequest, signal?: AbortSignal) =>
    apiClient.put<AttemptAnswerResponse>(`/exams/attempts/${attemptId}/answers/${questionId}`, request, { signal }),
};
