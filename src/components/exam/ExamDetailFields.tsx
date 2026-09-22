import type { ReactNode } from "react";
import { formatDurationMinutes, formatExamDateTime, formatExamPrice } from "@/lib/exam/format";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { ExamResponse } from "@/types/exam";
import { ExamStatusBadge } from "./ExamStatusBadge";
import { ExamTypeBadge } from "./ExamTypeBadge";
import styles from "./ExamDetailFields.module.css";

/**
 * Read-only metadata for one exam. `showAdminFields` adds status and the
 * audit timestamps, which only make sense on the admin detail view - the
 * student view only ever sees PUBLISHED exams and doesn't need them.
 */
export function ExamDetailFields({ exam, showAdminFields = false }: { exam: ExamResponse; showAdminFields?: boolean }) {
  const t = useTranslation();

  return (
    <div className={styles.grid}>
      <Field label={t.exam.detail.type}>
        <ExamTypeBadge type={exam.type} />
      </Field>

      {showAdminFields && (
        <Field label={t.exam.detail.status}>
          <ExamStatusBadge status={exam.status} />
        </Field>
      )}

      <Field label={t.exam.detail.duration}>{formatDurationMinutes(exam.durationMinutes)}</Field>

      <Field label={t.exam.detail.price}>{formatExamPrice(exam.price, exam.currency)}</Field>

      <Field label={t.exam.detail.subscriptionRequired}>
        {exam.subscriptionRequired ? t.exam.subscriptionRequired.yes : t.exam.subscriptionRequired.no}
      </Field>

      <Field label={t.exam.detail.registrationPeriod}>
        {exam.registrationStartAt || exam.registrationEndAt
          ? `${formatExamDateTime(exam.registrationStartAt)} — ${formatExamDateTime(exam.registrationEndAt)}`
          : t.exam.detail.notScheduled}
      </Field>

      <Field label={t.exam.detail.publishAt}>
        {exam.publishAt ? formatExamDateTime(exam.publishAt) : t.exam.detail.notScheduled}
      </Field>

      {showAdminFields && (
        <>
          <Field label={t.exam.detail.createdAt}>{formatExamDateTime(exam.createdAt)}</Field>
          <Field label={t.exam.detail.updatedAt}>{formatExamDateTime(exam.updatedAt)}</Field>
        </>
      )}
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
