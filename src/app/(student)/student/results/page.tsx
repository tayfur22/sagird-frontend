"use client";

import { MyResultsList } from "@/components/exam/MyResultsList";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import styles from "./page.module.css";

export default function StudentResultsPage() {
  const t = useTranslation();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>{t.attempt.myResults.title}</h1>
        <p className={styles.subtitle}>{t.attempt.myResults.subtitle}</p>
      </div>

      <MyResultsList />
    </div>
  );
}
