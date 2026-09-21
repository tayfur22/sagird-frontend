import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import styles from "./Card.module.css";

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
}

export function Card({ title, className, children, ...rest }: CardProps) {
  return (
    <div className={cn(styles.card, className)} {...rest}>
      {title && (
        <div className={styles.header}>
          <div className={styles.title}>{title}</div>
        </div>
      )}
      {children}
    </div>
  );
}
