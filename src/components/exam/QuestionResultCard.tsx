import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { QuestionResult } from "@/types/attempt-result";
import type { StudentQuestionOption } from "@/types/attempt-question";
import { ExplanationSection } from "./ExplanationSection";

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
 *
 * Presentation only: dark slate card (Gemini design). The data/logic is unchanged.
 */
export function QuestionResultCard({ question, options, attemptId }: QuestionResultCardProps) {
  const t = useTranslation();
  const d = t.attempt.detailedResult;

  const isChoiceType = question.questionType !== "SHORT_ANSWER";
  const hasTextAnswer = question.textAnswer !== null && question.textAnswer.trim() !== "";

  const isCorrect = question.correct === true;
  const isIncorrect = question.correct === false;

  const selectedOptionText =
    isChoiceType && options
      ? options
          .filter((option) => question.selectedOptionIds.includes(option.id))
          .map((option) => option.optionText)
          .join(", ")
      : "";

  let answerText: string | null = null;
  if (!question.answered) answerText = d.notAnswered;
  else if (!isChoiceType) answerText = hasTextAnswer ? question.textAnswer : d.notAnswered;
  else if (options) answerText = selectedOptionText || "\u2014";

  const answerColor = isCorrect ? "text-emerald-400" : isIncorrect ? "text-red-400" : "text-slate-200";

  const borderColor = isCorrect ? "border-emerald-500/30" : isIncorrect ? "border-red-500/30" : "border-slate-800";

  return (
    <div className={`bg-slate-900 border border-solid rounded-2xl p-6 shadow-sm ${borderColor}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-400 uppercase">
          {d.questionLabel.replace("{number}", String(question.displayOrder))}
        </span>
        {isCorrect && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-solid border-emerald-500/20">
            ✓ {d.correctLabel}
          </span>
        )}
        {isIncorrect && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-solid border-red-500/20">
            ✕ {d.incorrectLabel}
          </span>
        )}
        {question.correct === null && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-solid border-slate-700">
            {question.answered ? t.attempt.exam.answered : t.attempt.exam.unanswered}
          </span>
        )}
      </div>

      <h4 className="text-base font-semibold text-white mb-1 break-words">{question.questionText}</h4>
      <p className="text-xs text-slate-500 mb-4">
        {t.question.types[question.questionType]} ·{" "}
        {d.pointsFormat.replace("{awarded}", String(question.awardedPoints)).replace("{points}", String(question.points))}
      </p>

      <div className="space-y-2 text-sm">
        <div className="text-slate-300">
          {d.yourAnswer}:{" "}
          {answerText !== null ? (
            <strong className={`${answerColor} whitespace-pre-wrap break-words`}>{answerText}</strong>
          ) : (
            <span className="text-slate-400">{d.optionsUnavailable}</span>
          )}
        </div>

        <div
          className="mt-3 [--color-text:#e2e8f0] [--color-text-muted:#94a3b8] [--color-surface:#0f172a] [--color-background:#020617] [--color-border:#1e293b] [--color-border-strong:#334155] [--color-primary:#60a5fa] [--color-primary-light:#1e293b]"
        >
          <ExplanationSection attemptId={attemptId} questionId={question.questionId} />
        </div>
      </div>
    </div>
  );
}
