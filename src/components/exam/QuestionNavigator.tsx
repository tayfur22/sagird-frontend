"use client";

import { useTranslation } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils/cn";
import type { AnswerValue } from "@/hooks/useAnswerAutosave";
import type { StudentQuestion } from "@/types/attempt-question";
import styles from "./QuestionNavigator.module.css";

interface QuestionNavigatorProps {
  questions: StudentQuestion[];
  answers: Record<string, AnswerValue>;
  currentIndex: number;
  onSelect: (index: number) => void;
}

export function isAnswerFilled(value: AnswerValue | undefined): boolean {
  if (!value) return false;
  return value.selectedOptionIds.length > 0 || Boolean(value.textAnswer && value.textAnswer.trim().length > 0);
}

/** Compact, horizontally-scrollable question palette (spec section 8) - state is shown with a check mark, not color alone. */
export function QuestionNavigator({ questions, answers, currentIndex, onSelect }: QuestionNavigatorProps) {
  const t = useTranslation();
  return (
    <nav className={styles.nav} aria-label={t.attempt.exam.navigatorLabel}>
      <ol className={styles.list}>
        {questions.map((question, index) => {
          const answered = isAnswerFilled(answers[question.questionId]);
          const current = index === currentIndex;
          const stateLabel = answered ? t.attempt.exam.answered : t.attempt.exam.unanswered;
          return (
            <li key={question.questionId}>
              <button
                type="button"
                className={cn(styles.item, answered && styles.answered, current && styles.current)}
                aria-current={current || undefined}
                aria-label={`${t.attempt.exam.questionShort} ${index + 1} \u2013 ${stateLabel}`}
                onClick={() => onSelect(index)}
              >
                <span>{index + 1}</span>
                {answered && (
                  <span className={styles.check} aria-hidden="true">
                    ✓
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
