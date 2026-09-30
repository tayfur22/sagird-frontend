"use client";

import { useCallback } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LeaderboardList } from "@/components/leaderboard/LeaderboardList";
import { ListSkeleton, SectionError, StatisticsSection } from "@/components/statistics/StatisticsSection";
import { useStatisticsRequest } from "@/hooks/useStatisticsRequest";
import { publicLeaderboardApi } from "@/lib/leaderboard/leaderboard-api";
import { useTranslation } from "@/lib/i18n/LocaleProvider";

const PREVIEW_SIZE = 5;

export function HomeLeaderboardPreview() {
  const t = useTranslation();
  const h = t.home.leaderboard;

  return (
    <StatisticsSection id="home-leaderboard" title={h.title} description={h.description}>
      <TopResults />
    </StatisticsSection>
  );
}

/** Top weekly results exactly as the backend ranks them (displayName is already the safe short form). */
function TopResults() {
  const t = useTranslation();
  const fetchTop = useCallback((signal: AbortSignal) => publicLeaderboardApi.getWeekly(0, PREVIEW_SIZE, signal), []);
  const request = useStatisticsRequest(fetchTop);

  if (request.error !== null) {
    return <SectionError title={t.leaderboard.loadError} error={request.error} onRetry={request.retry} />;
  }
  if (request.data === null) return <ListSkeleton rows={3} />;

  return (
    <>
      <Card>
        <LeaderboardList entries={request.data.content} emptyTitle={t.leaderboard.empty.title} />
      </Card>
      <div>
        <ButtonLink href="/leaderboard" variant="secondary">
          {t.home.leaderboard.viewAll}
        </ButtonLink>
      </div>
    </>
  );
}
