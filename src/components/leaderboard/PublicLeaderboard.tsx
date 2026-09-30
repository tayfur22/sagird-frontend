"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { publicLeaderboardApi } from "@/lib/leaderboard/leaderboard-api";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { PageResponse } from "@/types/api";
import type { LeaderboardEntry } from "@/types/leaderboard";
import { LeaderboardList } from "./LeaderboardList";

const PAGE_SIZE = 20;

/**
 * Anonymous weekly leaderboard (GET /api/v1/public/leaderboard/weekly). Ranks,
 * ties and display names are exactly what the backend returns (privacy-safe
 * "First L." form, no ids/emails); nothing is computed here. The backend has
 * no weekly "my position" endpoint, so no personal row is shown.
 */
export function PublicLeaderboard() {
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

    publicLeaderboardApi
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
    <section aria-labelledby="public-leaderboard-title" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <h2 id="public-leaderboard-title" style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-bold)" }}>
        {l.weekly.title}
      </h2>

      {loading && !data && (
        <Card aria-busy="true">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} width="100%" height={20} />
            ))}
          </div>
        </Card>
      )}

      {error && (
        <Alert variant="error" title={t.common.error}>
          <p>{error}</p>
          <Button variant="secondary" size="sm" onClick={() => setRetryToken((v) => v + 1)} style={{ marginTop: "var(--space-3)" }}>
            {t.common.retry}
          </Button>
        </Alert>
      )}

      {!error && data && (
        <>
          <Card aria-busy={loading || undefined} style={loading ? { opacity: 0.6 } : undefined}>
            <LeaderboardList
              entries={data.content}
              emptyTitle={l.empty.title}
              nameLabel={l.columns.participant}
              scoreLabel={l.columns.result}
              emphasizeTop
            />
          </Card>

          {data.totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Pagination page={pageIndex + 1} totalPages={data.totalPages} onPageChange={(page) => setPageIndex(page - 1)} disabled={loading} />
            </div>
          )}
        </>
      )}
    </section>
  );
}
