"use client";

import { useRouter } from "next/navigation";
import { ExamForm } from "@/components/exam/ExamForm";
import { useToast } from "@/hooks/useToast";
import { adminExamApi } from "@/lib/exam/exam-api";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { ExamFormRequest } from "@/types/exam";
import styles from "../page.module.css";

export default function NewExamPage() {
  const t = useTranslation();
  const router = useRouter();
  const { showToast } = useToast();

  async function handleSubmit(request: ExamFormRequest) {
    const created = await adminExamApi.create(request);
    showToast(t.exam.toasts.created, "success");
    router.push(`/admin/exams/${created.id}`);
  }

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.heading}>{t.exam.create.title}</h1>
        <p className={styles.subtitle}>{t.exam.create.subtitle}</p>
      </div>
      <ExamForm submitLabel={t.exam.create.submit} onSubmit={handleSubmit} />
    </div>
  );
}
