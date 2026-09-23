import type { ReactNode } from "react";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import styles from "./layout.module.css";

/**
 * Deliberately chrome-light: no sidebar, no nav links, nothing that would
 * pull a student's attention away mid-exam (see Phase 7B UX requirements).
 * Just the brand for orientation and the language switcher, since i18n must
 * stay available here too. RequireAuth (in the page itself, alongside the
 * data fetch) is what actually guards this route.
 */
export default function ExamAttemptLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <span className={styles.brand}>Şagird.az</span>
        <LanguageSwitcher />
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
