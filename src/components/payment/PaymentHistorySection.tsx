"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { Table, type TableColumn } from "@/components/ui/Table";
import { formatAmount, formatPaymentDate, providerLabel } from "@/lib/payment/format";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { paymentApi } from "@/lib/payment/payment-api";
import { t } from "@/lib/i18n/t";
import type { PageResponse } from "@/types/api";
import type { PaymentResponse } from "@/types/payment";
import { PaymentDetailModal } from "./PaymentDetailModal";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import styles from "./PaymentHistorySection.module.css";

const PAGE_SIZE = 10;

/**
 * The student's own payment history (GET /api/v1/payments/me), using the
 * backend's real pagination - no client-side fake paging. `refreshSignal`
 * lets the parent ask for a reload (e.g. after a payment reaches SUCCEEDED)
 * without this component needing to know why.
 */
export function PaymentHistorySection({ refreshSignal }: { refreshSignal: number }) {
  const [pageIndex, setPageIndex] = useState(0);
  const [data, setData] = useState<PageResponse<PaymentResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentResponse | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  // A new payment lands on page 1, so jump back there whenever the parent signals a refresh.
  useEffect(() => {
    setPageIndex(0);
  }, [refreshSignal]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    paymentApi
      .getHistory(pageIndex, PAGE_SIZE)
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
  }, [pageIndex, refreshSignal, retryToken]);

  const columns: TableColumn<PaymentResponse>[] = [
    { key: "amount", header: t.payment.history.columns.amount, render: (row) => formatAmount(row.amount, row.currency) },
    { key: "status", header: t.payment.history.columns.status, render: (row) => <PaymentStatusBadge status={row.status} /> },
    { key: "provider", header: t.payment.history.columns.provider, render: (row) => providerLabel(row.provider) },
    { key: "date", header: t.payment.history.columns.date, render: (row) => formatPaymentDate(row.createdAt) },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <Button variant="ghost" size="sm" onClick={() => setSelectedPayment(row)}>
          {t.payment.history.viewDetails}
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.section}>
      <h2 style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)" }}>
        {t.payment.history.title}
      </h2>

      {loading && (
        <div className={styles.skeletonRow}>
          <Skeleton height={40} />
          <Skeleton height={40} />
          <Skeleton height={40} />
        </div>
      )}

      {!loading && error && (
        <Alert variant="error" title={t.common.error}>
          <p>{error}</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setRetryToken((value) => value + 1)}
            style={{ marginTop: "var(--space-3)" }}
          >
            {t.common.retry}
          </Button>
        </Alert>
      )}

      {!loading && !error && data && (
        <>
          <Table columns={columns} rows={data.content} getRowKey={(row) => row.id} emptyMessage={t.payment.history.empty} />
          {data.totalPages > 1 && (
            <div className={styles.footer}>
              <Pagination page={pageIndex + 1} totalPages={data.totalPages} onPageChange={(page) => setPageIndex(page - 1)} />
            </div>
          )}
        </>
      )}

      <PaymentDetailModal payment={selectedPayment} onClose={() => setSelectedPayment(null)} />
    </div>
  );
}