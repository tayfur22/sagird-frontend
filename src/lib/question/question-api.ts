import { apiClient } from "@/lib/api/client";
import type { PageResponse } from "@/types/api";
import type {
  CreateQuestionRequest,
  ExamQuestionResponse,
  QuestionListFilters,
  QuestionResponse,
  ReorderExamQuestionsRequest,
  UpdateQuestionRequest,
} from "@/types/question";

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

/**
 * Typed wrappers over the Phase 6A admin question-bank endpoints (base URL
 * already contains /api/v1). Mirrors exam-api.ts's shape.
 */
export const adminQuestionApi = {
  create: (request: CreateQuestionRequest, signal?: AbortSignal) =>
    apiClient.post<QuestionResponse>("/admin/questions", request, { signal }),
  getAll: (page: number, size: number, filters: QuestionListFilters = {}, signal?: AbortSignal) =>
    apiClient.get<PageResponse<QuestionResponse>>(
      `/admin/questions${buildQuery({ page, size, type: filters.type, active: filters.active, search: filters.search })}`,
      { signal }
    ),
  getById: (id: string, signal?: AbortSignal) =>
    apiClient.get<QuestionResponse>(`/admin/questions/${id}`, { signal }),
  update: (id: string, request: UpdateQuestionRequest, signal?: AbortSignal) =>
    apiClient.put<QuestionResponse>(`/admin/questions/${id}`, request, { signal }),
  activate: (id: string, signal?: AbortSignal) =>
    apiClient.post<QuestionResponse>(`/admin/questions/${id}/activate`, undefined, { signal }),
  deactivate: (id: string, signal?: AbortSignal) =>
    apiClient.post<QuestionResponse>(`/admin/questions/${id}/deactivate`, undefined, { signal }),
};

/**
 * Typed wrappers over the Phase 6A admin exam<->question association
 * endpoints. Structural changes (add/remove/reorder) are only accepted by
 * the backend while the exam is DRAFT.
 */
export const adminExamQuestionApi = {
  getAll: (examId: string, signal?: AbortSignal) =>
    apiClient.get<ExamQuestionResponse[]>(`/admin/exams/${examId}/questions`, { signal }),
  add: (examId: string, questionId: string, signal?: AbortSignal) =>
    apiClient.post<ExamQuestionResponse>(`/admin/exams/${examId}/questions/${questionId}`, undefined, { signal }),
  remove: (examId: string, questionId: string, signal?: AbortSignal) =>
    apiClient.delete<void>(`/admin/exams/${examId}/questions/${questionId}`, { signal }),
  reorder: (examId: string, request: ReorderExamQuestionsRequest, signal?: AbortSignal) =>
    apiClient.put<ExamQuestionResponse[]>(`/admin/exams/${examId}/questions/order`, request, { signal }),
};
