"use client";

import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Pagination } from "@/components/ui/Pagination";
import { useStatisticsRequest } from "@/hooks/useStatisticsRequest";
import { formatCount, formatPercentage, pluralForm } from "@/lib/statistics/format";
import { statisticsApi } from "@/lib/statistics/statistics-api";
import { useLocale, useTranslation } from "@/lib/i18n/LocaleProvider";
import { CityList } from "./CityList";
import { StatCard, StatCardGrid } from "./StatCard";
import {
  ListSkeleton,
  SectionError,
  StatCardGridSkeleton,
  StatisticsPanel,
  StatisticsSection,
} from "./StatisticsSection";
import styles from "./Statistics.module.css";

const CITY_PAGE_SIZE = 20;

/**
 * Phase 16B: public aggregate statistics (overview, weekly summary, top cities,
 * city distribution). Exactly three requests - overview, one page of cities,
 * weekly - each with its own loading/error/retry state so one failure never
 * blanks the rest. Nothing is calculated, sorted or de-duplicated here; the top
 * cities come from the overview response (no second request). The only derived
 * value is the purely visual bar width of the top-cities list (count relative
 * to the largest count shown); it is decorative and never rendered as a number.
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

  // Visual-only scale for the bars; 1 avoids a division by zero when every count is 0.
  const maxTopCount = overviewData ? Math.max(1, ...overviewData.topCities.map((item) => item.studentCount)) : 1;

  return (
    <div className={styles.page}>
      <div className={styles.headerBar}>
        <div className={styles.header}>
          <div className={styles.titleLine}>
            <h1 className={styles.heading}>{s.title}</h1>
            <Badge variant="mint">{s.liveBadge}</Badge>
          </div>
          <p className={styles.subheading}>{s.description}</p>
        </div>
        <div className={styles.periodChip}>
          <Icon name="calendar" size={16} />
          <span>{s.periodWeekly}</span>
        </div>
      </div>

      <StatisticsSection id="overview" title={s.overview.title} description={s.overview.description} eyebrow>
        {overview.error !== null ? (
          <SectionError title={s.overview.loadError} error={overview.error} onRetry={overview.retry} />
        ) : overviewData === null ? (
          <StatCardGridSkeleton count={5} />
        ) : (
          <StatCardGrid label={s.overview.title}>
            <StatCard
              icon={<Icon name="users" />}
              label={s.overview.cards.totalStudents}
              value={formatCount(overviewData.totalStudents, locale)}
            />
            <StatCard
              icon={<Icon name="book" />}
              label={s.overview.cards.totalExams}
              value={formatCount(overviewData.totalExams, locale)}
            />
            <StatCard
              icon={<Icon name="fileCheck" />}
              label={s.overview.cards.submittedAttempts}
              value={formatCount(overviewData.totalSubmittedAttempts, locale)}
              hint={s.overview.hints.submittedAttempts}
            />
            <StatCard
              icon={<Icon name="mapPin" />}
              label={s.overview.cards.cities}
              value={formatCount(overviewData.citiesCount, locale)}
            />
            <StatCard
              icon={<Icon name="userCheck" />}
              label={s.overview.cards.participants}
              value={formatCount(overviewData.totalParticipants, locale)}
              hint={s.overview.hints.participants}
            />
          </StatCardGrid>
        )}
      </StatisticsSection>

      {/* Weekly summary + top cities side by side. Top cities come from the overview response; if it failed, its error above is the only message. */}
      <div className={styles.twoCol}>
        <StatisticsPanel
          id="weekly"
          title={s.weekly.title}
          icon={<Icon name="chart" size={16} />}
          badge={weeklyData !== null && weeklyData.activeExamCount > 0 ? <Badge variant="mint">{s.weekly.activeBadge}</Badge> : undefined}
        >
          <p className={styles.panelDescription}>{s.weekly.description}</p>
          {weekly.error !== null ? (
            <SectionError title={s.weekly.loadError} error={weekly.error} onRetry={weekly.retry} />
          ) : weeklyData === null ? (
            <StatCardGridSkeleton count={4} />
          ) : (
            <>
              {weeklyData.activeExamCount === 0 && (
                <p className={styles.note} role="status">
                  <span className={styles.noteTitle}>{s.weekly.noActive.title}</span>
                  {s.weekly.noActive.description}
                </p>
              )}
              <StatCardGrid label={s.weekly.title} columns="pair">
                <StatCard
                  variant="compact"
                  label={s.weekly.cards.activeExams}
                  value={formatCount(weeklyData.activeExamCount, locale)}
                />
                <StatCard
                  variant="compact"
                  label={s.weekly.cards.participants}
                  value={formatCount(weeklyData.uniqueParticipants, locale)}
                />
                <StatCard
                  variant="compact"
                  label={s.weekly.cards.submittedAttempts}
                  value={formatCount(weeklyData.submittedAttempts, locale)}
                  hint={s.weekly.hints.submittedAttempts}
                />
                <StatCard
                  variant="compact"
                  highlight
                  label={s.weekly.cards.averagePercentage}
                  value={formatPercentage(weeklyData.averagePercentage)}
                  valueSrText={weeklyData.averagePercentage === null ? s.notAvailable : undefined}
                  hint={s.weekly.hints.averagePercentage}
                />
              </StatCardGrid>
              <div className={styles.best}>
                <div className={styles.bestMain}>
                  <span className={styles.bestIcon}>
                    <Icon name="award" size={18} />
                  </span>
                  <span className={styles.bestLabel}>{s.weekly.cards.highestPercentage}</span>
                </div>
                <span className={styles.bestValue}>
                  {weeklyData.highestPercentage === null ? (
                    <>
                      <span aria-hidden="true">{formatPercentage(weeklyData.highestPercentage)}</span>
                      <span className={styles.srOnly}>{s.notAvailable}</span>
                    </>
                  ) : (
                    formatPercentage(weeklyData.highestPercentage)
                  )}
                </span>
              </div>
            </>
          )}
        </StatisticsPanel>

        {overview.error === null && (
          <StatisticsPanel id="top-cities" title={s.topCities.title} icon={<Icon name="mapPin" size={16} />}>
            <p className={styles.panelDescription}>{s.topCities.description}</p>
            {overviewData === null ? (
              <ListSkeleton rows={3} />
            ) : (
              <>
                {overviewData.topCities.length === 0 ? (
                  <p className={styles.subheading}>{s.topCities.empty}</p>
                ) : (
                  <ol className={styles.barList}>
                    {overviewData.topCities.map((item, index) => (
                      <li key={`${item.city}-${index}`} className={styles.barItem}>
                        <div className={styles.barHead}>
                          <span className={styles.barCity}>{item.city}</span>
                          <span className={styles.barCount}>
                            <strong>{formatCount(item.studentCount, locale)}</strong>{" "}
                            {pluralForm(item.studentCount, locale, s.students)}
                          </span>
                        </div>
                        <div className={styles.barTrack} aria-hidden="true">
                          <div
                            className={styles.barFill}
                            style={{ width: `${Math.round((item.studentCount / maxTopCount) * 100)}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
                <dl className={`${styles.meta} ${styles.panelMeta}`}>
                  <div className={styles.metaItem}>
                    <dt>{s.overview.cards.cities}</dt>
                    <dd>{formatCount(overviewData.citiesCount, locale)}</dd>
                  </div>
                  <div className={styles.metaItem}>
                    <dt>{s.overview.cards.studentsWithCity}</dt>
                    <dd>{formatCount(overviewData.studentsWithCity, locale)}</dd>
                  </div>
                </dl>
              </>
            )}
          </StatisticsPanel>
        )}
      </div>

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
