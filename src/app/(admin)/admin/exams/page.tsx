"use client";

import { AdminExamTable } from "@/components/exam/AdminExamTable";
import { ButtonLink } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import styles from "./page.module.css";

export default function AdminExamsPage() {
  const t = useTranslation();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>{t.exam.adminList.title}</h1>
          <p className={styles.subtitle}>{t.exam.adminList.subtitle}</p>
        </div>
        <ButtonLink href="/admin/exams/new">{t.exam.adminList.createButton}</ButtonLink>
      </div>

      <AdminExamTable />
    </div>
  );
}
