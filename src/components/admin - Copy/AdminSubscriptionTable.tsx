"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { Table, type TableColumn } from "@/components/ui/Table";
import { AdminSubscriptionStatusBadge } from "./AdminSubscriptionStatusBadge";
import { adminMonitoringApi } from "@/lib/admin/admin-api";
import { formatExamDateTime } from "@/lib/exam/format";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { PageResponse } from "@/types/api";
import type { AdminSubscriptionItemResponse } from "@/types/admin";
import type { SubscriptionStatus } from "@/types/subscription";
import styles from "./AdminTable.module.css";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;
const STATUSES: SubscriptionStatus[] = ["ACTIVE", "EXPIRED", "CANCELLED"];

/** Admin subscriptions list (GET /api/v1/admin/subscriptions), server-side paginated/searched/filtered. */
export function AdminSubscriptionTable() {
  const t = useTranslation();

  const [pageIndex, setPageIndex] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SubscriptionStatus | "">("");

  const [data, setData] = useState<PageResponse<AdminSubscriptionItemResponse> | null>(null);
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

    adminMonitoringApi
      .getSubscriptions(pageIndex, PAGE_SIZE, { search: search || undefined, status: status || undefined })
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

  const statusOptions = [
    { value: "", label: t.admin.subscriptions.allStatuses },
    ...STATUSES.map((value) => ({ value, label: t.subscription.statuses[value] })),
  ];

  const columns: TableColumn<AdminSubscriptionItemResponse>[] = [
    {
      key: "student",
      header: t.admin.subscriptions.columns.student,
      render: (row) =>
        row.student.fullName ? (
          <ButtonLink href={`/admin/students/${row.student.id}`} variant="ghost" size="sm">
            {row.student.fullName}
          </ButtonLink>
        ) : (
          "—"
        ),
    },
    { key: "plan", header: t.admin.subscriptions.columns.plan, render: (row) => t.subscription.plans[row.plan] },
    {
      key: "status",
      header: t.admin.subscriptions.columns.status,
      render: (row) => <AdminSubscriptionStatusBadge status={row.status} />,
    },
    { key: "startAt", header: t.admin.subscriptions.columns.startDate, render: (row) => formatExamDateTime(row.startAt) },
    { key: "endAt", header: t.admin.subscriptions.columns.endDate, render: (row) => formatExamDateTime(row.endAt) },
    {
      key: "createdAt",
      header: t.admin.subscriptions.columns.createdAt,
      render: (row) => formatExamDateTime(row.createdAt),
    },
  ];

  return (
    <div className={styles.section}>
      <div className={styles.filters}>
        <Input
          label={t.admin.subscriptions.searchLabel}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder={t.admin.subscriptions.searchPlaceholder}
        />
        <Select
          label={t.admin.subscriptions.statusFilterLabel}
          options={statusOptions}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as SubscriptionStatus | "");
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

      {!loading && !error && data && data.content.length === 0 && <EmptyState title={t.admin.subscriptions.empty} />}

      {!loading && !error && data && data.content.length > 0 && (
        <>
          <Table columns={columns} rows={data.content} getRowKey={(row) => row.id} emptyMessage={t.admin.subscriptions.empty} />
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
