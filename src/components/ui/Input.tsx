"use client";

import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import styles from "./FormField.module.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helpText?: string;
  errorText?: string;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helpText, errorText, required, id, className, ...rest }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const describedBy = errorText ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined;

    return (
      <div className={styles.field}>
        {label && (
          <label className={styles.label} htmlFor={inputId}>
            {label}
            {required && <span className={styles.required} aria-hidden="true">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(styles.control, errorText && styles.invalid, className)}
          aria-invalid={Boolean(errorText) || undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          {...rest}
        />
        {errorText ? (
          <span id={`${inputId}-error`} className={styles.errorText} role="alert">
            {errorText}
          </span>
        ) : helpText ? (
          <span id={`${inputId}-help`} className={styles.helpText}>
            {helpText}
          </span>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";
