"use client";

import { ButtonLink } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import styles from "./page.module.css";

export default function HomePage() {
  const t = useTranslation();

  return (
    <div className={`container ${styles.hero}`}>
      <h1 className={styles.title}>Şagird.az</h1>
      <p className={styles.subtitle}>{t.home.subtitle}</p>
      <div className={styles.actions}>
        <ButtonLink href="/register" size="lg">
          {t.nav.register}
        </ButtonLink>
        <ButtonLink href="/login" size="lg" variant="secondary">
          {t.nav.login}
        </ButtonLink>
      </div>
    </div>
  );
}
