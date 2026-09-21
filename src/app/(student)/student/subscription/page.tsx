"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { SubscriptionCard } from "@/components/subscription/SubscriptionCard";
import { SubscriptionHistoryTable } from "@/components/subscription/SubscriptionHistoryTable";
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
            {state.current.current ? (
              <SubscriptionCard subscription={state.current.current} />
            ) : (
              <EmptyState
                title={t.subscription.noSubscription.title}
                description={t.subscription.noSubscription.description}
              />
            )}
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t.subscription.history.title}</h2>
            <SubscriptionHistoryTable items={state.history} />
          </section>
        </>
      )}
    </div>
  );
}