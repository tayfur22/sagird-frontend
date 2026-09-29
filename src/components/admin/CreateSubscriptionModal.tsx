"use client";

import { useCallback, useRef, useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/hooks/useToast";
import { adminSubscriptionApi } from "@/lib/admin/admin-api";
import { fromDateTimeLocalValue, toDateTimeLocalValue } from "@/lib/exam/format";
import { apiErrorMessage, fieldErrorsFrom, validationMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { AdminStudentSummaryResponse } from "@/types/admin";
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from "@/types/subscription";
import { AdminStudentSelect } from "./AdminStudentSelect";
import styles from "./CreateSubscriptionModal.module.css";

export interface CreateSubscriptionModalProps {
  open: boolean;
  /** Must be referentially stable (useCallback): Modal re-runs its focus effect when it changes. */
  onClose: () => void;
  /** Called after the API accepted the subscription; the parent closes the modal and refreshes the list. */
  onCreated: () => void;
}

function defaultStartValue(): string {
  return toDateTimeLocalValue(new Date().toISOString());
}

/** Mirrors the backend default: one calendar month after the start. */
function defaultEndValue(): string {
  const end = new Date();
  end.setMonth(end.getMonth() + 1);
  return toDateTimeLocalValue(end.toISOString());
}

/**
 * "Grant subscription" dialog (POST /admin/subscriptions). The form lives in
 * an inner component so its state is discarded whenever the modal closes and
 * starts fresh (with default dates) on the next open, while surviving API
 * errors while the modal stays open.
 */
export function CreateSubscriptionModal({ open, onClose, onCreated }: CreateSubscriptionModalProps) {
  const t = useTranslation();
  const submittingRef = useRef(false);

  // Escape / overlay click must not dismiss the dialog mid-request.
  const handleClose = useCallback(() => {
    if (!submittingRef.current) onClose();
  }, [onClose]);

  return (
    <Modal open={open} onClose={handleClose} title={t.admin.subscriptions.create.title}>
      <CreateSubscriptionForm
        onCancel={handleClose}
        onCreated={onCreated}
        onSubmittingChange={(value) => {
          submittingRef.current = value;
        }}
      />
    </Modal>
  );
}

interface CreateSubscriptionFormProps {
  onCancel: () => void;
  onCreated: () => void;
  onSubmittingChange: (submitting: boolean) => void;
}

function CreateSubscriptionForm({ onCancel, onCreated, onSubmittingChange }: CreateSubscriptionFormProps) {
  const t = useTranslation();
  const { showToast } = useToast();

  const [student, setStudent] = useState<AdminStudentSummaryResponse | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan>(SUBSCRIPTION_PLANS[0]);
  const [startAt, setStartAt] = useState(defaultStartValue);
  const [endAt, setEndAt] = useState(defaultEndValue);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // State updates are async; the ref makes a second submit in the same tick impossible.
  const submitLockRef = useRef(false);

  const planOptions = SUBSCRIPTION_PLANS.map((value) => ({ value, label: t.subscription.plans[value] }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitLockRef.current) return;
    setFormError(null);

    const clientErrors: Record<string, string> = {};
    if (!student) clientErrors.userId = validationMessage("REQUIRED");
    if (!plan) clientErrors.plan = validationMessage("REQUIRED");

    const startIso = fromDateTimeLocalValue(startAt);
    const endIso = fromDateTimeLocalValue(endAt);
    if (!startIso) clientErrors.startAt = validationMessage("REQUIRED");
    if (!endIso) clientErrors.endAt = validationMessage("REQUIRED");
    if (startIso && endIso && new Date(endIso).getTime() <= new Date(startIso).getTime()) {
      clientErrors.endAt = validationMessage("INVALID_SUBSCRIPTION_PERIOD");
    }

    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0 || !student || !startIso || !endIso) return;

    submitLockRef.current = true;
    onSubmittingChange(true);
    setSubmitting(true);
    try {
      await adminSubscriptionApi.create({ userId: student.id, plan, startAt: startIso, endAt: endIso });
      showToast(t.admin.subscriptions.create.success, "success");
      onCreated();
    } catch (error) {
      // Keep everything the admin typed; just surface what the server said.
      const serverFieldErrors = fieldErrorsFrom(error);
      setErrors(serverFieldErrors);
      setFormError(Object.keys(serverFieldErrors).length > 0 ? null : apiErrorMessage(error));
    } finally {
      submitLockRef.current = false;
      onSubmittingChange(false);
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {formError && <Alert variant="error">{formError}</Alert>}

      <AdminStudentSelect
        label={t.admin.subscriptions.create.student}
        value={student}
        onChange={setStudent}
        errorText={errors.userId}
        disabled={submitting}
        required
      />

      <Select
        label={t.admin.subscriptions.create.plan}
        options={planOptions}
        value={plan}
        onChange={(event) => setPlan(event.target.value as SubscriptionPlan)}
        errorText={errors.plan}
        disabled={submitting}
        required
      />

      <Input
        label={t.admin.subscriptions.create.startAt}
        type="datetime-local"
        value={startAt}
        onChange={(event) => setStartAt(event.target.value)}
        errorText={errors.startAt}
        disabled={submitting}
        required
      />

      <Input
        label={t.admin.subscriptions.create.endAt}
        type="datetime-local"
        value={endAt}
        onChange={(event) => setEndAt(event.target.value)}
        errorText={errors.endAt}
        disabled={submitting}
        required
      />

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          {t.common.cancel}
        </Button>
        <Button type="submit" loading={submitting}>
          {t.admin.subscriptions.create.submit}
        </Button>
      </div>
    </form>
  );
}
