import type { ReactNode } from "react";
import { AuthenticatedShell } from "@/components/layout/AuthenticatedShell";
import type { NavItem } from "@/types/nav";

const STUDENT_NAV: NavItem[] = [
  { label: "İdarə paneli", href: "/student/dashboard" },
  { label: "İmtahanlarım", href: "/student/exams" },
  { label: "Nəticələr", href: "/student/results", disabled: true },
  { label: "Liderlər", href: "/student/leaderboard" },
  { label: "Statistika", href: "/student/statistics", labelKey: "statistics" },
  { label: "Abunəlik", href: "/student/subscription" },
  { label: "Profil", href: "/student/profile" },
];

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <AuthenticatedShell role="STUDENT" brandLabel="Şagird.az" navItems={STUDENT_NAV}>
      {children}
    </AuthenticatedShell>
  );
}