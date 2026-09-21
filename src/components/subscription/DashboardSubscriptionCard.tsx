"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { subscriptionApi } from "@/lib/subscription/subscription-api";
import { formatRemaining, formatSubscriptionDate } from "@/lib/subscription/format";
import { t } from "@/lib/i18n/t";
import type { CurrentSubscriptionResponse, SubscriptionResponse } from "@/types/subscription";
import { SubscriptionStatusBadge } from "./SubscriptionStatusBadge";
import styles from "./DashboardSubscriptionCard.module.css";

function dashboardHint(current: SubscriptionResponse): string {
  const texts = t.subscription.dashboard;
  if (current.active) {
    const remaining = formatRemaining(current.endAt);
    const until = texts.activeUntil.replace("{date}", formatSubscriptionDate(current.endAt));
    return remaining ? `${until} · ${remaining}` : until;
  }
  if (current.upcoming) {
    return texts.upcomingHint.replace("{date}", formatSubscriptionDate(current.startAt));
  }
  if (current.status === "CANCELLED") {
    return texts.cancelledHint;
  }
  return texts.inactiveHint;
}

/**
 * Compact subscription status shown on the student dashboard, with a link
 * through to the full /student/subscription page. Fetches independently so
 * a subscription error never blocks the rest of the dashboard.
 */
export function DashboardSubscriptionCard() {
  const [data, setData] = useState<CurrentSubscriptionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    subscriptionApi
      .getCurrent()
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
  }, []);

  if (loading) {
    return (
      <Card className={styles.wrapper}>
        <div className={styles.skeletonRow}>
          <Skeleton width={160} height={20} />
          <Skeleton width={220} height={14} />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="error" className={styles.wrapper}>
        {error}
      </Alert>
    );
  }

  const current = data?.current ?? null;

  return (
    <Card title={t.subscription.dashboard.cardTitle} className={styles.wrapper}>
      <div className={styles.row}>
        <div className={styles.info}>
          {current ? (
            <>
              <div className={styles.planLine}>
                <span>{t.subscription.plans[current.plan]}</span>
                <SubscriptionStatusBadge subscription={current} />
              </div>
              <span className={styles.detail}>{dashboardHint(current)}</span>
            </>
          ) : (
            <span className={styles.detail}>{t.subscription.dashboard.noneHint}</span>
          )}
        </div>
        <ButtonLink href="/student/subscription" variant="secondary" size="sm">
          {t.subscription.dashboard.viewDetails}
        </ButtonLink>
      </div>
    </Card>
  );
}