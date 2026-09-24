"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AttemptResult } from "@/components/exam/AttemptResult";
import { QuestionResultCard } from "@/components/exam/QuestionResultCard";
import { attemptApi } from "@/lib/attempt/attempt-api";
import { formatExamDateTime } from "@/lib/exam/format";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { DetailedAttemptResult } from "@/types/attempt-result";
import type { StudentQuestionOption } from "@/types/attempt-question";
import styles from "./page.module.css";

/**
 * Phase 13B: the submitted student's own question-by-question review, for
 * GET /exams/attempts/{attemptId}/result (Phase 13A). Frontend/UX only -
 * see AttemptResultService on the backend for what's actually authoritative
 * here. Never computes score or correctness; never shows a "Correct answer"
 * section (spec section 8).
 */
export default function ExamAttemptResultPage() {
  return (
    <RequireAuth role="STUDENT">
      <DetailedResultView />
    </RequireAuth>
  );
}

function DetailedResultView() {
  const t = useTranslation();
  const params = useParams<{ attemptId: string }>();
  const attemptId = params.attemptId;

  const [result, setResult] = useState<DetailedAttemptResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  // Best-effort option-text lookup. Phase 13A's result response
  // intentionally doesn't carry option text (see types/attempt-result.ts) -
  // this reuses the existing Phase 8A questions endpoint purely to map
  // selectedOptionIds -> option text for choice questions. That endpoint is
  // ownership-guarded like every other attempt endpoint and has no status
  // restriction (AttemptAnswerService#getQuestions only requires
  // ownership), so it already works for a SUBMITTED attempt without any
  // backend change. It never carries isCorrect either way. A failure here
  // is silent and never blocks the result itself - QuestionResultCard falls
  // back to a neutral message for a choice question if this hasn't resolved.
  const [optionsByQuestion, setOptionsByQuestion] = useState<Record<string, StudentQuestionOption[]>>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    attemptApi
      .getResult(attemptId)
      .then((response) => {
        if (!cancelled) setResult(response);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(apiErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    attemptApi
      .getQuestions(attemptId)
      .then((questions) => {
        if (cancelled) return;
        setOptionsByQuestion(Object.fromEntries(questions.map((q) => [q.questionId, q.options])));
      })
      .catch(() => {
        // Silent by design - see the comment on optionsByQuestion above.
      });

    return () => {
      cancelled = true;
    };
  }, [attemptId, retryToken]);

  if (loading) {
    return (
      <div className={styles.page}>
        <Card>
          <div className={styles.skeleton}>
            <Skeleton width="50%" height={24} />
            <Skeleton width="30%" height={16} />
            <Skeleton width="100%" height={100} />
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <Alert variant="error" title={t.attempt.detailedResult.loadError}>
          <p>{error}</p>
          <div className={styles.errorActions}>
            <Button variant="secondary" size="sm" onClick={() => setRetryToken((v) => v + 1)}>
              {t.common.retry}
            </Button>
            <ButtonLink href={`/exam/${attemptId}`} variant="secondary" size="sm">
              {t.attempt.backToExam}
            </ButtonLink>
          </div>
        </Alert>
      </div>
    );
  }

  if (!result) {
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
        <h1 className={styles.title}>{result.examTitle}</h1>
        {result.submittedAt && (
          <span className={styles.submittedAt}>
            {t.attempt.result.submittedAtLabel}: {formatExamDateTime(result.submittedAt)}
          </span>
        )}
      </div>

      <AttemptResult score={result.score} maxScore={result.maxScore} percentage={result.percentage} passed={result.passed} />

      <h2 className={styles.reviewTitle}>{t.attempt.detailedResult.title}</h2>

      {result.questions.length === 0 ? (
        <Card>
          <EmptyState
            title={t.attempt.detailedResult.empty.title}
            description={t.attempt.detailedResult.empty.description}
          />
        </Card>
      ) : (
        <div className={styles.questionList}>
          {result.questions.map((question) => (
            <QuestionResultCard
              key={question.questionId}
              question={question}
              options={optionsByQuestion[question.questionId]}
              attemptId={attemptId}
            />
          ))}
        </div>
      )}

      <div className={styles.actions}>
        <ButtonLink href={`/exam/${attemptId}`} variant="secondary" size="sm">
          {t.attempt.backToExam}
        </ButtonLink>
        <ButtonLink href={`/student/exams/${result.examId}/leaderboard`} variant="secondary" size="sm">
          {t.leaderboard.viewLeaderboard}
        </ButtonLink>
        <ButtonLink href={`/student/exams/${result.examId}/statistics`} variant="secondary" size="sm">
          {t.statistics.viewStatistics}
        </ButtonLink>
        <ButtonLink href="/student/exams" variant="primary" size="sm">
          {t.attempt.backToExams}
        </ButtonLink>
      </div>
    </div>
  );
}
