"use client";

import { useRouter } from "next/navigation";
import { QuestionForm } from "@/components/question/QuestionForm";
import { useToast } from "@/hooks/useToast";
import { adminQuestionApi } from "@/lib/question/question-api";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { QuestionFormRequest } from "@/types/question";
import styles from "../page.module.css";

export default function NewQuestionPage() {
  const t = useTranslation();
  const router = useRouter();
  const { showToast } = useToast();

  async function handleSubmit(request: QuestionFormRequest) {
    const created = await adminQuestionApi.create(request);
    showToast(t.question.toasts.created, "success");
    router.push(`/admin/questions/${created.id}`);
  }

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.heading}>{t.question.create.title}</h1>
        <p className={styles.subtitle}>{t.question.create.subtitle}</p>
      </div>
      <QuestionForm submitLabel={t.question.create.submit} onSubmit={handleSubmit} />
    </div>
  );
}
