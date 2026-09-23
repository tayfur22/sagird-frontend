"use client";

import { Checkbox } from "@/components/ui/Checkbox";
import { Radio } from "@/components/ui/Radio";
import { Textarea } from "@/components/ui/Textarea";
import type { AnswerValue } from "@/hooks/useAnswerAutosave";
import type { StudentQuestionOption } from "@/types/attempt-question";
import type { QuestionType } from "@/types/question";
import styles from "./AnswerInput.module.css";

interface AnswerInputProps {
  questionId: string;
  type: QuestionType;
  options: StudentQuestionOption[];
  value: AnswerValue;
  disabled: boolean;
  onChange: (value: AnswerValue) => void;
}

/** Renders the right control for each of the four Phase 8A question types. Never shows correctness. */
export function AnswerInput({ questionId, type, options, value, disabled, onChange }: AnswerInputProps) {
  if (type === "SHORT_ANSWER") {
    return (
      <Textarea
        aria-label="answer"
        value={value.textAnswer ?? ""}
        disabled={disabled}
        maxLength={5000}
        onChange={(event) => onChange({ selectedOptionIds: [], textAnswer: event.target.value })}
      />
    );
  }

  if (type === "MULTIPLE_CHOICE") {
    return (
      <div className={styles.options}>
        {options.map((option) => {
          const checked = value.selectedOptionIds.includes(option.id);
          return (
            <Checkbox
              key={option.id}
              label={option.optionText}
              checked={checked}
              disabled={disabled}
              onChange={() => {
                const next = checked
                  ? value.selectedOptionIds.filter((id) => id !== option.id)
                  : [...value.selectedOptionIds, option.id];
                onChange({ selectedOptionIds: next, textAnswer: null });
              }}
            />
          );
        })}
      </div>
    );
  }

  // SINGLE_CHOICE and TRUE_FALSE both need exactly one selected value.
  return (
    <div className={type === "TRUE_FALSE" ? styles.optionsRow : styles.options}>
      {options.map((option) => (
        <Radio
          key={option.id}
          name={`question-${questionId}`}
          label={option.optionText}
          checked={value.selectedOptionIds[0] === option.id}
          disabled={disabled}
          onChange={() => onChange({ selectedOptionIds: [option.id], textAnswer: null })}
        />
      ))}
    </div>
  );
}
