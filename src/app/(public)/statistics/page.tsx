import { StatisticsPage } from "@/components/statistics/StatisticsPage";
import styles from "./page.module.css";

/**
 * Phase 16B: enables the existing public "Statistika" header placeholder. The
 * backend statistics endpoints are public and aggregate-only, so no login is
 * required here.
 */
export default function PublicStatisticsPage() {
  return (
    <div className="container">
      <div className={styles.wrap}>
        <StatisticsPage />
      </div>
    </div>
  );
}
