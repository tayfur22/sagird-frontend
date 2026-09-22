"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { examApi } from "@/lib/exam/exam-api";
import { formatDurationMinutes, formatExamDateTime, formatExamPrice } from "@/lib/exam/format";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { PageResponse } from "@/types/api";
import type { ExamResponse } from "@/types/exam";
import { ExamStatusBadge } from "./ExamStatusBadge";
import { ExamTypeBadge } from "./ExamTypeBadge";
import styles from "./StudentExamList.module.css";

const PAGE_SIZE = 12;

/** The student's own view of exams (GET /api/v1/exams) - always PUBLISHED, enforced server-side. */
export function StudentExamList() {
  const t = useTranslation();

  const [pageIndex, setPageIndex] = useState(0);
  const [data, setData] = useState<PageResponse<ExamResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    examApi
      .getPublished(pageIndex, PAGE_SIZE)
      .then((response) => {
        if (!cancelled) setData(response);
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
  }, [pageIndex, retryToken]);

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

  if (!data || data.content.length === 0) {
    return <EmptyState title={t.exam.student.empty} />;
  }

  return (
    <div className={styles.section}>
      <div className={styles.grid}>
        {data.content.map((exam) => (
          <Card key={exam.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{exam.title}</h3>
              <ExamStatusBadge status={exam.status} />
            </div>

            {exam.description && <p className={styles.cardDescription}>{exam.description}</p>}

            <div className={styles.cardMeta}>
              <ExamTypeBadge type={exam.type} />
              <span>{formatDurationMinutes(exam.durationMinutes)}</span>
              <span>{formatExamPrice(exam.price, exam.currency)}</span>
            </div>

            {(exam.registrationStartAt || exam.registrationEndAt) && (
              <p className={styles.cardRegistration}>
                {t.exam.detail.registrationPeriod}: {formatExamDateTime(exam.registrationStartAt)} —{" "}
                {formatExamDateTime(exam.registrationEndAt)}
              </p>
            )}

            <Link href={`/student/exams/${exam.id}`} className={styles.cardLink}>
              {t.exam.student.viewDetails}
            </Link>
          </Card>
        ))}
      </div>

      {data.totalPages > 1 && (
        <div className={styles.footer}>
          <Pagination page={pageIndex + 1} totalPages={data.totalPages} onPageChange={(page) => setPageIndex(page - 1)} />
        </div>
      )}
    </div>
  );
}
