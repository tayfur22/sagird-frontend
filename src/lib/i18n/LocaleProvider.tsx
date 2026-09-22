"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { defaultLocale, locales, type Locale } from "./config";
import { getDictionary } from "./get-dictionary";
import { setActiveLocale } from "./t";

const STORAGE_KEY = "sagird_locale";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function isLocale(value: string | null): value is Locale {
  return value !== null && (locales as readonly string[]).includes(value);
}

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isLocale(stored) ? stored : defaultLocale;
}

/**
 * Owns the app's current language. Wraps the whole app in the root layout,
 * alongside ToastProvider/AuthProvider. Persists the choice to
 * localStorage and keeps `<html lang>` in sync. Also mirrors every change
 * into `t.ts`'s module-level state (see setActiveLocale) so non-component
 * code can read translations too.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  // Starts at defaultLocale (matching the server-rendered markup) and
  // switches to the stored locale after mount, to avoid a hydration mismatch.
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const stored = readStoredLocale();
    if (stored !== defaultLocale) {
      setLocaleState(stored);
      setActiveLocale(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    setActiveLocale(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/** Current locale + setter, for the language switcher. Safe to use outside a provider (e.g. in tests): falls back to the default locale with a no-op setter. */
export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  return context ?? { locale: defaultLocale, setLocale: () => {} };
}

/**
 * The active dictionary, reactive to language changes. Prefer this over
 * importing `t` directly in any component - only components using this
 * hook (transitively) re-render when the language changes. Safe to use
 * outside a LocaleProvider (falls back to the default locale), so existing
 * component tests that render without wrapping a provider keep working.
 */
export function useTranslation() {
  const { locale } = useLocale();
  return useMemo(() => getDictionary(locale), [locale]);
}