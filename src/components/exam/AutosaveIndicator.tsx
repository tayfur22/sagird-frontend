"use client";

import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils/cn";
import type { SaveStatus } from "@/hooks/useAnswerAutosave";
import styles from "./AutosaveIndicator.module.css";

interface AutosaveIndicatorProps {
  status: SaveStatus;
  errorText?: string;
  onRetry?: () => void;
}

/** Screen-reader-friendly save status for one question (spec section 7/13). */
export function AutosaveIndicator({ status, errorText, onRetry }: AutosaveIndicatorProps) {
  const t = useTranslation();

  if (status === "idle") return <span className={styles.indicator} aria-hidden="true" />;

  const label =
    status === "saving" ? t.attempt.exam.saving : status === "saved" ? t.attempt.exam.saved : errorText ?? t.attempt.exam.saveFailed;

  return (
    <div className={cn(styles.indicator, styles[status])} role="status" aria-live="polite">
      <span>{label}</span>
      {status === "error" && onRetry && (
        <Button type="button" variant="ghost" size="sm" onClick={onRetry}>
          {t.common.retry}
        </Button>
      )}
    </div>
  );
}
