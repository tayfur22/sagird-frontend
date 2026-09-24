import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Radio } from "@/components/ui/Radio";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { QuestionResult } from "@/types/attempt-result";
import type { StudentQuestionOption } from "@/types/attempt-question";
import answerInputStyles from "./AnswerInput.module.css";
import { ExplanationSection } from "./ExplanationSection";
import styles from "./QuestionResultCard.module.css";

interface QuestionResultCardProps {
  question: QuestionResult;
  /**
   * Option text for this question, keyed by option id. Phase 13A's result
   * response deliberately doesn't carry option text (see types/attempt-
   * result.ts), so the caller merges it in from the existing Phase 8A
   * questions endpoint on a best-effort basis - `undefined` here just means
   * that merge hasn't resolved (or failed), never that the question has no
   * options. Never carries `isCorrect` either way.
   */
  options?: StudentQuestionOption[];
  /**
   * Phase 14B: needed to scope the explanation request to this attempt
   * (GET .../attempts/{attemptId}/questions/{questionId}/explanation).
   * This page only ever renders for the student's own attempt (see
   * ExamAttemptResultPage), so passing it straight through is safe.
   */
  attemptId: string;
}

/**
 * One question on the Phase 13B detailed result page. Shows only what
 * QuestionResultResponse actually provides - never a "Correct answer"
 * section, never a computed/inferred correctness, and never option data
 * beyond plain text (spec section 8). `correct` (when not null) is the
 * already-computed Phase 10A scoring outcome for this answer, not an
 * answer key, so it's safe to surface as-is (spec section 9).
 */
export function QuestionResultCard({ question, options, attemptId }: QuestionResultCardProps) {
  const t = useTranslation();
  const d = t.attempt.detailedResult;

  const isChoiceType = question.questionType !== "SHORT_ANSWER";
  const hasTextAnswer = question.textAnswer !== null && question.textAnswer.trim() !== "";

  return (
    <Card>
      <div className={styles.card}>
        <div className={styles.header}>
          <h3 className={styles.questionLabel}>{d.questionLabel.replace("{number}", String(question.displayOrder))}</h3>
          <span className={styles.typeBadge}>{t.question.types[question.questionType]}</span>
        </div>

        <div className={styles.metaRow}>
          <Badge variant={question.answered ? "info" : "neutral"}>
            {question.answered ? t.attempt.exam.answered : t.attempt.exam.unanswered}
          </Badge>
          {question.correct === true && <Badge variant="success">{d.correctLabel}</Badge>}
          {question.correct === false && <Badge variant="error">{d.incorrectLabel}</Badge>}
          <span className={styles.points}>
            {d.pointsFormat.replace("{awarded}", String(question.awardedPoints)).replace("{points}", String(question.points))}
          </span>
        </div>

        <p className={styles.questionText}>{question.questionText}</p>

        <div className={styles.answerBlock}>
          <span className={styles.answerLabel}>{d.yourAnswer}</span>

          {!question.answered && <p className={styles.notAnswered}>{d.notAnswered}</p>}

          {question.answered && !isChoiceType && (
            <p className={styles.textAnswer}>{hasTextAnswer ? question.textAnswer : d.notAnswered}</p>
          )}

          {question.answered && isChoiceType && options && (
            <div className={question.questionType === "TRUE_FALSE" ? answerInputStyles.optionsRow : answerInputStyles.options}>
              {question.questionType === "MULTIPLE_CHOICE"
                ? options.map((option) => (
                    <Checkbox
                      key={option.id}
                      label={option.optionText}
                      checked={question.selectedOptionIds.includes(option.id)}
                      disabled
                      readOnly
                    />
                  ))
                : options.map((option) => (
                    <Radio
                      key={option.id}
                      name={`result-${question.questionId}`}
                      label={option.optionText}
                      checked={question.selectedOptionIds[0] === option.id}
                      disabled
                      readOnly
                    />
                  ))}
            </div>
          )}

          {question.answered && isChoiceType && !options && <p className={styles.notAnswered}>{d.optionsUnavailable}</p>}
        </div>

        <ExplanationSection attemptId={attemptId} questionId={question.questionId} />
      </div>
    </Card>
  );
}
