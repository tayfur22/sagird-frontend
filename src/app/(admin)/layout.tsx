import type { ReactNode } from "react";
import { AuthenticatedShell } from "@/components/layout/AuthenticatedShell";
import type { NavItem } from "@/types/nav";

const ADMIN_NAV: NavItem[] = [
  { label: "İdarə paneli", href: "/admin/dashboard" },
  { label: "Tələbələr", href: "/admin/students", disabled: true },
  { label: "Abunəliklər", href: "/admin/subscriptions", disabled: true },
  { label: "Ödənişlər", href: "/admin/payments", disabled: true },
  { label: "İmtahanlar", href: "/admin/exams" },
  { label: "Suallar", href: "/admin/questions", disabled: true },
  { label: "Nəticələr", href: "/admin/results", disabled: true },
  { label: "Liderlər", href: "/admin/leaderboard", disabled: true },
  { label: "Statistika", href: "/admin/statistics", disabled: true },
  { label: "Parametrlər", href: "/admin/settings", disabled: true },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthenticatedShell role="ADMIN" brandLabel="Şagird.az Admin" navItems={ADMIN_NAV}>
      {children}
    </AuthenticatedShell>
  );
}
