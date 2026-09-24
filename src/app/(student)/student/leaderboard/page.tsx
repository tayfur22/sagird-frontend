"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { LeaderboardList } from "@/components/leaderboard/LeaderboardList";
import { leaderboardApi } from "@/lib/leaderboard/leaderboard-api";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { PageResponse } from "@/types/api";
import type { LeaderboardEntry } from "@/types/leaderboard";
import styles from "./page.module.css";

const PAGE_SIZE = 20;

/**
 * Phase 15B: GET /leaderboard/weekly - the "Liderlər" nav destination.
 * Not exam-scoped, so it has no /me position (see leaderboard-api.ts) and
 * no personal-row highlight; the backend alone defines what "weekly"
 * currently means (see LeaderboardService), never recomputed here.
 */
export default function WeeklyLeaderboardPage() {
  return (
    <RequireAuth role="STUDENT">
      <WeeklyLeaderboardView />
    </RequireAuth>
  );
}

function WeeklyLeaderboardView() {
  const t = useTranslation();
  const l = t.leaderboard;

  const [pageIndex, setPageIndex] = useState(0);
  const [data, setData] = useState<PageResponse<LeaderboardEntry> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    leaderboardApi
      .getWeekly(pageIndex, PAGE_SIZE)
      .then((response) => {
        if (!cancelled) setData(response);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(apiErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pageIndex, retryToken]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>{l.weekly.title}</h1>
        <p className={styles.subheading}>{l.weekly.description}</p>
      </div>

      {loading && (
        <Card>
          <div className={styles.skeleton}>
            <Skeleton width="100%" height={16} />
            <Skeleton width="100%" height={16} />
            <Skeleton width="100%" height={16} />
          </div>
        </Card>
      )}

      {!loading && error && (
        <Alert variant="error" title={t.common.error}>
          <p>{error}</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setRetryToken((v) => v + 1)}
            style={{ marginTop: "var(--space-3)" }}
          >
            {t.common.retry}
          </Button>
        </Alert>
      )}

      {!loading && !error && data && (
        <>
          <Card>
            <LeaderboardList entries={data.content} emptyTitle={l.empty.title} />
          </Card>

          {data.totalPages > 1 && (
            <div className={styles.footer}>
              <Pagination page={pageIndex + 1} totalPages={data.totalPages} onPageChange={(page) => setPageIndex(page - 1)} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
