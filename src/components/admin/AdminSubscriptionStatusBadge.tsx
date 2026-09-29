import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { t } from "@/lib/i18n/t";
import type { SubscriptionStatus } from "@/types/subscription";

const VARIANTS: Record<SubscriptionStatus, BadgeVariant> = {
  ACTIVE: "success",
  EXPIRED: "neutral",
  CANCELLED: "error",
};

/** Admin-only: renders an effective SubscriptionStatus value (no `upcoming` field involved). */
export function AdminSubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
  return <Badge variant={VARIANTS[status]}>{t.subscription.statuses[status]}</Badge>;
}
