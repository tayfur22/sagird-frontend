"use client";

import { AdminDashboardOverview } from "@/components/admin/AdminDashboardOverview";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import styles from "./page.module.css";

export default function AdminDashboardPage() {
  const t = useTranslation();

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.heading}>{t.admin.dashboard.title}</h1>
        <p className={styles.subtitle}>{t.admin.dashboard.subtitle}</p>
      </div>

      <AdminDashboardOverview />
    </div>
  );
}
