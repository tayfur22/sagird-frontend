"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatCard, StatCardGrid } from "@/components/statistics/StatCard";
import { adminDashboardApi } from "@/lib/admin/admin-api";
import { formatRevenueByCurrency } from "@/lib/admin/format";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useLocale, useTranslation } from "@/lib/i18n/LocaleProvider";
import { formatCount } from "@/lib/statistics/format";
import type { AdminDashboardOverviewResponse } from "@/types/admin";
import styles from "./AdminDashboardOverview.module.css";

/**
 * Platform snapshot (GET /api/v1/admin/dashboard/overview). Zero counts are
 * a normal state and render as "0", never as an error.
 */
export function AdminDashboardOverview() {
  const t = useTranslation();
  const { locale } = useLocale();
  const c = t.admin.dashboard.cards;

  const [data, setData] = useState<AdminDashboardOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    adminDashboardApi
      .getOverview()
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
  }, [retryToken]);

  if (loading) {
    return (
      <div className={styles.skeletonGrid}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} height={88} rounded />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title={t.common.error}>
        <p>{error}</p>
        <Button variant="secondary" size="sm" onClick={() => setRetryToken((v) => v + 1)} style={{ marginTop: "var(--space-3)" }}>
          {t.common.retry}
        </Button>
      </Alert>
    );
  }

  if (!data) return null;

  const revenueLines = formatRevenueByCurrency(data.revenueByCurrency);

  return (
    <StatCardGrid label={t.admin.dashboard.title}>
      <StatCard label={c.totalStudents} value={formatCount(data.totalStudents, locale)} />
      <StatCard label={c.totalExams} value={formatCount(data.totalExams, locale)} />
      <StatCard label={c.publishedExams} value={formatCount(data.publishedExams, locale)} />
      <StatCard label={c.activeSubscriptions} value={formatCount(data.activeSubscriptions, locale)} />
      <StatCard label={c.submittedAttempts} value={formatCount(data.submittedAttempts, locale)} />
      <StatCard label={c.totalPayments} value={formatCount(data.totalPayments, locale)} />
      <StatCard label={c.successfulPayments} value={formatCount(data.successfulPayments, locale)} />
      <StatCard
        label={c.revenue}
        value={revenueLines.length > 0 ? revenueLines.join(" · ") : t.admin.dashboard.noRevenue}
      />
    </StatCardGrid>
  );
}
