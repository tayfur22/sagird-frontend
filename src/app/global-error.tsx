"use client";

import { getDictionary } from "@/lib/i18n/get-dictionary";
import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";

function storedLocale(): Locale {
  try {
    const value = window.localStorage.getItem("sagird_locale");
    if (value && (locales as readonly string[]).includes(value)) return value as Locale;
  } catch {
    // storage unavailable
  }
  return defaultLocale;
}

/**
 * Last-resort boundary for errors thrown in the root layout itself. It
 * replaces the whole document, so it renders its own <html>/<body> with
 * plain elements (no providers are available here).
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const locale = storedLocale();
  const t = getDictionary(locale);

  return (
    <html lang={locale}>
      <body>
        <div role="alert" style={{ maxWidth: 480, margin: "4rem auto", padding: "0 1.5rem", fontFamily: "system-ui, sans-serif" }}>
          <h1 style={{ fontSize: "1.25rem" }}>{t.common.error}</h1>
          <p>{t.common.errorDescription}</p>
          <button type="button" onClick={reset}>
            {t.common.retry}
          </button>
        </div>
      </body>
    </html>
  );
}
