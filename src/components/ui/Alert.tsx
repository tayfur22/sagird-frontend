import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import styles from "./Alert.module.css";

export type AlertVariant = "success" | "warning" | "error" | "info";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
}

const ICONS: Record<AlertVariant, string> = {
  success: "✓",
  warning: "!",
  error: "✕",
  info: "i",
};

export function Alert({ variant = "info", title, className, children, ...rest }: AlertProps) {
  return (
    <div className={cn(styles.alert, styles[variant], className)} role="alert" {...rest}>
      <span className={styles.icon} aria-hidden="true">{ICONS[variant]}</span>
      <div>
        {title && <div style={{ fontWeight: 600, marginBottom: 4 }}>{title}</div>}
        <div>{children}</div>
      </div>
    </div>
  );
}
