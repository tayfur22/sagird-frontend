"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListSkeleton, SectionError, StatisticsSection } from "@/components/statistics/StatisticsSection";
import { formatCount, pluralForm } from "@/lib/statistics/format";
import { useLocale, useTranslation } from "@/lib/i18n/LocaleProvider";
import type { StatisticsRequestState } from "@/hooks/useStatisticsRequest";
import type { StatisticsOverview } from "@/types/statistics";
import styles from "./Home.module.css";

/**
 * Backend-ordered top cities from the overview response (no extra request).
 * Only city-level data exists on the backend - there is no district field.
 */
export function HomeRegions({ overview }: { overview: StatisticsRequestState<StatisticsOverview> }) {
  const t = useTranslation();
  const { locale } = useLocale();
  const h = t.home.regions;
  const cities = overview.data?.topCities ?? [];

  return (
    <StatisticsSection id="home-regions" title={h.title} description={h.description}>
      {overview.error !== null ? (
        <SectionError title={t.statistics.cities.loadError} error={overview.error} onRetry={overview.retry} />
      ) : overview.data === null ? (
        <ListSkeleton rows={2} />
      ) : cities.length === 0 ? (
        <Card>
          <EmptyState title={t.statistics.topCities.empty} />
        </Card>
      ) : (
        <>
          <ul className={styles.cityList}>
            {cities.map((city) => (
              <li key={city.city} className={styles.cityItem}>
                <span className={styles.cityName}>{city.city}</span>
                <span className={styles.cityCount}>
                  {formatCount(city.studentCount, locale)} {pluralForm(city.studentCount, locale, t.statistics.students)}
                </span>
              </li>
            ))}
          </ul>
          <Link href="/statistics" className={styles.textLink}>
            {h.viewAll}
          </Link>
        </>
      )}
    </StatisticsSection>
  );
}
