"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { LeaderboardList } from "@/components/leaderboard/LeaderboardList";
import { MyPositionCard } from "@/components/leaderboard/MyPositionCard";
import { examApi } from "@/lib/exam/exam-api";
import { leaderboardApi } from "@/lib/leaderboard/leaderboard-api";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { PageResponse } from "@/types/api";
import type { ExamResponse } from "@/types/exam";
import type { LeaderboardEntry } from "@/types/leaderboard";
import styles from "./page.module.css";

const PAGE_SIZE = 20;

/**
 * Phase 15B: student-facing leaderboard for one exam. Fetches the exam
 * itself (for its title/context, same as the exam detail page) alongside
 * page 0 of GET /exams/{examId}/leaderboard. Ranking, scoring and
 * pagination are entirely backend-authoritative - this page only renders
 * what it's given.
 */
export default function ExamLeaderboardPage() {
  return (
    <RequireAuth role="STUDENT">
      <ExamLeaderboardView />
    </RequireAuth>
  );
}

function ExamLeaderboardView() {
  const t = useTranslation();
  const l = t.leaderboard;
  const params = useParams<{ id: string }>();
  const examId = params.id;

  const [exam, setExam] = useState<ExamResponse | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [data, setData] = useState<PageResponse<LeaderboardEntry> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const [myRank, setMyRank] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([examApi.getById(examId), leaderboardApi.getExamLeaderboard(examId, pageIndex, PAGE_SIZE)])
      .then(([examResponse, page]) => {
        if (cancelled) return;
        setExam(examResponse);
        setData(page);
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
  }, [examId, pageIndex, retryToken]);

  return (
    <div className={styles.page}>
      <Link href={`/student/exams/${examId}`} className={styles.backLink}>
        {l.exam.back}
      </Link>

      {loading && (
        <Card>
          <div className={styles.skeleton}>
            <Skeleton width="50%" height={24} />
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

      {!loading && !error && exam && data && (
        <>
          <div className={styles.header}>
            <h1 className={styles.heading}>{exam.title}</h1>
            <p className={styles.subheading}>{l.exam.title}</p>
          </div>

          <MyPositionCard examId={examId} onLoaded={(entry) => setMyRank(entry ? entry.rank : null)} />

          <Card>
            <LeaderboardList entries={data.content} highlightRank={myRank} emptyTitle={l.empty.title} />
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
