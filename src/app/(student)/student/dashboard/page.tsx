"use client";

import { DashboardSubscriptionCard } from "@/components/subscription/DashboardSubscriptionCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/lib/auth/AuthProvider";
import { t } from "@/lib/i18n/t";

export default function StudentDashboardPage() {
  const { user } = useAuth();

  return (
    <>
      {user && (
        <h1 style={{ fontSize: "var(--font-size-2xl)", fontWeight: 700, marginBottom: "var(--space-6)" }}>
          {t.dashboard.welcome.replace("{name}", user.firstName)}
        </h1>
      )}
      <DashboardSubscriptionCard />
      <EmptyState
        title="Hələ heç bir imtahan yoxdur."
        description="İmtahan funksionallığı növbəti fazada əlavə olunacaq."
      />
    </>
  );
}