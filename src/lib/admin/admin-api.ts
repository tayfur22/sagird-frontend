import type { LeaderboardEntry } from "@/types/leaderboard";
import { apiClient } from "@/lib/api/client";
import type { PageResponse } from "@/types/api";
import type {
  AdminAttemptItemResponse,
  AdminDashboardOverviewResponse,
  AdminExamSummaryResponse,
  AdminPaymentItemResponse,
  AdminStudentDetailResponse,
  AdminStudentSummaryResponse,
  AdminSubscriptionItemResponse,
} from "@/types/admin";
import type { AttemptStatus } from "@/types/attempt";
import type { ExamStatus } from "@/types/exam";
import type { PaymentStatus } from "@/types/payment";
import type { CreateSubscriptionRequest, SubscriptionResponse, SubscriptionStatus } from "@/types/subscription";
function query(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

/** Typed wrapper over GET /admin/dashboard/overview (Phase 17A). */
export const adminDashboardApi = {
  getOverview: (signal?: AbortSignal) =>
    apiClient.get<AdminDashboardOverviewResponse>("/admin/dashboard/overview", { signal }),
};

/** Typed wrappers over the Phase 17A admin student endpoints. */
export const adminStudentApi = {
  getAll: (page: number, size: number, search?: string, signal?: AbortSignal) =>
    apiClient.get<PageResponse<AdminStudentSummaryResponse>>(
      `/admin/students${query({ page, size, search })}`,
      { signal }
    ),
  getById: (id: string, signal?: AbortSignal) =>
    apiClient.get<AdminStudentDetailResponse>(`/admin/students/${id}`, { signal }),
};

export interface AdminExamListParams {
  search?: string;
  status?: ExamStatus;
}

export interface AdminSubscriptionListParams {
  search?: string;
  status?: SubscriptionStatus;
}

export interface AdminPaymentListParams {
  search?: string;
  status?: PaymentStatus;
  provider?: string;
}

export interface AdminAttemptListParams {
  examId?: string;
  studentId?: string;
  status?: AttemptStatus;
}

/**
 * Typed wrappers over the Phase 17A read-only admin monitoring lists
 * (GET /admin/exams|subscriptions|payments|attempts). The exams list is a
 * superset of the existing adminExamApi.getAll response (same field names
 * plus aggregates), kept separate so the exam create/edit/publish flow is
 * untouched.
 */
export const adminMonitoringApi = {
  getExams: (page: number, size: number, params: AdminExamListParams = {}, signal?: AbortSignal) =>
    apiClient.get<PageResponse<AdminExamSummaryResponse>>(
      `/admin/exams${query({ page, size, ...params })}`,
      { signal }
    ),
  getSubscriptions: (page: number, size: number, params: AdminSubscriptionListParams = {}, signal?: AbortSignal) =>
    apiClient.get<PageResponse<AdminSubscriptionItemResponse>>(
      `/admin/subscriptions${query({ page, size, ...params })}`,
      { signal }
    ),
  getPayments: (page: number, size: number, params: AdminPaymentListParams = {}, signal?: AbortSignal) =>
    apiClient.get<PageResponse<AdminPaymentItemResponse>>(
      `/admin/payments${query({ page, size, ...params })}`,
      { signal }
    ),
  getAttempts: (page: number, size: number, params: AdminAttemptListParams = {}, signal?: AbortSignal) =>
    apiClient.get<PageResponse<AdminAttemptItemResponse>>(
      `/admin/attempts${query({ page, size, ...params })}`,
      { signal }
    ),
};

export const adminSubscriptionApi = {
  create: (request: CreateSubscriptionRequest) =>
    apiClient.post<SubscriptionResponse>("/admin/subscriptions", request),
  cancel: (id: string) => apiClient.post<SubscriptionResponse>(`/admin/subscriptions/${id}/cancel`),
};

/**
 * GET /admin/leaderboard/... - the admin's read-only view of the same
 * rankings students see (the student endpoints are STUDENT-only). `page` is
 * 0-based; ranks are shown exactly as the backend returns them.
 */
export const adminLeaderboardApi = {
  getWeekly: (page: number, size: number, signal?: AbortSignal) =>
    apiClient.get<PageResponse<LeaderboardEntry>>(`/admin/leaderboard/weekly?page=${page}&size=${size}`, { signal }),
  getExam: (examId: string, page: number, size: number, signal?: AbortSignal) =>
    apiClient.get<PageResponse<LeaderboardEntry>>(
      `/admin/leaderboard/exams/${encodeURIComponent(examId)}?page=${page}&size=${size}`,
      { signal }
    ),
};
