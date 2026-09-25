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
import { PaymentStatusBadge } from "@/components/payment/PaymentStatusBadge";
import { adminMonitoringApi } from "@/lib/admin/admin-api";
import { formatAmount, providerLabel } from "@/lib/payment/format";
import { formatExamDateTime } from "@/lib/exam/format";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { PageResponse } from "@/types/api";
import type { AdminPaymentItemResponse } from "@/types/admin";
import type { PaymentStatus } from "@/types/payment";
import styles from "./AdminTable.module.css";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;
const STATUSES: PaymentStatus[] = ["PENDING", "PROCESSING", "SUCCEEDED", "FAILED", "CANCELLED", "REFUNDED"];

/**
 * Admin payments list (GET /api/v1/admin/payments), server-side
 * paginated/searched/filtered. Never renders gateway identifiers or card
 * data - the backend response doesn't carry any.
 */
export function AdminPaymentTable() {
  const t = useTranslation();

  const [pageIndex, setPageIndex] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PaymentStatus | "">("");

  const [data, setData] = useState<PageResponse<AdminPaymentItemResponse> | null>(null);
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
      .getPayments(pageIndex, PAGE_SIZE, { search: search || undefined, status: status || undefined })
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
    { value: "", label: t.admin.payments.allStatuses },
    ...STATUSES.map((value) => ({ value, label: t.payment.statuses[value] })),
  ];

  const columns: TableColumn<AdminPaymentItemResponse>[] = [
    {
      key: "student",
      header: t.admin.payments.columns.student,
      render: (row) =>
        row.student.fullName ? (
          <ButtonLink href={`/admin/students/${row.student.id}`} variant="ghost" size="sm">
            {row.student.fullName}
          </ButtonLink>
        ) : (
          "—"
        ),
    },
    { key: "amount", header: t.admin.payments.columns.amount, render: (row) => formatAmount(row.amount, row.currency) },
    { key: "status", header: t.admin.payments.columns.status, render: (row) => <PaymentStatusBadge status={row.status} /> },
    { key: "provider", header: t.admin.payments.columns.provider, render: (row) => providerLabel(row.provider) },
    {
      key: "createdAt",
      header: t.admin.payments.columns.createdAt,
      render: (row) => formatExamDateTime(row.createdAt),
    },
    {
      key: "completedAt",
      header: t.admin.payments.columns.completedAt,
      render: (row) => formatExamDateTime(row.completedAt),
    },
  ];

  return (
    <div className={styles.section}>
      <div className={styles.filters}>
        <Input
          label={t.admin.payments.searchLabel}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder={t.admin.payments.searchPlaceholder}
        />
        <Select
          label={t.admin.payments.statusFilterLabel}
          options={statusOptions}
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as PaymentStatus | "");
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

      {!loading && !error && data && data.content.length === 0 && <EmptyState title={t.admin.payments.empty} />}

      {!loading && !error && data && data.content.length > 0 && (
        <>
          <Table columns={columns} rows={data.content} getRowKey={(row) => row.id} emptyMessage={t.admin.payments.empty} />
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
