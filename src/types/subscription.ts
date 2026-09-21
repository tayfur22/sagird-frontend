/** Mirrors az.sagird.modules.subscription.entity.SubscriptionPlan. */
export type SubscriptionPlan = "MONTHLY";

/** Mirrors az.sagird.modules.subscription.entity.SubscriptionStatus. */
export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";

/**
 * Mirrors az.sagird.modules.subscription.dto.SubscriptionResponse.
 * `status` is already the effective status (dates taken into account);
 * `active` is true only while the subscription grants access right now;
 * `upcoming` is true for an ACTIVE subscription that has not started yet.
 */
export interface SubscriptionResponse {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  active: boolean;
  upcoming: boolean;
  startAt: string;
  endAt: string;
  cancelledAt: string | null;
  createdAt: string;
}

/**
 * Mirrors az.sagird.modules.subscription.dto.CurrentSubscriptionResponse.
 * Having no subscription is a normal state: `current` is then null and
 * `hasActiveSubscription` is false.
 */
export interface CurrentSubscriptionResponse {
  hasActiveSubscription: boolean;
  current: SubscriptionResponse | null;
}