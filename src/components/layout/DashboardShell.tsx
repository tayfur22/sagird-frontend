"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import { Icon } from "@/components/ui/Icon";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { NavItem } from "@/types/nav";
import styles from "./DashboardShell.module.css";

export interface DashboardShellProps {
  brandLabel: string;
  navItems: NavItem[];
  children: ReactNode;
  /** Optional signed-in user display + logout, supplied by AuthenticatedShell. */
  userName?: string;
  logoutLabel?: string;
  onLogout?: () => void;
}

/** Presentational only: highlights the ".az" part of the brand ("Şagird.az", "Şagird.az Admin"). */
function renderBrand(label: string) {
  const match = /^(.*?)(\.az)(.*)$/.exec(label);
  if (!match) return label;
  return (
    <>
      {match[1]}
      <span className={styles.brandAccent}>{match[2]}</span>
      {match[3]}
    </>
  );
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

/**
 * Shared sidebar + topbar shell used by both the Student and Admin
 * layouts. Only the brand label and navigation items differ between
 * them, so the responsive/structural behavior lives here once.
 */
export function DashboardShell({
  brandLabel,
  navItems,
  children,
  userName,
  logoutLabel,
  onLogout,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useTranslation();
  const pathname = usePathname() ?? "";
  // Longest matching href wins, so /admin/questions/import does not also light up /admin/questions.
  const activeHref = navItems
    .filter((item) => !item.disabled && (pathname === item.href || pathname.startsWith(`${item.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
  const navLabel = (item: NavItem) => (item.labelKey ? (t.nav as Record<string, string>)[item.labelKey] : undefined) ?? item.label;

  return (
    <div className={styles.shell}>
      <aside className={cn(styles.sidebar, mobileOpen && styles.sidebarOpen)}>
        <div className={styles.brand}>{renderBrand(brandLabel)}</div>
        <nav aria-label={t.nav.mainNavigation} className={styles.nav}>
          {navItems.map((item) =>
            item.disabled ? (
              <span key={item.href} className={styles.navItemDisabled} aria-disabled="true">
                {navLabel(item)}
              </span>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(styles.navItem, item.href === activeHref && styles.navItemActive)}
                aria-current={item.href === activeHref ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
              >
                {item.icon && <Icon name={item.icon} />}
                {navLabel(item)}
              </Link>
            )
          )}
        </nav>
      </aside>

      {mobileOpen && <div className={styles.backdrop} onClick={() => setMobileOpen(false)} aria-hidden="true" />}

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            className={styles.menuToggle}
            aria-label={t.nav.openNavigation}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((value) => !value)}
          >
            ☰
          </button>
          <span className={styles.topbarTitle}>
            {(activeHref && navLabel(navItems.find((item) => item.href === activeHref) as NavItem)) || brandLabel}
          </span>
          {onLogout && (
            <div className={styles.userArea}>
              <LanguageSwitcher />
              {userName && <span className={styles.userName}>{userName}</span>}
              {userName && (
                <span className={styles.avatar} aria-hidden="true">
                  {getInitials(userName)}
                </span>
              )}
              <button type="button" className={styles.logoutButton} onClick={onLogout}>
                {logoutLabel}
              </button>
            </div>
          )}
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
