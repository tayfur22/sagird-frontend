"use client";

import Link from "next/link";
import { QuestionImportCard } from "@/components/question/QuestionImportCard";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import styles from "./page.module.css";

/**
 * Phase 18B: Excel/CSV -> Question Bank bulk import (admin-only, same role
 * guard as the rest of /admin via AdminLayout -> AuthenticatedShell).
 * Talks to the Phase 18A endpoint through QuestionImportCard; this route
 * component only owns the page chrome (back link + heading), matching the
 * shape of the other admin/questions pages.
 */
export default function AdminQuestionImportPage() {
  const t = useTranslation();

  return (
    <div className={styles.page}>
      <Link href="/admin/questions" className={styles.backLink}>
        {t.question.import.backLink}
      </Link>

      <div>
        <h1 className={styles.heading}>{t.question.import.title}</h1>
        <p className={styles.subtitle}>{t.question.import.subtitle}</p>
      </div>

      <QuestionImportCard />
    </div>
  );
}
