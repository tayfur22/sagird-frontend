"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/lib/auth/AuthProvider";
import { homePathForRole, safeNextPath } from "@/lib/auth/validation";
import { t } from "@/lib/i18n/t";
import styles from "./AuthForms.module.css";

/** Wraps /login and /register: signed-in users are sent on to their dashboard. */
export function GuestOnly({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === "authenticated" && user) {
      const next = safeNextPath(searchParams.get("next"));
      router.replace(next ?? homePathForRole(user.role));
    }
  }, [status, user, searchParams, router]);

  if (status !== "unauthenticated") {
    return (
      <div className={styles.center}>
        <Spinner size={32} label={t.auth.checkingSession} />
      </div>
    );
  }

  return <>{children}</>;
}
