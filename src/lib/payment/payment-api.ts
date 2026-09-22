import { apiClient } from "@/lib/api/client";
import type { PageResponse } from "@/types/api";
import type { CreatePaymentRequest, PaymentResponse } from "@/types/payment";

/**
 * Typed wrappers over the Phase 4A student payment endpoints (base URL
 * already contains /api/v1). Mirrors subscription-api.ts's shape.
 */
export const paymentApi = {
  create: (request: CreatePaymentRequest, signal?: AbortSignal) =>
    apiClient.post<PaymentResponse>("/payments", request, { signal }),
  getHistory: (page: number, size: number, signal?: AbortSignal) =>
    apiClient.get<PageResponse<PaymentResponse>>(`/payments/me?page=${page}&size=${size}`, { signal }),
  getById: (id: string, signal?: AbortSignal) =>
    apiClient.get<PaymentResponse>(`/payments/me/${id}`, { signal }),
};