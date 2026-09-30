import { Badge } from "@/components/ui/Badge";
import { formatExamPrice } from "@/lib/exam/format";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { ExamResponse } from "@/types/exam";

/**
 * The three access models the public site must never confuse (see Phase 2
 * spec §5): `subscriptionRequired` on its own only means "no separate
 * payment, an active monthly subscription is required" - it does NOT mean
 * free. A price on a non-subscription exam is a one-time, per-exam charge.
 * Both fields already exist on ExamResponse; nothing here is invented.
 */
export function ExamAccessInfo({ exam }: { exam: ExamResponse }) {
  const t = useTranslation();

  if (exam.subscriptionRequired) {
    return <Badge variant="info">{t.exam.access.subscriptionIncluded}</Badge>;
  }
  if (exam.price > 0) {
    return (
      <Badge variant="neutral">
        {formatExamPrice(exam.price, exam.currency)} · {t.exam.access.oneAttempt}
      </Badge>
    );
  }
  return <Badge variant="success">{t.exam.access.free}</Badge>;
}
