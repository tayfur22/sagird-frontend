"use client";

import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { apiErrorMessage, fieldErrorsFrom, validationMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { QuestionFormRequest, QuestionResponse, QuestionType } from "@/types/question";
import {
  adjustOptionsForType,
  draftsToOptionRequests,
  optionsToDrafts,
  QuestionOptionEditor,
  type OptionDraft,
} from "./QuestionOptionEditor";
import styles from "./QuestionForm.module.css";

const QUESTION_TYPES: QuestionType[] = ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"];

export interface QuestionFormProps {
  /** When set, the form is pre-filled for editing; otherwise it starts blank (create). */
  initialValue?: QuestionResponse;
  submitLabel: string;
  /** Should throw (an ApiError, typically) on failure so the form can show field/general errors. */
  onSubmit: (request: QuestionFormRequest) => Promise<void>;
}

/**
 * Create/edit question form. Mirrors CreateQuestionRequest/UpdateQuestionRequest
 * on the backend field-for-field; client-side checks mirror the DTO's bean
 * validation plus QuestionService's per-type option rules, so obviously
 * invalid input never round-trips to the server. The server remains the
 * source of truth - its field errors, if any, override these on submit.
 */
export function QuestionForm({ initialValue, submitLabel, onSubmit }: QuestionFormProps) {
  const t = useTranslation();

  const [questionText, setQuestionText] = useState(initialValue?.questionText ?? "");
  const [type, setType] = useState<QuestionType>(initialValue?.type ?? "SINGLE_CHOICE");
  const [explanation, setExplanation] = useState(initialValue?.explanation ?? "");
  const [points, setPoints] = useState(initialValue ? String(initialValue.points) : "1");
  const [options, setOptions] = useState<OptionDraft[]>(() =>
    initialValue ? optionsToDrafts(initialValue.options) : adjustOptionsForType([], "SINGLE_CHOICE", t)
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const typeOptions = QUESTION_TYPES.map((value) => ({ value, label: t.question.types[value] }));

  function handleTypeChange(nextType: QuestionType) {
    setType(nextType);
    setOptions((current) => adjustOptionsForType(current, nextType, t));
  }

  function validateOptions(): string | undefined {
    if (type === "SHORT_ANSWER") return undefined;

    if (options.some((option) => !option.optionText.trim())) {
      return validationMessage("REQUIRED");
    }

    const correctCount = options.filter((option) => option.isCorrect).length;

    if (type === "SINGLE_CHOICE") {
      if (options.length === 0) return validationMessage("INVALID_QUESTION_OPTIONS");
      if (correctCount !== 1) return validationMessage("INVALID_QUESTION_OPTIONS");
    } else if (type === "MULTIPLE_CHOICE") {
      if (options.length === 0) return validationMessage("INVALID_QUESTION_OPTIONS");
      if (correctCount < 1) return validationMessage("INVALID_QUESTION_OPTIONS");
    } else if (type === "TRUE_FALSE") {
      if (options.length !== 2 || correctCount !== 1) return validationMessage("INVALID_QUESTION_OPTIONS");
    }

    return undefined;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const clientErrors: Record<string, string> = {};
    if (!questionText.trim()) {
      clientErrors.questionText = validationMessage("REQUIRED");
    }

    if (explanation.trim().length > 2000) {
      clientErrors.explanation = validationMessage("TOO_LONG");
    }

    const pointsValue = Number(points);
    if (!points.trim() || !Number.isInteger(pointsValue) || pointsValue <= 0) {
      clientErrors.points = validationMessage("INVALID_POINTS");
    }

    const optionsError = validateOptions();
    if (optionsError) {
      clientErrors.options = optionsError;
    }

    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setSaving(true);
    try {
      await onSubmit({
        questionText: questionText.trim(),
        type,
        explanation: explanation.trim() ? explanation.trim() : null,
        points: pointsValue,
        options: type === "SHORT_ANSWER" ? [] : draftsToOptionRequests(options),
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

        <Textarea
          label={t.question.form.questionText}
          value={questionText}
          onChange={(event) => setQuestionText(event.target.value)}
          errorText={errors.questionText}
          required
        />

        <div className={styles.row}>
          <Select
            label={t.question.form.type}
            options={typeOptions}
            value={type}
            onChange={(event) => handleTypeChange(event.target.value as QuestionType)}
            errorText={errors.type}
            required
          />
          <Input
            label={t.question.form.points}
            type="number"
            min={1}
            step={1}
            value={points}
            onChange={(event) => setPoints(event.target.value)}
            errorText={errors.points}
            required
          />
        </div>

        <Textarea
          label={t.question.form.explanation}
          helpText={t.question.form.explanationHelp}
          value={explanation}
          onChange={(event) => setExplanation(event.target.value)}
          errorText={errors.explanation}
        />

        <QuestionOptionEditor type={type} options={options} onChange={setOptions} errorText={errors.options} />

        <div className={styles.actions}>
          <Button type="submit" loading={saving}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
}
