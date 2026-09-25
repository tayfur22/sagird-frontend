"use client";

import { Suspense } from "react";
import { AdminAttemptTable } from "@/components/admin/AdminAttemptTable";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import styles from "./page.module.css";

export default function AdminAttemptsPage() {
  const t = useTranslation();

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.heading}>{t.admin.attempts.title}</h1>
        <p className={styles.subtitle}>{t.admin.attempts.subtitle}</p>
      </div>

      {/* useSearchParams (for ?studentId=/?examId= deep links) requires a Suspense boundary. */}
      <Suspense>
        <AdminAttemptTable />
      </Suspense>
    </div>
  );
}
