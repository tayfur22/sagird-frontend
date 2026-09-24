import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { useTranslation } from "@/lib/i18n/LocaleProvider";
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

export interface AttemptResultProps {
  score: number | null;
  maxScore: number | null;
  percentage: number | null;
  passed: boolean | null;
  /**
   * Phase 13B: when provided, renders a "Review answers" action pointing at
   * the detailed per-question result page. Omitted on the detail page
   * itself (see app/exam/[attemptId]/result/page.tsx), which reuses this
   * same summary without it.
   */
  reviewHref?: string;
}

/**
 * Phase 10B: the official, backend-authoritative summary for a SUBMITTED
 * attempt. Renders exactly the four score fields it's given - never
 * computed on the client (see ScoringService, Phase 10A). Takes just those
 * fields (not the full ExamAttemptResponse) so Phase 13B's detail page can
 * reuse it with DetailedAttemptResult's shape too. If the score is ever
 * missing on a SUBMITTED attempt (should not normally happen - score/
 * maxScore/percentage are always populated together server-side), this
 * falls back to a plain "submitted" message rather than showing invented
 * numbers.
 */
export function AttemptResult({ score, maxScore, percentage, passed, reviewHref }: AttemptResultProps) {
  const t = useTranslation();
  const r = t.attempt.result;

  const hasScore = score !== null && maxScore !== null && percentage !== null;

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

  const state = passState(passed);

  return (
    <Card>
      <div className={styles.result}>
        <h2 className={styles.title}>{r.title}</h2>

        <div className={styles.scoreRow}>
          <span className={styles.score}>
            {score}
            <span className={styles.scoreDivider}>/</span>
            {maxScore}
          </span>
          <span className={styles.percentage}>{percentage}%</span>
        </div>

        <dl className={styles.details}>
          <div className={styles.detailRow}>
            <dt>{r.scoreLabel}</dt>
            <dd>{score}</dd>
          </div>
          <div className={styles.detailRow}>
            <dt>{r.maxScoreLabel}</dt>
            <dd>{maxScore}</dd>
          </div>
          <div className={styles.detailRow}>
            <dt>{r.percentageLabel}</dt>
            <dd>{percentage}%</dd>
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
          {reviewHref && (
            <ButtonLink href={reviewHref} variant="primary" size="sm">
              {r.reviewAction}
            </ButtonLink>
          )}
          <ButtonLink href="/student/exams" variant={reviewHref ? "secondary" : "primary"} size="sm">
            {t.attempt.backToExams}
          </ButtonLink>
        </div>
      </div>
    </Card>
  );
}
