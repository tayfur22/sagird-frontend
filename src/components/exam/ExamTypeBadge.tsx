import { Badge } from "@/components/ui/Badge";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { ExamType } from "@/types/exam";

export function ExamTypeBadge({ type }: { type: ExamType }) {
  const t = useTranslation();
  return <Badge variant="info">{t.exam.types[type]}</Badge>;
}
