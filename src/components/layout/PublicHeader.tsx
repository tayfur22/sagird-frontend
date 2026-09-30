"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthProvider";
import { homePathForRole } from "@/lib/auth/validation";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { usePublicNav } from "./usePublicNav";
import styles from "./PublicHeader.module.css";

export function PublicHeader() {
  // useTranslation (not the module-level `t`) so the header re-renders when the locale changes.
  const t = useTranslation();
  const pathname = usePathname();
  const { links } = usePublicNav();
  const { status, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const signedIn = status === "authenticated" && user;

  // Close the mobile menu on navigation and on Escape.
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const isActive = (href: string) => pathname === href;

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo}>
          Şagird<span className={styles.logoAccent}>.az</span>
        </Link>

        <nav className={styles.desktopNav} aria-label={t.nav.mainNavigation}>
          {links.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={styles.navItem}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <LanguageSwitcher />
          {signedIn ? (
            <ButtonLink href={homePathForRole(user.role)} size="sm">
              {t.nav.dashboard}
            </ButtonLink>
          ) : (
            <div className={styles.desktopOnly}>
              <ButtonLink href="/login" variant="ghost" size="sm">
                {t.nav.login}
              </ButtonLink>
              <ButtonLink href="/register" size="sm">
                {t.nav.register}
              </ButtonLink>
            </div>
          )}
          <button
            type="button"
            className={styles.menuToggle}
            aria-label={menuOpen ? t.nav.closeNavigation : t.nav.openNavigation}
            aria-expanded={menuOpen}
            aria-controls="public-mobile-nav"
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span aria-hidden="true">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="public-mobile-nav" className={styles.mobileNav} aria-label={t.nav.mainNavigation}>
          {links.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={styles.mobileItem}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
          {!signedIn && (
            <div className={styles.mobileActions}>
              <ButtonLink href="/login" variant="secondary" fullWidth>
                {t.nav.login}
              </ButtonLink>
              <ButtonLink href="/register" fullWidth>
                {t.nav.register}
              </ButtonLink>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
