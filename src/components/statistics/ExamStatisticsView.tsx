"use client";

import { useCallback } from "react";
import Link from "next/link";
import { ApiError } from "@/lib/api/errors";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useStatisticsRequest } from "@/hooks/useStatisticsRequest";
import { examApi } from "@/lib/exam/exam-api";
import { formatCount, formatPercentage } from "@/lib/statistics/format";
import { statisticsApi } from "@/lib/statistics/statistics-api";
import { useLocale, useTranslation } from "@/lib/i18n/LocaleProvider";
import { StatCard, StatCardGrid } from "./StatCard";
import { SectionError, StatCardGridSkeleton } from "./StatisticsSection";
import styles from "./Statistics.module.css";

/**
 * Phase 16B: aggregate statistics for one exam (GET /statistics/exams/{id}).
 * The exam title is fetched separately and is purely decorative context - if
 * that request fails the page still works with a generic heading. The backend
 * answers 404 for any exam that is not publicly visible, which is shown as a
 * calm "not available" state (retrying a 404 would be pointless).
 */
export function ExamStatisticsView({ examId }: { examId: string }) {
  const t = useTranslation();
  const { locale } = useLocale();
  const s = t.statistics;

  const fetchStats = useCallback((signal: AbortSignal) => statisticsApi.getExam(examId, signal), [examId]);
  const fetchExam = useCallback((signal: AbortSignal) => examApi.getById(examId, signal), [examId]);
  const stats = useStatisticsRequest(fetchStats);
  const exam = useStatisticsRequest(fetchExam);

  const notFound = ApiError.isApiError(stats.error) && stats.error.status === 404;
  const data = stats.data;

  return (
    <div className={styles.page}>
      <Link href={`/student/exams/${examId}`} className={styles.backLink}>
        {s.exam.back}
      </Link>

      <div className={styles.header}>
        {exam.data ? <h1 className={styles.heading}>{exam.data.title}</h1> : <h1 className={styles.heading}>{s.exam.title}</h1>}
        <p className={styles.subheading}>{exam.data ? s.exam.title : s.exam.description}</p>
      </div>

      {stats.error !== null ? (
        notFound ? (
          <Card>
            <EmptyState title={s.exam.notFound.title} description={s.exam.notFound.description} />
          </Card>
        ) : (
          <SectionError title={s.exam.loadError} error={stats.error} onRetry={stats.retry} />
        )
      ) : data === null ? (
        <>
          <Skeleton width="40%" height={20} />
          <StatCardGridSkeleton count={4} />
        </>
      ) : (
        <StatCardGrid label={s.exam.title}>
          <StatCard label={s.exam.cards.participants} value={formatCount(data.uniqueParticipants, locale)} />
          <StatCard
            label={s.exam.cards.submittedAttempts}
            value={formatCount(data.submittedAttempts, locale)}
            hint={s.exam.hints.submittedAttempts}
          />
          <StatCard
            label={s.exam.cards.averagePercentage}
            value={formatPercentage(data.averagePercentage)}
            valueSrText={data.averagePercentage === null ? s.notAvailable : undefined}
            hint={s.exam.hints.averagePercentage}
          />
          <StatCard
            label={s.exam.cards.highestPercentage}
            value={formatPercentage(data.highestPercentage)}
            valueSrText={data.highestPercentage === null ? s.notAvailable : undefined}
          />
        </StatCardGrid>
      )}
    </div>
  );
}
