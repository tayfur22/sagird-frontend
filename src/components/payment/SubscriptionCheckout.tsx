"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, type AlertVariant } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/hooks/useToast";
import { generateIdempotencyKey } from "@/lib/payment/idempotency";
import { formatAmount } from "@/lib/payment/format";
import { paymentApi } from "@/lib/payment/payment-api";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { PaymentResponse, PaymentStatus } from "@/types/payment";
import { PaymentStatusBadge } from "./PaymentStatusBadge";
import styles from "./SubscriptionCheckout.module.css";

interface StatusPanel {
  variant: AlertVariant;
  title: string;
  description: string;
}

/**
 * Built fresh from the active dictionary on every call instead of a
 * module-scope constant, so the panel text is never frozen to whichever
 * locale happened to be active when this module first evaluated.
 */
function buildStatusPanels(dictionary: ReturnType<typeof useTranslation>): Record<PaymentStatus, StatusPanel> {
  return {
    PENDING: { variant: "info", title: dictionary.payment.pending.title, description: dictionary.payment.pending.description },
    PROCESSING: { variant: "info", title: dictionary.payment.processing.title, description: dictionary.payment.processing.description },
    SUCCEEDED: { variant: "success", title: dictionary.payment.succeeded.title, description: dictionary.payment.succeeded.description },
    FAILED: { variant: "error", title: dictionary.payment.failed.title, description: dictionary.payment.failed.description },
    CANCELLED: { variant: "warning", title: dictionary.payment.cancelled.title, description: dictionary.payment.cancelled.description },
    REFUNDED: { variant: "info", title: dictionary.payment.statuses.REFUNDED, description: "" },
  };
}

const REFRESHABLE: PaymentStatus[] = ["PENDING", "PROCESSING"];
const RETRYABLE: PaymentStatus[] = ["FAILED", "CANCELLED"];

/**
 * Starts a payment for the MONTHLY plan and shows its real backend status
 * until it reaches a terminal state. There is no provider selected yet (see
 * PaymentGateway), so nothing here can move a PENDING payment forward on its
 * own - the student can only refresh to see whether it has been confirmed
 * out of band (e.g. by an admin, in development). Only rendered by the
 * subscription page while the student has no active subscription.
 */
export function SubscriptionCheckout({ onActivated }: { onActivated: () => void }) {
  const t = useTranslation();
  const { showToast } = useToast();
  const [payment, setPayment] = useState<PaymentResponse | null>(null);
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Guards against a second payment being created by a rapid double click,
  // independent of the (slightly later) `creating` state update.
  const submittingRef = useRef(false);
  const idempotencyKeyRef = useRef(generateIdempotencyKey());
  const activatedRef = useRef(false);

  useEffect(() => {
    if (payment?.status === "SUCCEEDED" && !activatedRef.current) {
      activatedRef.current = true;
      showToast(t.payment.subscriptionActivated, "success");
      onActivated();
    }
  }, [payment?.status, onActivated, showToast]);

  async function handleSubscribe() {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setCreating(true);
    setCreateError(null);
    try {
      const created = await paymentApi.create({ plan: "MONTHLY", idempotencyKey: idempotencyKeyRef.current });
      setPayment(created);
    } catch (error) {
      setCreateError(apiErrorMessage(error));
    } finally {
      setCreating(false);
      submittingRef.current = false;
    }
  }

  async function handleRefresh() {
    if (!payment || refreshing) return;
    setRefreshing(true);
    try {
      const latest = await paymentApi.getById(payment.id);
      setPayment(latest);
    } catch (error) {
      // Transient refresh failure: keep showing the last known state.
      showToast(apiErrorMessage(error), "error");
    } finally {
      setRefreshing(false);
    }
  }

  function handleRetry() {
    idempotencyKeyRef.current = generateIdempotencyKey();
    activatedRef.current = false;
    setCreateError(null);
    setPayment(null);
  }

  if (!payment) {
    return (
      <Card title={t.payment.checkoutTitle} className={styles.card}>
        <p className={styles.subtitle}>{t.payment.checkoutSubtitle}</p>
        <div className={styles.planRow}>
          <span>{t.payment.planLabel}</span>
          <span className={styles.planLabel}>{t.subscription.plans.MONTHLY}</span>
        </div>
        {createError && (
          <Alert variant="error" title={t.payment.createFailedTitle}>
            {createError}
          </Alert>
        )}
        <Button onClick={handleSubscribe} loading={creating} disabled={creating} fullWidth>
          {t.payment.subscribeButton}
        </Button>
      </Card>
    );
  }

  const panel = buildStatusPanels(t)[payment.status];

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <span className={styles.planLabel}>{t.subscription.plans[payment.plan]}</span>
        <PaymentStatusBadge status={payment.status} />
      </div>

      <div className={styles.amountRow}>
        <span>{t.payment.amountLabel}</span>
        <span className={styles.amountValue}>{formatAmount(payment.amount, payment.currency)}</span>
      </div>

      <Alert variant={panel.variant} title={panel.title}>
        {panel.description}
      </Alert>

      {REFRESHABLE.includes(payment.status) && (
        <Button variant="secondary" onClick={handleRefresh} loading={refreshing} disabled={refreshing} fullWidth>
          {t.payment.refreshStatus}
        </Button>
      )}

      {RETRYABLE.includes(payment.status) && (
        <Button variant="secondary" onClick={handleRetry} fullWidth>
          {t.payment.retryPayment}
        </Button>
      )}
    </Card>
  );
}