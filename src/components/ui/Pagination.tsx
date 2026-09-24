"use client";

import styles from "./Pagination.module.css";

export interface PaginationLabels {
  label: string;
  previous: string;
  next: string;
}

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Disables both buttons, e.g. while the requested page is loading. */
  disabled?: boolean;
  /** Localized accessible names. Defaults to the original Azerbaijani labels so existing callers are unchanged. */
  labels?: PaginationLabels;
}

const DEFAULT_LABELS: PaginationLabels = {
  label: "Səhifələmə",
  previous: "Əvvəlki səhifə",
  next: "Növbəti səhifə",
};

export function Pagination({ page, totalPages, onPageChange, disabled = false, labels = DEFAULT_LABELS }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className={styles.nav} aria-label={labels.label}>
      <button
        className={styles.button}
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 1}
        aria-label={labels.previous}
      >
        ‹
      </button>
      <span className={styles.status}>
        {page} / {totalPages}
      </span>
      <button
        className={styles.button}
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= totalPages}
        aria-label={labels.next}
      >
        ›
      </button>
    </nav>
  );
}
