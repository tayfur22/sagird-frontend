"use client";

import { AdminSubscriptionTable } from "@/components/admin/AdminSubscriptionTable";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import styles from "./page.module.css";

export default function AdminSubscriptionsPage() {
  const t = useTranslation();

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.heading}>{t.admin.subscriptions.title}</h1>
        <p className={styles.subtitle}>{t.admin.subscriptions.subtitle}</p>
      </div>

      <AdminSubscriptionTable />
    </div>
  );
}
