"use client";

import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListSkeleton } from "@/components/statistics/StatisticsSection";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useTranslation } from "@/lib/i18n/LocaleProvider";

/**
 * The exam list and leaderboard endpoints are STUDENT-only on the backend, so
 * they must not be requested for a visitor (401) or an admin (403). Children
 * (which own the requests) mount only for a signed-in student; everyone else
 * gets a calm explanation instead of an error.
 */
export function StudentDataGate({ children }: { children: ReactNode }) {
  const t = useTranslation();
  const { status, user } = useAuth();

  if (status === "loading") return <ListSkeleton rows={3} />;
  if (status === "authenticated" && user?.role === "STUDENT") return <>{children}</>;

  const signedOut = status !== "authenticated";
  return (
    <Card>
      <EmptyState
        title={signedOut ? t.home.gate.signedOut : t.home.gate.studentOnly}
        action={
          signedOut ? (
            <>
              <ButtonLink href="/login" variant="secondary">
                {t.nav.login}
              </ButtonLink>{" "}
              <ButtonLink href="/register">{t.nav.register}</ButtonLink>
            </>
          ) : undefined
        }
      />
    </Card>
  );
}
