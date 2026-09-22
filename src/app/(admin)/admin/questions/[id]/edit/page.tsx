"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { QuestionForm } from "@/components/question/QuestionForm";
import { useToast } from "@/hooks/useToast";
import { adminQuestionApi } from "@/lib/question/question-api";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { QuestionFormRequest, QuestionResponse } from "@/types/question";
import styles from "../../page.module.css";

export default function EditQuestionPage() {
  const t = useTranslation();
  const router = useRouter();
  const { showToast } = useToast();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [question, setQuestion] = useState<QuestionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    adminQuestionApi
      .getById(id)
      .then((response) => {
        if (!cancelled) setQuestion(response);
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

  async function handleSubmit(request: QuestionFormRequest) {
    const updated = await adminQuestionApi.update(id, request);
    showToast(t.question.toasts.updated, "success");
    router.push(`/admin/questions/${updated.id}`);
  }

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.heading}>{t.question.edit.title}</h1>
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

      {!loading && !error && question && (
        <QuestionForm initialValue={question} submitLabel={t.question.edit.submit} onSubmit={handleSubmit} />
      )}
    </div>
  );
}
