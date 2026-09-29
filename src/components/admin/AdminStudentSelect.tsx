"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { adminStudentApi } from "@/lib/admin/admin-api";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils/cn";
import type { AdminStudentSummaryResponse } from "@/types/admin";
import styles from "./AdminStudentSelect.module.css";

const RESULT_LIMIT = 6;
const SEARCH_DEBOUNCE_MS = 400;

export interface AdminStudentSelectProps {
  value: AdminStudentSummaryResponse | null;
  onChange: (student: AdminStudentSummaryResponse | null) => void;
  label: string;
  errorText?: string;
  disabled?: boolean;
  required?: boolean;
}

/**
 * Server-side searchable student picker. Never loads the whole student
 * list: each (debounced) search asks GET /admin/students for one small page
 * (adminStudentApi.getAll), so it scales with the number of students.
 * Once a student is chosen the search UI is replaced by a summary with a
 * "change" button, and no further requests are made.
 */
export function AdminStudentSelect({ value, onChange, label, errorText, disabled, required }: AdminStudentSelectProps) {
  const t = useTranslation();
  const errorId = useId();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<AdminStudentSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const searching = value === null;

  useEffect(() => {
    if (!searching) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    adminStudentApi
      .getAll(0, RESULT_LIMIT, search || undefined)
      .then((response) => {
        if (!cancelled) setResults(response.content);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(apiErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [searching, search, retryToken]);

  if (value) {
    return (
      <div className={styles.field}>
        <span className={styles.label}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          )}
        </span>
        <div className={cn(styles.selected, errorText && styles.selectedInvalid)}>
          <div className={styles.person}>
            <span className={styles.name}>{value.fullName}</span>
            <span className={styles.email}>{value.email}</span>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={() => onChange(null)} disabled={disabled}>
            {t.admin.subscriptions.create.changeStudent}
          </Button>
        </div>
        {errorText && (
          <span id={errorId} className={styles.errorText} role="alert">
            {errorText}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={styles.field}>
      <Input
        label={label}
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        onKeyDown={(event) => {
          // Enter must not submit the surrounding form while searching.
          if (event.key === "Enter") event.preventDefault();
        }}
        placeholder={t.admin.subscriptions.create.studentSearchPlaceholder}
        errorText={errorText}
        disabled={disabled}
        required={required}
        autoComplete="off"
      />

      {loading && (
        <div className={styles.skeletons}>
          <Skeleton height={44} />
          <Skeleton height={44} />
        </div>
      )}

      {!loading && error && (
        <div className={styles.status} role="alert">
          <span>{error}</span>
          <div>
            <Button type="button" variant="secondary" size="sm" onClick={() => setRetryToken((v) => v + 1)}>
              {t.common.retry}
            </Button>
          </div>
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <div className={styles.status}>{t.admin.subscriptions.create.noStudentsFound}</div>
      )}

      {!loading && !error && results.length > 0 && (
        <ul className={styles.results} aria-label={label}>
          {results.map((student) => (
            <li key={student.id}>
              <button type="button" className={styles.option} onClick={() => onChange(student)} disabled={disabled}>
                <span className={styles.name}>{student.fullName}</span>
                <span className={styles.email}>{student.email}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
