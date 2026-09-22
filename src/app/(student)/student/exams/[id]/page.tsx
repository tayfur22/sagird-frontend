"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ExamDetailFields } from "@/components/exam/ExamDetailFields";
import { examApi } from "@/lib/exam/exam-api";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { ExamResponse } from "@/types/exam";
import styles from "./page.module.css";

/**
 * Student view of a single published exam (GET /api/v1/exams/{id}) - the
 * backend only ever returns PUBLISHED exams here, reporting anything else
 * as not found. The "Start Exam" action is a disabled placeholder: real
 * attempt behaviour belongs to Phase 7/8, not this phase.
 */
export default function StudentExamDetailPage() {
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

    examApi
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
      <Link href="/student/exams" className={styles.backLink}>
        {t.exam.detail.backToList}
      </Link>

      {loading && (
        <Card>
          <div className={styles.skeleton}>
            <Skeleton width="50%" height={24} />
            <Skeleton width="80%" height={16} />
            <Skeleton width="60%" height={16} />
            <Skeleton width="40%" height={16} />
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
            <h1 className={styles.heading}>{exam.title}</h1>
            {exam.description && <p className={styles.description}>{exam.description}</p>}
          </div>

          <Card>
            <ExamDetailFields exam={exam} />
          </Card>

          <Card>
            <div className={styles.startSection}>
              <Button disabled>{t.exam.student.startExam}</Button>
              <span className={styles.startHelp}>{t.exam.student.startExamHelp}</span>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
