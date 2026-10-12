"use client";

import type { ReactNode } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import styles from "./Statistics.module.css";

export interface StatisticsSectionProps {
  id: string;
  title: string;
  description?: string;
  /** Small uppercase heading style (used for the overview block); the element is still an <h2>. */
  eyebrow?: boolean;
  children: ReactNode;
}

/** A titled page section; the <h2> labels the region for assistive tech. */
export function StatisticsSection({ id, title, description, eyebrow = false, children }: StatisticsSectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div>
        <h2 id={headingId} className={`${styles.sectionTitle} ${eyebrow ? styles.eyebrow : ""}`}>
          {title}
        </h2>
        {description && <p className={styles.sectionDescription}>{description}</p>}
      </div>
      {children}
    </section>
  );
}

export interface StatisticsPanelProps {
  id: string;
  title: string;
  /** Decorative icon shown in the tinted square next to the title. */
  icon?: ReactNode;
  /** Optional status badge on the right of the header. */
  badge?: ReactNode;
  children: ReactNode;
}

/** A titled card panel (icon + <h2> + optional badge) for the side-by-side blocks; labels its region like StatisticsSection. */
export function StatisticsPanel({ id, title, icon, badge, children }: StatisticsPanelProps) {
  const headingId = `${id}-heading`;
  return (
    <section className={styles.panel} aria-labelledby={headingId}>
      <div className={styles.panelHeader}>
        <div className={styles.panelTitleWrap}>
          {icon && <span className={styles.panelIcon}>{icon}</span>}
          <h2 id={headingId} className={styles.panelTitle}>
            {title}
          </h2>
        </div>
        {badge}
      </div>
      {children}
    </section>
  );
}

export interface SectionErrorProps {
  title: string;
  error: unknown;
  onRetry: () => void;
}

/** Per-section failure: safe localized text only (never the raw backend message) + a retry of just that request. */
export function SectionError({ title, error, onRetry }: SectionErrorProps) {
  const t = useTranslation();
  return (
    <Alert variant="error" title={title}>
      <p>{apiErrorMessage(error)}</p>
      <Button variant="secondary" size="sm" onClick={onRetry} style={{ marginTop: "var(--space-3)" }}>
        {t.common.retry}
      </Button>
    </Alert>
  );
}

/** Placeholder cards that keep the final grid shape while loading. */
export function StatCardGridSkeleton({ count }: { count: number }) {
  return (
    <div className={styles.cards} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={styles.stat}>
          <Skeleton width="60%" height={14} />
          <Skeleton width="40%" height={28} />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows }: { rows: number }) {
  return (
    <div className={styles.skeletonStack} aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} width="100%" height={36} />
      ))}
    </div>
  );
}
