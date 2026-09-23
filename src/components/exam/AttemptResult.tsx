import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
import type { ExamAttemptResponse } from "@/types/attempt";
import styles from "./AttemptResult.module.css";

type PassState = "passed" | "notPassed" | "pending";

const PASS_BADGE_VARIANT: Record<PassState, BadgeVariant> = {
  passed: "success",
  notPassed: "error",
  pending: "neutral",
};

function passState(passed: boolean | null): PassState {
  if (passed === true) return "passed";
  if (passed === false) return "notPassed";
  // Phase 10A gap: no pass/fail threshold defined yet for this exam - a
  // neutral "pending" state, never inferred from percentage (spec section 6).
  return "pending";
}

/**
 * Phase 10B: the official, backend-authoritative result for a SUBMITTED
 * attempt. Renders exactly what {@link ExamAttemptResponse} carries -
 * score/maxScore/percentage/passed are never computed on the client (see
 * ScoringService, Phase 10A). If the backend result data is ever missing
 * on a SUBMITTED attempt (should not normally happen - score/maxScore/
 * percentage are always populated together server-side), this falls back
 * to a plain "submitted" message rather than showing invented numbers.
 */
export function AttemptResult({ attempt }: { attempt: ExamAttemptResponse }) {
  const t = useTranslation();
  const r = t.attempt.result;

  const hasScore = attempt.score !== null && attempt.maxScore !== null && attempt.percentage !== null;

  if (!hasScore) {
    return (
      <Card>
        <div className={styles.pendingBlock}>
          <h2 className={styles.title}>{t.attempt.submitted.title}</h2>
          <p className={styles.description}>{t.attempt.submitted.description}</p>
          <ButtonLink href="/student/exams" variant="secondary" size="sm">
            {t.attempt.backToExams}
          </ButtonLink>
        </div>
      </Card>
    );
  }

  const state = passState(attempt.passed);

  return (
    <Card>
      <div className={styles.result}>
        <h2 className={styles.title}>{r.title}</h2>

        <div className={styles.scoreRow}>
          <span className={styles.score}>
            {attempt.score}
            <span className={styles.scoreDivider}>/</span>
            {attempt.maxScore}
          </span>
          <span className={styles.percentage}>{attempt.percentage}%</span>
        </div>

        <dl className={styles.details}>
          <div className={styles.detailRow}>
            <dt>{r.scoreLabel}</dt>
            <dd>{attempt.score}</dd>
          </div>
          <div className={styles.detailRow}>
            <dt>{r.maxScoreLabel}</dt>
            <dd>{attempt.maxScore}</dd>
          </div>
          <div className={styles.detailRow}>
            <dt>{r.percentageLabel}</dt>
            <dd>{attempt.percentage}%</dd>
          </div>
          <div className={styles.detailRow}>
            <dt>{r.statusLabel}</dt>
            <dd>
              <Badge variant={PASS_BADGE_VARIANT[state]}>{r[state]}</Badge>
            </dd>
          </div>
        </dl>

        <p className={styles.description}>{t.attempt.submitted.description}</p>

        <div className={styles.actions}>
          <ButtonLink href="/student/exams" variant="primary" size="sm">
            {t.attempt.backToExams}
          </ButtonLink>
        </div>
      </div>
    </Card>
  );
}
