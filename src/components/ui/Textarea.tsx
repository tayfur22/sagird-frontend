"use client";

import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import styles from "./FormField.module.css";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helpText?: string;
  errorText?: string;
  required?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helpText, errorText, required, id, className, rows = 4, ...rest }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const describedBy = errorText ? `${textareaId}-error` : helpText ? `${textareaId}-help` : undefined;

    return (
      <div className={styles.field}>
        {label && (
          <label className={styles.label} htmlFor={textareaId}>
            {label}
            {required && <span className={styles.required} aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn(styles.control, errorText && styles.invalid, className)}
          aria-invalid={Boolean(errorText) || undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          {...rest}
        />
        {errorText ? (
          <span id={`${textareaId}-error`} className={styles.errorText} role="alert">
            {errorText}
          </span>
        ) : helpText ? (
          <span id={`${textareaId}-help`} className={styles.helpText}>
            {helpText}
          </span>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
