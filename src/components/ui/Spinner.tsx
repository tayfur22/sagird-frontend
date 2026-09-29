"use client";

import { useTranslation } from "@/lib/i18n/LocaleProvider";
import styles from "./Spinner.module.css";

export interface SpinnerProps {
  size?: number;
  label?: string;
}

export function Spinner({ size = 24, label }: SpinnerProps) {
  const t = useTranslation();
  return (
    <div role="status" className={styles.wrapper}>
      <span
        className={styles.circle}
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
      <span className={styles.srOnly}>{label ?? t.common.loading}</span>
    </div>
  );
}
