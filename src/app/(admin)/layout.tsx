import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthenticatedShell } from "@/components/layout/AuthenticatedShell";
import type { NavItem } from "@/types/nav";

const ADMIN_NAV: NavItem[] = [
  { label: "İdarə paneli", href: "/admin/dashboard", labelKey: "dashboard", icon: "dashboard" },
  { label: "Tələbələr", href: "/admin/students", labelKey: "students", icon: "users" },
  { label: "Abunəliklər", href: "/admin/subscriptions", labelKey: "subscriptions", icon: "card" },
  { label: "Ödənişlər", href: "/admin/payments", labelKey: "payments", icon: "receipt" },
  { label: "İmtahanlar", href: "/admin/exams", labelKey: "exams", icon: "book" },
  { label: "Cəhdlər", href: "/admin/attempts", labelKey: "attempts", icon: "file" },
  { label: "Suallar", href: "/admin/questions", labelKey: "questions", icon: "help" },
  { label: "İdxal et", href: "/admin/questions/import", labelKey: "import", icon: "upload" },
  { label: "Liderlər", href: "/admin/leaderboard", labelKey: "leaderboard", icon: "trophy" },
  { label: "Statistika", href: "/admin/statistics", labelKey: "statistics", icon: "chart" },
];

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthenticatedShell role="ADMIN" brandLabel="Şagird.az Admin" navItems={ADMIN_NAV}>
      {children}
    </AuthenticatedShell>
  );
}
