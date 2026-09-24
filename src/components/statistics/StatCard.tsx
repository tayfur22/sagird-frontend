import type { ReactNode } from "react";
import styles from "./Statistics.module.css";

export interface StatCardProps {
  label: string;
  /** Already formatted by the caller (formatCount / formatPercentage). */
  value: string;
  /** Screen-reader text used instead of the visual value when it is a placeholder such as "—". */
  valueSrText?: string;
  hint?: string;
}

/** One aggregate value. Must be rendered inside a <dl> (see StatCardGrid). */
export function StatCard({ label, value, valueSrText, hint }: StatCardProps) {
  return (
    <div className={styles.stat}>
      <dt className={styles.statLabel}>{label}</dt>
      <dd className={styles.statValue}>
        {valueSrText ? (
          <>
            <span aria-hidden="true">{value}</span>
            <span className={styles.srOnly}>{valueSrText}</span>
          </>
        ) : (
          value
        )}
      </dd>
      {hint && <dd className={styles.statHint}>{hint}</dd>}
    </div>
  );
}

export function StatCardGrid({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <dl className={styles.cards} aria-label={label}>
      {children}
    </dl>
  );
}
