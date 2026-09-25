"use client";

import { AdminStudentTable } from "@/components/admin/AdminStudentTable";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import styles from "./page.module.css";

export default function AdminStudentsPage() {
  const t = useTranslation();

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.heading}>{t.admin.students.title}</h1>
        <p className={styles.subtitle}>{t.admin.students.subtitle}</p>
      </div>

      <AdminStudentTable />
    </div>
  );
}
