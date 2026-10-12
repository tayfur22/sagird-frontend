"use client";

import { Dropdown, type DropdownItem } from "@/components/ui/Dropdown";
import { locales } from "@/lib/i18n/config";
import { useLocale, useTranslation } from "@/lib/i18n/LocaleProvider";
import styles from "./LanguageSwitcher.module.css";

/** Simple AZ/EN/RU switcher built on the existing Dropdown component - reused in PublicHeader and DashboardShell. */
export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const t = useTranslation();

  const items: DropdownItem[] = locales.map((code) => ({
    label: t.language[code],
    current: code === locale,
    onSelect: () => setLocale(code),
  }));

  return (
    <Dropdown
      trigger={
        <span className={styles.trigger}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          {locale.toUpperCase()}
        </span>
      }
      triggerLabel={`${t.language.switchLabel}: ${t.language[locale]}`}
      items={items}
    />
  );
}