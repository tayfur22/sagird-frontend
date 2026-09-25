"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { SubscriptionStatusBadge } from "@/components/subscription/SubscriptionStatusBadge";
import { adminStudentApi } from "@/lib/admin/admin-api";
import { formatRevenueByCurrency } from "@/lib/admin/format";
import { ApiError } from "@/lib/api/errors";
import { formatExamDateTime } from "@/lib/exam/format";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useLocale, useTranslation } from "@/lib/i18n/LocaleProvider";
import { formatCount, formatPercentage } from "@/lib/statistics/format";
import type { AdminStudentDetailResponse } from "@/types/admin";
import styles from "./page.module.css";

/**
 * Read-only admin view of a single student (GET /api/v1/admin/students/{id}):
 * profile, current subscription, and the persisted attempt/payment summaries
 * the backend already computed - nothing here is re-aggregated client-side.
 */
export default function AdminStudentDetailPage() {
  const t = useTranslation();
  const { locale } = useLocale();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const p = t.admin.studentDetail;

  const [student, setStudent] = useState<AdminStudentDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);

    adminStudentApi
      .getById(id)
      .then((response) => {
        if (!cancelled) setStudent(response);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (ApiError.isApiError(err) && (err.status === 404 || err.code === "RESOURCE_NOT_FOUND")) {
          setNotFound(true);
        } else {
          setError(apiErrorMessage(err));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, retryToken]);

  return (
    <div className={styles.page}>
      <Link href="/admin/students" className={styles.backLink}>
        {p.backToList}
      </Link>

      {loading && (
        <Card>
          <div className={styles.skeleton}>
            <Skeleton width="50%" height={24} />
            <Skeleton width="80%" height={16} />
            <Skeleton width="60%" height={16} />
            <Skeleton width="40%" height={16} />
          </div>
        </Card>
      )}

      {!loading && notFound && <EmptyState title={p.notFound.title} description={p.notFound.description} />}

      {!loading && !notFound && error && (
        <Alert variant="error" title={t.common.error}>
          <p>{error}</p>
          <Button variant="secondary" size="sm" onClick={() => setRetryToken((v) => v + 1)} style={{ marginTop: "var(--space-3)" }}>
            {t.common.retry}
          </Button>
        </Alert>
      )}

      {!loading && !notFound && !error && student && (
        <>
          <div className={styles.header}>
            <div className={styles.titleRow}>
              <h1 className={styles.heading}>{student.fullName}</h1>
              <Badge variant={student.enabled ? "success" : "neutral"}>
                {student.enabled ? p.profile.statusEnabled : p.profile.statusDisabled}
              </Badge>
            </div>
            <ButtonLink href={`/admin/attempts?studentId=${student.id}`} variant="secondary" size="sm">
              {p.attempts.viewAll}
            </ButtonLink>
          </div>

          <Card title={p.profile.title}>
            <div className={styles.grid}>
              <Field label={p.profile.email}>{student.email}</Field>
              <Field label={p.profile.phone}>{student.phone ?? p.profile.notProvided}</Field>
              <Field label={p.profile.city}>{student.city ?? p.profile.notProvided}</Field>
              <Field label={p.profile.school}>{student.school ?? p.profile.notProvided}</Field>
              <Field label={p.profile.grade}>{student.grade ?? p.profile.notProvided}</Field>
              <Field label={p.profile.role}>{t.roles[student.role]}</Field>
              <Field label={p.profile.createdAt}>{formatExamDateTime(student.createdAt)}</Field>
            </div>
          </Card>

          <Card title={p.subscription.title}>
            {student.subscription.current ? (
              <div className={styles.grid}>
                <Field label={p.subscription.totalLabel}>
                  {formatCount(student.subscription.totalSubscriptions, locale)}
                </Field>
                <Field label={p.subscription.plan}>{t.subscription.plans[student.subscription.current.plan]}</Field>
                <Field label={p.subscription.status}>
                  <SubscriptionStatusBadge subscription={student.subscription.current} />
                </Field>
                <Field label={p.subscription.startDate}>{formatExamDateTime(student.subscription.current.startAt)}</Field>
                <Field label={p.subscription.endDate}>{formatExamDateTime(student.subscription.current.endAt)}</Field>
              </div>
            ) : (
              <p className={styles.mutedText}>{p.subscription.none}</p>
            )}
          </Card>

          <Card title={p.attempts.title}>
            {student.attempts.totalAttempts > 0 ? (
              <div className={styles.grid}>
                <Field label={p.attempts.totalAttempts}>{formatCount(student.attempts.totalAttempts, locale)}</Field>
                <Field label={p.attempts.submittedAttempts}>
                  {formatCount(student.attempts.submittedAttempts, locale)}
                </Field>
                <Field label={p.attempts.examsTaken}>{formatCount(student.attempts.examsTaken, locale)}</Field>
                <Field label={p.attempts.averagePercentage}>{formatPercentage(student.attempts.averagePercentage)}</Field>
                <Field label={p.attempts.bestPercentage}>{formatPercentage(student.attempts.bestPercentage)}</Field>
                <Field label={p.attempts.lastSubmittedAt}>{formatExamDateTime(student.attempts.lastSubmittedAt)}</Field>
              </div>
            ) : (
              <p className={styles.mutedText}>{p.attempts.none}</p>
            )}
          </Card>

          <Card title={p.payments.title}>
            {student.payments.totalPayments > 0 ? (
              <div className={styles.grid}>
                <Field label={p.payments.totalPayments}>{formatCount(student.payments.totalPayments, locale)}</Field>
                <Field label={p.payments.successfulPayments}>
                  {formatCount(student.payments.successfulPayments, locale)}
                </Field>
                <Field label={p.payments.lastPaidAt}>{formatExamDateTime(student.payments.lastPaidAt)}</Field>
                <Field label={p.payments.paidByCurrency}>
                  {formatRevenueByCurrency(student.payments.paidByCurrency).join(" · ") || "—"}
                </Field>
              </div>
            ) : (
              <p className={styles.mutedText}>{p.payments.none}</p>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <div className={styles.fieldValue}>{children}</div>
    </div>
  );
}
