import type { QuestionType } from "./question";

/** Mirrors az.sagird.modules.attempt.dto.StudentQuestionOptionResponse - never includes isCorrect. */
export interface StudentQuestionOption {
  id: string;
  optionText: string;
  displayOrder: number;
}

/**
 * Mirrors az.sagird.modules.attempt.dto.StudentQuestionResponse. `answered`
 * plus the selected/text fields reflect whatever was already saved for this
 * attempt, so the UI can restore state immediately after loading.
 */
export interface StudentQuestion {
  questionId: string;
  questionText: string;
  type: QuestionType;
  points: number;
  displayOrder: number;
  options: StudentQuestionOption[];
  answered: boolean;
  selectedOptionIds: string[];
  textAnswer: string | null;
}

/** Mirrors az.sagird.modules.attempt.dto.SaveAnswerRequest. Exactly one field is populated, per question type. */
export interface SaveAnswerRequest {
  selectedOptionIds?: string[];
  textAnswer?: string | null;
}

/** Mirrors az.sagird.modules.attempt.dto.AttemptAnswerResponse - confirms what the server actually persisted. */
export interface AttemptAnswerResponse {
  questionId: string;
  selectedOptionIds: string[];
  textAnswer: string | null;
  answeredAt: string;
}
