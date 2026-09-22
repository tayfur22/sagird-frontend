"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ExamQuestionList } from "@/components/question/ExamQuestionList";
import { ExamStatusBadge } from "@/components/exam/ExamStatusBadge";
import { adminExamApi } from "@/lib/exam/exam-api";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { ExamResponse } from "@/types/exam";
import styles from "./page.module.css";

/** Admin exam question management (list/add/remove/reorder), scoped to one exam. */
export default function AdminExamQuestionsPage() {
  const t = useTranslation();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [exam, setExam] = useState<ExamResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    adminExamApi
      .getById(id)
      .then((response) => {
        if (!cancelled) setExam(response);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(apiErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, retryToken]);

  return (
    <div className={styles.page}>
      <Link href={`/admin/exams/${id}`} className={styles.backLink}>
        {t.exam.detail.backToList}
      </Link>

      {loading && (
        <Card>
          <div className={styles.skeleton}>
            <Skeleton width="50%" height={24} />
            <Skeleton width="80%" height={16} />
          </div>
        </Card>
      )}

      {!loading && error && (
        <Alert variant="error" title={t.common.error}>
          <p>{error}</p>
          <Button variant="secondary" size="sm" onClick={() => setRetryToken((v) => v + 1)} style={{ marginTop: "var(--space-3)" }}>
            {t.common.retry}
          </Button>
        </Alert>
      )}

      {!loading && !error && exam && (
        <>
          <div className={styles.header}>
            <div className={styles.titleRow}>
              <h1 className={styles.heading}>{t.question.examQuestions.title.replace("{title}", exam.title)}</h1>
              <ExamStatusBadge status={exam.status} />
            </div>
          </div>

          <ExamQuestionList examId={exam.id} examStatus={exam.status} />
        </>
      )}
    </div>
  );
}
