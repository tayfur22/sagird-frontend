"use client";

import { useCallback, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { useStatisticsRequest } from "@/hooks/useStatisticsRequest";
import { formatCount, formatPercentage, pluralForm } from "@/lib/statistics/format";
import { statisticsApi } from "@/lib/statistics/statistics-api";
import { useLocale, useTranslation } from "@/lib/i18n/LocaleProvider";
import { CityList } from "./CityList";
import { StatCard, StatCardGrid } from "./StatCard";
import { ListSkeleton, SectionError, StatCardGridSkeleton, StatisticsSection } from "./StatisticsSection";
import styles from "./Statistics.module.css";

const CITY_PAGE_SIZE = 20;

/**
 * Phase 16B: public aggregate statistics (overview, top cities, city
 * distribution, weekly summary). Exactly three requests - overview, one page
 * of cities, weekly - each with its own loading/error/retry state so one
 * failure never blanks the rest. Nothing is calculated, sorted or de-duplicated
 * here; the top cities come from the overview response (no second request).
 * Only the city-level geography exists on the backend, so nothing else is shown.
 */
export function StatisticsPage() {
  const t = useTranslation();
  const { locale } = useLocale();
  const s = t.statistics;

  const overview = useStatisticsRequest(statisticsApi.getOverview);
  const weekly = useStatisticsRequest(statisticsApi.getWeekly);

  const [pageIndex, setPageIndex] = useState(0);
  const fetchCities = useCallback(
    (signal: AbortSignal) => statisticsApi.getCities(pageIndex, CITY_PAGE_SIZE, signal),
    [pageIndex]
  );
  const cities = useStatisticsRequest(fetchCities);

  const overviewData = overview.data;
  const weeklyData = weekly.data;
  const cityPage = cities.data;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>{s.title}</h1>
        <p className={styles.subheading}>{s.description}</p>
      </div>

      <StatisticsSection id="overview" title={s.overview.title} description={s.overview.description}>
        {overview.error !== null ? (
          <SectionError title={s.overview.loadError} error={overview.error} onRetry={overview.retry} />
        ) : overviewData === null ? (
          <StatCardGridSkeleton count={4} />
        ) : (
          <StatCardGrid label={s.overview.title}>
            <StatCard label={s.overview.cards.totalStudents} value={formatCount(overviewData.totalStudents, locale)} />
            <StatCard label={s.overview.cards.totalExams} value={formatCount(overviewData.totalExams, locale)} />
            <StatCard
              label={s.overview.cards.submittedAttempts}
              value={formatCount(overviewData.totalSubmittedAttempts, locale)}
              hint={s.overview.hints.submittedAttempts}
            />
            <StatCard
              label={s.overview.cards.participants}
              value={formatCount(overviewData.totalParticipants, locale)}
              hint={s.overview.hints.participants}
            />
          </StatCardGrid>
        )}
      </StatisticsSection>

      {/* Top cities come from the overview response; if it failed, its error above is the only message. */}
      {overview.error === null && (
        <StatisticsSection id="top-cities" title={s.topCities.title} description={s.topCities.description}>
          {overviewData === null ? (
            <ListSkeleton rows={3} />
          ) : (
            <Card>
              {overviewData.topCities.length === 0 ? (
                <p className={styles.subheading}>{s.topCities.empty}</p>
              ) : (
                <ol className={styles.topList}>
                  {overviewData.topCities.map((item, index) => (
                    <li key={`${item.city}-${index}`} className={styles.topItem}>
                      <span className={styles.topCity}>{item.city}</span>
                      <span className={styles.topCount}>
                        <strong>{formatCount(item.studentCount, locale)}</strong>{" "}
                        {pluralForm(item.studentCount, locale, s.students)}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
              <dl className={styles.meta} style={{ marginTop: "var(--space-4)" }}>
                <div className={styles.metaItem}>
                  <dt>{s.overview.cards.cities}</dt>
                  <dd>{formatCount(overviewData.citiesCount, locale)}</dd>
                </div>
                <div className={styles.metaItem}>
                  <dt>{s.overview.cards.studentsWithCity}</dt>
                  <dd>{formatCount(overviewData.studentsWithCity, locale)}</dd>
                </div>
              </dl>
            </Card>
          )}
        </StatisticsSection>
      )}

      <StatisticsSection id="weekly" title={s.weekly.title} description={s.weekly.description}>
        {weekly.error !== null ? (
          <SectionError title={s.weekly.loadError} error={weekly.error} onRetry={weekly.retry} />
        ) : weeklyData === null ? (
          <StatCardGridSkeleton count={5} />
        ) : (
          <>
            {weeklyData.activeExamCount === 0 && (
              <p className={styles.note} role="status">
                <span className={styles.noteTitle}>{s.weekly.noActive.title}</span>
                {s.weekly.noActive.description}
              </p>
            )}
            <StatCardGrid label={s.weekly.title}>
              <StatCard label={s.weekly.cards.activeExams} value={formatCount(weeklyData.activeExamCount, locale)} />
              <StatCard
                label={s.weekly.cards.participants}
                value={formatCount(weeklyData.uniqueParticipants, locale)}
              />
              <StatCard
                label={s.weekly.cards.submittedAttempts}
                value={formatCount(weeklyData.submittedAttempts, locale)}
                hint={s.weekly.hints.submittedAttempts}
              />
              <StatCard
                label={s.weekly.cards.averagePercentage}
                value={formatPercentage(weeklyData.averagePercentage)}
                valueSrText={weeklyData.averagePercentage === null ? s.notAvailable : undefined}
                hint={s.weekly.hints.averagePercentage}
              />
              <StatCard
                label={s.weekly.cards.highestPercentage}
                value={formatPercentage(weeklyData.highestPercentage)}
                valueSrText={weeklyData.highestPercentage === null ? s.notAvailable : undefined}
              />
            </StatCardGrid>
          </>
        )}
      </StatisticsSection>

      <StatisticsSection id="cities" title={s.cities.title} description={s.cities.description}>
        {cities.error !== null ? (
          <SectionError title={s.cities.loadError} error={cities.error} onRetry={cities.retry} />
        ) : cityPage === null ? (
          <ListSkeleton rows={6} />
        ) : (
          <>
            <Card className={cities.loading ? styles.busy : undefined} aria-busy={cities.loading || undefined}>
              <CityList cities={cityPage.content} offset={cityPage.page * cityPage.size} />
            </Card>
            {cityPage.totalPages > 1 && (
              <div className={styles.footer}>
                <Pagination
                  page={cityPage.page + 1}
                  totalPages={cityPage.totalPages}
                  onPageChange={(page) => setPageIndex(page - 1)}
                  disabled={cities.loading}
                  labels={s.pagination}
                />
              </div>
            )}
          </>
        )}
      </StatisticsSection>
    </div>
  );
}
