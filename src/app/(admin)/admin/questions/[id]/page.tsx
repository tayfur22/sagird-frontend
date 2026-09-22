"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { QuestionDetailFields } from "@/components/question/QuestionDetailFields";
import { QuestionStatusBadge } from "@/components/question/QuestionStatusBadge";
import { useToast } from "@/hooks/useToast";
import { adminQuestionApi } from "@/lib/question/question-api";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { QuestionResponse } from "@/types/question";
import styles from "./page.module.css";

/** Read-only admin view of a single question (GET /api/v1/admin/questions/{id}), with activate/deactivate. */
export default function AdminQuestionDetailPage() {
  const t = useTranslation();
  const { showToast } = useToast();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [question, setQuestion] = useState<QuestionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const [actioning, setActioning] = useState(false);

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

  async function handleToggleActive() {
    if (!question) return;
    setActioning(true);
    try {
      const updated = question.active ? await adminQuestionApi.deactivate(id) : await adminQuestionApi.activate(id);
      setQuestion(updated);
      showToast(updated.active ? t.question.toasts.activated : t.question.toasts.deactivated, "success");
    } catch (err) {
      showToast(apiErrorMessage(err), "error");
    } finally {
      setActioning(false);
    }
  }

  return (
    <div className={styles.page}>
      <Link href="/admin/questions" className={styles.backLink}>
        {t.question.detail.backToList}
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

      {!loading && !error && question && (
        <>
          <div className={styles.header}>
            <div className={styles.titleRow}>
              <h1 className={styles.heading}>{question.questionText}</h1>
              <QuestionStatusBadge active={question.active} />
            </div>

            <div className={styles.actions}>
              <ButtonLink href={`/admin/questions/${question.id}/edit`} variant="secondary" size="sm">
                {t.question.table.actions.edit}
              </ButtonLink>
              <Button
                variant={question.active ? "danger" : "primary"}
                size="sm"
                onClick={() => void handleToggleActive()}
                loading={actioning}
                disabled={actioning}
              >
                {question.active ? t.question.detail.deactivate : t.question.detail.activate}
              </Button>
            </div>
          </div>

          <Card>
            <QuestionDetailFields question={question} />
          </Card>
        </>
      )}
    </div>
  );
}
