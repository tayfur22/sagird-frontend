"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { publicExamApi } from "@/lib/exam/exam-api";
import { formatDurationMinutes, formatExamDateTime } from "@/lib/exam/format";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { ExamResponse, ExamType } from "@/types/exam";
import { ExamAccessInfo } from "./ExamAccessInfo";
import { ExamTypeBadge } from "./ExamTypeBadge";
import styles from "./PublicExamList.module.css";

const PAGE_SIZE = 12;
// GET /public/exams has no type filter (Phase 2 scope: no repository/query
// change), so the type filter below is applied client-side over one fetch
// of every published exam (bounded by the backend's own max page size).
const FETCH_SIZE = 50;

type TypeFilter = "ALL" | ExamType;

/** Anonymous browsing of published exams (GET /api/v1/public/exams). */
export function PublicExamList() {
  const t = useTranslation();

  const [exams, setExams] = useState<ExamResponse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    publicExamApi
      .getPublished(0, FETCH_SIZE)
      .then((response) => {
        if (!cancelled) setExams(response.content);
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
  }, [retryToken]);

  const filtered = useMemo(() => {
    if (!exams) return [];
    if (typeFilter === "ALL") return exams;
    return exams.filter((exam) => exam.type === typeFilter);
  }, [exams, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE);

  function handleFilterChange(next: TypeFilter) {
    setTypeFilter(next);
    setPageIndex(0);
  }

  if (loading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 3 }, (_, index) => (
          <Card key={index}>
            <Skeleton width="70%" height={20} />
            <div style={{ marginTop: "var(--space-3)" }}>
              <Skeleton width="100%" height={14} />
            </div>
            <div style={{ marginTop: "var(--space-2)" }}>
              <Skeleton width="50%" height={14} />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title={t.common.error}>
        <p>{error}</p>
        <Button variant="secondary" size="sm" onClick={() => setRetryToken((v) => v + 1)} style={{ marginTop: "var(--space-3)" }}>
          {t.common.retry}
        </Button>
      </Alert>
    );
  }

  const filterOptions: { value: TypeFilter; label: string }[] = [
    { value: "ALL", label: t.exam.publicList.filterAll },
    { value: "WEEKLY", label: t.exam.types.WEEKLY },
    { value: "SPECIAL", label: t.exam.types.SPECIAL },
  ];

  return (
    <div className={styles.section}>
      <div className={styles.filters} role="group" aria-label={t.exam.publicList.filterLabel}>
        {filterOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={styles.filterButton}
            aria-pressed={typeFilter === option.value}
            data-active={typeFilter === option.value || undefined}
            onClick={() => handleFilterChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={t.exam.publicList.empty} />
      ) : (
        <>
          <div className={styles.grid}>
            {pageItems.map((exam) => (
              <Card key={exam.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{exam.title}</h3>
                  <ExamAccessInfo exam={exam} />
                </div>

                {exam.description && <p className={styles.cardDescription}>{exam.description}</p>}

                <div className={styles.cardMeta}>
                  <ExamTypeBadge type={exam.type} />
                  <span>{formatDurationMinutes(exam.durationMinutes)}</span>
                </div>

                {(exam.registrationStartAt || exam.registrationEndAt) && (
                  <p className={styles.cardRegistration}>
                    {t.exam.detail.registrationPeriod}: {formatExamDateTime(exam.registrationStartAt)} —{" "}
                    {formatExamDateTime(exam.registrationEndAt)}
                  </p>
                )}

                <Link href={`/exams/${exam.id}`} className={styles.cardLink}>
                  {t.exam.publicList.viewDetails}
                </Link>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.footer}>
              <Pagination page={pageIndex + 1} totalPages={totalPages} onPageChange={(page) => setPageIndex(page - 1)} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
