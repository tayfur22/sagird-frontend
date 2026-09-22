"use client";

import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { fromDateTimeLocalValue, toDateTimeLocalValue } from "@/lib/exam/format";
import { apiErrorMessage, fieldErrorsFrom, validationMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { ExamFormRequest, ExamResponse, ExamType } from "@/types/exam";
import styles from "./ExamForm.module.css";

const EXAM_TYPES: ExamType[] = ["WEEKLY", "SPECIAL", "MONTHLY"];
const CURRENCIES = ["AZN", "USD", "EUR"];

export interface ExamFormProps {
  /** When set, the form is pre-filled for editing; otherwise it starts blank (create). */
  initialValue?: ExamResponse;
  submitLabel: string;
  /** Should throw (an ApiError, typically) on failure so the form can show field/general errors. */
  onSubmit: (request: ExamFormRequest) => Promise<void>;
}

/**
 * Create/edit exam form. Mirrors CreateExamRequest/UpdateExamRequest on the
 * backend field-for-field; client-side checks mirror the DTO's bean
 * validation so obviously-invalid input never round-trips to the server,
 * while the server remains the source of truth (its field errors, if any,
 * override these on submit).
 */
export function ExamForm({ initialValue, submitLabel, onSubmit }: ExamFormProps) {
  const t = useTranslation();

  const [title, setTitle] = useState(initialValue?.title ?? "");
  const [description, setDescription] = useState(initialValue?.description ?? "");
  const [type, setType] = useState<ExamType>(initialValue?.type ?? "WEEKLY");
  const [durationMinutes, setDurationMinutes] = useState(initialValue ? String(initialValue.durationMinutes) : "");
  const [price, setPrice] = useState(initialValue ? String(initialValue.price) : "");
  const [currency, setCurrency] = useState(initialValue?.currency ?? "AZN");
  const [subscriptionRequired, setSubscriptionRequired] = useState(initialValue?.subscriptionRequired ?? false);
  const [registrationStartAt, setRegistrationStartAt] = useState(
    toDateTimeLocalValue(initialValue?.registrationStartAt ?? null)
  );
  const [registrationEndAt, setRegistrationEndAt] = useState(
    toDateTimeLocalValue(initialValue?.registrationEndAt ?? null)
  );
  const [publishAt, setPublishAt] = useState(toDateTimeLocalValue(initialValue?.publishAt ?? null));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const typeOptions = EXAM_TYPES.map((value) => ({ value, label: t.exam.types[value] }));
  const currencyOptions = CURRENCIES.map((value) => ({ value, label: value }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const clientErrors: Record<string, string> = {};
    if (!title.trim()) {
      clientErrors.title = validationMessage("REQUIRED");
    } else if (title.trim().length > 200) {
      clientErrors.title = validationMessage("TOO_LONG");
    }

    if (!currency.trim()) {
      clientErrors.currency = validationMessage("REQUIRED");
    } else if (currency.trim().length !== 3) {
      clientErrors.currency = validationMessage("INVALID_CURRENCY");
    }

    const durationValue = Number(durationMinutes);
    if (!durationMinutes.trim() || !Number.isFinite(durationValue) || durationValue <= 0) {
      clientErrors.durationMinutes = validationMessage("INVALID_DURATION");
    }

    const priceValue = Number(price);
    if (!price.trim() || !Number.isFinite(priceValue) || priceValue < 0) {
      clientErrors.price = validationMessage("INVALID_PRICE");
    }

    const startIso = fromDateTimeLocalValue(registrationStartAt);
    const endIso = fromDateTimeLocalValue(registrationEndAt);
    if (startIso && endIso && new Date(endIso).getTime() <= new Date(startIso).getTime()) {
      clientErrors.registrationEndAt = validationMessage("INVALID_EXAM_REGISTRATION_PERIOD");
    }

    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        type,
        durationMinutes: durationValue,
        price: priceValue,
        currency: currency.trim().toUpperCase(),
        subscriptionRequired,
        registrationStartAt: startIso,
        registrationEndAt: endIso,
        publishAt: fromDateTimeLocalValue(publishAt),
      });
    } catch (error) {
      const serverFieldErrors = fieldErrorsFrom(error);
      setErrors(serverFieldErrors);
      setFormError(Object.keys(serverFieldErrors).length > 0 ? null : apiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {formError && <Alert variant="error">{formError}</Alert>}

        <Input
          label={t.exam.form.title}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          errorText={errors.title}
          required
        />

        <Textarea
          label={t.exam.form.description}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          errorText={errors.description}
        />

        <div className={styles.row}>
          <Select
            label={t.exam.form.type}
            options={typeOptions}
            value={type}
            onChange={(event) => setType(event.target.value as ExamType)}
            errorText={errors.type}
            required
          />
          <Input
            label={t.exam.form.durationMinutes}
            type="number"
            min={1}
            step={1}
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(event.target.value)}
            errorText={errors.durationMinutes}
            required
          />
        </div>

        <div className={styles.row}>
          <Input
            label={t.exam.form.price}
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            errorText={errors.price}
            required
          />
          <Select
            label={t.exam.form.currency}
            options={currencyOptions}
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            errorText={errors.currency}
            required
          />
        </div>

        <Checkbox
          label={t.exam.form.subscriptionRequired}
          checked={subscriptionRequired}
          onChange={(event) => setSubscriptionRequired(event.target.checked)}
        />

        <div className={styles.row}>
          <Input
            label={t.exam.form.registrationStartAt}
            type="datetime-local"
            value={registrationStartAt}
            onChange={(event) => setRegistrationStartAt(event.target.value)}
            errorText={errors.registrationStartAt}
          />
          <Input
            label={t.exam.form.registrationEndAt}
            type="datetime-local"
            value={registrationEndAt}
            onChange={(event) => setRegistrationEndAt(event.target.value)}
            errorText={errors.registrationEndAt}
          />
        </div>

        <Input
          label={t.exam.form.publishAt}
          helpText={t.exam.form.publishAtHelp}
          type="datetime-local"
          value={publishAt}
          onChange={(event) => setPublishAt(event.target.value)}
          errorText={errors.publishAt}
        />

        <div className={styles.actions}>
          <Button type="submit" loading={saving}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
}
