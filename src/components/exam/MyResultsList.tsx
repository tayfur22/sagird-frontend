"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { Table, type TableColumn } from "@/components/ui/Table";
import { ExamTypeBadge } from "@/components/exam/ExamTypeBadge";
import { attemptApi } from "@/lib/attempt/attempt-api";
import { formatExamDateTime } from "@/lib/exam/format";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { PageResponse } from "@/types/api";
import type { MyAttemptSummary } from "@/types/attempt";
import styles from "./MyResultsList.module.css";

const PAGE_SIZE = 10;

/**
 * The signed-in student's submitted attempts (GET /exams/attempts/my),
 * server-side paginated, newest first. Each row links to the existing
 * detailed result page. Nothing here computes or infers a score - every
 * number is shown exactly as the backend returned it.
 */
export function MyResultsList() {
  const t = useTranslation();
  const d = t.attempt.myResults;

  const [pageIndex, setPageIndex] = useState(0);
  const [data, setData] = useState<PageResponse<MyAttemptSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    setLoading(true);
    setError(null);

    attemptApi
      .listMine(pageIndex, PAGE_SIZE, controller.signal)
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
      controller.abort();
    };
  }, [pageIndex, retryToken]);

  const columns: TableColumn<MyAttemptSummary>[] = [
    { key: "exam", header: d.columns.exam, render: (row) => row.examTitle },
    { key: "type", header: d.columns.type, render: (row) => <ExamTypeBadge type={row.examType} /> },
    { key: "submittedAt", header: d.columns.submittedAt, render: (row) => formatExamDateTime(row.submittedAt) },
    {
      key: "score",
      header: d.columns.score,
      render: (row) => d.scoreFormat.replace("{score}", String(row.score)).replace("{max}", String(row.maxScore)),
    },
    { key: "percentage", header: d.columns.percentage, render: (row) => `${row.percentage}%` },
    {
      key: "actions",
      header: d.columns.actions,
      render: (row) => (
        <ButtonLink href={`/exam/${row.attemptId}/result`} variant="secondary" size="sm">
          {d.viewResult}
        </ButtonLink>
      ),
    },
  ];

  if (loading) {
    return (
      <div className={styles.skeletonRows} data-testid="my-results-loading">
        <Skeleton height={40} />
        <Skeleton height={40} />
        <Skeleton height={40} />
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
    return (
      <EmptyState
        title={d.empty.title}
        description={d.empty.description}
        action={<ButtonLink href="/student/exams">{d.empty.action}</ButtonLink>}
      />
    );
  }

  return (
    <div className={styles.section}>
      <Table columns={columns} rows={data.content} getRowKey={(row) => row.attemptId} emptyMessage={d.empty.title} />
      {data.totalPages > 1 && (
        <div className={styles.footer}>
          <Pagination page={pageIndex + 1} totalPages={data.totalPages} onPageChange={(page) => setPageIndex(page - 1)} />
        </div>
      )}
    </div>
  );
}
