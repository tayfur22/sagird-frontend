"use client";

import { useEffect, useRef, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/errors";
import { formatExamPrice } from "@/lib/exam/format";
import { generateIdempotencyKey } from "@/lib/payment/idempotency";
import { paymentApi } from "@/lib/payment/payment-api";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { PaymentResponse } from "@/types/payment";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import styles from "./ExamPaymentPanel.module.css";

const POLL_MS = 5000;

/**
 * One-time payment for one exam. The price shown is only a label: the
 * request carries no amount or user (POST /payments/exams/{examId}), the
 * backend prices it from the exam and takes the user from the token. All
 * states come from the backend PaymentStatus; access itself is re-checked by
 * the backend on every start. Builds on the same paymentApi / idempotency /
 * status badge as SubscriptionCheckout (which stays subscription-specific).
 *
 * Calls `onPaid(alreadyPaid)` once the payment is SUCCEEDED (or the backend
 * reports it was already paid), so the parent can switch to "Start exam".
 */
export function ExamPaymentPanel({
  examId,
  price,
  currency,
  initialPayment,
  onPaid,
}: {
  examId: string;
  price: number;
  currency: string;
  initialPayment: PaymentResponse | null;
  onPaid: (alreadyPaid: boolean) => void;
}) {
  const t = useTranslation();
  const p = t.exam.payment;

  const [payment, setPayment] = useState<PaymentResponse | null>(initialPayment);
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Blocks a second request from a rapid double click before `creating` re-renders.
  const submittingRef = useRef(false);
  // Reused for network-error retries (replaying the same key is safe); renewed only for a brand-new attempt.
  const idempotencyKeyRef = useRef(generateIdempotencyKey());
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (payment?.status === "SUCCEEDED" && !notifiedRef.current) {
      notifiedRef.current = true;
      onPaid(false);
    }
  }, [payment?.status, onPaid]);

  const open = payment?.status === "PENDING" || payment?.status === "PROCESSING";

  // While a payment is unresolved, keep the status fresh so success is picked up without a manual refresh.
  useEffect(() => {
    if (!open || !payment) return;
    const id = payment.id;
    const timer = window.setInterval(() => {
      paymentApi
        .getById(id)
        .then(setPayment)
        .catch(() => {
          // Transient: the next tick or the manual refresh button tries again.
        });
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [open, payment?.id]);

  async function handlePay() {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setCreating(true);
    setError(null);
    try {
      setPayment(await paymentApi.createForExam(examId, { idempotencyKey: idempotencyKeyRef.current }));
    } catch (err: unknown) {
      if (ApiError.isApiError(err) && err.code === "EXAM_ALREADY_PAID") {
        notifiedRef.current = true;
        onPaid(true);
        return;
      }
      setError(apiErrorMessage(err));
    } finally {
      setCreating(false);
      submittingRef.current = false;
    }
  }

  async function handleRefresh() {
    if (!payment || refreshing) return;
    setRefreshing(true);
    try {
      setPayment(await paymentApi.getById(payment.id));
    } catch (err: unknown) {
      setError(apiErrorMessage(err));
    } finally {
      setRefreshing(false);
    }
  }

  function handleRetry() {
    idempotencyKeyRef.current = generateIdempotencyKey();
    notifiedRef.current = false;
    setError(null);
    setPayment(null);
  }

  if (payment?.status === "SUCCEEDED") return null;

  if (payment && open) {
    return (
      <div className={styles.panel}>
        <div className={styles.row}>
          <span>{formatExamPrice(payment.amount, payment.currency)}</span>
          <PaymentStatusBadge status={payment.status} />
        </div>
        <Alert variant="info" title={payment.status === "PROCESSING" ? t.payment.processing.title : t.payment.pending.title}>
          {payment.status === "PROCESSING" ? t.payment.processing.description : t.payment.pending.description}
        </Alert>
        {error && (
          <Alert variant="error" title={t.common.error}>
            {error}
          </Alert>
        )}
        <Button variant="secondary" onClick={() => void handleRefresh()} loading={refreshing} disabled={refreshing}>
          {t.payment.refreshStatus}
        </Button>
      </div>
    );
  }

  if (payment) {
    // FAILED / CANCELLED / REFUNDED: the exam is still locked; offer a fresh attempt.
    return (
      <div className={styles.panel}>
        <Alert variant="error" title={p.failedTitle}>
          {p.failedBody}
        </Alert>
        <Button onClick={handleRetry}>{p.retry}</Button>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.row}>
        <span>{p.amountLabel}</span>
        <strong>{formatExamPrice(price, currency)}</strong>
      </div>
      {error && (
        <Alert variant="error" title={p.createFailedTitle}>
          {error}
        </Alert>
      )}
      <Button onClick={() => void handlePay()} loading={creating} disabled={creating} aria-busy={creating || undefined}>
        {creating ? p.preparing : p.payAndStart}
      </Button>
    </div>
  );
}
