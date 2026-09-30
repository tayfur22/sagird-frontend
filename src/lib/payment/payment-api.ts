import { apiClient } from "@/lib/api/client";
import type { PageResponse } from "@/types/api";
import type {
  CreateExamPaymentRequest,
  CreatePaymentRequest,
  ExamPaymentStatusResponse,
  PaymentResponse,
} from "@/types/payment";

/**
 * Typed wrappers over the Phase 4A student payment endpoints (base URL
 * already contains /api/v1). Mirrors subscription-api.ts's shape.
 */
export const paymentApi = {
  create: (request: CreatePaymentRequest, signal?: AbortSignal) =>
    apiClient.post<PaymentResponse>("/payments", request, { signal }),
  /** POST /payments/exams/{examId} - one-time exam payment; the backend prices it from the exam. */
  createForExam: (examId: string, request: CreateExamPaymentRequest, signal?: AbortSignal) =>
    apiClient.post<PaymentResponse>(`/payments/exams/${examId}`, request, { signal }),
  /** GET /payments/exams/{examId} - the caller's own paid flag + latest payment for this exam. */
  getExamStatus: (examId: string, signal?: AbortSignal) =>
    apiClient.get<ExamPaymentStatusResponse>(`/payments/exams/${examId}`, { signal }),
  getHistory: (page: number, size: number, signal?: AbortSignal) =>
    apiClient.get<PageResponse<PaymentResponse>>(`/payments/me?page=${page}&size=${size}`, { signal }),
  getById: (id: string, signal?: AbortSignal) =>
    apiClient.get<PaymentResponse>(`/payments/me/${id}`, { signal }),
};