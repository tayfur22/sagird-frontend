"use client";

import { cn } from "@/lib/utils/cn";
import { formatRemaining, type TimerUrgency } from "@/lib/attempt/format";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import styles from "./AttemptTimer.module.css";

/**
 * Purely visual remaining-time display. The number itself is computed by
 * useAttemptTimer from the server's expiresAt/serverTime - this component
 * never touches timing, only renders it. Status is conveyed with a text
 * label as well as color, per the accessibility requirement (never color
 * alone).
 */
export function AttemptTimer({ seconds, urgency }: { seconds: number; urgency: TimerUrgency }) {
  const t = useTranslation();
  const label = urgency === "expired" ? t.attempt.timer.expired : t.attempt.timer.remaining;

  return (
    <div className={cn(styles.wrapper, styles[urgency])} role="timer" aria-live="polite">
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{formatRemaining(seconds)}</span>
    </div>
  );
}
