import { Badge } from "@/components/ui/Badge";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { QuestionType } from "@/types/question";

export function QuestionTypeBadge({ type }: { type: QuestionType }) {
  const t = useTranslation();
  return <Badge variant="info">{t.question.types[type]}</Badge>;
}
