import type { Role } from "./auth";
import type { ExamStatus, ExamType } from "./exam";
import type { AttemptStatus } from "./attempt";
import type { PaymentStatus } from "./payment";
import type { SubscriptionPlan, SubscriptionResponse, SubscriptionStatus } from "./subscription";

/**
 * Mirrors az.sagird.modules.admin.dto.AdminUserRef. Privacy-safe reference
 * to a student: identity only, never credentials or contact extras.
 */
export interface AdminUserRef {
  id: string;
  fullName: string | null;
  email: string | null;
}

/** Mirrors az.sagird.modules.admin.dto.AdminMoneyByCurrency. Amounts are never summed across currencies. */
export interface AdminMoneyByCurrency {
  currency: string;
  amount: number;
}

/**
 * Mirrors az.sagird.modules.admin.dto.AdminDashboardOverviewResponse.
 * `revenueByCurrency` sums SUCCEEDED payments only, one entry per currency.
 */
export interface AdminDashboardOverviewResponse {
  totalStudents: number;
  totalExams: number;
  publishedExams: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  submittedAttempts: number;
  totalPayments: number;
  successfulPayments: number;
  revenueByCurrency: AdminMoneyByCurrency[];
}

/**
 * Mirrors az.sagird.modules.admin.dto.AdminStudentSummaryResponse.
 * `subscriptionStatus` is the effective status of the current/latest
 * subscription; null if the student has none.
 */
export interface AdminStudentSummaryResponse {
  id: string;
  fullName: string;
  email: string;
  city: string | null;
  role: Role;
  enabled: boolean;
  createdAt: string;
  subscriptionStatus: SubscriptionStatus | null;
  hasActiveSubscription: boolean;
}

/** Mirrors az.sagird.modules.admin.dto.AdminStudentDetailResponse. */
export interface AdminStudentDetailResponse {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string | null;
  grade: number | null;
  school: string | null;
  city: string | null;
  role: Role;
  enabled: boolean;
  createdAt: string;
  subscription: {
    totalSubscriptions: number;
    /** The subscription granting access now, else the latest one; null if none. */
    current: SubscriptionResponse | null;
  };
  payments: {
    totalPayments: number;
    successfulPayments: number;
    lastPaidAt: string | null;
    paidByCurrency: AdminMoneyByCurrency[];
  };
  /** Result summary comes from the persisted percentages of SUBMITTED attempts. */
  attempts: {
    totalAttempts: number;
    submittedAttempts: number;
    examsTaken: number;
    averagePercentage: number | null;
    bestPercentage: number | null;
    lastSubmittedAt: string | null;
  };
}

/**
 * Mirrors az.sagird.modules.admin.dto.AdminSubscriptionItemResponse.
 * `status` is the effective status; `active` is true only while access is
 * granted right now.
 */
export interface AdminSubscriptionItemResponse {
  id: string;
  student: AdminUserRef;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  active: boolean;
  startAt: string;
  endAt: string;
  cancelledAt: string | null;
  createdAt: string;
}

/**
 * Mirrors az.sagird.modules.admin.dto.AdminPaymentItemResponse.
 * Deliberately omits gateway identifiers/keys; no card data exists on the backend.
 */
export interface AdminPaymentItemResponse {
  id: string;
  student: AdminUserRef;
  plan: SubscriptionPlan;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string | null;
  failureReason: string | null;
  createdAt: string;
  completedAt: string | null;
}

/**
 * Mirrors az.sagird.modules.admin.dto.AdminAttemptItemResponse. Persisted
 * scoring values only; nothing is re-scored. `passed` stays null - no pass
 * threshold exists in the domain yet.
 */
export interface AdminAttemptItemResponse {
  id: string;
  student: AdminUserRef;
  exam: { id: string; title: string };
  status: AttemptStatus;
  score: number | null;
  maxScore: number | null;
  percentage: number | null;
  passed: boolean | null;
  startedAt: string;
  submittedAt: string | null;
}

/**
 * Mirrors az.sagird.modules.admin.dto.AdminExamSummaryResponse - a superset
 * of ExamResponse (same field names) plus question/participation aggregates.
 */
export interface AdminExamSummaryResponse {
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
  antiCheatEnabled: boolean;
  fullscreenRequired: boolean;
  questionCount: number;
  submittedAttempts: number;
  uniqueParticipants: number;
}
