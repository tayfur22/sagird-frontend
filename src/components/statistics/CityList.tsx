"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { formatCount, pluralForm } from "@/lib/statistics/format";
import { useLocale, useTranslation } from "@/lib/i18n/LocaleProvider";
import type { CityStatistics } from "@/types/statistics";
import styles from "./CityList.module.css";

export interface CityListProps {
  /** One backend-ordered page. Rendered in the given order - never sorted or de-duplicated here. */
  cities: CityStatistics[];
  /** Zero-based index of the first item of this page (page * size), for the running order number. */
  offset: number;
}

/**
 * Backend-ordered city distribution. The leading number is only the running
 * position in the order the API returned (not a rank: equal counts are not
 * merged and nothing is recomputed). A list rather than a table so it reflows
 * at 320px without horizontal scrolling.
 */
export function CityList({ cities, offset }: CityListProps) {
  const t = useTranslation();
  const { locale } = useLocale();
  const s = t.statistics;

  if (cities.length === 0) {
    return <EmptyState title={s.cities.empty.title} description={s.cities.empty.description} />;
  }

  return (
    <ol className={styles.list} start={offset + 1} aria-label={s.cities.title}>
      <li className={styles.headerRow} aria-hidden="true">
        <span>{s.cities.columns.order}</span>
        <span>{s.cities.columns.city}</span>
        <span>{s.cities.columns.students}</span>
      </li>
      {cities.map((item, index) => (
        <li key={`${item.city}-${offset + index}`} className={styles.row}>
          <span className={styles.order} aria-hidden="true">
            {offset + index + 1}
          </span>
          <span className={styles.city}>{item.city}</span>
          <span className={styles.count}>
            <strong>{formatCount(item.studentCount, locale)}</strong> {pluralForm(item.studentCount, locale, s.students)}
          </span>
        </li>
      ))}
    </ol>
  );
}
