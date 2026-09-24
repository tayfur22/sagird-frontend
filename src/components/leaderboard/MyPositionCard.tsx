"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ApiError } from "@/lib/api/errors";
import { leaderboardApi } from "@/lib/leaderboard/leaderboard-api";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { LeaderboardEntry } from "@/types/leaderboard";
import styles from "./MyPositionCard.module.css";

type Status = "loading" | "ranked" | "notRanked" | "error";

export interface MyPositionCardProps {
  examId: string;
  /** Reports the loaded entry (or null when not ranked) up to the parent, so it can highlight the matching row. */
  onLoaded?: (entry: LeaderboardEntry | null) => void;
}

/**
 * Phase 15B: GET /exams/{examId}/leaderboard/me. A 404 with
 * LEADERBOARD_POSITION_NOT_AVAILABLE is the expected "not ranked yet"
 * case (spec section 10) - rendered as its own calm state, never as a
 * generic error with a Retry button. Rank/score/percentage are rendered
 * exactly as returned; nothing is computed here.
 */
export function MyPositionCard({ examId, onLoaded }: MyPositionCardProps) {
  const t = useTranslation();
  const l = t.leaderboard;

  const [status, setStatus] = useState<Status>("loading");
  const [entry, setEntry] = useState<LeaderboardEntry | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setErrorMessage(null);

    leaderboardApi
      .getMyExamPosition(examId)
      .then((response) => {
        if (cancelled) return;
        setEntry(response);
        setStatus("ranked");
        onLoaded?.(response);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (ApiError.isApiError(err) && err.code === "LEADERBOARD_POSITION_NOT_AVAILABLE") {
          setEntry(null);
          setStatus("notRanked");
          onLoaded?.(null);
          return;
        }
        setErrorMessage(apiErrorMessage(err));
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
    // onLoaded is a fresh closure each render by design; only examId/retryToken should re-trigger the fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, retryToken]);

  if (status === "loading") {
    return (
      <Card title={l.myPosition.title}>
        <div className={styles.skeleton}>
          <Skeleton width="35%" height={28} />
          <Skeleton width="55%" height={16} />
        </div>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card title={l.myPosition.title}>
        <Alert variant="error">
          <p>{errorMessage}</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setRetryToken((v) => v + 1)}
            style={{ marginTop: "var(--space-3)" }}
          >
            {t.common.retry}
          </Button>
        </Alert>
      </Card>
    );
  }

  if (status === "notRanked" || !entry) {
    return (
      <Card title={l.myPosition.title}>
        <p className={styles.notRankedTitle}>{l.myPosition.notRanked.title}</p>
        <p className={styles.notRankedDescription}>{l.myPosition.notRanked.description}</p>
      </Card>
    );
  }

  const hasScore = entry.score !== null && entry.maxScore !== null;

  return (
    <Card title={l.myPosition.title}>
      <div className={styles.summary}>
        <span className={styles.rank}>#{entry.rank}</span>
        <div className={styles.stats}>
          {hasScore && (
            <span className={styles.score}>
              {entry.score} / {entry.maxScore}
            </span>
          )}
          {entry.percentage !== null && <span className={styles.percentage}>{entry.percentage}%</span>}
        </div>
      </div>
    </Card>
  );
}
