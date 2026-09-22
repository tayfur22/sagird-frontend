"use client";

import { ButtonLink } from "@/components/ui/Button";
import { QuestionTable } from "@/components/question/QuestionTable";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import styles from "./page.module.css";

export default function AdminQuestionsPage() {
  const t = useTranslation();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>{t.question.adminList.title}</h1>
          <p className={styles.subtitle}>{t.question.adminList.subtitle}</p>
        </div>
        <ButtonLink href="/admin/questions/new">{t.question.adminList.createButton}</ButtonLink>
      </div>

      <QuestionTable />
    </div>
  );
}
