import type { SubscriptionPlan } from "./subscription";

/** Mirrors az.sagird.modules.payment.entity.PaymentPurpose. */
export type PaymentPurpose = "SUBSCRIPTION" | "EXAM";

/** Mirrors az.sagird.modules.payment.entity.PaymentStatus. */
export type PaymentStatus = "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED" | "CANCELLED" | "REFUNDED";

/**
 * Mirrors az.sagird.modules.payment.dto.PaymentResponse. Never carries card
 * or other payment-instrument data - there is none on the backend to begin
 * with. `provider`/`providerPaymentId`-derived fields are null until a real
 * PaymentGateway has routed the payment.
 */
export interface PaymentResponse {
  id: string;
  purpose: PaymentPurpose;
  /** Set only for EXAM payments. */
  examId: string | null;
  subscriptionId: string | null;
  /** Null for EXAM payments. */
  plan: SubscriptionPlan | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string | null;
  failureReason: string | null;
  paidAt: string | null;
  createdAt: string;
}

/** Mirrors az.sagird.modules.payment.dto.CreatePaymentRequest. */
export interface CreatePaymentRequest {
  plan: SubscriptionPlan;
  idempotencyKey?: string;
}

/** Mirrors az.sagird.modules.payment.dto.CreateExamPaymentRequest. No amount/user: the backend decides both. */
export interface CreateExamPaymentRequest {
  idempotencyKey?: string;
}

/** Mirrors az.sagird.modules.payment.dto.ExamPaymentStatusResponse. */
export interface ExamPaymentStatusResponse {
  paid: boolean;
  latestPayment: PaymentResponse | null;
}
