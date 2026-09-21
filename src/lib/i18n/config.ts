export const locales = ["az", "en", "ru"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "az";
