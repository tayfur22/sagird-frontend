"use client";

import { cn } from "@/lib/utils/cn";
import { useAttemptTimer } from "@/hooks/useAttemptTimer";
import { formatRemaining } from "@/lib/attempt/format";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { ExamAttemptResponse } from "@/types/attempt";
import styles from "./AttemptTimer.module.css";

/**
 * Purely visual remaining-time display. The number itself is computed by
 * useAttemptTimer from the server's expiresAt/serverTime. The hook is called
 * here, not in the page, on purpose: it ticks every second, and keeping that
 * state in this small component means only the timer re-renders each tick
 * instead of the whole exam page (question view, navigator, listening player).
 * Status is conveyed with a text label as well as color, per the
 * accessibility requirement (never color alone).
 */
export function AttemptTimer({ attempt, onExpire }: { attempt: ExamAttemptResponse; onExpire: () => void }) {
  const t = useTranslation();
  const { seconds, urgency } = useAttemptTimer(attempt, onExpire);
  const label = urgency === "expired" ? t.attempt.timer.expired : t.attempt.timer.remaining;

  return (
    <div className={cn(styles.wrapper, styles[urgency])} role="timer" aria-live="polite">
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{formatRemaining(seconds)}</span>
    </div>
  );
}
