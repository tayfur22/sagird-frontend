import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { AttemptStatus } from "@/types/attempt";

const VARIANT_BY_STATUS: Record<AttemptStatus, BadgeVariant> = {
  IN_PROGRESS: "info",
  SUBMITTED: "success",
  EXPIRED: "error",
  CANCELLED: "neutral",
};

/** Text + Badge (never color alone) for an attempt's status. */
export function AttemptStatusBadge({ status }: { status: AttemptStatus }) {
  const t = useTranslation();
  return <Badge variant={VARIANT_BY_STATUS[status]}>{t.attempt.statuses[status]}</Badge>;
}
