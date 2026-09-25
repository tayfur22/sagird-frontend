import type { ReactNode } from "react";
import { AuthenticatedShell } from "@/components/layout/AuthenticatedShell";
import type { NavItem } from "@/types/nav";

const ADMIN_NAV: NavItem[] = [
  { label: "İdarə paneli", href: "/admin/dashboard", labelKey: "dashboard" },
  { label: "Tələbələr", href: "/admin/students", labelKey: "students" },
  { label: "Abunəliklər", href: "/admin/subscriptions", labelKey: "subscriptions" },
  { label: "Ödənişlər", href: "/admin/payments", labelKey: "payments" },
  { label: "İmtahanlar", href: "/admin/exams", labelKey: "exams" },
  { label: "Cəhdlər", href: "/admin/attempts", labelKey: "attempts" },
  { label: "Suallar", href: "/admin/questions", labelKey: "questions" },
  { label: "İdxal et", href: "/admin/questions/import", labelKey: "import" },
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
