"use client";

import { useEffect, useState } from "react";
import { ButtonLink, Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { Table, type TableColumn } from "@/components/ui/Table";
import { useToast } from "@/hooks/useToast";
import { adminExamApi } from "@/lib/exam/exam-api";
import { adminMonitoringApi } from "@/lib/admin/admin-api";
import { formatDurationMinutes, formatExamDateTime, formatExamPrice } from "@/lib/exam/format";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useLocale, useTranslation } from "@/lib/i18n/LocaleProvider";
import { formatCount } from "@/lib/statistics/format";
import type { PageResponse } from "@/types/api";
import type { AdminExamSummaryResponse } from "@/types/admin";
import type { ExamStatus } from "@/types/exam";
import { ExamStatusBadge } from "./ExamStatusBadge";
import { ExamTypeBadge } from "./ExamTypeBadge";
import styles from "./AdminExamTable.module.css";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;
const STATUSES: ExamStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

/**
 * The admin exam list. Reads from the Phase 17A monitoring endpoint
 * (GET /api/v1/admin/exams with optional search/status + aggregate fields)
 * instead of the plain adminExamApi.getAll - same path, superset response -
 * so search/filtering and the question/participation counts are available
 * without touching the create/edit/publish/archive flow, which still goes
 * through adminExamApi (Phase 5A). The status-gated actions are unchanged:
 * DRAFT can be edited or published, PUBLISHED can only be archived, ARCHIVED
 * is view-only. Publish/archive merge the updated ExamResponse fields into
 * the existing summary row in place instead of a full reload, so the
 * aggregate counts aren't lost.
 */
export function AdminExamTable() {
  const t = useTranslation();
  const { locale } = useLocale();
  const { showToast } = useToast();

  const [pageIndex, setPageIndex] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ExamStatus | "">("");

  const [data, setData] = useState<PageResponse<AdminExamSummaryResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPageIndex(0);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    adminMonitoringApi
      .getExams(pageIndex, PAGE_SIZE, { search: search || undefined, status: status || undefined })
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
  }, [pageIndex, search, status, retryToken]);

  function mergeRow(examId: string, updated: Partial<AdminExamSummaryResponse>) {
    setData((current) =>
      current
        ? { ...current, content: current.content.map((exam) => (exam.id === examId ? { ...exam, ...updated } : exam)) }
        : current
    );
  }

  async function handlePublish(exam: AdminExamSummaryResponse) {
    setActioningId(exam.id);
    try {
      const updated = await adminExamApi.publish(exam.id);
      mergeRow(exam.id, updated);
      showToast(t.exam.toasts.published, "success");
    } catch (err) {
      showToast(apiErrorMessage(err), "error");
    } finally {
      setActioningId(null);
    }
  }

  async function handleArchive(exam: AdminExamSummaryResponse) {
    setActioningId(exam.id);
    try {
      const updated = await adminExamApi.archive(exam.id);
      mergeRow(exam.id, updated);
      showToast(t.exam.toasts.archived, "success");
    } catch (err) {
      showToast(apiErrorMessage(err), "error");
    } finally {
      setActioningId(null);
    }
  }

  const statusOptions = [
    { value: "", label: t.admin.exams.allStatuses },
    ...STATUSES.map((value) => ({ value, label: t.exam.statuses[value] })),
  ];

  const columns: TableColumn<AdminExamSummaryResponse>[] = [
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
      key: "questionCount",
      header: t.admin.exams.columns.questionCount,
      render: (row) => formatCount(row.questionCount, locale),
    },
    {
      key: "submittedAttempts",
      header: t.admin.exams.columns.submittedAttempts,
      render: (row) => formatCount(row.submittedAttempts, locale),
    },
    {
      key: "uniqueParticipants",
      header: t.admin.exams.columns.uniqueParticipants,
      render: (row) => formatCount(row.uniqueParticipants, locale),
    },
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

  return (
    <div className={styles.section}>
      <div className={styles.filters}>
        <Input
          label={t.admin.exams.searchLabel}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder={t.admin.exams.searchPlaceholder}
        />
        <Select
          label={t.exam.adminList.columns.status}
          options={statusOptions}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as ExamStatus | "");
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

      {!loading && !error && data && data.content.length === 0 && <EmptyState title={t.exam.adminList.empty} />}

      {!loading && !error && data && data.content.length > 0 && (
        <>
          <Table columns={columns} rows={data.content} getRowKey={(row) => row.id} emptyMessage={t.exam.adminList.empty} />
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
