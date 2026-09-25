"use client";

import { AdminPaymentTable } from "@/components/admin/AdminPaymentTable";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import styles from "./page.module.css";

export default function AdminPaymentsPage() {
  const t = useTranslation();

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.heading}>{t.admin.payments.title}</h1>
        <p className={styles.subtitle}>{t.admin.payments.subtitle}</p>
      </div>

      <AdminPaymentTable />
    </div>
  );
}
