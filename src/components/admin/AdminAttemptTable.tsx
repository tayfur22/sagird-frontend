"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { Table, type TableColumn } from "@/components/ui/Table";
import { AttemptStatusBadge } from "@/components/exam/AttemptStatusBadge";
import { adminMonitoringApi } from "@/lib/admin/admin-api";
import { formatPassed } from "@/lib/admin/format";
import { formatExamDateTime } from "@/lib/exam/format";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import { formatPercentage } from "@/lib/statistics/format";
import type { PageResponse } from "@/types/api";
import type { AdminAttemptItemResponse } from "@/types/admin";
import type { AttemptStatus } from "@/types/attempt";
import styles from "./AdminTable.module.css";

const PAGE_SIZE = 10;
const FILTER_DEBOUNCE_MS = 400;
const STATUSES: AttemptStatus[] = ["IN_PROGRESS", "SUBMITTED", "EXPIRED", "CANCELLED"];

/**
 * Admin attempts list (GET /api/v1/admin/attempts). The backend only
 * accepts examId/studentId/status filters (no free-text search), so the
 * exam/student filters are ID fields; they pre-fill from ?examId=/?studentId=
 * so links from the exam/student detail pages land pre-filtered.
 */
export function AdminAttemptTable() {
  const t = useTranslation();
  const searchParams = useSearchParams();

  const [pageIndex, setPageIndex] = useState(0);
  const [examIdInput, setExamIdInput] = useState(searchParams.get("examId") ?? "");
  const [studentIdInput, setStudentIdInput] = useState(searchParams.get("studentId") ?? "");
  const [examId, setExamId] = useState(searchParams.get("examId") ?? "");
  const [studentId, setStudentId] = useState(searchParams.get("studentId") ?? "");
  const [status, setStatus] = useState<AttemptStatus | "">("");

  const [data, setData] = useState<PageResponse<AdminAttemptItemResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setExamId(examIdInput.trim());
      setStudentId(studentIdInput.trim());
      setPageIndex(0);
    }, FILTER_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [examIdInput, studentIdInput]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    adminMonitoringApi
      .getAttempts(pageIndex, PAGE_SIZE, {
        examId: examId || undefined,
        studentId: studentId || undefined,
        status: status || undefined,
      })
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
  }, [pageIndex, examId, studentId, status, retryToken]);

  const statusOptions = [
    { value: "", label: t.admin.attempts.allStatuses },
    ...STATUSES.map((value) => ({ value, label: t.attempt.statuses[value] })),
  ];

  const columns: TableColumn<AdminAttemptItemResponse>[] = [
    {
      key: "student",
      header: t.admin.attempts.columns.student,
      render: (row) =>
        row.student.fullName ? (
          <ButtonLink href={`/admin/students/${row.student.id}`} variant="ghost" size="sm">
            {row.student.fullName}
          </ButtonLink>
        ) : (
          "—"
        ),
    },
    { key: "exam", header: t.admin.attempts.columns.exam, render: (row) => row.exam.title },
    { key: "status", header: t.admin.attempts.columns.status, render: (row) => <AttemptStatusBadge status={row.status} /> },
    {
      key: "score",
      header: t.admin.attempts.columns.score,
      render: (row) => (row.score === null || row.maxScore === null ? "—" : `${row.score} / ${row.maxScore}`),
    },
    { key: "percentage", header: t.admin.attempts.columns.percentage, render: (row) => formatPercentage(row.percentage) },
    { key: "passed", header: t.admin.attempts.columns.passed, render: (row) => formatPassed(row.passed) },
    { key: "startedAt", header: t.admin.attempts.columns.startedAt, render: (row) => formatExamDateTime(row.startedAt) },
    {
      key: "submittedAt",
      header: t.admin.attempts.columns.submittedAt,
      render: (row) => formatExamDateTime(row.submittedAt),
    },
  ];

  return (
    <div className={styles.section}>
      <div className={styles.filters}>
        <Input
          label={t.admin.attempts.studentIdLabel}
          value={studentIdInput}
          onChange={(event) => setStudentIdInput(event.target.value)}
          placeholder={t.admin.attempts.studentIdPlaceholder}
        />
        <Input
          label={t.admin.attempts.examIdLabel}
          value={examIdInput}
          onChange={(event) => setExamIdInput(event.target.value)}
          placeholder={t.admin.attempts.examIdPlaceholder}
        />
        <Select
          label={t.admin.attempts.statusFilterLabel}
          options={statusOptions}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as AttemptStatus | "");
            setPageIndex(0);
          }}
        />
      </div>

      {loading && (
        <div className={styles.skeletonRows}>
          <Skeleton height={40} />
          <Skeleton height={40} />
          <Skeleton height={40} />
        </div>
      )}

      {!loading && error && (
        <Alert variant="error" title={t.common.error}>
          <p>{error}</p>
          <Button variant="secondary" size="sm" onClick={() => setRetryToken((v) => v + 1)} style={{ marginTop: "var(--space-3)" }}>
            {t.common.retry}
          </Button>
        </Alert>
      )}

      {!loading && !error && data && data.content.length === 0 && <EmptyState title={t.admin.attempts.empty} />}

      {!loading && !error && data && data.content.length > 0 && (
        <>
          <Table columns={columns} rows={data.content} getRowKey={(row) => row.id} emptyMessage={t.admin.attempts.empty} />
          {data.totalPages > 1 && (
            <div className={styles.footer}>
              <Pagination page={pageIndex + 1} totalPages={data.totalPages} onPageChange={(page) => setPageIndex(page - 1)} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
