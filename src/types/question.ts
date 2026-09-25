/** Mirrors az.sagird.modules.question.entity.QuestionType. */
export type QuestionType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";

/** Mirrors az.sagird.modules.question.dto.QuestionOptionResponse. Admin-only - includes isCorrect. */
export interface QuestionOptionResponse {
  id: string;
  optionText: string;
  isCorrect: boolean;
  displayOrder: number;
}

/**
 * Mirrors az.sagird.modules.question.dto.QuestionResponse. `explanation` is
 * optional on the backend and comes through as null, not omitted. There is
 * no student-facing equivalent in this phase, so `options` always includes
 * `isCorrect`.
 */
export interface QuestionResponse {
  id: string;
  questionText: string;
  type: QuestionType;
  explanation: string | null;
  points: number;
  active: boolean;
  options: QuestionOptionResponse[];
  createdAt: string;
  updatedAt: string;
}

/** Mirrors az.sagird.modules.question.dto.QuestionOptionRequest. */
export interface QuestionOptionRequest {
  optionText: string;
  isCorrect: boolean;
  displayOrder: number;
}

/**
 * Shared shape of az.sagird.modules.question.dto.CreateQuestionRequest and
 * UpdateQuestionRequest - the two records have identical fields on the
 * backend. `options` is omitted (or empty) for SHORT_ANSWER.
 */
export interface QuestionFormRequest {
  questionText: string;
  type: QuestionType;
  explanation: string | null;
  points: number;
  options: QuestionOptionRequest[];
}

export type CreateQuestionRequest = QuestionFormRequest;
export type UpdateQuestionRequest = QuestionFormRequest;

/** Query filters for GET /api/v1/admin/questions. All optional. */
export interface QuestionListFilters {
  type?: QuestionType;
  active?: boolean;
  search?: string;
}

/** Mirrors az.sagird.modules.question.dto.ExamQuestionResponse - one row of an exam's question list. */
export interface ExamQuestionResponse {
  id: string;
  question: QuestionResponse;
  displayOrder: number;
}

/** Mirrors az.sagird.modules.question.dto.ReorderExamQuestionsRequest. */
export interface ReorderExamQuestionsRequest {
  questionIds: string[];
}

/**
 * Mirrors az.sagird.modules.question.dto.QuestionImportRowError (Phase
 * 18A). `code` is one of the IMPORT_* ErrorCode values; `message` is the
 * backend's own (English) detail for that specific row/field, kept as-is
 * since it carries the exact invalid value and cannot be reconstructed
 * from a fixed translation.
 */
export interface QuestionImportRowError {
  row: number;
  field: string;
  code: string;
  message: string;
}

/**
 * Mirrors az.sagird.modules.question.dto.QuestionImportSummary. The import
 * is all-or-nothing: either `importedRows === totalRows` with no errors,
 * or `importedRows === 0` and `errors` describes what failed. `errors` may
 * be a truncated view of `totalErrorCount` (capped server-side).
 */
export interface QuestionImportSummary {
  totalRows: number;
  importedRows: number;
  failedRows: number;
  totalErrorCount: number;
  returnedErrorCount: number;
  errors: QuestionImportRowError[];
}
