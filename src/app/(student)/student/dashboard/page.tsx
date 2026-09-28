"use client";

import { DashboardSubscriptionCard } from "@/components/subscription/DashboardSubscriptionCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useTranslation } from "@/lib/i18n/LocaleProvider";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const t = useTranslation();

  return (
    <>
      {user && (
        <h1 style={{ fontSize: "var(--font-size-2xl)", fontWeight: 700, marginBottom: "var(--space-6)" }}>
          {t.dashboard.welcome.replace("{name}", user.firstName)}
        </h1>
      )}
      <DashboardSubscriptionCard />
      <EmptyState title={t.emptyState.noExams} />
    </>
  );
}
