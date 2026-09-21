import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import styles from "./Badge.module.css";

export type BadgeVariant = "neutral" | "success" | "warning" | "error" | "info";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "neutral", className, ...rest }: BadgeProps) {
  return <span className={cn(styles.badge, styles[variant], className)} {...rest} />;
}
