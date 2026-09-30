"use client";

import { PublicExamList } from "@/components/exam/PublicExamList";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import styles from "./page.module.css";

/** Public /exams: works without login (GET /api/v1/public/exams). */
export default function PublicExamsPage() {
  const t = useTranslation();

  return (
    <div className="container">
      <div className={styles.wrap}>
        <div>
          <h1 className={styles.heading}>{t.exam.publicList.title}</h1>
          <p className={styles.subtitle}>{t.exam.publicList.subtitle}</p>
        </div>

        <PublicExamList />
      </div>
    </div>
  );
}
