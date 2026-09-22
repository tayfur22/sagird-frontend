import type { SubscriptionPlan } from "./subscription";

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
  subscriptionId: string | null;
  plan: SubscriptionPlan;
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