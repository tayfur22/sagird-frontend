"use client";

import { useTranslation } from "@/lib/i18n/LocaleProvider";

export interface PublicNavLink {
  key: "exams" | "subscriptions" | "ranking" | "statistics";
  label: string;
  href: string;
}

/**
 * Single source of the public navigation (header, mobile menu, footer, home
 * CTAs). Exams and subscriptions are genuinely public as of Phase 2 (see
 * the /exams and /subscriptions public routes) - a signed-out visitor sees
 * them directly, no login redirect. As of Phase 3 the leaderboard and statistics
 * are public too, so every link here is a plain public route.
 */
export function usePublicNav(): { links: PublicNavLink[]; href: Record<PublicNavLink["key"], string> } {
  const t = useTranslation();

  const href = {
    exams: "/exams",
    subscriptions: "/subscriptions",
    ranking: "/leaderboard",
    statistics: "/statistics",
  };

  const links: PublicNavLink[] = [
    { key: "exams", label: t.nav.exams, href: href.exams },
    { key: "subscriptions", label: t.nav.subscriptions, href: href.subscriptions },
    { key: "ranking", label: t.nav.ranking, href: href.ranking },
    { key: "statistics", label: t.nav.statistics, href: href.statistics },
  ];

  return { links, href };
}
