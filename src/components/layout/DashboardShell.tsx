"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
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

  return (
    <div className={styles.shell}>
      <aside className={cn(styles.sidebar, mobileOpen && styles.sidebarOpen)}>
        <div className={styles.brand}>{brandLabel}</div>
        <nav aria-label="Panel naviqasiyası" className={styles.nav}>
          {navItems.map((item) =>
            item.disabled ? (
              <span key={item.href} className={styles.navItemDisabled} aria-disabled="true">
                {item.label}
              </span>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={styles.navItem}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
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
            aria-label="Naviqasiyanı aç"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((value) => !value)}
          >
            ☰
          </button>
          <span className={styles.topbarTitle}>{brandLabel}</span>
          {onLogout && (
            <div className={styles.userArea}>
              {userName && <span className={styles.userName}>{userName}</span>}
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
