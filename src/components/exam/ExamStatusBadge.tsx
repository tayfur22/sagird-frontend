import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { ExamStatus } from "@/types/exam";

const VARIANT_BY_STATUS: Record<ExamStatus, BadgeVariant> = {
  DRAFT: "neutral",
  PUBLISHED: "success",
  ARCHIVED: "warning",
};

export function ExamStatusBadge({ status }: { status: ExamStatus }) {
  const t = useTranslation();
  return <Badge variant={VARIANT_BY_STATUS[status]}>{t.exam.statuses[status]}</Badge>;
}
