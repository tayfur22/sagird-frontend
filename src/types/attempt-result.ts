import type { QuestionType } from "./question";

/**
 * Mirrors az.sagird.modules.result.dto.QuestionResultResponse exactly.
 * `correctOptionIds`/`correctTextAnswer` intentionally do not exist here:
 * Phase 13A does not expose them (no answer-reveal policy exists yet), so
 * this type must not invent them either. `correct` is `null` for an
 * unanswered question and for SHORT_ANSWER (no authoritative answer key
 * for that type) - render it as neutral, never as incorrect.
 */
export interface QuestionResult {
  questionId: string;
  displayOrder: number;
  questionText: string;
  questionType: QuestionType;
  points: number;
  awardedPoints: number;
  answered: boolean;
  selectedOptionIds: string[];
  textAnswer: string | null;
  correct: boolean | null;
}

/**
 * Mirrors az.sagird.modules.result.dto.DetailedAttemptResultResponse
 * exactly. Only ever returned for the authenticated student's own
 * SUBMITTED attempt (see attemptApi.getResult) - score/maxScore/
 * percentage/passed are the same Phase 10A authoritative values as
 * `ExamAttemptResponse`, never recomputed on the client.
 */
export interface DetailedAttemptResult {
  attemptId: string;
  examId: string;
  examTitle: string;
  submittedAt: string | null;
  score: number | null;
  maxScore: number | null;
  percentage: number | null;
  passed: boolean | null;
  questions: QuestionResult[];
}

/**
 * Mirrors az.sagird.modules.explanation.entity.ExplanationLocale - the only
 * three locales the Phase 14A explanation endpoint ever accepts or
 * returns. Kept separate from `Locale` (src/lib/i18n/config.ts) since the
 * two happen to share the same three values for unrelated reasons (UI
 * language vs. content language); the API layer should not depend on the
 * i18n module.
 */
export type ExplanationLocale = "az" | "en" | "ru";

/**
 * Mirrors az.sagird.modules.explanation.dto.QuestionExplanationResponse
 * (Phase 14A) exactly. `locale` is the locale the content actually came
 * back in - it can differ from the one requested when the backend's
 * requested-locale-then-AZ fallback applied (see ExplanationService).
 */
export interface QuestionExplanation {
  questionId: string;
  locale: ExplanationLocale;
  content: string;
}
