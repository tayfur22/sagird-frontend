"use client";

import { StudentExamList } from "@/components/exam/StudentExamList";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import styles from "./page.module.css";

export default function StudentExamsPage() {
  const t = useTranslation();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>{t.exam.student.listTitle}</h1>
        <p className={styles.subtitle}>{t.exam.student.listSubtitle}</p>
      </div>

      <StudentExamList />
    </div>
  );
}
