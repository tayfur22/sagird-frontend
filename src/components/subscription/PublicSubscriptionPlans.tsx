"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { SubscriptionCard } from "@/components/subscription/SubscriptionCard";
import { SubscriptionCheckout } from "@/components/payment/SubscriptionCheckout";
import { useAuth } from "@/lib/auth/AuthProvider";
import { formatExamPrice } from "@/lib/exam/format";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import { publicSubscriptionApi, subscriptionApi } from "@/lib/subscription/subscription-api";
import type { CurrentSubscriptionResponse, PublicSubscriptionPlanResponse } from "@/types/subscription";
import styles from "./PublicSubscriptionPlans.module.css";

/**
 * Public /subscriptions: the plan (price from the backend config) is visible
 * to everyone. Only a signed-in student additionally sees their own state
 * (active / expired / none) and the existing checkout - nothing personal is
 * requested for anonymous visitors. Payment itself is the existing
 * SubscriptionCheckout (paymentApi.create), not a new flow.
 */
export function PublicSubscriptionPlans() {
  const t = useTranslation();
  const s = t.subscription.public;
  const { status, user } = useAuth();
  const isStudent = status === "authenticated" && user?.role === "STUDENT";

  const [plan, setPlan] = useState<PublicSubscriptionPlanResponse | null>(null);
  const [current, setCurrent] = useState<CurrentSubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const authResolved = status !== "loading";

  useEffect(() => {
    if (!authResolved) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      publicSubscriptionApi.getPlans(),
      isStudent ? subscriptionApi.getCurrent() : Promise.resolve(null),
    ])
      .then(([plans, currentResponse]) => {
        if (cancelled) return;
        setPlan(plans.find((p) => p.plan === "MONTHLY") ?? plans[0] ?? null);
        setCurrent(currentResponse);
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
  }, [isStudent, authResolved, retryToken]);

  async function refreshCurrent() {
    try {
      setCurrent(await subscriptionApi.getCurrent());
    } catch {
      // Keep the last known state; the student can reload.
    }
  }

  if (loading || !authResolved) {
    return (
      <Card>
        <div className={styles.skeleton}>
          <Skeleton width="40%" height={24} />
          <Skeleton width="30%" height={36} />
          <Skeleton width="80%" height={16} />
          <Skeleton width="70%" height={16} />
        </div>
      </Card>
    );
  }

  if (error || !plan) {
    return (
      <Alert variant="error" title={t.common.error}>
        <p>{error ?? t.errors.GENERIC}</p>
        <Button variant="secondary" size="sm" onClick={() => setRetryToken((v) => v + 1)} style={{ marginTop: "var(--space-3)" }}>
          {t.common.retry}
        </Button>
      </Alert>
    );
  }

  const subscription = current?.current ?? null;
  // An upcoming (paid, not yet started) subscription counts as "has one": no second checkout.
  const active = subscription !== null && (current?.hasActiveSubscription === true || subscription.upcoming);
  const expired = !active && subscription !== null && (subscription.status === "EXPIRED" || subscription.status === "CANCELLED");
  const loginNext = `/login?next=${encodeURIComponent("/subscriptions")}`;
  const features = [s.features.weekly, s.features.results, s.features.statistics];

  function renderAction() {
    if (status !== "authenticated") return <ButtonLink href={loginNext} fullWidth>{s.getSubscription}</ButtonLink>;
    if (!isStudent) return null;
    if (active) return <ButtonLink href="/exams" fullWidth>{s.browseExams}</ButtonLink>;
    return (
      <Button fullWidth onClick={() => setCheckoutOpen(true)} aria-expanded={checkoutOpen}>
        {expired ? s.renew : s.getSubscription}
      </Button>
    );
  }

  return (
    <div className={styles.wrap}>
      {isStudent && subscription && (
        <section aria-labelledby="my-subscription">
          <h2 id="my-subscription" className={styles.sectionTitle}>
            {active ? s.stateActive : expired ? s.stateExpired : s.stateNone}
          </h2>
          <SubscriptionCard subscription={subscription} />
        </section>
      )}

      <Card className={styles.planCard}>
        <div className={styles.planHeader}>
          <h2 className={styles.planName}>{t.subscription.plans[plan.plan]}</h2>
          <p className={styles.price}>
            <span className={styles.amount}>{formatExamPrice(plan.amount, plan.currency)}</span>
            <span className={styles.period}> / {s.perMonth}</span>
          </p>
        </div>

        <ul className={styles.features}>
          {features.map((feature) => (
            <li key={feature} className={styles.feature}>
              <span aria-hidden="true" className={styles.check}>✓</span>
              {feature}
            </li>
          ))}
        </ul>

        {renderAction()}
      </Card>

      {isStudent && !active && checkoutOpen && <SubscriptionCheckout onActivated={() => void refreshCurrent()} />}

      <Alert variant="info" title={s.noteTitle}>
        {s.note}
      </Alert>
    </div>
  );
}
