"use client";

import { forwardRef, useId, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import styles from "./FormField.module.css";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helpText?: string;
  errorText?: string;
  required?: boolean;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, helpText, errorText, required, id, className, options, placeholder, ...rest }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const describedBy = errorText ? `${selectId}-error` : helpText ? `${selectId}-help` : undefined;

    return (
      <div className={styles.field}>
        {label && (
          <label className={styles.label} htmlFor={selectId}>
            {label}
            {required && <span className={styles.required} aria-hidden="true">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(styles.control, errorText && styles.invalid, className)}
          aria-invalid={Boolean(errorText) || undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          defaultValue={rest.defaultValue ?? (placeholder ? "" : undefined)}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errorText ? (
          <span id={`${selectId}-error`} className={styles.errorText} role="alert">
            {errorText}
          </span>
        ) : helpText ? (
          <span id={`${selectId}-help`} className={styles.helpText}>
            {helpText}
          </span>
        ) : null}
      </div>
    );
  }
);
Select.displayName = "Select";
