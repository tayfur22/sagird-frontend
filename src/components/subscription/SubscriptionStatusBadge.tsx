import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { t } from "@/lib/i18n/t";
import type { SubscriptionResponse } from "@/types/subscription";

/**
 * `status` alone is not enough to describe an ACTIVE row that has not
 * started yet ("upcoming") vs one that currently grants access - both share
 * status ACTIVE, so this reads `active`/`upcoming` first.
 */
export function SubscriptionStatusBadge({ subscription }: { subscription: SubscriptionResponse }) {
  const { variant, label } = statusPresentation(subscription);
  return <Badge variant={variant}>{label}</Badge>;
}

function statusPresentation(subscription: SubscriptionResponse): { variant: BadgeVariant; label: string } {
  if (subscription.active) {
    return { variant: "success", label: t.subscription.statuses.ACTIVE };
  }
  if (subscription.upcoming) {
    return { variant: "info", label: t.subscription.statuses.UPCOMING };
  }
  if (subscription.status === "CANCELLED") {
    return { variant: "error", label: t.subscription.statuses.CANCELLED };
  }
  return { variant: "neutral", label: t.subscription.statuses.EXPIRED };
}