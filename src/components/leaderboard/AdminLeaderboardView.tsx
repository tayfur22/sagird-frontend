"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { LeaderboardList } from "@/components/leaderboard/LeaderboardList";
import { adminLeaderboardApi, adminMonitoringApi } from "@/lib/admin/admin-api";
import { apiErrorMessage } from "@/lib/i18n/translate-error";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { PageResponse } from "@/types/api";
import type { AdminExamSummaryResponse } from "@/types/admin";
import type { LeaderboardEntry } from "@/types/leaderboard";
import styles from "./AdminLeaderboardView.module.css";

const PAGE_SIZE = 20;
const EXAM_LIST_SIZE = 100;
const WEEKLY = "";

/**
 * Admin leaderboard: the weekly ranking by default, or the ranking of one
 * published exam chosen from a select. Only PUBLISHED exams are offered
 * (the backend answers "not found" for any other exam's leaderboard).
 * Nothing is ranked or sorted here.
 */
export function AdminLeaderboardView() {
  const t = useTranslation();
  const l = t.leaderboard;

  const [exams, setExams] = useState<AdminExamSummaryResponse[]>([]);
  const [selected, setSelected] = useState<string>(WEEKLY);
  const [pageIndex, setPageIndex] = useState(0);
  const [data, setData] = useState<PageResponse<LeaderboardEntry> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  // The exam list is only a convenience for the select; a failure just leaves the weekly view.
  useEffect(() => {
    const controller = new AbortController();
    adminMonitoringApi
      .getExams(0, EXAM_LIST_SIZE, { status: "PUBLISHED" }, controller.signal)
      .then((response) => setExams(response.content))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const request =
      selected === WEEKLY
        ? adminLeaderboardApi.getWeekly(pageIndex, PAGE_SIZE)
        : adminLeaderboardApi.getExam(selected, pageIndex, PAGE_SIZE);

    request
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
  }, [selected, pageIndex, retryToken]);

  const options = [
    { value: WEEKLY, label: l.weekly.title },
    ...exams.map((exam) => ({ value: exam.id, label: exam.title })),
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>{l.admin.title}</h1>
        <p className={styles.subheading}>{l.admin.description}</p>
      </div>

      <div className={styles.filters}>
        <Select
          label={l.admin.scopeLabel}
          options={options}
          value={selected}
          onChange={(event) => {
            setSelected(event.target.value);
            setPageIndex(0);
          }}
        />
      </div>

      {loading && (
        <Card>
          <div className={styles.skeleton}>
            <Skeleton height={16} />
            <Skeleton height={16} />
            <Skeleton height={16} />
          </div>
        </Card>
      )}

      {!loading && error && (
        <Alert variant="error" title={t.common.error}>
          <p>{error}</p>
          <Button variant="secondary" size="sm" onClick={() => setRetryToken((v) => v + 1)} style={{ marginTop: "var(--space-3)" }}>
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
