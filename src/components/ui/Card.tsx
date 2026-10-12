import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import styles from "./Card.module.css";

export type CardVariant = "default" | "bordered" | "elevated" | "interactive";

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  variant?: CardVariant;
}

export function Card({ title, variant = "default", className, children, ...rest }: CardProps) {
  return (
    <div className={cn(styles.card, variant !== "default" && styles[variant], className)} {...rest}>
      {title && (
        <div className={styles.header}>
          <div className={styles.title}>{title}</div>
        </div>
      )}
      {children}
    </div>
  );
}
