"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ExamDetailFields } from "@/components/exam/ExamDetailFields";
import { attemptApi } from "@/lib/attempt/attempt-api";
import { examApi } from "@/lib/exam/exam-api";
import { ApiError } from "@/lib/api/errors";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { ExamAttemptResponse } from "@/types/attempt";
import type { ExamResponse } from "@/types/exam";
import styles from "./page.module.css";

/**
 * Student view of a single published exam (GET /api/v1/exams/{id}) - the
 * backend only ever returns PUBLISHED exams here, reporting anything else
 * as not found. Also checks for an already-active attempt (GET
 * /exams/{id}/attempts/current, which never creates one) so the primary
 * action is "Start" or "Continue" as appropriate (see ExamAttemptService).
 */
export default function StudentExamDetailPage() {
  const t = useTranslation();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [exam, setExam] = useState<ExamResponse | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<ExamAttemptResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const startingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([examApi.getById(id), attemptApi.getCurrent(id)])
      .then(([examResponse, attemptResponse]) => {
        if (cancelled) return;
        setExam(examResponse);
        setCurrentAttempt(attemptResponse);
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

  async function handleStart() {
    if (startingRef.current) return;
    startingRef.current = true;
    setStarting(true);
    setStartError(null);
    try {
      const attempt = await attemptApi.start(id);
      router.push(`/exam/${attempt.attemptId}`);
      // Deliberately no finally-reset here: navigation is in flight, and
      // leaving the button disabled avoids a second click firing before it lands.
    } catch (err: unknown) {
      if (err instanceof ApiError && err.code === "ACTIVE_ATTEMPT_ALREADY_EXISTS") {
        // Lost a race with another tab/request: recover the real attempt
        // instead of just showing an error the student can't act on.
        try {
          const existing = await attemptApi.getCurrent(id);
          if (existing) {
            router.push(`/exam/${existing.attemptId}`);
            return;
          }
        } catch {
          // Fall through to the generic error below.
        }
      }
      setStartError(apiErrorMessage(err));
      startingRef.current = false;
      setStarting(false);
    }
  }

  function handleContinue() {
    if (currentAttempt) router.push(`/exam/${currentAttempt.attemptId}`);
  }

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
            <div style={{ marginTop: "var(--space-3)" }}>
              <ButtonLink href={`/student/exams/${exam.id}/statistics`} variant="secondary" size="sm">
                {t.statistics.viewStatistics}
              </ButtonLink>
            </div>
          </div>

          <Card>
            <ExamDetailFields exam={exam} />
          </Card>

          <Card>
            <div className={styles.startSection}>
              {startError && (
                <Alert variant="error" title={t.common.error}>
                  {startError}
                </Alert>
              )}

              {currentAttempt ? (
                <Button onClick={handleContinue}>{t.attempt.start.continueAction}</Button>
              ) : (
                <Button onClick={() => void handleStart()} loading={starting} disabled={starting}>
                  {starting ? t.attempt.start.starting : t.attempt.start.action}
                </Button>
              )}
              <span className={styles.startHelp}>{t.exam.student.startExamHelp}</span>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
