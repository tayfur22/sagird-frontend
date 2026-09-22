import { apiClient } from "@/lib/api/client";
import type { PageResponse } from "@/types/api";
import type { CreateExamRequest, ExamResponse, UpdateExamRequest } from "@/types/exam";

/**
 * Typed wrappers over the Phase 5A admin exam endpoints (base URL already
 * contains /api/v1). Mirrors payment-api.ts's shape.
 */
export const adminExamApi = {
  create: (request: CreateExamRequest, signal?: AbortSignal) =>
    apiClient.post<ExamResponse>("/admin/exams", request, { signal }),
  getAll: (page: number, size: number, signal?: AbortSignal) =>
    apiClient.get<PageResponse<ExamResponse>>(`/admin/exams?page=${page}&size=${size}`, { signal }),
  getById: (id: string, signal?: AbortSignal) =>
    apiClient.get<ExamResponse>(`/admin/exams/${id}`, { signal }),
  update: (id: string, request: UpdateExamRequest, signal?: AbortSignal) =>
    apiClient.put<ExamResponse>(`/admin/exams/${id}`, request, { signal }),
  publish: (id: string, signal?: AbortSignal) =>
    apiClient.post<ExamResponse>(`/admin/exams/${id}/publish`, undefined, { signal }),
  archive: (id: string, signal?: AbortSignal) =>
    apiClient.post<ExamResponse>(`/admin/exams/${id}/archive`, undefined, { signal }),
};

/**
 * Typed wrappers over the Phase 5A student exam endpoints. Only ever
 * returns PUBLISHED exams - enforced server-side, not here.
 */
export const examApi = {
  getPublished: (page: number, size: number, signal?: AbortSignal) =>
    apiClient.get<PageResponse<ExamResponse>>(`/exams?page=${page}&size=${size}`, { signal }),
  getById: (id: string, signal?: AbortSignal) =>
    apiClient.get<ExamResponse>(`/exams/${id}`, { signal }),
};
