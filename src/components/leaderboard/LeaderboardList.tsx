import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils/cn";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { LeaderboardEntry } from "@/types/leaderboard";
import styles from "./LeaderboardList.module.css";

export interface LeaderboardListProps {
  entries: LeaderboardEntry[];
  emptyTitle: string;
  /**
   * The current student's rank (from the /me endpoint), used to highlight
   * their row without exposing any identity beyond what's already public
   * on the row itself. Omit for lists with no personal-position endpoint
   * (the weekly leaderboard).
   */
  highlightRank?: number | null;
}

/**
 * Phase 15B: one page of ranked entries. A ranked list, not a dense table -
 * this reflows naturally at 320px instead of needing a horizontal-scroll
 * table (spec sections 18/19). Rank is rendered exactly as the backend
 * returns it (competition ranking, ties share a rank) - never recomputed.
 */
export function LeaderboardList({ entries, emptyTitle, highlightRank }: LeaderboardListProps) {
  const t = useTranslation();
  const l = t.leaderboard;

  if (entries.length === 0) {
    return <EmptyState title={emptyTitle} />;
  }

  return (
    <ol className={styles.list}>
      <li className={styles.headerRow} aria-hidden="true">
        <span className={styles.colRank}>{l.columns.rank}</span>
        <span className={styles.colName}>{l.columns.student}</span>
        <span className={styles.colScore}>{l.columns.score}</span>
        <span className={styles.colPercentage}>{l.columns.percentage}</span>
      </li>

      {entries.map((entry, index) => {
        const isYou = highlightRank != null && entry.rank === highlightRank;
        const hasScore = entry.score !== null && entry.maxScore !== null;

        return (
          <li
            key={`${entry.rank}-${index}`}
            className={cn(styles.row, isYou && styles.rowHighlight)}
            aria-current={isYou ? "true" : undefined}
          >
            <span className={styles.colRank}>
              {entry.rank <= 3 ? (
                <Badge variant="info" className={styles.rankBadge}>
                  {entry.rank}
                </Badge>
              ) : (
                <span className={styles.rankNumber}>{entry.rank}</span>
              )}
            </span>
            <span className={styles.colName}>
              <span className={styles.name}>{entry.displayName}</span>
              {isYou && <span className={styles.youBadge}>{l.you}</span>}
            </span>
            <span className={styles.colScore}>{hasScore ? `${entry.score} / ${entry.maxScore}` : "—"}</span>
            <span className={styles.colPercentage}>
              {entry.percentage !== null ? `${entry.percentage}%` : "—"}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
