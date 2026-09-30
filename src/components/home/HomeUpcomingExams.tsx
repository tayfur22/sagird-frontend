"use client";

import { useCallback, useMemo } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExamTypeBadge } from "@/components/exam/ExamTypeBadge";
import { ListSkeleton, SectionError, StatisticsSection } from "@/components/statistics/StatisticsSection";
import { useStatisticsRequest } from "@/hooks/useStatisticsRequest";
import { publicExamApi } from "@/lib/exam/exam-api";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { ExamResponse } from "@/types/exam";
import styles from "./Home.module.css";

const FETCH_SIZE = 12;
const MAX_SHOWN = 6;

export function HomeUpcomingExams() {
  const t = useTranslation();
  const h = t.home.exams;

  return (
    <StatisticsSection id="home-exams" title={h.title} description={h.description}>
      <ExamCards />
    </StatisticsSection>
  );
}

/** Published exams only (enforced by the backend). Exams whose registration window already closed are left out. */
function ExamCards() {
  const t = useTranslation();
  const h = t.home.exams;
  const fetchExams = useCallback((signal: AbortSignal) => publicExamApi.getPublished(0, FETCH_SIZE, signal), []);
  const request = useStatisticsRequest(fetchExams);

  const exams = useMemo(() => {
    const now = Date.now();
    return (request.data?.content ?? [])
      .filter((exam) => !exam.registrationEndAt || new Date(exam.registrationEndAt).getTime() > now)
      .slice(0, MAX_SHOWN);
  }, [request.data]);

  if (request.error !== null) return <SectionError title={h.loadError} error={request.error} onRetry={request.retry} />;
  if (request.data === null) return <ListSkeleton rows={3} />;
  if (exams.length === 0) {
    return (
      <Card>
        <EmptyState title={h.empty.title} description={h.empty.description} />
      </Card>
    );
  }

  return (
    <>
      <ul className={styles.examGrid}>
        {exams.map((exam) => (
          <li key={exam.id} className={styles.examItem}>
            <ExamCard exam={exam} />
          </li>
        ))}
      </ul>
      <div>
        <ButtonLink href="/exams" variant="secondary">
          {h.viewAll}
        </ButtonLink>
      </div>
    </>
  );
}

function ExamCard({ exam }: { exam: ExamResponse }) {
  const t = useTranslation();
  const h = t.home.exams;
  const access = exam.subscriptionRequired ? h.included : exam.price > 0 ? `${exam.price} ${exam.currency}` : h.free;

  return (
    <article className={styles.examCard}>
      <ExamTypeBadge type={exam.type} />
      <h3 className={styles.examTitle}>{exam.title}</h3>
      <p className={styles.examMeta}>
        {h.duration.replace("{minutes}", String(exam.durationMinutes))} · {access}
      </p>
      <ButtonLink href={`/exams/${exam.id}`} variant="secondary" size="sm" className={styles.examAction}>
        {h.details}
      </ButtonLink>
    </article>
  );
}
