import { formatAmount } from "@/lib/payment/format";
import { t } from "@/lib/i18n/t";
import type { AdminMoneyByCurrency } from "@/types/admin";

/** Joins one line per currency (revenue is never summed across currencies). */
export function formatRevenueByCurrency(revenue: AdminMoneyByCurrency[]): string[] {
  if (revenue.length === 0) return [];
  return revenue.map((entry) => formatAmount(entry.amount, entry.currency));
}

/** "Keçdi" / "Keçmədi" / "Gözləmədə" for an attempt's `passed` tri-state. */
export function formatPassed(passed: boolean | null): string {
  if (passed === null) return t.admin.attempts.passedPending;
  return passed ? t.admin.attempts.passedYes : t.admin.attempts.passedNo;
}
