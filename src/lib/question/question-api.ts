import { apiClient } from "@/lib/api/client";
import type { PageResponse } from "@/types/api";
import type {
  CreateQuestionRequest,
  ExamQuestionResponse,
  QuestionImportSummary,
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
 * Typed wrapper over the Phase 18A admin bulk import endpoint
 * (POST /admin/questions/import, multipart). The backend answers 201 when
 * every row imported and 422 when validation failed for one or more rows
 * (nothing persisted either way in that case) - both carry a normal
 * QuestionImportSummary body, so 422 is listed in acceptStatuses instead
 * of being thrown as an ApiError. Genuine file-level problems (missing
 * file, wrong format, too large, empty, too many rows) still come back as
 * a normal ApiError via apiErrorMessage.
 */
export const adminQuestionImportApi = {
  importQuestions: (file: File, signal?: AbortSignal) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<QuestionImportSummary>("/admin/questions/import", formData, {
      signal,
      acceptStatuses: [422],
    });
  },
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
