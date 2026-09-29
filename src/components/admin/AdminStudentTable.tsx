"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { Table, type TableColumn } from "@/components/ui/Table";
import { AdminSubscriptionStatusBadge } from "./AdminSubscriptionStatusBadge";
import { adminStudentApi } from "@/lib/admin/admin-api";
import { formatExamDateTime } from "@/lib/exam/format";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { PageResponse } from "@/types/api";
import type { AdminStudentSummaryResponse } from "@/types/admin";
import styles from "./AdminTable.module.css";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

/**
 * Admin students list (GET /api/v1/admin/students), server-side paginated
 * and searched. Mirrors QuestionTable's loading/error/empty/pagination shape.
 */
export function AdminStudentTable() {
  const t = useTranslation();

  const [pageIndex, setPageIndex] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [data, setData] = useState<PageResponse<AdminStudentSummaryResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

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

    adminStudentApi
      .getAll(pageIndex, PAGE_SIZE, search || undefined)
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
  }, [pageIndex, search, retryToken]);

  const columns: TableColumn<AdminStudentSummaryResponse>[] = [
    { key: "fullName", header: t.admin.students.columns.fullName, render: (row) => row.fullName },
    { key: "email", header: t.admin.students.columns.email, render: (row) => row.email },
    { key: "city", header: t.admin.students.columns.city, render: (row) => row.city ?? "—" },
    {
      key: "status",
      header: t.admin.students.columns.status,
      render: (row) => (
        <Badge variant={row.enabled ? "success" : "neutral"}>
          {row.enabled ? t.admin.students.statusEnabled : t.admin.students.statusDisabled}
        </Badge>
      ),
    },
    {
      key: "subscriptionStatus",
      header: t.admin.students.columns.subscriptionStatus,
      render: (row) =>
        row.subscriptionStatus ? (
          <AdminSubscriptionStatusBadge status={row.subscriptionStatus} />
        ) : (
          <span>{t.admin.students.noSubscription}</span>
        ),
    },
    { key: "createdAt", header: t.admin.students.columns.createdAt, render: (row) => formatExamDateTime(row.createdAt) },
    {
      key: "actions",
      header: t.admin.students.columns.actions,
      render: (row) => (
        <div className={styles.actions}>
          <ButtonLink href={`/admin/students/${row.id}`} variant="secondary" size="sm">
            {t.admin.students.actions.view}
          </ButtonLink>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.section}>
      <div className={styles.filters}>
        <Input
          label={t.admin.students.searchLabel}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder={t.admin.students.searchPlaceholder}
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

      {!loading && !error && data && data.content.length === 0 && <EmptyState title={t.admin.students.empty} />}

      {!loading && !error && data && data.content.length > 0 && (
        <>
          <Table columns={columns} rows={data.content} getRowKey={(row) => row.id} emptyMessage={t.admin.students.empty} />
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
