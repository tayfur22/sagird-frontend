"use client";

import { useEffect, useState } from "react";
import { ButtonLink, Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { Table, type TableColumn } from "@/components/ui/Table";
import { useToast } from "@/hooks/useToast";
import { adminExamApi } from "@/lib/exam/exam-api";
import { formatDurationMinutes, formatExamDateTime, formatExamPrice } from "@/lib/exam/format";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { PageResponse } from "@/types/api";
import type { ExamResponse } from "@/types/exam";
import { ExamStatusBadge } from "./ExamStatusBadge";
import { ExamTypeBadge } from "./ExamTypeBadge";
import styles from "./AdminExamTable.module.css";

const PAGE_SIZE = 10;

/**
 * The admin exam list (GET /api/v1/admin/exams), with the status-gated
 * actions from Phase 5A's transition rules: DRAFT can be edited or
 * published, PUBLISHED can only be archived, ARCHIVED is view-only. Publish
 * and archive update the row in place instead of a full reload.
 */
export function AdminExamTable() {
  const t = useTranslation();
  const { showToast } = useToast();

  const [pageIndex, setPageIndex] = useState(0);
  const [data, setData] = useState<PageResponse<ExamResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    adminExamApi
      .getAll(pageIndex, PAGE_SIZE)
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

  function replaceRow(updated: ExamResponse) {
    setData((current) =>
      current ? { ...current, content: current.content.map((exam) => (exam.id === updated.id ? updated : exam)) } : current
    );
  }

  async function handlePublish(exam: ExamResponse) {
    setActioningId(exam.id);
    try {
      const updated = await adminExamApi.publish(exam.id);
      replaceRow(updated);
      showToast(t.exam.toasts.published, "success");
    } catch (err) {
      showToast(apiErrorMessage(err), "error");
    } finally {
      setActioningId(null);
    }
  }

  async function handleArchive(exam: ExamResponse) {
    setActioningId(exam.id);
    try {
      const updated = await adminExamApi.archive(exam.id);
      replaceRow(updated);
      showToast(t.exam.toasts.archived, "success");
    } catch (err) {
      showToast(apiErrorMessage(err), "error");
    } finally {
      setActioningId(null);
    }
  }

  const columns: TableColumn<ExamResponse>[] = [
    { key: "title", header: t.exam.adminList.columns.title, render: (row) => row.title },
    { key: "type", header: t.exam.adminList.columns.type, render: (row) => <ExamTypeBadge type={row.type} /> },
    { key: "status", header: t.exam.adminList.columns.status, render: (row) => <ExamStatusBadge status={row.status} /> },
    {
      key: "duration",
      header: t.exam.adminList.columns.duration,
      render: (row) => formatDurationMinutes(row.durationMinutes),
    },
    { key: "price", header: t.exam.adminList.columns.price, render: (row) => formatExamPrice(row.price, row.currency) },
    {
      key: "subscriptionRequired",
      header: t.exam.adminList.columns.subscriptionRequired,
      render: (row) => (row.subscriptionRequired ? t.exam.subscriptionRequired.yes : t.exam.subscriptionRequired.no),
    },
    {
      key: "registration",
      header: t.exam.adminList.columns.registration,
      render: (row) =>
        row.registrationStartAt || row.registrationEndAt
          ? `${formatExamDateTime(row.registrationStartAt)} — ${formatExamDateTime(row.registrationEndAt)}`
          : t.exam.detail.notScheduled,
    },
    {
      key: "publishAt",
      header: t.exam.adminList.columns.publishAt,
      render: (row) => (row.publishAt ? formatExamDateTime(row.publishAt) : t.exam.detail.notScheduled),
    },
    {
      key: "actions",
      header: t.exam.adminList.columns.actions,
      render: (row) => (
        <div className={styles.actions}>
          {row.status === "DRAFT" && (
            <>
              <ButtonLink href={`/admin/exams/${row.id}/edit`} variant="secondary" size="sm">
                {t.exam.adminList.actions.edit}
              </ButtonLink>
              <Button
                size="sm"
                onClick={() => void handlePublish(row)}
                loading={actioningId === row.id}
                disabled={actioningId !== null}
              >
                {t.exam.adminList.actions.publish}
              </Button>
            </>
          )}
          {row.status === "PUBLISHED" && (
            <>
              <ButtonLink href={`/admin/exams/${row.id}`} variant="secondary" size="sm">
                {t.exam.adminList.actions.view}
              </ButtonLink>
              <Button
                variant="danger"
                size="sm"
                onClick={() => void handleArchive(row)}
                loading={actioningId === row.id}
                disabled={actioningId !== null}
              >
                {t.exam.adminList.actions.archive}
              </Button>
            </>
          )}
          {row.status === "ARCHIVED" && (
            <ButtonLink href={`/admin/exams/${row.id}`} variant="secondary" size="sm">
              {t.exam.adminList.actions.view}
            </ButtonLink>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className={styles.skeletonRows}>
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
    return <EmptyState title={t.exam.adminList.empty} />;
  }

  return (
    <div className={styles.section}>
      <Table columns={columns} rows={data.content} getRowKey={(row) => row.id} emptyMessage={t.exam.adminList.empty} />
      {data.totalPages > 1 && (
        <div className={styles.footer}>
          <Pagination page={pageIndex + 1} totalPages={data.totalPages} onPageChange={(page) => setPageIndex(page - 1)} />
        </div>
      )}
    </div>
  );
}
