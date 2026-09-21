import type { Locale } from "./config";
import az from "./dictionaries/az.json";

const dictionaries: Record<Locale, typeof az> = {
  az,
  // English and Russian dictionaries are added in a future phase; the
  // lookup already falls back to Azerbaijani so nothing breaks meanwhile.
  en: az,
  ru: az,
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries.az;
}
