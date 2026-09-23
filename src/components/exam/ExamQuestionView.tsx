"use client";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { AnswerValue, SaveStatus } from "@/hooks/useAnswerAutosave";
import type { StudentQuestion } from "@/types/attempt-question";
import { AnswerInput } from "./AnswerInput";
import { AutosaveIndicator } from "./AutosaveIndicator";
import { ListeningQuestion } from "./ListeningQuestion";
import { QuestionNavigator } from "./QuestionNavigator";
import styles from "./ExamQuestionView.module.css";

interface ExamQuestionViewProps {
  attemptId: string;
  questions: StudentQuestion[];
  loading: boolean;
  error: string | null;
  onRetryLoad: () => void;
  answers: Record<string, AnswerValue>;
  statuses: Record<string, SaveStatus>;
  errors: Record<string, string>;
  setAnswer: (questionId: string, value: AnswerValue) => void;
  retrySave: (questionId: string) => void;
  disabled: boolean;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onListeningPlaybackUpdate: (questionId: string, update: { playCount: number; maxPlays: number; remainingPlays: number }) => void;
}

/**
 * The Phase 8B exam-taking surface: loads/renders the current question,
 * autosaves answers, and lets the student move between questions. Never
 * computes or shows correctness/score (Phase 8A never sends it either).
 */
export function ExamQuestionView({
  attemptId,
  questions,
  loading,
  error,
  onRetryLoad,
  answers,
  statuses,
  errors,
  setAnswer,
  retrySave,
  disabled,
  currentIndex,
  onIndexChange,
  onListeningPlaybackUpdate,
}: ExamQuestionViewProps) {
  const t = useTranslation();

  if (loading) {
    return (
      <Card>
        <div className={styles.skeleton}>
          <Skeleton width="40%" height={16} />
          <Skeleton width="90%" height={24} />
          <Skeleton width="100%" height={120} />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Alert variant="error" title={t.common.error}>
          <p>{error}</p>
          <Button variant="secondary" size="sm" onClick={onRetryLoad} style={{ marginTop: "var(--space-3)" }}>
            {t.common.retry}
          </Button>
        </Alert>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card>
        <EmptyState title={t.attempt.exam.noQuestions.title} description={t.attempt.exam.noQuestions.description} />
      </Card>
    );
  }

  const question = questions[currentIndex];

if (!question) {
  return null;
}

const value = answers[question.questionId] ?? {
  selectedOptionIds: [],
  textAnswer: null,
};
const status = statuses[question.questionId] ?? "idle";
  return (
    <div className={styles.wrapper}>
      <QuestionNavigator questions={questions} answers={answers} currentIndex={currentIndex} onSelect={onIndexChange} />

      <Card>
        <div className={styles.questionHeader}>
          <span className={styles.questionCount}>
            {t.attempt.exam.questionOf.replace("{current}", String(currentIndex + 1)).replace("{total}", String(questions.length))}
          </span>
          <span className={styles.questionType}>{t.question.types[question.type]}</span>
        </div>

        {question.modality === "LISTENING" && (
          <ListeningQuestion
            attemptId={attemptId}
            question={question}
            disabled={disabled}
            onPlaybackUpdate={onListeningPlaybackUpdate}
          />
        )}

        <p className={styles.questionText}>{question.questionText}</p>

        <AnswerInput
          questionId={question.questionId}
          type={question.type}
          options={question.options}
          value={value}
          disabled={disabled}
          onChange={(next) => setAnswer(question.questionId, next)}
        />

        <AutosaveIndicator status={status} errorText={errors[question.questionId]} onRetry={() => retrySave(question.questionId)} />
      </Card>

      <div className={styles.navActions}>
        <Button variant="secondary" disabled={currentIndex === 0} onClick={() => onIndexChange(currentIndex - 1)}>
          {t.attempt.exam.previous}
        </Button>
        <Button variant="secondary" disabled={currentIndex === questions.length - 1} onClick={() => onIndexChange(currentIndex + 1)}>
          {t.attempt.exam.next}
        </Button>
      </div>
    </div>
  );
}
