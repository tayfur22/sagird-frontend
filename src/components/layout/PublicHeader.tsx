"use client";

import Link from "next/link";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthProvider";
import { homePathForRole } from "@/lib/auth/validation";
import { t } from "@/lib/i18n/t";
import type { NavItem } from "@/types/nav";
import styles from "./PublicHeader.module.css";

const NAV_ITEMS: NavItem[] = [
  { label: "Ana səhifə", href: "/" },
  { label: "İmtahanlar", href: "/exams", disabled: true },
  { label: "Liderlər", href: "/leaderboard", disabled: true },
  { label: "Statistika", href: "/statistics", disabled: true },
  { label: "İzahlar", href: "/explanations", disabled: true },
  { label: "Haqqımızda", href: "/about", disabled: true },
];

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { status, user } = useAuth();

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo}>
          Şagird<span className={styles.logoAccent}>.az</span>
        </Link>

        <nav className={styles.desktopNav} aria-label="Əsas naviqasiya">
          {NAV_ITEMS.map((item) =>
            item.disabled ? (
              <span key={item.href} className={styles.navItemDisabled} aria-disabled="true">
                {item.label}
              </span>
            ) : (
              <Link key={item.href} href={item.href} className={styles.navItem}>
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className={styles.actions}>
          {status === "authenticated" && user ? (
            <ButtonLink href={homePathForRole(user.role)} size="sm">
              {t.nav.dashboard}
            </ButtonLink>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="sm">
                {t.nav.login}
              </ButtonLink>
              <ButtonLink href="/register" size="sm">
                {t.nav.register}
              </ButtonLink>
            </>
          )}
          <button
            className={styles.menuToggle}
            aria-label="Menyunu aç"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            ☰
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className={styles.mobileNav} aria-label="Mobil naviqasiya">
          {NAV_ITEMS.map((item) =>
            item.disabled ? (
              <span key={item.href} className={styles.navItemDisabled} aria-disabled="true">
                {item.label}
              </span>
            ) : (
              <Link key={item.href} href={item.href} className={styles.navItem} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            )
          )}
        </nav>
      )}
    </header>
  );
}
