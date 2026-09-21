"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/lib/auth/AuthProvider";
import { homePathForRole } from "@/lib/auth/validation";
import { t } from "@/lib/i18n/t";
import type { Role } from "@/types/auth";
import styles from "./AuthForms.module.css";

/**
 * Client-side route guard for the student/admin areas: waits for the session
 * to be restored, sends anonymous visitors to /login (remembering where they
 * were headed) and sends users with the wrong role to their own dashboard.
 * This is UX only - the backend independently enforces roles on every API call.
 */
export function RequireAuth({ role, children }: { role: Role; children: ReactNode }) {
  const { status, user, endedBy } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      const target = endedBy === "logout" ? "/login" : `/login?next=${encodeURIComponent(pathname)}`;
      router.replace(target);
    } else if (status === "authenticated" && user && user.role !== role) {
      router.replace(homePathForRole(user.role));
    }
  }, [status, user, endedBy, role, pathname, router]);

  if (status !== "authenticated" || !user || user.role !== role) {
    return (
      <div className={styles.center}>
        <Spinner size={32} label={t.auth.checkingSession} />
      </div>
    );
  }

  return <>{children}</>;
}
