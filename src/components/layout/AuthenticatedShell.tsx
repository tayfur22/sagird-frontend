"use client";

import type { ReactNode } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { NavItem } from "@/types/nav";
import type { Role } from "@/types/auth";
import { DashboardShell } from "./DashboardShell";

interface AuthenticatedShellProps {
  role: Role;
  brandLabel: string;
  navItems: NavItem[];
  children: ReactNode;
}

/**
 * Role-guarded DashboardShell. Lives in a client component because the
 * logout handler and current user come from the auth context, which server
 * layouts cannot pass down as props.
 */
export function AuthenticatedShell({ role, brandLabel, navItems, children }: AuthenticatedShellProps) {
  return (
    <RequireAuth role={role}>
      <ShellWithUser brandLabel={brandLabel} navItems={navItems}>
        {children}
      </ShellWithUser>
    </RequireAuth>
  );
}

function ShellWithUser({ brandLabel, navItems, children }: Omit<AuthenticatedShellProps, "role">) {
  const { user, logout } = useAuth();
  const t = useTranslation();
  return (
    <DashboardShell
      brandLabel={brandLabel}
      navItems={navItems}
      userName={user ? `${user.firstName} ${user.lastName}` : undefined}
      logoutLabel={t.nav.logout}
      onLogout={() => void logout()}
    >
      {children}
    </DashboardShell>
  );
}
