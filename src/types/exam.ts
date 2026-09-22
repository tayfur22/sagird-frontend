/** Mirrors az.sagird.modules.exam.entity.ExamType. */
export type ExamType = "WEEKLY" | "SPECIAL" | "MONTHLY";

/** Mirrors az.sagird.modules.exam.entity.ExamStatus. */
export type ExamStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

/**
 * Mirrors az.sagird.modules.exam.dto.ExamResponse. `registrationStartAt`,
 * `registrationEndAt` and `publishAt` are all optional on the backend and
 * come through as null, not omitted.
 */
export interface ExamResponse {
  id: string;
  title: string;
  description: string | null;
  type: ExamType;
  status: ExamStatus;
  durationMinutes: number;
  price: number;
  currency: string;
  subscriptionRequired: boolean;
  registrationStartAt: string | null;
  registrationEndAt: string | null;
  publishAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Shared shape of az.sagird.modules.exam.dto.CreateExamRequest and
 * UpdateExamRequest - the two records have identical fields on the backend.
 */
export interface ExamFormRequest {
  title: string;
  description: string | null;
  type: ExamType;
  durationMinutes: number;
  price: number;
  currency: string;
  subscriptionRequired: boolean;
  registrationStartAt: string | null;
  registrationEndAt: string | null;
  publishAt: string | null;
}

export type CreateExamRequest = ExamFormRequest;
export type UpdateExamRequest = ExamFormRequest;
