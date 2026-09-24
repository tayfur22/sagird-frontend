import type { Locale } from "@/lib/i18n/config";

const EMPTY_VALUE = "—";

/** Locale-aware integer with digit grouping (1,250). 0 is a real value and renders as "0". */
export function formatCount(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Percentage exactly as the backend sent it (already 0-100, already rounded),
 * following the leaderboard's existing `${value}%` convention. `null` (no
 * submissions yet) renders as an em dash; 0 renders as "0%".
 */
export function formatPercentage(value: number | null): string {
  return value === null ? EMPTY_VALUE : `${value}%`;
}

export interface PluralForms {
  one: string;
  few: string;
  many: string;
  other: string;
}

/** Picks the grammatical form for a count using the locale's CLDR plural rules (needed for Russian). */
export function pluralForm(count: number, locale: Locale, forms: PluralForms): string {
  const category = new Intl.PluralRules(locale).select(count);
  switch (category) {
    case "one":
      return forms.one;
    case "few":
      return forms.few;
    case "many":
      return forms.many;
    default:
      return forms.other;
  }
}
