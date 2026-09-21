import { apiClient } from "@/lib/api/client";
import type { CurrentSubscriptionResponse, SubscriptionResponse } from "@/types/subscription";

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
