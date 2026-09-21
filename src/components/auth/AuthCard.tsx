import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import styles from "./AuthForms.module.css";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Centered card shell shared by the login and register pages. */
export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <h1 className={styles.heading}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
        {children}
        {footer && <p className={styles.footer}>{footer}</p>}
      </Card>
    </div>
  );
}
