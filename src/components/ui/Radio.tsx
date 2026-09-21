"use client";

import { forwardRef, useId, type InputHTMLAttributes } from "react";
import styles from "./Choice.module.css";

export interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, id, disabled, ...rest }, ref) => {
    const generatedId = useId();
    const radioId = id ?? generatedId;
    return (
      <label className={styles.wrapper} htmlFor={radioId} data-disabled={disabled || undefined}>
        <input ref={ref} id={radioId} type="radio" className={styles.input} disabled={disabled} {...rest} />
        {label}
      </label>
    );
  }
);
Radio.displayName = "Radio";
