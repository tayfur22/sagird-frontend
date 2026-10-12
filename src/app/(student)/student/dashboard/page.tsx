"use client";

import { DashboardSubscriptionCard } from "@/components/subscription/DashboardSubscriptionCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import styles from "./page.module.css";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const t = useTranslation();

  return (
    <>
      {user && (
        <div className={styles.welcome}>
          <h1 className={styles.welcomeTitle}>{t.dashboard.welcome.replace("{name}", user.firstName)}</h1>
        </div>
      )}
      <DashboardSubscriptionCard />
      <EmptyState title={t.emptyState.noExams} />
    </>
  );
}
