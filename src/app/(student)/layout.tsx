import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthenticatedShell } from "@/components/layout/AuthenticatedShell";
import type { NavItem } from "@/types/nav";

const STUDENT_NAV: NavItem[] = [
  { label: "İdarə paneli", href: "/student/dashboard", labelKey: "dashboard" },
  { label: "İmtahanlarım", href: "/student/exams", labelKey: "myExams" },
  { label: "Nəticələr", href: "/student/results", labelKey: "results", disabled: true },
  { label: "Liderlər", href: "/student/leaderboard", labelKey: "leaderboard" },
  { label: "Statistika", href: "/student/statistics", labelKey: "statistics" },
  { label: "Abunəlik", href: "/student/subscription", labelKey: "subscription" },
  { label: "Profil", href: "/student/profile", labelKey: "profile" },
];

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <AuthenticatedShell role="STUDENT" brandLabel="Şagird.az" navItems={STUDENT_NAV}>
      {children}
    </AuthenticatedShell>
  );
}