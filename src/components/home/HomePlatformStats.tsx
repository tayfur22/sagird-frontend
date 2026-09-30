"use client";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionError, StatCardGridSkeleton, StatisticsSection } from "@/components/statistics/StatisticsSection";
import { StatCard, StatCardGrid } from "@/components/statistics/StatCard";
import { formatCount } from "@/lib/statistics/format";
import { useLocale, useTranslation } from "@/lib/i18n/LocaleProvider";
import type { StatisticsRequestState } from "@/hooks/useStatisticsRequest";
import type { StatisticsOverview } from "@/types/statistics";

/** Four real aggregate numbers from GET /statistics/overview; nothing is invented or recalculated. */
export function HomePlatformStats({ overview }: { overview: StatisticsRequestState<StatisticsOverview> }) {
  const t = useTranslation();
  const { locale } = useLocale();
  const h = t.home.stats;
  const data = overview.data;
  const isEmpty = data !== null && data.totalStudents === 0 && data.totalExams === 0 && data.totalSubmittedAttempts === 0;

  return (
    <StatisticsSection id="home-stats" title={h.title}>
      {overview.error !== null ? (
        <SectionError title={t.statistics.overview.loadError} error={overview.error} onRetry={overview.retry} />
      ) : data === null ? (
        <StatCardGridSkeleton count={4} />
      ) : isEmpty ? (
        <Card>
          <EmptyState title={t.statistics.notAvailable} />
        </Card>
      ) : (
        <StatCardGrid label={h.title}>
          <StatCard label={h.students} value={formatCount(data.totalStudents, locale)} />
          <StatCard label={h.exams} value={formatCount(data.totalExams, locale)} />
          <StatCard label={h.completed} value={formatCount(data.totalSubmittedAttempts, locale)} />
          <StatCard label={h.cities} value={formatCount(data.citiesCount, locale)} />
        </StatCardGrid>
      )}
    </StatisticsSection>
  );
}
