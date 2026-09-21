"use client";

import { forwardRef, useId, type InputHTMLAttributes } from "react";
import styles from "./Choice.module.css";

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, id, disabled, ...rest }, ref) => {
    const generatedId = useId();
    const checkboxId = id ?? generatedId;
    return (
      <label className={styles.wrapper} htmlFor={checkboxId} data-disabled={disabled || undefined}>
        <input ref={ref} id={checkboxId} type="checkbox" className={styles.input} disabled={disabled} {...rest} />
        {label}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";
