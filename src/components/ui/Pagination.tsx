"use client";

import { useTranslation } from "@/lib/i18n/LocaleProvider";
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
  /** Localized accessible names. Defaults to the active locale's `common.pagination` labels. */
  labels?: PaginationLabels;
}

export function Pagination({ page, totalPages, onPageChange, disabled = false, labels }: PaginationProps) {
  const t = useTranslation();
  labels = labels ?? t.common.pagination;
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
