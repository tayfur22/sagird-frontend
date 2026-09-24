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
      trigger={<span className={styles.trigger}>{locale.toUpperCase()}</span>}
      triggerLabel={`${t.language.switchLabel}: ${t.language[locale]}`}
      items={items}
    />
  );
}