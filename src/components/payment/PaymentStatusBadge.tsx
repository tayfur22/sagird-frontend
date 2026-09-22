import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { t } from "@/lib/i18n/t";
import type { PaymentStatus } from "@/types/payment";

const VARIANTS: Record<PaymentStatus, BadgeVariant> = {
  PENDING: "warning",
  PROCESSING: "info",
  SUCCEEDED: "success",
  FAILED: "error",
  CANCELLED: "neutral",
  REFUNDED: "info",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge variant={VARIANTS[status]}>{t.payment.statuses[status]}</Badge>;
}