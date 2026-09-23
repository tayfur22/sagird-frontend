import type { QuestionType } from "./question";

/** Mirrors az.sagird.modules.question.entity.QuestionModality. */
export type QuestionModality = "TEXT" | "LISTENING";

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
 *
 * Phase 11A: for a LISTENING question, `audioDurationSeconds`,
 * `preparationSeconds`, `maxPlays`, `playCount` and `remainingPlays` are
 * populated from the persisted server-side listening state (so a refresh
 * never loses "1/2 plays used"). All five are `null` for a TEXT question.
 * `audioUrl` is deliberately never part of this type - it is only ever
 * handed out by the playback endpoint (see `ListeningPlaybackResponse`).
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
  modality: QuestionModality;
  audioDurationSeconds: number | null;
  preparationSeconds: number | null;
  maxPlays: number | null;
  playCount: number | null;
  remainingPlays: number | null;
}

/**
 * Mirrors az.sagird.modules.attempt.dto.ListeningPlaybackResponse. Returned
 * only by the attempt-scoped playback endpoint - the sole place `audioUrl`
 * is ever exposed, and the sole source of truth for play count/remaining
 * plays after a play request. Never trust a locally computed count instead.
 */
export interface ListeningPlaybackResponse {
  questionId: string;
  audioUrl: string;
  audioDurationSeconds: number | null;
  playCount: number;
  maxPlays: number;
  remainingPlays: number;
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
