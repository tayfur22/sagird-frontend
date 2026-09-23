"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AttemptResult } from "@/components/exam/AttemptResult";
import { AttemptStatusBadge } from "@/components/exam/AttemptStatusBadge";
import { AttemptTimer } from "@/components/exam/AttemptTimer";
import { ExamQuestionView } from "@/components/exam/ExamQuestionView";
import { isAnswerFilled } from "@/components/exam/QuestionNavigator";
import { useAnswerAutosave } from "@/hooks/useAnswerAutosave";
import { useAttemptTimer } from "@/hooks/useAttemptTimer";
import { attemptApi } from "@/lib/attempt/attempt-api";
import { examApi } from "@/lib/exam/exam-api";
import { ApiError } from "@/lib/api/errors";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { ExamAttemptResponse } from "@/types/attempt";
import type { StudentQuestion } from "@/types/attempt-question";
import type { ExamResponse } from "@/types/exam";
import styles from "./page.module.css";

/**
 * The active-attempt shell (Phase 7B). No real questions yet - see
 * ExamAttemptService (Phase 7A) for what the backend actually supports:
 * IN_PROGRESS -> SUBMITTED, and lazy EXPIRED on read/write. This page only
 * ever reflects what the server returns; it never decides expiry itself.
 */
export default function ExamAttemptPage() {
  return (
    <RequireAuth role="STUDENT">
      <AttemptView />
    </RequireAuth>
  );
}

