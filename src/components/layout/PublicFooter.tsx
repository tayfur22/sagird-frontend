import styles from "./PublicFooter.module.css";

export function PublicFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <span>© {new Date().getFullYear()} Şagird.az</span>
      </div>
    </footer>
  );
}
