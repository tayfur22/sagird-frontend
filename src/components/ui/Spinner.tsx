import styles from "./Spinner.module.css";

export interface SpinnerProps {
  size?: number;
  label?: string;
}

export function Spinner({ size = 24, label = "Yüklənir..." }: SpinnerProps) {
  return (
    <div role="status" className={styles.wrapper}>
      <span
        className={styles.circle}
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
      <span className={styles.srOnly}>{label}</span>
    </div>
  );
}
