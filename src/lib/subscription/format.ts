import { t } from "@/lib/i18n/t";

const DAY_MS = 24 * 60 * 60 * 1000;
const EMPTY_VALUE = "—";

const dateFormatter = new Intl.DateTimeFormat("az-AZ", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

/** Formats an ISO instant as a human-readable Azerbaijani date ("—" if the value is not a valid date). */
export function formatSubscriptionDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? EMPTY_VALUE : dateFormatter.format(date);
}

function startOfDay(time: number): number {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Human-readable "time left" text for an active subscription, e.g.
 * "12 gün qalıb" / "Bu gün bitir". Returns null once `endAt` is in the past
 * (the effective `status` already reflects that; this is display-only).
 * Days are counted as calendar days in the user's local time, so a
 * subscription that ends later today reads "Bu gün bitir".
 */
export function formatRemaining(endAt: string, nowMs: number = Date.now()): string | null {
  const end = new Date(endAt).getTime();
  if (Number.isNaN(end) || end <= nowMs) return null;
  const days = Math.round((startOfDay(end) - startOfDay(nowMs)) / DAY_MS);
  if (days <= 0) return t.subscription.remainingToday;
  return t.subscription.remainingDays.replace("{days}", String(days));
}
