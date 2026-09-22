import type { Locale } from "./config";
import az from "./dictionaries/az.json";
import en from "./dictionaries/en.json";
import ru from "./dictionaries/ru.json";

const dictionaries: Record<Locale, typeof az> = {
  az,
  en,
  ru,
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries.az;
}