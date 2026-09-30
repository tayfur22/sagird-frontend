import { apiClient } from "@/lib/api/client";
import type { CurrentSubscriptionResponse, PublicSubscriptionPlanResponse, SubscriptionResponse } from "@/types/subscription";

/**
 * Typed wrappers over the Phase 3A student subscription endpoints
 * (base URL already contains /api/v1). The history endpoint returns a
 * plain list, newest first, with no pagination.
 */
export const subscriptionApi = {
  getCurrent: (signal?: AbortSignal) =>
    apiClient.get<CurrentSubscriptionResponse>("/subscriptions/me", { signal }),
  getHistory: (signal?: AbortSignal) =>
    apiClient.get<SubscriptionResponse[]>("/subscriptions/me/history", { signal }),
};

/**
 * Public (no-auth) plan pricing for the /subscriptions marketing page
 * (Phase 2 of the frontend) - so the displayed price always matches the
 * backend's sagird.payment.pricing config instead of being hardcoded.
 */
export const publicSubscriptionApi = {
  getPlans: (signal?: AbortSignal) =>
    apiClient.get<PublicSubscriptionPlanResponse[]>("/public/subscription-plans", { signal }),
};
