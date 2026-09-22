"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { SubscriptionCard } from "@/components/subscription/SubscriptionCard";
import { SubscriptionHistoryTable } from "@/components/subscription/SubscriptionHistoryTable";
import { PaymentHistorySection } from "@/components/payment/PaymentHistorySection";
import { SubscriptionCheckout } from "@/components/payment/SubscriptionCheckout";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { subscriptionApi } from "@/lib/subscription/subscription-api";
import { t } from "@/lib/i18n/t";
import type { CurrentSubscriptionResponse, SubscriptionResponse } from "@/types/subscription";
import styles from "./page.module.css";

interface PageState {
  current: CurrentSubscriptionResponse;
  history: SubscriptionResponse[];
}

export default function StudentSubscriptionPage() {
  const [state, setState] = useState<PageState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryToken, setRetryToken] = useState(0);
  // Bumped after a payment reaches SUCCEEDED so the payment history section reloads.
  const [paymentRefreshSignal, setPaymentRefreshSignal] = useState(0);

  const retry = () => {
    setLoading(true);
    setError(null);
    setRetryToken((value) => value + 1);
  };

  useEffect(() => {
    let cancelled = false;

    Promise.all([subscriptionApi.getCurrent(), subscriptionApi.getHistory()])
      .then(([current, history]) => {
        if (cancelled) return;
        setState({ current, history });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(apiErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [retryToken]);

  // Re-fetches subscription state without the full-page loading/skeleton flash,
  // so a successful payment can flip the page over to the active subscription smoothly.
  async function refreshSubscriptionData() {
    try {
      const [current, history] = await Promise.all([subscriptionApi.getCurrent(), subscriptionApi.getHistory()]);
      setState({ current, history });
    } catch {
      // Transient failure: the page keeps showing its last known state; the
      // student can still use the page-level retry if the initial load failed.
    }
  }

  function handlePaymentActivated() {
    void refreshSubscriptionData();
    setPaymentRefreshSignal((value) => value + 1);
  }

  const current = state?.current.current ?? null;
  const grantsAccessOrUpcoming = current !== null && (state?.current.hasActiveSubscription || current.upcoming);

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.heading}>{t.subscription.title}</h1>
        <p className={styles.subtitle}>{t.subscription.subtitle}</p>
      </div>

      {loading && (
        <Card>
          <div className={styles.skeletonCard}>
            <Skeleton width={140} height={22} />
            <Skeleton width="60%" height={16} />
            <Skeleton width="40%" height={16} />
          </div>
        </Card>
      )}

      {!loading && error && (
        <Alert variant="error" title={t.common.error}>
          <p>{error}</p>
          <Button variant="secondary" size="sm" onClick={retry} style={{ marginTop: "var(--space-3)" }}>
            {t.common.retry}
          </Button>
        </Alert>
      )}

      {!loading && !error && state && (
        <>
          <section className={styles.section}>
            {grantsAccessOrUpcoming && current ? (
              <SubscriptionCard subscription={current} />
            ) : (
              <>
                {current && <SubscriptionCard subscription={current} />}
                <SubscriptionCheckout onActivated={handlePaymentActivated} />
              </>
            )}
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t.subscription.history.title}</h2>
            <SubscriptionHistoryTable items={state.history} />
          </section>

          <section className={styles.section}>
            <PaymentHistorySection refreshSignal={paymentRefreshSignal} />
          </section>
        </>
      )}
    </div>
  );
}