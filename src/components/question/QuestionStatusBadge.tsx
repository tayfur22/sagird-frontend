import { Badge } from "@/components/ui/Badge";
import { useTranslation } from "@/lib/i18n/LocaleProvider";

export function QuestionStatusBadge({ active }: { active: boolean }) {
  const t = useTranslation();
  return <Badge variant={active ? "success" : "neutral"}>{active ? t.question.statuses.active : t.question.statuses.inactive}</Badge>;
}
