"use client";

import { useId } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Radio } from "@/components/ui/Radio";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { QuestionOptionRequest, QuestionOptionResponse, QuestionType } from "@/types/question";
import styles from "./QuestionOptionEditor.module.css";

/** Client-only draft shape. `key` is a stable React key, never sent to the backend. */
export interface OptionDraft {
  key: string;
  optionText: string;
  isCorrect: boolean;
}

function makeKey(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `option-${Math.random()}`;
}

export function optionsToDrafts(options: QuestionOptionResponse[]): OptionDraft[] {
  return options
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((option) => ({ key: option.id, optionText: option.optionText, isCorrect: option.isCorrect }));
}

/** Serializes drafts to the backend request shape; displayOrder is always the current array index. */
export function draftsToOptionRequests(drafts: OptionDraft[]): QuestionOptionRequest[] {
  return drafts.map((draft, index) => ({
    optionText: draft.optionText,
    isCorrect: draft.isCorrect,
    displayOrder: index,
  }));
}

/**
 * Resets/reshapes a draft option list when the question type changes, so
 * the editor never shows a shape the backend would reject (e.g. more than
 * two TRUE_FALSE options, or any options at all for SHORT_ANSWER).
 */
export function adjustOptionsForType(
  drafts: OptionDraft[],
  type: QuestionType,
  dictionary: ReturnType<typeof useTranslation>
): OptionDraft[] {
  if (type === "SHORT_ANSWER") return [];

  if (type === "TRUE_FALSE") {
    if (drafts.length === 2) return drafts;
    return [
      { key: makeKey(), optionText: dictionary.question.options.trueLabel, isCorrect: true },
      { key: makeKey(), optionText: dictionary.question.options.falseLabel, isCorrect: false },
    ];
  }

  if (drafts.length === 0) {
    return [
      { key: makeKey(), optionText: "", isCorrect: true },
      { key: makeKey(), optionText: "", isCorrect: false },
    ];
  }

  if (type === "SINGLE_CHOICE") {
    const firstCorrectIndex = drafts.findIndex((draft) => draft.isCorrect);
    return drafts.map((draft, index) => ({ ...draft, isCorrect: index === firstCorrectIndex }));
  }

  return drafts;
}

export interface QuestionOptionEditorProps {
  type: QuestionType;
  options: OptionDraft[];
  onChange: (options: OptionDraft[]) => void;
  errorText?: string;
}

/**
 * Add/remove/edit/reorder option rows, with the correct-answer control
 * shaped per {@link QuestionType}: SINGLE_CHOICE/TRUE_FALSE use radios (at
 * most one correct), MULTIPLE_CHOICE uses checkboxes (any number correct).
 * SHORT_ANSWER renders nothing - it has no options.
 */
export function QuestionOptionEditor({ type, options, onChange, errorText }: QuestionOptionEditorProps) {
  const t = useTranslation();
  const groupName = useId();

  if (type === "SHORT_ANSWER") {
    return <p className={styles.note}>{t.question.options.shortAnswerNote}</p>;
  }

  const fixedCount = type === "TRUE_FALSE";

  function updateOption(key: string, patch: Partial<OptionDraft>) {
    onChange(options.map((option) => (option.key === key ? { ...option, ...patch } : option)));
  }

  function setCorrect(key: string) {
    if (type === "MULTIPLE_CHOICE") {
      updateOption(key, { isCorrect: !options.find((option) => option.key === key)?.isCorrect });
    } else {
      onChange(options.map((option) => ({ ...option, isCorrect: option.key === key })));
    }
  }

  function addOption() {
    onChange([...options, { key: makeKey(), optionText: "", isCorrect: false }]);
  }

  function removeOption(key: string) {
    onChange(options.filter((option) => option.key !== key));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= options.length) return;

const next = options.slice();

const source = next[index];
const destination = next[target];

if (!source || !destination) return;

next[index] = destination;
next[target] = source;

onChange(next);
  }

  return (
    <div className={styles.editor}>
      <span className={styles.label}>{t.question.options.label}</span>

      <div className={styles.list}>
        {options.map((option, index) => (
          <div key={option.key} className={styles.row}>
            {type === "MULTIPLE_CHOICE" ? (
              <Checkbox
                label={t.question.options.correct}
                checked={option.isCorrect}
                onChange={() => setCorrect(option.key)}
              />
            ) : (
              <Radio
                name={groupName}
                label={t.question.options.correct}
                checked={option.isCorrect}
                onChange={() => setCorrect(option.key)}
              />
            )}

            <div className={styles.textInputWrapper}>
              <Input
                aria-label={t.question.options.textLabel}
                value={option.optionText}
                onChange={(event) => updateOption(option.key, { optionText: event.target.value })}
                required
              />
            </div>

            {!fixedCount && (
              <div className={styles.rowActions}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={t.question.options.moveUp}
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => move(index, 1)}
                  disabled={index === options.length - 1}
                  aria-label={t.question.options.moveDown}
                >
                  ↓
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(option.key)}>
                  {t.question.options.remove}
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {errorText && (
        <span className={styles.errorText} role="alert">
          {errorText}
        </span>
      )}

      {!fixedCount && (
        <Button type="button" variant="secondary" size="sm" onClick={addOption}>
          {t.question.options.add}
        </Button>
      )}
    </div>
  );
}
