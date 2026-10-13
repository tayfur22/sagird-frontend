"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { adminDashboardApi } from "@/lib/admin/admin-api";
import { formatRevenueByCurrency } from "@/lib/admin/format";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useLocale, useTranslation } from "@/lib/i18n/LocaleProvider";
import { formatCount } from "@/lib/statistics/format";
import type { AdminDashboardOverviewResponse } from "@/types/admin";

/**
 * Platform snapshot (GET /api/v1/admin/dashboard/overview). Zero counts are
 * a normal state and render as "0", never as an error.
 */
export function AdminDashboardOverview() {
  const t = useTranslation();
  const { locale } = useLocale();
  const c = t.admin.dashboard.cards;
  const h = t.admin.dashboard.hints;

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
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-solid border-blue-600 border-t-transparent rounded-full animate-spin" />
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

  const cards: { label: string; value: string; valueClass: string; hint?: string; hintClass?: string }[] = [
    { label: c.totalStudents, value: formatCount(data.totalStudents, locale), valueClass: "text-blue-400", hint: h.students, hintClass: "text-emerald-400" },
    { label: c.totalExams, value: formatCount(data.totalExams, locale), valueClass: "text-emerald-400", hint: h.exams, hintClass: "text-slate-400" },
    { label: c.activeSubscriptions, value: formatCount(data.activeSubscriptions, locale), valueClass: "text-amber-400", hint: h.subscriptions, hintClass: "text-slate-400" },
    {
      label: c.revenue,
      value: revenueLines.length > 0 ? revenueLines.join(" · ") : t.admin.dashboard.noRevenue,
      valueClass: "text-purple-400",
    },
    { label: c.publishedExams, value: formatCount(data.publishedExams, locale), valueClass: "text-emerald-400" },
    { label: c.submittedAttempts, value: formatCount(data.submittedAttempts, locale), valueClass: "text-blue-400" },
    { label: c.totalPayments, value: formatCount(data.totalPayments, locale), valueClass: "text-amber-400" },
    { label: c.successfulPayments, value: formatCount(data.successfulPayments, locale), valueClass: "text-purple-400" },
  ];

  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 m-0" aria-label={t.admin.dashboard.title}>
      {cards.map((card) => (
        <div key={card.label} className="bg-slate-900 border border-solid border-slate-800 rounded-2xl p-6 min-w-0">
          <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.label}</dt>
          <dd className={`m-0 text-2xl font-extrabold mt-2 break-words ${card.valueClass}`}>{card.value}</dd>
          {card.hint && <dd className={`m-0 text-xs mt-1 inline-block ${card.hintClass}`}>{card.hint}</dd>}
        </div>
      ))}
    </dl>
  );
}