function AttemptView() {
  const t = useTranslation();
  const params = useParams<{ attemptId: string }>();
  const attemptId = params.attemptId;

  const [attempt, setAttempt] = useState<ExamAttemptResponse | null>(null);
  const [exam, setExam] = useState<ExamResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submittingRef = useRef(false);

  const [questions, setQuestions] = useState<StudentQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [questionsRetryToken, setQuestionsRetryToken] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reloads the attempt from the server - used both for manual retry and as
  // the timer's onExpire hook, so a local "time's up" always gets confirmed
  // (and persisted as EXPIRED) by the server, never assumed on the client.
  const reloadAttempt = useCallback(() => {
    let cancelled = false;
    attemptApi
      .getById(attemptId)
      .then((response) => {
        if (!cancelled) setAttempt(response);
      })
      .catch(() => {
        // Silent: the visible error state already came from the initial load,
        // and a transient failure here shouldn't interrupt an in-progress exam.
      });
    return () => {
      cancelled = true;
    };
  }, [attemptId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    attemptApi
      .getById(attemptId)
      .then(async (attemptResponse) => {
        if (cancelled) return;
        setAttempt(attemptResponse);
        const examResponse = await examApi.getById(attemptResponse.examId);
        if (!cancelled) setExam(examResponse);
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
  }, [attemptId, retryToken]);

  const onExpire = useCallback(() => {
    reloadAttempt();
  }, [reloadAttempt]);

  const { seconds, urgency } = useAttemptTimer(attempt, onExpire);

  const attemptInProgress = attempt?.status === "IN_PROGRESS";

  useEffect(() => {
    if (!attemptInProgress) return;
    let cancelled = false;
    setQuestionsLoading(true);
    setQuestionsError(null);

    attemptApi
      .getQuestions(attemptId)
      .then((response) => {
        if (cancelled) return;
        setQuestions(response);
        setCurrentIndex(0);
      })
      .catch((err: unknown) => {
        if (!cancelled) setQuestionsError(apiErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setQuestionsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // Loads once when the attempt is (re)confirmed IN_PROGRESS, or on explicit retry -
    // not on every timer-driven attempt refresh, per the "load once per attempt" requirement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId, attemptInProgress, questionsRetryToken]);

  const canSaveAnswers = attemptInProgress && !submitting;
  const {
    answers,
    statuses: saveStatuses,
    errors: saveErrors,
    setAnswer,
    retry: retrySave,
  } = useAnswerAutosave(attemptId, questions, canSaveAnswers);

  const unansweredCount = questions.length - questions.filter((q) => isAnswerFilled(answers[q.questionId])).length;

  async function handleSubmit() {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const updated = await attemptApi.submit(attemptId);
      setAttempt(updated);
      setConfirmOpen(false);
    } catch (err: unknown) {
      // The attempt was already submitted (e.g. a duplicate click, or a retry after a
      // dropped response) - recover the persisted result instead of showing a failure.
      if (ApiError.isApiError(err) && err.code === "ATTEMPT_ALREADY_SUBMITTED") {
        try {
          const current = await attemptApi.getById(attemptId);
          setAttempt(current);
          setConfirmOpen(false);
        } catch {
          setSubmitError(apiErrorMessage(err));
        }
      } else {
        setSubmitError(apiErrorMessage(err));
      }
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <Card>
          <div className={styles.skeleton}>
            <Skeleton width="60%" height={28} />
            <Skeleton width="40%" height={16} />
            <Skeleton width="100%" height={120} />
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <Alert variant="error" title={t.common.error}>
          <p>{error}</p>
          <Button variant="secondary" size="sm" onClick={() => setRetryToken((v) => v + 1)} style={{ marginTop: "var(--space-3)" }}>
            {t.common.retry}
          </Button>
        </Alert>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className={styles.page}>
        <EmptyState
          title={t.attempt.notFound.title}
          description={t.attempt.notFound.description}
          action={<ButtonLink href="/student/exams">{t.attempt.backToExams}</ButtonLink>}
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>{exam?.title ?? "\u2014"}</h1>
          <AttemptStatusBadge status={attempt.status} />
        </div>
        {attempt.status === "IN_PROGRESS" && <AttemptTimer seconds={seconds} urgency={urgency} />}
      </div>

      {attempt.status === "IN_PROGRESS" && (
        <>
          <ExamQuestionView
            questions={questions}
            loading={questionsLoading}
            error={questionsError}
            onRetryLoad={() => setQuestionsRetryToken((v) => v + 1)}
            answers={answers}
            statuses={saveStatuses}
            errors={saveErrors}
            setAnswer={setAnswer}
            retrySave={retrySave}
            disabled={!canSaveAnswers}
            currentIndex={currentIndex}
            onIndexChange={setCurrentIndex}
          />

          <Card>
            <div className={styles.actionArea}>
              {submitError && (
                <Alert variant="error" title={t.common.error}>
                  {submitError}
                </Alert>
              )}
              <Button variant="primary" onClick={() => setConfirmOpen(true)}>
                {t.attempt.inProgress.submitAction}
              </Button>
            </div>
          </Card>

          <Modal open={confirmOpen} onClose={() => (submitting ? null : setConfirmOpen(false))} title={t.attempt.inProgress.confirmTitle}>
            <p className={styles.confirmText}>{t.attempt.inProgress.confirmDescription}</p>
            {!questionsLoading && !questionsError && questions.length > 0 && (
              <p className={styles.confirmText}>
                {unansweredCount > 0
                  ? t.attempt.exam.confirmUnanswered.replace("{count}", String(unansweredCount))
                  : t.attempt.exam.confirmAllAnswered}
              </p>
            )}
            <div className={styles.confirmActions}>
              <Button variant="secondary" onClick={() => setConfirmOpen(false)} disabled={submitting}>
                {t.attempt.inProgress.confirmCancel}
              </Button>
              <Button variant="primary" onClick={() => void handleSubmit()} loading={submitting}>
                {t.attempt.inProgress.confirmAction}
              </Button>
            </div>
          </Modal>
        </>
      )}

      {attempt.status === "SUBMITTED" && <AttemptResult attempt={attempt} />}

      {attempt.status === "EXPIRED" && (
        <Alert variant="warning" title={t.attempt.expired.title}>
          <p>{t.attempt.expired.description}</p>
          <ButtonLink href="/student/exams" variant="secondary" size="sm" style={{ marginTop: "var(--space-3)" }}>
            {t.attempt.backToExams}
          </ButtonLink>
        </Alert>
      )}

      {attempt.status === "CANCELLED" && (
        <Alert variant="info" title={t.attempt.cancelled.title}>
          <p>{t.attempt.cancelled.description}</p>
          <ButtonLink href="/student/exams" variant="secondary" size="sm" style={{ marginTop: "var(--space-3)" }}>
            {t.attempt.backToExams}
          </ButtonLink>
        </Alert>
      )}
    </div>
  );
}
