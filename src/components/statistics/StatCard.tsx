import type { ReactNode } from "react";
import styles from "./Statistics.module.css";

export interface StatCardProps {
  label: string;
  /** Already formatted by the caller (formatCount / formatPercentage). */
  value: string;
  /** Screen-reader text used instead of the visual value when it is a placeholder such as "—". */
  valueSrText?: string;
  hint?: string;
  /** Optional decorative icon (e.g. <Icon name="users" />). */
  icon?: ReactNode;
  /**
   * "highlight" gives the card the primary-colour treatment (used for revenue).
   * "compact" is the smaller tinted tile used inside panels; it combines with highlight via `highlight`.
   */
  variant?: "default" | "highlight" | "compact";
  /** Primary-colour treatment on top of the chosen variant (e.g. a compact tile that stands out). */
  highlight?: boolean;
}

/** One aggregate value. Must be rendered inside a <dl> (see StatCardGrid). */
export function StatCard({ label, value, valueSrText, hint, icon, variant = "default", highlight = false }: StatCardProps) {
  const classes = [
    styles.stat,
    variant === "compact" ? styles.statCompact : "",
    variant === "highlight" || highlight ? styles.statHighlight : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes}>
      <dt className={styles.statLabel}>
        {icon && <span className={styles.statIcon}>{icon}</span>}
        {label}
      </dt>
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

export function StatCardGrid({
  children,
  label,
  columns = "auto",
}: {
  children: ReactNode;
  label?: string;
  /** "auto" fills the width; "pair" is the two-column grid used for compact tiles inside a panel. */
  columns?: "auto" | "pair";
}) {
  return (
    <dl className={`${styles.cards} ${columns === "pair" ? styles.cardsPair : ""}`} aria-label={label}>
      {children}
    </dl>
  );
}
