"use client";

import { PublicLeaderboard } from "@/components/leaderboard/PublicLeaderboard";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import styles from "../exams/page.module.css";

/** Public /leaderboard: weekly ranking, works without login. */
export default function PublicLeaderboardPage() {
  const t = useTranslation();

  return (
    <div className="container">
      <div className={styles.wrap}>
        <div>
          <h1 className={styles.heading}>{t.leaderboard.public.title}</h1>
          <p className={styles.subtitle}>{t.leaderboard.public.subtitle}</p>
        </div>

        <PublicLeaderboard />
      </div>
    </div>
  );
}
