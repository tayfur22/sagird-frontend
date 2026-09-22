import type { ReactNode } from "react";
import { correctOptionSummary, formatQuestionDateTime } from "@/lib/question/format";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { QuestionResponse } from "@/types/question";
import { QuestionStatusBadge } from "./QuestionStatusBadge";
import { QuestionTypeBadge } from "./QuestionTypeBadge";
import styles from "./QuestionDetailFields.module.css";

/**
 * Read-only metadata for one question (GET /api/v1/admin/questions/{id}).
 * Options are shown in displayOrder with the correct answer(s) marked -
 * this is an admin-only view, so `isCorrect` is always safe to render.
 */
export function QuestionDetailFields({ question }: { question: QuestionResponse }) {
  const t = useTranslation();
  const sortedOptions = question.options.slice().sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className={styles.grid}>
      <Field label={t.question.detail.type}>
        <QuestionTypeBadge type={question.type} />
      </Field>

      <Field label={t.question.detail.status}>
        <QuestionStatusBadge active={question.active} />
      </Field>

      <Field label={t.question.detail.points}>{question.points}</Field>

      {question.explanation && <Field label={t.question.detail.explanation}>{question.explanation}</Field>}

      {question.type !== "SHORT_ANSWER" && (
        <Field label={t.question.detail.options}>
          <ul className={styles.optionList}>
            {sortedOptions.map((option) => (
              <li key={option.id} className={styles.optionItem} data-correct={option.isCorrect || undefined}>
                <span>{option.optionText}</span>
                {option.isCorrect && <span className={styles.correctMark}>{t.question.detail.correct}</span>}
              </li>
            ))}
          </ul>
        </Field>
      )}

      {question.type !== "SHORT_ANSWER" && (
        <Field label={t.question.detail.correctCount}>{correctOptionSummary(question.options)}</Field>
      )}

      <Field label={t.question.detail.createdAt}>{formatQuestionDateTime(question.createdAt)}</Field>
      <Field label={t.question.detail.updatedAt}>{formatQuestionDateTime(question.updatedAt)}</Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <div className={styles.fieldValue}>{children}</div>
    </div>
  );
}
