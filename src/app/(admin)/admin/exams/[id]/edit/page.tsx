"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { ExamForm } from "@/components/exam/ExamForm";
import { useToast } from "@/hooks/useToast";
import { adminExamApi } from "@/lib/exam/exam-api";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { ExamFormRequest, ExamResponse } from "@/types/exam";
import styles from "../../page.module.css";

export default function EditExamPage() {
  const t = useTranslation();
  const router = useRouter();
  const { showToast } = useToast();
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

  async function handleSubmit(request: ExamFormRequest) {
    const updated = await adminExamApi.update(id, request);
    showToast(t.exam.toasts.updated, "success");
    router.push(`/admin/exams/${updated.id}`);
  }

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.heading}>{t.exam.edit.title}</h1>
      </div>

      {loading && (
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <Skeleton width="60%" height={16} />
            <Skeleton width="40%" height={16} />
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
        <ExamForm initialValue={exam} submitLabel={t.exam.edit.submit} onSubmit={handleSubmit} />
      )}
    </div>
  );
}
