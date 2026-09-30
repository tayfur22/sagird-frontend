"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import { usePublicNav } from "./usePublicNav";
import styles from "./PublicFooter.module.css";

export function PublicFooter() {
  const t = useTranslation();
  const { links } = usePublicNav();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            Şagird<span className={styles.logoAccent}>.az</span>
          </Link>
          <p className={styles.tagline}>{t.footer.tagline}</p>
        </div>

        <nav className={styles.column} aria-labelledby="footer-platform">
          <h2 id="footer-platform" className={styles.heading}>
            {t.footer.platform}
          </h2>
          <ul className={styles.list}>
            {links.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.column}>
          <h2 className={styles.heading}>{t.footer.company}</h2>
          {/* No About/Contact pages exist yet: shown as disabled, the same way the header used to. */}
          <ul className={styles.list}>
            <li>
              <span className={styles.linkDisabled} aria-disabled="true">
                {t.nav.about}
              </span>
            </li>
            <li>
              <span className={styles.linkDisabled} aria-disabled="true">
                {t.nav.contact}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>© {new Date().getFullYear()} Şagird.az</div>
    </footer>
  );
}
